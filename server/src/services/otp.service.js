const crypto = require("crypto");
const OTP = require("../models/otp.model");

// Generate a 6-digit numeric OTP
const generateOTP = () => crypto.randomInt(100000, 999999).toString();

// Save OTP to DB (replace existing for same contact+type)
const saveOTP = async (contact, type) => {
  const otp = generateOTP();
  const expiresAt = new Date(
    Date.now() + parseInt(process.env.OTP_EXPIRY_MINUTES || 10) * 60 * 1000,
  );

  await OTP.findOneAndDelete({ contact, type }); // remove old

  await OTP.create({ contact, type, otp, expiresAt });
  return otp;
};

// Verify OTP — returns { valid, message }
const verifyOTP = async (contact, type, inputOtp) => {
  const record = await OTP.findOne({ contact, type, used: false });

  if (!record)
    return { valid: false, message: "OTP not found or already used" };

  if (record.expiresAt < new Date()) {
    await record.deleteOne();
    return { valid: false, message: "OTP has expired" };
  }

  // Max 5 attempts
  if (record.attempts >= 5) {
    await record.deleteOne();
    return {
      valid: false,
      message: "Too many failed attempts. Request a new OTP.",
    };
  }

  if (record.otp !== inputOtp) {
    await OTP.findByIdAndUpdate(record._id, { $inc: { attempts: 1 } });
    return { valid: false, message: "Incorrect OTP" };
  }

  await OTP.findByIdAndUpdate(record._id, { used: true });
  return { valid: true };
};

// --- SMS via Twilio ---
const sendSMSOTP = async (phone, otp) => {
  // Only run if Twilio credentials are set
  if (
    !process.env.TWILIO_ACCOUNT_SID ||
    process.env.TWILIO_ACCOUNT_SID.startsWith("ACxxx")
  ) {
    console.log(`[DEV] SMS OTP for ${phone}: ${otp}`);
    return;
  }

  const twilio = require("twilio")(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN,
  );

  await twilio.messages.create({
    body: `Your Echosphere code is: ${otp}. Valid for ${process.env.OTP_EXPIRY_MINUTES || 10} minutes.`,
    from: process.env.TWILIO_PHONE_NUMBER,
    to: phone,
  });
};

// --- Email via Nodemailer ---
const sendEmailOTP = async (email, otp) => {
  if (!process.env.EMAIL_USER) {
    console.log(`[DEV] Email OTP for ${email}: ${otp}`);
    return;
  }

  const nodemailer = require("nodemailer");

  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT || 587),
    secure: process.env.EMAIL_PORT === "465",
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
  });

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: email,
      subject: "Your Echosphere verification code",
      html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: auto; padding: 32px;">
        <h2 style="color: #6272f3; margin-bottom: 8px;">Your code</h2>
        <p style="color: #555; margin-bottom: 24px;">Use this code to sign in to Echosphere:</p>
        <div style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #111; background: #f5f5ff; border-radius: 12px; padding: 20px; text-align: center;">
          ${otp}
        </div>
        <p style="color: #999; font-size: 13px; margin-top: 20px;">
          This code expires in ${process.env.OTP_EXPIRY_MINUTES || 10} minutes. Do not share it.
        </p>
      </div>
    `,
    });
  } catch (err) {
    console.log("Mail Failed:", err);
  }
};

// Unified send dispatcher
const sendOTP = async (contact, type) => {
  const otp = await saveOTP(contact, type);
  if (type === "phone") await sendSMSOTP(contact, otp);
  else await sendEmailOTP(contact, otp);
  return otp; // Return in dev for testing
};

module.exports = { sendOTP, verifyOTP };
