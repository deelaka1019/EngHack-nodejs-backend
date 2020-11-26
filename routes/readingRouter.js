const readingRouter = require("express").Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const auth = require("../middleware/auth");
const Reading = require("../models/readingModel");
const User = require("../models/userModel");

readingRouter.post("/", async (req, res) => {
    try {
        const username = req.body.username;
        const password = req.body.password;

        // validate
        if (!username || !password) {
            return res.status(400).json({ msg: "Not all required fields have been entered!" });
        } else {
            const existingUser = await User.findOne({ username: username });

            if (!existingUser) {
                return res
                .status(400)
                .json({ msg: "An account with this Username does not exists!" });
            } else {
                const passwordMatch = await bcrypt.compare(password, existingUser.password);
                if (!passwordMatch) {
                    return res
                    .status(400)
                    .json({ msg: "Not Authorized!" });
                } else {
                    await Reading.find()
                    .then((readings) => res.json(readings))
                    .catch((err) => res.status(400).json(err));
                }
            }
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

readingRouter.post("/create", async (req, res) => {
    try {
        const title = req.body.title;
        const description = req.body.description;
        const date = req.body.date;
    
        // validate
        if (!title || !date || !description) {
            return res.status(400).json({ msg: "Not all fields have been entered." });
        } else {
            const newReading = new Reading({
                title,
                description,
                date
            });
            const savedReading = await newReading.save()
            .then(() => {
                res.json('New reading material is created!');
            })
            .catch(err => res.status(400).json(err));
        }
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
});

module.exports = readingRouter;