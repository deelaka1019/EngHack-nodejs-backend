const mongoose = require("mongoose");

const articleSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    views: { type: Number, required: true },
});

module.exports = Article = mongoose.model("article", articleSchema);