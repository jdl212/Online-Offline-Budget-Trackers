const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const recordSchema = new Schema({
  name: {
    type: String,
    trim: true,
    required: "Enter a name for record"
  },
  value: {
    type: Number,
    required: "Enter an amount"
  },
  date: {
    type: Date,
    default: Date.now
  }
});

const Record = mongoose.model("record", recordSchema);

module.exports = Record;
