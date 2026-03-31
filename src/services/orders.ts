import type { CartItem } from "@/contexts/CartContext";
import type { CheckoutFormData, DeliveryMethod, PaymentMethod } from "@/contexts/CheckoutContext";
import { supabase } from "@/lib/supabase";
import { recordCouponUsage } from "@/services/api";

export interface BranchData {
  id: string;
  name: string;
  address: string;
}

export interface TrackedOrderItem {
  title: string;
  quantity: number;
  price_at_time: number;
}

export interface TrackedOrder {
  id: string;
  order_code: string;
  customer_name: string;
  phone: string;
  status: string;
  delivery_method: DeliveryMethod;
  payment_method: PaymentMethod;
  address: string | null;
  google_maps_url: string | null;
  total_amount: number;
  created_at: string;
  items: TrackedOrderItem[];
}

export async function createOrder(params: {
  cartItems: CartItem[];
  deliveryMethod: DeliveryMethod;
  branch: BranchData | null;
  paymentMethod: PaymentMethod;
  formData: CheckoutFormData;
  total: number;
  couponId?: string | null;
}): Promise<string> {
  // ===== STOCK VALIDATION BEFORE ORDER =====
  if (!params.cartItems.length) {
    throw new Error("Cart is empty");
  }

  if (!params.formData.name?.trim() || !params.formData.primaryPhone?.trim()) {
    console.error("Missing required customer info for order:", {
      name: params.formData.name,
      primaryPhone: params.formData.primaryPhone,
    });
    throw new Error("Please provide your name and phone number");
  }

  if (params.deliveryMethod === "delivery" && !params.formData.address?.trim()) {
    console.error("Missing address for delivery order:", {
      address: params.formData.address,
    });
    throw new Error("Please provide a delivery address");
  }

  const orderCode = "UKG-" + Math.random().toString(36).substring(2, 10).toUpperCase();

  const bookIds = params.cartItems.map((item) => item.id);

  const { data: stockRows, error: stockError } = await supabase
    .from("books")
    .select("id, stock, is_active")
    .in("id", bookIds);

  if (stockError) {
    console.error("Stock validation error:", stockError);
    throw new Error("Failed to validate stock");
  }

  const hasInsufficientStockOrInactive = params.cartItems.some((item) => {
    const row = stockRows?.find((r) => r.id === item.id) as
      | { id: string; stock: number | null; is_active: boolean | null }
      | undefined;
    const isActive = row?.is_active ?? false;
    const currentStock = row?.stock ?? 0;
    return !isActive || currentStock < item.quantity;
  });

  if (hasInsufficientStockOrInactive) {
    throw new Error("One or more items are unavailable or out of stock");
  }

  const googleMapsUrl =
    params.formData.latitude && params.formData.longitude
      ? `https://www.google.com/maps?q=${params.formData.latitude},${params.formData.longitude}`
      : null;

  const orderPayload = {
    order_code: orderCode,
    customer_name: params.formData.name,
    phone: params.formData.primaryPhone,
    delivery_method: params.deliveryMethod,
    payment_method: params.paymentMethod,
    branch:
      params.deliveryMethod === "pickup"
        ? params.branch?.name || null
        : null,
    address: params.formData.address || null,
    latitude:
      params.deliveryMethod === "delivery"
        ? params.formData.latitude || null
        : null,
    longitude:
      params.deliveryMethod === "delivery"
        ? params.formData.longitude || null
        : null,
    google_maps_url:
      params.deliveryMethod === "delivery"
        ? googleMapsUrl
        : null,
    total_amount: params.total,
    status: "pending",
    coupon_id: params.couponId || null,
  };

  console.log("[createOrder] Inserting order with payload:", orderPayload);

  const { data: orderData, error: orderError } = await supabase
    .from("orders")
    .insert([orderPayload])
    .select()
    .single();

  if (orderError) {
    console.error("Order insert error:", orderError);
    throw new Error(orderError.message || "Failed to create order");
  }

  const orderId = orderData.id;

  console.log("[createOrder] Created order with ID:", orderId);

  // ✅ INSERT ORDER ITEMS
  const orderItemsPayload = params.cartItems.map((item) => ({
    order_id: orderId,
    book_id: item.id, // must be UUID
    quantity: item.quantity,
    price_at_time: item.price,
  }));

  console.log("[createOrder] Inserting order items:", orderItemsPayload);

  const { error: itemsError } = await supabase
    .from("order_items")
    .insert(orderItemsPayload);

  if (itemsError) {
    console.error("Order items insert error:", itemsError);
    throw new Error(itemsError.message || "Failed to insert order items");
  }

  // ===== RECORD COUPON USAGE =====
  if (params.couponId) {
    const usageRes = await recordCouponUsage(params.couponId, orderId);
    if (!usageRes.success) {
      console.error("Failed to record coupon usage:", usageRes.message);
    }
  }

  // ===== REDUCE STOCK AFTER SUCCESSFUL ORDER =====
  const { data: latestStockRows, error: latestStockError } = await supabase
    .from("books")
    .select("id, stock")
    .in("id", bookIds);

  if (latestStockError) {
    console.error("Stock reduction fetch error:", latestStockError);
  } else if (latestStockRows) {
    await Promise.all(
      params.cartItems.map(async (item) => {
        const row = latestStockRows.find((r) => r.id === item.id) as { id: string; stock: number | null } | undefined;
        const currentStock = row?.stock ?? 0;
        let newStock = currentStock - item.quantity;

        if (newStock < 0) {
          console.error("Computed negative stock for book", item.id, {
            currentStock,
            orderedQuantity: item.quantity,
          });
          newStock = 0;
        }

        const { error: updateError } = await supabase
          .from("books")
          .update({
            stock: newStock,
            updated_at: new Date().toISOString(),
          })
          .eq("id", item.id);

        if (updateError) {
          console.error("Failed to update stock for book", item.id, updateError);
        }
      })
    );
  }

  return orderCode;
}

