interface LegalPageProps {
  title: string;
  lastUpdated: string;
  children: React.ReactNode;
}

const LegalPageLayout = ({ title, lastUpdated, children }: LegalPageProps) => {
  return (
    <div className="py-8 md:py-12">
      <div className="container max-w-4xl">
        <header className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">{title}</h1>
          <p className="text-muted-foreground">Last updated: {lastUpdated}</p>
        </header>
        <div className="prose prose-lg max-w-none
          prose-headings:text-foreground prose-headings:font-semibold
          prose-p:text-muted-foreground prose-p:leading-relaxed
          prose-ul:text-muted-foreground prose-li:text-muted-foreground
          prose-h2:text-xl prose-h2:mt-8 prose-h2:mb-4">
          {children}
        </div>
      </div>
    </div>
  );
};

export const PrivacyPolicyPage = () => (
  <LegalPageLayout title="Privacy Policy" lastUpdated="December 1, 2025">
    <h2>1. Information We Collect</h2>
    <p>At Umar Kitab Ghar, we collect information you provide directly to us, such as when you create an account, make a purchase, or contact us for support. This may include your name, email address, phone number, delivery address, and payment information.</p>
    
    <h2>2. How We Use Your Information</h2>
    <p>We use the information we collect to process your orders, communicate with you about your purchases, improve our services, and send promotional communications (with your consent).</p>
    
    <h2>3. Information Sharing</h2>
    <p>We do not sell or rent your personal information to third parties. We may share your information with delivery partners to fulfill your orders and with payment processors to complete transactions.</p>
    
    <h2>4. Data Security</h2>
    <p>We implement appropriate security measures to protect your personal information against unauthorized access, alteration, or destruction.</p>
    
    <h2>5. Cookies</h2>
    <p>Our website uses cookies to enhance your browsing experience. You can choose to disable cookies through your browser settings.</p>
    
    <h2>6. Contact Us</h2>
    <p>If you have any questions about this Privacy Policy, please contact us at info@umerkitabghar.com.</p>
  </LegalPageLayout>
);

export const TermsConditionsPage = () => (
  <LegalPageLayout title="Terms & Conditions" lastUpdated="December 1, 2025">
    <h2>1. Acceptance of Terms</h2>
    <p>By accessing and using the Umar Kitab Ghar website, you accept and agree to be bound by these Terms and Conditions.</p>
    
    <h2>2. Products and Pricing</h2>
    <p>All products are subject to availability. Prices are in Pakistani Rupees and may change without notice. We reserve the right to correct pricing errors.</p>
    
    <h2>3. Orders</h2>
    <p>Placing an order constitutes an offer to purchase. We reserve the right to refuse or cancel any order for any reason.</p>
    
    <h2>4. Payment</h2>
    <p>Payment is due at the time of order for delivery orders. Cash on delivery is available for selected areas. All payments are subject to verification.</p>
    
    <h2>5. Intellectual Property</h2>
    <p>All content on this website, including text, images, and logos, is the property of Umar Kitab Ghar and is protected by copyright laws.</p>
    
    <h2>6. Limitation of Liability</h2>
    <p>Umar Kitab Ghar shall not be liable for any indirect, incidental, or consequential damages arising from the use of our products or services.</p>
    
    <h2>7. Changes to Terms</h2>
    <p>We reserve the right to modify these terms at any time. Changes will be effective immediately upon posting to the website.</p>
  </LegalPageLayout>
);

export const RefundPolicyPage = () => (
  <LegalPageLayout title="Refund & Return Policy" lastUpdated="December 1, 2025">
    <h2>1. Return Eligibility</h2>
    <p>Items may be returned within 7 days of purchase if they are in original condition, unused, and with all packaging intact.</p>
    
    <h2>2. Non-Returnable Items</h2>
    <ul>
      <li>Used or damaged items</li>
      <li>Items with broken seals (where applicable)</li>
      <li>Customized or personalized items</li>
      <li>Items purchased on sale or clearance</li>
    </ul>
    
    <h2>3. Return Process</h2>
    <p>To initiate a return, contact us at info@umerkitabghar.com with your order number and reason for return. We will provide instructions for returning the item.</p>
    
    <h2>4. Refund Process</h2>
    <p>Once we receive and inspect the returned item, we will process your refund within 5-7 business days. Refunds will be issued to the original payment method.</p>
    
    <h2>5. Exchanges</h2>
    <p>We offer exchanges for items of equal or greater value. If the new item costs more, you will need to pay the difference.</p>
    
    <h2>6. Damaged or Defective Items</h2>
    <p>If you receive a damaged or defective item, please contact us immediately with photos of the damage. We will arrange for replacement or refund at no additional cost.</p>
  </LegalPageLayout>
);

export const ShippingPolicyPage = () => (
  <LegalPageLayout title="Shipping Policy" lastUpdated="December 1, 2025">
    <h2>1. Delivery Options</h2>
    <p>We offer two delivery options:</p>
    <ul>
      <li><strong>Store Pickup:</strong> Collect your order from any of our branches at no additional cost.</li>
      <li><strong>Home Delivery:</strong> We deliver to addresses within our service area.</li>
    </ul>
    
    <h2>2. Delivery Areas</h2>
    <p>Home delivery is currently available in major cities. Please enter your address during checkout to confirm delivery availability.</p>
    
    <h2>3. Delivery Charges</h2>
    <p>Delivery charges vary based on location and order size. Exact charges will be displayed at checkout before you confirm your order.</p>
    
    <h2>4. Delivery Time</h2>
    <p>Standard delivery takes 2-5 business days within city limits and 5-10 business days for other areas. Delivery times may vary during peak seasons.</p>
    
    <h2>5. Order Tracking</h2>
    <p>Once your order is dispatched, you will receive a tracking number via SMS or email to monitor your delivery status.</p>
    
    <h2>6. Delivery Issues</h2>
    <p>If you experience any issues with delivery, please contact us immediately at info@umerkitabghar.com.</p>
  </LegalPageLayout>
);

export const DisclaimerPage = () => (
  <LegalPageLayout title="Disclaimer" lastUpdated="December 1, 2025">
    <h2>1. General Information</h2>
    <p>The information provided on the Umar Kitab Ghar website is for general informational purposes only. While we strive to keep the information up to date and accurate, we make no representations or warranties of any kind about the completeness, accuracy, or reliability of the information.</p>
    
    <h2>2. Product Information</h2>
    <p>Product images are for illustration purposes only. Actual products may vary slightly from images shown. We are not responsible for color variations that may occur due to monitor display settings.</p>
    
    <h2>3. Third-Party Links</h2>
    <p>Our website may contain links to third-party websites. We have no control over the content, privacy policies, or practices of these sites and accept no responsibility for them.</p>
    
    <h2>4. Educational Content</h2>
    <p>Any educational content or advice provided on our blog is for informational purposes only and should not be considered as professional educational advice.</p>
    
    <h2>5. Limitation of Liability</h2>
    <p>Under no circumstances shall Umar Kitab Ghar be liable for any direct, indirect, incidental, consequential, or special damages arising out of or in connection with the use of our website or products.</p>
    
    <h2>6. Contact</h2>
    <p>For any questions regarding this disclaimer, please contact us at info@umerkitabghar.com.</p>
  </LegalPageLayout>
);
