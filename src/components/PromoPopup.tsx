import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export function PromoPopup() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setOpen(true);
  }, []);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center modal-blur">
      <div className="modal-bg max-w-lg w-full mx-4 p-8 relative animate-scale-in">
        <button
          className="absolute top-3 right-3 rounded-full px-2 py-1 text-sm border border-[#FFD700] text-[#FFD700] hover:bg-[#FFD700] hover:text-[#050B2D] font-semibold"
          onClick={() => setOpen(false)}
          aria-label="Close promotion"
        >
          ✕
        </button>
        <div className="premium-typography text-2xl md:text-3xl mb-4">
          Create Account & Unlock Exclusive Discounts
        </div>
        <p className="text-foreground/90 mb-6 leading-relaxed">
          Sign up today to receive special discounts, reward points, and exclusive deals on books and stationery.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            className="gold-gradient px-5 py-2.5 rounded-lg flex-1"
            onClick={() => {
              setOpen(false);
              navigate("/login");
            }}
          >
            Login
          </button>
          <button
            className="gold-gradient px-5 py-2.5 rounded-lg flex-1"
            onClick={() => {
              setOpen(false);
              navigate("/signup");
            }}
          >
            Create Account
          </button>
          <button
            className="border border-[#FFD700] text-[#FFD700] hover:bg-[#FFD700] hover:text-[#050B2D] font-semibold px-5 py-2.5 rounded-lg flex-1"
            onClick={() => setOpen(false)}
          >
            Skip
          </button>
        </div>
      </div>
    </div>
  );
}

