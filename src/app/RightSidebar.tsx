'use client'

import { usePathname } from 'next/navigation'
import ConsoleLogger from './ConsoleLogger'
import GenAIContent from './GenAIContent'
import TerminalComponent from "@/app/TerminalComponent";

export default function RightSidebar() {
    const pathname = usePathname()
    const isArchitecturePage = pathname.startsWith('/architecture')

    if (isArchitecturePage) {
        return (
            <aside className="w-1/4 border-l border-gray-200 flex flex-col">
                <div className="h-[calc(100vh-564px)] overflow-auto p-4">
                    <h2 className="text-xl font-bold mb-4">Architecture Details</h2>
                    <p className="text-sm mb-4">Under Construction</p>
                    <GenAIContent pathname={pathname} />

                </div>
                <div>
                    <h2>Terminal</h2>
                    <TerminalComponent />
                </div>
            </aside>
        )
    }

    return (
        <aside className="w-1/4 border-l border-gray-200 flex flex-col">
            <div className="h-[calc(100vh-64px)] overflow-hidden">
                <ConsoleLogger />
            </div>
        </aside>
    )
}