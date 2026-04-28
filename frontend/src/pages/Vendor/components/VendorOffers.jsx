import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { HiPlus, HiCheck, HiTag, HiTrash } from 'react-icons/hi';

export default function VendorOffers({ myVenues }) {
    const [offers, setOffers] = useState(() => {
        try { return JSON.parse(localStorage.getItem('vendor_offers') || '[]'); } catch { return []; }
    });
    const [showOfferForm, setShowOfferForm] = useState(false);
    const [offerForm, setOfferForm] = useState({ title: '', description: '', discountPercent: '', validFrom: '', validTo: '', venueId: '', offerType: 'seasonal' });

    const handleCreateOffer = () => {
        if (!offerForm.title || !offerForm.discountPercent) { toast.error('Title and discount are required'); return; }
        const newOffer = { ...offerForm, id: Date.now(), createdAt: new Date().toISOString(), isActive: true, venueName: myVenues.find(v => v._id === offerForm.venueId)?.name || 'All Venues' };
        const updated = [...offers, newOffer];
        setOffers(updated);
        localStorage.setItem('vendor_offers', JSON.stringify(updated));
        setOfferForm({ title: '', description: '', discountPercent: '', validFrom: '', validTo: '', venueId: '', offerType: 'seasonal' });
        setShowOfferForm(false);
        toast.success('Offer created successfully!');
    };

    const handleRemoveOffer = (offerId) => {
        const updated = offers.filter(o => o.id !== offerId);
        setOffers(updated);
        localStorage.setItem('vendor_offers', JSON.stringify(updated));
        toast.success('Offer removed');
    };

    const inputCls = "w-full px-4 py-3 bg-white/[0.03] border border-border-default rounded-xl text-white text-sm outline-none focus:border-accent-emerald transition-all";
    const selectCls = `${inputCls} appearance-none`;
    const typeEmoji = { seasonal: '🌞', 'early-bird': '🐤', 'last-minute': '⚡', weekday: '📅', bundle: '🎁' };

    return (
        <motion.div className="space-y-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-semibold text-white">Offers & Discounts</h2>
                    <p className="text-text-muted text-xs mt-0.5">Create special offers for your venues to boost bookings</p>
                </div>
                <button onClick={() => setShowOfferForm(!showOfferForm)} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-accent-emerald to-teal-500 text-white text-sm font-semibold rounded-xl hover:-translate-y-0.5 transition-all duration-300">
                    <HiPlus /> Create Offer
                </button>
            </div>

            {/* Create Offer Form */}
            <AnimatePresence>
                {showOfferForm && (
                    <motion.div className="bg-bg-card border border-border-default rounded-2xl" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                        <div className="p-5 border-b border-border-default">
                            <h3 className="text-base font-semibold text-white flex items-center gap-2"><HiTag className="text-accent-emerald" /> New Offer</h3>
                        </div>
                        <div className="p-5 space-y-4">
                            <div className="grid grid-cols-2 max-sm:grid-cols-1 gap-4">
                                <div>
                                    <label className="text-xs font-medium text-text-muted mb-1.5 block uppercase tracking-wide">Offer Title</label>
                                    <input type="text" value={offerForm.title} onChange={e => setOfferForm({ ...offerForm, title: e.target.value })} className={inputCls} placeholder="e.g. Summer Special 20% Off" />
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-text-muted mb-1.5 block uppercase tracking-wide">Discount %</label>
                                    <input type="number" value={offerForm.discountPercent} onChange={e => setOfferForm({ ...offerForm, discountPercent: e.target.value })} className={inputCls} placeholder="e.g. 15" min="1" max="50" />
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-text-muted mb-1.5 block uppercase tracking-wide">Offer Type</label>
                                    <select value={offerForm.offerType} onChange={e => setOfferForm({ ...offerForm, offerType: e.target.value })} className={selectCls}>
                                        <option value="seasonal" className="bg-bg-secondary">🌞 Seasonal</option>
                                        <option value="early-bird" className="bg-bg-secondary">🐤 Early Bird</option>
                                        <option value="last-minute" className="bg-bg-secondary">⚡ Last-Minute Deal</option>
                                        <option value="weekday" className="bg-bg-secondary">📅 Weekday Special</option>
                                        <option value="bundle" className="bg-bg-secondary">🎁 Bundle Offer</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-text-muted mb-1.5 block uppercase tracking-wide">Venue</label>
                                    <select value={offerForm.venueId} onChange={e => setOfferForm({ ...offerForm, venueId: e.target.value })} className={selectCls}>
                                        <option value="" className="bg-bg-secondary">All Venues</option>
                                        {myVenues.map(v => <option key={v._id} value={v._id} className="bg-bg-secondary">{v.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-text-muted mb-1.5 block uppercase tracking-wide">Valid From</label>
                                    <input type="date" value={offerForm.validFrom} onChange={e => setOfferForm({ ...offerForm, validFrom: e.target.value })} className={inputCls} />
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-text-muted mb-1.5 block uppercase tracking-wide">Valid To</label>
                                    <input type="date" value={offerForm.validTo} onChange={e => setOfferForm({ ...offerForm, validTo: e.target.value })} className={inputCls} />
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-medium text-text-muted mb-1.5 block uppercase tracking-wide">Description</label>
                                <textarea value={offerForm.description} onChange={e => setOfferForm({ ...offerForm, description: e.target.value })} rows={2} className={`${inputCls} resize-none`} placeholder="Describe the offer details..." />
                            </div>
                            <div className="flex justify-end gap-3">
                                <button onClick={() => setShowOfferForm(false)} className="px-5 py-2.5 bg-white/5 border border-border-default rounded-xl text-text-secondary text-sm font-medium hover:text-white transition-all">Cancel</button>
                                <button onClick={handleCreateOffer} className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-accent-emerald to-teal-500 text-white text-sm font-semibold rounded-xl hover:-translate-y-0.5 transition-all shadow-[0_4px_15px_rgba(16,185,129,0.3)]">
                                    <HiCheck /> Create Offer
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Offers List */}
            {offers.length > 0 ? (
                <div className="space-y-4">
                    {offers.map((offer) => {
                        const isExpired = offer.validTo && new Date(offer.validTo) < new Date();
                        return (
                            <motion.div key={offer.id} className={`bg-bg-card border rounded-2xl overflow-hidden ${isExpired ? 'border-border-default opacity-60' : 'border-accent-emerald/20'}`} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
                                <div className="p-5 flex items-start justify-between gap-4 max-sm:flex-col">
                                    <div className="flex items-start gap-4">
                                        <div className="w-14 h-14 rounded-2xl bg-accent-emerald/15 flex items-center justify-center text-2xl shrink-0">
                                            {typeEmoji[offer.offerType] || '🏷️'}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="text-base font-semibold text-white">{offer.title}</h3>
                                                <span className="px-2 py-0.5 bg-accent-emerald/15 text-accent-emerald text-[10px] font-bold rounded-full">{offer.discountPercent}% OFF</span>
                                                {isExpired && <span className="px-2 py-0.5 bg-accent/15 text-accent text-[10px] font-bold rounded-full">EXPIRED</span>}
                                            </div>
                                            {offer.description && <p className="text-text-secondary text-sm mb-2">{offer.description}</p>}
                                            <div className="flex items-center gap-3 text-text-muted text-xs flex-wrap">
                                                <span>📍 {offer.venueName}</span>
                                                <span className="capitalize">🏷️ {offer.offerType.replace('-', ' ')}</span>
                                                {offer.validFrom && <span>📅 {new Date(offer.validFrom).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} - {new Date(offer.validTo).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>}
                                            </div>
                                        </div>
                                    </div>
                                    <button onClick={() => handleRemoveOffer(offer.id)} className="flex items-center gap-1 px-3 py-1.5 bg-accent/10 border border-accent/20 rounded-lg text-accent text-xs font-semibold hover:bg-accent/20 transition-all shrink-0">
                                        <HiTrash /> Remove
                                    </button>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            ) : (
                <div className="bg-bg-card border border-border-default rounded-2xl p-12 text-center">
                    <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-accent-emerald/20 to-teal-500/10 flex items-center justify-center"><HiTag className="text-3xl text-accent-emerald" /></div>
                    <h3 className="text-xl font-bold text-white mb-2">No Offers Yet</h3>
                    <p className="text-text-secondary text-sm max-w-md mx-auto">Create special offers and discounts to attract more customers and boost your bookings during off-peak seasons.</p>
                </div>
            )}
        </motion.div>
    );
}
