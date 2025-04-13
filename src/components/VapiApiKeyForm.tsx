
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { vapiService } from "@/services/vapiService";
import { CheckCircle, RefreshCw } from "lucide-react";

interface VapiApiKeyFormProps {
  onApiKeySet?: (isSet: boolean) => void;
}

export function VapiApiKeyForm({ onApiKeySet }: VapiApiKeyFormProps) {
  const [isApiKeySet, setIsApiKeySet] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Use the provided assistant ID 
  const defaultAssistantId = "b6860fc3-a9da-4741-83ce-cb07c5725486";

  useEffect(() => {
    // Check if API key is already set
    const checkApiKey = async () => {
      setIsLoading(true);
      try {
        await vapiService.fetchCredentials();
        const existingKey = vapiService.getApiKey();
        
        // Use either existing ID or default
        let assistantId = vapiService.getAssistantId();
        if (!assistantId) {
          // Store the default assistant ID if none exists
          localStorage.setItem('vapi_assistant_id', defaultAssistantId);
          assistantId = defaultAssistantId;
        }
        
        const hasCredentials = !!existingKey && !!assistantId;
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
  }, [onApiKeySet, defaultAssistantId]);

  const handleClearApiKey = () => {
    vapiService.clearApiKey();
    setIsApiKeySet(false);
    toast.info("VAPI API key has been cleared");
    
    if (onApiKeySet) {
      onApiKeySet(false);
    }
  };

  const handleRefreshCredentials = async () => {
    setIsLoading(true);
    try {
      // Ensure we have the default assistant ID set
      localStorage.setItem('vapi_assistant_id', defaultAssistantId);
      
      await vapiService.fetchCredentials();
      const hasKey = !!vapiService.getApiKey();
      setIsApiKeySet(hasKey);
      
      if (hasKey) {
        toast.success("VAPI credentials successfully loaded");
        if (onApiKeySet) onApiKeySet(true);
      } else {
        toast.error("Failed to load VAPI credentials");
      }
    } catch (error) {
      console.error("Error refreshing credentials:", error);
      toast.error("Failed to refresh credentials");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full shadow-sm bg-white">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">VAPI Connection</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center space-x-2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600"></div>
            <span className="text-sm text-gray-500">Verifying connection...</span>
          </div>
        ) : !isApiKeySet ? (
          <div className="space-y-3">
            <Button 
              onClick={handleRefreshCredentials}
              className="w-full"
              size="sm"
              variant="outline"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Connect to VAPI
            </Button>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div className="text-sm text-green-600 flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Connected to VAPI
            </div>
            <Button variant="outline" size="sm" onClick={handleClearApiKey}>
              Disconnect
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
