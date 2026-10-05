require('dotenv').config(); // Loads your hidden .env variables
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files and allow Express to read JSON data
app.use(express.static(__dirname));
app.use(express.json()); 

// Connect to MongoDB Atlas
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ Connected to MongoDB Atlas successfully!'))
    .catch(err => console.error('❌ MongoDB connection error:', err));

// Define what your data looks like (Mongoose Schema)
const portfolioSchema = new mongoose.Schema({
    about: { type: String, default: "" },
    contact: { 
        email: { type: String, default: "" }, 
        calLink: { type: String, default: "" } 
    },
    certificates: { type: Array, default: [] },
    videoEditing: { type: Array, default: [] },
    colorGrading: { type: Array, default: [] }
});

// Create the model
const Portfolio = mongoose.model('Portfolio', portfolioSchema);

// Read Database (Used by Public Site & Admin)
app.get('/api/projects', async (req, res) => {
    try {
        // Find the first document in the database
        let data = await Portfolio.findOne();
        
        // If the database is completely empty (first time running), create a blank slate
        if (!data) {
            data = await Portfolio.create({});
        }
        res.json(data);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to read cloud database" });
    }
});

// Write to Database (Used ONLY by Admin Portal)
app.post('/api/projects', async (req, res) => {
    try {
        let data = await Portfolio.findOne();
        if (!data) {
            data = new Portfolio();
        }

        // Overwrite the cloud document with the new data from your Admin Portal
        data.about = req.body.about;
        data.contact = req.body.contact;
        data.certificates = req.body.certificates;
        data.videoEditing = req.body.videoEditing;
        data.colorGrading = req.body.colorGrading;

        await data.save();
        res.send("Cloud database updated successfully");
    } catch (err) {
        console.error(err);
        res.status(500).send("Error saving to cloud database");
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`🚀 Server is live! Open http://localhost:${PORT}`);
});