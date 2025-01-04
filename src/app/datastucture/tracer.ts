type EventLog = {
    timestamp: number; // Time of the event
    eventType: string; // e.g., 'click', 'addToCart', 'stateChange'
    component: string; // Component name (e.g., 'ProductItem', 'ProductsList')
    details: Record<string, any>; // Additional details about the event (e.g., product ID, state before/after)
};

type TraceMap = {
    [key: string]: {
        variables: string[]; // Variables accessed
        functions: string[]; // Functions called
        componentsInvolved: string[]; // Components involved in the chain
    };
};
