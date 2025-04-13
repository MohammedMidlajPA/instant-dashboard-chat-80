
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { vapiService } from "@/services/vapiService";

interface VapiApiKeyFormProps {
  onApiKeySet?: (isSet: boolean) => void;
}

export function VapiApiKeyForm({ onApiKeySet }: VapiApiKeyFormProps) {
  const [apiKey, setApiKey] = useState("");
  const [isApiKeySet, setIsApiKeySet] = useState(false);

  useEffect(() => {
    // Check if API key is already set
    const existingKey = vapiService.getApiKey();
    setIsApiKeySet(!!existingKey);
    if (existingKey && onApiKeySet) {
      onApiKeySet(true);
    }
  }, [onApiKeySet]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!apiKey.trim()) {
      toast.error("Please enter a valid API key");
      return;
    }
    
    try {
      vapiService.setApiKey(apiKey);
      setIsApiKeySet(true);
      setApiKey(""); // Clear form for security
      toast.success("VAPI API key has been set successfully");
      
      if (onApiKeySet) {
        onApiKeySet(true);
      }
    } catch (error) {
      toast.error("Failed to set API key");
    }
  };

  const handleClearApiKey = () => {
    vapiService.clearApiKey();
    setIsApiKeySet(false);
    toast.info("VAPI API key has been cleared");
    
    if (onApiKeySet) {
      onApiKeySet(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">VAPI API Configuration</CardTitle>
        <CardDescription>
          {isApiKeySet 
            ? "Your VAPI API key is configured" 
            : "Set your VAPI API key to enable AI calling features"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!isApiKeySet ? (
          <form onSubmit={handleSubmit} className="flex items-center gap-2">
            <Input
              type="password"
              placeholder="Enter VAPI API Key"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="flex-1"
            />
            <Button type="submit">
              Set Key
            </Button>
          </form>
        ) : (
          <div className="flex items-center justify-between">
            <div className="text-sm text-green-600 flex items-center gap-2">
              <span className="w-2 h-2 bg-green-600 rounded-full"></span>
              API key is set and ready to use
            </div>
            <Button variant="outline" size="sm" onClick={handleClearApiKey}>
              Clear Key
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
