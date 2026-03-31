import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { getCustomerProfile } from "@/services/api";
import { getOrdersByCustomerPhone, type CustomerOrderListItem } from "@/services/orders";
import { ROUTES } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { User, LogOut, Package, AlertCircle } from "lucide-react";
import type { User as SupabaseUser } from "@supabase/supabase-js";

const getStatusLabel = (status: string) => {
  if (!status) return "Unknown";
  return status.charAt(0).toUpperCase() + status.slice(1);
};

const AccountPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user ?? null);
      setAuthLoading(false);
    };

    loadUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setAuthLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const {
    data: profile,
    isLoading: profileLoading,
  } = useQuery({
    queryKey: ["customer-profile", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const res = await getCustomerProfile(
        user.id,
        user.email,
        user.user_metadata ?? undefined
      );
      if (!res.success) throw new Error(res.message);
      return res.data;
    },
    enabled: !!user?.id,
  });

  const {
    data: orders,
    isLoading: ordersLoading,
    isError: ordersError,
  } = useQuery({
    queryKey: ["customer-orders", profile?.phone],
    queryFn: async () => {
      if (!profile?.phone?.trim()) return [];
      return getOrdersByCustomerPhone(profile.phone);
    },
    enabled: !!profile && !!profile.phone?.trim(),
  });

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    navigate(ROUTES.HOME);
  };

  if (authLoading) {
    return (
      <div className="py-8 md:py-12">
        <div className="container max-w-3xl">
          <Card>
            <CardContent className="p-8">
              <div className="flex items-center justify-center gap-2 text-muted-foreground">
                <Skeleton className="h-6 w-32" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!user) {
    navigate("/login", { replace: true });
    return null;
  }

  return (
    <div className="py-8 md:py-12">
      <div className="container max-w-3xl space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl md:text-3xl font-bold">My Account</h1>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {profileLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-5 w-64" />
                <Skeleton className="h-5 w-40" />
              </div>
            ) : profile ? (
              <>
                <div>
                  <span className="text-sm text-muted-foreground">Email</span>
                  <p className="font-medium">{profile.email || "—"}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Name</span>
                  <p className="font-medium">{profile.name || "—"}</p>
                </div>
              </>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Order History
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!profile?.phone?.trim() ? (
              <p className="text-sm text-muted-foreground">
                Add your phone number to your profile to view order history.
                Orders are linked by the phone number used at checkout.
              </p>
            ) : ordersLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : ordersError ? (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error loading orders</AlertTitle>
                <AlertDescription>
                  Failed to fetch your orders. Please try again later.
                </AlertDescription>
              </Alert>
            ) : orders && orders.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order Code</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order: CustomerOrderListItem) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-mono font-medium">
                        {order.order_code}
                      </TableCell>
                      <TableCell>
                        {new Date(order.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>Rs. {order.total_amount}</TableCell>
                      <TableCell>{getStatusLabel(order.status)}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="link" size="sm" asChild>
                          <Link
                            to={`${ROUTES.TRACK_ORDER}?code=${encodeURIComponent(order.order_code)}`}
                          >
                            Track
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-sm text-muted-foreground">
                No orders yet. Place an order to see it here.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AccountPage;
