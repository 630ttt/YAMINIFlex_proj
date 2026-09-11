const Order = require('../models/Order');
const Customer = require('../models/Customer');
const Design = require('../models/Design');
const jwt = require('jsonwebtoken');
const { saveUpload, saveUploads } = require('../services/fileStorage');

const toFiniteNumber = (value, fallback = 0) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
};

const normalizePaymentMethod = (method) => {
  if (!method) return 'COD';
  const value = String(method).trim();
  if (value === 'COD') return 'COD';
  if (['PhonePe', 'UPI', 'Direct Bank Transfer'].includes(value)) return value;
  return 'COD';
};

// @desc  Create order (customer places order, logged in or as guest)
// @route POST /api/orders
const createOrder = async (req, res) => {
  try {
    const body = req.body || {};
    const designId = body.designId || body.design;
    const phone = body.phone || body.whatsapp || body.phoneNumber || '';
    const name = body.name || body.fullName || '';
    const email = body.email || '';
    const address = body.address || body.deliveryAddress || body.homeAddress || '';
    const size = body.size || body.hoardingSize || '';
    const quantity = Math.max(1, toFiniteNumber(body.quantity, 1));
    const customizationNotes = body.customizationNotes || body.specialChanges || '';

    const design = await Design.findById(designId);
    if (!design) {
      return res.status(404).json({ success: false, message: 'Design not found' });
    }

    let customer = null;
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      try {
        const decoded = jwt.verify(authHeader.split(' ')[1], process.env.JWT_SECRET);
        if (decoded.type === 'customer') {
          customer = await Customer.findById(decoded.id);
        }
      } catch {
        // ignore invalid token; fallback to guest
      }
    }

    if (!customer) {
      customer = await Customer.findOne({ phone });
    }
    if (!customer) {
      customer = await Customer.create({ name, phone, email, address });
    } else if (!customer.password) {
      customer.name = name || customer.name;
      customer.email = email || customer.email;
      customer.address = address || customer.address;
      await customer.save();
    }

    const customerFileUploads = await saveUploads(req.files || []);

    const orderDate = new Date();
    const datePart = orderDate.toISOString().slice(0, 10).replace(/-/g, '');
    const count = await Order.countDocuments();
    const orderId = `YF-${datePart}-${String(count + 1).padStart(3, '0')}`;

    const baseDesignPrice = toFiniteNumber(design.price, 0);
    const materialPrice = toFiniteNumber(body.materialPrice, baseDesignPrice);
    const pricePerSqFt = toFiniteNumber(body.pricePerSqFt, baseDesignPrice);
    const designBasePrice = toFiniteNumber(body.designBasePrice, baseDesignPrice);
    const calculatedTotal = Math.max(0, baseDesignPrice * quantity);
    const grandTotal = Math.max(0, toFiniteNumber(body.grandTotal, calculatedTotal));
    const totalAmount = Math.max(0, toFiniteNumber(body.totalAmount, grandTotal));

    const paymentMethod = normalizePaymentMethod(body.paymentMethod);
    const selectedPaymentStatus = paymentMethod === 'COD' ? 'COD / Pending' : (body.paymentStatus || 'Pending');

    const order = await Order.create({
      orderId,
      design: design._id,
      customer: customer._id,
      occasion: body.occasion || '',
      hoardingSize: size,
      size,
      quantity,
      material: body.material || '',
      materialPrice,
      pricePerSqFt,
      designBasePrice,
      grandTotal,
      totalAmount,
      customizationNotes,
      celebrantName: body.celebrantName || '',
      slogan: body.slogan || body.occasion || '',
      eventDate: body.eventDate || '',
      customerFileUploads,
      mainSubjectPhoto: customerFileUploads[0] || '',
      additionalPhotos: customerFileUploads.slice(1),
      specialChanges: body.specialChanges || customizationNotes || '',
      paymentMethod,
      paymentStatus: selectedPaymentStatus,
      transactionId: body.transactionId || '',
      amountPaid: paymentMethod === 'COD' ? 0 : Math.max(0, toFiniteNumber(body.amountPaid, 0)),
      paymentDate: body.paymentDate || orderDate.toISOString().slice(0, 10),
      paymentTime: body.paymentTime || orderDate.toLocaleTimeString(),
      name,
      email,
      phone,
      address,
      deliveryMode: body.deliveryMode || 'studio-pickup',
      deliveryAddress: body.deliveryAddress || address,
      functionHallAddress: body.functionHallAddress || '',
      status: body.status || 'Order Placed',
      finalDesignFile: '',
      finalDesignApproved: false,
      customerFeedback: '',
    });

    res.status(201).json({ success: true, data: order });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const verifyOrderPayment = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const amount = toFiniteNumber(req.body.amount, order.grandTotal);
    const expectedAmount = Math.round(order.grandTotal);
    const requestedAmount = Math.round(amount);

    if (!req.body.paymentVerified || req.body.paymentVerified !== true) {
      return res.status(400).json({ success: false, message: 'Payment is not verified by the backend' });
    }

    if (requestedAmount < 1 || requestedAmount !== expectedAmount) {
      return res.status(400).json({ success: false, message: 'Payment amount does not match the order total' });
    }

    const provider = normalizePaymentMethod(order.paymentMethod);
    const allowedMethods = new Set(['PhonePe', 'UPI', 'Direct Bank Transfer']);
    if (provider === 'COD' || !allowedMethods.has(provider)) {
      return res.status(400).json({ success: false, message: 'This order is not configured for online payment verification' });
    }

    const transactionId = String(req.body.transactionId || order.transactionId || `TXN-${Date.now()}`);
    const providerName = String(req.body.provider || provider);
    if (providerName !== provider) {
      return res.status(400).json({ success: false, message: 'Selected payment provider does not match the stored order provider' });
    }

    order.paymentStatus = 'Paid';
    order.transactionId = transactionId;
    order.amountPaid = requestedAmount;
    order.paymentDate = req.body.paymentDate || new Date().toISOString().slice(0, 10);
    order.paymentTime = req.body.paymentTime || new Date().toLocaleTimeString();
    order.status = 'Order Placed';
    await order.save();

    res.json({ success: true, data: order, message: 'Payment verified and order confirmed' });
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
      updates.finalDesignFile = await saveUpload(req.file);
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

module.exports = { createOrder, getOrderById, getOrders, updateOrder, verifyOrderPayment };
