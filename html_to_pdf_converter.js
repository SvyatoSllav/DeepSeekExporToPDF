#!/usr/bin/env node

/**
 * HTML to PDF Converter using puppeteer-html-pdf
 * A Node.js script that converts HTML files to PDF with full style preservation
 */

import PuppeteerHTMLPDF from 'puppeteer-html-pdf';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import { Command } from 'commander';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class HTMLToPDFConverter {
    constructor() {
        this.htmlPDF = new PuppeteerHTMLPDF();
    }

    async convertFromFile(htmlFile, outputPdf, options = {}) {
        try {
            // Verify input file exists
            if (!await fs.pathExists(htmlFile)) {
                throw new Error(`HTML file '${htmlFile}' not found!`);
            }

            // Create output directory if it doesn't exist
            const outputDir = path.dirname(outputPdf);
            await fs.ensureDir(outputDir);

            console.log(`Converting '${htmlFile}' to '${outputPdf}'...`);

            // Read HTML content
            const htmlContent = await fs.readFile(htmlFile, 'utf-8');
            
            // Convert HTML to PDF
            await this.convertHTML(htmlContent, outputPdf, options);
            
            console.log(`✅ Successfully converted to '${outputPdf}'`);
            
        } catch (error) {
            console.error(`❌ Error converting file: ${error.message}`);
            throw error;
        }
    }

    async convertFromURL(url, outputPdf, options = {}) {
        try {
            // Create output directory if it doesn't exist
            const outputDir = path.dirname(outputPdf);
            await fs.ensureDir(outputDir);

            console.log(`Converting URL '${url}' to '${outputPdf}'...`);

            // Convert URL to PDF
            await this.convertHTML(url, outputPdf, options);
            
            console.log(`✅ Successfully converted to '${outputPdf}'`);
            
        } catch (error) {
            console.error(`❌ Error converting URL: ${error.message}`);
            throw error;
        }
    }

    async convertFromString(htmlString, outputPdf, options = {}) {
        try {
            // Create output directory if it doesn't exist
            const outputDir = path.dirname(outputPdf);
            await fs.ensureDir(outputDir);

            console.log(`Converting HTML string to '${outputPdf}'...`);

            // Convert HTML to PDF
            await this.convertHTML(htmlString, outputPdf, options);
            
            console.log(`✅ Successfully converted to '${outputPdf}'`);
            
        } catch (error) {
            console.error(`❌ Error converting string: ${error.message}`);
            throw error;
        }
    }

    async convertHTML(htmlContent, outputPdf, options = {}) {
        const {
            format = 'A4',
            orientation = 'portrait',
            margin = { top: '20px', bottom: '20px', left: '20px', right: '20px' },
            printBackground = true,
            scale = 1.0,
            timeout = 30000,
            headless = 'new'
        } = options;

        // Configure puppeteer-html-pdf options
        const pdfOptions = {
            format: format,
            landscape: orientation === 'landscape',
            margin: margin,
            printBackground: printBackground,
            scale: scale,
            timeout: timeout,
            headless: headless,
            path: outputPdf, // Direct path to save the file
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        };

        // Set options
        this.htmlPDF.setOptions(pdfOptions);

        try {
            // Create PDF
            await this.htmlPDF.create(htmlContent);
            
        } catch (error) {
            console.error(`❌ PDF creation failed: ${error.message}`);
            throw error;
        } finally {
            // Close browser to free up resources
            await this.htmlPDF.closeBrowser();
        }
    }

    async close() {
        await this.htmlPDF.closeBrowser();
    }
}

