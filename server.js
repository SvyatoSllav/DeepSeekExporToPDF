#!/usr/bin/env node

/**
 * HTML to PDF API Server
 * REST API for converting HTML to PDF using puppeteer-html-pdf
 */

import express from 'express';
import multer from 'multer';
import cors from 'cors';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import PuppeteerHTMLPDF from 'puppeteer-html-pdf';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, 'uploads');
        fs.ensureDirSync(uploadDir);
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + '.html');
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'text/html' || file.originalname.endsWith('.html')) {
            cb(null, true);
        } else {
            cb(new Error('Only HTML files are allowed!'), false);
        }
    }
});

// HTML to PDF Converter class
class HTMLToPDFConverter {
    constructor() {
        this.htmlPDF = new PuppeteerHTMLPDF();
    }

    async convertHTML(htmlContent, options = {}) {
        const {
            format = 'A4',
            orientation = 'portrait',
            margin = { top: '20px', bottom: '20px', left: '20px', right: '20px' },
            printBackground = true,
            scale = 1.0,
            timeout = 30000
        } = options;

        const pdfOptions = {
            format: format,
            landscape: orientation === 'landscape',
            margin: margin,
            printBackground: printBackground,
            scale: scale,
            timeout: timeout,
            headless: 'new',
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        };

        this.htmlPDF.setOptions(pdfOptions);

        try {
            const pdfBuffer = await this.htmlPDF.create(htmlContent);
            return pdfBuffer;
        } catch (error) {
            throw new Error(`PDF creation failed: ${error.message}`);
        } finally {
            await this.htmlPDF.closeBrowser();
        }
    }

    async close() {
        await this.htmlPDF.closeBrowser();
    }
}

// API Routes

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        service: 'HTML to PDF API'
    });
});

// Convert HTML string to PDF
app.post('/api/convert/string', async (req, res) => {
    try {
        const { html, options = {} } = req.body;
        
        if (!html) {
            return res.status(400).json({ error: 'HTML content is required' });
        }

        const converter = new HTMLToPDFConverter();
        const pdfBuffer = await converter.convertHTML(html, options);
        
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename="converted.pdf"');
        res.send(pdfBuffer);
        
    } catch (error) {
        console.error('Conversion error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Convert HTML file to PDF
app.post('/api/convert/file', upload.single('htmlFile'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'HTML file is required' });
        }

        const options = req.body.options ? JSON.parse(req.body.options) : {};
        const htmlContent = await fs.readFile(req.file.path, 'utf-8');
        
        const converter = new HTMLToPDFConverter();
        const pdfBuffer = await converter.convertHTML(htmlContent, options);
        
        // Clean up uploaded file
        await fs.remove(req.file.path);
        
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename="converted.pdf"');
        res.send(pdfBuffer);
        
    } catch (error) {
        console.error('Conversion error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Convert URL to PDF
app.post('/api/convert/url', async (req, res) => {
    try {
        const { url, options = {} } = req.body;
        
        if (!url) {
            return res.status(400).json({ error: 'URL is required' });
        }

        const converter = new HTMLToPDFConverter();
        const pdfBuffer = await converter.convertHTML(url, options);
        
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename="converted.pdf"');
        res.send(pdfBuffer);
        
    } catch (error) {
        console.error('Conversion error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get conversion options
app.get('/api/options', (req, res) => {
    res.json({
        formats: ['A4', 'Letter', 'Legal', 'Tabloid', 'Ledger', 'A0', 'A1', 'A2', 'A3', 'A5', 'A6'],
        orientations: ['portrait', 'landscape'],
        defaultOptions: {
            format: 'A4',
            orientation: 'portrait',
            margin: { top: '20px', bottom: '20px', left: '20px', right: '20px' },
            printBackground: true,
            scale: 1.0,
            timeout: 30000
        }
    });
});

// Error handling middleware
app.use((error, req, res, next) => {
    console.error('API Error:', error);
    res.status(500).json({ error: error.message });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Endpoint not found' });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 HTML to PDF API server running on port ${PORT}`);
    console.log(`📖 API Documentation:`);
    console.log(`   POST /api/convert/string - Convert HTML string to PDF`);
    console.log(`   POST /api/convert/file   - Convert HTML file to PDF`);
    console.log(`   POST /api/convert/url    - Convert URL to PDF`);
    console.log(`   GET  /api/options        - Get available options`);
    console.log(`   GET  /health             - Health check`);
}); 