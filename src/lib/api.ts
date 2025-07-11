import axios from "axios";
import { io, Socket } from "socket.io-client";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// Axios instance
export const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  timeout: 10000,
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("authToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("authToken");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

// Socket.IO client
class SocketClient {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  connect(userId: string) {
    if (this.socket?.connected) return this.socket;

    this.socket = io(API_BASE_URL, {
      transports: ["websocket"],
      autoConnect: true,
    });

    this.socket.on("connect", () => {
      console.log("🔗 Connected to server");
      this.socket?.emit("join", userId);
      this.reconnectAttempts = 0;
    });

    this.socket.on("disconnect", () => {
      console.log("📡 Disconnected from server");
    });

    this.socket.on("connect_error", (error) => {
      console.error("Connection error:", error);
      this.handleReconnect();
    });

    return this.socket;
  }

  private handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      setTimeout(() => {
        console.log(`Reconnect attempt ${this.reconnectAttempts}`);
        this.socket?.connect();
      }, 1000 * this.reconnectAttempts);
    }
  }

  disconnect() {
    this.socket?.disconnect();
    this.socket = null;
  }

  getSocket() {
    return this.socket;
  }

  // Real-time events
  onDeviceUpdated(callback: (device: any) => void) {
    this.socket?.on("deviceUpdated", callback);
  }

  onTabsUpdated(callback: (tabs: any) => void) {
    this.socket?.on("tabsUpdated", callback);
  }

  onRemoteCommand(callback: (command: any) => void) {
    this.socket?.on("remoteCommand", callback);
  }

  onChatResponse(callback: (response: any) => void) {
    this.socket?.on("chatResponse", callback);
  }

  // Emit events
  syncTabs(data: any) {
    this.socket?.emit("syncTabs", data);
  }

  updateDeviceStatus(deviceId: string, status: string) {
    this.socket?.emit("deviceStatus", { deviceId, status });
  }

  sendRemoteCommand(command: any) {
    this.socket?.emit("remoteControl", command);
  }

  sendChatMessage(message: any) {
    this.socket?.emit("chatMessage", message);
  }
}

export const socketClient = new SocketClient();

// API functions
export const authAPI = {
  login: async (email: string, password: string) => {
    const response = await api.post("/auth/login", { email, password });
    const { token, user } = response.data;
    localStorage.setItem("authToken", token);
    return { token, user };
  },

  getProfile: async () => {
    const response = await api.get("/user/profile");
    return response.data;
  },
};

export const devicesAPI = {
  getAll: async () => {
    const response = await api.get("/devices");
    return response.data;
  },

  create: async (device: any) => {
    const response = await api.post("/devices", device);
    return response.data;
  },

  getRemoteScreen: async (deviceId: string) => {
    const response = await api.get(`/remote-screen/${deviceId}`);
    return response.data;
  },
};

export const tabsAPI = {
  getAll: async () => {
    const response = await api.get("/tabs");
    return response.data;
  },

  create: async (tab: any) => {
    const response = await api.post("/tabs", tab);
    return response.data;
  },

  sync: async (deviceIds: string[], tabs: any[]) => {
    // Emit via socket for real-time sync
    socketClient.syncTabs({ deviceIds, tabs });
    return { success: true };
  },
};

export const chatAPI = {
  getMessages: async () => {
    const response = await api.get("/chat/messages");
    return response.data;
  },

  sendMessage: async (message: string) => {
    socketClient.sendChatMessage({ content: message, timestamp: Date.now() });
    return { success: true };
  },
};

// Health check
export const healthCheck = async () => {
  try {
    const response = await api.get("/health");
    return response.data;
  } catch (error) {
    throw new Error("Server is not responding");
  }
};
