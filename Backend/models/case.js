
const mongoose = require('mongoose');

// atribut data di database mongodb
const caseSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
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
        required: true
    },
    lostDate: {
        type: Date,
        default: Date.now
    },
    postDate: {
        type: Date,
        default: Date.now
    },
    // kalau close case statusnya jadi found
    status: {
        type: String,
        enum: ['lost', 'found'],
        default: 'lost',
        required: true
    }, 
    confirmationCode: {
        type: String,
        required: true,
        unique: true 
    },
    // foundArea, foundDate diinisialisasi di PUT,
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

module.exports = mongoose.model('Case', caseSchema);