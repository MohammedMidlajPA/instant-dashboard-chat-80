
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { vapiService } from "@/services/vapiService";
import { CheckCircle, RefreshCw, AlertCircle } from "lucide-react";

interface VapiApiKeyFormProps {
  onApiKeySet?: (isSet: boolean) => void;
}

export function VapiApiKeyForm({ onApiKeySet }: VapiApiKeyFormProps) {
  const [isApiKeySet, setIsApiKeySet] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  // Use the correct VAPI public key provided: b6860fc3-a9da-4741-83ce-cb07c5725486
  const defaultAssistantId = "b6860fc3-a9da-4741-83ce-cb07c5725486";

  useEffect(() => {
    // Check if API key is already set
    const checkApiKey = async () => {
      setIsLoading(true);
      setConnectionError(null);
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
          
          // Verify connection with a test API call
          try {
            const testData = await vapiService.getCallAnalysis({
              assistantId,
              limit: 1
            });
            
            if (testData) {
              console.log("VAPI connection verified successfully");
            }
          } catch (testError) {
            console.warn("VAPI connection verified but test call failed:", testError);
            // We don't set connection as failed here since the credentials are valid
            // The issue might be with specific endpoints or permissions
          }
        }
        
        console.log("Vapi connection status:", hasCredentials ? "Connected" : "Disconnected");
        console.log("Using assistant ID:", assistantId);
      } catch (error) {
        console.error("Error checking API key:", error);
        setConnectionError("Failed to connect to VAPI. Please check your API key and try again.");
        toast.error("Failed to check API key status");
        if (onApiKeySet) onApiKeySet(false);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkApiKey();
  }, [onApiKeySet, defaultAssistantId]);

  const handleClearApiKey = () => {
    vapiService.clearApiKey();
    setIsApiKeySet(false);
    setConnectionError(null);
    toast.info("VAPI API key has been cleared");
    
    if (onApiKeySet) {
      onApiKeySet(false);
    }
  };

  const handleRefreshCredentials = async () => {
    setIsLoading(true);
    setConnectionError(null);
    try {
      // Ensure we have the correct default assistant ID set
      localStorage.setItem('vapi_assistant_id', defaultAssistantId);
      
      await vapiService.fetchCredentials();
      const hasKey = !!vapiService.getApiKey();
      setIsApiKeySet(hasKey);
      
      if (hasKey) {
        // Verify connection with a test API call
        try {
          const testData = await vapiService.getCallAnalysis({
            assistantId: defaultAssistantId,
            limit: 1
          });
          
          if (testData) {
            toast.success("VAPI credentials verified and connection successful");
          }
        } catch (testError) {
          console.warn("VAPI credentials loaded but API test failed:", testError);
          toast.warning("VAPI credentials loaded but API connection might have issues");
        }
        
        if (onApiKeySet) onApiKeySet(true);
      } else {
        toast.error("Failed to load VAPI credentials");
      }
    } catch (error) {
      console.error("Error refreshing credentials:", error);
      setConnectionError("Failed to connect to VAPI. Please check your API key and assistant ID.");
      toast.error("Failed to refresh credentials");
      if (onApiKeySet) onApiKeySet(false);
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
        ) : connectionError ? (
          <div className="space-y-3">
            <div className="text-sm text-amber-600 flex items-center gap-2 mb-2">
              <AlertCircle className="h-4 w-4" />
              {connectionError}
            </div>
            <Button 
              onClick={handleRefreshCredentials}
              className="w-full"
              size="sm"
              variant="outline"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Retry VAPI Connection
            </Button>
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
