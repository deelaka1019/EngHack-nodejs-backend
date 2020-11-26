const mongoose = require("mongoose");

const readingSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    date: { type: String, required: true }
});

module.exports = Reading = mongoose.model("reading", readingSchema);