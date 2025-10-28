const express = require('express');
const router = express.Router();
const Business = require('../models/Business');
const authMiddleware = require('../middleware/auth');

// Business adds menu item
router.post('/add', authMiddleware('business'), async (req, res) => {
    const { name, price } = req.body;
    const business = await Business.findById(req.userId);
    business.menu.push({ name, price });
    await business.save();
    res.json({ success: true, menu: business.menu });
});

// Customer fetch all menus
router.get('/all', authMiddleware(), async (req, res) => {
    const businesses = await Business.find({}, 'name menu clockNumber');
    res.json({ success: true, businesses });
});

module.exports = router;
