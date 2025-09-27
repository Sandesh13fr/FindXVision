// import { WhatsAppAPI } from 'whatsapp-web.js';

export class WhatsAppService {
  constructor() {
    this.phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID || '';
    this.accessToken = process.env.WHATSAPP_TOKEN || '';
    this.apiVersion = 'v18.0';
    this.baseUrl = `https://graph.facebook.com/${this.apiVersion}/${this.phoneNumberId}`;
  }

  async sendMessage(messageData){
    try {
      const { to, message } = messageData;

      const payload = {
        messaging_product: 'whatsapp',
        to: this.formatPhoneNumber(to),
        type: 'text',
        text: {
          body: message,
        },
      };

      const response = await fetch(`${this.baseUrl}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (response.ok) {
        console.log('WhatsApp message sent successfully:', result);
        return true;
      } else {
        console.error('Failed to send WhatsApp message:', result);
        return false;
      }
    } catch (error) {
      console.error('WhatsApp service error:', error);
      return false;
    }
  }

  async sendTemplateMessage(messageData){
    try {
      const { to, templateName, templateParams = [] } = messageData;

      const payload = {
        messaging_product: 'whatsapp',
        to: this.formatPhoneNumber(to),
        type: 'template',
        template: {
          name: templateName,
          language: {
            code: 'en',
          },
          components: templateParams.length > 0 ? [
            {
              type: 'body',
              parameters: templateParams.map(param => ({
                type: 'text',
                text: param,
              })),
            },
          ] : [],
        },
      };

      const response = await fetch(`${this.baseUrl}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (response.ok) {
        console.log('WhatsApp template message sent successfully:', result);
        return true;
      } else {
        console.error('Failed to send WhatsApp template message:', result);
        return false;
      }
    } catch (error) {
      console.error('WhatsApp template service error:', error);
      return false;
    }
  }

  async sendCaseUpdateNotification(phoneNumber, caseNumber, updateMessage){
    const message = `🔍 FindXVision Case Update

Case: ${caseNumber}
Update: ${updateMessage}

For more details, please visit the FindXVision portal.`;
    
    return this.sendMessage({
      to: phoneNumber,
      message,
    });
  }

  async sendCaseAssignmentNotification(phoneNumber, caseNumber, officerName){
    const message = `👮 FindXVision Case Assignment

You have been assigned to case: ${caseNumber}

Assigned Officer: ${officerName}

Please check the portal for case details.`;
    
    return this.sendMessage({
      to: phoneNumber,
      message,
    });
  }

  async sendCaseResolvedNotification(phoneNumber, caseNumber){
    const message = `✅ FindXVision Case Resolved

Case ${caseNumber} has been resolved.

Thank you for your cooperation. Please check the portal for final details.`;
    
    return this.sendMessage({
      to: phoneNumber,
      message,
    });
  }

  formatPhoneNumber(phoneNumber) {
    // Remove all non-digit characters
    let cleaned = phoneNumber.replace(/\D/g, '');
    
    // Add country code if not present (assuming US numbers)
    if (!cleaned.startsWith('1') && cleaned.length === 10) {
      cleaned = '1' + cleaned;
    }
    
    return cleaned;
  }

  async verifyWebhook(mode, token, challenge){
    const verifyToken = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN;
    
    if (mode === 'subscribe' && token === verifyToken) {
      console.log('WhatsApp webhook verified successfully');
      return challenge;
    } else {
      console.error('WhatsApp webhook verification failed');
      return null;
    }
  }

  async handleWebhookEvent(body){
    try {
      if (body.object === 'whatsapp_business_account') {
        body.entry?.forEach((entry) => {
          entry.changes?.forEach((change) => {
            if (change.field === 'messages') {
              const value = change.value;
              
              if (value.messages) {
                value.messages.forEach((message) => {
                  console.log('Received WhatsApp message:', message);
                  // Handle incoming messages here
                  this.processIncomingMessage(message, value.contacts?.[0]);
                });
              }
              
              if (value.statuses) {
                value.statuses.forEach((status) => {
                  console.log('WhatsApp message status:', status);
                  // Handle message status updates (delivered, read, etc.)
                  this.processMessageStatus(status);
                });
              }
            }
          });
        });
      }
    } catch (error) {
      console.error('Error processing WhatsApp webhook:', error);
    }
  }

  processIncomingMessage(message, contact) {
    // Process incoming WhatsApp messages
    console.log('Processing incoming message:', message, contact);
    // Implementation would depend on your specific requirements
  }

  processMessageStatus(status) {
    // Process WhatsApp message status updates
    console.log('Processing message status:', status);
    // Implementation would depend on your specific requirements
  }
}

// Export singleton instance
export const whatsappService = new WhatsAppService();