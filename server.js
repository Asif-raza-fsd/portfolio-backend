require('dotenv').config(); 
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors'); // <-- Added CORS

const app = express();
const PORT = process.env.PORT || 3000;

// Allow external websites (like Netlify) to access this API
app.use(cors()); // <-- Added CORS middleware
app.use(express.json()); 

// Connect to MongoDB Atlas
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ Connected to MongoDB Atlas successfully!'))
    .catch(err => console.error('❌ MongoDB connection error:', err));

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

const Portfolio = mongoose.model('Portfolio', portfolioSchema);

app.get('/api/projects', async (req, res) => {
    try {
        let data = await Portfolio.findOne();
        if (!data) {
            data = await Portfolio.create({});
        }
        res.json(data);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to read cloud database" });
    }
});

app.post('/api/projects', async (req, res) => {
    try {
        let data = await Portfolio.findOne();
        if (!data) {
            data = new Portfolio();
        }

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

app.listen(PORT, () => {
    console.log(`🚀 Server is live! Open http://localhost:${PORT}`);
});