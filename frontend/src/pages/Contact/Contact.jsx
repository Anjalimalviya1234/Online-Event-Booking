import { useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { HiLocationMarker, HiMail, HiPhone, HiPaperAirplane, HiClock } from 'react-icons/hi';

const contactInfo = [
    { icon: <HiLocationMarker />, title: 'Visit Us', detail: 'Bhopal, Madhya Pradesh, India', sub: 'Mon-Sat: 10AM - 7PM' },
    { icon: <HiMail />, title: 'Email Us', detail: 'hello@eventbook.in', sub: 'We reply within 24 hours' },
    { icon: <HiPhone />, title: 'Call Us', detail: '+91 98765 43210', sub: 'Mon-Sat: 10AM - 7PM' },
];

export default function Contact() {
    const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.name || !form.email || !form.message) {
            toast.error('Please fill all required fields');
            return;
        }
        setSubmitting(true);
        await new Promise(r => setTimeout(r, 1200));
        toast.success('Message sent successfully! We\'ll get back to you soon.');
        setForm({ name: '', email: '', subject: '', message: '' });
        setSubmitting(false);
    };

    return (
        <>
            <Navbar />
            <main className="pt-[100px] min-h-screen pb-20">
                <div className="max-w-[1280px] mx-auto px-6">
                    <motion.div className="text-center mb-12" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                        <span className="inline-block text-[0.7rem] font-semibold uppercase tracking-widest text-primary-light px-3 py-1 bg-primary/10 rounded-full mb-4">Get in Touch</span>
                        <h1 className="font-display text-[clamp(1.8rem,4vw,3rem)] font-bold bg-gradient-to-br from-white to-text-secondary bg-clip-text text-transparent mb-3">Contact Us</h1>
                        <p className="text-text-secondary text-base max-w-xl mx-auto">Have questions about booking a venue? We're here to help you plan the perfect event.</p>
                    </motion.div>

                    {/* Contact Info Cards */}
                    <div className="grid grid-cols-3 max-md:grid-cols-1 gap-5 mb-12">
                        {contactInfo.map((info, i) => (
                            <motion.div key={i} className="bg-bg-card border border-border-default rounded-2xl p-6 text-center hover:border-primary/30 transition-all duration-300" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                                <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-primary/10 flex items-center justify-center text-primary-light text-xl">{info.icon}</div>
                                <h3 className="text-sm font-semibold text-white mb-1">{info.title}</h3>
                                <p className="text-primary-light text-sm font-medium">{info.detail}</p>
                                <p className="text-text-muted text-xs mt-1">{info.sub}</p>
                            </motion.div>
                        ))}
                    </div>

                    {/* Contact Form */}
                    <div className="grid grid-cols-[1fr_400px] max-lg:grid-cols-1 gap-8">
                        <motion.form onSubmit={handleSubmit} className="bg-bg-card border border-border-default rounded-2xl p-8" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                            <h2 className="text-xl font-bold text-white mb-6">Send Us a Message</h2>
                            <div className="grid grid-cols-2 max-sm:grid-cols-1 gap-4 mb-4">
                                <div>
                                    <label className="block text-xs font-medium text-text-muted mb-1.5 uppercase tracking-wide">Your Name *</label>
                                    <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="John Doe" className="w-full px-4 py-2.5 bg-white/[0.03] border border-border-default rounded-xl text-white text-sm outline-none placeholder:text-text-muted focus:border-primary transition-all" />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-text-muted mb-1.5 uppercase tracking-wide">Email *</label>
                                    <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="john@example.com" className="w-full px-4 py-2.5 bg-white/[0.03] border border-border-default rounded-xl text-white text-sm outline-none placeholder:text-text-muted focus:border-primary transition-all" />
                                </div>
                            </div>
                            <div className="mb-4">
                                <label className="block text-xs font-medium text-text-muted mb-1.5 uppercase tracking-wide">Subject</label>
                                <input type="text" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} placeholder="How can we help?" className="w-full px-4 py-2.5 bg-white/[0.03] border border-border-default rounded-xl text-white text-sm outline-none placeholder:text-text-muted focus:border-primary transition-all" />
                            </div>
                            <div className="mb-6">
                                <label className="block text-xs font-medium text-text-muted mb-1.5 uppercase tracking-wide">Message *</label>
                                <textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} rows={5} placeholder="Tell us about your requirements..." className="w-full px-4 py-2.5 bg-white/[0.03] border border-border-default rounded-xl text-white text-sm outline-none placeholder:text-text-muted focus:border-primary transition-all resize-y" />
                            </div>
                            <button type="submit" disabled={submitting} className="inline-flex items-center gap-2 px-7 py-3 text-base font-semibold rounded-xl bg-gradient-to-r from-primary to-primary-light text-white shadow-[0_4px_15px_rgba(108,60,225,0.4)] hover:-translate-y-0.5 hover:shadow-[0_6px_25px_rgba(108,60,225,0.5)] transition-all duration-300 disabled:opacity-50">
                                <HiPaperAirplane className="rotate-90" /> {submitting ? 'Sending...' : 'Send Message'}
                            </button>
                        </motion.form>

                        {/* FAQ Sidebar */}
                        <motion.div className="bg-bg-card border border-border-default rounded-2xl p-6 h-fit" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                            <h3 className="text-base font-semibold text-white mb-5 flex items-center gap-2"><HiClock className="text-primary-light" /> Quick Answers</h3>
                            <div className="space-y-4">
                                {[
                                    { q: 'How do I book a venue?', a: 'Browse venues, select your date and event type, then click Book Now to confirm.' },
                                    { q: 'Can I cancel my booking?', a: 'Yes! Free cancellation up to 30 days before the event. Go to My Bookings to cancel.' },
                                    { q: 'How does payment work?', a: '20% advance at booking. Remaining amount can be paid before the event date.' },
                                    { q: 'How to list my venue?', a: 'Click "List Venue" in the navbar, register as a vendor, and add your venue details.' },
                                ].map((faq, i) => (
                                    <div key={i} className="pb-4 border-b border-border-default last:border-0 last:pb-0">
                                        <h4 className="text-sm font-medium text-white mb-1">{faq.q}</h4>
                                        <p className="text-text-muted text-xs leading-relaxed">{faq.a}</p>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </div>
                </div>
            </main>
            <Footer />
        </>
    );
}
