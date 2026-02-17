import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useCart } from "@/contexts/CartContext";
import { useCheckout, Branch } from "@/contexts/CheckoutContext";
import { ArrowLeft, MapPin, CheckCircle2 } from "lucide-react";
import { ROUTES } from "@/lib/constants";
import { Link } from "react-router-dom";

const BRANCHES: Branch[] = [
  {
    id: "landhi",
    name: "Landhi Branch",
    address: "Street 12, Landhi Karachi",
  },
  {
    id: "korangi",
    name: "Korangi Branch",
    address: "Sector 5, Korangi Karachi",
  },
  {
    id: "malir",
    name: "Malir Branch",
    address: "Main Road, Malir Karachi",
  },
];

const BranchSelectionPage = () => {
  const { items, getTotal } = useCart();
  const { checkoutState, setSelectedBranch } = useCheckout();
  const navigate = useNavigate();
  const total = getTotal();

  const handleContinue = () => {
    if (!checkoutState.selectedBranch) {
      return;
    }
    navigate(ROUTES.PAYMENT);
  };

  if (items.length === 0) {
    return (
      <div className="py-8 md:py-12">
        <div className="container max-w-2xl">
          <Card>
            <CardContent className="p-8 text-center">
              <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
              <p className="text-muted-foreground mb-6">
                Add some items to your cart before checking out.
              </p>
              <Button asChild>
                <Link to={ROUTES.BUY_BOOK}>Continue Shopping</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (checkoutState.deliveryMethod !== "pickup") {
    return (
      <div className="py-8 md:py-12">
        <div className="container max-w-2xl">
          <Card>
            <CardContent className="p-8 text-center">
              <h2 className="text-2xl font-bold mb-2">Invalid Route</h2>
              <p className="text-muted-foreground mb-6">
                Please select pickup method first.
              </p>
              <Button asChild>
                <Link to={ROUTES.DELIVERY_METHOD}>Go to Delivery Method</Link>
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
          <Link to={ROUTES.DELIVERY_METHOD}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Delivery Method
          </Link>
        </Button>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <Card>
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold mb-6">Select Branch</h2>
                <p className="text-muted-foreground mb-6">
                  Choose a branch where you would like to pick up your order.
                </p>
                <RadioGroup
                  value={checkoutState.selectedBranch?.id || undefined}
                  onValueChange={(value) => {
                    const branch = BRANCHES.find((b) => b.id === value);
                    if (branch) {
                      setSelectedBranch(branch);
                    }
                  }}
                  className="space-y-4"
                >
                  {BRANCHES.map((branch) => (
                    <div
                      key={branch.id}
                      className={`flex items-start space-x-3 p-4 border rounded-lg transition-all ${
                        checkoutState.selectedBranch?.id === branch.id
                          ? "border-primary bg-primary/5"
                          : "hover:bg-accent/50"
                      }`}
                    >
                      <RadioGroupItem value={branch.id} id={branch.id} className="mt-1" />
                      <Label
                        htmlFor={branch.id}
                        className="flex-1 cursor-pointer space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <MapPin className="h-5 w-5" />
                            <span className="font-semibold text-lg">{branch.name}</span>
                          </div>
                          {checkoutState.selectedBranch?.id === branch.id && (
                            <CheckCircle2 className="h-5 w-5 text-primary" />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{branch.address}</p>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>

                <Button
                  onClick={handleContinue}
                  className="w-full mt-6"
                  size="lg"
                  disabled={!checkoutState.selectedBranch}
                >
                  Continue to Payment
                </Button>
              </CardContent>
            </Card>
          </div>

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

export default BranchSelectionPage;
