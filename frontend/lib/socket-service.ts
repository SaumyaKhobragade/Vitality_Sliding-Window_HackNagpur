import { Client, IMessage, StompSubscription } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

export type SocketCallback = (message: any) => void;

export class SocketService {
  private client: Client;
  private subscriptions: Map<string, StompSubscription> = new Map();
  private connected: boolean = false;

  constructor() {
    this.client = new Client({
      webSocketFactory: () => new SockJS('http://localhost:9090/ws'),
      debug: (str) => {
        // console.log(str);
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    this.client.onConnect = () => {
      this.connected = true;
      console.log('WebSocket Connected');
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

  subscribe(topic: string, callback: SocketCallback): void {
    if (this.subscriptions.has(topic)) {
      this.subscriptions.get(topic)?.unsubscribe();
    }

    const subscription = this.client.subscribe(topic, (message: IMessage) => {
      try {
        const payload = JSON.parse(message.body);
        callback(payload);
      } catch (e) {
        console.error('Error parsing WebSocket message', e);
      }
    });

    this.subscriptions.set(topic, subscription);
  }

  unsubscribe(topic: string): void {
    if (this.subscriptions.has(topic)) {
      this.subscriptions.get(topic)?.unsubscribe();
      this.subscriptions.delete(topic);
    }
  }
}
