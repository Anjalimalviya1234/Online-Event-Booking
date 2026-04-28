import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { HiQuestionMarkCircle, HiMail, HiPhone, HiChat, HiLocationMarker, HiClock, HiArrowLeft, HiChevronDown, HiChevronUp } from 'react-icons/hi';

const faqs = [
    {
        category: 'Booking', items: [
            { q: 'How do I book a venue?', a: 'Search for a venue, pick your date, select a package, and pay the 20% advance to confirm your booking. You\'ll receive a booking ID and confirmation instantly.' },
            { q: 'Can I book for multiple days?', a: 'Currently, each booking is for a single event date. For multi-day events, please contact the venue directly or make separate bookings.' },
            { q: 'How far in advance should I book?', a: 'We recommend booking at least 2-3 months in advance for weddings and major events. Popular venues fill up quickly, especially during wedding season.' },
        ]
    },
    {
        category: 'Payments', items: [
            { q: 'How does payment work?', a: 'You pay 20% advance online through Razorpay (UPI, Cards, Net Banking, Wallets). The remaining 80% is paid directly to the venue before the event.' },
            { q: 'Is my payment secure?', a: 'Yes! We use Razorpay, India\'s most trusted payment gateway with bank-grade security. All transactions are encrypted and PCI DSS compliant.' },
            { q: 'Can I get a refund?', a: 'Free cancellation up to 30 days before the event with full refund. 50% refund for cancellations 15-30 days before. No refund within 15 days.' },
            { q: 'Where can I see my payment history?', a: 'Go to My Account → Payments tab to view all your transactions, download invoices, and track payment status.' },
        ]
    },
    {
        category: 'Venues', items: [
            { q: 'How are venues verified?', a: 'Every venue goes through a multi-step verification process including KYC, physical inspection, and quality checks before being listed.' },
            { q: 'Can I visit a venue before booking?', a: 'Absolutely! We recommend visiting venues before booking. Use the venue detail page to get the address and contact number for scheduling a visit.' },
            { q: 'Are there any hidden charges?', a: 'No hidden charges. The quoted price includes venue, basic setup, and mentioned inclusions. GST (18%) is applied transparently at checkout.' },
        ]
    },
    {
        category: 'Account', items: [
            { q: 'How do I create an account?', a: 'Click the Sign Up button, enter your details, verify with OTP, and you\'re all set! You can also sign up using Google for a faster experience.' },
            { q: 'I forgot my password. What do I do?', a: 'Use the "Forgot Password" option on the login page. We\'ll send a reset link to your registered email.' },
            { q: 'How do I list my venue?', a: 'Click "List Your Venue" in the navigation, register as a vendor, fill in your venue details, and submit for approval. Our team reviews within 24-48 hours.' },
        ]
    },
];

