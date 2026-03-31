import { Link } from "react-router-dom";

export const PrivacyPolicyPage = () => {
  return (
    <div className="py-8 md:py-12">
      <div className="container max-w-4xl">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">Privacy Policy</h1>
        <p className="text-muted-foreground mb-6">
          Hum aap ki privacy ko serious lete hain. Ye simple policy aap ko guide karegi ke hum kya information collect
          karte hain aur use kaise karte hain.
        </p>

        <div className="space-y-6 text-sm md:text-base">
          <section className="space-y-2">
            <h2 className="text-xl font-semibold">1) Hum kya information collect karte hain</h2>
            <p className="text-muted-foreground leading-relaxed">
              Jab aap account banate hain ya order place karte hain, to hum aap ka naam, email, phone, delivery address
              aur payment related details collect kar sakte hain.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-xl font-semibold">2) Hum information kaise use karte hain</h2>
            <p className="text-muted-foreground leading-relaxed">
              Orders process karne, updates dene, customer support assist karne, aur service improve karne ke liye.
              Kabhi kabhi offers bhi bhej sakte hain (aapki preference ke mutabiq).
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-xl font-semibold">3) Sharing</h2>
            <p className="text-muted-foreground leading-relaxed">
              Hum aapki info ko third parties ko sell nahi karte. Order delivery ke liye courier/partners aur payments
              ke liye payment processors se share ho sakta hai.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-xl font-semibold">4) Aap ke rights</h2>
            <p className="text-muted-foreground leading-relaxed">
              Agar aap ko apni info ke bare mein sawal ho, to please hum se contact karein. Aap chahein to apne
              preferences bhi update karwa sakte hain.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Contact: <Link to="/reviews" className="text-accent hover:underline">support/reviews</Link>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;

