const express = require('express');
const router = express.Router();
const Business = require('../models/Business');
const User = require('../models/User');
const twilio = require('twilio');
const authMiddleware = require('../middleware/auth');

const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);

// Place order (customer only)
router.post('/place', authMiddleware('customer'), async (req, res) => {
    const customer = await User.findById(req.userId);
    const { items } = req.body;
    const orderNumber = 'ORD' + Date.now();

    for(const item of items) {
        const business = await Business.findOne({ clockNumber: item.businessId });
        if (!business) continue;

        business.orders.push({
            orderNumber,
            customerName: customer.username,
            customerClock: customer.clockNumber,
            items: [ { name: item.name, price: item.price } ]
        });
        await business.save();

        // Notify business via SMS
        await client.messages.create({
            body: `New Order #${orderNumber} from ${customer.username}`,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: business.phone
        });
    }

    // Notify customer
    await client.messages.create({
        body: `Your order number: ${orderNumber}`,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: customer.phone
    });

    res.json({ success: true, orderNumber });
});

module.exports = router;
