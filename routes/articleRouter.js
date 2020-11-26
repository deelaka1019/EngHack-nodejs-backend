const articleRouter = require("express").Router();
const bcrypt = require("bcryptjs");
const Article = require("../models/articleModel");
const User = require("../models/userModel");

articleRouter.post("/", async (req, res) => {
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
                    await Article.find()
                    .then((articles) => res.json(articles))
                    .catch((err) => res.status(400).json(err));
                }
            }
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

articleRouter.post("/create", async (req, res) => {
    try {
        const title = req.body.title;
        const description = req.body.description;
        const views = 0;
    
        // validate
        if (!title || !description) {
            return res.status(400).json({ msg: "Not all fields have been entered." });
        } else {
            const newArticle = new Article({
                title,
                description,
                views
            });
            const savedArticles = await newArticle.save()
            .then(() => {
                res.json('New article is created!');
            })
            .catch(err => res.status(400).json(err));
        }
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
});

articleRouter.post("/views", async (req, res) => {
    try {
        const username = req.body.username;
        const password = req.body.password;
        const views = req.body.views;
        const _id = req.body._id;

        if (!username || !password || !views || !_id) {
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
                    const existingArticle = await Article.findOne({ _id: _id });
                    Article.findByIdAndUpdate(existingArticle._id)
                    .then((articles) => {
                        articles.views = views;
                        articles.save()
                        .then(() => res.json('Views counter updated!'))
                        .catch(err => res.status(400).json(err));
                    })
                    .catch(err => res.status(400).json(err));
                }
            }
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = articleRouter;