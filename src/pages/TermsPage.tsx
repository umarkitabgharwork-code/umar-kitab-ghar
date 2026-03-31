import { Link } from "react-router-dom";

export const TermsPage = () => {
  return (
    <div className="py-8 md:py-12">
      <div className="container max-w-4xl">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">Terms &amp; Conditions</h1>

        <p className="text-muted-foreground mb-6">
          Simple terms, please read carefully. Jab aap website use karte hain ya order place karte hain,
          to iska matlab hai ke aap in terms ko accept karte hain.
        </p>

        <div className="space-y-6 text-sm md:text-base">
          <section className="space-y-2">
            <h2 className="text-xl font-semibold">1) Products &amp; Pricing</h2>
            <p className="text-muted-foreground leading-relaxed">
              Sab products availability subject hoti hai. Prices Pakistani Rupees mein hoti hain aur kabhi kabhi
              update ho sakti hain.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-xl font-semibold">2) Orders</h2>
            <p className="text-muted-foreground leading-relaxed">
              Order place karna ek offer hota hai. Hum kisi order ko refuse/cancel karne ka right rakhte hain,
              agar system mein issue ya stock mismatch ho.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-xl font-semibold">3) Payment</h2>
            <p className="text-muted-foreground leading-relaxed">
              Payment order ke time pe expected hoti hai (COD selected areas mein possible). Payment verify hone par
              order process hota hai.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-xl font-semibold">4) Returns &amp; Refunds</h2>
            <p className="text-muted-foreground leading-relaxed">
              Refund/return policy ke liye yahan check karein:{" "}
              <Link to="/refund-policy" className="text-accent hover:underline">
                Refund Policy
              </Link>
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-xl font-semibold">5) Updates to these terms</h2>
            <p className="text-muted-foreground leading-relaxed">
              Hum terms ko time to time update kar sakte hain. Changes website par publish hote hi apply ho jate hain.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default TermsPage;

