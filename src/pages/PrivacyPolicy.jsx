import { useState } from "react";
import { ArrowLeft, Shield, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Logo from "@/components/shared/Logo";

export default function PrivacyPolicy() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("privacy");

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 bg-card border-b border-border z-50">
        <div className="flex items-center justify-between p-4">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-medium">Back</span>
          </button>
          <Logo size="sm" />
          <div className="w-9" />
        </div>
        
        {/* Tabs */}
        <div className="flex border-b border-border">
          <button
            onClick={() => setActiveTab("privacy")}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              activeTab === "privacy"
                ? "text-primary border-b-2 border-primary"
                : "text-muted-foreground"
            }`}
          >
            <Shield className="w-4 h-4 inline mr-2" />
            Privacy Policy
          </button>
          <button
            onClick={() => setActiveTab("terms")}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              activeTab === "terms"
                ? "text-primary border-b-2 border-primary"
                : "text-muted-foreground"
            }`}
          >
            <FileText className="w-4 h-4 inline mr-2" />
            Terms of Use
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 max-w-3xl mx-auto">
        {activeTab === "privacy" ? (
          <div className="space-y-6 text-foreground">
            <h1 className="text-2xl font-heading font-bold">Privacy Policy</h1>
            <p className="text-sm text-muted-foreground">Last updated: May 18, 2026</p>

            <section>
              <h2 className="text-lg font-semibold mb-2">1. Introduction</h2>
              <p className="text-sm leading-relaxed">
                HY3N ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our ride-hailing mobile application and related services (collectively, the "Service").
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-2">2. Information We Collect</h2>
              <div className="space-y-3 text-sm">
                <div>
                  <h3 className="font-medium">Personal Information</h3>
                  <ul className="list-disc list-inside ml-4 mt-1 space-y-1 text-muted-foreground">
                    <li>Name, email address, phone number</li>
                    <li>Profile photo and payment information</li>
                    <li>Location data (GPS coordinates)</li>
                    <li>Ride history and preferences</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-medium">Usage Information</h3>
                  <ul className="list-disc list-inside ml-4 mt-1 space-y-1 text-muted-foreground">
                    <li>Device information and IP address</li>
                    <li>App usage patterns and interactions</li>
                    <li>Trip routes and timestamps</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-2">3. How We Use Your Information</h2>
              <ul className="list-disc list-inside ml-4 space-y-1 text-sm text-muted-foreground">
                <li>To provide and maintain our ride-hailing service</li>
                <li>To process payments and facilitate transactions</li>
                <li>To match riders with drivers and track trips</li>
                <li>To send service updates and notifications</li>
                <li>To improve our services and develop new features</li>
                <li>To comply with legal obligations</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-2">4. Location Services</h2>
              <p className="text-sm leading-relaxed text-muted-foreground">
                We collect real-time location data to facilitate ride matching, track trip progress, and ensure passenger safety. You can control location permissions through your device settings, but disabling location services may limit app functionality.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-2">5. Data Sharing</h2>
              <p className="text-sm leading-relaxed text-muted-foreground">
                We share your information with:
              </p>
              <ul className="list-disc list-inside ml-4 mt-1 space-y-1 text-sm text-muted-foreground">
                <li>Drivers (to facilitate your ride)</li>
                <li>Payment processors (to process transactions)</li>
                <li>Service providers (hosting, analytics, customer support)</li>
                <li>Law enforcement (when required by law or for safety)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-2">6. Data Security</h2>
              <p className="text-sm leading-relaxed text-muted-foreground">
                We implement industry-standard security measures to protect your personal information, including encryption, secure servers, and access controls. However, no method of transmission over the internet is 100% secure.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-2">7. Your Rights</h2>
              <p className="text-sm leading-relaxed text-muted-foreground">
                You have the right to:
              </p>
              <ul className="list-disc list-inside ml-4 mt-1 space-y-1 text-sm text-muted-foreground">
                <li>Access your personal data</li>
                <li>Correct inaccurate data</li>
                <li>Request deletion of your data</li>
                <li>Opt-out of marketing communications</li>
                <li>Export your data in a portable format</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-2">8. Contact Us</h2>
              <p className="text-sm text-muted-foreground">
                For privacy-related questions or requests, contact us at:<br />
                Email: privacy@hy3n.com.gh<br />
                Address: Accra, Ghana
              </p>
            </section>
          </div>
        ) : (
          <div className="space-y-6 text-foreground">
            <h1 className="text-2xl font-heading font-bold">Terms of Use</h1>
            <p className="text-sm text-muted-foreground">Last updated: May 18, 2026</p>

            <section>
              <h2 className="text-lg font-semibold mb-2">1. Agreement to Terms</h2>
              <p className="text-sm leading-relaxed text-muted-foreground">
                By accessing or using the HY3N ride-hailing service, you agree to be bound by these Terms of Use and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this site.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-2">2. License to Use</h2>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Permission is granted to temporarily download one copy of the materials (information or software) on HY3N's app for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-2">3. User Accounts</h2>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>You are responsible for:</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Maintaining the confidentiality of your account</li>
                  <li>All activities that occur under your account</li>
                  <li>Providing accurate and complete registration information</li>
                  <li>Notifying us immediately of unauthorized use</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-2">4. Ride Services</h2>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>As a Rider, you agree to:</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Provide accurate pickup and destination locations</li>
                  <li>Pay all fares and fees when due</li>
                  <li>Treat drivers with respect and courtesy</li>
                  <li>Not request rides for illegal purposes</li>
                  <li>Comply with all applicable laws and regulations</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-2">5. Driver Services</h2>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>As a Driver, you agree to:</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Maintain valid driver's license and vehicle registration</li>
                  <li>Keep vehicle in safe and clean condition</li>
                  <li>Provide professional and courteous service</li>
                  <li>Comply with all traffic laws and regulations</li>
                  <li>Maintain appropriate insurance coverage</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-2">6. Payments and Fees</h2>
              <p className="text-sm leading-relaxed text-muted-foreground">
                HY3N facilitates payments between riders and drivers. We charge a commission fee on each transaction. All fares are calculated based on distance, time, and demand. Prices may vary during peak hours or high-demand periods.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-2">7. Cancellation and Refunds</h2>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Riders may cancel trips before driver arrival. Cancellation fees may apply for late cancellations. Refunds are processed at our discretion and in accordance with applicable laws.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-2">8. Limitation of Liability</h2>
              <p className="text-sm leading-relaxed text-muted-foreground">
                HY3N acts as a marketplace connecting riders and drivers. We are not a transportation carrier and do not provide transportation services. We are not liable for any damages, injuries, or losses arising from the use of our service.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-2">9. Termination</h2>
              <p className="text-sm leading-relaxed text-muted-foreground">
                We may terminate or suspend your account and access to the Service immediately, without prior notice or liability, for any reason, including breach of these Terms.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-2">10. Governing Law</h2>
              <p className="text-sm leading-relaxed text-muted-foreground">
                These Terms shall be governed by and construed in accordance with the laws of Ghana, without regard to its conflict of law provisions.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-2">11. Contact Information</h2>
              <p className="text-sm text-muted-foreground">
                For questions about these Terms, contact us at:<br />
                Email: support@hy3n.com.gh<br />
                Address: Accra, Ghana
              </p>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}