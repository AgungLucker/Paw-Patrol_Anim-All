
const mongoose = require('mongoose');
const IDCounter = require('./idCounter'); 

// atribut data di database mongodb
const caseSchema = new mongoose.Schema({
    reportID: {
        type: Number,
        unique: true,
    },
    name: {
        type: String,
        required: true,
        minlength: 2
    },
    speciesType: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    picture: {
        type: String,
        required: true
    },
    area : {
        type: String,
        required: true,
        minlength: 2
    },
    ownerAddress: {
        type: String,
        required: true
    },
    ownerContact: {
        type: String,
        required: true,
        minlength: 10,
        maxlength: 13
    },
    lostDate: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ['lost', 'found', 'returned'],
        default: 'lost',
        required: true
    }, 
    confirmationCode: {
        type: String,
        required: true,
        unique: true 
    },
    // foundArea, foundDate diinisialisasi di Put (jika ada)
    foundArea: {
        type: String,
        required: false
    },
    foundDate: {
        type: Date,
        required: false
    }
}, {
  timestamps: true 
});

// buat reportID secara incremental
caseSchema.pre('save', async function(next) {
    if (this.isNew && !this.reportID) {
        try {
            const nextId = await IDCounter.getNextSequence('caseID');
            this.reportID = nextId;
            next();
        } catch (err) {
            console.error("Error generating reportID:", err);
            next(err);
        }
    } else {
        next();
    }
});

module.exports = mongoose.model('Case', caseSchema);