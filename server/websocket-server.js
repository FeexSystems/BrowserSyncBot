const { Server } = require('socket.io');
const { createServer } = require('http');

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: ["http://localhost:3000", "http://localhost:3001"],
    methods: ["GET", "POST"]
  }
});

// Store connected devices
const connectedDevices = new Map();
const deviceRooms = new Map(); // deviceId -> socketId mapping

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  const { deviceId, userAgent, platform } = socket.handshake.query;
  
  if (deviceId) {
    // Register device
    const deviceInfo = {
      deviceId,
      socketId: socket.id,
      lastSeen: new Date(),
      isActive: true,
      metadata: {
        userAgent: userAgent || 'Unknown',
        platform: platform || 'Unknown',
        browser: extractBrowser(userAgent),
        version: '1.0'
      }
    };
    
    connectedDevices.set(socket.id, deviceInfo);
    deviceRooms.set(deviceId, socket.id);
    
    // Join device-specific room
    socket.join(`device_${deviceId}`);
    
    // Notify other devices about new connection
    socket.broadcast.emit('device_connected', deviceInfo);
    
    console.log(`Device registered: ${deviceId} (${socket.id})`);
  }

  // Handle incoming messages
  socket.on('message', (message) => {
    console.log('Received message:', message.type, 'from', message.deviceId);
    
    try {
      // Update last seen
      const deviceInfo = connectedDevices.get(socket.id);
      if (deviceInfo) {
        deviceInfo.lastSeen = new Date();
      }
      
      // Route message based on target devices
      if (message.targetDevices && message.targetDevices.length > 0) {
        // Send to specific devices
        message.targetDevices.forEach(targetDeviceId => {
          const targetSocketId = deviceRooms.get(targetDeviceId);
          if (targetSocketId) {
            socket.to(targetSocketId).emit('message', message);
          }
        });
      } else {
        // Broadcast to all other devices
        socket.broadcast.emit('message', message);
      }
      
      // Handle specific message types
      handleMessageType(socket, message);
      
    } catch (error) {
      console.error('Error handling message:', error);
      socket.emit('error', { message: 'Failed to process message' });
    }
  });

  // Handle ping/pong for latency measurement
  socket.on('ping', (data) => {
    socket.emit('pong', data);
  });

  // Handle sync requests
  socket.on('sync_request', (data) => {
    console.log('Sync request from:', deviceId);
    // Broadcast sync request to other devices
    socket.broadcast.emit('sync_request', {
      ...data,
      requestingDevice: deviceId
    });
  });

  // Handle disconnection
  socket.on('disconnect', (reason) => {
    console.log('Client disconnected:', socket.id, 'reason:', reason);
    
    const deviceInfo = connectedDevices.get(socket.id);
    if (deviceInfo) {
      // Remove from maps
      connectedDevices.delete(socket.id);
      deviceRooms.delete(deviceInfo.deviceId);
      
      // Notify other devices
      socket.broadcast.emit('device_disconnected', deviceInfo.deviceId);
      
      console.log(`Device unregistered: ${deviceInfo.deviceId}`);
    }
  });

  // Send current connected devices to new client
  if (deviceId) {
    const otherDevices = Array.from(connectedDevices.values())
      .filter(device => device.deviceId !== deviceId);
    
    socket.emit('connected_devices', otherDevices);
  }
});

// Handle specific message types
function handleMessageType(socket, message) {
  switch (message.type) {
    case 'tab_send_to_device':
      // Special handling for tab sharing
      console.log(`Sending tab from ${message.deviceId} to target devices`);
      break;
      
    case 'sync_request':
      // Handle sync requests
      socket.broadcast.emit('sync_request', {
        requestingDevice: message.deviceId,
        timestamp: message.timestamp,
        types: message.data.types
      });
      break;
      
    case 'password_added':
    case 'password_updated':
    case 'password_deleted':
      // Special handling for sensitive password data
      console.log(`Password ${message.type} from ${message.deviceId}`);
      break;
      
    default:
      // Default broadcast behavior handled above
      break;
  }
}

// Utility function to extract browser from user agent
function extractBrowser(userAgent) {
  if (!userAgent) return 'Unknown';
  
  if (userAgent.includes('Chrome')) return 'Chrome';
  if (userAgent.includes('Firefox')) return 'Firefox';
  if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) return 'Safari';
  if (userAgent.includes('Edge')) return 'Edge';
  
  return 'Unknown';
}

// Heartbeat to check device status
setInterval(() => {
  const now = new Date();
  const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
  
  connectedDevices.forEach((device, socketId) => {
    if (device.lastSeen < fiveMinutesAgo) {
      console.log(`Device ${device.deviceId} seems inactive, removing...`);
      connectedDevices.delete(socketId);
      deviceRooms.delete(device.deviceId);
    }
  });
}, 60000); // Check every minute

// Server status endpoint
setInterval(() => {
  console.log(`Connected devices: ${connectedDevices.size}`);
  console.log('Active devices:', Array.from(connectedDevices.values()).map(d => d.deviceId));
}, 30000); // Log every 30 seconds

const PORT = process.env.WS_PORT || 3002;
httpServer.listen(PORT, () => {
  console.log(`WebSocket server running on port ${PORT}`);
  console.log('CORS enabled for: http://localhost:3000, http://localhost:3001');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('Shutting down WebSocket server...');
  io.close(() => {
    httpServer.close(() => {
      console.log('WebSocket server closed');
      process.exit(0);
    });
  });
});
