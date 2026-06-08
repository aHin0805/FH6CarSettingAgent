"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import type { TaskType } from "@/lib/models/chat";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
}

const QUICK_PROMPTS = [
  "我的车过弯推头严重，怎么调？",
  "帮我生成一套竞速调校方案",
  "如何提高车辆加速性能？",
  "越野车悬挂怎么调？",
  "漂移车差速器怎么设置？",
  "高速不稳定怎么解决？",
];

export default function ChatPage() {
  const [taskType, setTaskType] = useState<TaskType>("light");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "你好！我是 FH6 调校师 🏎️，你的《地平线6》车辆调校顾问。\n\n告诉我你的车辆型号和遇到的问题，我会为你生成专业的调校方案。\n\n例如：\"我的 BMW M4 2023 公路竞速过弯推头严重\"",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<"unknown" | "connected" | "disconnected">("unknown");
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // 用 ref 跟踪最新状态，避免 useCallback 闭包陷阱
  const isLoadingRef = useRef(false);
  const messagesRef = useRef(messages);
  messagesRef.current = messages;

  // 检测后端连接状态
  useEffect(() => {
    const checkConnection = async () => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);
        const res = await fetch("/api/health", { signal: controller.signal });
        clearTimeout(timeoutId);
        setConnectionStatus(res.ok ? "connected" : "disconnected");
      } catch {
        setConnectionStatus("disconnected");
      }
    };
    checkConnection();
    const interval = setInterval(checkConnection, 30000);
    return () => clearInterval(interval);
  }, []);

  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || isLoadingRef.current) return;

      const userMsg: Message = {
        id: Date.now().toString(),
        role: "user",
        content: content.trim(),
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMsg]);
      setInput("");
      isLoadingRef.current = true;
      setIsLoading(true);

      // 用 ref 获取最新消息列表
      const currentMessages = messagesRef.current;

      // 准备 API 消息
      const apiMessages = [...currentMessages, userMsg]
        .filter((m) => m.role !== "system")
        .map((m) => ({ role: m.role, content: m.content }));

      try {
        const controller = new AbortController();
        const timeoutMs = taskType === "deep" ? 60000 : 30000;
        const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: apiMessages, taskType }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          let errorDetail = "";
          try {
            const errorData = await response.json();
            errorDetail = errorData.message || "";
          } catch {
            // 无法解析响应体
          }

          if (response.status === 401 || errorDetail.includes("API Key")) {
            throw new Error("AI API Key 未配置。请在后端 .env 中配置 API Key。");
          }
          throw new Error(errorDetail || `服务端错误 (${response.status})`);
        }

        // 流式读取
        const reader = response.body?.getReader();
        if (!reader) throw new Error("无法读取响应流");

        const assistantMsg: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: "",
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, assistantMsg]);

        const decoder = new TextDecoder();
        let fullContent = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split("\n");
          for (const line of lines) {
            if (line.startsWith("0:")) {
              try {
                const text = JSON.parse(line.slice(2));
                fullContent += text;
                setMessages((prev) => {
                  const updated = [...prev];
                  updated[updated.length - 1] = {
                    ...updated[updated.length - 1],
                    content: fullContent,
                  };
                  return updated;
                });
              } catch {
                // 忽略解析错误
              }
            }
          }
        }
      } catch (err) {
        const error = err as Error;
        let errorContent = "";

        if (error.name === "AbortError") {
          errorContent = "❌ 请求超时（30秒未收到响应）\n\n可能原因：\n• AI 模型响应过慢，请稍后重试\n• 网络连接不稳定";
        } else if (error.message.includes("Failed to fetch") || error.message.includes("NetworkError") || error.message.includes("ECONNREFUSED")) {
          errorContent = "❌ 无法连接到后端服务\n\n请检查后端是否已启动（server/ 目录执行 npm run dev）";
          setConnectionStatus("disconnected");
        } else {
          errorContent = `❌ ${error.message}`;
        }

        const errorMsg: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: errorContent,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorMsg]);
      } finally {
        isLoadingRef.current = false;
        setIsLoading(false);
      }
    },
    [taskType]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        sendMessage(input);
      }
    },
    [input, sendMessage]
  );

  return (
    <div className="flex h-full">
      {/* 对话区 */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* 对话区头部 */}
        <div className="border-b px-4 py-3 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-lg">💬</span>
            <h2 className="font-semibold">AI 调校对话</h2>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className={`inline-block w-2 h-2 rounded-full ${
                connectionStatus === "connected" ? "bg-green-500" :
                connectionStatus === "disconnected" ? "bg-red-500 animate-pulse" :
                "bg-yellow-500"
              }`} />
              <span className="text-xs text-muted-foreground">
                {connectionStatus === "connected" ? "已连接" :
                 connectionStatus === "disconnected" ? "未连接" : "检测中..."}
              </span>
            </div>
            {/* 模式切换：日常(轻量) / 深度(推理) */}
            <div className="flex items-center gap-0.5 bg-muted rounded-md p-0.5">
              <button
                onClick={() => setTaskType("light")}
                className={`px-2.5 py-1 text-xs rounded transition-colors ${
                  taskType === "light"
                    ? "bg-background shadow-sm font-medium"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                ⚡ 日常
              </button>
              <button
                onClick={() => setTaskType("deep")}
                className={`px-2.5 py-1 text-xs rounded transition-colors ${
                  taskType === "deep"
                    ? "bg-background shadow-sm font-medium"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                🧠 深度
              </button>
            </div>
          </div>
        </div>

        {/* 后端未连接警告条 */}
        {connectionStatus === "disconnected" && (
          <div className="bg-destructive/10 border-b px-4 py-2 shrink-0">
            <p className="text-sm text-destructive flex items-center gap-2">
              ⚠️ 后端服务未连接，AI 对话功能不可用。
              <a href="/settings" className="underline font-medium hover:no-underline">前往设置</a>
            </p>
          </div>
        )}

        {/* 消息列表 */}
        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          <div className="space-y-4 max-w-3xl mx-auto">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-4 py-3 text-sm whitespace-pre-wrap ${
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-lg px-4 py-3 text-sm">
                  <span className="animate-pulse">正在思考...</span>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* 快捷提问 */}
        <div className="px-4 pb-2 shrink-0">
          <div className="flex gap-2 overflow-x-auto pb-1 max-w-3xl mx-auto">
            {QUICK_PROMPTS.map((prompt) => (
              <Button
                key={prompt}
                variant="outline"
                size="sm"
                className="shrink-0 text-xs whitespace-nowrap"
                onClick={() => sendMessage(prompt)}
                disabled={isLoading}
              >
                {prompt}
              </Button>
            ))}
          </div>
        </div>

        {/* 输入区 */}
        <div className="border-t px-4 py-3 shrink-0">
          <div className="flex gap-2 max-w-3xl mx-auto">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                // 自动增长高度
                e.target.style.height = "auto";
                e.target.style.height = e.target.scrollHeight + "px";
              }}
              onKeyDown={handleKeyDown}
              placeholder="描述你的车辆和调校需求... (Enter 发送, Shift+Enter 换行)"
              className="flex-1 resize-none rounded-md border bg-background px-4 py-3 text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-ring min-h-[56px] max-h-[200px] overflow-y-auto"
              rows={2}
              disabled={isLoading}
            />
            <Button
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || isLoading}
            >
              发送
            </Button>
          </div>
        </div>
      </div>

      {/* 右侧调校面板 */}
      <div className="w-80 border-l bg-card shrink-0 overflow-y-auto">
        <div className="p-4">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            📊 当前调校方案
          </h3>
          <p className="text-sm text-muted-foreground">
            AI 生成调校方案后，参数将在此处实时展示
          </p>
          <hr className="my-3 border-border" />
          <div className="space-y-3">
            <div className="text-xs text-muted-foreground text-center py-8">
              暂无调校方案
              <br />
              开始对话获取 AI 建议
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
