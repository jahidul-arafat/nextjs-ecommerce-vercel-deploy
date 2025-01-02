import type { NextConfig } from "next";
import withBundleAnalyzer from '@next/bundle-analyzer';

// Configuration-01: with bundle analyzer
// Enable the bundle analyzer conditionally
const bundleAnalyzer = withBundleAnalyzer({
    enabled: process.env.ANALYZE === 'true',
});

const nextConfig: NextConfig = bundleAnalyzer({
    eslint: {
        ignoreDuringBuilds: true,
    },
    typescript: {
        ignoreBuildErrors: true,
    },
    async rewrites() {
        return [
            {
                source: '/api-docs',
                destination: '/api/api-docs',
            },
        ];
    },
    async headers() {
        return [
            {
                // matching all API routes
                source: "/api/:path*",
                headers: [
                    { key: "Access-Control-Allow-Credentials", value: "true" },
                    { key: "Access-Control-Allow-Origin", value: "*" },
                    { key: "Access-Control-Allow-Methods", value: "GET,OPTIONS,PATCH,DELETE,POST,PUT" },
                    { key: "Access-Control-Allow-Headers", value: "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version" },
                ]
            }
        ]
    }
});

export default nextConfig;


// Configuration-02: without bundle analyzer
// import type { NextConfig } from "next";
//
// // const nextConfig: NextConfig = {
// //   /* config options here */
// // };
//
// // uncomment below
// const nextConfig: NextConfig = {
//     eslint: {
//         ignoreDuringBuilds: true,
//     },
//     typescript:{
//         ignoreBuildErrors: true,
//     },
//     async rewrites() {
//         return [
//             {
//                 source: '/api-docs',
//                 destination: '/api/api-docs',
//             },
//         ];
//     },
// };
//
// export default nextConfig;


// import type { NextConfig } from "next";
// import { createServer } from 'http';
// import { parse } from 'url';
// import next from 'next';
//
// const dev = process.env.NODE_ENV !== 'production';
// const app = next({ dev });
// const handle = app.getRequestHandler();
//
// let logs: string[] = [];
//
// const nextConfig: NextConfig = {
//     eslint: {
//         ignoreDuringBuilds: true,
//     },
//     typescript:{
//         ignoreBuildErrors: true,
//     },
//     async rewrites() {
//         return [
//             {
//                 source: '/api-docs',
//                 destination: '/api/api-docs',
//             },
//         ];
//     },
// };
//
// app.prepare().then(() => {
//     createServer((req, res) => {
//         const parsedUrl = parse(req.url!, true);
//         const { pathname, query } = parsedUrl;
//
//         if (pathname === '/api/server-logs') {
//             res.setHeader('Content-Type', 'application/json');
//             res.end(JSON.stringify(logs.slice(-100)));
//         } else {
//             handle(req, res, parsedUrl);
//         }
//
//         // Capture console.log output
//         const originalLog = console.log;
//         console.log = (...args) => {
//             logs.push(args.join(' '));
//             originalLog.apply(console, args);
//         };
//     }).listen(4000, () => {
//         console.log('> Ready on http://localhost:3000');
//     });
// });
//
// export default nextConfig;