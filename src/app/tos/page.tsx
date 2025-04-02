import { proseClasses } from "@/styles/prose";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service | Fountain",
  description: "Terms of service for Fountain",
};

export default function TermsAndConditionsPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl mx-auto">
      <div className={proseClasses}>
        <header className="title">Terms of Service</header>

        <div className="prose dark:prose-invert max-w-none">
          <p className="text-lg mb-6">
            Last Updated: April 2025
          </p>

          <p>
            Please read these Terms of Service carefully before using Fountain.
            By accessing or using our platform, you agree to be bound by these Terms.
          </p>

          <h3 className="text-xl font-medium mt-6 mb-3">1. Acceptance of Terms</h3>
          <p>
            By accessing or using Fountain, you agree to comply with and be bound by these Terms of Service.
            If you do not agree with any part of these terms, you may not use our platform.
          </p>

          <h3 className="text-xl font-medium mt-6 mb-3">2. User Accounts</h3>
          <p>
            When you create an account on Fountain, you are responsible for maintaining the security of your account
            and for all activities that occur under your account. You must immediately notify us of any unauthorized
            use of your account or any other breach of security.
          </p>

          <h3 className="text-xl font-medium mt-6 mb-3">3. User Content</h3>
          <p>
            You retain ownership of the content you publish on Fountain. However, by posting content, you grant us a
            non-exclusive, royalty-free license to use, display, and distribute your content in connection with our services.
          </p>
          <p>
            You are solely responsible for the content you post on Fountain. Content must not violate any applicable laws
            or regulations, infringe on the rights of others, or contain harmful, abusive, or inappropriate material.
          </p>

          <h3 className="text-xl font-medium mt-6 mb-3">4. Platform Usage</h3>
          <p>You agree not to:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Use our platform for any illegal purpose or in violation of any laws</li>
            <li>Interfere with or disrupt the operation of our platform</li>
            <li>Attempt to gain unauthorized access to our systems or user accounts</li>
            <li>Use automated methods to access or use our platform without our permission</li>
            <li>Impersonate another person or misrepresent your affiliation with any entity</li>
          </ul>

          <h3 className="text-xl font-medium mt-6 mb-3">5. Intellectual Property</h3>
          <p>
            The Fountain name, logo, and all related features, functionalities, and designs are the exclusive property
            of Fountain and are protected by international copyright, trademark, and other intellectual property laws.
          </p>

          <h3 className="text-xl font-medium mt-6 mb-3">6. Limitation of Liability</h3>
          <p>
            Fountain is provided on an "as is" and "as available" basis. We make no warranties or representations about
            the accuracy or completeness of the platform's content and assume no liability for any errors or omissions.
          </p>
          <p>
            In no event shall Fountain be liable for any indirect, consequential, exemplary, incidental, special, or
            punitive damages, including lost profits, arising from or relating to your use of the platform.
          </p>

          <h3 className="text-xl font-medium mt-6 mb-3">7. Modifications to Terms</h3>
          <p>
            We reserve the right to modify these Terms and Conditions at any time. Continued use of the platform after
            any changes indicates your acceptance of the modified terms.
          </p>

          <h3 className="text-xl font-medium mt-6 mb-3">8. Governing Law</h3>
          <p>
            These Terms shall be governed by and construed in accordance with the laws, without regard to its conflict
            of law provisions.
          </p>

          <h3 className="text-xl font-medium mt-6 mb-3">9. Contact Us</h3>
          <p>
            If you have any questions about these Terms of Service, please contact us at
            <a href="mailto:help@fountain.ink" className="text-primary ml-1">
              help@fountain.ink
            </a>.
          </p>
        </div>
      </div>
    </div>
  );
} 