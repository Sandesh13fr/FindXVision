import nodemailer from 'nodemailer';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class EmailService {
  constructor() {
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;

    if (!smtpUser || !smtpPass) {
      this.enabled = false;
      this.transporter = nodemailer.createTransport({ jsonTransport: true });
      console.warn('EmailService: SMTP credentials not provided. Emails will be logged only.');
    } else {
      this.enabled = true;
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT || '587', 10),
        secure: false, // true for 465, false for other ports
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });
    }
  }

  async sendEmail(emailData){
    const { to, subject, template, html, text, data, attachments } = emailData;

    let emailHtml = html;
    let emailText = text;

    // If template is provided, load and render it
    if (template && data) {
      try {
        emailHtml = await this.renderTemplate(template, data);
        emailText = await this.renderTemplate(`${template}-text`, data);
      } catch (error) {
        console.error('Failed to render email template:', error);
        // Fallback to basic text
        emailText = this.generateFallbackText(template, data);
      }
    }

    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.SMTP_USER,
      to,
      subject,
      html: emailHtml,
      text: emailText,
      attachments,
    };

    if (!this.enabled) {
      console.info('EmailService disabled: skipping send. Mail options:', {
        ...mailOptions,
        html: mailOptions.html ? '[html content omitted]' : undefined,
      });
      return { accepted: [], rejected: [], messageId: null, skipped: true };
    }

    try {
      const result = await this.transporter.sendMail(mailOptions);
      console.log('Email sent successfully:', result.messageId);
      return result;
    } catch (error) {
      console.error('Failed to send email:', error);
      throw new Error('Failed to send email');
    }
  }

  async renderTemplate(templateName, data){
    const templatePath = path.join(__dirname, '..', 'templates', 'email', `${templateName}.html`);
    
    try {
      let template = await fs.readFile(templatePath, 'utf-8');
      
      // Simple template rendering - replace {{variable}} with data
      Object.keys(data).forEach(key => {
        const placeholder = new RegExp(`{{${key}}}`, 'g');
        template = template.replace(placeholder, data[key] || '');
      });

      return template;
    } catch (error) {
      throw new Error(`Template ${templateName} not found`);
    }
  }

  generateFallbackText(template, data) {
    switch (template) {
      case 'password-reset':
        return `Hello ${data.firstName},

You requested a password reset for your FindXVision account.

Click this link to reset your password: ${data.resetUrl}

This link expires in ${data.expiresIn}.

If you didn't request this, please ignore this email.`;
      
      case 'welcome':
        return `Welcome to FindXVision, ${data.firstName}!

Your account has been created. You can now start using our missing person case management system.

Best regards,
The FindXVision Team`;

      case 'case-update':
        return `Hello ${data.firstName},

There's an update on case ${data.caseNumber}: ${data.updateMessage}

You can view the full details at: ${data.caseUrl}

Best regards,
The FindXVision Team`;

      default:
        return 'Thank you for using FindXVision.';
    }
  }

  async testConnection(){
    try {
      await this.transporter.verify();
      console.log('Email service connection verified');
      return true;
    } catch (error) {
      console.error('Email service connection failed:', error);
      return false;
    }
  }
}

// Export singleton instance
const emailService = new EmailService();
export const sendEmail = (emailData) => emailService.sendEmail(emailData);
export const testEmailConnection = () => emailService.testConnection();
export default emailService;