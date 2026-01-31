import { describe, it, expect, vi, beforeEach } from 'vitest'
import { SocketService } from './socket-service'
import { Client } from '@stomp/stompjs'

vi.mock('@stomp/stompjs', () => {
  const MockClient = vi.fn();
  MockClient.prototype.activate = vi.fn();
  MockClient.prototype.deactivate = vi.fn();
  MockClient.prototype.subscribe = vi.fn().mockReturnValue({ unsubscribe: vi.fn() });
  return { Client: MockClient };
})

vi.mock('sockjs-client', () => {
  return {
    default: vi.fn().mockImplementation(() => ({})),
  }
})

describe('SocketService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should be defined', () => {
    const service = new SocketService()
    expect(service).toBeDefined()
  })

  it('should call activate when connect is called', () => {
    const service = new SocketService()
    service.connect()
    
    expect(Client).toHaveBeenCalled()
    expect(Client.prototype.activate).toHaveBeenCalled()
  })

  it('should subscribe to a topic', () => {
    const service = new SocketService()
    const callback = vi.fn()
    service.subscribe('/topic/test', callback)

    expect(Client.prototype.subscribe).toHaveBeenCalledWith('/topic/test', expect.any(Function))
  })
})