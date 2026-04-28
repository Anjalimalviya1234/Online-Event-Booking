const nodemailer = require('nodemailer');

// Create reusable transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Verify connection on startup
transporter.verify()
  .then(() => console.log('📧 Email service ready'))
  .catch((err) => console.error('❌ Email service error:', err.message));

// ─── Base HTML wrapper ───────────────────────────────────────────
const wrapHtml = (title, body) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background:#0A0A0F;font-family:'Segoe UI',Arial,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:32px 16px;">
    <!-- Header -->
    <div style="text-align:center;padding:24px 0;">
      <div style="display:inline-block;background:linear-gradient(135deg,#6C3CE1,#8B5CF6);padding:12px 16px;border-radius:12px;">
        <span style="color:#fff;font-size:22px;font-weight:800;letter-spacing:-0.5px;">Event<span style="opacity:0.9;">Book</span></span>
      </div>
    </div>
    
    <!-- Card -->
    <div style="background:#1A1A2E;border:1px solid rgba(255,255,255,0.08);border-radius:16px;padding:32px;margin-bottom:24px;">
      ${body}
    </div>
    
    <!-- Footer -->
    <div style="text-align:center;padding:16px 0;">
      <p style="margin:0;color:#6B6B82;font-size:12px;">
        © ${new Date().getFullYear()} EventBook Platform. All rights reserved.
      </p>
      <p style="margin:4px 0 0;color:#6B6B82;font-size:11px;">
        This is an automated email. Please do not reply directly.
      </p>
    </div>
  </div>
</body>
</html>
`;

// ─── Helper: info row ────────────────────────────────────────────
const infoRow = (label, value) => `
  <tr>
    <td style="padding:8px 12px;color:#A0A0B8;font-size:13px;font-weight:600;white-space:nowrap;border-bottom:1px solid rgba(255,255,255,0.05);">${label}</td>
    <td style="padding:8px 12px;color:#FFFFFF;font-size:13px;border-bottom:1px solid rgba(255,255,255,0.05);">${value}</td>
  </tr>
`;

// ─── Helper: badge ───────────────────────────────────────────────
const badge = (text, bgColor = '#6C3CE1') => `
  <span style="display:inline-block;background:${bgColor};color:#fff;padding:4px 12px;border-radius:20px;font-size:11px;font-weight:700;letter-spacing:0.5px;text-transform:uppercase;">${text}</span>
