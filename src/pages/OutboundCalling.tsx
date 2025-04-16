
import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { PhoneOutgoing, RefreshCw, Phone } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { mcubeService } from "@/services/mcube";

const formSchema = z.object({
  agentPhone: z.string().min(10, {
    message: "Agent phone must be at least 10 digits.",
  }),
  customerPhone: z.string().min(10, {
    message: "Customer phone must be at least 10 digits.",
  }),
});

const OutboundCalling = () => {
  const [isLoading, setIsLoading] = useState(false);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      agentPhone: "",
      customerPhone: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsLoading(true);
      const result = await mcubeService.makeOutboundCall(values.agentPhone, values.customerPhone);
      
      if (result.success) {
        toast.success("Call initiated successfully");
        form.reset({ agentPhone: values.agentPhone, customerPhone: "" });
      } else {
        toast.error(result.message || "Failed to initiate call");
      }
    } catch (error) {
      console.error("Failed to make call:", error);
      toast.error("An error occurred while trying to initiate the call");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto animate-fade-in space-y-8">
        <div>
          <h1 className="text-2xl font-bold mb-2">Outbound Calling</h1>
          <p className="text-muted-foreground">Initiate calls to customers and manage outgoing communications</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="shadowed-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PhoneOutgoing className="h-5 w-5 text-primary" />
                Make Outbound Call
              </CardTitle>
              <CardDescription>
                Start a new outbound call by entering agent and customer phone numbers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="agentPhone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Agent Phone</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Enter agent phone number" 
                            {...field} 
                            className="bg-background"
                          />
                        </FormControl>
                        <FormDescription>
                          The phone number of the agent making the call
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="customerPhone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Customer Phone</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Enter customer phone number" 
                            {...field} 
                            className="bg-background"
                          />
                        </FormControl>
                        <FormDescription>
                          The phone number of the customer you want to call
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        Initiating Call...
                      </>
                    ) : (
                      <>
                        <Phone className="mr-2 h-4 w-4" />
                        Start Call
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          <Card className="shadowed-card">
            <CardHeader>
              <CardTitle>About Outbound Calling</CardTitle>
              <CardDescription>
                Learn how MCUBE's outbound calling system works
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-sm font-medium mb-1">How It Works</h3>
                <p className="text-sm text-muted-foreground">
                  The outbound API allows your system to initiate calls. When an agent triggers
                  an outbound call, your system sends a request to MCUBE with the required parameters.
                </p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium mb-1">Required Parameters</h3>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li><strong>exenumber:</strong> The agent's phone number making the call</li>
                  <li><strong>custnumber:</strong> The customer's phone number to be dialed</li>
                  <li><strong>refurl:</strong> A callback URL for receiving call responses/updates</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-sm font-medium mb-1">Process Flow</h3>
                <ol className="text-sm text-muted-foreground list-decimal pl-4 space-y-1">
                  <li>Agent enters the phone numbers</li>
                  <li>System sends a request to MCUBE API</li>
                  <li>MCUBE initiates the call to both parties</li>
                  <li>Call events are tracked in real-time</li>
                </ol>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">
                View Documentation
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default OutboundCalling;
