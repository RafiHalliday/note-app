require("dotenv").config();

const config = require("./config.json");
const mongoose = require("mongoose");

const User = require("./models/user.model");

const express = require("express");
const cors = require("cors");
const app = express();

const jwt = require("jsonwebtoken");
const { authenticateToken } = require("./utilities");

mongoose.connect(config.connectionString);

app.use(express.json());

app.use(
    cors({
        origin: "*",
    })
);

// app.use(express.urlencoded({ extended: true })); // For form data
// app.use(express.json()); // For JSON bodies

app.get("/", (req, res) => {
    res.json({ data: "hello" });
});

// Create account
app.post("/create-account", async (req, res) => {

    const { fullName, email, password } = req.body;

    if (!fullName) {
        return res
            .status(400)
            .json({ error: true, message: "Full name is required!" });
    }

    if (!email) {
        return res
            .status(400)
            .json({ error: true, message: "Email is required!" });
    }

    if (!password) {
        return res
            .status(400)
            .json({ error: true, message: "Password is required!" });
    }

    const isUser = await User.findOne({ email: email });

    if (isUser) {
        return res.json({
            error: true,
            message: "Email already registered!",
        });
    }

    const user = new User({
        fullName,
        email,
        password,
    });

    await user.save();

    const accessToken = jwt.sign({ user }, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "3600m",
    })

    return res.json({
        error: false,
        user,
        accessToken,
        message: "Registration successful",
    })
});

app.post("/login", async (req, res) => {
    const { email, password } = req.body;
    if (!email) {
        return res
            .status(400)
            .json({ error: true, message: "Email is required!" });
    }

    if (!password) {
        return res
            .status(400)
            .json({ error: true, message: "Password is required!" });
    }

    const userInfo = await User.findOne({ email: email });

    if (!userInfo) {
        return res
            .status(400)
            .json({ error: true, message: "User not found!" });
    }

    if (userInfo.email == email && userInfo.password == password) {
        const user = { user: userInfo };
        const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
            expiresIn: "3600m",
        });

        return res.json({
            error: false,
            message: "Login succesful",
            email,
            accessToken,
        });
    } else {
        return res
            .status(400)
            .json({
                error: true,
                message: "Invalid credentials!",
            });
    }
});

app.listen(8000);

module.exports = app;