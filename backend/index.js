import express from 'express';
import multer from 'multer';
import path from 'path';
import cors from 'cors';
import { GoogleAIFileManager } from '@google/generative-ai/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { readFileSync } from 'fs';
import secrets from './secrets.js';

const app = express();
const geminiApiKey = secrets.geminiApiKey;

// Configure multer for image upload
const storage = multer.diskStorage({
    destination: './uploads',
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage }).single('image');

// Enable CORS for all routes
app.use(cors());

// Route for image upload
app.post('/upload', async (req, res) => {
    try {
        upload(req, res, async (err) => {
            if (err instanceof multer.MulterError) {
                return res.status(500).json({ message: 'File upload failed.' });
            } else if (err) {
                return res.status(500).json({ message: 'An unknown error occurred during file upload.' });
            }

            // Send the image to Gemini API
            const imageUrl = `http://localhost:3000/uploads/${req.file.filename}`;
            const prompt = secrets.aiPrompt;

            // Upload file to Google Cloud Storage
            const fileManager = new GoogleAIFileManager(geminiApiKey);
            const uploadResult = await fileManager.uploadFile(path.join(process.cwd(), 'uploads', req.file.filename), {
                mimeType: req.file.mimetype,
                displayName: "Uploaded Image",
            });

            // Generate content using Gemini API with JSON response
            const genAI = new GoogleGenerativeAI(geminiApiKey);
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

            const config = {
                generationConfig: {
                    responseMimeType: 'application/json',
                },
            };

            const result = await model.generateContent([
                prompt,
                {
                    fileData: {
                        fileUri: uploadResult.file.uri,
                        mimeType: uploadResult.file.mimeType,
                    },
                },
            ], config);

            res.json({
                imageUrl: imageUrl,
                geminiResponse: JSON.parse(result.response.text())
            });
        });
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ message: 'An unexpected error occurred.' });
    }
});

// Serve uploaded images
app.use('/uploads', express.static('uploads'));

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
