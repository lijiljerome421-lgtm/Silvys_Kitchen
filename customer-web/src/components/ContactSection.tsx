import React from 'react';
import { Mail, PhoneCall } from 'lucide-react';
import { WHATSAPP_PHONE, WHATSAPP_DISPLAY_PHONE, CONTACT_EMAIL, HERITAGE_YEAR } from '../config/constants';
import { WhatsAppIcon } from './WhatsAppIcon';

export const ContactSection: React.FC = () => {
  const handleWhatsApp = () => {
    const msg = `Hello Silvy's Kitchen! 👋\n\nI have an inquiry from your website.`;
    const url = `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  };

  return (
    <section className="px-5 py-5 my-4 bg-parchment-card border-y border-border-warm/60 font-body">
      <div className="text-center space-y-1.5 mb-4">
        <span className="text-[10px] font-bold uppercase tracking-widest text-olive-leaf bg-olive-tint px-3 py-1 rounded-full border border-olive-leaf/20 inline-block">
          📍 Get In Touch
        </span>
        <h3 className="font-heading text-xl font-bold text-espresso">
          Contact Us
        </h3>
        <p className="text-xs text-espresso-muted font-serif italic max-w-xs mx-auto">
          We would love to hear from you for orders, feedback, or special requests.
        </p>
      </div>

      <div className="space-y-2.5 max-w-xs mx-auto">
        {/* Call / WhatsApp Button */}
        <button
          onClick={handleWhatsApp}
          className="w-full py-3 px-4 rounded-2xl bg-white hover:bg-parchment-deep border border-border-warm shadow-xs flex items-center justify-between transition-all active:scale-95 group"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#25D366]/10 text-[#25D366] flex items-center justify-center shrink-0">
              <WhatsAppIcon className="w-5 h-5 text-[#25D366]" />
            </div>
            <div className="text-left min-w-0">
              <span className="block text-[10px] uppercase font-bold text-espresso-muted font-sans tracking-wider">
                Call / WhatsApp
              </span>
              <span className="font-sans font-bold text-sm text-espresso tracking-normal block">
                {WHATSAPP_DISPLAY_PHONE}
              </span>
            </div>
          </div>
          <PhoneCall className="w-4 h-4 text-espresso-muted group-hover:text-espresso transition-colors shrink-0" />
        </button>

        {/* Email Mailto Button */}
        <a
          href={`mailto:${CONTACT_EMAIL}`}
          className="w-full py-3 px-4 rounded-2xl bg-white hover:bg-parchment-deep border border-border-warm shadow-xs flex items-center justify-between transition-all active:scale-95 group"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-olive-tint text-olive-deep flex items-center justify-center shrink-0">
              <Mail className="w-5 h-5" />
            </div>
            <div className="text-left min-w-0">
              <span className="block text-[10px] uppercase font-bold text-espresso-muted font-sans tracking-wider">
                Email Us
              </span>
              <span className="font-sans font-semibold text-xs text-espresso tracking-normal truncate block">
                {CONTACT_EMAIL}
              </span>
            </div>
          </div>
        </a>
      </div>

      <div className="mt-4 pt-3 border-t border-border-warm/40 text-center">
        <span className="text-[11px] font-serif italic text-espresso-muted">
          Silvy's Kitchen • {HERITAGE_YEAR} • Kerala, India
        </span>
      </div>
    </section>
  );
};
