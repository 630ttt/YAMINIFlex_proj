const Order = require('../models/Order');
const Customer = require('../models/Customer');
const Design = require('../models/Design');
const jwt = require('jsonwebtoken');

// @desc  Create order (customer places order, logged in or as guest)
// @route POST /api/orders
const createOrder = async (req, res) => {
  try {
    const { designId, name, phone, email, address, size, quantity, customizationNotes } = req.body;

    const design = await Design.findById(designId);
    if (!design) {
      return res.status(404).json({ success: false, message: 'Design not found' });
    }

    // If a logged-in customer token is present, attach the order to that account
    let customer = null;
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      try {
        const decoded = jwt.verify(authHeader.split(' ')[1], process.env.JWT_SECRET);
        if (decoded.type === 'customer') {
          customer = await Customer.findById(decoded.id);
        }
      } catch {
        // ignore invalid/expired token, fall back to guest checkout
      }
    }

    if (!customer) {
      customer = await Customer.findOne({ phone });
    }
    if (!customer) {
      customer = await Customer.create({ name, phone, email, address });
    } else if (!customer.password) {
      // only overwrite guest details, never touch details of a logged-in account here
      customer.name = name || customer.name;
      customer.email = email || customer.email;
      customer.address = address || customer.address;
      await customer.save();
    }

    const customerFileUploads = (req.files || []).map((file) => `/uploads/${file.filename}`);

    const order = await Order.create({
      design: design._id,
      customer: customer._id,
      size,
      quantity: quantity || 1,
      customizationNotes,
      customerFileUploads,
      totalAmount: design.price * (quantity || 1),
    });

    res.status(201).json({ success: true, data: order });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc  Get order by id (for order confirmation page)
// @route GET /api/orders/:id
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('design', 'title thumbnail price')
      .populate('customer', 'name phone email address');
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    res.json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Get all orders (admin, paginated)
// @route GET /api/admin/orders?page=1&limit=20&status=pending
const getOrders = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), 100);
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.status) filter.status = req.query.status;

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .populate('design', 'title thumbnail')
        .populate('customer', 'name phone')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Order.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: orders,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Update order status / upload final design
// @route PUT /api/admin/orders/:id
const updateOrder = async (req, res) => {
  try {
    const updates = { ...req.body };
    if (req.file) {
      updates.finalDesignFile = `/uploads/${req.file.filename}`;
      // a newly uploaded design always needs fresh customer approval
      updates.status = 'awaiting-approval';
      updates.finalDesignApproved = false;
      updates.finalDesignApprovedAt = null;
      updates.customerFeedback = '';
    }
    const order = await Order.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    res.json({ success: true, data: order });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = { createOrder, getOrderById, getOrders, updateOrder };
