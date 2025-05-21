// backend/api/index.js
const express = require('express');
const cors = require('cors');
const app = express();
require('dotenv').config(); 


const connectDB = require('../config/db'); 
const casesRouter = require('./cases'); 

const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());



connectDB();

app.get('/', (req, res) => {
    res.send('Backend server berjalan');
});

// Current test
app.use('/api/cases', casesRouter); 

app.listen(port, () => {
    console.log(`server is listening to port ${port}`);
});
