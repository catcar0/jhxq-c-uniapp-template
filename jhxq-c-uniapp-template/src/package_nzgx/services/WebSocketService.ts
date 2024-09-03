import { useWebSocketStore } from '@/package_nzgx/stores';
import { useMainAuthStore } from '@/stores/auth';

const Api_Url = 'wss://nzgx.api.wanjuyuanxian.com/ws/?';
const TEST_Api_Url = 'wss://mn.nzgx.api.wanjuyuanxian.com/ws/?';

export class WebSocketService {
  private url: string;
  private reconnectInterval: number;
  private heartbeatInterval: number;
  private socketTask: UniApp.SocketTask | null = null;
  private heartbeatTimer: number | null = null;
  private maxReconnectAttempts: number; // 最大重连次数
  private reconnectAttempts: number; // 当前重连次数
  private isConnectedFlag: boolean = false;

  // 定义 onOpen、onError 和 onClose 回调函数
  public onOpen: (() => void) | null = null;
  public onError: ((error: any) => void) | null = null;
  public onClose: (() => void) | null = null;

  constructor(url: string, reconnectInterval: number = 2000,heartbeatInterval: number = 30000,    maxReconnectAttempts: number = 3) {
    let IsTestPlay = useMainAuthStore().IsTestPlay;
    this.url = (IsTestPlay ? TEST_Api_Url : Api_Url) + url;
    // this.url = 'ws://132.232.57.64:8030/?' + url;
    this.reconnectInterval = reconnectInterval;
    this.heartbeatInterval = heartbeatInterval;
    this.maxReconnectAttempts = maxReconnectAttempts;
    this.reconnectAttempts = 0;
  }
  public isConnected(): boolean {
    return this.isConnectedFlag;
}

  public connect() {
    if (this.socketTask) {
      console.warn('WebSocket already connected');
      return;
    }

    this.socketTask = uni.connectSocket({
      url: this.url,
      success: () => {
        console.log('WebSocket connected');
      },
      fail: (error) => {
        console.error('WebSocket connection failed:', error);
        if (this.onError) {
          this.onError(error);
        }
      },
    });

    this.socketTask.onOpen(() => {
      console.log('WebSocket connection opened');
      this.isConnectedFlag = true;  // 设置为已连接状态
      if (this.onOpen) {
        this.onOpen();
      }
      this.startHeartbeat();
    });

    this.socketTask.onMessage((event) => {
      // 处理消息
      const websocketStore = useWebSocketStore();
      const parsedData = JSON.parse(event.data);
      console.log(parsedData)
      if (parsedData.type === 'scores') {
        websocketStore.gameAddMessage(parsedData.data.statuses.allinfo.info);
      } else if (parsedData.players) {
        websocketStore.addMessage(parsedData);
      } else {
        websocketStore.addMessage(parsedData);
      }
    });

    this.socketTask.onError((error) => {
      console.error('WebSocket error:', error);
      this.isConnectedFlag = false;  // 出现错误，设置为未连接状态
      if (this.onError) {
        this.onError(error);
      }
      this.stopHeartbeat();
    });

    this.socketTask.onClose(() => {
      console.log('WebSocket connection closed');
      this.socketTask = null;
      this.stopHeartbeat();
      this.isConnectedFlag = false;  // 连接关闭，设置为未连接状态
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        console.log(`Reconnecting attempt ${this.reconnectAttempts + 1}/${this.maxReconnectAttempts}...`);
        this.reconnectAttempts++;
        this.connect()
        // setTimeout(() => this.connect(), this.reconnectInterval);
      } else {
        console.warn('Max reconnect attempts reached, no longer trying to reconnect');
        if (this.onClose) {
          this.onClose();
        }
      }
    });
  }

  private startHeartbeat() {
    this.stopHeartbeat(); // 清除任何现有的心跳计时器
    this.heartbeatTimer = setInterval(() => {
      this.sendHeartbeat();
    }, this.heartbeatInterval);
  }

  private stopHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  private sendHeartbeat() {
    if (this.socketTask) {
      this.socketTask.send({
        data: JSON.stringify({ type: 'ping' }), // 自定义心跳消息
        success: () => {
          console.log('Heartbeat sent');
        },
        fail: (error) => {
          console.error('Heartbeat sending failed:', error);
          if (this.onError) {
            this.onError(error);
          }
        },
      });
    }
  }

  public send(message: string) {
    if (this.socketTask) {
      this.socketTask.send({
        data: message,
        success: () => {
          console.log('Message sent');
          this.reconnectAttempts = 0; // 重置重连次数
        },
        fail: (error) => {
          console.error('Message sending failed:', error);
          if (this.onError) {
            this.onError(error);
          }
        },
      });
    } else {
      console.warn('WebSocket is not open');
    }
  }

  public close() {
    if (this.socketTask) {
      this.socketTask.close({
        success: () => {
          console.log('WebSocket connection closed');
        },
        fail: (error) => {
          console.error('WebSocket close failed:', error);
          if (this.onError) {
            this.onError(error);
          }
        },
      });
      this.stopHeartbeat();
    }
  }
}
