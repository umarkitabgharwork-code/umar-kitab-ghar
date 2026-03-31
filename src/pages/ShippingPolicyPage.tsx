export const ShippingPolicyPage = () => {
  return (
    <div className="py-8 md:py-12">
      <div className="container max-w-4xl">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">Shipping Policy</h1>

        <p className="text-muted-foreground mb-6">
          Shipping simple hai: pickup bhi available hai aur home delivery bhi (area ke hisaab se).
        </p>

        <div className="space-y-6 text-sm md:text-base">
          <section className="space-y-2">
            <h2 className="text-xl font-semibold">1) Delivery options</h2>
            <p className="text-muted-foreground leading-relaxed">
              <strong>Store Pickup:</strong> Order ko apni nearest branch se collect kar sakte hain.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              <strong>Home Delivery:</strong> Hum aapke address ke area ke mutabiq delivery karte hain.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-xl font-semibold">2) Charges &amp; time</h2>
            <p className="text-muted-foreground leading-relaxed">
              Delivery charges checkout mein confirm hotay hain. Delivery time generally 2-5 business days (city)
              aur 5-10 business days (other areas) ho sakta hai.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-xl font-semibold">3) Tracking</h2>
            <p className="text-muted-foreground leading-relaxed">
              Order dispatch hone par tracking details SMS/email ke through mil jati hain.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-xl font-semibold">4) Delivery issues</h2>
            <p className="text-muted-foreground leading-relaxed">
              Agar delivery mein koi problem ho, to please contact karein:{" "}
              <span className="text-accent font-medium">info@umerkitabghar.com</span>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default ShippingPolicyPage;

