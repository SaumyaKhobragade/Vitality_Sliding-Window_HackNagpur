export type SseCallback = (data: any) => void;

interface Subscription {
  eventSource: EventSource;
  callback: SseCallback;
}

/**
 * SSE Service for real-time updates from the backend.
 * Uses Server-Sent Events instead of WebSocket for better CORS compatibility.
 */
export class SseService {
  private baseUrl: string;
  private subscriptions: Map<string, Subscription> = new Map();
  private connected: boolean = false;
  private errorLogged: Set<string> = new Set(); // Track which topics have logged errors

  public onConnectCallback?: () => void;
  public onDisconnectCallback?: () => void;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:9090";
  }

  /**
   * Connect to all SSE streams
   */
  connect(): void {
    // SSE doesn't need a global connect - connections are per-subscription
    this.connected = true;
    if (this.onConnectCallback) this.onConnectCallback();
  }

  /**
   * Disconnect all SSE streams
   */
  disconnect(): void {
    this.subscriptions.forEach((sub, topic) => {
      sub.eventSource.close();
    });
    this.subscriptions.clear();
    this.connected = false;
    this.errorLogged.clear();
    if (this.onDisconnectCallback) this.onDisconnectCallback();
  }

  isConnected(): boolean {
    return this.connected;
  }

  /**
   * Subscribe to a topic (stats, hospital, or events)
   * Maps old WebSocket topic format to SSE endpoints
   */
  subscribe(topic: string, callback: SseCallback): void {
    // Map WebSocket topics to SSE endpoints
    const endpointMap: Record<string, string> = {
      "/topic/stats": "/api/sse/stats",
      "/topic/hospital": "/api/sse/hospital",
      "/topic/events": "/api/sse/events",
    };

    const endpoint = endpointMap[topic];
    if (!endpoint) {
      console.warn(`Unknown SSE topic: ${topic}`);
      return;
    }

    // Close existing subscription if any
    if (this.subscriptions.has(topic)) {
      this.unsubscribe(topic);
    }

    const url = `${this.baseUrl}${endpoint}`;
    const eventSource = new EventSource(url);

    // Map SSE event names to handle different event types
    const eventNameMap: Record<string, string> = {
      "/topic/stats": "stats",
      "/topic/hospital": "hospital",
      "/topic/events": "event",
    };

    const eventName = eventNameMap[topic];

    eventSource.addEventListener(eventName, (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        console.log(`[SSE] Received ${eventName} event:`, data);
        this.errorLogged.delete(topic); // Clear error flag on successful message
        callback(data);
      } catch (e) {
        console.error("Error parsing SSE message", e);
      }
    });

    eventSource.onopen = () => {
      console.log(`SSE Connected to ${topic}`);
      this.errorLogged.delete(topic);
      if (!this.connected) {
        this.connected = true;
        if (this.onConnectCallback) this.onConnectCallback();
      }
    };

    eventSource.onerror = () => {
      // Only log error once per topic to avoid console spam
      if (!this.errorLogged.has(topic)) {
        console.warn(
          `SSE: Backend not available for ${topic} - real-time updates disabled`,
        );
        this.errorLogged.add(topic);
      }
      // EventSource will automatically reconnect
    };

    this.subscriptions.set(topic, { eventSource, callback });
  }

  /**
   * Unsubscribe from a topic
   */
  unsubscribe(topic: string): void {
    const sub = this.subscriptions.get(topic);
    if (sub) {
      sub.eventSource.close();
      this.subscriptions.delete(topic);
      this.errorLogged.delete(topic);
    }
  }
}
