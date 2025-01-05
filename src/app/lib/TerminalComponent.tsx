"use client";

import { useEffect, useRef, useState } from "react";
import { Terminal } from "xterm";
import { FitAddon } from "xterm-addon-fit";
import "xterm/css/xterm.css";

const TerminalComponent = () => {
    const terminalRef = useRef<HTMLDivElement>(null);
    const term = useRef<Terminal | null>(null);
    const inputRef = useRef<string>("");
    const [enterPressed, setEnterPressed] = useState(false);

    useEffect(() => {
        if (terminalRef.current) {
            const fitAddon = new FitAddon();
            term.current = new Terminal({
                cursorBlink: true,
            });
            term.current.loadAddon(fitAddon);

            term.current.open(terminalRef.current);
            fitAddon.fit();

            term.current.write("Welcome to the Scratched Pad Terminal (Beta Version 1.1; Designed by Jahidul Arafat)! " +
                "Explore your understanding on this architecture\r\n$ ");


            term.current.onData((data) => {
                switch (data) {
                    case '\r': // Enter
                        if (enterPressed) {
                            processCommand(inputRef.current);
                            inputRef.current = "";
                            setEnterPressed(false);
                            term.current?.write('\r\n$ ');
                        } else {
                            inputRef.current += '\n';
                            setEnterPressed(true);
                            term.current?.write('\r\n> ');
                        }
                        break;
                    case '\u007F': // Backspace
                        if (inputRef.current.length > 0) {
                            inputRef.current = inputRef.current.slice(0, -1);
                            term.current?.write('\b \b');
                        }
                        break;
                    default:
                        if (data >= String.fromCharCode(32) && data <= String.fromCharCode(126)) {
                            inputRef.current += data;
                            term.current?.write(data);
                            setEnterPressed(false);
                        }
                }
            });
        }

        return () => {
            term.current?.dispose();
        };
    }, []);

    const processCommand = (command: string) => {
        term.current?.writeln(`\r\nYou entered:\r\n${command}`);
        // Here you can add logic to process different commands
    };

    return <div ref={terminalRef} style={{ width: "100%", height: "400px" }} />;
};

export default TerminalComponent;