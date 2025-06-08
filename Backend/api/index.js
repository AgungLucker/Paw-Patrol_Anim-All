// backend/api/index.js
const express = require('express');
const cors = require('cors');
const app = express();
require('dotenv').config(); 


const connectDB = require('../config/db'); 
const casesRouter = require('./cases'); 


app.use(cors());
app.use(express.json());

// connect to mongodb
app.use(async (req, res, next) => {
    try {
        await connectDB();
        next();
    } catch (err) {
        console.error("Database connection failed in middleware:", err);
        res.status(500).json({ message: "Failed to connect to database." });
    }
})



app.get('/', (req, res) => {
    res.send('Backend server berjalan');
});

// Current test
app.use('/api/cases', casesRouter); 

// app.listen(port, () => {
    // console.log(`server is listening to port ${port}`);
// });

module.exports = app;