import { Metadata } from "next";
import { proseClasses } from "@/styles/prose";
export const metadata: Metadata = {
  title: "Privacy Policy | Fountain",
  description: "Privacy policy for Fountain - how we handle your data",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl mx-auto">
      <div className={proseClasses}>
        <header className="title">Privacy Policy</header>

        <div className="prose dark:prose-invert max-w-none">
          <p className="text-lg mb-6">
            Last Updated: April 2025
          </p>

          <p>
            At Fountain, we value your privacy and are committed to protecting your personal information.
            This Privacy Policy explains how we collect, use, and safeguard your data when you use our platform.
          </p>

          <h3 className="text-xl font-medium mt-6 mb-3">Information You Provide to Us</h3>
          <p>
            When you create an account on Fountain, we may collect information such as your email address, wallet address,
            username, and profile information. Additionally, any content you publish on our platform is stored and processed
            to provide our services.
          </p>

          <h3 className="text-xl font-medium mt-6 mb-3">Information We Collect Automatically</h3>
          <p>
            We collect information about your interactions with our platform, including your IP address, browser type,
            device information, and usage data. This helps us improve our services and provide a better user experience.
          </p>

          <h3 className="text-xl font-medium mt-6 mb-3">How We Use Your Information</h3>
          <p>We use your information to:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Provide, maintain, and improve our services</li>
            <li>Process and complete transactions</li>
            <li>Send you technical notices, updates, and support messages</li>
            <li>Respond to your comments and questions</li>
            <li>Analyze usage patterns and trends</li>
            <li>Protect against malicious, deceptive, or illegal activity</li>
          </ul>

          <h3 className="text-xl font-medium mt-6 mb-3">Data Storage and Security</h3>
          <p>
            Your content is stored on decentralized infrastructure, giving you greater control over your data.
            We implement industry-standard security measures to protect your personal information from unauthorized
            access, disclosure, alteration, and destruction.
          </p>

          <h3 className="text-xl font-medium mt-6 mb-3">Your Choices</h3>
          <p>
            You can access, update, or delete your account information at any time through your account settings.
            You may also request a copy of your data or ask us to delete your personal information by contacting us.
          </p>

          <h3 className="text-xl font-medium mt-6 mb-3">Changes to This Policy</h3>
          <p>
            We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new
            policy on this page and updating the "Last Updated" date.
          </p>

          <h3 className="text-xl font-medium mt-6 mb-3">Contact Us</h3>
          <p>
            If you have any questions about this Privacy Policy, please contact us at
            <a href="mailto:help@fountain.ink" className="text-primary ml-1">
              help@fountain.ink
            </a>.
          </p>
        </div>
      </div>
    </div>
  );
} 