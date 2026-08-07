import nodemailer from "nodemailer";

// Create transporter (use your email service - Gmail, SendGrid, etc.)
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_FROM,
        pass: process.env.EMAIL_PASSWORD,
    },
});

// Generate 6-digit OTP
export const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send verification email
export const sendVerificationEmail = async (email, code) => {
    const mailOptions = {
        from: `"E-Book Store" <${process.env.EMAIL_FROM}>`,
        to: email,
        subject: "Email Verification Code",
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #6c47ff;">E-Book Store - Email Verification</h2>
                <p>Your verification code is:</p>
                <div style="background: #f0f0f0; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #333;">
                    ${code}
                </div>
                <p>This code will expire in <strong>10 minutes</strong>.</p>
                <p>If you didn't request this, please ignore this email.</p>
            </div>
        `,
    };

    await transporter.sendMail(mailOptions);
};

// Send password reset email
export const sendPasswordResetEmail = async (email, code) => {
    const mailOptions = {
        from: `"E-Book Store" <${process.env.EMAIL_FROM}>`,
        to: email,
        subject: "Password Reset Code",
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #6c47ff;">E-Book Store - Password Reset</h2>
                <p>Your password reset code is:</p>
                <div style="background: #f0f0f0; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #333;">
                    ${code}
                </div>
                <p>This code will expire in <strong>10 minutes</strong>.</p>
                <p>If you didn't request this, please ignore this email.</p>
            </div>
        `,
    };

    await transporter.sendMail(mailOptions);
};