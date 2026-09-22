import nodemailer from "nodemailer";

// ── Gmail transporter ──────────────────────────────────────────────────────────
// Uses an App Password (not your real Gmail password).
// Generate one at: https://myaccount.google.com/apppasswords
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,   // your Gmail address
    pass: process.env.EMAIL_PASS,   // your Gmail App Password (16 chars)
  },
});

/**
 * Sends a cancellation notification email.
 *
 * @param {object} opts
 * @param {string} opts.toEmail        – recipient email address
 * @param {string} opts.toName         – recipient display name
 * @param {string} opts.cancelledBy    – "doctor" | "patient"
 * @param {string} opts.patientName    – patient's name
 * @param {string} opts.doctorName     – doctor's name
 * @param {string} opts.date           – appointment date string
 * @param {string} opts.time           – appointment time string
 */
export const sendCancellationEmail = async ({
  toEmail,
  toName,
  cancelledBy,
  patientName,
  doctorName,
  date,
  time,
}) => {
  const cancellerLabel = cancelledBy === "doctor" ? `Dr. ${doctorName}` : patientName;
  const subjectPerson  = cancelledBy === "doctor" ? "Doctor" : "Patient";

  const subject = `Appointment Cancelled by ${subjectPerson} — ${date} at ${time}`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <style>
    body { font-family: 'Segoe UI', Arial, sans-serif; background: #f0f4f8; margin: 0; padding: 0; }
    .wrapper { max-width: 560px; margin: 40px auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
    .header { background: linear-gradient(135deg, #0f4c5c 0%, #35838D 100%); padding: 32px 40px; }
    .header h1 { color: #ffffff; margin: 0; font-size: 22px; letter-spacing: -0.5px; }
    .header p  { color: rgba(255,255,255,0.75); margin: 6px 0 0; font-size: 13px; }
    .badge { display: inline-block; background: rgba(255,255,255,0.2); color: #fff; font-size: 11px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; padding: 4px 12px; border-radius: 999px; margin-top: 12px; }
    .body { padding: 32px 40px; }
    .body p { color: #4a5568; font-size: 14px; line-height: 1.7; margin: 0 0 20px; }
    .info-box { background: #f7fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px 24px; margin: 20px 0; }
    .info-row { display: flex; align-items: center; padding: 6px 0; font-size: 13px; color: #4a5568; }
    .info-row span.label { font-weight: 700; color: #0f4c5c; width: 120px; flex-shrink: 0; }
    .cancelled-chip { display: inline-block; background: #fff5f5; color: #c53030; border: 1px solid #fed7d7; border-radius: 999px; padding: 4px 14px; font-size: 12px; font-weight: 700; margin-bottom: 16px; }
    .footer { background: #f7fafc; padding: 20px 40px; text-align: center; border-top: 1px solid #e2e8f0; }
    .footer p { color: #a0aec0; font-size: 11px; margin: 0; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <h1>SmartCare</h1>
      <p>Appointment Management</p>
      <span class="badge">Cancellation Notice</span>
    </div>
    <div class="body">
      <p>Hi <strong>${toName}</strong>,</p>
      <p>We are writing to let you know that the following appointment has been <strong>cancelled</strong> by <strong>${cancellerLabel}</strong>.</p>
      <span class="cancelled-chip">Appointment Cancelled</span>
      <div class="info-box">
        <div class="info-row"><span class="label">Patient</span>${patientName}</div>
        <div class="info-row"><span class="label">Doctor</span>Dr. ${doctorName}</div>
        <div class="info-row"><span class="label">Date</span>${date}</div>
        <div class="info-row"><span class="label">Time</span>${time}</div>
        <div class="info-row"><span class="label">Cancelled by</span>${cancellerLabel}</div>
      </div>
      <p>${cancelledBy === "doctor"
        ? "We apologize for the inconvenience. Please log in to rebook at your earliest convenience."
        : "If this was a mistake, please log in and book a new appointment."
      }</p>
      <p>Thank you for choosing SmartCare.</p>
    </div>
    <div class="footer">
      <p>This is an automated notification. Please do not reply to this email.</p>
      <p style="margin-top:4px">SmartCare Health System</p>
    </div>
  </div>
</body>
</html>
  `;

  await transporter.sendMail({
    from: `"SmartCare Notifications" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject,
    html,
  });
};
