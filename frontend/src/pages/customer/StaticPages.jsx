import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, Target, ShieldCheck, Mail, Phone,
  MapPin, Send, HelpCircle, ChevronDown, ChevronUp, Sparkles
} from 'lucide-react';
import toast from 'react-hot-toast';

export const AboutPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-50 text-primary-700 text-xs font-bold uppercase tracking-wider mb-4 border border-primary-100">
            <Sparkles className="w-3.5 h-3.5 text-primary-600" /> About ShopAI
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight mb-4">
            Democratizing Commerce for Independent Indian Vendors
          </h1>
          <p className="text-lg text-gray-600 leading-relaxed">
            ShopAI bridges the gap between verified regional manufacturers, independent merchants, and nationwide shoppers using next-generation AI supply chain forecasting and low-take-rate marketplace infrastructure.
          </p>
        </div>

        {/* Core Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-5">
              <Target className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">AI-Driven Demand Intelligence</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              We empower sellers with LSTM-based velocity forecasts, eliminating stockouts and dead inventory before they happen.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mb-5">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Transparent Platform Splits</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Zero hidden fees, predictable standard commissions, and expedited 48-hour settlements directly into vendor bank accounts.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center mb-5">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Customer-First Assurance</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Every purchase is protected by our 7-day doorstep return guarantee and 100% verified merchant credentials.
            </p>
          </div>
        </div>

        {/* Metrics Banner */}
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-purple-950 text-white rounded-3xl p-8 md:p-12 shadow-xl mb-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <p className="text-4xl md:text-5xl font-black text-white">500+</p>
              <p className="text-blue-200 text-xs font-semibold uppercase tracking-wider mt-1">Verified Vendors</p>
            </div>
            <div>
              <p className="text-4xl md:text-5xl font-black text-white">10K+</p>
              <p className="text-blue-200 text-xs font-semibold uppercase tracking-wider mt-1">Products Listed</p>
            </div>
            <div>
              <p className="text-4xl md:text-5xl font-black text-white">₹45M+</p>
              <p className="text-blue-200 text-xs font-semibold uppercase tracking-wider mt-1">GMV Processed</p>
            </div>
            <div>
              <p className="text-4xl md:text-5xl font-black text-white">99.8%</p>
              <p className="text-blue-200 text-xs font-semibold uppercase tracking-wider mt-1">Buyer Satisfaction</p>
            </div>
          </div>
        </div>

        {/* Join CTA */}
        <div className="text-center bg-white border border-gray-100 rounded-2xl p-10 shadow-sm">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Ready to Scale Your Brand?</h2>
          <p className="text-gray-600 text-sm mb-6 max-w-md mx-auto">
            Join hundreds of thriving Indian vendors leveraging ShopAI&apos;s intelligent marketplace tools today.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/vendor/register" className="btn-primary">Become a Seller</Link>
            <Link to="/browse" className="btn-secondary">Browse Marketplace</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export const ContactPage = () => {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      toast.error('Please fill in all required fields');
      return;
    }
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      toast.success('Thank you! Your inquiry has been submitted. Our team will contact you shortly.');
      setFormData({ name: '', email: '', subject: '', message: '' });
    }, 600);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-3">Get in Touch with ShopAI</h1>
          <p className="text-gray-600 text-sm md:text-base">
            Have questions about ordering, vendor onboarding, or platform integrations? Our specialized team is here to assist 24/7.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Information */}
          <div className="bg-primary-900 text-white rounded-2xl p-8 flex flex-col justify-between shadow-lg">
            <div>
              <h3 className="text-xl font-bold mb-6">Contact Channels</h3>
              <div className="space-y-6 text-sm">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5 text-blue-300" />
                  </div>
                  <div>
                    <p className="font-semibold text-white">Headquarters</p>
                    <p className="text-blue-100/80 mt-0.5">123 AI Street, Tech Park, Outer Ring Road, Bangalore, Karnataka 560001</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                    <Mail className="w-5 h-5 text-blue-300" />
                  </div>
                  <div>
                    <p className="font-semibold text-white">Email Inquiries</p>
                    <p className="text-blue-100/80 mt-0.5">support@shopai.com</p>
                    <p className="text-blue-100/80">vendors@shopai.com</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                    <Phone className="w-5 h-5 text-blue-300" />
                  </div>
                  <div>
                    <p className="font-semibold text-white">Direct Line</p>
                    <p className="text-blue-100/80 mt-0.5">+91 98765 43210</p>
                    <p className="text-xs text-blue-200/60 mt-0.5">Mon - Sat: 9:00 AM – 8:00 PM IST</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-8 border-t border-white/10 text-xs text-blue-200/80">
              <p>For urgent order escalation, please include your Order ID in the subject field.</p>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Send Us a Direct Message</h3>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-semibold uppercase text-gray-600 mb-1.5">Your Name *</label>
                  <input 
                    type="text" 
                    required
                    value={formData.name}
                    onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))}
                    placeholder="e.g. Aditi Sharma"
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-gray-600 mb-1.5">Email Address *</label>
                  <input 
                    type="email" 
                    required
                    value={formData.email}
                    onChange={(e) => setFormData(p => ({ ...p, email: e.target.value }))}
                    placeholder="aditi@example.com"
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-gray-600 mb-1.5">Subject</label>
                <input 
                  type="text" 
                  value={formData.subject}
                  onChange={(e) => setFormData(p => ({ ...p, subject: e.target.value }))}
                  placeholder="Order Inquiry / Vendor Partnership / Feedback"
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-gray-600 mb-1.5">Message *</label>
                <textarea 
                  rows={5}
                  required
                  value={formData.message}
                  onChange={(e) => setFormData(p => ({ ...p, message: e.target.value }))}
                  placeholder="Please describe how we can assist you..."
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              <button 
                type="submit" 
                disabled={submitting}
                className="btn-primary w-full sm:w-auto inline-flex items-center justify-center"
              >
                {submitting ? 'Sending...' : (
                  <>
                    <Send className="w-4 h-4 mr-2" /> Submit Message
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export const FAQPage = () => {
  const [openIndex, setOpenIndex] = useState(0);

  const faqs = [
    {
      q: 'How does ShopAI protect buyers and guarantee quality?',
      a: 'Every vendor is verified via GSTIN, PAN, and address proof before catalog approval. Buyers also enjoy our 7-day hassle-free doorstep return policy on all eligible purchases.'
    },
    {
      q: 'How does AI demand forecasting benefit sellers on ShopAI?',
      a: 'Our deep learning forecasting models track local sales velocity, seasonality, and cart abandons, sending automatic alerts to vendors when inventory reaches reorder thresholds to prevent stockouts.'
    },
    {
      q: 'What are the platform commission fees for vendors?',
      a: 'ShopAI operates on a transparent, category-based take rate between 8% and 12%, significantly lower than traditional legacy marketplaces. There are zero listing fees.'
    },
    {
      q: 'When and how do vendors receive payouts?',
      a: 'Vendor payouts are settled automatically 48 hours post confirmed delivery into the verified bank account provided in the Vendor Profile.'
    },
    {
      q: 'What shipping options are available?',
      a: 'We partner with tier-1 logistics networks providing express shipping across 19,000+ pincodes in India. Standard delivery occurs within 2–5 business days.'
    },
    {
      q: 'How can I download a tax invoice for my purchase?',
      a: 'Tax invoices with complete GST breakdown can be downloaded anytime directly from your Orders page under Order Details > Download Invoice.'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wider mb-4">
            <HelpCircle className="w-3.5 h-3.5" /> Help Center & Knowledge Base
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-3">Frequently Asked Questions</h1>
          <p className="text-gray-600 text-sm">
            Everything you need to know about shopping, selling, settlements, and AI features on ShopAI.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div 
                key={index}
                className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden transition-all"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? -1 : index)}
                  className="w-full text-left p-5 flex items-center justify-between gap-4 font-bold text-gray-900 hover:text-primary-600 transition-colors"
                >
                  <span className="text-base">{faq.q}</span>
                  {isOpen ? (
                    <ChevronUp className="w-5 h-5 text-gray-400 shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400 shrink-0" />
                  )}
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 text-sm text-gray-600 leading-relaxed border-t border-gray-50 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-12 p-8 bg-blue-50 rounded-2xl border border-blue-100 text-center">
          <h3 className="text-lg font-bold text-blue-900 mb-1">Still have questions?</h3>
          <p className="text-blue-700 text-sm mb-4">Our dedicated merchant and buyer support team is always available.</p>
          <Link to="/contact" className="btn-primary inline-flex">
            Contact Support
          </Link>
        </div>
      </div>
    </div>
  );
};
