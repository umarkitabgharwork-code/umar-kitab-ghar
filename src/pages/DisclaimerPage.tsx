export const DisclaimerPage = () => {
  return (
    <div className="py-8 md:py-12">
      <div className="container max-w-4xl">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">Disclaimer</h1>

        <p className="text-muted-foreground mb-6">
          Ye content general information ke liye hai. Products aur images mein thori variation ho sakti hai.
        </p>

        <div className="space-y-6 text-sm md:text-base">
          <section className="space-y-2">
            <h2 className="text-xl font-semibold">1) Website information</h2>
            <p className="text-muted-foreground leading-relaxed">
              Hum website par sahi aur updated information provide karne ki koshish karte hain, magar 100%
              accuracy guarantee nahi hoti.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-xl font-semibold">2) Images &amp; product details</h2>
            <p className="text-muted-foreground leading-relaxed">
              Images sirf representation ke liye hoti hain. Colour/size light difference ho sakta hai due to
              screen settings.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-xl font-semibold">3) External links</h2>
            <p className="text-muted-foreground leading-relaxed">
              Agar kisi third-party link par aap jate hain, to unki policies ke liye hum responsible nahi.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-xl font-semibold">4) Contact</h2>
            <p className="text-muted-foreground leading-relaxed">
              Questions hon to contact karein:{" "}
              <span className="text-accent font-medium">info@umerkitabghar.com</span>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default DisclaimerPage;

