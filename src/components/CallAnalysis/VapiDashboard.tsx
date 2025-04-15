
import React, { useState } from 'react';
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { VapiApiKeyForm } from "@/components/VapiApiKeyForm";
import { CallLogsList } from "./CallLogsList";
import { CallDetailsView } from "./CallDetails";
import { useVapiRealtime } from "@/hooks/useVapiRealtime";
import { Badge } from "@/components/ui/badge";

const VapiDashboard: React.FC = () => {
  const [selectedCallId, setSelectedCallId] = useState<string>("");
  const [isApiKeySet, setIsApiKeySet] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  
  const { 
    data: callRecordings, 
    isLoading, 
    isConnected, 
    refetch 
  } = useVapiRealtime({
    fetchInterval: 30000, // 30 seconds
    initialFetchDelay: 1000, // 1 second initial delay
    enabled: isApiKeySet
  });

  // Filter recordings based on search term
  const filteredRecordings = searchTerm && callRecordings
    ? callRecordings.filter(recording => {
        const searchableText = `${recording.contact_name || ''} ${recording.company_name || ''} ${(recording.keywords || []).join(' ')} ${recording.transcription || ''}`.toLowerCase();
        return searchableText.includes(searchTerm.toLowerCase());
      })
    : callRecordings || [];

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Call Analytics Dashboard</h1>
            <p className="text-muted-foreground">Review and analyze student engagement calls</p>
          </div>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input 
              placeholder="Search recordings..." 
              className="pl-9" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <VapiApiKeyForm onApiKeySet={setIsApiKeySet} />

        {isApiKeySet && (
          <>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                {isConnected ? (
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-green-500"></span>
                    Real-time Updates Active
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-amber-500"></span>
                    Connecting to VAPI...
                  </Badge>
                )}
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={refetch} 
                disabled={isLoading}
              >
                {isLoading ? (
                  <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-1" />
                )}
                Refresh Data
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              {/* Call List - Takes up more space on larger screens */}
              <div className="md:col-span-7">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle>Recent Calls</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CallLogsList 
                      recordings={filteredRecordings} 
                      isLoading={isLoading}
                    />
                  </CardContent>
                </Card>
              </div>
              
              {/* Call Details - Takes up less space */}
              <div className="md:col-span-5">
                <CallDetailsView callId={selectedCallId} />
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default VapiDashboard;
