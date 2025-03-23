const rateLimit = require('express-rate-limit');

// Create a limiter that allows 50 requests per 15 minutes
const chatbotLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // Limit each IP to 50 requests per windowMs
  message: {
    msg: "Too many requests from this IP, please try again after 15 minutes"
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

module.exports = {
  chatbotLimiter
}; 