import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Check, ArrowRight, ExternalLink } from 'lucide-react';

const STORAGE_KEY = 'laroche_device_agreement_v1';

const LegalConsentGate = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [agreedPrivacy, setAgreedPrivacy] = useState(false);

  useEffect(() => {
    // Check if this unique device has already agreed
    try {
      const accepted = localStorage.getItem(STORAGE_KEY);
      if (!accepted) {
        setIsOpen(true);
      }
    } catch (e) {
      // Fallback if localStorage is disabled
      setIsOpen(true);
    }
  }, []);

  const handleProceed = () => {
    if (!agreedTerms || !agreedPrivacy) return;
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          accepted: true,
          acceptedAt: new Date().toISOString(),
          termsAccepted: true,
          privacyAccepted: true,
        })
      );
    } catch (e) {
      // Ignore storage errors
    }
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 sm:p-6 overflow-y-auto animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="legal-consent-title"
    >
      <div className="relative w-full max-w-md bg-[#231E1B] text-[#F3EBE1] rounded-3xl border border-[#4A3B32] shadow-warm-xl overflow-hidden my-auto p-6 sm:p-8">
        {/* Brand Logo Header */}
        <div className="text-center mb-6">
          <img
            src="/logo.png"
            alt="La Roche Cafe"
            className="h-14 w-auto object-contain mx-auto mb-4 brightness-110"
          />
          <h2 id="legal-consent-title" className="text-2xl sm:text-3xl font-serif font-bold text-white tracking-tight">
            Welcome to La Roche
          </h2>
          <p className="text-xs sm:text-sm text-[#C8B8AC] mt-2 max-w-xs mx-auto leading-relaxed">
            Please review and accept our policies to continue to the cafe menu.
          </p>
        </div>

        {/* Checkboxes Form */}
        <div className="space-y-3.5 mb-7 bg-[#1A1614] rounded-2xl border border-[#3A2E27] p-3.5">
          {/* Checkbox 1: Terms */}
          <label className="flex items-start gap-3 cursor-pointer group select-none p-2 rounded-xl transition-colors hover:bg-white/5">
            <input
              type="checkbox"
              checked={agreedTerms}
              onChange={(e) => setAgreedTerms(e.target.checked)}
              className="sr-only"
            />
            <div
              className={`w-5 h-5 rounded-md border flex items-center justify-center flex-shrink-0 mt-0.5 transition-all duration-150 ${
                agreedTerms
                  ? 'bg-[#A6472B] border-[#A6472B] text-white shadow-sm'
                  : 'border-[#5A4B42] bg-[#231E1B] group-hover:border-[#8A7569]'
              }`}
            >
              {agreedTerms && <Check className="w-3.5 h-3.5 stroke-[3]" />}
            </div>
            <div className="text-xs sm:text-sm text-[#D8C7BC] leading-snug">
              <span>I agree to the </span>
              <Link
                to="/terms-and-conditions"
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="text-[#E07A5F] hover:text-[#F28E73] font-semibold underline underline-offset-2 inline-flex items-center gap-0.5"
              >
                Terms & Conditions
                <ExternalLink className="w-3 h-3 inline" />
              </Link>
            </div>
          </label>

          {/* Checkbox 2: Privacy */}
          <label className="flex items-start gap-3 cursor-pointer group select-none p-2 rounded-xl transition-colors hover:bg-white/5">
            <input
              type="checkbox"
              checked={agreedPrivacy}
              onChange={(e) => setAgreedPrivacy(e.target.checked)}
              className="sr-only"
            />
            <div
              className={`w-5 h-5 rounded-md border flex items-center justify-center flex-shrink-0 mt-0.5 transition-all duration-150 ${
                agreedPrivacy
                  ? 'bg-[#A6472B] border-[#A6472B] text-white shadow-sm'
                  : 'border-[#5A4B42] bg-[#231E1B] group-hover:border-[#8A7569]'
              }`}
            >
              {agreedPrivacy && <Check className="w-3.5 h-3.5 stroke-[3]" />}
            </div>
            <div className="text-xs sm:text-sm text-[#D8C7BC] leading-snug">
              <span>I agree to the </span>
              <Link
                to="/privacy-policy"
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="text-[#E07A5F] hover:text-[#F28E73] font-semibold underline underline-offset-2 inline-flex items-center gap-0.5"
              >
                Privacy Policy
                <ExternalLink className="w-3 h-3 inline" />
              </Link>
            </div>
          </label>
        </div>

        {/* Action Button */}
        <button
          type="button"
          disabled={!agreedTerms || !agreedPrivacy}
          onClick={handleProceed}
          className={`w-full py-3.5 px-6 rounded-2xl font-serif font-bold text-sm tracking-wide flex items-center justify-center gap-2 transition-all duration-200 ${
            agreedTerms && agreedPrivacy
              ? 'bg-[#A6472B] hover:bg-[#7E351F] text-white shadow-warm-md cursor-pointer transform active:scale-[0.99]'
              : 'bg-[#3A302A] text-[#8C7B71] border border-[#4D4038] cursor-not-allowed opacity-70'
          }`}
        >
          <span>Continue to Cafe Menu</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default LegalConsentGate;
