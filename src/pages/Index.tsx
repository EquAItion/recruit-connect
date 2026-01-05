import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { 
  Users, 
  Phone, 
  PhoneCall, 
  TrendingUp, 
  CheckCircle2, 
  XCircle, 
  Clock,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { Call, Candidate } from '@/types/database';

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalCandidates: 0,
    totalCalls: 0,
    completedCalls: 0,
    interestedCandidates: 0,
  });
  const [recentCalls, setRecentCalls] = useState<Call[]>([]);
  const [recentCandidates, setRecentCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);

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
      // Fetch candidates count
      const { count: candidatesCount } = await supabase
        .from('candidates')
        .select('*', { count: 'exact', head: true });

      // Fetch calls count
      const { count: callsCount } = await supabase
        .from('calls')
        .select('*', { count: 'exact', head: true });

      // Fetch completed calls count
      const { count: completedCount } = await supabase
        .from('calls')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'completed');

      // Fetch interested candidates count
      const { count: interestedCount } = await supabase
        .from('candidates')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'interested');

      setStats({
        totalCandidates: candidatesCount || 0,
        totalCalls: callsCount || 0,
        completedCalls: completedCount || 0,
        interestedCandidates: interestedCount || 0,
      });

      // Fetch recent calls
      const { data: calls } = await supabase
        .from('calls')
        .select('*')
        .order('started_at', { ascending: false })
        .limit(5);

      setRecentCalls(calls as Call[] || []);

      // Fetch recent candidates
      const { data: candidates } = await supabase
        .from('candidates')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      setRecentCandidates(candidates as Candidate[] || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Candidates',
      value: stats.totalCandidates,
      icon: Users,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
      trend: '+12%',
      trendUp: true,
    },
    {
      title: 'Total Calls',
      value: stats.totalCalls,
      icon: Phone,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
      trend: '+8%',
      trendUp: true,
    },
    {
      title: 'Completed Calls',
      value: stats.completedCalls,
      icon: CheckCircle2,
      color: 'text-green-400',
      bgColor: 'bg-green-500/10',
      trend: '+15%',
      trendUp: true,
    },
    {
      title: 'Interested',
      value: stats.interestedCandidates,
      icon: TrendingUp,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10',
      trend: '+5%',
      trendUp: true,
    },
  ];

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      new: 'status-new',
      contacted: 'status-contacted',
      interested: 'status-interested',
      not_interested: 'status-not-interested',
      scheduled: 'status-scheduled',
      hired: 'status-hired',
      rejected: 'status-rejected',
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

  return (
    <Layout>
      <div className="space-y-8 animate-fade-in">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-display font-bold">Dashboard</h1>
          <p className="mt-1 text-muted-foreground">
            Overview of your recruiting calls and candidates
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {statCards.map((stat, index) => (
            <Card key={index} className="glass-card overflow-hidden animate-scale-in" style={{ animationDelay: `${index * 50}ms` }}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${stat.bgColor}`}>
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                  <div className="flex items-center gap-1 text-xs">
                    {stat.trendUp ? (
                      <ArrowUpRight className="h-3 w-3 text-green-400" />
                    ) : (
                      <ArrowDownRight className="h-3 w-3 text-red-400" />
                    )}
                    <span className={stat.trendUp ? 'text-green-400' : 'text-red-400'}>
                      {stat.trend}
                    </span>
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-3xl font-display font-bold">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent Activity */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Recent Calls */}
          <Card className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-display">Recent Calls</CardTitle>
              <Phone className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-16 animate-pulse rounded-lg bg-muted" />
                  ))}
                </div>
              ) : recentCalls.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <PhoneCall className="h-12 w-12 text-muted-foreground/50" />
                  <p className="mt-3 text-sm text-muted-foreground">No calls yet</p>
                  <p className="text-xs text-muted-foreground/70">Start making calls to see them here</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentCalls.map((call) => (
                    <div
                      key={call.id}
                      className="flex items-center justify-between rounded-lg bg-muted/50 p-4 transition-colors hover:bg-muted"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20">
                          <Phone className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">Call #{call.id.slice(0, 8)}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(call.started_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <span className={`status-badge ${getStatusColor(call.status)}`}>
                        {call.status.replace('_', ' ')}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Candidates */}
          <Card className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-display">Recent Candidates</CardTitle>
              <Users className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-16 animate-pulse rounded-lg bg-muted" />
                  ))}
                </div>
              ) : recentCandidates.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Users className="h-12 w-12 text-muted-foreground/50" />
                  <p className="mt-3 text-sm text-muted-foreground">No candidates yet</p>
                  <p className="text-xs text-muted-foreground/70">Add candidates to get started</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentCandidates.map((candidate) => (
                    <div
                      key={candidate.id}
                      className="flex items-center justify-between rounded-lg bg-muted/50 p-4 transition-colors hover:bg-muted"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/20 text-blue-400 font-medium">
                          {candidate.full_name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{candidate.full_name}</p>
                          <p className="text-xs text-muted-foreground">
                            {candidate.job_title || 'No title'} {candidate.company ? `at ${candidate.company}` : ''}
                          </p>
                        </div>
                      </div>
                      <span className={`status-badge ${getStatusColor(candidate.status)}`}>
                        {candidate.status.replace('_', ' ')}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
