const Design = require('../models/Design');
const Order = require('../models/Order');

// @desc  Get paginated designs with search/filter (supports catalogue with 5k-10k designs)
// @route GET /api/designs?page=1&limit=20&category=xxx&search=xxx
const getDesigns = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), 100);
    const skip = (page - 1) * limit;

    const filter = { isActive: true };
    if (req.query.category) {
      filter.category = req.query.category;
    }
    if (req.query.search) {
      filter.$text = { $search: req.query.search };
    }
    if (req.query.featured === 'true') {
      filter.isFeatured = true;
    }

    const sortOptions = {
      latest: { createdAt: -1 },
      popular: { isFeatured: -1, createdAt: -1 },
      'price-asc': { price: 1 },
      'price-desc': { price: -1 },
    };
    const sortBy = sortOptions[req.query.sort] || sortOptions.latest;

    const [designs, total] = await Promise.all([
      Design.find(filter)
        .select('title description thumbnail category price isFeatured sizeOptions createdAt')
        .populate('category', 'name slug')
        .sort(sortBy)
        .skip(skip)
        .limit(limit)
        .lean(),
      Design.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: designs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: skip + designs.length < total,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Get single design detail (includes real order count for social proof)
// @route GET /api/designs/:id
const getDesignById = async (req, res) => {
  try {
    const design = await Design.findById(req.params.id).populate('category', 'name slug').lean();
    if (!design) {
      return res.status(404).json({ success: false, message: 'Design not found' });
    }
    const orderCount = await Order.countDocuments({ design: design._id });
    res.json({ success: true, data: { ...design, orderCount } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Create design
// @route POST /api/admin/designs
const createDesign = async (req, res) => {
  try {
    const { title, description, category, tags, sizeOptions, price, isFeatured } = req.body;
    const thumbnail = req.files?.thumbnail?.[0] ? `/uploads/${req.files.thumbnail[0].filename}` : '';
    const fullImage = req.files?.fullImage?.[0] ? `/uploads/${req.files.fullImage[0].filename}` : thumbnail;

    const design = await Design.create({
      title,
      description,
      category,
      thumbnail,
      fullImage,
      tags: tags ? tags.split(',').map((t) => t.trim()) : [],
      sizeOptions: sizeOptions ? sizeOptions.split(',').map((s) => s.trim()) : [],
      price,
      isFeatured: isFeatured === 'true' || isFeatured === true,
    });

    res.status(201).json({ success: true, data: design });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc  Update design
// @route PUT /api/admin/designs/:id
const updateDesign = async (req, res) => {
  try {
    const updates = { ...req.body };
    if (updates.tags) updates.tags = updates.tags.split(',').map((t) => t.trim());
    if (updates.sizeOptions) updates.sizeOptions = updates.sizeOptions.split(',').map((s) => s.trim());
    if (req.files?.thumbnail?.[0]) updates.thumbnail = `/uploads/${req.files.thumbnail[0].filename}`;
    if (req.files?.fullImage?.[0]) updates.fullImage = `/uploads/${req.files.fullImage[0].filename}`;

    const design = await Design.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });
    if (!design) {
      return res.status(404).json({ success: false, message: 'Design not found' });
    }
    res.json({ success: true, data: design });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc  Delete design
// @route DELETE /api/admin/designs/:id
const deleteDesign = async (req, res) => {
  try {
    const design = await Design.findByIdAndDelete(req.params.id);
    if (!design) {
      return res.status(404).json({ success: false, message: 'Design not found' });
    }
    res.json({ success: true, message: 'Design deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getDesigns, getDesignById, createDesign, updateDesign, deleteDesign };
