import ReconnectingWebSocket from 'reconnecting-websocket';

export function makeWS(url: string) {
    const ws = new ReconnectingWebSocket(url, [], { 
        maxReconnectionDelay: 5000, 
        minReconnectionDelay: 500, 
        reconnectionDelayGrowFactor: 1.5 
    });
    
    return ws;
}