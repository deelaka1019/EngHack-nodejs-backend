const userRouter = require("express").Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const auth = require("../middleware/auth");
const User = require("../models/userModel");

userRouter.post("/", auth, async (req, res) => {
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
                    await User.findOne({ username: username })
                    .then((user) => res.json(user))
                    .catch(err => res.status(400).json(err));
                }
            }
        }
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
});

userRouter.post("/register", async (req, res) => {
    try {
        const username = req.body.username;
        const newPassword = req.body.newPassword;
        const confirmPassword = req.body.confirmPassword;
        const name = req.body.name;
        const nic = req.body.nic;
        const address = req.body.address;
        const mobile = req.body.mobile;
        const email = req.body.email;
        const status = "Pending";
    
        // validate
        if (!username || !newPassword || !confirmPassword || !name || !nic || !address || !mobile || !email || !status) {
            return res.status(400).json({ msg: "Not all required fields have been entered!" });
        } else {
            const existingUser = await User.findOne({ username: username });

            if (existingUser) {
                return res
                .status(400)
                .json({ msg: "An account with this Username already exists!" });
            } else if (mobile.length !== 10) {
                return res
                .status(400)
                .json({ msg: "Mobile number must have 10 characters!" });
            } else if ((newPassword.length < 10) || (confirmPassword.length < 10)) {
                return res
                .status(400)
                .json({ msg: "Password needs to be atleast 10 characters long!" });
            } else if (!/[!@#$%^&*]/.test(newPassword)) {
                return res
                .status(400)
                .json({msg: "Password must have at least one special character! Eg: !,@,#,$,%,^,&,*"});
            } else if (newPassword !== confirmPassword) {
                return res
                .status(400)
                .json({ msg: "Confirm password does not match!" });
            } else {
                const salt = await bcrypt.genSalt();
                const passwordHash = await bcrypt.hash(newPassword, salt);

                const newUser = new User({
                    username,
                    password: passwordHash,
                    name,
                    nic,
                    address,
                    mobile,
                    email,
                    status
                });
                const savedUser = await newUser.save()
                .then(() => {
                    const user = User.findOne({ username: username });
                    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
                    User.findOne(user)
                    .then((user) => {
                        res.json({
                            token,
                            user
                        });
                    })
                    .catch(err => res.status(400).json(err));
                })
                .catch(err => res.status(400).json(err));
            }   
        }
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
});

userRouter.post("/login", async (req, res) => {
    try {
        const username = req.body.username;
        const password = req.body.password;

        // validate
        if (!username || !password) {
            return res
            .status(400)
            .json({ msg: "Not all required fields have been entered!" });
        } else {
            const user = await User.findOne({ username: username });

            if (!user) {
                return res
                .status(400)
                .json({ msg: "An account with this Username does not exists!" });
            } else if(!(password.length >= 10)) {
                return res
                .status(400)
                .json({ msg: "Password needs to be atleast 10 characters long!" });
            } else if (!/[!@#$%^&*]/.test(password)) {
                return res
                .status(400)
                .json({msg: "Password must have at least one special character! Eg: !,@,#,$,%,^,&,*"});
            } else {
                const passwordMatch = await bcrypt.compare(password, user.password);
                if (!passwordMatch) {
                    return res
                    .status(400)
                    .json({ msg: "Invalid password!" });
                } else {
                    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
                    await User.findOne(user)
                    .then((user) => {
                        res.json({
                            token,
                            user
                        });
                    })
                    .catch(err => res.status(400).json(err));
                }
            }
        }
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
});

userRouter.post("/reset", auth, async (req, res) => {
    try {
        const username = req.body.username;
        const currentPassword = req.body.currentPassword;
        const newPassword = req.body.newPassword;
        const confirmPassword = req.body.confirmPassword;

        if (!username || !currentPassword || !newPassword || !confirmPassword) {
            return res.status(400).json({ msg: "Not all required fields have been entered!" });
        } else {
            const existingUser = await User.findOne({ username: username });

            if (!existingUser) {
                return res
                .status(400)
                .json({ msg: "An account with this Username does not exists!" });
            } else {
                const passwordMatch = await bcrypt.compare(currentPassword, existingUser.password);

                if (!passwordMatch) {
                    return res
                    .status(400)
                    .json({ msg: "Current password does not match!" });
                } else if ((newPassword.length < 10) || (confirmPassword.length < 10)) {
                    return res
                    .status(400)
                    .json({ msg: "Password needs to be atleast 10 characters long!" });
                } else if (!/[!@#$%^&*]/.test(newPassword)) {
                    return res
                    .status(400)
                    .json({msg: "Password must have at least one special character! Eg: !,@,#,$,%,^,&,*"});
                } else if (newPassword !== confirmPassword) {
                    return res
                    .status(400)
                    .json({ msg: "Confirm password does not match!" });
                } else {
                    const salt = await bcrypt.genSalt();
                    const passwordHash = await bcrypt.hash(confirmPassword, salt);
        
                    User.findByIdAndUpdate(existingUser._id)
                    .then((user) => {
                        user.password = passwordHash;
                        user.save()
                        .then(() => res.json('Password reset successful!'))
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

module.exports = userRouter;