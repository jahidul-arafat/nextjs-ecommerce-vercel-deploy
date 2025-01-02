import path from 'path';
import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';

const USERNAME = process.env.API_DOCS_USERNAME;
const PASSWORD = process.env.API_DOCS_PASSWORD;
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL;

export async function GET(req: NextRequest) {
    // Add CORS headers
    // const headers = {
    //     'Access-Control-Allow-Origin': '*', // Replace '*' with your frontend domain if necessary
    //     'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    //     'Access-Control-Allow-Headers': 'Authorization, Content-Type',
    // };

    if (req.method === 'OPTIONS') {
        return new NextResponse(null, { status: 204 });
    }

    // Existing authentication and file reading logic
    const authHeader = req.headers.get('authorization');

    if (!authHeader || !authHeader.startsWith('Basic ')) {
        return new NextResponse('Authentication required', {
            status: 401,
            headers: { 'WWW-Authenticate': 'Basic realm="Secure Area"'},
        });
    }

    const base64Credentials = authHeader.split(' ')[1];
    const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
    const [username, password] = credentials.split(':');

    if (username !== USERNAME || password !== PASSWORD) {
        return new NextResponse('Invalid Authentication Credentials', {
            status: 401,
            headers: { 'WWW-Authenticate': 'Basic realm="Secure Area"'},
        });
    }

    const swaggerUiPath = path.join(process.cwd(), 'public', 'swagger-ui.html');
    const swaggerYamlPath = path.join(process.cwd(), 'swagger.yaml');

    const html = fs.readFileSync(swaggerUiPath, 'utf-8');
    let yaml = fs.readFileSync(swaggerYamlPath, 'utf-8');

    if (!SITE_URL) {
        console.error('NEXT_PUBLIC_SITE_URL is not defined in the environment.');
        return new NextResponse('Internal Server Error', { status: 500});
    }

    yaml = yaml.replace(/\${NEXT_PUBLIC_SITE_URL}/g, SITE_URL);
    const finalHtml = html.replace('__SWAGGER_YAML__', yaml);

    return new NextResponse(finalHtml, { headers: { 'Content-Type': 'text/html'} });
}
