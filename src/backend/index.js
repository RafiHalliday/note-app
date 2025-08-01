// require("dotenv").config();

const connectDB = require('./config/db');

const mongoose = require("mongoose");

const User = require("./models/user.model");
const Note = require("./models/note.model");

const express = require("express");
const cors = require("cors");
const app = express();

const jwt = require("jsonwebtoken");
const { authenticateToken } = require("./utilities");

connectDB();

// app.use(express.urlencoded({ extended: true })); // For form data
// app.use(express.json()); // For JSON bodies

app.use(express.json());

app.use(
    cors({
        origin: "*",
    })
);


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

// Login
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

// Get user
app.get("/get-user", authenticateToken, async (req, res) => {
    const { user } = req.user;

    const isUser = await User.findOne({ _id: user._id });

    if (!isUser) {
        return res.status(401);
    }

    return res.json({
        user: {
            fullName: isUser.fullName,
            email: isUser.email,
            "_id": isUser._id,
            createdOn: isUser.createdOn,
        },
        message: "",
    });
});

// Add new note
app.post("/add-note", authenticateToken, async (req, res) => {
    const { title, content, tags } = req.body;
    const { user } = req.user;

    if (!title) {
        return res
            .status(400)
            .json({ error: true, message: "Title is required!" });
    }

    if (!content) {
        return res
            .status(400)
            .json({ error: true, message: "Content is required!" });
    }

    try {
        const note = new Note({
            title,
            content,
            tags: tags || [],
            userId: user._id,
        });

        await note.save();

        return res.json({
            error: false,
            note,
            message: "Note added succesfully",
        });
    } catch (error) {
        return res
            .status(500)
            .json({
                error: true,
                message: "Internal server error",
            });
    }
});

// Edit note
app.put("/edit-note/:noteId", authenticateToken, async (req, res) => {
    const { noteId } = req.params;
    const { title, content, tags, isPinned } = req.body;
    const { user } = req.user;

    if (!title && !content && !tags) {
        return res
            .status(400)
            .json({ error: true, message: "No changes provided!" });
    }

    try {
        const note = await Note.findOne({ _id: noteId, userId: user._id });

        if (!note) {
            return res
                .status(404)
                .json({
                    error: true,
                    message: "Note not found!",
                });
        }

        if (title) note.title = title;
        if (content) note.content = content;
        if (tags) note.tags = tags;
        if (isPinned) note.isPinned = isPinned;

        await note.save();

        return res.json({
            error: false,
            note,
            message: "Note updated succesfully",
        });
    } catch (error) {
        return res
            .status(500)
            .json({
                error: true,
                message: "Internal server error",
            });
    }
});

// Get all notes
app.get("/get-all-notes/", authenticateToken, async (req, res) => {
    // const { user } = req.user;
    const userId = req.user.user?._id;


    try {
        const notes = await Note.find({ userId }).sort({ isPinned: -1 });
        // const notes = await Note
        // .find({ userId: user._id})
        // .sort({ isPinned: -1});

        return res.json({
            error: false,
            notes,
            message: "All notes retrieved succesfully",
        });
    } catch (error) {
        return res
            .status(500)
            .json({
                error: true,
                message: "Internal server error",
            });
    }
})

// Delete note
app.delete("/delete-note/:noteId", authenticateToken, async (req, res) => {
    const { noteId } = req.params;
    const { user } = req.user;

    try {
        const note = await Note.findOne({ _id: noteId, userId: user._id });

        if (!note) {
            return res
                .status(404)
                .json({
                    error: true,
                    message: "Note not found!",
                });
        }

        await Note.deleteOne({ _id: noteId, userId: user._id });

        return res.json({
            error: false,
            message: "Note deleted succesfully",
        });
    } catch (error) {
        return res
            .status(500)
            .json({
                error: true,
                message: "Internal server error",
            });
    }
})

// Pin note
app.put("/update-note-pinned/:noteId", authenticateToken, async (req, res) => {
    const { noteId } = req.params;
    const { isPinned } = req.body;
    const { user } = req.user;

    try {
        const note = await Note.findOne({ _id: noteId, userId: user._id });

        if (!note) {
            return res
                .status(404)
                .json({
                    error: true,
                    message: "Note not found!",
                });
        }

        note.isPinned = isPinned;

        await note.save();

        return res.json({
            error: false,
            note,
            message: "Note updated succesfully",
        });
    } catch (error) {
        return res
            .status(500)
            .json({
                error: true,
                message: "Internal server error",
            });
    }
})

// Search notes
app.get("/search-notes/", authenticateToken, async (req, res) => {
    const { user } = req.user;
    const { query } = req.query;

    if (!query) {
        return res
            .status(400)
            .json({
                error: true,
                message: "Search query required!",
            })
    }

    try {
        const matchingNotes = await Note.find({
            userId: user._id,
            $or: [
                { title: { $regex: new RegExp(query, "i") } },
                { content: { $regex: new RegExp(query, "i") } },
            ],
        })
        return res.json({
            error: false,
            notes: matchingNotes,
            message: "Notes matching the search query retrieved successfully",
        })
    } catch (error) {
        return res
            .status(500)
            .json({
                error: true,
                message: "Internal server error"
            })
    }
})

app.listen(8000);

module.exports = app;