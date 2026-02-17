import { createContext, useContext, useState, ReactNode } from "react";

export type DeliveryMethod = "pickup" | "delivery";

export type PaymentMethod = "online" | "cod" | "cop";

export interface Branch {
  id: string;
  name: string;
  address: string;
}

export interface CheckoutFormData {
  name: string;
  primaryPhone: string;
  secondaryPhone: string;
  address: string;
  latitude?: number;
  longitude?: number;
}

export interface CheckoutState {
  formData: CheckoutFormData;
  deliveryMethod: DeliveryMethod | null;
  selectedBranch: Branch | null;
  paymentMethod: PaymentMethod | null;
  paymentCompleted: boolean;
}

interface CheckoutContextType {
  checkoutState: CheckoutState;
  updateFormData: (data: Partial<CheckoutFormData>) => void;
  setDeliveryMethod: (method: DeliveryMethod) => void;
  setSelectedBranch: (branch: Branch) => void;
  setPaymentMethod: (method: PaymentMethod) => void;
  setPaymentCompleted: (completed: boolean) => void;
  clearCheckout: () => void;
}

const initialCheckoutState: CheckoutState = {
  formData: {
    name: "",
    primaryPhone: "",
    secondaryPhone: "",
    address: "",
  },
  deliveryMethod: null,
  selectedBranch: null,
  paymentMethod: null,
  paymentCompleted: false,
};

const CheckoutContext = createContext<CheckoutContextType | undefined>(undefined);

export function CheckoutProvider({ children }: { children: ReactNode }) {
  const [checkoutState, setCheckoutState] = useState<CheckoutState>(initialCheckoutState);

  const updateFormData = (data: Partial<CheckoutFormData>) => {
    setCheckoutState((prev) => ({
      ...prev,
      formData: { ...prev.formData, ...data },
    }));
  };

  const setDeliveryMethod = (method: DeliveryMethod) => {
    setCheckoutState((prev) => ({
      ...prev,
      deliveryMethod: method,
      selectedBranch: method === "delivery" ? null : prev.selectedBranch,
    }));
  };

  const setSelectedBranch = (branch: Branch) => {
    setCheckoutState((prev) => ({
      ...prev,
      selectedBranch: branch,
    }));
  };

  const setPaymentMethod = (method: PaymentMethod) => {
    setCheckoutState((prev) => ({
      ...prev,
      paymentMethod: method,
      paymentCompleted: method !== "online" ? true : false,
    }));
  };

  const setPaymentCompleted = (completed: boolean) => {
    setCheckoutState((prev) => ({
      ...prev,
      paymentCompleted: completed,
    }));
  };

  const clearCheckout = () => {
    setCheckoutState(initialCheckoutState);
  };

  return (
    <CheckoutContext.Provider
      value={{
        checkoutState,
        updateFormData,
        setDeliveryMethod,
        setSelectedBranch,
        setPaymentMethod,
        setPaymentCompleted,
        clearCheckout,
      }}
    >
      {children}
    </CheckoutContext.Provider>
  );
}

export function useCheckout() {
  const context = useContext(CheckoutContext);
  if (context === undefined) {
    throw new Error("useCheckout must be used within a CheckoutProvider");
  }
  return context;
}
