import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCart } from "@/contexts/CartContext";
import { ArrowLeft, ShoppingCart } from "lucide-react";

const CheckoutPage = () => {
  const { items, getTotal, clearCart } = useCart();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
  });

  const total = getTotal();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (items.length === 0) {
      return;
    }

    const orderData = {
      items,
      total,
      customer: formData,
      timestamp: new Date().toISOString(),
    };

    // Log order data (no backend integration)
    console.log("Order submitted:", orderData);

    // Clear cart after order
    clearCart();

    // In a real app, you would redirect to a success page
    // For now, just navigate back to home
    navigate("/");
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  if (items.length === 0) {
    return (
      <div className="py-8 md:py-12">
        <div className="container max-w-2xl">
          <Card>
            <CardContent className="p-8 text-center">
              <ShoppingCart className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
              <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
              <p className="text-muted-foreground mb-6">
                Add some items to your cart before checking out.
              </p>
              <Button asChild>
                <Link to="/buy-book">Continue Shopping</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8 md:py-12">
      <div className="container max-w-4xl">
        <Button asChild variant="ghost" className="mb-6">
          <Link to="/buy-book">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Shopping
          </Link>
        </Button>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Customer Information Form */}
          <div className="md:col-span-2">
            <Card>
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold mb-6">Customer Information</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                      placeholder="03XX-XXXXXXX"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">Delivery Address *</Label>
                    <textarea
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      required
                      rows={4}
                      className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      placeholder="Enter your complete delivery address"
                    />
                  </div>

                  <Button type="submit" className="w-full" size="lg">
                    Place Order
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="md:col-span-1">
            <Card variant="elevated" className="sticky top-24">
              <CardContent className="p-6 space-y-4">
                <h3 className="text-lg font-semibold">Order Summary</h3>

                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {items.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <div className="flex-1">
                        <div className="font-medium">{item.name}</div>
                        <div className="text-muted-foreground">
                          Rs. {item.price} × {item.quantity}
                        </div>
                      </div>
                      <div className="font-semibold">
                        Rs. {item.price * item.quantity}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total</span>
                    <span>Rs. {total}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
