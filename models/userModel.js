const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true, minlength: 10 },
    name: { type: String, required: true },
    nic: { type: String, required: true },
    address: { type: String, required: true },
    mobile: { type: String, required: true, minlength: 10, maxlength: 10 },
    email: { type: String, required: true },
    status: { type: String, required: true },
});

module.exports = User = mongoose.model("user", userSchema);