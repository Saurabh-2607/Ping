import { Resend } from 'resend';
import totp from 'totp-generator';
import config from '../config/index.js';
import redisClient from './redis.js';

class EmailService {
  constructor() {
    this.resend = new Resend(config.resend.apiKey);
  }

  generateOTP() {
    // Generate 6-digit TOTP (Time-based OTP)
    const token = totp('JBSWY3DPEHPK3PXP'); // Base32 secret key
    return token;
  }

  async sendOTP(email, name) {
    try {
      const otp = this.generateOTP();
      console.log(`Generated OTP for ${email}: ${otp}`);
      
      // Store OTP in Redis with 10-minute expiry
      await redisClient.storeOTP(email, otp);

      // Send email via Resend
      const { data, error } = await this.resend.emails.send({
        from: config.resend.fromEmail,
        to: [email],
        subject: 'Your Chat App Verification Code',
        html: this.getEmailTemplate(name, otp),
      });

      if (error) {
        console.error('Failed to send email:', error);
        return { success: false, error };
      }

      console.log('OTP sent successfully to:', email);
      return { success: true, messageId: data?.id };
    } catch (error) {
      console.error('Error in sendOTP:', error);
      return { success: false, error: error.message };
    }
  }

  async verifyOTP(email, otp) {
    try {
      const storedOTP = await redisClient.getOTP(email);
      
      if (!storedOTP) {
        return { valid: false, message: 'OTP expired or not found' };
      }

      if (storedOTP !== otp) {
        return { valid: false, message: 'Invalid OTP' };
      }

      // Delete OTP after successful verification
      await redisClient.deleteOTP(email);
      
      return { valid: true, message: 'OTP verified successfully' };
    } catch (error) {
      console.error('Error in verifyOTP:', error);
      throw error;
    }
  }

  getEmailTemplate(name, otp) {
    return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .container {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 10px;
      padding: 40px;
      text-align: center;
      color: white;
    }
    .otp-box {
      background: white;
      color: #333;
      font-size: 32px;
      font-weight: bold;
      letter-spacing: 8px;
      padding: 20px;
      margin: 30px 0;
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    }
    .footer {
      margin-top: 30px;
      font-size: 14px;
      opacity: 0.9;
    }
    h1 {
      margin: 0 0 10px 0;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>Verification Code</h1>
    <p>Hello ${name || 'there'}!</p>
    <p>Your verification code for the Chat App is:</p>
    
    <div class="otp-box">${otp}</div>
    
    <p>This code will expire in <strong>10 minutes</strong>.</p>
    <p>If you didn't request this code, please ignore this email.</p>
    
    <div class="footer">
      <p>© ${new Date().getFullYear()} Chat App. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
    `;
  }
}

export default new EmailService();
