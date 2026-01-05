import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { apiClient } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { 
  Search, 
  Phone, 
  Clock,
  PhoneOff,
  CheckCircle2,
  XCircle,
  MessageSquare,
  Calendar
} from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export default function Calls() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [calls, setCalls] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedCall, setSelectedCall] = useState<any>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [outcomeNotes, setOutcomeNotes] = useState('');
  const [selectedOutcome, setSelectedOutcome] = useState<string>('');

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchCalls();
    }
  }, [user]);

  const fetchCalls = async () => {
    try {
      const data = await apiClient.getCalls();
      setCalls(data || []);
    } catch (error) {
      console.error('Error fetching calls:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateOutcome = async () => {
    if (!selectedCall || !selectedOutcome) return;

    setUpdating(true);
    try {
      await apiClient.updateCall(selectedCall.id, {
        outcome: selectedOutcome,
        notes: outcomeNotes || null,
        status: 'completed',
      });

      toast({ title: 'Call outcome updated' });
      setIsDetailsOpen(false);
      fetchCalls();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error updating call',
        description: error.message,
      });
    } finally {
      setUpdating(false);
    }
  };

  const fetchCallTranscript = async (call: any) => {
    console.log('Fetch transcript not implemented yet');
  };

  const filteredCalls = calls.filter(call => {
    const matchesSearch = 
      call.candidate?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      call.candidate?.phone?.includes(searchTerm) ||
      call.bolna_call_id?.includes(searchTerm);
    
    const matchesStatus = statusFilter === 'all' || call.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-4 w-4 text-green-400" />;
      case 'failed':
      case 'no_answer':
      case 'busy':
        return <XCircle className="h-4 w-4 text-red-400" />;
      case 'in_progress':
      case 'ringing':
        return <Phone className="h-4 w-4 text-primary animate-pulse" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getOutcomeIcon = (outcome: string) => {
    switch (outcome) {
      case 'interested':
        return <CheckCircle2 className="h-4 w-4 text-green-400" />;
      case 'not_interested':
        return <XCircle className="h-4 w-4 text-red-400" />;
      case 'callback_requested':
        return <Calendar className="h-4 w-4 text-purple-400" />;
      case 'voicemail':
        return <MessageSquare className="h-4 w-4 text-yellow-400" />;
      default:
        return <PhoneOff className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      initiated: 'status-new',
      ringing: 'status-contacted',
      in_progress: 'status-contacted',
      completed: 'status-interested',
      failed: 'status-rejected',
      no_answer: 'status-not-interested',
      busy: 'status-not-interested',
    };
    return colors[status] || 'status-new';
  };

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return '--:--';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (authLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-display font-bold">Calls</h1>
          <p className="mt-1 text-muted-foreground">
            Track and manage your recruiting calls
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search calls..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="initiated">Initiated</SelectItem>
              <SelectItem value="ringing">Ringing</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
              <SelectItem value="no_answer">No Answer</SelectItem>
              <SelectItem value="busy">Busy</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Calls Table */}
        {loading ? (
          <Card className="glass-card">
            <CardContent className="p-6">
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-16 animate-pulse rounded-lg bg-muted" />
                ))}
              </div>
            </CardContent>
          </Card>
        ) : filteredCalls.length === 0 ? (
          <Card className="glass-card">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                <Phone className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="mt-4 text-lg font-medium">No calls found</p>
              <p className="text-sm text-muted-foreground">
                {searchTerm || statusFilter !== 'all' ? 'Try adjusting your filters' : 'Start making calls to candidates'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card className="glass-card overflow-hidden">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-border bg-muted/50">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">Candidate</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">Status</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">Outcome</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">Duration</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">Date</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredCalls.map((call, index) => (
                      <tr 
                        key={call.id} 
                        className="transition-colors hover:bg-muted/50 animate-fade-in"
                        style={{ animationDelay: `${index * 30}ms` }}
                      >
                        <td className="px-6 py-4">
                          {call.candidate ? (
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20 text-primary font-medium">
                                {call.candidate.full_name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p className="font-medium">{call.candidate.full_name}</p>
                                <p className="text-sm text-muted-foreground">{call.candidate.phone}</p>
                              </div>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">Unknown</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(call.status)}
                            <span className={`status-badge ${getStatusColor(call.status)}`}>
                              {call.status.replace('_', ' ')}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {call.outcome ? (
                            <div className="flex items-center gap-2">
                              {getOutcomeIcon(call.outcome)}
                              <span className="text-sm capitalize">{call.outcome.replace('_', ' ')}</span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">--</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-mono text-sm">{formatDuration(call.duration_seconds)}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm">
                            <p>{new Date(call.started_at).toLocaleDateString()}</p>
                            <p className="text-muted-foreground">
                              {new Date(call.started_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedCall(call);
                              setSelectedOutcome(call.outcome || '');
                              setOutcomeNotes(call.notes || '');
                              setIsDetailsOpen(true);
                              if (call.bolna_call_id && !call.transcript) {
                                fetchCallTranscript(call);
                              }
                            }}
                          >
                            Details
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Call Details Dialog */}
        <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Call Details</DialogTitle>
              <DialogDescription>
                {selectedCall?.candidate?.full_name || 'Unknown Candidate'}
              </DialogDescription>
            </DialogHeader>
            {selectedCall && (
              <div className="space-y-6">
                {/* Call Info */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1">
                    <Label className="text-muted-foreground">Status</Label>
                    <p className="font-medium capitalize">{selectedCall.status.replace('_', ' ')}</p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-muted-foreground">Duration</Label>
                    <p className="font-mono">{formatDuration(selectedCall.duration_seconds)}</p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-muted-foreground">Started</Label>
                    <p>{new Date(selectedCall.started_at).toLocaleString()}</p>
                  </div>
                  {selectedCall.ended_at && (
                    <div className="space-y-1">
                      <Label className="text-muted-foreground">Ended</Label>
                      <p>{new Date(selectedCall.ended_at).toLocaleString()}</p>
                    </div>
                  )}
                </div>

                {/* Transcript */}
                {selectedCall.transcript && (
                  <div className="space-y-2">
                    <Label>Transcript</Label>
                    <div className="rounded-lg bg-muted p-4 max-h-48 overflow-y-auto">
                      <pre className="whitespace-pre-wrap text-sm">{selectedCall.transcript}</pre>
                    </div>
                  </div>
                )}

                {/* Update Outcome */}
                <div className="space-y-4 border-t pt-4">
                  <Label>Update Outcome</Label>
                  <Select
                    value={selectedOutcome}
                    onValueChange={(value) => setSelectedOutcome(value as CallOutcome)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select outcome" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="interested">Interested</SelectItem>
                      <SelectItem value="not_interested">Not Interested</SelectItem>
                      <SelectItem value="callback_requested">Callback Requested</SelectItem>
                      <SelectItem value="wrong_number">Wrong Number</SelectItem>
                      <SelectItem value="voicemail">Voicemail</SelectItem>
                      <SelectItem value="no_response">No Response</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="space-y-2">
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea
                      id="notes"
                      value={outcomeNotes}
                      onChange={(e) => setOutcomeNotes(e.target.value)}
                      placeholder="Add notes about this call..."
                      rows={3}
                    />
                  </div>
                  <div className="flex justify-end gap-3">
                    <Button variant="outline" onClick={() => setIsDetailsOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleUpdateOutcome} disabled={updating || !selectedOutcome}>
                      {updating ? 'Saving...' : 'Save Outcome'}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
