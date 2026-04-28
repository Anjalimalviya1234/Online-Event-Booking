import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import useWishlist from '../../hooks/useWishlist';
import useAuth from '../../hooks/useAuth';
import { useVenueDetail, useReviews, useCreateReview } from '../../hooks/useVenues';
import { useCreateBooking, useCheckAvailability } from '../../hooks/useBookings';
import { usePayment } from '../../hooks/usePayments';
import { HiStar, HiLocationMarker, HiUsers, HiPhone, HiChat, HiHeart, HiShare, HiCheck, HiCalendar, HiCurrencyRupee, HiChevronLeft, HiChevronRight, HiPencilAlt, HiX, HiClipboardCheck, HiCheckCircle } from 'react-icons/hi';

const defaultFaqs = [
    { q: 'What is the cancellation policy?', a: 'Free cancellation up to 30 days before the event. 50% refund for cancellations 15-30 days before. No refund within 15 days.' },
    { q: 'Is outside catering allowed?', a: 'We prefer in-house catering for quality control, but outside catering can be arranged with prior approval.' },
    { q: 'What is the advance payment?', a: '20% of the total amount is required as advance at the time of booking. Remaining can be paid before the event.' },
    { q: 'Are there any hidden charges?', a: 'No hidden charges. The quoted price includes venue, basic setup, and mentioned inclusions. Taxes are additional.' },
];

