export const RefundPolicyPage = () => {
  return (
    <div className="py-8 md:py-12">
      <div className="container max-w-4xl">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">Refund Policy</h1>

        <p className="text-muted-foreground mb-6">
          Agar aap ko return/refund chahiye, to yeh short guide follow karein.
        </p>

        <div className="space-y-6 text-sm md:text-base">
          <section className="space-y-2">
            <h2 className="text-xl font-semibold">1) Return kab possible hai?</h2>
            <p className="text-muted-foreground leading-relaxed">
              Generally, purchase ke 7 din ke andar return initiate ho sakta hai. Product unused ho aur original
              packaging intact ho.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-xl font-semibold">2) Kab return nahi hota?</h2>
            <p className="text-muted-foreground leading-relaxed">
              Customized/personalized items, used/damaged items, aur sale/clearance items generally return
              eligible nahi hote.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-xl font-semibold">3) Refund ka process</h2>
            <p className="text-muted-foreground leading-relaxed">
              Return receive aur inspect hone ke baad refund 5-7 business days mein process hota hai.
              Refund original payment method par jata hai.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-xl font-semibold">4) Help chahiye?</h2>
            <p className="text-muted-foreground leading-relaxed">
              Aap support ke liye hum se contact karein:{" "}
              <span className="text-accent font-medium">info@umerkitabghar.com</span>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default RefundPolicyPage;

