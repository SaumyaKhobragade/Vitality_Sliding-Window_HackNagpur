import { Client, IMessage, StompSubscription } from "@stomp/stompjs";
import SockJS from "sockjs-client";

export type SocketCallback = (message: any) => void;

interface PendingSubscription {
  topic: string;
  callback: SocketCallback;
}

export class SocketService {
  private client: Client;
  private subscriptions: Map<string, StompSubscription> = new Map();
  private connected: boolean = false;
  private pendingSubscriptions: PendingSubscription[] = [];

  constructor() {
    this.client = new Client({
      webSocketFactory: () => new SockJS("/ws"),
      debug: (str) => {
        // console.log(str);
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    this.client.onConnect = () => {
      this.connected = true;
      console.log("WebSocket Connected");

      // Process pending subscriptions
      this.processPendingSubscriptions();
    };

    this.client.onDisconnect = () => {
      this.connected = false;
      console.log('WebSocket Disconnected');
    };

    this.client.onStompError = (frame) => {
      console.error('Broker reported error: ' + frame.headers['message']);
      console.error('Additional details: ' + frame.body);
    };
  }

  connect(): void {
    this.client.activate();
  }

  disconnect(): void {
    this.client.deactivate();
  }

  isConnected(): boolean {
    return this.connected;
  }

  private processPendingSubscriptions(): void {
    while (this.pendingSubscriptions.length > 0) {
      const pending = this.pendingSubscriptions.shift();
      if (pending) {
        this.subscribeNow(pending.topic, pending.callback);
      }
    }
  }

  private subscribeNow(topic: string, callback: SocketCallback): void {
    if (this.subscriptions.has(topic)) {
      this.subscriptions.get(topic)?.unsubscribe();
    }

    const subscription = this.client.subscribe(topic, (message: IMessage) => {
      try {
        const payload = JSON.parse(message.body);
        callback(payload);
      } catch (e) {
        console.error("Error parsing WebSocket message", e);
      }
    });

    this.subscriptions.set(topic, subscription);
  }

  subscribe(topic: string, callback: SocketCallback): void {
    if (!this.connected) {
      // Queue the subscription to be processed when connected
      this.pendingSubscriptions.push({ topic, callback });
      console.log(`Queued subscription for ${topic} (not connected yet)`);
      return;
    }

    this.subscribeNow(topic, callback);
  }

  unsubscribe(topic: string): void {
    if (this.subscriptions.has(topic)) {
      this.subscriptions.get(topic)?.unsubscribe();
      this.subscriptions.delete(topic);
    }
  }
}
