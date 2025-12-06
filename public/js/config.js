// NFR Store Configuration
const CONFIG = {
    // WhatsApp Business Number (without + and spaces)
    // Format: country code + number (e.g., '1234567890' for US number)
    // Update this with your actual WhatsApp business number
    WHATSAPP_NUMBER: '1234567890',
    
    // Store Information
    STORE_NAME: 'NFR',
    STORE_EMAIL: 'contact@nfr.com',
    
    // Shipping Configuration
    FREE_SHIPPING_THRESHOLD: 100, // Free shipping on orders over this amount
    STANDARD_SHIPPING_COST: 10,
    
    // Cart Configuration
    MAX_QUANTITY_PER_ITEM: 10,
    
    // Product Configuration
    LOW_STOCK_THRESHOLD: 10,
    
    // Currency
    CURRENCY: 'USD',
    CURRENCY_SYMBOL: '$'
};

// Make config available globally
window.CONFIG = CONFIG;
