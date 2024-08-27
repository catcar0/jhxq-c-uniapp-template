import { useWebSocketStore } from '@/package_nzgx/stores';
import { useMainAuthStore } from '@/stores/auth';

const DM_Api_Url = 'wss://nzgx.api.wanjuyuanxian.com/ws/?';
const DM_TEST_Api_Url = 'wss://mn.nzgx.api.wanjuyuanxian.com/ws/?';

export class WebSocketService {
  private url: string;
  private reconnectInterval: number;
  private heartbeatInterval: number;
  private socketTask: UniApp.SocketTask | null = null;
  private heartbeatTimer: number | null = null;

  // 定义 onOpen、onError 和 onClose 回调函数
  public onOpen: (() => void) | null = null;
  public onError: ((error: any) => void) | null = null;
  public onClose: (() => void) | null = null;

  constructor(url: string, reconnectInterval: number = 5000,heartbeatInterval: number = 10000) {
    let IsTestPlay = useMainAuthStore().IsTestPlay;
    this.url = (IsTestPlay ? DM_TEST_Api_Url : DM_Api_Url) + url;
    // this.url = 'ws://132.232.57.64:8030/?' + url;
    this.reconnectInterval = reconnectInterval;
    this.heartbeatInterval = heartbeatInterval;
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
      if (this.onError) {
        this.onError(error);
      }
      this.stopHeartbeat();
    });

    this.socketTask.onClose(() => {
      console.log('WebSocket connection closed, reconnecting...');
      this.socketTask = null;
      if (this.onClose) {
        this.onClose();
      }
      this.stopHeartbeat();
      // setTimeout(() => this.connect(), this.reconnectInterval);
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
