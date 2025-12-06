# WhatsApp Integration Setup Guide

## Overview
This e-commerce store is integrated with WhatsApp for order notifications. When a customer completes checkout, their order details are automatically sent via WhatsApp to your business number.

## Configuration Steps

### 1. Update WhatsApp Business Number

Edit the file `/public/js/config.js` and update the `WHATSAPP_NUMBER` field:

```javascript
const CONFIG = {
    // WhatsApp Business Number (without + and spaces)
    // Format: country code + number
    WHATSAPP_NUMBER: 'YOUR_NUMBER_HERE',
    // ... other settings
};
```

**Format Examples:**
- US Number: `12345678900` (1 + 10 digit number)
- UK Number: `447123456789` (44 + number without leading 0)
- India Number: `919876543210` (91 + 10 digit number)

### 2. WhatsApp Business Account Setup

For the best customer experience, we recommend setting up a **WhatsApp Business Account**:

1. Download WhatsApp Business app from Google Play or App Store
2. Verify your business phone number
3. Set up your business profile with:
   - Business name (NFR)
   - Business description
   - Business hours
   - Address (if applicable)
   - Website
   - Email contact

### 3. Order Message Format

When customers complete checkout, they will receive a WhatsApp message containing:

- Order number
- Product details (name, size, color, quantity, price)
- Order summary (subtotal, shipping, total)
- Shipping address
- Customer information

**Example Message:**
```
🛍️ *NEW ORDER - #ORD-1234*

📦 *Order Details:*
1. Classic White T-Shirt
   Size: L | Color: White
   Qty: 2 × $29.99 = $59.98

💰 *Order Summary:*
Subtotal: $59.98
Shipping: $10.00
*Total: $69.98*

📍 *Shipping Address:*
John Doe
+1234567890
123 Main Street
New York, NY 10001
USA

Thank you for shopping with NFR! 🎉
```

## Features

### User vs Guest Mode
- **Registered Users**: Can checkout and receive order confirmation via WhatsApp
- **Guest Users**: Must login to add items to cart and complete checkout

### Cart Restrictions
- Guests cannot add items to cart (redirected to login)
- Only logged-in users can view cart and proceed to checkout

### Shipping Costs
Default configuration (can be changed in `config.js`):
- Free shipping on orders $100+
- Standard shipping: $10

## Testing the Integration

1. Create a test account on your store
2. Add products to cart
3. Proceed through checkout
4. Fill in shipping information
5. Click "Complete Order via WhatsApp"
6. Verify that WhatsApp opens with the order details
7. Ensure the message is sent to your configured business number

## Troubleshooting

### WhatsApp doesn't open
- Check that the number format is correct (no spaces, no +, includes country code)
- Ensure WhatsApp or WhatsApp Web is installed
- Try a different browser

### Wrong number receiving orders
- Verify `WHATSAPP_NUMBER` in `/public/js/config.js`
- Clear browser cache and reload
- Check for browser console errors

### Order details incomplete
- Ensure all product information is properly saved in database
- Check that cart items have valid product, size, and color data
- Verify shipping address form is completely filled

## Customization

### Changing Message Template

Edit `/public/js/checkout.js` functions:
- `generateWhatsAppMessage()` - For registered user orders
- `generateWhatsAppMessageGuest()` - For guest orders (if enabled)

### Changing Shipping Configuration

Edit `/public/js/config.js`:
```javascript
FREE_SHIPPING_THRESHOLD: 100,  // Amount for free shipping
STANDARD_SHIPPING_COST: 10,    // Standard shipping cost
```

## Production Deployment

Before going live:
1. ✅ Update WHATSAPP_NUMBER with your actual business number
2. ✅ Test order flow end-to-end
3. ✅ Set up WhatsApp Business profile
4. ✅ Configure business hours and auto-reply messages
5. ✅ Train staff on handling WhatsApp order notifications

## Support

For issues or questions:
- Check browser console for errors
- Verify all configuration values
- Ensure WhatsApp is installed and logged in
- Test with a different phone number

---

**Note**: This integration uses the WhatsApp Click to Chat API, which is free and doesn't require WhatsApp Business API approval for basic functionality.
