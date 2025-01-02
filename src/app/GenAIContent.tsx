'use client'

import React, { useState, useEffect } from 'react'

interface GenAIContentProps {
    pathname: string
}

export default function GenAIContent({ pathname }: GenAIContentProps) {
    const [content, setContent] = useState<string>('Generating content...')

    useEffect(() => {
        generateContent(pathname)
    }, [pathname])

    const generateContent = async (path: string) => {
        // Simulating an API call to a GenAI service
        setContent('Generating content...')
        await new Promise(resolve => setTimeout(resolve, 1500)) // Simulate delay

        // Mock content generation based on pathname
        const generatedContent = `
            <h3 class="text-lg font-semibold mb-2">Generated Architecture Details for ${path}</h3>
            <p>This is an AI-generated description of the architecture for ${path}.</p>
            <ul class="list-disc pl-5 mt-2">
                <li>Component Overview</li>
                <li>Data Flow</li>
                <li>API Endpoints</li>
                <li>Security Considerations</li>
            </ul>
            <p class="mt-2">For more detailed information, please consult the official documentation or speak with the development team.</p>
        `
        setContent(generatedContent)
    }

    return <div dangerouslySetInnerHTML={{ __html: content }} />
}