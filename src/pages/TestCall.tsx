import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { apiClient } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

export default function TestCall() {
  const { toast } = useToast();
  const [phone, setPhone] = useState('+91');
  const [agentId, setAgentId] = useState('0952dc64-49bb-482b-9fdf-dacb0befaa36');
  const [calling, setCalling] = useState(false);

  const makeCall = async (e: React.FormEvent) => {
    e.preventDefault();
    setCalling(true);

    try {
      console.log('Making call to:', phone, 'with agent:', agentId);
      
      const result = await apiClient.makeCall({
        agent_id: agentId,
        recipient_phone: phone,
        user_data: {
          test_call: true,
          timestamp: new Date().toISOString()
        }
      });

      console.log('Call result:', result);
      toast({ title: 'Call initiated successfully!' });
    } catch (error: any) {
      console.error('Call error:', error);
      toast({
        variant: 'destructive',
        title: 'Call failed',
        description: error.message || 'Unknown error'
      });
    } finally {
      setCalling(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Test Call</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={makeCall} className="space-y-4">
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+918090990117"
                  required
                />
              </div>
              <div>
                <Label htmlFor="agent">Agent ID</Label>
                <Input
                  id="agent"
                  value={agentId}
                  onChange={(e) => setAgentId(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" disabled={calling} className="w-full">
                {calling ? 'Calling...' : 'Make Call'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}