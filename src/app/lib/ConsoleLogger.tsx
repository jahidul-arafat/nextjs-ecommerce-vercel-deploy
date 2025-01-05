// // client side component
"use client"
import React, { useState, useEffect, useRef } from 'react';

const ConsoleLogger: React.FC = () => {
    const [logs, setLogs] = useState<{ type: string; message: string }[]>([]);
    const logContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const originalLog = console.log;
        const originalError = console.error;
        const originalWarn = console.warn;

        console.log = (...args) => {
            setLogs(prev => [...prev, { type: 'log', message: args.join(' ') }]);
            originalLog.apply(console, args);
        };

        console.error = (...args) => {
            setLogs(prev => [...prev, { type: 'error', message: args.join(' ') }]);
            originalError.apply(console, args);
        };

        console.warn = (...args) => {
            setLogs(prev => [...prev, { type: 'warn', message: args.join(' ') }]);
            originalWarn.apply(console, args);
        };

        return () => {
            console.log = originalLog;
            console.error = originalError;
            console.warn = originalWarn;
        };
    }, []);

    useEffect(() => {
        if (logContainerRef.current) {
            logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
        }
    }, [logs]);

    const getLogColor = (type: string) => {
        switch (type) {
            case 'error':
                return 'text-red-500';
            case 'warn':
                return 'text-yellow-500';
            default:
                return 'text-gray-700';
        }
    };

    return (
        <div ref={logContainerRef} className="h-full bg-amber-100 p-4 overflow-y-auto text-[10px]">
            <h2 className="text-black mb-2 text-sm font-bold sticky top-0 underline">Jahidul Arafat's Client Side Logs</h2>
            {logs.map((log, index) => (
                <div key={index} className={`mb-1 ${getLogColor(log.type)}`}>
                    {log.message}
                </div>
            ))}
        </div>
    );
};

export default ConsoleLogger;


//
// import React, { useState, useEffect } from 'react';
//
// const ConsoleLogger: React.FC = () => {
//     const [logs, setLogs] = useState<{ type: string; message: string }[]>([]);
//
//     useEffect(() => {
//         const originalLog = console.log;
//         const originalError = console.error;
//         const originalWarn = console.warn;
//
//         console.log = (...args) => {
//             setLogs(prev => [...prev, { type: 'log', message: args.join(' ') }]);
//             originalLog.apply(console, args);
//         };
//
//         console.error = (...args) => {
//             setLogs(prev => [...prev, { type: 'error', message: args.join(' ') }]);
//             originalError.apply(console, args);
//         };
//
//         console.warn = (...args) => {
//             setLogs(prev => [...prev, { type: 'warn', message: args.join(' ') }]);
//             originalWarn.apply(console, args);
//         };
//
//         return () => {
//             console.log = originalLog;
//             console.error = originalError;
//             console.warn = originalWarn;
//         };
//     }, []);
//
//     const getLogColor = (type: string) => {
//         switch (type) {
//             case 'error':
//                 return 'text-red-500';
//             case 'warn':
//                 return 'text-yellow-500';
//             default:
//                 return 'text-gray-700';
//         }
//     };
//
//     return (
//         <div className="h-full bg-amber-100 p-4 overflow-y-auto text-[10px]">
//             {/*<h2 className="text-black mb-2 text-lg font-bold sticky top-0">Console Logs</h2>*/}
//             <h2 className="text-black mb-2 text-lg font-bold sticky top-0 ">Console Logs</h2>
//             {logs.map((log, index) => (
//                 <div key={index} className={`mb-1 ${getLogColor(log.type)}`}>
//                     {log.message}
//                 </div>
//             ))}
//         </div>
//     );
// };
//
// export default ConsoleLogger;