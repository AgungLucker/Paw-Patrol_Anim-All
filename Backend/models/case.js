
const mongoose = require('mongoose');

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
    status: {
        type: String,
        enum: ['lost', 'found'],
        default: 'lost',
        required: true
    }
}, {
  timestamps: true 
});

module.exports = mongoose.model('Case', caseSchema);