#!/usr/bin/env node

/**
 * Test client for HTML to PDF API
 */

import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_BASE_URL = 'http://localhost:3000';

async function testAPI() {
    console.log('🧪 Testing HTML to PDF API...\n');

    try {
        // Test 1: Health check
        console.log('📊 Test 1: Health check...');
        const healthResponse = await fetch(`${API_BASE_URL}/health`);
        const healthData = await healthResponse.json();
        console.log('✅ Health check:', healthData);

        // Test 2: Get options
        console.log('\n📋 Test 2: Getting available options...');
        const optionsResponse = await fetch(`${API_BASE_URL}/api/options`);
        const optionsData = await optionsResponse.json();
        console.log('✅ Available options:', optionsData);

        // Test 3: Convert HTML string
        console.log('\n📝 Test 3: Converting HTML string...');
        const htmlString = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    h1 { color: #333; text-align: center; }
                    .content { background: #f5f5f5; padding: 20px; border-radius: 5px; }
                    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                    th { background-color: #007bff; color: white; }
                </style>
            </head>
            <body>
                <h1>HTML to PDF API Test</h1>
                <div class="content">
                    <h2>Features</h2>
                    <ul>
                        <li>HTML to PDF conversion via API</li>
                        <li>Full CSS style preservation</li>
                        <li>JavaScript rendering</li>
                        <li>Custom formatting options</li>
                    </ul>
                    
                    <h3>Sample Table</h3>
                    <table>
                        <thead>
                            <tr>
                                <th>Feature</th>
                                <th>Status</th>
                                <th>Notes</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>API Support</td>
                                <td>✅ Working</td>
                                <td>RESTful endpoints</td>
                            </tr>
                            <tr>
                                <td>Style Preservation</td>
                                <td>✅ Working</td>
                                <td>Full CSS support</td>
                            </tr>
                            <tr>
                                <td>File Upload</td>
                                <td>✅ Working</td>
                                <td>Multipart form data</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </body>
            </html>
        `;

        const stringResponse = await fetch(`${API_BASE_URL}/api/convert/string`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                html: htmlString,
                options: {
                    format: 'A4',
                    orientation: 'portrait',
                    margin: { top: '20px', bottom: '20px', left: '20px', right: '20px' },
                    printBackground: true,
                    scale: 1.0
                }
            })
        });

        if (stringResponse.ok) {
            const pdfBuffer = await stringResponse.arrayBuffer();
            await fs.writeFile('api_test_string.pdf', Buffer.from(pdfBuffer));
            console.log('✅ HTML string converted to api_test_string.pdf');
        } else {
            const errorData = await stringResponse.json();
            console.log('❌ String conversion failed:', errorData);
        }

        // Test 4: Convert HTML file
        console.log('\n📄 Test 4: Converting HTML file...');
        const formData = new FormData();
        const htmlFile = await fs.readFile('deepseek-chat-2025-08-03T15-20-31.html');
        const blob = new Blob([htmlFile], { type: 'text/html' });
        formData.append('htmlFile', blob, 'test.html');
        formData.append('options', JSON.stringify({
            format: 'A4',
            orientation: 'portrait',
            printBackground: true
        }));

        const fileResponse = await fetch(`${API_BASE_URL}/api/convert/file`, {
            method: 'POST',
            body: formData
        });

        if (fileResponse.ok) {
            const pdfBuffer = await fileResponse.arrayBuffer();
            await fs.writeFile('api_test_file.pdf', Buffer.from(pdfBuffer));
            console.log('✅ HTML file converted to api_test_file.pdf');
        } else {
            const errorData = await fileResponse.json();
            console.log('❌ File conversion failed:', errorData);
        }

        // Test 5: Convert URL
        console.log('\n🌐 Test 5: Converting URL...');
        const urlResponse = await fetch(`${API_BASE_URL}/api/convert/url`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                url: 'https://example.com',
                options: {
                    format: 'A4',
                    printBackground: true
                }
            })
        });

        if (urlResponse.ok) {
            const pdfBuffer = await urlResponse.arrayBuffer();
            await fs.writeFile('api_test_url.pdf', Buffer.from(pdfBuffer));
            console.log('✅ URL converted to api_test_url.pdf');
        } else {
            const errorData = await urlResponse.json();
            console.log('❌ URL conversion failed:', errorData);
        }

        console.log('\n✅ All API tests completed!');
        console.log('\n📁 Generated files:');
        console.log('  - api_test_string.pdf (HTML string conversion)');
        console.log('  - api_test_file.pdf (HTML file conversion)');
        console.log('  - api_test_url.pdf (URL conversion)');

    } catch (error) {
        console.error('❌ API test failed:', error.message);
    }
}

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    testAPI().catch(console.error);
} 