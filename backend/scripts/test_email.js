const nodemailer = require('nodemailer');
require('dotenv').config();

async function testEmail() {
  console.log('Sending test email from:', process.env.SMTP_USER);

  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS ? process.env.SMTP_PASS.replace(/\s+/g, '') : ''
    }
  });

  try {
    const info = await transporter.sendMail({
      from: `"Luxora Perfume" <${process.env.SMTP_USER}>`,
      to: 'ptthong.www@gmail.com',
      subject: 'Mã xác nhận đăng nhập Luxora Shop (Mẫu Mới Sang Trọng)',
      html: `
        <div style="font-family: Arial, Helvetica, sans-serif; max-width: 560px; margin: 0 auto; background: #ffffff; border: 1px solid #e4e4e7; border-radius: 24px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.06);">
          <!-- Brand Header with Logo -->
          <div style="background: linear-gradient(180deg, #18181b 0%, #09090b 100%); padding: 32px 20px; text-align: center; border-bottom: 3px solid #fbbf24;">
            <div style="display: inline-block; width: 56px; height: 56px; line-height: 56px; border-radius: 50%; border: 2px solid #fbbf24; background: #000000; color: #fef08a; font-size: 26px; font-weight: bold; font-family: Georgia, serif; box-shadow: 0 4px 15px rgba(251,191,36,0.35);">
              LX
            </div>
            <h1 style="color: #fbbf24; font-family: Georgia, serif; font-size: 25px; letter-spacing: 6px; margin: 12px 0 3px 0; font-weight: bold;">LUXORA</h1>
            <p style="color: #d4d4d8; font-size: 10px; letter-spacing: 2px; text-transform: uppercase; margin: 0; font-weight: 500;">Shine Through Fragrance</p>
          </div>

          <!-- Main Body Content -->
          <div style="padding: 28px 24px; text-align: left; color: #27272a; line-height: 1.6;">
            <p style="font-size: 15px; margin-top: 0; margin-bottom: 12px; color: #18181b;">Xin chào,</p>
            <p style="font-size: 14px; color: #3f3f46; margin-bottom: 18px;">Cảm ơn bạn đã đăng ký tài khoản trên <strong>Luxora Perfume Shop</strong>.</p>
            
            <p style="font-size: 13px; color: #52525b; margin-bottom: 8px; font-weight: 600;">Mã xác nhận (OTP) của bạn là:</p>

            <!-- OTP Code Display -->
            <div style="text-align: center; margin: 20px 0;">
              <div style="font-size: 36px; letter-spacing: 10px; color: #db2777; font-weight: bold; font-family: 'Courier New', Courier, monospace; background: #fdf2f8; border: 2px dashed #f472b6; padding: 14px 28px; display: inline-block; border-radius: 20px; box-shadow: 0 4px 12px rgba(219,39,119,0.08);">
                123456
              </div>
              <p style="font-size: 13px; color: #e11d48; font-weight: 600; margin-top: 12px; margin-bottom: 0;">⏱️ Mã này sẽ hết hạn sau <strong>1 phút</strong>.</p>
            </div>

            <!-- Security Warning Box -->
            <div style="background: #fffbebfb; border-left: 4px solid #f59e0b; border-radius: 8px; padding: 14px 16px; margin: 20px 0; font-size: 12px; color: #92400e; line-height: 1.5;">
              <strong>⚠️ Lưu ý bảo mật:</strong> Vui lòng không chia sẻ mã này với bất kỳ ai. Đội ngũ hỗ trợ của chúng tôi sẽ <strong>không bao giờ yêu cầu bạn cung cấp mã OTP</strong> qua điện thoại, email hoặc tin nhắn.
            </div>

            <p style="font-size: 13px; color: #71717a; margin-bottom: 24px;">Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email.</p>

            <div style="border-top: 1px solid #f4f4f5; margin-top: 24px; padding-top: 20px;">
              <p style="font-size: 13px; color: #3f3f46; margin: 0 0 4px 0;">Trân trọng,</p>
              <p style="font-size: 14px; font-weight: bold; color: #18181b; margin: 0 0 8px 0;">Luxora Perfume Shop</p>
              <p style="font-size: 12px; color: #71717a; margin: 0 0 4px 0;">Website: <a href="http://localhost:3000" style="color: #db2777; text-decoration: none; font-weight: 600;">https://luxoraperfume.com</a></p>
              <p style="font-size: 12px; color: #71717a; margin: 0 0 16px 0;">Email hỗ trợ: <a href="mailto:luxorashop.www@gmail.com" style="color: #db2777; text-decoration: none;">luxorashop.www@gmail.com</a></p>
            </div>

            <!-- Contact & Social Media Section -->
            <div style="background: #f8fafc; border-radius: 16px; padding: 16px 20px; text-align: center; border: 1px solid #f1f5f9; margin-top: 20px;">
              <p style="font-size: 12px; font-weight: bold; color: #334155; margin: 0 0 12px 0; text-transform: uppercase; letter-spacing: 1px;">Kênh hỗ trợ & Liên hệ trực tiếp</p>
              <div style="text-align: center;">
                <a href="https://www.facebook.com/share/1G5Czfe1rP/" target="_blank" style="background: #1877f2; color: #ffffff; padding: 9px 18px; border-radius: 20px; text-decoration: none; font-size: 12px; font-weight: bold; display: inline-block; margin: 4px; box-shadow: 0 2px 6px rgba(24,119,242,0.25);">
                  📘 Facebook Hỗ Trợ
                </a>
                <a href="https://zalo.me/0932525650" target="_blank" style="background: #0068ff; color: #ffffff; padding: 9px 18px; border-radius: 20px; text-decoration: none; font-size: 12px; font-weight: bold; display: inline-block; margin: 4px; box-shadow: 0 2px 6px rgba(0,104,255,0.25);">
                  💬 Zalo: 0932.525.650
                </a>
              </div>
            </div>
          </div>
        </div>
      `
    });
    console.log('SEND RICH TEMPLATE SUCCESS:', info.messageId);
  } catch (err) {
    console.error('SEND RICH TEMPLATE FAILED:', err);
  }
}

testEmail();
