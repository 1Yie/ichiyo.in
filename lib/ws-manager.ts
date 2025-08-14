type VersionUpdateCallback = (version: string) => void;

class WSManager {
  private static instance: WSManager;
  private ws: WebSocket | null = null;
  private callbacks: VersionUpdateCallback[] = [];
  private currentVersion: string | null = null;
  private retryCount = 0;
  private maxRetries = 5;

  private constructor() {
    this.connect();
  }

  public static getInstance(): WSManager {
    if (!WSManager.instance) {
      WSManager.instance = new WSManager();
    }
    return WSManager.instance;
  }

  private connect() {
    if (this.retryCount >= this.maxRetries) {
      console.warn("达到最大重连次数，停止尝试");
      return;
    }

    this.ws = new WebSocket("ws://localhost:3001");

    this.ws.onopen = () => {
      this.retryCount = 0; // 重置重试计数器
      console.log("WebSocket 连接已建立");
    };

    this.ws.onmessage = this.handleMessage.bind(this);

    this.ws.onerror = (error) => {
      console.error("WebSocket 错误:", error);
    };

    this.ws.onclose = () => {
      this.retryCount++;
      const delay = Math.min(5000 * this.retryCount, 30000); // 指数退避
      console.log(`连接断开，${delay}ms后尝试重连...`);
      setTimeout(() => this.connect(), delay);
    };
  }

  private handleMessage(event: MessageEvent) {
    try {
      const data = JSON.parse(event.data);
      if (data.type === "VERSION_UPDATE") {
        // 只有版本变化时才触发回调
        if (data.version !== this.currentVersion) {
          const prevVersion = this.currentVersion;
          this.currentVersion = data.version;

          // 如果是首次设置版本（prevVersion === null），不触发回调
          if (prevVersion !== null) {
            console.log(`版本变更: ${prevVersion} → ${this.currentVersion}`);
            this.notifyCallbacks(this.currentVersion as string);
          } else {
            console.log(`初始版本: ${this.currentVersion}`);
          }
        }
      }
    } catch (err) {
      console.error("WS 消息解析失败:", err);
    }
  }

  private notifyCallbacks(version: string) {
    // 使用切片复制回调数组避免并发修改问题
    this.callbacks.slice().forEach((cb) => {
      try {
        cb(version);
      } catch (err) {
        console.error("回调函数执行失败:", err);
      }
    });
  }

  public subscribe(callback: VersionUpdateCallback): () => void {
    this.callbacks.push(callback);
    return () => {
      this.callbacks = this.callbacks.filter((cb) => cb !== callback);
    };
  }

  public getCurrentVersion(): string | null {
    return this.currentVersion;
  }
}

export const wsManager = WSManager.getInstance();