async function main() {
    const program = new Command();

    program
        .name('html-to-pdf-converter')
        .description('Convert HTML to PDF using puppeteer-html-pdf with full style preservation')
        .version('1.0.0');

    program
        .command('convert')
        .description('Convert HTML to PDF')
        .option('-i, --input <file>', 'Input HTML file path')
        .option('-u, --url <url>', 'Input URL to convert')
        .option('-s, --string <html>', 'HTML content as string')
        .option('-o, --output <file>', 'Output PDF file path (defaults to uploads directory)')
        .option('-f, --format <format>', 'Paper format (A4, Letter, Legal, etc.)', 'A4')
        .option('--orientation <orientation>', 'Page orientation (portrait, landscape)', 'portrait')
        .option('--margin <margin>', 'Page margins in px (top,bottom,left,right)', '20,20,20,20')
        .option('--print-background', 'Print background graphics', true)
        .option('--scale <scale>', 'Scale factor (0.1 to 2.0)', '1.0')
        .option('--timeout <timeout>', 'Timeout in milliseconds', '30000')
        .action(async (options) => {
            // Create uploads directory if it doesn't exist
            const uploadsDir = path.join(__dirname, 'uploads');
            await fs.ensureDir(uploadsDir);

            // Generate default output filename if not provided
            let outputPath = options.output;
            if (!outputPath) {
                const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
                if (options.input) {
                    const inputName = path.basename(options.input, path.extname(options.input));
                    outputPath = path.join(uploadsDir, `${inputName}_${timestamp}.pdf`);
                } else if (options.url) {
                    const urlName = new URL(options.url).hostname.replace(/[^a-zA-Z0-9]/g, '_');
                    outputPath = path.join(uploadsDir, `${urlName}_${timestamp}.pdf`);
                } else if (options.string) {
                    outputPath = path.join(uploadsDir, `string_${timestamp}.pdf`);
                }
            } else {
                // If output path is provided but doesn't include uploads directory, put it there
                if (!path.isAbsolute(outputPath) && !outputPath.startsWith('uploads/')) {
                    outputPath = path.join(uploadsDir, outputPath);
                }
            }

            if (!options.input && !options.url && !options.string) {
                console.error('❌ Input source is required! Use -i, -u, or -s option.');
                process.exit(1);
            }

            const converter = new HTMLToPDFConverter();
            
            try {
                // Parse margins
                const margins = options.margin.split(',').map(m => m.trim() + 'px');
                const margin = {
                    top: margins[0] || '20px',
                    bottom: margins[1] || '20px',
                    left: margins[2] || '20px',
                    right: margins[3] || '20px'
                };

                const pdfOptions = {
                    format: options.format,
                    orientation: options.orientation,
                    margin: margin,
                    printBackground: options.printBackground,
                    scale: parseFloat(options.scale),
                    timeout: parseInt(options.timeout)
                };

                if (options.input) {
                    await converter.convertFromFile(options.input, outputPath, pdfOptions);
                } else if (options.url) {
                    await converter.convertFromURL(options.url, outputPath, pdfOptions);
                } else if (options.string) {
                    await converter.convertFromString(options.string, outputPath, pdfOptions);
                }

                console.log(`📁 PDF saved to: ${outputPath}`);

            } catch (error) {
                console.error(`❌ Conversion failed: ${error.message}`);
                process.exit(1);
            } finally {
                await converter.close();
            }
        });

    program
        .command('help')
        .description('Show help information')
        .action(() => {
            console.log(`
HTML to PDF Converter using puppeteer-html-pdf

Examples:
  # Convert HTML file to PDF (saves to uploads directory by default)
  node html_to_pdf_converter.js convert -i sample.html
  
  # Convert HTML file to PDF with custom output name
  node html_to_pdf_converter.js convert -i sample.html -o my_output.pdf
  
  # Convert URL to PDF
  node html_to_pdf_converter.js convert -u https://example.com
  
  # Convert HTML string to PDF
  node html_to_pdf_converter.js convert -s "<html><body><h1>Hello</h1></body></html>"
  
  # Convert with custom options
  node html_to_pdf_converter.js convert -i sample.html \\
    --format Letter --orientation landscape --margin 30,30,30,30 --scale 0.8

Options:
  -i, --input <file>        Input HTML file path
  -u, --url <url>          Input URL to convert
  -s, --string <html>      HTML content as string
  -o, --output <file>      Output PDF file path (optional, defaults to uploads directory)
  -f, --format <format>    Paper format (default: A4)
  --orientation <orient>   Page orientation (portrait/landscape)
  --margin <margins>       Page margins in px (top,bottom,left,right)
  --print-background       Print background graphics
  --scale <scale>          Scale factor (0.1 to 2.0)
  --timeout <timeout>      Timeout in milliseconds

Features:
  ✅ Full CSS style preservation
  ✅ JavaScript rendering
  ✅ Background graphics
  ✅ Custom fonts and colors
  ✅ Complex layouts and tables
  ✅ Images and media support
  ✅ Automatic uploads directory creation
  ✅ Timestamped filenames for unique outputs
            `);
        });

    await program.parseAsync();
}

if (import.meta.url === `file://${process.argv[1]}`) {
    main().catch(console.error);
} 