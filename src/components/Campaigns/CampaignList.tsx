
import React from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, Eye, BarChart, Play, Pause } from "lucide-react";
import { format } from "date-fns";

interface CampaignListProps {
  campaigns: any[];
  isLoading: boolean;
  onRefresh: () => void;
  onSelect: (campaign: any) => void;
}

export const CampaignList: React.FC<CampaignListProps> = ({ 
  campaigns, 
  isLoading,
  onRefresh,
  onSelect
}) => {
  return (
    <div>
      <div className="flex justify-end mb-4">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onRefresh} 
          disabled={isLoading}
        >
          {isLoading ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          <span className="ml-2">Refresh</span>
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-40">
          <div className="flex flex-col items-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600"></div>
            <p className="mt-2 text-sm text-gray-500">Loading campaigns...</p>
          </div>
        </div>
      ) : campaigns.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-md">
          <p className="text-gray-500">No campaigns found.</p>
          <p className="text-sm text-gray-400 mt-1">Create a new campaign to get started.</p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Campaign Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Contacts</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {campaigns.map((campaign) => (
              <TableRow key={campaign.id}>
                <TableCell className="font-medium">{campaign.name}</TableCell>
                <TableCell>
                  <CampaignStatusBadge status={campaign.status} />
                </TableCell>
                <TableCell>{campaign.contacts_count || 0}</TableCell>
                <TableCell>
                  {campaign.created_at ? format(new Date(campaign.created_at), 'MMM d, yyyy') : 'N/A'}
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => onSelect(campaign)}
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      View
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                    >
                      <BarChart className="h-3 w-3 mr-1" />
                      Stats
                    </Button>
                    {campaign.status === 'active' ? (
                      <Button 
                        variant="outline" 
                        size="sm"
                      >
                        <Pause className="h-3 w-3 mr-1" />
                        Pause
                      </Button>
                    ) : campaign.status === 'paused' ? (
                      <Button 
                        variant="outline" 
                        size="sm"
                      >
                        <Play className="h-3 w-3 mr-1" />
                        Resume
                      </Button>
                    ) : null}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
};

interface CampaignStatusBadgeProps {
  status: string;
}

const CampaignStatusBadge: React.FC<CampaignStatusBadgeProps> = ({ status }) => {
  switch (status?.toLowerCase()) {
    case 'active':
      return <Badge className="bg-green-100 text-green-800 border-green-200">Active</Badge>;
    case 'paused':
      return <Badge className="bg-amber-100 text-amber-800 border-amber-200">Paused</Badge>;
    case 'completed':
      return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Completed</Badge>;
    case 'scheduled':
      return <Badge className="bg-purple-100 text-purple-800 border-purple-200">Scheduled</Badge>;
    case 'failed':
      return <Badge className="bg-red-100 text-red-800 border-red-200">Failed</Badge>;
    default:
      return <Badge className="bg-gray-100 text-gray-800 border-gray-200">Draft</Badge>;
  }
};