export default function HelpSupport() {
    const [openSection, setOpenSection] = useState(0);
    const [openFaq, setOpenFaq] = useState(null);

    return (
        <>
            <Navbar />
            <main className="pt-[100px] min-h-screen pb-20">
                <div className="max-w-[900px] mx-auto px-6">
                    <motion.div className="mb-10" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                        <Link to="/" className="flex items-center gap-1.5 text-text-muted text-xs mb-3 hover:text-text-secondary transition-colors">
                            <HiArrowLeft /> Back to Home
                        </Link>
                        <h1 className="font-display text-[clamp(1.75rem,4vw,2.5rem)] font-bold bg-gradient-to-br from-white to-text-secondary bg-clip-text text-transparent mb-3">
                            Help & Support
                        </h1>
                        <p className="text-text-secondary text-[0.95rem]">Find answers to common questions or get in touch with our support team</p>
                    </motion.div>

                    {/* Contact Cards */}
                    <motion.div className="grid grid-cols-3 max-md:grid-cols-1 gap-4 mb-12" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                        {[
                            { icon: <HiMail className="text-2xl" />, title: 'Email Us', desc: 'support@eventbook.in', href: 'mailto:support@eventbook.in', color: 'from-primary to-primary-light' },
                            { icon: <HiPhone className="text-2xl" />, title: 'Call Us', desc: '+91 700-000-0000', href: 'tel:+917000000000', color: 'from-accent-emerald to-teal-400' },
                            { icon: <HiChat className="text-2xl" />, title: 'Live Chat', desc: 'Mon-Sat, 9am-6pm', href: '#', color: 'from-accent-gold to-amber-400' },
                        ].map((card, i) => (
                            <a key={i} href={card.href} className="group bg-bg-card border border-border-default rounded-2xl p-6 text-center hover:border-border-light hover:-translate-y-1 transition-all duration-300">
                                <div className={`w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${card.color} flex items-center justify-center text-white shadow-[0_4px_15px_rgba(108,60,225,0.2)] group-hover:scale-110 transition-transform duration-300`}>
                                    {card.icon}
                                </div>
                                <h3 className="text-base font-semibold text-white mb-1">{card.title}</h3>
                                <p className="text-text-muted text-sm">{card.desc}</p>
                            </a>
                        ))}
                    </motion.div>

                    {/* FAQ Sections */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                        <h2 className="font-display text-xl font-bold text-white mb-6 flex items-center gap-2">
                            <HiQuestionMarkCircle className="text-primary-light" /> Frequently Asked Questions
                        </h2>

                        <div className="space-y-4">
                            {faqs.map((section, sIdx) => (
                                <div key={sIdx} className="bg-bg-card border border-border-default rounded-2xl overflow-hidden">
                                    <button
                                        onClick={() => setOpenSection(openSection === sIdx ? -1 : sIdx)}
                                        className="w-full flex items-center justify-between p-5 text-left hover:bg-white/[0.02] transition-all duration-300"
                                    >
                                        <span className="text-base font-semibold text-white">{section.category}</span>
                                        <span className="text-primary-light text-sm flex items-center gap-1">
                                            {section.items.length} questions
                                            {openSection === sIdx ? <HiChevronUp /> : <HiChevronDown />}
                                        </span>
                                    </button>

                                    {openSection === sIdx && (
                                        <motion.div className="border-t border-border-default" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                            {section.items.map((faq, fIdx) => {
                                                const key = `${sIdx}-${fIdx}`;
                                                return (
                                                    <div key={fIdx} className="border-b border-border-default last:border-b-0">
                                                        <button
                                                            onClick={() => setOpenFaq(openFaq === key ? null : key)}
                                                            className="w-full flex items-center justify-between p-4 pl-6 text-left hover:bg-white/[0.02] transition-all duration-300"
                                                        >
                                                            <span className="text-sm text-text-secondary group-hover:text-white">{faq.q}</span>
                                                            <span className="text-primary-light text-sm ml-4 shrink-0">
                                                                {openFaq === key ? '−' : '+'}
                                                            </span>
                                                        </button>
                                                        {openFaq === key && (
                                                            <motion.div className="px-6 pb-4" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                                                                <p className="text-text-secondary text-sm leading-relaxed pl-0">{faq.a}</p>
                                                            </motion.div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </motion.div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Office Info */}
                    <motion.div className="mt-12 bg-bg-card border border-border-default rounded-2xl p-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                        <h3 className="text-base font-semibold text-white mb-4">Office Information</h3>
                        <div className="grid grid-cols-2 max-md:grid-cols-1 gap-4 text-sm">
                            <div className="flex items-start gap-3">
                                <HiLocationMarker className="text-primary-light text-lg shrink-0 mt-0.5" />
                                <div>
                                    <span className="text-text-muted text-xs uppercase tracking-wider block mb-1">Address</span>
                                    <span className="text-text-secondary">EventBook Technologies, MP Nagar, Bhopal, Madhya Pradesh 462011</span>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <HiClock className="text-primary-light text-lg shrink-0 mt-0.5" />
                                <div>
                                    <span className="text-text-muted text-xs uppercase tracking-wider block mb-1">Working Hours</span>
                                    <span className="text-text-secondary">Monday - Saturday: 9:00 AM - 6:00 PM<br />Sunday: Closed</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </main>
            <Footer />
        </>
    );
}
