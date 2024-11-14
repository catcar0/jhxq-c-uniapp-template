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
  private msgType: string; // 当前重连次数
  private isConnectedFlag: boolean = false;

  // 定义 onOpen、onError 和 onClose 回调函数
  public onOpen: (() => void) | null = null;
  public onError: ((error: any) => void) | null = null;
  public onClose: (() => void) | null = null;

  constructor(url: string, reconnectInterval: number = 1000,heartbeatInterval: number = 30000,    maxReconnectAttempts: number = 3) {
    let IsTestPlay = useMainAuthStore().IsTestPlay;
    this.url = (IsTestPlay ? TEST_Api_Url : Api_Url) + url;
    // this.url = 'ws://132.232.57.64:8030/?' + url;
    this.reconnectInterval = reconnectInterval;
    this.heartbeatInterval = heartbeatInterval;
    this.maxReconnectAttempts = maxReconnectAttempts;
    this.reconnectAttempts = 0;
    this.msgType = ''
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
      uni.showToast({ icon: 'none', title: '连接成功' ,mask:true,duration: 3500})
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
      this.msgType = parsedData.type
      console.log(parsedData)
      if(parsedData.type==='reconnect_success'){
        console.log('重连成功重置重连次数')
        this.reconnectAttempts = 0; // 重置重连次数
      }
      if (parsedData.type === 'scores' && parsedData.data.statuses.allinfo) {
        websocketStore.gameAddMessage(parsedData.data.statuses.allinfo.info,parsedData.data.statuses.allinfo.version);
      }else if( parsedData.type==='team_ranking'){
        websocketStore.addMessage(parsedData);
      } else if (parsedData.players) {
        websocketStore.addMessage(parsedData);
      } else if (parsedData.type === 'versionError'){
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
      uni.showToast({ icon: 'none', title: '你已经断开连接' })
      console.log('WebSocket connection closed');
      this.socketTask = null;
      this.stopHeartbeat();
      this.isConnectedFlag = false;  // 连接关闭，设置为未连接状态
      if (this.onClose) {
        this.onClose();
      }
      if (this.reconnectAttempts < this.maxReconnectAttempts && this.msgType!=='kicked') {
        console.log(`Reconnecting attempt ${this.reconnectAttempts + 1}/${this.maxReconnectAttempts}...`);
        this.reconnectAttempts++;
        // this.connect()
        setTimeout(() => this.connect(), this.reconnectInterval);
      } else {
        console.warn('Max reconnect attempts reached, no longer trying to reconnect');
        uni.showModal({
          title: '提示',
          content: '房间已经关闭或你已被踢出房间，请重新扫描二维码',
          showCancel: false,
          success: function (res) {
              if (res.confirm) {
                  uni.exitMiniProgram({
                      success: function () {
                          uni.clearStorageSync();
                          console.log('退出小程序成功');
                      },
                      fail: function (err) {
                          console.log('退出小程序失败', err);
                      }
                  })
              } else {
                  console.log('点击了取消')
              }
          }
      })
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
