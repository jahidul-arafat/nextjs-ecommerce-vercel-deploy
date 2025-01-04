type EventLog = {
    timestamp: number;
    eventType: string;
    component: string;
    details: Record<string, any>;
};

const eventLog: EventLog[] = [];

export function logEvent(event: EventLog) {
    eventLog.push(event);
    console.log("Logged Event:", event);
}

export function getEventLog() {
    return eventLog;
}