`;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  OTP Email
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
exports.sendOtpEmail = async (email, otp) => {
  try {
    const body = `
      <div style="margin-bottom:24px;">
        <div style="margin-bottom:8px;">${badge('Verification', '#6C3CE1')}</div>
        <h1 style="margin:8px 0 4px;color:#FFFFFF;font-size:22px;font-weight:700;">Verify Your Email 📧</h1>
        <p style="margin:0;color:#A0A0B8;font-size:14px;">Use the code below to verify your email address and complete your registration.</p>
      </div>
      
      <div style="text-align:center;padding:28px 20px;background:linear-gradient(135deg,rgba(108,60,225,0.15),rgba(139,92,246,0.1));border:1px solid rgba(108,60,225,0.3);border-radius:16px;margin-bottom:24px;">
        <p style="margin:0 0 8px;color:#A0A0B8;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:2px;">Your Verification Code</p>
        <p style="margin:0;color:#FFFFFF;font-size:36px;font-weight:800;letter-spacing:8px;font-family:monospace;">${otp}</p>
      </div>
      
      <div style="background:rgba(245,166,35,0.08);border:1px solid rgba(245,166,35,0.2);border-radius:12px;padding:16px;text-align:center;">
        <p style="margin:0;color:#F5A623;font-size:13px;font-weight:600;">⏳ This code expires in 5 minutes</p>
        <p style="margin:4px 0 0;color:#A0A0B8;font-size:12px;">If you didn't request this, please ignore this email.</p>
      </div>
    `;

    await transporter.sendMail({
      from: `"EventBook Platform" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `🔐 Your Verification Code: ${otp}`,
      html: wrapHtml('Email Verification', body),
    });

    console.log(`📧 OTP email sent to ${email}`);
  } catch (error) {
    console.error('❌ Failed to send OTP email:', error.message);
    throw error;
  }
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  1. NEW BOOKING → Email to Admin
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
exports.sendNewBookingEmailToAdmin = async (booking) => {
  try {
    const venueName = booking.venue?.name || 'N/A';
    const venueCity = booking.venue?.city || '';
    const userName = booking.user?.name || 'N/A';
    const userEmail = booking.user?.email || 'N/A';
    const userMobile = booking.user?.mobile || 'N/A';
    const eventDate = new Date(booking.eventDate).toLocaleDateString('en-IN', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });

    const body = `
      <!-- Title -->
      <div style="margin-bottom:24px;">
        <div style="margin-bottom:8px;">${badge('New Booking', '#10B981')}</div>
        <h1 style="margin:8px 0 4px;color:#FFFFFF;font-size:22px;font-weight:700;">New Booking Received! 🎉</h1>
        <p style="margin:0;color:#A0A0B8;font-size:14px;">A new booking has been placed on the platform.</p>
      </div>
      
      <!-- Booking Details -->
      <div style="background:rgba(108,60,225,0.08);border:1px solid rgba(108,60,225,0.2);border-radius:12px;padding:4px;margin-bottom:20px;">
        <table style="width:100%;border-collapse:collapse;">
          ${infoRow('Booking ID', `<strong>${booking.bookingId || 'N/A'}</strong>`)}
          ${infoRow('Venue', `${venueName}, ${venueCity}`)}
          ${infoRow('Event Type', booking.eventType || 'N/A')}
          ${infoRow('Event Date', eventDate)}
          ${infoRow('Event Time', booking.eventTime || 'N/A')}
          ${infoRow('Guests', booking.guestCount || 'N/A')}
        </table>
      </div>
      
      <!-- Customer Details -->
      <div style="background:rgba(16,185,129,0.08);border:1px solid rgba(16,185,129,0.2);border-radius:12px;padding:4px;margin-bottom:20px;">
        <table style="width:100%;border-collapse:collapse;">
          ${infoRow('Customer', userName)}
          ${infoRow('Email', userEmail)}
          ${infoRow('Mobile', userMobile)}
        </table>
      </div>
      
      <!-- Pricing -->
      <div style="background:rgba(245,166,35,0.08);border:1px solid rgba(245,166,35,0.2);border-radius:12px;padding:4px;">
        <table style="width:100%;border-collapse:collapse;">
          ${infoRow('Base Price', `₹${booking.pricing?.basePrice?.toLocaleString('en-IN') || 0}`)}
          ${infoRow('Add-ons', `₹${booking.pricing?.addOnsTotal?.toLocaleString('en-IN') || 0}`)}
          ${infoRow('Tax (18%)', `₹${booking.pricing?.tax?.toLocaleString('en-IN') || 0}`)}
          ${infoRow('Total Amount', `<strong style="color:#F5A623;">₹${booking.pricing?.totalAmount?.toLocaleString('en-IN') || 0}</strong>`)}
          ${infoRow('Advance (20%)', `<strong style="color:#10B981;">₹${booking.pricing?.advanceAmount?.toLocaleString('en-IN') || 0}</strong>`)}
        </table>
      </div>
      
      ${booking.specialNotes ? `
      <div style="margin-top:20px;padding:12px 16px;background:rgba(255,255,255,0.04);border-radius:8px;border-left:3px solid #8B5CF6;">
        <p style="margin:0 0 4px;color:#A0A0B8;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Special Notes</p>
        <p style="margin:0;color:#FFFFFF;font-size:13px;">${booking.specialNotes}</p>
      </div>
      ` : ''}
    `;

    await transporter.sendMail({
      from: `"EventBook Platform" <${process.env.EMAIL_USER}>`,
      to: process.env.ADMIN_EMAIL,
      subject: `🎉 New Booking: ${venueName} | ${booking.bookingId}`,
      html: wrapHtml('New Booking Notification', body),
    });

    console.log(`📧 New booking email sent to admin for ${booking.bookingId}`);
  } catch (error) {
    console.error('❌ Failed to send new booking email:', error.message);
  }
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  2. NEW VENUE REGISTERED → Email to Admin
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
exports.sendNewVenueEmailToAdmin = async (venue, vendor) => {
  try {
    const body = `
      <!-- Title -->
      <div style="margin-bottom:24px;">
        <div style="margin-bottom:8px;">${badge('New Venue', '#F5A623')}</div>
        <h1 style="margin:8px 0 4px;color:#FFFFFF;font-size:22px;font-weight:700;">New Venue Registered! 🏛️</h1>
        <p style="margin:0;color:#A0A0B8;font-size:14px;">A vendor has submitted a new venue for approval.</p>
      </div>
      
      <!-- Venue Details -->
      <div style="background:rgba(108,60,225,0.08);border:1px solid rgba(108,60,225,0.2);border-radius:12px;padding:4px;margin-bottom:20px;">
        <table style="width:100%;border-collapse:collapse;">
          ${infoRow('Venue Name', `<strong>${venue.name}</strong>`)}
          ${infoRow('Type', venue.venueType || 'N/A')}
          ${infoRow('City', venue.city || 'N/A')}
          ${infoRow('Area', venue.area || 'N/A')}
          ${infoRow('Address', venue.address || 'N/A')}
          ${infoRow('Capacity', `${venue.capacity?.min || 0} - ${venue.capacity?.max || 0} guests`)}
          ${infoRow('Starting Price', `<strong style="color:#F5A623;">₹${venue.startingPrice?.toLocaleString('en-IN') || 0}</strong>`)}
        </table>
      </div>
      
      <!-- Vendor Info -->
      <div style="background:rgba(6,182,212,0.08);border:1px solid rgba(6,182,212,0.2);border-radius:12px;padding:4px;margin-bottom:20px;">
        <table style="width:100%;border-collapse:collapse;">
          ${infoRow('Vendor Name', vendor?.name || 'N/A')}
          ${infoRow('Vendor Email', vendor?.email || 'N/A')}
          ${infoRow('Vendor Mobile', vendor?.mobile || 'N/A')}
        </table>
      </div>
      
      <!-- Action Note -->
      <div style="text-align:center;padding:20px 0 0;">
        <p style="margin:0;color:#A0A0B8;font-size:13px;">
          ⚡ Please review this venue in the <strong style="color:#8B5CF6;">Admin Dashboard</strong> and approve or reject it.
        </p>
      </div>
    `;

    await transporter.sendMail({
      from: `"EventBook Platform" <${process.env.EMAIL_USER}>`,
      to: process.env.ADMIN_EMAIL,
      subject: `🏛️ New Venue for Approval: ${venue.name} | ${venue.city}`,
      html: wrapHtml('New Venue Registration', body),
    });

    console.log(`📧 New venue email sent to admin for "${venue.name}"`);
  } catch (error) {
    console.error('❌ Failed to send new venue email:', error.message);
  }
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  3. VENUE APPROVED/REJECTED → Email to Vendor
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
exports.sendVenueStatusEmailToVendor = async (venue, vendorEmail, isApproved, rejectionReason) => {
  try {
    const statusColor = isApproved ? '#10B981' : '#FF6B6B';
    const statusText = isApproved ? 'Approved' : 'Rejected';
    const statusEmoji = isApproved ? '✅' : '❌';

    const body = `
      <!-- Title -->
      <div style="margin-bottom:24px;">
        <div style="margin-bottom:8px;">${badge(statusText, statusColor)}</div>
        <h1 style="margin:8px 0 4px;color:#FFFFFF;font-size:22px;font-weight:700;">
          Venue ${statusText}! ${statusEmoji}
        </h1>
        <p style="margin:0;color:#A0A0B8;font-size:14px;">
          ${isApproved
        ? 'Great news! Your venue has been approved and is now live on EventBook.'
        : 'Unfortunately, your venue submission has been rejected.'}
        </p>
      </div>
      
      <!-- Venue Details -->
      <div style="background:rgba(108,60,225,0.08);border:1px solid rgba(108,60,225,0.2);border-radius:12px;padding:4px;margin-bottom:20px;">
        <table style="width:100%;border-collapse:collapse;">
          ${infoRow('Venue Name', `<strong>${venue.name}</strong>`)}
          ${infoRow('Type', venue.venueType || 'N/A')}
          ${infoRow('City', venue.city || 'N/A')}
          ${infoRow('Area', venue.area || 'N/A')}
          ${infoRow('Status', `<span style="color:${statusColor};font-weight:700;">${statusText}</span>`)}
        </table>
      </div>
      
      ${isApproved ? `
      <!-- Approved Message -->
      <div style="background:rgba(16,185,129,0.1);border:1px solid rgba(16,185,129,0.25);border-radius:12px;padding:20px;text-align:center;">
        <p style="margin:0 0 8px;font-size:32px;">🎊</p>
        <p style="margin:0 0 4px;color:#FFFFFF;font-size:16px;font-weight:700;">Congratulations!</p>
        <p style="margin:0;color:#A0A0B8;font-size:13px;">
          Your venue is now visible to thousands of users. You can manage bookings from your <strong style="color:#10B981;">Vendor Dashboard</strong>.
        </p>
      </div>
      ` : `
      <!-- Rejection Reason -->
      <div style="background:rgba(255,107,107,0.08);border:1px solid rgba(255,107,107,0.2);border-radius:12px;padding:20px;">
        <p style="margin:0 0 8px;color:#FF6B6B;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;">Reason for Rejection</p>
        <p style="margin:0;color:#FFFFFF;font-size:14px;">${rejectionReason || 'No specific reason provided. Please contact support for more details.'}</p>
      </div>
      <div style="margin-top:16px;padding:12px 16px;background:rgba(255,255,255,0.04);border-radius:8px;">
        <p style="margin:0;color:#A0A0B8;font-size:13px;">
          💡 You can update your venue details and resubmit for approval from your Vendor Dashboard.
        </p>
      </div>
      `}
    `;

    await transporter.sendMail({
      from: `"EventBook Platform" <${process.env.EMAIL_USER}>`,
      to: vendorEmail,
      subject: `${statusEmoji} Your Venue "${venue.name}" has been ${statusText}`,
      html: wrapHtml(`Venue ${statusText}`, body),
    });

    console.log(`📧 Venue ${statusText.toLowerCase()} email sent to ${vendorEmail} for "${venue.name}"`);
  } catch (error) {
    console.error('❌ Failed to send venue status email:', error.message);
  }
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  4. BOOKING CONFIRMATION → Email to User
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
exports.sendBookingConfirmationToUser = async (booking) => {
  try {
    const userEmail = booking.user?.email;
    if (!userEmail) return;

    const venueName = booking.venue?.name || 'N/A';
    const venueCity = booking.venue?.city || '';
    const venueArea = booking.venue?.area || '';
    const eventDate = new Date(booking.eventDate).toLocaleDateString('en-IN', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });

    const body = `
      <!-- Title -->
      <div style="margin-bottom:24px;">
        <div style="margin-bottom:8px;">${badge('Booking Confirmed', '#10B981')}</div>
        <h1 style="margin:8px 0 4px;color:#FFFFFF;font-size:22px;font-weight:700;">Your Booking is Confirmed! 🎉</h1>
        <p style="margin:0;color:#A0A0B8;font-size:14px;">
          Hi <strong style="color:#fff;">${booking.user?.name || 'there'}</strong>, your venue booking has been successfully placed.
        </p>
      </div>
      
      <!-- Booking ID Highlight -->
      <div style="text-align:center;padding:20px;background:linear-gradient(135deg,rgba(108,60,225,0.15),rgba(139,92,246,0.1));border:1px solid rgba(108,60,225,0.3);border-radius:12px;margin-bottom:20px;">
        <p style="margin:0 0 4px;color:#A0A0B8;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:1px;">Booking ID</p>
        <p style="margin:0;color:#8B5CF6;font-size:24px;font-weight:800;letter-spacing:1px;">${booking.bookingId || 'N/A'}</p>
      </div>
      
      <!-- Venue & Event Details -->
      <div style="background:rgba(108,60,225,0.08);border:1px solid rgba(108,60,225,0.2);border-radius:12px;padding:4px;margin-bottom:20px;">
        <table style="width:100%;border-collapse:collapse;">
          ${infoRow('Venue', `<strong>${venueName}</strong>`)}
          ${infoRow('Location', `${venueArea}, ${venueCity}`)}
          ${infoRow('Event Type', booking.eventType || 'N/A')}
          ${infoRow('Event Date', `<strong style="color:#8B5CF6;">${eventDate}</strong>`)}
          ${infoRow('Event Time', booking.eventTime || 'N/A')}
          ${infoRow('Guests', booking.guestCount || 'N/A')}
        </table>
      </div>
      
      ${booking.packageSelected?.name ? `
      <div style="background:rgba(6,182,212,0.08);border:1px solid rgba(6,182,212,0.2);border-radius:12px;padding:4px;margin-bottom:20px;">
        <table style="width:100%;border-collapse:collapse;">
          ${infoRow('Package', `<strong>${booking.packageSelected.name}</strong>`)}
          ${infoRow('Package Price', '₹' + (booking.packageSelected.price?.toLocaleString('en-IN') || 0))}
        </table>
      </div>
      ` : ''}
      
      <!-- Pricing -->
      <div style="background:rgba(245,166,35,0.08);border:1px solid rgba(245,166,35,0.2);border-radius:12px;padding:4px;margin-bottom:20px;">
        <table style="width:100%;border-collapse:collapse;">
          ${infoRow('Base Price', '₹' + (booking.pricing?.basePrice?.toLocaleString('en-IN') || 0))}
          ${booking.pricing?.addOnsTotal ? infoRow('Add-ons', '₹' + booking.pricing.addOnsTotal.toLocaleString('en-IN')) : ''}
          ${infoRow('Tax (GST 18%)', '₹' + (booking.pricing?.tax?.toLocaleString('en-IN') || 0))}
          ${infoRow('Total Amount', `<strong style="color:#F5A623;font-size:15px;">₹${booking.pricing?.totalAmount?.toLocaleString('en-IN') || 0}</strong>`)}
          ${infoRow('Advance to Pay (20%)', `<strong style="color:#10B981;font-size:15px;">₹${booking.pricing?.advanceAmount?.toLocaleString('en-IN') || 0}</strong>`)}
          ${infoRow('Remaining (at venue)', '₹' + (booking.pricing?.remainingAmount?.toLocaleString('en-IN') || 0))}
        </table>
      </div>
      
      ${booking.specialNotes ? `
      <div style="padding:12px 16px;background:rgba(255,255,255,0.04);border-radius:8px;border-left:3px solid #8B5CF6;margin-bottom:20px;">
        <p style="margin:0 0 4px;color:#A0A0B8;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Your Special Notes</p>
        <p style="margin:0;color:#FFFFFF;font-size:13px;">${booking.specialNotes}</p>
      </div>
      ` : ''}
      
      <!-- Next Steps -->
      <div style="background:rgba(16,185,129,0.08);border:1px solid rgba(16,185,129,0.2);border-radius:12px;padding:20px;">
        <p style="margin:0 0 12px;color:#10B981;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;">📋 Next Steps</p>
        <div style="color:#A0A0B8;font-size:13px;line-height:1.8;">
          <p style="margin:0;">1️⃣ Pay the advance amount of <strong style="color:#fff;">₹${booking.pricing?.advanceAmount?.toLocaleString('en-IN') || 0}</strong> to confirm your booking.</p>
          <p style="margin:0;">2️⃣ The venue will confirm your booking once the advance is received.</p>
          <p style="margin:0;">3️⃣ Pay the remaining amount at the venue on your event date.</p>
        </div>
      </div>
    `;

    await transporter.sendMail({
      from: `"EventBook Platform" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: `🎉 Booking Confirmed: ${venueName} | ${booking.bookingId}`,
      html: wrapHtml('Booking Confirmation', body),
    });

    console.log(`📧 Booking confirmation email sent to ${userEmail} for ${booking.bookingId}`);
  } catch (error) {
    console.error('❌ Failed to send booking confirmation email:', error.message);
  }
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  5. BOOKING STATUS UPDATE (Confirm/Cancel) → Email to User
//     Triggered from Vendor Dashboard
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
exports.sendBookingStatusUpdateToUser = async (booking, newStatus, reason) => {
  try {
    const userEmail = booking.user?.email;
    if (!userEmail) return;

    const venueName = booking.venue?.name || 'N/A';
    const venueCity = booking.venue?.city || '';
    const eventDate = new Date(booking.eventDate).toLocaleDateString('en-IN', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });

    const statusMap = {
      confirmed: { color: '#10B981', emoji: '✅', label: 'Confirmed', title: 'Booking Confirmed!', desc: 'Great news! The venue has confirmed your booking.' },
      cancelled: { color: '#FF6B6B', emoji: '❌', label: 'Cancelled', title: 'Booking Cancelled', desc: 'Unfortunately, your booking has been cancelled by the venue.' },
      completed: { color: '#06B6D4', emoji: '🎊', label: 'Completed', title: 'Booking Completed!', desc: 'Your event has been marked as completed. We hope you had a great time!' },
    };

    const s = statusMap[newStatus] || { color: '#F5A623', emoji: '📋', label: newStatus, title: `Booking ${newStatus}`, desc: `Your booking status has been updated to ${newStatus}.` };

    const body = `
      <!-- Title -->
      <div style="margin-bottom:24px;">
        <div style="margin-bottom:8px;">${badge(s.label, s.color)}</div>
        <h1 style="margin:8px 0 4px;color:#FFFFFF;font-size:22px;font-weight:700;">${s.title} ${s.emoji}</h1>
        <p style="margin:0;color:#A0A0B8;font-size:14px;">
          Hi <strong style="color:#fff;">${booking.user?.name || 'there'}</strong>, ${s.desc}
        </p>
      </div>
      
      <!-- Booking Details -->
      <div style="background:rgba(108,60,225,0.08);border:1px solid rgba(108,60,225,0.2);border-radius:12px;padding:4px;margin-bottom:20px;">
        <table style="width:100%;border-collapse:collapse;">
          ${infoRow('Booking ID', `<strong>${booking.bookingId || 'N/A'}</strong>`)}
          ${infoRow('Venue', `${venueName}, ${venueCity}`)}
          ${infoRow('Event Date', eventDate)}
          ${infoRow('Event Type', booking.eventType || 'N/A')}
          ${infoRow('Guests', booking.guestCount || 'N/A')}
          ${infoRow('Status', `<span style="color:${s.color};font-weight:700;font-size:14px;">${s.label}</span>`)}
        </table>
      </div>
      
      <!-- Pricing Recap -->
      <div style="background:rgba(245,166,35,0.08);border:1px solid rgba(245,166,35,0.2);border-radius:12px;padding:4px;margin-bottom:20px;">
        <table style="width:100%;border-collapse:collapse;">
          ${infoRow('Total Amount', `<strong style="color:#F5A623;">₹${booking.pricing?.totalAmount?.toLocaleString('en-IN') || 0}</strong>`)}
          ${infoRow('Advance', '₹' + (booking.pricing?.advanceAmount?.toLocaleString('en-IN') || 0))}
          ${infoRow('Remaining', '₹' + (booking.pricing?.remainingAmount?.toLocaleString('en-IN') || 0))}
        </table>
      </div>
      
      ${newStatus === 'cancelled' && reason ? `
      <!-- Cancellation Reason -->
      <div style="background:rgba(255,107,107,0.08);border:1px solid rgba(255,107,107,0.2);border-radius:12px;padding:20px;margin-bottom:20px;">
        <p style="margin:0 0 8px;color:#FF6B6B;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;">Reason for Cancellation</p>
        <p style="margin:0;color:#FFFFFF;font-size:14px;">${reason}</p>
      </div>
      ${booking.razorpayPaymentId ? `
      <div style="background:rgba(16,185,129,0.08);border:1px solid rgba(16,185,129,0.2);border-radius:12px;padding:16px;">
        <p style="margin:0;color:#10B981;font-size:13px;">
          💰 <strong>Refund Initiated:</strong> Your advance payment will be refunded within 5-7 business days.
        </p>
      </div>
      ` : ''}
      ` : ''}
      
      ${newStatus === 'confirmed' ? `
      <!-- Confirmed Message -->
      <div style="background:rgba(16,185,129,0.1);border:1px solid rgba(16,185,129,0.25);border-radius:12px;padding:20px;text-align:center;">
        <p style="margin:0 0 8px;font-size:32px;">🎊</p>
        <p style="margin:0 0 4px;color:#FFFFFF;font-size:16px;font-weight:700;">You're all set!</p>
        <p style="margin:0;color:#A0A0B8;font-size:13px;">
          Your booking has been confirmed by the venue. Please arrive on time and pay the remaining amount of <strong style="color:#10B981;">₹${booking.pricing?.remainingAmount?.toLocaleString('en-IN') || 0}</strong> at the venue.
        </p>
      </div>
      ` : ''}
      
      ${newStatus === 'completed' ? `
      <div style="background:rgba(6,182,212,0.1);border:1px solid rgba(6,182,212,0.25);border-radius:12px;padding:20px;text-align:center;">
        <p style="margin:0 0 8px;font-size:32px;">⭐</p>
        <p style="margin:0 0 4px;color:#FFFFFF;font-size:16px;font-weight:700;">Thank you for choosing EventBook!</p>
        <p style="margin:0;color:#A0A0B8;font-size:13px;">
          We hope your event was a success. Please leave a review to help other users!
        </p>
      </div>
      ` : ''}
    `;

    await transporter.sendMail({
      from: `"EventBook Platform" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: `${s.emoji} Booking ${s.label}: ${venueName} | ${booking.bookingId}`,
      html: wrapHtml(`Booking ${s.label}`, body),
    });

    console.log(`📧 Booking ${s.label.toLowerCase()} email sent to ${userEmail} for ${booking.bookingId}`);
  } catch (error) {
    console.error('❌ Failed to send booking status email:', error.message);
  }
};
