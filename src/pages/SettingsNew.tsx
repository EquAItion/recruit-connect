import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { apiClient } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { 
  Plus, 
  Phone, 
  Building2, 
  Trash2,
  Check
} from 'lucide-react';

interface PhoneNumber {
  id: string;
  phone_number: string;
  label?: string;
  is_active: boolean;
}

interface CompanyProfile {
  id: string;
  company_name: string;
  description?: string;
  is_default: boolean;
}

export default function Settings() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [phoneNumbers, setPhoneNumbers] = useState<PhoneNumber[]>([]);
  const [companies, setCompanies] = useState<CompanyProfile[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isPhoneDialogOpen, setIsPhoneDialogOpen] = useState(false);
  const [isCompanyDialogOpen, setIsCompanyDialogOpen] = useState(false);
  
  const [phoneForm, setPhoneForm] = useState({ phone_number: '', label: '' });
  const [companyForm, setCompanyForm] = useState({ company_name: '', description: '', is_default: false });

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
      const [phoneRes, companyRes] = await Promise.all([
        apiClient.getPhoneNumbers(),
        apiClient.getCompanies(),
      ]);

      setPhoneNumbers(phoneRes || []);
      setCompanies(companyRes || []);
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPhone = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await apiClient.addPhoneNumber({
        phone_number: phoneForm.phone_number,
        label: phoneForm.label || null,
      });

      toast({ title: 'Phone number added!' });
      setIsPhoneDialogOpen(false);
      setPhoneForm({ phone_number: '', label: '' });
      fetchData();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error adding phone number',
        description: error.message,
      });
    }
  };

  const handleAddCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await apiClient.addCompany({
        company_name: companyForm.company_name,
        description: companyForm.description || null,
        is_default: companyForm.is_default,
      });

      toast({ title: 'Company profile added!' });
      setIsCompanyDialogOpen(false);
      setCompanyForm({ company_name: '', description: '', is_default: false });
      fetchData();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error adding company',
        description: error.message,
      });
    }
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
      <div className="space-y-8 animate-fade-in">
        <div>
          <h1 className="text-3xl font-display font-bold">Settings</h1>
          <p className="mt-1 text-muted-foreground">
            Configure your phone numbers and company profiles
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Phone Numbers */}
          <Card className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-5 w-5 text-primary" />
                  Phone Numbers
                </CardTitle>
                <CardDescription>
                  Manage outbound calling numbers
                </CardDescription>
              </div>
              <Dialog open={isPhoneDialogOpen} onOpenChange={setIsPhoneDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Phone Number</DialogTitle>
                    <DialogDescription>
                      Add a new outbound calling number
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleAddPhone} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone_number">Phone Number *</Label>
                      <Input
                        id="phone_number"
                        value={phoneForm.phone_number}
                        onChange={(e) => setPhoneForm({ ...phoneForm, phone_number: e.target.value })}
                        placeholder="+918090990117"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone_label">Label</Label>
                      <Input
                        id="phone_label"
                        value={phoneForm.label}
                        onChange={(e) => setPhoneForm({ ...phoneForm, label: e.target.value })}
                        placeholder="e.g., Main, Sales"
                      />
                    </div>
                    <div className="flex justify-end gap-3">
                      <Button type="button" variant="outline" onClick={() => setIsPhoneDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit">Add Number</Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-3">
                  {[...Array(2)].map((_, i) => (
                    <div key={i} className="h-16 animate-pulse rounded-lg bg-muted" />
                  ))}
                </div>
              ) : phoneNumbers.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Phone className="h-12 w-12 text-muted-foreground/50" />
                  <p className="mt-3 text-sm text-muted-foreground">No phone numbers configured</p>
                  <p className="text-xs text-muted-foreground/70">Add a number to start making calls</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {phoneNumbers.map((phone) => (
                    <div
                      key={phone.id}
                      className="flex items-center justify-between rounded-lg bg-muted/50 p-4"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20">
                          <Phone className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{phone.phone_number}</p>
                          {phone.label && (
                            <p className="text-sm text-muted-foreground">{phone.label}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Company Profiles */}
          <Card className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-primary" />
                  Company Profiles
                </CardTitle>
                <CardDescription>
                  Manage company identities for calls
                </CardDescription>
              </div>
              <Dialog open={isCompanyDialogOpen} onOpenChange={setIsCompanyDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Company Profile</DialogTitle>
                    <DialogDescription>
                      Create a new company identity for calls
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleAddCompany} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="company_name">Company Name *</Label>
                      <Input
                        id="company_name"
                        value={companyForm.company_name}
                        onChange={(e) => setCompanyForm({ ...companyForm, company_name: e.target.value })}
                        placeholder="Acme Corp"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="company_description">Description</Label>
                      <Textarea
                        id="company_description"
                        value={companyForm.description}
                        onChange={(e) => setCompanyForm({ ...companyForm, description: e.target.value })}
                        placeholder="Brief description of the company..."
                        rows={3}
                      />
                    </div>
                    <div className="flex items-center gap-3">
                      <Switch
                        id="is_default"
                        checked={companyForm.is_default}
                        onCheckedChange={(checked) => setCompanyForm({ ...companyForm, is_default: checked })}
                      />
                      <Label htmlFor="is_default">Set as default</Label>
                    </div>
                    <div className="flex justify-end gap-3">
                      <Button type="button" variant="outline" onClick={() => setIsCompanyDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit">Add Company</Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-3">
                  {[...Array(2)].map((_, i) => (
                    <div key={i} className="h-16 animate-pulse rounded-lg bg-muted" />
                  ))}
                </div>
              ) : companies.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Building2 className="h-12 w-12 text-muted-foreground/50" />
                  <p className="mt-3 text-sm text-muted-foreground">No company profiles configured</p>
                  <p className="text-xs text-muted-foreground/70">Add a company to use when making calls</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {companies.map((company) => (
                    <div
                      key={company.id}
                      className="flex items-center justify-between rounded-lg bg-muted/50 p-4"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20">
                          <Building2 className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{company.company_name}</p>
                            {company.is_default && (
                              <span className="rounded-full bg-primary/20 px-2 py-0.5 text-xs text-primary">
                                Default
                              </span>
                            )}
                          </div>
                          {company.description && (
                            <p className="text-sm text-muted-foreground line-clamp-1">{company.description}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* API Configuration Info */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Bolna AI Integration</CardTitle>
            <CardDescription>
              Your Bolna API key is securely stored and ready to use
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3 rounded-lg bg-green-500/10 border border-green-500/20 p-4">
              <Check className="h-5 w-5 text-green-400" />
              <div>
                <p className="font-medium text-green-400">API Key Configured</p>
                <p className="text-sm text-muted-foreground">
                  Your Bolna API key is set up. You can now make outbound calls.
                </p>
              </div>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              To make calls, you'll need to provide your Bolna Agent ID when initiating a call. 
              You can create agents in the{' '}
              <a 
                href="https://app.bolna.ai" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Bolna Dashboard
              </a>.
            </p>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}