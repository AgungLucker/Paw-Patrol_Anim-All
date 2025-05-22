const express = require('express');
const router = express.Router();
const Case = require('../models/case');
const multer = require('multer');
const { uploadFile } = require('@uploadcare/upload-client');
const { v4: uuidv4 } = require('uuid');

// konfigurasi multer
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });


const UPLOADCARE_PUBLIC_KEY = process.env.UPLOADCARE_PUBLIC_KEY;

// POST
router.post('/', upload.single('picture'), async (req, res) => {
    try {
        let imgUrl = '';
        const confirmationCode = uuidv4().substring(0, 8); //kode buat konfirmasi update, close case

        if (req.file) {
            try {
                const file = await uploadFile(req.file.buffer, {
                    publicKey: UPLOADCARE_PUBLIC_KEY,
                    fileName: req.file.originalname,
                });
                imgUrl = file.cdnUrl;
            } catch(err) {
                console.error("Error uploading to Uploadcare:", err.message);
                throw new Error('Could not upload file to Uploadcare.');
            }
        } else {
            imgUrl = 'https://via.placeholder.com/150?text=No+Image';
        }

        const newCaseData = {
            ...req.body,
            picture: imgUrl,
            confirmationCode: confirmationCode,
        };
        const newCase = new Case(newCaseData);
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

//PUT
//TODO:

module.exports = router;