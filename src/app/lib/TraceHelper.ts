type TraceMap = {
    [key: string]: {
        variables: string[];
        functions: string[];
        componentsInvolved: string[];
    };
};

const traceMap: TraceMap = {};

export function logTrace(eventType: string, variables: string[], functions: string[], components: string[]) {
    traceMap[eventType] = { variables, functions, componentsInvolved: components };
    console.log("Trace Map Updated:", traceMap);
}

export function getTraceMap() {
    return traceMap;
}
