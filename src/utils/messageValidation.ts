/**
 * Message validation utilities
 */

const MAX_MESSAGE_LENGTH = 1000;
const MIN_MESSAGE_LENGTH = 1;

/**
 * Sanitize user input to prevent XSS attacks
 */
export function sanitizeMessage(message: string): string {
  return message
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Validate message before sending
 */
export function validateMessage(message: string): {
  isValid: boolean;
  error?: string;
} {
  const trimmed = message.trim();
  
  if (trimmed.length < MIN_MESSAGE_LENGTH) {
    return {
      isValid: false,
      error: '메시지를 입력해주세요.',
    };
  }
  
  if (trimmed.length > MAX_MESSAGE_LENGTH) {
    return {
      isValid: false,
      error: `메시지는 ${MAX_MESSAGE_LENGTH}자 이내로 입력해주세요.`,
    };
  }
  
  return { isValid: true };
}

/**
 * Process message before displaying
 */
export function processMessage(message: string): string {
  // Trim whitespace
  const trimmed = message.trim();
  
  // Sanitize for security
  const sanitized = sanitizeMessage(trimmed);
  
  return sanitized;
}