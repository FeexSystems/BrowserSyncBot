import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageCircle,
  X,
  Send,
  Mic,
  MicOff,
  Bot,
  User,
  Minimize2,
  Maximize2,
  Settings,
  Volume2,
  VolumeX,
  Sparkles,
  Brain,
  Zap,
} from "lucide-react";

interface Message {
  id: string;
  type: "user" | "bot";
  content: string;
  timestamp: Date;
  typing?: boolean;
}

interface FloatingChatProps {
  isOpen: boolean;
  onToggle: () => void;
}

export const FloatingChat: React.FC<FloatingChatProps> = ({
  isOpen,
  onToggle,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      type: "bot",
      content:
        "👋 Hi! I'm your AI Browser Sync Assistant. I can help you manage devices, sync tabs, troubleshoot issues, and optimize your browsing experience. What would you like to know?",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isThinking, setIsThinking] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);
    setIsThinking(true);

    // Simulate AI response delay
    setTimeout(
      () => {
        setIsThinking(false);
        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: "bot",
          content: generateAIResponse(inputValue),
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, botMessage]);
        setIsTyping(false);
      },
      1500 + Math.random() * 1000,
    );
  };

  const generateAIResponse = (userInput: string): string => {
    const responses = {
      sync: "I can help you sync your tabs across devices! Would you like me to sync your current tabs to all connected devices, or do you need help setting up sync for a new device?",
      device:
        "I see you're asking about devices. Currently, you have 4 devices connected: iPhone 15 Pro, MacBook Pro, Dell Workstation, and iPad Air. Which device would you like to manage?",
      password:
        "For password management, I can help you view saved passwords, update security settings, or set up two-factor authentication. What specific password task can I assist with?",
      history:
        "Your browsing history shows recent activity across all devices. Would you like me to show you today's history, search for specific sites, or help you clear certain entries?",
      security:
        "Your security score is currently 98%! I can help you improve it further by enabling additional security features. Would you like me to run a security scan?",
      default:
        "I understand you need assistance with browser management. I can help with device sync, password management, browsing history, security settings, and troubleshooting. Could you be more specific about what you'd like to do?",
    };

    const input = userInput.toLowerCase();
    if (input.includes("sync") || input.includes("tab")) return responses.sync;
    if (input.includes("device") || input.includes("connect"))
      return responses.device;
    if (input.includes("password") || input.includes("login"))
      return responses.password;
    if (input.includes("history") || input.includes("browse"))
      return responses.history;
    if (input.includes("security") || input.includes("safe"))
      return responses.security;

    return responses.default;
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    // Simulate voice recording
    if (!isRecording) {
      setTimeout(() => {
        setIsRecording(false);
        setInputValue("How do I sync my tabs between my phone and laptop?");
      }, 3000);
    }
  };

  if (!isOpen) {
    return (
      <motion.button
        className="fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-r from-blue-500 via-purple-600 to-pink-500 rounded-2xl flex items-center justify-center shadow-2xl z-50"
        onClick={onToggle}
        whileHover={{ scale: 1.1, rotate: 5 }}
        whileTap={{ scale: 0.9 }}
        initial={{ scale: 0, rotate: 180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-600 to-pink-500 rounded-2xl blur-xl opacity-50 animate-pulse"></div>
        <MessageCircle className="w-8 h-8 text-white relative z-10" />

        {/* Notification indicator */}
        <motion.div
          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-xs text-white font-bold"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          AI
        </motion.div>
      </motion.button>
    );
  }

  return (
    <motion.div
      className="fixed bottom-6 right-6 z-50"
      initial={{ scale: 0, y: 100 }}
      animate={{ scale: 1, y: 0 }}
      exit={{ scale: 0, y: 100 }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
    >
      <div
        className={`glass-card rounded-2xl shadow-2xl overflow-hidden ${
          isMinimized ? "w-80 h-16" : "w-96 h-[600px]"
        } transition-all duration-300`}
      >
        {/* Header */}
        <motion.div
          className="glass-header p-4 flex items-center justify-between border-b border-white/10"
          layout
        >
          <div className="flex items-center space-x-3">
            <motion.div
              className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center relative"
              animate={isThinking ? { rotate: [0, 360] } : {}}
              transition={{ duration: 2, repeat: isThinking ? Infinity : 0 }}
            >
              <Brain className="w-5 h-5 text-white" />
              {isThinking && (
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl"
                  animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
                  transition={{ duration: 1, repeat: Infinity }}
                />
              )}
            </motion.div>

            <div>
              <h3 className="text-white font-semibold flex items-center space-x-2">
                <span>AI Assistant</span>
                <Sparkles className="w-4 h-4 text-yellow-400" />
              </h3>
              <p className="text-xs text-gray-400">
                {isThinking ? "Thinking..." : isTyping ? "Typing..." : "Online"}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <motion.button
              className="glass-button p-2 rounded-lg"
              onClick={() => setIsMuted(!isMuted)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              {isMuted ? (
                <VolumeX className="w-4 h-4 text-white" />
              ) : (
                <Volume2 className="w-4 h-4 text-white" />
              )}
            </motion.button>

            <motion.button
              className="glass-button p-2 rounded-lg"
              onClick={() => setIsMinimized(!isMinimized)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              {isMinimized ? (
                <Maximize2 className="w-4 h-4 text-white" />
              ) : (
                <Minimize2 className="w-4 h-4 text-white" />
              )}
            </motion.button>

            <motion.button
              className="glass-button p-2 rounded-lg hover:bg-red-500/20"
              onClick={onToggle}
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
            >
              <X className="w-4 h-4 text-white" />
            </motion.button>
          </div>
        </motion.div>

        <AnimatePresence>
          {!isMinimized && (
            <motion.div
              className="flex flex-col h-[calc(600px-80px)]"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "calc(600px - 80px)" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message, index) => (
                  <motion.div
                    key={message.id}
                    className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}
                    initial={{ opacity: 0, y: 20, scale: 0.8 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div
                      className={`flex items-start space-x-2 max-w-[80%] ${
                        message.type === "user"
                          ? "flex-row-reverse space-x-reverse"
                          : ""
                      }`}
                    >
                      <motion.div
                        className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                          message.type === "user"
                            ? "bg-gradient-to-r from-blue-500 to-purple-600"
                            : "bg-gradient-to-r from-emerald-500 to-teal-600"
                        }`}
                        whileHover={{ scale: 1.1, rotate: 360 }}
                        transition={{ duration: 0.6 }}
                      >
                        {message.type === "user" ? (
                          <User className="w-4 h-4 text-white" />
                        ) : (
                          <Bot className="w-4 h-4 text-white" />
                        )}
                      </motion.div>

                      <motion.div
                        className={`glass-card rounded-2xl p-3 ${
                          message.type === "user"
                            ? "bg-blue-500/20 border-blue-500/30"
                            : "bg-white/10 border-white/20"
                        }`}
                        whileHover={{ scale: 1.02 }}
                      >
                        <p className="text-white text-sm leading-relaxed">
                          {message.content}
                        </p>
                        <span className="text-xs text-gray-400 mt-1 block">
                          {message.timestamp.toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </motion.div>
                    </div>
                  </motion.div>
                ))}

                {/* Typing indicator */}
                <AnimatePresence>
                  {isTyping && (
                    <motion.div
                      className="flex justify-start"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                    >
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                          <Bot className="w-4 h-4 text-white" />
                        </div>
                        <div className="glass-card rounded-2xl p-3 bg-white/10">
                          <div className="flex space-x-1">
                            {[0, 1, 2].map((i) => (
                              <motion.div
                                key={i}
                                className="w-2 h-2 bg-white/60 rounded-full"
                                animate={{ y: [0, -8, 0] }}
                                transition={{
                                  duration: 0.6,
                                  repeat: Infinity,
                                  delay: i * 0.2,
                                }}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div ref={messagesEndRef} />
              </div>

              {/* Input area */}
              <motion.div
                className="p-4 border-t border-white/10"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <div className="flex items-center space-x-3">
                  <div className="flex-1 relative">
                    <input
                      ref={inputRef}
                      type="text"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Ask me anything about browser sync..."
                      className="w-full glass-card rounded-xl px-4 py-3 text-white placeholder-gray-400 bg-white/5 border border-white/10 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                      disabled={isTyping}
                    />
                    {isRecording && (
                      <motion.div
                        className="absolute inset-0 rounded-xl border-2 border-red-500"
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ duration: 1, repeat: Infinity }}
                      />
                    )}
                  </div>

                  <motion.button
                    className={`glass-button p-3 rounded-xl ${
                      isRecording ? "bg-red-500/20 border-red-500/30" : ""
                    }`}
                    onClick={toggleRecording}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    {isRecording ? (
                      <MicOff className="w-5 h-5 text-red-400" />
                    ) : (
                      <Mic className="w-5 h-5 text-white" />
                    )}
                  </motion.button>

                  <motion.button
                    className="glass-button p-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 disabled:opacity-50"
                    onClick={handleSendMessage}
                    disabled={!inputValue.trim() || isTyping}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Send className="w-5 h-5 text-white" />
                  </motion.button>
                </div>

                {/* Quick actions */}
                <motion.div
                  className="flex flex-wrap gap-2 mt-3"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  {[
                    "Sync all tabs",
                    "Check devices",
                    "Security scan",
                    "Show history",
                  ].map((action, index) => (
                    <motion.button
                      key={action}
                      className="glass-button px-3 py-1 rounded-lg text-xs text-white hover:bg-white/10"
                      onClick={() => setInputValue(action)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 + index * 0.1 }}
                    >
                      {action}
                    </motion.button>
                  ))}
                </motion.div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};
