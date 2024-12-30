import path from 'path';
import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';

const USERNAME = process.env.API_DOCS_USERNAME;
const PASSWORD = process.env.API_DOCS_PASSWORD;

export async function GET(req: NextRequest) {
    // Check for basic auth header
    const authHeader = req.headers.get('authorization');

    if (!authHeader || !authHeader.startsWith('Basic ')) {
        return new NextResponse('Authentication required', {
            status: 401,
            headers: { 'WWW-Authenticate': 'Basic realm="Secure Area"' },
        });
    }

    // Verify auth credentials
    const base64Credentials = authHeader.split(' ')[1];
    const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
    const [username, password] = credentials.split(':');

    if (username !== USERNAME || password !== PASSWORD) {
        return new NextResponse('Invalid Authentication Credentials', {
            status: 401,
            headers: { 'WWW-Authenticate': 'Basic realm="Secure Area"' },
        });
    }

    const swaggerUiPath = path.join(process.cwd(), 'public', 'swagger-ui.html');
    const swaggerYamlPath = path.join(process.cwd(), 'swagger.yaml');

    const html = fs.readFileSync(swaggerUiPath, 'utf-8');
    const yaml = fs.readFileSync(swaggerYamlPath, 'utf-8');

    const finalHtml = html.replace('__SWAGGER_YAML__', yaml);

    return new NextResponse(finalHtml, {
        headers: { 'Content-Type': 'text/html' },
    });
}