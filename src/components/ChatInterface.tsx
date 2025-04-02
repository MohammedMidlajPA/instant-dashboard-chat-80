
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SendHorizonal, Bot, User, Download } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";

type Message = {
  id: string;
  content: string;
  sender: "user" | "bot";
  timestamp: Date;
};

export function ChatInterface() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content: "Hello! I'm your AI assistant. How can I help you with your dashboard today?",
      sender: "bot",
      timestamp: new Date(),
    },
  ]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    // Simulate bot response
    setTimeout(() => {
      let botResponse: Message;

      if (input.toLowerCase().includes("sales")) {
        botResponse = {
          id: (Date.now() + 1).toString(),
          content: "Your sales have increased by 12% this month compared to last month. Would you like to see the detailed report?",
          sender: "bot",
          timestamp: new Date(),
        };
      } else if (input.toLowerCase().includes("user") || input.toLowerCase().includes("customer")) {
        botResponse = {
          id: (Date.now() + 1).toString(),
          content: "You've gained 156 new users in the past 7 days, which is a 8% improvement from the previous week.",
          sender: "bot",
          timestamp: new Date(),
        };
      } else {
        botResponse = {
          id: (Date.now() + 1).toString(),
          content: "I can help you analyze your dashboard data. Try asking about sales numbers, user growth, or other metrics!",
          sender: "bot",
          timestamp: new Date(),
        };
      }

      setMessages((prev) => [...prev, botResponse]);
    }, 1000);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.sender === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`flex gap-3 max-w-[80%] ${
                message.sender === "user" ? "flex-row-reverse" : "flex-row"
              }`}
            >
              <Avatar className="h-8 w-8">
                {message.sender === "user" ? (
                  <>
                    <AvatarImage src="https://github.com/shadcn.png" />
                    <AvatarFallback><User size={16} /></AvatarFallback>
                  </>
                ) : (
                  <>
                    <AvatarImage src="" />
                    <AvatarFallback className="bg-purple-600 text-white">
                      <Bot size={16} />
                    </AvatarFallback>
                  </>
                )}
              </Avatar>
              <div>
                <Card
                  className={`px-4 py-3 ${
                    message.sender === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary"
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                </Card>
                <p className="text-xs text-muted-foreground mt-1 px-1">
                  {message.timestamp.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="border-t p-4 bg-background/95 backdrop-blur-sm">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about your dashboard data..."
            className="flex-1"
          />
          <Button type="submit" size="icon">
            <SendHorizonal className="h-4 w-4" />
            <span className="sr-only">Send</span>
          </Button>
          <Button variant="outline" size="icon">
            <Download className="h-4 w-4" />
            <span className="sr-only">Download</span>
          </Button>
        </form>
        <p className="text-xs text-muted-foreground mt-2">
          Your assistant can access and analyze your dashboard data
        </p>
      </div>
    </div>
  );
}
