
import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Bot, User } from "lucide-react";

interface CallTranscriptProps {
  transcription: string;
  contact: string;
  date: string;
  assistantName?: string;
}

export const CallTranscript: React.FC<CallTranscriptProps> = ({
  transcription,
  contact,
  date,
  assistantName = "College AI Assistant"
}) => {
  // Basic parsing of the transcription to identify speakers
  // This is a simple approach - for more accurate parsing, you might need
  // a more sophisticated algorithm based on your actual transcript format
  const parseTranscription = (text: string) => {
    if (!text) return [];
    
    // Split by newlines and identify patterns like "Assistant:" or "User:"
    const lines = text.split('\n');
    const messages: {
      content: string;
      sender: "assistant" | "user";
      timestamp: Date;
    }[] = [];
    
    let currentSpeaker: "assistant" | "user" = "assistant";
    let currentMessage = "";
    
    lines.forEach(line => {
      const trimmedLine = line.trim();
      if (!trimmedLine) return;
      
      // Check for speaker indicators
      if (trimmedLine.toLowerCase().startsWith("assistant:") || 
          trimmedLine.toLowerCase().startsWith("ai:") ||
          trimmedLine.toLowerCase().startsWith("bot:")) {
        
        // If we were building a message, save it
        if (currentMessage) {
          messages.push({
            content: currentMessage.trim(),
            sender: currentSpeaker,
            timestamp: new Date(date)
          });
        }
        
        // Start a new assistant message
        currentSpeaker = "assistant";
        currentMessage = trimmedLine.substring(trimmedLine.indexOf(":") + 1);
      } 
      else if (trimmedLine.toLowerCase().startsWith("user:") || 
               trimmedLine.toLowerCase().startsWith("caller:") ||
               trimmedLine.toLowerCase().startsWith("student:") ||
               trimmedLine.toLowerCase().includes(`${contact.toLowerCase()}:`)) {
        
        // If we were building a message, save it
        if (currentMessage) {
          messages.push({
            content: currentMessage.trim(),
            sender: currentSpeaker,
            timestamp: new Date(date)
          });
        }
        
        // Start a new user message
        currentSpeaker = "user";
        currentMessage = trimmedLine.substring(trimmedLine.indexOf(":") + 1);
      } 
      else {
        // Continue current message
        currentMessage += " " + trimmedLine;
      }
    });
    
    // Add the last message if there is one
    if (currentMessage) {
      messages.push({
        content: currentMessage.trim(),
        sender: currentSpeaker,
        timestamp: new Date(date)
      });
    }
    
    // If we couldn't parse any messages with speakers, use a fallback approach
    if (messages.length === 0 && text) {
      // Attempt to split by obvious pauses or sentence structure
      const sentences = text.split(/[.!?]\s+/);
      let isAssistant = true; // Alternate between assistant and user
      
      sentences.forEach(sentence => {
        if (sentence.trim()) {
          messages.push({
            content: sentence.trim() + ".",
            sender: isAssistant ? "assistant" : "user",
            timestamp: new Date(date)
          });
          isAssistant = !isAssistant; // Alternate speakers
        }
      });
    }
    
    return messages;
  };
  
  const messages = parseTranscription(transcription);

  if (!transcription || messages.length === 0) {
    return (
      <div className="text-center p-6 text-muted-foreground">
        No transcript available for this call. The call may still be in progress or processing.
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto px-4 py-6 space-y-6">
      {messages.map((message, index) => (
        <div
          key={index}
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
                  <AvatarImage src="" />
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
                {message.sender === "user" ? contact : assistantName} •{" "}
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
  );
};
