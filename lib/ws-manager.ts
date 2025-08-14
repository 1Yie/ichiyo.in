type VersionUpdateCallback = (version: string) => void;

class WSManager {
  private static instance: WSManager;
  private ws: WebSocket | null = null;
  private callbacks: VersionUpdateCallback[] = [];
  private currentVersion: string | null = null;
  private retryCount = 0;
  private maxRetries = 5;
  private wsUrl: string;

  private constructor() {
    this.wsUrl = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:3001";
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
      console.warn(`WS 连接失败: 已达到最大重试次数 (${this.maxRetries})`);
      return;
    }

    try {
      this.ws = new WebSocket(this.wsUrl);
      this.setupEventHandlers();
    } catch (err) {
      console.error("WebSocket 初始化失败:", err);
      this.scheduleReconnect();
    }
  }

  private setupEventHandlers() {
    if (!this.ws) return;

    this.ws.onopen = () => {
      this.retryCount = 0;
      console.log(`WS 已连接: ${this.wsUrl}`);
    };

    this.ws.onmessage = (event) => this.handleMessage(event);

    this.ws.onerror = (error) => {
      console.error("WS 错误:", error);
    };

    this.ws.onclose = () => {
      console.log("WS 连接关闭");
      this.scheduleReconnect();
    };
  }

  private scheduleReconnect() {
    this.retryCount++;
    const delay = Math.min(1000 * Math.pow(2, this.retryCount), 30000); // 指数退避
    console.log(`WS 将在 ${delay}ms 后重试...`);
    setTimeout(() => this.connect(), delay);
  }

  private handleMessage(event: MessageEvent) {
    try {
      const data = JSON.parse(event.data);
      if (data.type === "VERSION_UPDATE" && data.version) {
        this.handleVersionUpdate(data.version);
      }
    } catch (err) {
      console.error("WS 消息解析失败:", err);
    }
  }

  private handleVersionUpdate(newVersion: string) {
    if (newVersion !== this.currentVersion) {
      const prevVersion = this.currentVersion;
      this.currentVersion = newVersion;

      if (prevVersion !== null) {
        console.log(`版本变更: ${prevVersion} → ${newVersion}`);
        this.notifyCallbacks(newVersion);
      } else {
        console.log(`初始版本: ${newVersion}`);
      }
    }
  }

  private notifyCallbacks(version: string) {
    // 使用队列避免回调修改数组
    const callbacks = [...this.callbacks];
    callbacks.forEach((cb) => {
      try {
        cb(version);
      } catch (err) {
        console.error("版本回调执行失败:", err);
      }
    });
  }

  public subscribe(callback: VersionUpdateCallback): () => void {
    this.callbacks.push(callback);
    return () => this.unsubscribe(callback);
  }

  private unsubscribe(callback: VersionUpdateCallback) {
    this.callbacks = this.callbacks.filter((cb) => cb !== callback);
  }

  public getCurrentVersion(): string | null {
    return this.currentVersion;
  }
}

export const wsManager = WSManager.getInstance();
