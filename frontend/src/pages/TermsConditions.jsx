import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, FileText, CheckCircle2 } from 'lucide-react';

const TermsConditions = () => {
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
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-espresso dark:text-white">
              Terms & Conditions
            </h1>
            <p className="text-xs text-taupe dark:text-stone-400">Last updated: October 2026</p>
          </div>
        </div>

        <div className="space-y-6 text-sm text-stone-600 dark:text-stone-300 leading-relaxed font-sans">
          <section>
            <h2 className="text-lg font-bold text-espresso dark:text-white mb-2 font-serif flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-terracotta" /> 1. Ordering & Counter Pickup
            </h2>
            <p>
              La Roche Cafe operates a digital preorder & express counter pickup model. Orders placed through the website or PWA app are prepared in sequence based on kitchen capacity.
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1 text-xs sm:text-sm">
              <li>Orders are confirmed once payment is successfully processed.</li>
              <li>Customers will receive real-time notifications when their order is ready for counter pickup.</li>
              <li>Please provide your Order ID or Token number at the pickup counter.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-espresso dark:text-white mb-2 font-serif flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-terracotta" /> 2. Payments & Refunds
            </h2>
            <p>
              Digital payments are securely handled via Razorpay. If an ordered item is out of stock or cannot be fulfilled, the cafe staff will assist you with an instant substitution or initiate a direct refund.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-espresso dark:text-white mb-2 font-serif flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-terracotta" /> 3. Food Freshness & Quality
            </h2>
            <p>
              All coffees, artisan toasties, and baked goods are made fresh to order. We recommend collecting your order within 10 minutes of receiving the "Ready for Pickup" alert for optimal taste and quality.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default TermsConditions;
