import {
  collection,
  doc,
  addDoc,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { getFirestoreDb } from "@/lib/firebase";
import type { CartItem } from "@/contexts/CartContext";
import type { CheckoutFormData, DeliveryMethod, PaymentMethod } from "@/contexts/CheckoutContext";

export interface BranchData {
  id: string;
  name: string;
  address: string;
}

export interface OrderData {
  orderId: string;
  cartItems: CartItem[];
  deliveryMethod: DeliveryMethod;
  branch: BranchData | null;
  paymentMethod: PaymentMethod;
  formData: CheckoutFormData;
  total: number;
  timestamp: ReturnType<typeof serverTimestamp>;
}

const ORDERS_COLLECTION = "orders";

/**
 * Creates an order in Firebase Firestore and returns the generated order ID.
 */
export async function createOrder(params: {
  cartItems: CartItem[];
  deliveryMethod: DeliveryMethod;
  branch: BranchData | null;
  paymentMethod: PaymentMethod;
  formData: CheckoutFormData;
  total: number;
}): Promise<string> {
  const db = getFirestoreDb();
  const ordersRef = collection(db, ORDERS_COLLECTION);

  const orderDoc = {
    cartItems: params.cartItems,
    deliveryMethod: params.deliveryMethod,
    branch: params.branch,
    paymentMethod: params.paymentMethod,
    formData: params.formData,
    total: params.total,
    timestamp: serverTimestamp(),
  };

  const docRef = await addDoc(ordersRef, orderDoc);

  // Generate a user-friendly order ID (e.g., UKG-ABC123XY)
  const shortId = docRef.id.slice(0, 8).toUpperCase();
  const orderId = `UKG-${shortId}`;

  // Update the document with the orderId for easy lookup
  await updateDoc(doc(db, ORDERS_COLLECTION, docRef.id), { orderId });

  return orderId;
}
