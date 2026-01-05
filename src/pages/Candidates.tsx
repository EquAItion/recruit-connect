import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { apiClient } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { 
  Plus, 
  Search, 
  Phone, 
  Mail, 
  MapPin, 
  Briefcase,
  ExternalLink,
  MoreVertical,
  Edit,
  Trash2,
  PhoneCall
} from 'lucide-react';
import { Candidate, CandidateStatus, PhoneNumber, CompanyProfile } from '@/types/database';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function Candidates() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [phoneNumbers, setPhoneNumbers] = useState<PhoneNumber[]>([]);
  const [companies, setCompanies] = useState<CompanyProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isCallDialogOpen, setIsCallDialogOpen] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [calling, setCalling] = useState(false);

  // Test function for debugging
  const testBolnaAPI = async () => {
    try {
      const result = await apiClient.makeCall({
        agent_id: '0952dc64-49bb-482b-9fdf-dacb0befaa36',
        recipient_phone: '+918090990117',
        user_data: { test: true }
      });
      console.log('Test API result:', result);
      toast({ title: 'Test successful! Check console.' });
    } catch (error: any) {
      console.error('Test API error:', error);
      toast({ variant: 'destructive', title: 'Test failed', description: error.message });
    }
  };

  // Form state
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    job_title: '',
    company: '',
    location: '',
    skills: '',
    notes: '',
    linkedin_url: '',
  });

  const [callFormData, setCallFormData] = useState({
    phone_number_id: '',
    company_profile_id: '',
    agent_id: '',
  });

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      const [candidatesRes, phoneRes, companyRes] = await Promise.all([
        supabase.from('candidates').select('*').order('created_at', { ascending: false }),
        supabase.from('phone_numbers').select('*').eq('is_active', true),
        supabase.from('company_profiles').select('*'),
      ]);

      setCandidates(candidatesRes.data as Candidate[] || []);
      setPhoneNumbers(phoneRes.data as PhoneNumber[] || []);
      setCompanies(companyRes.data as CompanyProfile[] || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCandidate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { error } = await supabase.from('candidates').insert({
        user_id: user!.id,
        full_name: formData.full_name,
        email: formData.email || null,
        phone: formData.phone,
        job_title: formData.job_title || null,
        company: formData.company || null,
        location: formData.location || null,
        skills: formData.skills ? formData.skills.split(',').map(s => s.trim()) : null,
        notes: formData.notes || null,
        linkedin_url: formData.linkedin_url || null,
      });

      if (error) throw error;

      toast({ title: 'Candidate added successfully!' });
      setIsAddDialogOpen(false);
      setFormData({
        full_name: '',
        email: '',
        phone: '',
        job_title: '',
        company: '',
        location: '',
        skills: '',
        notes: '',
        linkedin_url: '',
      });
      fetchData();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error adding candidate',
        description: error.message,
      });
    }
  };

  const handleDeleteCandidate = async (id: string) => {
    try {
      const { error } = await supabase.from('candidates').delete().eq('id', id);
      if (error) throw error;
      toast({ title: 'Candidate deleted' });
      fetchData();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error deleting candidate',
        description: error.message,
      });
    }
  };

  const handleUpdateStatus = async (id: string, status: CandidateStatus) => {
    try {
      const { error } = await supabase
        .from('candidates')
        .update({ status })
        .eq('id', id);
      if (error) throw error;
      toast({ title: 'Status updated' });
      fetchData();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error updating status',
        description: error.message,
      });
    }
  };

  const handleMakeCall = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCandidate) return;

    setCalling(true);
    try {
      console.log('Making call with:', {
        user: user?.id,
        session: !!session,
        access_token: session?.access_token ? 'exists' : 'missing',
        candidate: selectedCandidate.full_name,
        agent_id: callFormData.agent_id
      });
      
      const selectedPhone = phoneNumbers.find(p => p.id === callFormData.phone_number_id);
      const selectedCompany = companies.find(c => c.id === callFormData.company_profile_id);

      // Create call record
      const { data: callData, error: callError } = await supabase.from('calls').insert({
        user_id: user!.id,
        candidate_id: selectedCandidate.id,
        phone_number_id: callFormData.phone_number_id || null,
        company_profile_id: callFormData.company_profile_id || null,
        status: 'initiated',
      }).select().single();

      if (callError) throw callError;

      // Make Bolna API call
      const { data, error } = await supabase.functions.invoke('bolna-call', {
        body: {
          action: 'make_call',
          agent_id: callFormData.agent_id,
          recipient_phone: selectedCandidate.phone,
          from_phone: callFormData.phone_number_id === 'bolna-managed' ? null : selectedPhone?.phone_number,
          user_data: {
            candidate_name: selectedCandidate.full_name,
            company_name: selectedCompany?.company_name,
            job_title: selectedCandidate.job_title,
          },
        },
      });

      if (error) throw error;

      console.log('Bolna API response:', data);

      // Update call with Bolna call ID
      if (data?.id) {
        await supabase
          .from('calls')
          .update({ bolna_call_id: data.id, status: 'ringing' })
          .eq('id', callData.id);
      }

      toast({ title: 'Call initiated successfully!' });
      setIsCallDialogOpen(false);
      await handleUpdateStatus(selectedCandidate.id, 'contacted');
    } catch (error: any) {
      console.error('Call error details:', {
        error: error.message,
        details: error.details || error,
        status: error.status
      });
      toast({
        variant: 'destructive',
        title: 'Error making call',
        description: error.message,
      });
    } finally {
      setCalling(false);
    }
  };

  const filteredCandidates = candidates.filter(candidate => {
    const matchesSearch = 
      candidate.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.phone.includes(searchTerm);
    
    const matchesStatus = statusFilter === 'all' || candidate.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      new: 'status-new',
      contacted: 'status-contacted',
      interested: 'status-interested',
      not_interested: 'status-not-interested',
      scheduled: 'status-scheduled',
      hired: 'status-hired',
      rejected: 'status-rejected',
    };
    return colors[status] || 'status-new';
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
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold">Candidates</h1>
            <p className="mt-1 text-muted-foreground">
              Manage your candidate pipeline
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={testBolnaAPI} variant="outline" size="sm">
              Test API
            </Button>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Candidate
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Add New Candidate</DialogTitle>
                <DialogDescription>
                  Enter the candidate's details below
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddCandidate} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="full_name">Full Name *</Label>
                    <Input
                      id="full_name"
                      value={formData.full_name}
                      onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone *</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+918090990117"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="job_title">Job Title</Label>
                    <Input
                      id="job_title"
                      value={formData.job_title}
                      onChange={(e) => setFormData({ ...formData, job_title: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company">Company</Label>
                    <Input
                      id="company"
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="linkedin_url">LinkedIn URL</Label>
                    <Input
                      id="linkedin_url"
                      value={formData.linkedin_url}
                      onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="skills">Skills (comma separated)</Label>
                  <Input
                    id="skills"
                    value={formData.skills}
                    onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                    placeholder="React, TypeScript, Node.js"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={3}
                  />
                </div>
                <div className="flex justify-end gap-3">
                  <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Add Candidate</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search candidates..."
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
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="contacted">Contacted</SelectItem>
              <SelectItem value="interested">Interested</SelectItem>
              <SelectItem value="not_interested">Not Interested</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="hired">Hired</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Candidates Grid */}
        {loading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="h-48 p-6" />
              </Card>
            ))}
          </div>
        ) : filteredCandidates.length === 0 ? (
          <Card className="glass-card">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                <Search className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="mt-4 text-lg font-medium">No candidates found</p>
              <p className="text-sm text-muted-foreground">
                {searchTerm || statusFilter !== 'all' ? 'Try adjusting your filters' : 'Add your first candidate to get started'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredCandidates.map((candidate, index) => (
              <Card 
                key={candidate.id} 
                className="glass-card animate-scale-in overflow-hidden"
                style={{ animationDelay: `${index * 30}ms` }}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/20 text-primary font-display font-bold text-lg">
                        {candidate.full_name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-semibold">{candidate.full_name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {candidate.job_title || 'No title'}
                        </p>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => {
                          setSelectedCandidate(candidate);
                          setIsCallDialogOpen(true);
                        }}>
                          <PhoneCall className="mr-2 h-4 w-4" />
                          Make Call
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDeleteCandidate(candidate.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="mt-4 space-y-2">
                    {candidate.company && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Briefcase className="h-4 w-4" />
                        {candidate.company}
                      </div>
                    )}
                    {candidate.email && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Mail className="h-4 w-4" />
                        {candidate.email}
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone className="h-4 w-4" />
                      {candidate.phone}
                    </div>
                    {candidate.location && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        {candidate.location}
                      </div>
                    )}
                  </div>

                  {candidate.skills && candidate.skills.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-1">
                      {candidate.skills.slice(0, 3).map((skill, i) => (
                        <span
                          key={i}
                          className="rounded-full bg-muted px-2 py-0.5 text-xs"
                        >
                          {skill}
                        </span>
                      ))}
                      {candidate.skills.length > 3 && (
                        <span className="rounded-full bg-muted px-2 py-0.5 text-xs">
                          +{candidate.skills.length - 3}
                        </span>
                      )}
                    </div>
                  )}

                  <div className="mt-4 flex items-center justify-between">
                    <span className={`status-badge ${getStatusColor(candidate.status)}`}>
                      {candidate.status.replace('_', ' ')}
                    </span>
                    {candidate.linkedin_url && (
                      <a
                        href={candidate.linkedin_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-xs text-primary hover:underline"
                      >
                        LinkedIn
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Call Dialog */}
        <Dialog open={isCallDialogOpen} onOpenChange={setIsCallDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Make Call to {selectedCandidate?.full_name}</DialogTitle>
              <DialogDescription>
                Configure the call settings
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleMakeCall} className="space-y-4">
              <div className="space-y-2">
                <Label>Calling Number (Optional)</Label>
                <Select
                  value={callFormData.phone_number_id}
                  onValueChange={(value) => setCallFormData({ ...callFormData, phone_number_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Use Bolna managed number" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bolna-managed">Use Bolna managed number</SelectItem>
                    {phoneNumbers.map((phone) => (
                      <SelectItem key={phone.id} value={phone.id}>
                        {phone.label ? `${phone.label} - ` : ''}{phone.phone_number}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Leave empty to use Bolna's managed phone number for testing
                </p>
              </div>
              <div className="space-y-2">
                <Label>Company Profile</Label>
                <Select
                  value={callFormData.company_profile_id}
                  onValueChange={(value) => setCallFormData({ ...callFormData, company_profile_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a company" />
                  </SelectTrigger>
                  <SelectContent>
                    {companies.map((company) => (
                      <SelectItem key={company.id} value={company.id}>
                        {company.company_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {companies.length === 0 && (
                  <p className="text-xs text-muted-foreground">
                    No company profiles configured. Add one in Settings.
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="agent_id">Bolna Agent ID *</Label>
                <Input
                  id="agent_id"
                  value={callFormData.agent_id}
                  onChange={(e) => setCallFormData({ ...callFormData, agent_id: e.target.value })}
                  placeholder="Enter your Bolna agent ID"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Get your agent ID from the Bolna dashboard
                </p>
              </div>
              <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setIsCallDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={calling}>
                  {calling ? (
                    <>
                      <span className="animate-pulse">Calling...</span>
                    </>
                  ) : (
                    <>
                      <PhoneCall className="mr-2 h-4 w-4" />
                      Start Call
                    </>
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
