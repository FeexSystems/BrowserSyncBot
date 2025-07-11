const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { v4: uuidv4 } = require("uuid");
require("dotenv").config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

// Middleware
app.use(cors());
app.use(express.json());

// In-memory data store (in production, use a real database)
const users = new Map();
const devices = new Map();
const tabs = new Map();
const passwords = new Map();
const history = new Map();
const sessions = new Map();

// Mock data initialization
const initMockData = () => {
  // Mock devices
  const mockDevices = [
    {
      id: "phone",
      name: "iPhone 15 Pro",
      type: "mobile",
      browser: "Safari",
      lastSync: Date.now(),
      status: "online",
      userId: "user1",
    },
    {
      id: "laptop",
      name: "MacBook Pro",
      type: "desktop",
      browser: "Chrome",
      lastSync: Date.now(),
      status: "online",
      userId: "user1",
    },
    {
      id: "work-pc",
      name: "Dell Workstation",
      type: "desktop",
      browser: "Edge",
      lastSync: Date.now(),
      status: "online",
      userId: "user1",
    },
    {
      id: "tablet",
      name: "iPad Air",
      type: "tablet",
      browser: "Safari",
      lastSync: Date.now(),
      status: "offline",
      userId: "user1",
    },
  ];

  mockDevices.forEach((device) => devices.set(device.id, device));

  // Mock tabs
  const mockTabs = [
    {
      id: "1",
      title: "GitHub - Repository Dashboard",
      url: "github.com/dashboard",
      device: "laptop",
      browser: "Chrome",
      favicon: "🐙",
      userId: "user1",
    },
    {
      id: "2",
      title: "Netflix - Watch Movies",
      url: "netflix.com/browse",
      device: "phone",
      browser: "Safari",
      favicon: "🎬",
      userId: "user1",
    },
  ];

  mockTabs.forEach((tab) => tabs.set(tab.id, tab));

  // Mock user
  users.set("user1", {
    id: "user1",
    email: "user@example.com",
    name: "John Doe",
    avatar:
      "https://ui-avatars.com/api/?name=John+Doe&background=6366f1&color=fff",
    createdAt: Date.now(),
  });
};

initMockData();

// Auth middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.sendStatus(401);
  }

  jwt.verify(token, process.env.JWT_SECRET || "secret", (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Routes
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: Date.now() });
});

// User routes
app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;

  // Mock authentication
  if (email === "user@example.com" && password === "password") {
    const user = users.get("user1");
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET || "secret",
      { expiresIn: "24h" },
    );
    res.json({ token, user });
  } else {
    res.status(401).json({ error: "Invalid credentials" });
  }
});

app.get("/api/user/profile", authenticateToken, (req, res) => {
  const user = users.get(req.user.userId);
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json(user);
});

// Device routes
app.get("/api/devices", authenticateToken, (req, res) => {
  const userDevices = Array.from(devices.values()).filter(
    (device) => device.userId === req.user.userId,
  );
  res.json(userDevices);
});

app.post("/api/devices", authenticateToken, (req, res) => {
  const device = {
    id: uuidv4(),
    ...req.body,
    userId: req.user.userId,
    lastSync: Date.now(),
    status: "online",
  };
  devices.set(device.id, device);

  // Broadcast to all connected clients
  io.emit("deviceAdded", device);

  res.json(device);
});

// Tab routes
app.get("/api/tabs", authenticateToken, (req, res) => {
  const userTabs = Array.from(tabs.values()).filter(
    (tab) => tab.userId === req.user.userId,
  );
  res.json(userTabs);
});

app.post("/api/tabs", authenticateToken, (req, res) => {
  const tab = {
    id: uuidv4(),
    ...req.body,
    userId: req.user.userId,
  };
  tabs.set(tab.id, tab);

  // Broadcast to all connected clients
  io.emit("tabAdded", tab);

  res.json(tab);
});

// Remote screen API
app.get("/api/remote-screen/:deviceId", authenticateToken, (req, res) => {
  const { deviceId } = req.params;
  const device = devices.get(deviceId);

  if (!device || device.userId !== req.user.userId) {
    return res.status(404).json({ error: "Device not found" });
  }

  // Mock screen data
  const screenData = {
    deviceId,
    screenshot: `data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/`,
    activeTab: {
      title: "Browser Sync Dashboard",
      url: "localhost:3000",
    },
    timestamp: Date.now(),
  };

  res.json(screenData);
});

// Chat API
app.get("/api/chat/messages", authenticateToken, (req, res) => {
  const messages = [
    {
      id: "1",
      type: "bot",
      content: "Welcome to Browser Sync! How can I help you today?",
      timestamp: Date.now() - 60000,
    },
    {
      id: "2",
      type: "user",
      content: "How do I sync tabs between devices?",
      timestamp: Date.now() - 30000,
    },
    {
      id: "3",
      type: "bot",
      content:
        "You can sync tabs by selecting the devices you want to sync with and clicking the sync button. All your open tabs will be shared across selected devices.",
      timestamp: Date.now(),
    },
  ];

  res.json(messages);
});

// WebSocket connection handling
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("join", (userId) => {
    socket.join(`user_${userId}`);
    sessions.set(socket.id, userId);
  });

  socket.on("syncTabs", (data) => {
    const userId = sessions.get(socket.id);
    if (userId) {
      socket.to(`user_${userId}`).emit("tabsUpdated", data);
    }
  });

  socket.on("deviceStatus", (data) => {
    const userId = sessions.get(socket.id);
    if (userId) {
      const device = devices.get(data.deviceId);
      if (device && device.userId === userId) {
        device.status = data.status;
        device.lastSync = Date.now();
        io.to(`user_${userId}`).emit("deviceUpdated", device);
      }
    }
  });

  socket.on("remoteControl", (data) => {
    const userId = sessions.get(socket.id);
    if (userId) {
      socket.to(`user_${userId}`).emit("remoteCommand", data);
    }
  });

  socket.on("chatMessage", (message) => {
    const userId = sessions.get(socket.id);
    if (userId) {
      // Process message with mock AI response
      const response = {
        id: uuidv4(),
        type: "bot",
        content: generateMockResponse(message.content),
        timestamp: Date.now(),
      };

      setTimeout(() => {
        socket.emit("chatResponse", response);
      }, 1000);
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
    sessions.delete(socket.id);
  });
});

// Mock AI response generator
const generateMockResponse = (userMessage) => {
  const responses = [
    "I understand you need help with that. Let me assist you with browser synchronization.",
    "That's a great question! For optimal sync performance, make sure all devices are connected to the internet.",
    "I can help you set up secure password synchronization across your devices.",
    "Browser history sync is available in the History tab. You can view and manage your browsing history there.",
    "For remote screen sharing, click on any device card to see its current screen.",
    "Security is our priority. All data is encrypted end-to-end during synchronization.",
  ];

  return responses[Math.floor(Math.random() * responses.length)];
};

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 WebSocket server ready for connections`);
});
