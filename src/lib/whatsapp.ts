/**
 * WhatsApp Integration Utilities
 * 
 * This module provides utilities for integrating WhatsApp communication
 * into the DMHCA CRM system for better lead engagement.
 */

import { Lead } from '@/types';

/**
 * Format phone number for WhatsApp
 * Removes all non-digit characters and ensures proper country code
 */
export const formatPhoneForWhatsApp = (phone: string): string => {
  // Remove all non-digit characters
  const cleanPhone = phone.replace(/\D/g, '');
  
  // If phone starts with country code, use as is
  // Otherwise, assume it's an Indian number and add 91
  if (cleanPhone.length >= 10) {
    return cleanPhone.startsWith('91') ? cleanPhone : '91' + cleanPhone.slice(-10);
  }
  return cleanPhone;
};

/**
 * WhatsApp message templates for different scenarios
 */
export const whatsappTemplates = {
  initial: (lead: Lead) => `Hello ${lead.name}! 👋

I hope this message finds you well. I'm reaching out from DMHCA (Delhi Medical Healthcare Academy) regarding your interest in our ${lead.course} program.

We'd love to provide you with detailed information about:
✅ Course curriculum and duration
✅ Certification details
✅ Flexible learning options
✅ Career opportunities

Would you be available for a brief call to discuss how this program can enhance your medical career?

Best regards,
DMHCA Team`,

  followup: (lead: Lead) => `Hi ${lead.name}! 👋

Following up on our previous conversation about the ${lead.course} program at DMHCA.

I wanted to check if you have any questions or if you'd like to schedule a consultation to discuss:
📚 Course details
💰 Fee structure and payment options
📅 Upcoming batch schedules
🎓 Certification process

Let me know what works best for you!

Best regards,
DMHCA Team`,

  custom: (lead: Lead) => `Hello ${lead.name}! 👋

I'm reaching out from DMHCA regarding your ${lead.course} inquiry.

How can I assist you today?

Best regards,
DMHCA Team`,

  reminder: (lead: Lead) => `Hi ${lead.name}! 👋

This is a friendly reminder about our upcoming consultation for the ${lead.course} program.

Please let me know if you need to reschedule or if you have any questions before our meeting.

Looking forward to speaking with you!

Best regards,
DMHCA Team`,

  courseInfo: (lead: Lead) => `Hi ${lead.name}! 👋

Thank you for your interest in the ${lead.course} program at DMHCA.

Here are the key highlights:
🎓 Internationally recognized certification
📖 Comprehensive curriculum designed by experts
💻 Online and hybrid learning options
👥 Expert faculty and mentorship
🏆 100% placement assistance

Would you like to schedule a detailed consultation?

Best regards,
DMHCA Team`,

  enrollment: (lead: Lead) => `Hi ${lead.name}! 👋

Great news! The enrollment for the ${lead.course} program is now open.

🗓️ Next batch starts: [Date]
💰 Early bird discount available
📋 Limited seats - secure your spot today

To complete your enrollment:
1. Fill out the application form
2. Submit required documents
3. Process the fee payment

Shall I guide you through the enrollment process?

Best regards,
DMHCA Team`
};

/**
 * Generate WhatsApp URL for opening chat
 */
export const generateWhatsAppURL = (phone: string, message: string): string => {
  const formattedPhone = formatPhoneForWhatsApp(phone);
  return `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`;
};

/**
 * Open WhatsApp chat with predefined template
 */
export const openWhatsAppChat = (
  lead: Lead, 
  template: keyof typeof whatsappTemplates = 'initial'
): void => {
  const message = whatsappTemplates[template](lead);
  const whatsappUrl = generateWhatsAppURL(lead.phone, message);
  
  // Open WhatsApp in new tab
  window.open(whatsappUrl, '_blank');
};

/**
 * Copy WhatsApp message to clipboard
 */
export const copyWhatsAppMessage = async (
  lead: Lead, 
  template: keyof typeof whatsappTemplates = 'initial'
): Promise<boolean> => {
  try {
    const message = whatsappTemplates[template](lead);
    await navigator.clipboard.writeText(message);
    return true;
  } catch (error) {
    console.error('Failed to copy message to clipboard:', error);
    return false;
  }
};

/**
 * Get WhatsApp Web URL (alternative to mobile app)
 */
export const getWhatsAppWebURL = (phone: string, message: string): string => {
  const formattedPhone = formatPhoneForWhatsApp(phone);
  return `https://web.whatsapp.com/send?phone=${formattedPhone}&text=${encodeURIComponent(message)}`;
};

/**
 * Validate phone number for WhatsApp compatibility
 */
export const isValidWhatsAppPhone = (phone: string): boolean => {
  const cleanPhone = phone.replace(/\D/g, '');
  return cleanPhone.length >= 10 && cleanPhone.length <= 15;
};

/**
 * Get country-specific WhatsApp features
 */
export const getCountryWhatsAppInfo = (countryCode: string) => {
  const countryInfo: Record<string, any> = {
    'IN': {
      businessFeatures: true,
      paymentSupport: true,
      commonUsage: 'Very High',
      businessHours: '9 AM - 9 PM IST'
    },
    'AE': {
      businessFeatures: true,
      paymentSupport: false,
      commonUsage: 'High',
      businessHours: '9 AM - 6 PM GST'
    },
    'SA': {
      businessFeatures: true,
      paymentSupport: false,
      commonUsage: 'High',
      businessHours: '9 AM - 6 PM AST'
    },
    'US': {
      businessFeatures: true,
      paymentSupport: false,
      commonUsage: 'Medium',
      businessHours: '9 AM - 5 PM EST'
    },
    'GB': {
      businessFeatures: true,
      paymentSupport: false,
      commonUsage: 'Medium',
      businessHours: '9 AM - 5 PM GMT'
    }
  };

  return countryInfo[countryCode] || {
    businessFeatures: false,
    paymentSupport: false,
    commonUsage: 'Low',
    businessHours: '9 AM - 5 PM Local Time'
  };
};
