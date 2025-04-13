
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { vapiService } from "@/services/vapiService";
import { supabase } from "@/integrations/supabase/client";

interface VapiApiKeyFormProps {
  onApiKeySet?: (isSet: boolean) => void;
}

export function VapiApiKeyForm({ onApiKeySet }: VapiApiKeyFormProps) {
  const [apiKey, setApiKey] = useState("");
  const [isApiKeySet, setIsApiKeySet] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if API key is already set
    const checkApiKey = async () => {
      setIsLoading(true);
      try {
        await vapiService.fetchCredentials();
        const existingKey = vapiService.getApiKey();
        const existingAssistantId = vapiService.getAssistantId();
        
        const hasCredentials = !!existingKey && !!existingAssistantId;
        setIsApiKeySet(hasCredentials);
        
        if (hasCredentials && onApiKeySet) {
          onApiKeySet(true);
        }
      } catch (error) {
        console.error("Error checking API key:", error);
        toast.error("Failed to check API key status");
      } finally {
        setIsLoading(false);
      }
    };
    
    checkApiKey();
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
          {isLoading 
            ? "Checking API configuration..." 
            : isApiKeySet 
              ? "Your VAPI API key is configured" 
              : "Set your VAPI API key to enable AI calling features"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-2">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600"></div>
            <span className="ml-2 text-sm text-gray-500">Checking configuration...</span>
          </div>
        ) : !isApiKeySet ? (
          <div className="space-y-4">
            <div className="text-sm text-amber-600">
              API key is now configured through Supabase. No manual entry needed.
            </div>
            <Button 
              onClick={async () => {
                setIsLoading(true);
                await vapiService.fetchCredentials();
                const hasKey = !!vapiService.getApiKey() && !!vapiService.getAssistantId();
                setIsApiKeySet(hasKey);
                setIsLoading(false);
                
                if (hasKey) {
                  toast.success("VAPI credentials successfully loaded");
                  if (onApiKeySet) onApiKeySet(true);
                } else {
                  toast.error("Failed to load VAPI credentials");
                }
              }}
              className="w-full"
            >
              Refresh Credentials
            </Button>
          </div>
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
