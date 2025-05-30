const mongoose = require('mongoose');

const idCounterSchema = new mongoose.Schema({
    _id: {type: String, required: true},
    seq: {type: Number, default: 0}
});

idCounterSchema.statics.getNextSequence = async function(name) {
    const retVal = await this.findByIdAndUpdate(
        {_id: name},
        {$inc: {seq: 1}},
        {new: true, upsert: true, runValidators: true}
    )
    return retVal.seq;
}

const IDCounter = mongoose.model('idCounter', idCounterSchema)
module.exports = IDCounter;