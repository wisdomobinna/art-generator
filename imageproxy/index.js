const functions = require('firebase-functions');
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
app.use(cors());

app.get('/proxy-image', async function(req, res) {
  try {
    const imageUrl = req.query.url;
    if (!imageUrl) {
      return res.status(400).send('No URL provided');
    }

    console.log('Fetching image from:', imageUrl);
    const response = await fetch(imageUrl);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.status}`);
    }

    const buffer = await response.buffer();
    
    res.setHeader('Content-Type', 'image/png');
    res.send(buffer);
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).send(`Error fetching image: ${error.message}`);
  }
});

exports.imageProxy = functions.https.onRequest(app);