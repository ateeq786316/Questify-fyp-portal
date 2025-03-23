const sanitizeInput = (input) => {
  if (typeof input !== 'string') {
    return '';
  }

  // Remove HTML tags
  let sanitized = input.replace(/<[^>]*>/g, '');

  // Remove script tags and their content
  sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

  // Remove potentially dangerous attributes
  sanitized = sanitized.replace(/on\w+="[^"]*"/g, '');

  // Remove null bytes
  sanitized = sanitized.replace(/\0/g, '');

  // Trim whitespace
  sanitized = sanitized.trim();

  return sanitized;
};

module.exports = {
  sanitizeInput
}; 