/**
 * Find an order by formatted Order ID (e.g. UKG-ABCD1234).
 * Matches orders where the underlying UUID starts with the short code (case-insensitive).
 */
export async function getOrderByFormattedId(formattedId: string): Promise<TrackedOrder | null> {
  const code = formattedId.trim().toUpperCase();
  if (!code) return null;

  const { data: orderRow, error } = await supabase
    .from("orders")
    .select(
      `
      id,
      order_code,
      customer_name,
      phone,
      status,
      delivery_method,
      payment_method,
      address,
      google_maps_url,
      total_amount,
      created_at
    `
    )
    .eq("order_code", code)
    .single();

  if (error) {
    // "No rows found" for `.single()` should be treated as "not found"
    if ((error as { code?: string } | null)?.code === "PGRST116") {
      return null;
    }
    console.error("Error fetching order by formatted ID:", error);
    throw new Error("Failed to fetch order");
  }

  if (!orderRow) return null;

  // Fetch order items separately and join books for titles
  const { data: itemsData, error: itemsError } = await supabase
    .from("order_items")
    .select(
      `
      quantity,
      price_at_time,
      books (
        title
      )
    `
    )
    .eq("order_id", orderRow.id);

  if (itemsError) {
    console.error("Error fetching order items by order ID:", itemsError);
    throw new Error("Failed to fetch order items");
  }

  type OrderItemRow = {
    quantity: number | null;
    price_at_time: number | null;
    books: { title: string | null } | null;
  };

  const items: TrackedOrderItem[] = (itemsData ?? []).map((row) => {
    const r = row as OrderItemRow;
    return {
      title: r.books?.title ?? "Product",
      quantity: r.quantity ?? 0,
      price_at_time: r.price_at_time ?? 0,
    };
  });

  type OrderRow = {
    id: string;
    order_code: string | null;
    customer_name: string | null;
    phone: string | null;
    status: string | null;
    delivery_method: DeliveryMethod | null;
    payment_method: PaymentMethod | null;
    address: string | null;
    google_maps_url: string | null;
    total_amount: number | null;
    created_at: string;
  };

  const r = orderRow as OrderRow;

  const order: TrackedOrder = {
    id: r.id,
    order_code: r.order_code ?? "",
    customer_name: r.customer_name ?? "",
    phone: r.phone ?? "",
    status: r.status ?? "",
    delivery_method: r.delivery_method ?? "delivery",
    payment_method: r.payment_method ?? "cod",
    address: r.address ?? null,
    google_maps_url: r.google_maps_url ?? null,
    total_amount: r.total_amount ?? 0,
    created_at: r.created_at,
    items,
  };

  return order;
}

/** Order list item for customer account page */
export interface CustomerOrderListItem {
  id: string;
  order_code: string;
  total_amount: number;
  status: string;
  created_at: string;
}

/**
 * Fetch orders for a customer by phone number.
 * Orders are linked to customers via the phone used during checkout.
 */
export async function getOrdersByCustomerPhone(
  phone: string
): Promise<CustomerOrderListItem[]> {
  const trimmed = phone.trim();
  if (!trimmed) return [];

  const { data, error } = await supabase
    .from("orders")
    .select("id, order_code, total_amount, status, created_at")
    .eq("phone", trimmed)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching orders by phone:", error);
    throw new Error("Failed to fetch orders");
  }

  type Row = {
    id: string;
    order_code: string | null;
    total_amount: number | null;
    status: string | null;
    created_at: string;
  };

  return (data ?? []).map((r) => {
    const row = r as Row;
    return {
      id: row.id,
      order_code: row.order_code ?? "",
      total_amount: row.total_amount ?? 0,
      status: row.status ?? "",
      created_at: row.created_at,
    };
  });
}