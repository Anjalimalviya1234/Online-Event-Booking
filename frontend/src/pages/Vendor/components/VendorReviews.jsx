import { motion } from 'framer-motion';
import { HiStar } from 'react-icons/hi';

export default function VendorReviews({ reviews, reviewsLoading, avgRating, ratingDistribution }) {
    return (
        <motion.div className="space-y-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <div className="grid grid-cols-[1fr_2fr] max-lg:grid-cols-1 gap-6">
                {/* Rating Summary */}
                <div className="bg-bg-card border border-border-default rounded-2xl p-6 flex flex-col items-center justify-center">
                    <span className="text-5xl font-extrabold text-white mb-1">{avgRating}</span>
                    <div className="flex items-center gap-1 mb-2">
                        {[1, 2, 3, 4, 5].map(star => (
                            <HiStar key={star} className={`text-lg ${star <= Math.round(avgRating) ? 'text-accent-gold' : 'text-white/10'}`} />
                        ))}
                    </div>
                    <p className="text-text-muted text-sm">{reviews.length} total reviews</p>

                    <div className="w-full mt-6 space-y-2">
                        {ratingDistribution.map(({ star, count, percentage }) => (
                            <div key={star} className="flex items-center gap-2">
                                <span className="text-text-muted text-xs w-3">{star}</span>
                                <HiStar className="text-accent-gold text-xs" />
                                <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                                    <div className="h-full bg-accent-gold rounded-full transition-all duration-500" style={{ width: `${percentage}%` }} />
                                </div>
                                <span className="text-text-muted text-xs w-8 text-right">{count}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Reviews List */}
                <div className="bg-bg-card border border-border-default rounded-2xl">
                    <div className="p-5 border-b border-border-default">
                        <h2 className="text-lg font-semibold text-white">All Reviews</h2>
                    </div>
                    <div className="p-5 space-y-4 max-h-[500px] overflow-y-auto">
                        {reviewsLoading ? (
                            <p className="text-text-muted text-center py-4">Loading reviews...</p>
                        ) : reviews.length > 0 ? reviews.map(review => (
                            <div key={review._id} className="p-4 bg-white/[0.02] border border-border-default rounded-xl">
                                <div className="flex items-start justify-between mb-2">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-full bg-primary/15 text-primary-light flex items-center justify-center font-bold text-sm">
                                            {review.user?.avatar ? (
                                                <img src={review.user.avatar} alt={review.user.name} className="w-full h-full object-cover rounded-full" />
                                            ) : (
                                                review.user?.name?.charAt(0).toUpperCase() || 'U'
                                            )}
                                        </div>
                                        <div>
                                            <p className="text-white text-sm font-medium">{review.user?.name}</p>
                                            <p className="text-text-muted text-xs">{review.venue?.name} • {new Date(review.createdAt).toLocaleDateString('en-IN')}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        {[1, 2, 3, 4, 5].map(star => (
                                            <HiStar key={star} className={`text-sm ${star <= review.rating ? 'text-accent-gold' : 'text-white/10'}`} />
                                        ))}
                                    </div>
                                </div>
                                {review.title && <h4 className="text-white text-sm font-semibold mt-2">{review.title}</h4>}
                                {review.comment && <p className="text-text-secondary text-sm mt-1 leading-relaxed">{review.comment}</p>}
                                {review.eventType && (
                                    <span className="inline-block mt-2 px-2.5 py-0.5 bg-primary/10 text-primary-light border border-primary/20 rounded-full text-[0.65rem] capitalize">{review.eventType}</span>
                                )}
                            </div>
                        )) : (
                            <div className="text-center py-8">
                                <HiStar className="text-4xl text-white/10 mx-auto mb-3" />
                                <p className="text-text-muted">No reviews yet.</p>
                                <p className="text-text-muted text-xs mt-1">Reviews will appear here once customers review your venues.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
