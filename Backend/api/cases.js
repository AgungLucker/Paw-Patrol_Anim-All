// backend/api/cases.js
const express = require('express');
const router = express.Router();
const Case = require('../models/case');
const multer = require('multer');
const { uploadFile} = require('@uploadcare/upload-client'); 
const { v4: uuidv4 } = require('uuid');
const { body, validationResult } = require('express-validator'); 

// konfigurasi multer
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });


const UPLOADCARE_PUBLIC_KEY = process.env.UPLOADCARE_PUBLIC_KEY;
// POST (create case)
router.post('/', upload.single('picture'), [
    body('name').isString().isLength({ min: 2 }).withMessage('Nama hewan minimal 2 karakter'),
    body('speciesType').isString().notEmpty().withMessage('Species type harus berupa string dan tidak kosong'),
    body('description').isString().notEmpty().withMessage('Deskripsi harus berupa string dan tidak kosong'),
    body('area').isString().isLength({ min: 2 }).withMessage('Area harus berupa string minimal 2 karakter'),
    body('ownerAddress').isString().notEmpty().withMessage('Alamat pemilik harus berupa string dan tidak kosong'),
    body('ownerContact').isNumeric().isLength({ min: 10, max: 13 }).withMessage('Kontak pemilik harus berupa angka dengan panjang 10-13 digit'),
    body('lostDate').isISO8601().toDate().withMessage('lostDate harus dalam format ISO 8601'),
    ], 
    async (req, res) => {
        // validasi input
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            console.error("Validation errors:", errors); 
            return res.status(400).json({ errors: errors.array()});
        }
        try {
            console.log('Received body:', req.body);
            console.log('Received file:', req.file);
            let imgUrl = '';
            const confirmationCode = uuidv4().substring(0, 8); // kode buat konfirmasi update, close case

            // cek req terima parameter gambar
            if (req.file) {
                // mekanisme simpen gambar ke uploadcare
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
            } 

            const newCaseData = {
                ...req.body,
                picture: imgUrl,
                confirmationCode: confirmationCode,
            };
            const newCase = new Case(newCaseData);
            const savedCase = await newCase.save(); //kirim ke mongodb

            res.status(201).json({
                message: 'Case created successfully',
                case: savedCase
            });
        } catch (err) {
            console.error("Error save:", err);
            res.status(500).json({ message: err.message, errors: err.errors });
        }
    }
);

// GET
router.get('/', async (req, res) => {
    try {
        const cases = await Case.find().select('-confirmationCode -__v'); // ambil semua data case, kecuali confirmationCode
        res.json(cases);
    } catch (err) {
        console.error("Error get:", err);
        res.status(500).json({ message: err.message });
    }
});

// GET single case
router.get('/:reportID', async (req, res) => {
    try {
        const {reportID} = req.params;
        const caseItem = await Case.findOne({ reportID: reportID }).select('status');
        if (!caseItem) {
            return res.status(404).json({ message: 'Case tidak ditemukan' });
        }
        res.json(caseItem);
    } catch (err) {
        console.error("Error get single case:", err);
        res.status(500).json({ message: err.message });
    }
});

//PUT (update data buat update/close case), 
router.put('/:reportID', upload.single('picture'), [
    body('name').trim().optional(({ checkFalsy: true })).isString().isLength({ min: 2 }).withMessage('Nama hewan minimal 2 karakter'),
    body('speciesType').trim().optional({ checkFalsy: true }).isString().notEmpty().withMessage('Species type harus berupa string dan tidak kosong'),
    body('description').trim().optional(({ checkFalsy: true })).isString().notEmpty().withMessage('Deskripsi harus berupa string dan tidak kosong'),
    body('area').trim().optional({ checkFalsy: true }).isString().isLength({ min: 2 }).withMessage('Area harus berupa string minimal 2 karakter'),
    body('ownerAddress').trim().optional({ checkFalsy: true }).isString().notEmpty().withMessage('Alamat pemilik harus berupa string dan tidak kosong'),
    body('ownerContact').trim().optional({ checkFalsy: true }).isNumeric().isLength({ min: 10, max: 13 }).withMessage('Kontak pemilik harus berupa angka dengan panjang 10-13 digit'),
    body('lostDate').optional({ checkFalsy: true }).isISO8601().toDate().withMessage('lostDate harus dalam format ISO 8601'),

    body('confirmationCode').trim().isString().notEmpty().withMessage('Confirmation code harus diisi'),
    body('status').trim().optional({ checkFalsy: true }).isIn(['lost', 'found', 'returned']).withMessage('status tidak valid'),
    ], 
    async(req, res) => {
        // validasi input
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const validationErrors = errors.array();
            console.error("Validation errors:", validationErrors); // Ini akan tetap melog ke konsol server
            return res.status(400).json({ errors: validationErrors});

        }
        try {
            console.log('Received body:', req.body);
            console.log('Received file:', req.file);

            const {reportID} = req.params;
            const {confirmationCode, ...reqUpdateData} = req.body;

            // cari kasus berdasarkan reportID
            const existingCase = await Case.findOne({reportID: reportID});
            if (!existingCase) { //reportID tidak valid
                return res.status(404).json({message: 'Case tidak ditemukan.'});
            }

            // validasi confirmationCode    
            if (existingCase.confirmationCode != confirmationCode) {
                return res.status(401).json({message: 'Confirmation code salah'});
            }

            const updatedData = {};
            for (const key in reqUpdateData) {
                if (reqUpdateData[key] !== '') {
                    updatedData[key] = reqUpdateData[key];
                }
            }

            let updatedPicUrl = existingCase.picture; // default pic
            // upload picture ke uploadcare
            if (req.file) { 
                try {
                    const file = await uploadFile(req.file.buffer, {
                        publicKey: UPLOADCARE_PUBLIC_KEY,
                        fileName: req.file.originalname,
                    });
                    updatedPicUrl = file.cdnUrl;
                    updatedData.picture = updatedPicUrl;
                } catch(err) {
                    console.error("Error uploading picture to Uploadcare:", err.message);
                    throw new Error('Gagal mengubah updated picture ke UploadCare!');
                }
            }



            Object.assign(existingCase, updatedData); // salin modifikasi data ke data case yang diubah
            const updatedCase = await existingCase.save(); // save ke mongodb

            res.status(201).json({
                message: 'Case updated successfully',
                case: updatedCase
            }); 
        } catch (err) {
            console.error("Error updating case:", err);
            res.status(500).json({ message: err.message });
        }


})


module.exports = router;


