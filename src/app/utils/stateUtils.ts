import { useState } from "react";
import {logEvent} from "@/app/componenets/EventLogger";

export function useLoggedState<T>(initialValue: T, component: string, stateName: string) {
    const [state, setState] = useState(initialValue);

    const setLoggedState = (value: T) => {
        logEvent({
            timestamp: Date.now(),
            eventType: "stateChange",
            component,
            details: { stateName, newValue: value },
        });
        setState(value);
    };

    return [state, setLoggedState] as const;
}
