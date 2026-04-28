import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { HiCurrencyRupee, HiCheckCircle, HiXCircle, HiClock, HiDownload, HiCalendar } from 'react-icons/hi';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function PaymentHistory() {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBookings = async () => {
            try {
                const { data } = await axios.get(`${API_URL}/bookings/my`, { withCredentials: true });
                if (data.success) setBookings(data.bookings.filter(b => b.paymentStatus !== 'unpaid'));
            } catch (err) {
                console.error('Failed to fetch payments:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchBookings();
    }, []);

    const statusIcon = (status) => {
        if (status === 'advance-paid' || status === 'fully-paid') return <HiCheckCircle className="text-accent-emerald" />;
        if (status === 'refunded') return <HiXCircle className="text-red-400" />;
        return <HiClock className="text-accent-gold" />;
    };

    const statusLabel = (status) => {
        const map = { 'advance-paid': 'Advance Paid', 'fully-paid': 'Fully Paid', 'refunded': 'Refunded', 'unpaid': 'Unpaid' };
        return map[status] || status;
    };

    const statusColor = (status) => {
        if (status === 'advance-paid' || status === 'fully-paid') return 'text-accent-emerald bg-accent-emerald/10 border-accent-emerald/20';
        if (status === 'refunded') return 'text-red-400 bg-red-400/10 border-red-400/20';
        return 'text-accent-gold bg-accent-gold/10 border-accent-gold/20';
    };

    // Generate downloadable invoice
    const downloadInvoice = (booking) => {
        const venue = booking.venue;
        const invoiceHtml = `
<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Invoice - ${booking.bookingId}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333; padding: 40px; background: #fff; }
  .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; padding-bottom: 20px; border-bottom: 3px solid #6C3CE1; }
  .logo { font-size: 28px; font-weight: 800; color: #6C3CE1; }
  .logo span { color: #333; }
  .invoice-title { text-align: right; }
  .invoice-title h2 { font-size: 24px; color: #6C3CE1; margin-bottom: 4px; }
  .invoice-title p { font-size: 13px; color: #888; }
  .section { margin-bottom: 28px; }
  .section h3 { font-size: 14px; font-weight: 700; color: #6C3CE1; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 12px; }
  .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  .info-item { background: #f8f8ff; padding: 12px 16px; border-radius: 8px; }
  .info-item label { font-size: 11px; color: #999; text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 4px; }
  .info-item span { font-size: 14px; font-weight: 600; color: #333; }
  table { width: 100%; border-collapse: collapse; margin-top: 12px; }
  th { background: #6C3CE1; color: #fff; padding: 12px 16px; text-align: left; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; }
  th:last-child { text-align: right; }
  td { padding: 12px 16px; border-bottom: 1px solid #eee; font-size: 14px; }
  td:last-child { text-align: right; font-weight: 600; }
  .total-row td { border-top: 2px solid #6C3CE1; font-weight: 700; font-size: 16px; color: #6C3CE1; }
  .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; color: #999; font-size: 12px; }
  .badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; }
  .badge-success { background: #e8f5e9; color: #2e7d32; }
  .badge-pending { background: #fff3e0; color: #e65100; }
  @media print { body { padding: 20px; } }
</style></head>
<body>
  <div class="header">
    <div class="logo">Event<span>Book</span></div>
    <div class="invoice-title">
      <h2>INVOICE</h2>
      <p>${booking.bookingId}</p>
      <p>${new Date(booking.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
    </div>
  </div>

  <div class="section">
    <h3>Booking Details</h3>
    <div class="info-grid">
      <div class="info-item"><label>Venue</label><span>${venue?.name || 'N/A'}</span></div>
      <div class="info-item"><label>Location</label><span>${venue?.area || ''}, ${venue?.city || ''}</span></div>
      <div class="info-item"><label>Event Date</label><span>${new Date(booking.eventDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span></div>
      <div class="info-item"><label>Event Type</label><span style="text-transform:capitalize">${booking.eventType}</span></div>
      <div class="info-item"><label>Guest Count</label><span>${booking.guestCount} Guests</span></div>
      <div class="info-item"><label>Status</label><span class="badge ${booking.status === 'confirmed' ? 'badge-success' : 'badge-pending'}" style="text-transform:capitalize">${booking.status}</span></div>
    </div>
  </div>

  ${booking.packageSelected?.name ? `<div class="section"><h3>Package</h3><div class="info-grid"><div class="info-item"><label>Package Name</label><span>${booking.packageSelected.name}</span></div><div class="info-item"><label>Package Price</label><span>₹${(booking.packageSelected.price || 0).toLocaleString('en-IN')}</span></div></div></div>` : ''}

  <div class="section">
    <h3>Payment Summary</h3>
    <table>
      <thead><tr><th>Description</th><th>Amount</th></tr></thead>
      <tbody>
        <tr><td>Base Price</td><td>₹${(booking.pricing?.basePrice || 0).toLocaleString('en-IN')}</td></tr>
        ${booking.pricing?.addOnsTotal ? `<tr><td>Add-ons</td><td>₹${booking.pricing.addOnsTotal.toLocaleString('en-IN')}</td></tr>` : ''}
        <tr><td>GST (18%)</td><td>₹${(booking.pricing?.tax || 0).toLocaleString('en-IN')}</td></tr>
        <tr class="total-row"><td>Total Amount</td><td>₹${(booking.pricing?.totalAmount || 0).toLocaleString('en-IN')}</td></tr>
        <tr><td>Advance Paid (20%)</td><td style="color:#2e7d32">₹${(booking.pricing?.advanceAmount || 0).toLocaleString('en-IN')}</td></tr>
        <tr><td>Remaining Amount</td><td style="color:#e65100">₹${(booking.pricing?.remainingAmount || 0).toLocaleString('en-IN')}</td></tr>
      </tbody>
    </table>
  </div>

  <div class="footer">
    <p>This is a computer-generated invoice. No signature required.</p>
    <p style="margin-top:8px">EventBook • Event Venue Booking Platform</p>
  </div>
</body></html>`;

        const blob = new Blob([invoiceHtml], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const printWindow = window.open(url, '_blank');
        if (printWindow) {
            printWindow.onload = () => {
                printWindow.print();
            };
        }
    };

    // Generate .ics calendar file
    const addToCalendar = (booking) => {
        const venue = booking.venue;
        const eventDate = new Date(booking.eventDate);
        const startDate = eventDate.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
        const endDate = new Date(eventDate.getTime() + 12 * 60 * 60 * 1000).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

        const icsContent = [
            'BEGIN:VCALENDAR',
            'VERSION:2.0',
            'PRODID:-//EventBook//Event Booking//EN',
            'BEGIN:VEVENT',
            `DTSTART:${startDate}`,
            `DTEND:${endDate}`,
            `SUMMARY:${booking.eventType.charAt(0).toUpperCase() + booking.eventType.slice(1)} at ${venue?.name || 'Venue'}`,
            `DESCRIPTION:Booking ID: ${booking.bookingId}\\nGuests: ${booking.guestCount}\\nAdvance Paid: ₹${(booking.pricing?.advanceAmount || 0).toLocaleString('en-IN')}\\nRemaining: ₹${(booking.pricing?.remainingAmount || 0).toLocaleString('en-IN')}`,
            `LOCATION:${venue?.address || ''}, ${venue?.area || ''}, ${venue?.city || ''}`,
            `STATUS:CONFIRMED`,
            `BEGIN:VALARM`,
            `TRIGGER:-P1D`,
            `ACTION:DISPLAY`,
            `DESCRIPTION:Your event at ${venue?.name || 'venue'} is tomorrow!`,
            `END:VALARM`,
            'END:VEVENT',
            'END:VCALENDAR'
        ].join('\r\n');

        const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${booking.bookingId}-event.ics`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    if (loading) return (
        <div className="space-y-4">
            {[1, 2, 3].map(i => (
                <div key={i} className="bg-bg-card border border-border-default rounded-2xl p-5 animate-pulse">
                    <div className="flex gap-4"><div className="w-12 h-12 bg-white/[0.05] rounded-xl" /><div className="flex-1 space-y-2"><div className="h-4 bg-white/[0.05] rounded-lg w-1/3" /><div className="h-3 bg-white/[0.05] rounded-lg w-1/2" /></div></div>
                </div>
            ))}
        </div>
    );

    if (bookings.length === 0) return (
        <motion.div className="bg-bg-card border border-border-default rounded-2xl p-10 text-center" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="text-5xl mb-4">💳</div>
            <h3 className="text-xl font-bold text-white mb-2">No Payment History</h3>
            <p className="text-text-secondary text-sm">Your payment transactions will appear here once you book a venue.</p>
        </motion.div>
    );

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <p className="text-text-muted text-sm mb-4">{bookings.length} transaction{bookings.length > 1 ? 's' : ''}</p>
            <div className="space-y-4">
                {bookings.map((booking, i) => {
                    const venue = booking.venue;
                    return (
                        <motion.div key={booking._id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                            className="bg-bg-card border border-border-default rounded-2xl overflow-hidden hover:border-border-light transition-all duration-300">
                            <div className="p-5">
                                {/* Header */}
                                <div className="flex items-start justify-between mb-4 gap-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                                            <HiCurrencyRupee className="text-primary-light text-lg" />
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-semibold text-white">{venue?.name || 'Venue'}</h4>
                                            <p className="text-text-muted text-xs">{booking.bookingId} • {new Date(booking.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                                        </div>
                                    </div>
                                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${statusColor(booking.paymentStatus)}`}>
                                        {statusIcon(booking.paymentStatus)}
                                        {statusLabel(booking.paymentStatus)}
                                    </span>
                                </div>

                                {/* Details Grid */}
                                <div className="grid grid-cols-2 max-sm:grid-cols-1 gap-3 mb-4">
                                    <div className="bg-white/[0.02] rounded-xl p-3">
                                        <span className="text-text-muted text-[0.65rem] uppercase tracking-wider block mb-1">Event Date</span>
                                        <span className="text-white text-sm font-medium">{new Date(booking.eventDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                    </div>
                                    <div className="bg-white/[0.02] rounded-xl p-3">
                                        <span className="text-text-muted text-[0.65rem] uppercase tracking-wider block mb-1">Event Type</span>
                                        <span className="text-white text-sm font-medium capitalize">{booking.eventType}</span>
                                    </div>
                                </div>

                                {/* Price Breakdown */}
                                <div className="bg-white/[0.02] rounded-xl p-4 space-y-2 text-sm mb-4">
                                    <div className="flex justify-between"><span className="text-text-secondary">Base Price</span><span className="text-white">₹{(booking.pricing?.basePrice || 0).toLocaleString('en-IN')}</span></div>
                                    <div className="flex justify-between"><span className="text-text-secondary">GST</span><span className="text-white">₹{(booking.pricing?.tax || 0).toLocaleString('en-IN')}</span></div>
                                    <div className="flex justify-between pt-2 border-t border-border-default"><span className="text-white font-semibold">Total</span><span className="text-primary-light font-semibold">₹{(booking.pricing?.totalAmount || 0).toLocaleString('en-IN')}</span></div>
                                    <div className="flex justify-between"><span className="text-text-muted text-xs">Advance Paid</span><span className="text-accent-emerald text-xs font-medium">₹{(booking.pricing?.advanceAmount || 0).toLocaleString('en-IN')}</span></div>
                                    <div className="flex justify-between"><span className="text-text-muted text-xs">Remaining</span><span className="text-accent-gold text-xs font-medium">₹{(booking.pricing?.remainingAmount || 0).toLocaleString('en-IN')}</span></div>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-2 flex-wrap">
                                    <button onClick={() => downloadInvoice(booking)} className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-primary to-primary-light text-white text-xs font-semibold rounded-xl hover:-translate-y-0.5 transition-all duration-300 shadow-[0_4px_12px_rgba(108,60,225,0.3)]">
                                        <HiDownload /> Download Invoice
                                    </button>
                                    {booking.status !== 'cancelled' && (
                                        <button onClick={() => addToCalendar(booking)} className="inline-flex items-center gap-1.5 px-4 py-2 bg-white/[0.06] border border-border-default rounded-xl text-text-secondary text-xs font-medium hover:text-white hover:border-border-light transition-all duration-300">
                                            <HiCalendar /> Add to Calendar
                                        </button>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </motion.div>
    );
}