export default function VenueDetail() {
    const { id } = useParams();
    const { venue, loading, error } = useVenueDetail(id);
    const reviews = useReviews(id);
    const { user } = useAuth();
    const { submitReview, loading: reviewSubmitting } = useCreateReview();

    const [currentImage, setCurrentImage] = useState(0);
    const [selectedPackage, setSelectedPackage] = useState(null);
    const [activeTab, setActiveTab] = useState('overview');
    const [openFaq, setOpenFaq] = useState(null);
    const [likeLoading, setLikeLoading] = useState(false);
    const { isLiked, toggleLike } = useWishlist();

    // Review form state
    const [showReviewForm, setShowReviewForm] = useState(false);
    const [reviewForm, setReviewForm] = useState({ rating: 0, title: '', comment: '', eventType: '' });
    const [hoverRating, setHoverRating] = useState(0);

    // Booking state
    const navigate = useNavigate();
    const { createBooking, loading: bookingLoading } = useCreateBooking();
    const { checkAvailability, checking, availability, resetAvailability } = useCheckAvailability();
    const { initiatePayment, loading: paymentLoading } = usePayment();
    const [showBookingModal, setShowBookingModal] = useState(false);
    const [bookingSuccess, setBookingSuccess] = useState(null);
    const [bookingForm, setBookingForm] = useState({
        eventDate: '', eventType: 'wedding', guestCount: '', specialNotes: ''
    });

    const handleCheckAvailability = async () => {
        if (!bookingForm.eventDate) { toast.error('Please select a date'); return; }
        await checkAvailability(id, bookingForm.eventDate);
    };

    const calculatePricing = () => {
        if (!venue) return null;
        const pkg = selectedPackage !== null ? venue.packages?.[selectedPackage] : null;
        const basePrice = pkg?.price || venue.startingPrice || 0;
        const addOnsTotal = 0;
        const tax = Math.round((basePrice + addOnsTotal) * 0.18);
        const totalAmount = basePrice + addOnsTotal + tax;
        const advanceAmount = Math.round(totalAmount * 0.20);
        const remainingAmount = totalAmount - advanceAmount;
        return { basePrice, addOnsTotal, tax, totalAmount, advanceAmount, remainingAmount };
    };

    const handleBookNow = () => {
        if (!user) { toast.error('Please login to book'); navigate('/login'); return; }
        if (!bookingForm.eventDate) { toast.error('Please select a date'); return; }
        if (!bookingForm.guestCount || bookingForm.guestCount < 1) { toast.error('Please enter guest count'); return; }
        if (availability === false) { toast.error('Venue is not available on selected date'); return; }
        setShowBookingModal(true);
    };

    const handleConfirmBooking = async () => {
        const pkg = selectedPackage !== null ? venue.packages?.[selectedPackage] : null;
        try {
            const result = await createBooking({
                venueId: id,
                eventType: bookingForm.eventType,
                eventDate: bookingForm.eventDate,
                guestCount: Number(bookingForm.guestCount),
                specialNotes: bookingForm.specialNotes,
                packageSelected: pkg ? { name: pkg.name, price: pkg.price, includes: pkg.includes } : undefined,
            });
            if (result?.booking) {
                // Initiate Razorpay payment
                initiatePayment(result.booking._id, user, (confirmedBooking) => {
                    setBookingSuccess(confirmedBooking);
                });
            }
        } catch { /* error handled in hook */ }
    };

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        if (reviewForm.rating === 0) { toast.error('Please select a rating'); return; }
        if (!reviewForm.comment.trim()) { toast.error('Please write a comment'); return; }
        try {
            await submitReview({ venueId: id, ...reviewForm });
            toast.success('Review submitted successfully!');
            setShowReviewForm(false);
            setReviewForm({ rating: 0, title: '', comment: '', eventType: '' });
            setHoverRating(0);
            window.location.reload();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to submit review');
        }
    };

    const handleLike = async () => {
        if (likeLoading) return;
        setLikeLoading(true);
        await toggleLike(id);
        setLikeLoading(false);
    };

    if (loading) return (
        <>
            <Navbar />
            <main className="pt-[100px] min-h-screen pb-20">
                <div className="max-w-[1280px] mx-auto px-6">
                    <div className="animate-pulse">
                        <div className="h-[450px] bg-bg-card rounded-2xl mb-8" />
                        <div className="grid grid-cols-[1fr_380px] max-lg:grid-cols-1 gap-8">
                            <div className="space-y-4">
                                <div className="h-8 bg-bg-card rounded w-1/3" />
                                <div className="h-10 bg-bg-card rounded w-2/3" />
                                <div className="h-4 bg-bg-card rounded w-1/2" />
                            </div>
                            <div className="h-[400px] bg-bg-card rounded-2xl" />
                        </div>
                    </div>
                </div>
            </main>
        </>
    );

    if (error) return (
        <>
            <Navbar />
            <main className="pt-[100px] min-h-screen pb-20">
                <div className="max-w-[1280px] mx-auto px-6 text-center py-20">
                    <h2 className="text-2xl font-bold text-white mb-4">Venue Not Found</h2>
                    <p className="text-text-secondary mb-6">{error}</p>
                    <Link to="/venues" className="inline-flex items-center gap-2 px-7 py-3 text-base font-semibold rounded-xl bg-gradient-to-r from-primary to-primary-light text-white">Browse Venues</Link>
                </div>
            </main>
        </>
    );

    const amenitiesList = [
        { key: 'parking', label: `Parking${venue.amenities?.parkingCapacity ? ` (${venue.amenities.parkingCapacity} cars)` : ''}`, available: venue.amenities?.parking },
        { key: 'ac', label: 'Air Conditioning', available: venue.amenities?.ac },
        { key: 'wifi', label: 'Wi-Fi', available: venue.amenities?.wifi },
        { key: 'dj', label: 'DJ System', available: venue.amenities?.dj },
        { key: 'decoration', label: 'Decoration', available: venue.amenities?.decorationAvailable },
        { key: 'catering', label: 'In-house Catering', available: venue.amenities?.cateringAvailable },
        { key: 'rooms', label: `${venue.amenities?.rooms || 0} Rooms`, available: venue.amenities?.rooms > 0 },
        { key: 'alcohol', label: 'Alcohol Allowed', available: venue.amenities?.alcoholAllowed },
    ].filter(a => a.available);

    const images = venue.images?.length > 0 ? venue.images : [{ url: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=1200' }];
    const faqs = venue.faqs?.length > 0 ? venue.faqs : defaultFaqs;

    return (
        <>
            <Navbar />
            <main className="pt-[100px] min-h-screen pb-20">
                <div className="max-w-[1280px] mx-auto px-6">
                    <div className="flex items-center gap-2 text-sm text-text-muted mb-6">
                        <Link to="/venues" className="hover:text-white transition-colors">Venues</Link>
                        <span>/</span>
                        <Link to={`/venues?city=${venue.city}`} className="hover:text-white transition-colors">{venue.city}</Link>
                        <span>/</span>
                        <span className="text-text-secondary">{venue.name}</span>
                    </div>

                    <div className="mb-8">
                        <div className="relative rounded-2xl overflow-hidden h-[450px] max-md:h-[280px]">
                            <img src={images[currentImage]?.url} alt={venue.name} className="w-full h-full object-cover" />
                            {images.length > 1 && (
                                <>
                                    <button className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center bg-black/50 backdrop-blur-lg border-none rounded-full text-white text-xl hover:bg-black/70 transition-all duration-300" onClick={() => setCurrentImage(i => i > 0 ? i - 1 : images.length - 1)}><HiChevronLeft /></button>
                                    <button className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center bg-black/50 backdrop-blur-lg border-none rounded-full text-white text-xl hover:bg-black/70 transition-all duration-300" onClick={() => setCurrentImage(i => i < images.length - 1 ? i + 1 : 0)}><HiChevronRight /></button>
                                </>
                            )}
                            <div className="absolute bottom-4 right-4 px-3 py-1.5 bg-black/60 backdrop-blur-lg rounded-full text-white text-sm">{currentImage + 1} / {images.length}</div>
                        </div>
                        {images.length > 1 && (
                            <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
                                {images.map((img, i) => (
                                    <button key={i} className={`w-20 h-16 shrink-0 rounded-xl overflow-hidden border-2 transition-all duration-300 ${i === currentImage ? 'border-primary opacity-100' : 'border-transparent opacity-60 hover:opacity-80'}`} onClick={() => setCurrentImage(i)}>
                                        <img src={img.url} alt={`View ${i + 1}`} className="w-full h-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-[1fr_380px] max-lg:grid-cols-1 gap-8">
                        <div>
                            <motion.div className="mb-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                                <div className="flex items-start justify-between gap-4 mb-4 max-md:flex-col">
                                    <div>
                                        <span className="inline-block text-[0.7rem] font-semibold uppercase tracking-wide text-primary-light px-2.5 py-0.5 bg-primary/10 rounded-full mb-2 capitalize">{(venue.venueType || 'venue').replace('-', ' ')}</span>
                                        <h1 className="font-display text-[clamp(1.5rem,3vw,2.25rem)] font-bold text-white mb-2">{venue.name}</h1>
                                        <div className="flex items-center gap-1.5 text-text-secondary text-sm"><HiLocationMarker className="text-accent" /> {venue.address || `${venue.area}, ${venue.city}`}</div>
                                    </div>
                                    <div className="flex gap-2 shrink-0">
                                        <button
                                            onClick={handleLike}
                                            disabled={likeLoading}
                                            className={`w-10 h-10 flex items-center justify-center border rounded-xl text-lg transition-all duration-300 ${isLiked(id)
                                                ? 'bg-accent/15 border-accent/30 text-accent scale-110 shadow-[0_0_15px_rgba(255,59,48,0.2)]'
                                                : 'bg-white/[0.06] border-border-default text-text-secondary hover:text-accent hover:border-accent/30'}`}
                                        >
                                            <HiHeart className={likeLoading ? 'animate-pulse' : ''} />
                                        </button>
                                        <button className="w-10 h-10 flex items-center justify-center bg-white/[0.06] border border-border-default rounded-xl text-text-secondary text-lg hover:text-primary-light hover:border-primary/30 transition-all duration-300"><HiShare /></button>
                                    </div>
                                </div>
                                <div className="flex items-center gap-5 flex-wrap">
                                    <div className="flex items-center gap-1.5 text-sm font-semibold"><HiStar className="text-accent-gold text-lg" /><span className="text-white">{venue.rating?.average || 'N/A'}</span><span className="text-text-muted font-normal">({venue.rating?.count || 0} reviews)</span></div>
                                    <div className="flex items-center gap-1.5 text-text-secondary text-sm"><HiUsers /> {venue.capacity?.min || 0}-{venue.capacity?.max || 0} Guests</div>
                                    <div className="flex items-center gap-1.5 text-text-secondary text-sm"><HiCurrencyRupee /> Starting ₹{(venue.startingPrice || 0).toLocaleString('en-IN')}</div>
                                </div>
                            </motion.div>

                            <div className="flex gap-1 border-b border-border-default mb-6 overflow-x-auto">
                                {['overview', ...(venue.packages?.length > 0 ? ['packages'] : []), ...(venue.foodMenu?.length > 0 ? ['menu'] : []), 'reviews', 'faqs'].map(tab => (
                                    <button key={tab} className={`px-5 py-3 text-sm font-medium border-b-2 transition-all duration-300 capitalize whitespace-nowrap ${activeTab === tab ? 'border-primary text-white' : 'border-transparent text-text-muted hover:text-text-secondary'}`} onClick={() => setActiveTab(tab)}>{tab}</button>
                                ))}
                            </div>

                            {activeTab === 'overview' && (
                                <div className="space-y-8">
                                    <div><h3 className="text-lg font-semibold text-white mb-3">About This Venue</h3><p className="text-text-secondary text-sm leading-relaxed">{venue.description}</p></div>
                                    {amenitiesList.length > 0 && (
                                        <div>
                                            <h3 className="text-lg font-semibold text-white mb-4">Amenities & Facilities</h3>
                                            <div className="grid grid-cols-2 max-sm:grid-cols-1 gap-3">
                                                {amenitiesList.map(a => (
                                                    <div key={a.key} className="flex items-center gap-2.5 px-4 py-3 rounded-xl border text-sm bg-accent-emerald/[0.06] border-accent-emerald/15 text-white">
                                                        <HiCheck className="text-accent-emerald" /><span>{a.label}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    {venue.occasions?.length > 0 && (
                                        <div>
                                            <h3 className="text-lg font-semibold text-white mb-3">Perfect For</h3>
                                            <div className="flex flex-wrap gap-2">
                                                {venue.occasions.map(o => (<span key={o} className="px-4 py-1.5 bg-primary/10 border border-primary/20 rounded-full text-primary-light text-sm font-medium capitalize">{o}</span>))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeTab === 'packages' && venue.packages?.length > 0 && (
                                <div>
                                    <h3 className="text-lg font-semibold text-white mb-4">Choose Your Package</h3>
                                    <div className="grid grid-cols-1 gap-4">
                                        {venue.packages.map((pkg, i) => (
                                            <div key={i} className={`relative p-6 bg-bg-card border rounded-2xl cursor-pointer transition-all duration-300 ${selectedPackage === i ? 'border-primary shadow-[0_0_20px_rgba(108,60,225,0.15)]' : 'border-border-default hover:border-border-light'}`} onClick={() => setSelectedPackage(i)}>
                                                <h4 className="text-base font-semibold text-white mb-1">{pkg.name}</h4>
                                                <p className="text-text-muted text-sm mb-3">{pkg.description}</p>
                                                <div className="text-2xl font-extrabold bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent mb-4">₹{(pkg.price || 0).toLocaleString('en-IN')}</div>
                                                {pkg.includes?.length > 0 && (
                                                    <ul className="space-y-2 mb-4">{pkg.includes.map((item, j) => (<li key={j} className="flex items-center gap-2 text-text-secondary text-sm"><HiCheck className="text-accent-emerald shrink-0" /> {item}</li>))}</ul>
                                                )}
                                                <button className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${selectedPackage === i ? 'bg-gradient-to-r from-primary to-primary-light text-white' : 'bg-white/[0.06] border border-border-default text-text-secondary hover:text-white hover:border-border-light'}`}>{selectedPackage === i ? 'Selected' : 'Select Package'}</button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {activeTab === 'menu' && venue.foodMenu?.length > 0 && (
                                <div>
                                    <h3 className="text-lg font-semibold text-white mb-1">Food Menu</h3>
                                    {venue.pricePerPlate && <p className="text-primary-light text-sm font-medium mb-5">Price per plate: ₹{venue.pricePerPlate}</p>}
                                    {venue.foodMenu.map((cat, i) => (
                                        <div key={i} className="mb-6">
                                            <h4 className="text-base font-semibold text-white mb-3 pb-2 border-b border-border-default">{cat.category}</h4>
                                            <div className="space-y-2">
                                                {cat.items?.map((item, j) => (
                                                    <div key={j} className="flex items-center justify-between py-2.5 px-4 bg-white/[0.02] rounded-xl">
                                                        <div className="flex items-center gap-2.5"><span>{item.isVeg ? '🟢' : '🔴'}</span><span className="text-text-secondary text-sm">{item.name}</span></div>
                                                        <span className="text-white text-sm font-semibold">₹{item.price}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {activeTab === 'reviews' && (
                                <div>
                                    <div className="flex items-center justify-between mb-6 max-sm:flex-col max-sm:items-start max-sm:gap-3">
                                        <h3 className="text-lg font-semibold text-white">Guest Reviews</h3>
                                        <div className="flex items-center gap-4">
                                            <div className="flex items-center gap-3">
                                                <span className="text-3xl font-extrabold text-white">{venue.rating?.average || 'N/A'}</span>
                                                <div>
                                                    <div className="flex gap-0.5">{[...Array(5)].map((_, i) => <HiStar key={i} className={`text-base ${i < Math.round(venue.rating?.average || 0) ? 'text-accent-gold' : 'text-text-muted opacity-30'}`} />)}</div>
                                                    <span className="text-text-muted text-xs">{venue.rating?.count || 0} reviews</span>
                                                </div>
                                            </div>
                                            {user && (
                                                <button onClick={() => setShowReviewForm(!showReviewForm)} className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-primary to-primary-light text-white text-sm font-semibold rounded-xl hover:-translate-y-0.5 transition-all duration-300 shadow-[0_4px_15px_rgba(108,60,225,0.3)]">
                                                    <HiPencilAlt /> Write Review
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {/* Review Form */}
                                    {showReviewForm && user && (
                                        <motion.form onSubmit={handleReviewSubmit} className="mb-8 p-6 bg-bg-card border border-primary/20 rounded-2xl shadow-[0_0_30px_rgba(108,60,225,0.1)]" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                                            <h4 className="text-base font-semibold text-white mb-4">Share Your Experience</h4>

                                            {/* Star Rating */}
                                            <div className="mb-5">
                                                <label className="block text-xs font-medium text-text-muted mb-2 uppercase tracking-wide">Your Rating *</label>
                                                <div className="flex items-center gap-1">
                                                    {[1, 2, 3, 4, 5].map(star => (
                                                        <button key={star} type="button" className="bg-transparent border-none p-1 cursor-pointer transition-transform duration-200 hover:scale-125" onMouseEnter={() => setHoverRating(star)} onMouseLeave={() => setHoverRating(0)} onClick={() => setReviewForm({ ...reviewForm, rating: star })}>
                                                            <HiStar className={`text-2xl transition-colors duration-200 ${star <= (hoverRating || reviewForm.rating) ? 'text-accent-gold' : 'text-white/15'}`} />
                                                        </button>
                                                    ))}
                                                    {reviewForm.rating > 0 && <span className="ml-2 text-accent-gold text-sm font-semibold">{['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][reviewForm.rating]}</span>}
                                                </div>
                                            </div>

                                            {/* Event Type */}
                                            <div className="mb-4">
                                                <label className="block text-xs font-medium text-text-muted mb-2 uppercase tracking-wide">Event Type</label>
                                                <select value={reviewForm.eventType} onChange={(e) => setReviewForm({ ...reviewForm, eventType: e.target.value })} className="w-full px-4 py-2.5 bg-white/[0.03] border border-border-default rounded-xl text-white text-sm outline-none focus:border-primary transition-all [&>option]:bg-[#1A1A2E]">
                                                    <option value="">Select event type</option>
                                                    {['wedding', 'reception', 'engagement', 'birthday', 'corporate', 'party', 'other'].map(t => <option key={t} value={t} className="capitalize">{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                                                </select>
                                            </div>

                                            {/* Title */}
                                            <div className="mb-4">
                                                <label className="block text-xs font-medium text-text-muted mb-2 uppercase tracking-wide">Review Title</label>
                                                <input type="text" value={reviewForm.title} onChange={(e) => setReviewForm({ ...reviewForm, title: e.target.value })} placeholder="Sum up your experience in a line" maxLength={100} className="w-full px-4 py-2.5 bg-white/[0.03] border border-border-default rounded-xl text-white text-sm outline-none placeholder:text-text-muted focus:border-primary transition-all" />
                                            </div>

                                            {/* Comment */}
                                            <div className="mb-5">
                                                <label className="block text-xs font-medium text-text-muted mb-2 uppercase tracking-wide">Your Review *</label>
                                                <textarea value={reviewForm.comment} onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })} placeholder="Tell others about your experience at this venue..." rows={4} maxLength={1000} className="w-full px-4 py-2.5 bg-white/[0.03] border border-border-default rounded-xl text-white text-sm outline-none placeholder:text-text-muted focus:border-primary transition-all resize-y" />
                                                <span className="text-text-muted text-xs mt-1 block text-right">{reviewForm.comment.length}/1000</span>
                                            </div>

                                            {/* Actions */}
                                            <div className="flex items-center gap-3 justify-end">
                                                <button type="button" onClick={() => { setShowReviewForm(false); setReviewForm({ rating: 0, title: '', comment: '', eventType: '' }); setHoverRating(0); }} className="px-5 py-2.5 bg-white/[0.06] border border-border-default rounded-xl text-text-secondary text-sm font-medium hover:text-white transition-all duration-300">Cancel</button>
                                                <button type="submit" disabled={reviewSubmitting} className="px-6 py-2.5 bg-gradient-to-r from-primary to-primary-light text-white text-sm font-semibold rounded-xl hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 shadow-[0_4px_15px_rgba(108,60,225,0.3)]">{reviewSubmitting ? 'Submitting...' : 'Submit Review'}</button>
                                            </div>
                                        </motion.form>
                                    )}

                                    {/* Not logged in prompt */}
                                    {!user && (
                                        <div className="mb-6 p-4 bg-primary/[0.06] border border-primary/15 rounded-xl text-center">
                                            <p className="text-text-secondary text-sm">Want to share your experience? <Link to="/login" className="text-primary-light font-semibold hover:underline">Login</Link> to write a review.</p>
                                        </div>
                                    )}

                                    {/* Reviews List */}
                                    <div className="space-y-4">
                                        {reviews.length > 0 ? reviews.map((r, i) => (
                                            <div key={r._id || i} className="p-5 bg-bg-card border border-border-default rounded-2xl">
                                                <div className="flex items-center justify-between mb-3">
                                                    <div className="flex items-center gap-3">
                                                        <span className="w-10 h-10 flex items-center justify-center text-sm font-bold bg-primary/10 text-primary-light rounded-full">{r.user?.name?.charAt(0).toUpperCase() || '?'}</span>
                                                        <div>
                                                            <h4 className="text-sm font-semibold text-white">{r.user?.name || 'Guest'}</h4>
                                                            <span className="text-text-muted text-xs">{new Date(r.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                                                            {r.eventType && <span className="text-text-muted text-xs ml-2 capitalize">• {r.eventType}</span>}
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-0.5">{[...Array(5)].map((_, j) => <HiStar key={j} className={`text-sm ${j < r.rating ? 'text-accent-gold' : 'text-white/10'}`} />)}</div>
                                                </div>
                                                {r.title && <h5 className="text-white text-sm font-semibold mb-1">{r.title}</h5>}
                                                <p className="text-text-secondary text-sm leading-relaxed">{r.comment}</p>
                                            </div>
                                        )) : <p className="text-text-muted text-center py-8">No reviews yet. Be the first to review!</p>}
                                    </div>
                                </div>
                            )}

                            {activeTab === 'faqs' && (
                                <div>
                                    <h3 className="text-lg font-semibold text-white mb-4">Frequently Asked Questions</h3>
                                    <div className="space-y-3">
                                        {faqs.map((faq, i) => (
                                            <div key={i} className="bg-bg-card border border-border-default rounded-xl overflow-hidden">
                                                <button className="w-full flex items-center justify-between p-4 bg-transparent text-left text-white text-sm font-medium hover:bg-white/[0.02] transition-all duration-300" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                                                    <span>{faq.q}</span><span className="text-primary-light text-lg ml-4">{openFaq === i ? '−' : '+'}</span>
                                                </button>
                                                {openFaq === i && (<motion.div className="px-4 pb-4" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}><p className="text-text-secondary text-sm leading-relaxed">{faq.a}</p></motion.div>)}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="max-lg:order-first">
                            <div className="sticky top-[100px] bg-bg-card border border-border-default rounded-2xl p-6 shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
                                <div className="text-center mb-5 pb-5 border-b border-border-default">
                                    <span className="text-text-muted text-xs uppercase tracking-widest">{selectedPackage !== null && venue.packages?.[selectedPackage] ? 'Package Price' : 'Starting from'}</span>
                                    <div className="text-[2rem] font-extrabold bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent my-1">₹{((selectedPackage !== null && venue.packages?.[selectedPackage]?.price) || venue.startingPrice || 0).toLocaleString('en-IN')}</div>
                                    {venue.pricePerPlate && <span className="text-text-muted text-sm">+ ₹{venue.pricePerPlate}/plate</span>}
                                </div>

                                {/* Selected Package Badge */}
                                {selectedPackage !== null && venue.packages?.[selectedPackage] && (
                                    <div className="mb-4 p-3 bg-primary/[0.08] border border-primary/20 rounded-xl">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <span className="text-[0.65rem] text-text-muted uppercase tracking-widest">Selected Package</span>
                                                <h4 className="text-sm font-semibold text-white">{venue.packages[selectedPackage].name}</h4>
                                            </div>
                                            <button onClick={() => setSelectedPackage(null)} className="w-6 h-6 flex items-center justify-center rounded-md bg-white/[0.06] text-text-muted hover:text-white hover:bg-white/[0.1] transition-all text-xs"><HiX /></button>
                                        </div>
                                        {venue.packages[selectedPackage].includes?.length > 0 && (
                                            <div className="flex flex-wrap gap-1.5 mt-2">
                                                {venue.packages[selectedPackage].includes.slice(0, 3).map((item, i) => (
                                                    <span key={i} className="px-2 py-0.5 bg-white/[0.06] rounded-md text-text-secondary text-[0.65rem]">{item}</span>
                                                ))}
                                                {venue.packages[selectedPackage].includes.length > 3 && <span className="px-2 py-0.5 text-primary-light text-[0.65rem]">+{venue.packages[selectedPackage].includes.length - 3} more</span>}
                                            </div>
                                        )}
                                    </div>
                                )}

                                <div className="space-y-3 mb-5">
                                    <div>
                                        <label className="block text-xs font-medium text-text-muted mb-1.5 uppercase tracking-wide">Event Date</label>
                                        <input type="date" value={bookingForm.eventDate} onChange={(e) => { setBookingForm({ ...bookingForm, eventDate: e.target.value }); resetAvailability(); }} min={new Date().toISOString().split('T')[0]} className="w-full px-3 py-2.5 bg-bg-secondary border border-border-default rounded-xl text-white text-sm outline-none focus:border-primary transition-all duration-300" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-text-muted mb-1.5 uppercase tracking-wide">Event Type</label>
                                        <select value={bookingForm.eventType} onChange={(e) => setBookingForm({ ...bookingForm, eventType: e.target.value })} className="w-full px-3 py-2.5 bg-bg-secondary border border-border-default rounded-xl text-white text-sm outline-none focus:border-primary transition-all duration-300 [&>option]:bg-bg-card">
                                            {(venue.occasions || ['wedding', 'reception', 'engagement', 'birthday', 'corporate']).map(o => <option key={o} value={o}>{o.charAt(0).toUpperCase() + o.slice(1)}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-text-muted mb-1.5 uppercase tracking-wide">Guest Count</label>
                                        <input type="number" value={bookingForm.guestCount} onChange={(e) => setBookingForm({ ...bookingForm, guestCount: e.target.value })} placeholder="No. of guests" min="1" className="w-full px-3 py-2.5 bg-bg-secondary border border-border-default rounded-xl text-white text-sm outline-none placeholder:text-text-muted focus:border-primary transition-all duration-300" />
                                    </div>
                                </div>

                                {/* Availability Status */}
                                {availability !== null && (
                                    <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium mb-4 ${availability ? 'bg-accent-emerald/10 border border-accent-emerald/20 text-accent-emerald' : 'bg-red-400/10 border border-red-400/20 text-red-400'}`}>
                                        {availability ? <><HiCheck /> Available on this date!</> : <><HiX /> Not available on this date</>}
                                    </div>
                                )}

                                <button onClick={handleCheckAvailability} disabled={checking} className="w-full inline-flex items-center justify-center gap-2 px-7 py-3 text-sm font-semibold rounded-xl bg-white/[0.06] border border-border-default text-text-secondary hover:text-white hover:border-border-light transition-all duration-300 mb-3 disabled:opacity-50">
                                    <HiCalendar /> {checking ? 'Checking...' : 'Check Availability'}
                                </button>
                                <button onClick={handleBookNow} disabled={bookingLoading} className="w-full inline-flex items-center justify-center gap-2 px-7 py-3.5 text-base font-semibold rounded-xl bg-gradient-to-r from-primary to-primary-light text-white shadow-[0_4px_15px_rgba(108,60,225,0.4)] hover:-translate-y-0.5 hover:shadow-[0_6px_25px_rgba(108,60,225,0.5)] transition-all duration-300 mb-4">
                                    <HiClipboardCheck /> Book Now
                                </button>

                                <div className="grid grid-cols-2 gap-2 mb-5">
                                    <button className="flex items-center justify-center gap-2 py-2.5 bg-white/[0.06] border border-border-default rounded-xl text-text-secondary text-sm font-medium hover:text-white hover:border-border-light transition-all duration-300"><HiPhone /> Call</button>
                                    <button className="flex items-center justify-center gap-2 py-2.5 bg-white/[0.06] border border-border-default rounded-xl text-text-secondary text-sm font-medium hover:text-white hover:border-border-light transition-all duration-300"><HiChat /> Chat</button>
                                </div>
                                <div className="space-y-2.5 pt-4 border-t border-border-default">
                                    {['Instant Confirmation', 'Free Cancellation', 'Best Price Guarantee'].map(t => (<div key={t} className="flex items-center gap-2 text-text-secondary text-xs"><HiCheck className="text-accent-emerald" /> {t}</div>))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />

            {/* Booking Confirmation Modal */}
            <AnimatePresence>
                {showBookingModal && (
                    <motion.div className="fixed inset-0 z-[100] flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => { if (!bookingLoading) { setShowBookingModal(false); setBookingSuccess(null); } }} />
                        <motion.div className="relative bg-bg-card border border-border-default rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-[0_16px_64px_rgba(0,0,0,0.5)]" initial={{ scale: 0.9, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 30 }}>
                            {!bookingSuccess ? (
                                <div className="p-6">
                                    <div className="flex items-center justify-between mb-6">
                                        <h3 className="text-xl font-bold text-white">Confirm Booking</h3>
                                        <button onClick={() => setShowBookingModal(false)} className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/[0.06] text-text-secondary hover:text-white transition-colors"><HiX /></button>
                                    </div>
                                    <div className="flex gap-3 mb-5 p-4 bg-white/[0.02] rounded-xl">
                                        <img src={venue.images?.[0]?.url || 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=200'} alt={venue.name} className="w-20 h-16 rounded-lg object-cover" />
                                        <div>
                                            <h4 className="text-sm font-semibold text-white">{venue.name}</h4>
                                            <p className="text-text-muted text-xs flex items-center gap-1"><HiLocationMarker /> {venue.area}, {venue.city}</p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3 mb-5 text-sm">
                                        <div className="bg-white/[0.02] rounded-xl p-3"><span className="text-text-muted text-xs block mb-1">Date</span><span className="text-white font-medium">{new Date(bookingForm.eventDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span></div>
                                        <div className="bg-white/[0.02] rounded-xl p-3"><span className="text-text-muted text-xs block mb-1">Event Type</span><span className="text-white font-medium capitalize">{bookingForm.eventType}</span></div>
                                        <div className="bg-white/[0.02] rounded-xl p-3"><span className="text-text-muted text-xs block mb-1">Guests</span><span className="text-white font-medium">{bookingForm.guestCount}</span></div>
                                        {selectedPackage !== null && venue.packages?.[selectedPackage] && <div className="bg-white/[0.02] rounded-xl p-3"><span className="text-text-muted text-xs block mb-1">Package</span><span className="text-white font-medium">{venue.packages[selectedPackage].name}</span></div>}
                                    </div>
                                    <div className="mb-4"><label className="block text-xs font-medium text-text-muted mb-1.5 uppercase tracking-wide">Special Notes (optional)</label><textarea value={bookingForm.specialNotes} onChange={(e) => setBookingForm({ ...bookingForm, specialNotes: e.target.value })} rows={2} placeholder="Any special requirements..." className="w-full px-3 py-2.5 bg-white/[0.03] border border-border-default rounded-xl text-white text-sm outline-none placeholder:text-text-muted focus:border-primary transition-all resize-none" /></div>
                                    {(() => {
                                        const p = calculatePricing(); return p ? (
                                            <div className="bg-white/[0.02] rounded-xl p-4 mb-5 space-y-2 text-sm">
                                                <div className="flex justify-between"><span className="text-text-secondary">Base Price</span><span className="text-white">₹{p.basePrice.toLocaleString('en-IN')}</span></div>
                                                <div className="flex justify-between"><span className="text-text-secondary">GST (18%)</span><span className="text-white">₹{p.tax.toLocaleString('en-IN')}</span></div>
                                                <div className="flex justify-between pt-2 border-t border-border-default font-semibold"><span className="text-white">Total</span><span className="text-primary-light">₹{p.totalAmount.toLocaleString('en-IN')}</span></div>
                                            </div>
                                        ) : null;
                                    })()}
                                    <button onClick={handleConfirmBooking} disabled={bookingLoading || paymentLoading} className="w-full py-3.5 text-base font-semibold rounded-xl bg-gradient-to-r from-primary to-primary-light text-white shadow-[0_4px_15px_rgba(108,60,225,0.4)] hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50">{bookingLoading || paymentLoading ? 'Processing...' : `Confirm Booking`}</button>
                                </div>
                            ) : (
                                <div className="p-8 text-center">
                                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-accent-emerald/15 flex items-center justify-center"><HiCheckCircle className="text-accent-emerald text-3xl" /></div>
                                    <h3 className="text-xl font-bold text-white mb-2">Booking Confirmed!</h3>
                                    <p className="text-text-secondary text-sm mb-1">Booking ID: <span className="text-primary-light font-semibold">{bookingSuccess.bookingId}</span></p>
                                    <p className="text-accent-emerald text-sm font-medium mb-1">✅ Your booking has been placed successfully</p>
                                    <p className="text-text-muted text-xs mb-6">Total Amount ₹{(bookingSuccess.pricing?.totalAmount || 0).toLocaleString('en-IN')} to be discussed or paid at the venue.</p>
                                    <div className="flex gap-3 justify-center flex-wrap">
                                        <Link to="/profile" className="px-6 py-2.5 bg-gradient-to-r from-primary to-primary-light text-white text-sm font-semibold rounded-xl hover:-translate-y-0.5 transition-all duration-300 shadow-[0_4px_15px_rgba(108,60,225,0.3)]">View My Bookings</Link>
                                        <button onClick={() => {
                                            const eventDate = new Date(bookingSuccess.eventDate);
                                            const startDate = eventDate.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
                                            const endDate = new Date(eventDate.getTime() + 12 * 60 * 60 * 1000).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
                                            const ics = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//EventBook//EN', 'BEGIN:VEVENT', `DTSTART:${startDate}`, `DTEND:${endDate}`, `SUMMARY:${bookingSuccess.eventType?.charAt(0).toUpperCase() + bookingSuccess.eventType?.slice(1)} at ${venue.name}`, `DESCRIPTION:Booking ID: ${bookingSuccess.bookingId}\\nGuests: ${bookingSuccess.guestCount}`, `LOCATION:${venue.address || venue.area + ', ' + venue.city}`, `STATUS:CONFIRMED`, 'BEGIN:VALARM', 'TRIGGER:-P1D', 'ACTION:DISPLAY', `DESCRIPTION:Your event is tomorrow!`, 'END:VALARM', 'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
                                            const blob = new Blob([ics], { type: 'text/calendar' });
                                            const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `${bookingSuccess.bookingId}.ics`; a.click();
                                        }} className="px-5 py-2.5 bg-white/[0.06] border border-border-default rounded-xl text-text-secondary text-sm font-medium hover:text-white transition-all flex items-center gap-1.5"><HiCalendar /> Add to Calendar</button>
                                        <button onClick={() => { setShowBookingModal(false); setBookingSuccess(null); setBookingForm({ eventDate: '', eventType: 'wedding', guestCount: '', specialNotes: '' }); resetAvailability(); setSelectedPackage(null); }} className="px-5 py-2.5 bg-white/[0.06] border border-border-default rounded-xl text-text-secondary text-sm font-medium hover:text-white transition-all">Close</button>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
