const express = require('express');
const router = express.Router();
const Case = require('../models/case');

// TEST 

// POST
router.post('/', async (req, res) => {
    try {
        const newCase = new Case(req.body);
        const savedCase = await newCase.save();
        res.status(201).json(savedCase);
    } catch (err) {
        console.error("Error save:", err);
        res.status(400).json({ message: err.message, errors: err.errors });
    }
});

// GET
router.get('/', async (req, res) => {
    try {
        const cases = await Case.find();
        res.json(cases);
    } catch (err) {
        console.error("Error get:", err);
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;