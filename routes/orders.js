const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const { protect } = require('../middleware/auth');

// @route   POST /api/orders
// @desc    Create new order
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { items, shippingAddress, notes } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No items in cart'
      });
    }

    // Calculate total and validate products
    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.product);
      
      if (!product || !product.isActive) {
        return res.status(400).json({
          success: false,
          message: `Product ${item.product} not found`
        });
      }

      // Check stock
      const sizeStock = product.sizes.find(s => s.name === item.size);
      if (!sizeStock || sizeStock.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.name} - Size ${item.size}`
        });
      }

      const itemTotal = product.price * item.quantity;
      totalAmount += itemTotal;

      orderItems.push({
        product: product._id,
        name: product.name,
        image: product.images[0]?.url,
        price: product.price,
        quantity: item.quantity,
        size: item.size,
        color: item.color
      });
    }

    // Create order
    const order = await Order.create({
      user: req.user.id,
      items: orderItems,
      shippingAddress,
      totalAmount,
      notes
    });

    // Update product stock
    for (const item of items) {
      const product = await Product.findById(item.product);
      const sizeIndex = product.sizes.findIndex(s => s.name === item.size);
      if (sizeIndex !== -1) {
        product.sizes[sizeIndex].stock -= item.quantity;
        await product.save();
      }
    }

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      order
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating order'
    });
  }
});

// @route   GET /api/orders
// @desc    Get user orders
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .populate('items.product');

    res.json({
      success: true,
      count: orders.length,
      orders
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching orders'
    });
  }
});

// @route   GET /api/orders/:id
// @desc    Get single order
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('items.product')
      .populate('user', 'name email phone');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if order belongs to user or user is admin
    if (order.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this order'
      });
    }

    res.json({
      success: true,
      order
    });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching order'
    });
  }
});

// @route   POST /api/orders/:id/whatsapp
// @desc    Generate WhatsApp message for order
// @access  Private
router.post('/:id/whatsapp', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('items.product')
      .populate('user', 'name email phone');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    if (order.user._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    // Generate WhatsApp message
    let message = `🛍️ *NFR Store - New Order*%0A%0A`;
    message += `*Order Number:* ${order.orderNumber}%0A`;
    message += `*Customer:* ${order.user.name}%0A`;
    message += `*Email:* ${order.user.email}%0A`;
    if (order.user.phone) message += `*Phone:* ${order.user.phone}%0A`;
    message += `%0A*Shipping Address:*%0A`;
    message += `${order.shippingAddress.street}%0A`;
    message += `${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.zipCode}%0A`;
    message += `${order.shippingAddress.country}%0A`;
    message += `%0A*Order Items:*%0A`;
    
    order.items.forEach((item, index) => {
      message += `%0A${index + 1}. ${item.name}%0A`;
      message += `   Size: ${item.size} | Color: ${item.color}%0A`;
      message += `   Qty: ${item.quantity} x $${item.price} = $${item.quantity * item.price}%0A`;
    });

    message += `%0A*Total Amount: $${order.totalAmount}*%0A`;
    
    if (order.notes) {
      message += `%0A*Notes:* ${order.notes}%0A`;
    }

    message += `%0AThank you for your order! 🙏`;

    // Update order
    order.whatsappSent = true;
    order.whatsappSentAt = new Date();
    await order.save();

    const whatsappNumber = process.env.WHATSAPP_NUMBER || '+1234567890';
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${message}`;

    res.json({
      success: true,
      whatsappUrl
    });
  } catch (error) {
    console.error('WhatsApp generation error:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating WhatsApp message'
    });
  }
});

module.exports = router;
