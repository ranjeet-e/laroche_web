import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Shield, Lock, Eye, CheckCircle2 } from 'lucide-react';

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-oat text-espresso py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white dark:bg-[#23231C] rounded-3xl border border-[#DDD4C0] dark:border-[#3D3D30] p-6 sm:p-10 shadow-warm-xl">
        <Link
          to="/menu"
          className="inline-flex items-center gap-2 text-xs font-bold text-taupe hover:text-espresso dark:text-stone-300 dark:hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Menu</span>
        </Link>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-terracotta text-white flex items-center justify-center shadow-glow-terracotta">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-espresso dark:text-white">
              Privacy Policy
            </h1>
            <p className="text-xs text-taupe dark:text-stone-400">Last updated: October 2026</p>
          </div>
        </div>

        <div className="space-y-6 text-sm text-stone-600 dark:text-stone-300 leading-relaxed font-sans">
          <section>
            <h2 className="text-lg font-bold text-espresso dark:text-white mb-2 font-serif flex items-center gap-2">
              <Lock className="w-4 h-4 text-terracotta" /> 1. Information We Collect
            </h2>
            <p>
              When you place orders with <strong>La Roche Cafe</strong>, we collect minimal personal information strictly necessary for order processing, counter verification, and real-time preparation alerts:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1 text-xs sm:text-sm">
              <li><strong>Contact Information:</strong> Your name, phone number, and optional email address.</li>
              <li><strong>Order Data:</strong> Selected items, customizations, and counter token numbers.</li>
              <li><strong>Device & Session Tokens:</strong> Push notification tokens and anonymous session identifiers.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-espresso dark:text-white mb-2 font-serif flex items-center gap-2">
              <Eye className="w-4 h-4 text-terracotta" /> 2. How We Use Your Data
            </h2>
            <p>We use your information exclusively to:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1 text-xs sm:text-sm">
              <li>Notify you via web push notifications and audio cues when your order is preparing or ready.</li>
              <li>Authenticate your account securely and prevent unauthorized order tampering.</li>
              <li>Process digital payments securely via RBI-compliant payment gateways (Razorpay).</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-espresso dark:text-white mb-2 font-serif flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-terracotta" /> 3. Data Protection & Security
            </h2>
            <p>
              We implement industry-standard encryption (HTTPS/TLS 1.3), hashed passwords with bcrypt, encrypted JSON Web Tokens, and strict role-based access control. We never sell, rent, or trade your personal data to third parties.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-espresso dark:text-white mb-2 font-serif">
              4. Contact Us
            </h2>
            <p>
              If you have any questions or wish to delete your account data, please visit the cafe counter or email us at <strong>contact@larochecafe.com</strong>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
