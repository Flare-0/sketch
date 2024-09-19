const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const secrets = require( './secrets');
const app = express();
const port = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const apiKey = secrets.geminiApiKey; // Replace with your actual API key
const geminiApi = new GoogleGenerativeAI(apiKey);

app.post('/upload', async (req, res) => {
  try {
    const imageFile = req.files.image;
    if (!imageFile || !imageFile[0]) {
      return res.status(400).json({ error: 'No image uploaded' });
    }

    const imagePath = path.join(__dirname, 'uploads', imageFile[0].originalname);
    await fs.mkdir(path.dirname(imagePath), { recursive: true });
    await fs.writeFile(imagePath, imageFile[0].buffer);

    const { width, height } = await new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve({ width: img.width, height: img.height });
      img.onerror = reject;
      img.src = imagePath;
    });

    const model = geminiApi.getGenerativeModel({
      model: "gemini-1.5-pro-latest",
      generationConfig: { response_mime_type: "application/json" },
    });

    const prompt = `Analyze the image attached to this message. The width of the provided picture is ${width} and height is ${height}`;

    const result = await model.generateContent(prompt, {
      image: imagePath,
      imageType: "file"
    });

    const jsonResponse = await result.response.json();

    res.status(200).json(jsonResponse);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error processing image with Gemini' });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

