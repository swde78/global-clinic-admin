import React, { useState, useEffect } from 'react';
import { 
  Typography, Container, Box, Card, CardContent, Grid, Alert, CircularProgress,
  AppBar, Toolbar, IconButton, Paper, Chip, LinearProgress
} from '@mui/material';
import { 
  ExitToApp as LogoutIcon, Refresh as RefreshIcon, Dashboard as DashboardIcon,
  People as PeopleIcon, Assignment as CasesIcon, AttachMoney as MoneyIcon,
  HealthAndSafety as HealthIcon, TrendingUp as TrendingUpIcon,
  Warning as WarningIcon, CheckCircle as CheckIcon
} from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

function Dashboard() {
  const [metrics, setMetrics] = useState({
    totalUsers: 0,
    totalPatients: 0,
    totalDoctors: 0,
    totalCases: 0,
    totalRevenue: 0,
    systemHealth: 'unknown'
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const navigate = useNavigate();

  // Mock data for charts (in production, this would come from API)
  const revenueData = [
    { month: 'Jan', revenue: 12000, cases: 45 },
    { month: 'Feb', revenue: 18000, cases: 67 },
    { month: 'Mar', revenue: 25000, cases: 89 },
    { month: 'Apr', revenue: 32000, cases: 112 },
    { month: 'May', revenue: 28000, cases: 98 },
    { month: 'Jun', revenue: 35000, cases: 125 }
  ];

  const userGrowthData = [
    { month: 'Jan', patients: 120, doctors: 15 },
    { month: 'Feb', patients: 180, doctors: 22 },
    { month: 'Mar', patients: 250, doctors: 28 },
    { month: 'Apr', patients: 320, doctors: 35 },
    { month: 'May', patients: 380, doctors: 42 },
    { month: 'Jun', patients: 450, doctors: 48 }
  ];

  const getSystemHealthColor = (health) => {
    switch (health) {
      case 'excellent': return 'success';
      case 'good': return 'info';
      case 'warning': return 'warning';
      case 'critical': return 'error';
      default: return 'default';
    }
  };

  const getSystemHealthIcon = (health) => {
    switch (health) {
      case 'excellent': return <CheckIcon />;
      case 'good': return <HealthIcon />;
      case 'warning': return <WarningIcon />;
      case 'critical': return <WarningIcon />;
      default: return <HealthIcon />;
    }
  };

  
  const fetchMetrics = async (showLoading = true) => {
  if (showLoading) setLoading(true);
  setError('');
  
  try {
    const token = localStorage.getItem('admin_access_token');
    
    if (!token) {
      navigate('/');
      return;
    }

    // ⚠️ تغيير: استدعاء endpoint واحد فقط
    const response = await axios.get(`${API_BASE_URL}/api/admin/dashboard/stats`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    setMetrics({
      totalUsers: response.data.total_users,
      totalPatients: response.data.total_patients,
      totalDoctors: response.data.total_doctors,
      totalCases: response.data.total_cases,
      totalRevenue: response.data.total_revenue,
      systemHealth: response.data.system_health
    });
    
  } catch (error) {
    console.error('Error fetching admin metrics:', error);
    
    if (error.response?.status === 401 || error.response?.status === 403) {
      localStorage.removeItem('admin_access_token');
      localStorage.removeItem('admin_user_id');
      localStorage.removeItem('admin_role');
      localStorage.removeItem('admin_api_key');
      navigate('/');
    } else {
      // استخدم بيانات وهمية فقط إذا فشل الاتصال
      setMetrics({
        totalUsers: 498,
        totalPatients: 450,
        totalDoctors: 48,
        totalCases: 1247,
        totalRevenue: 156750,
        systemHealth: 'excellent'
      });
      setError('Using demo data. Live data unavailable.');
    }
  } finally {
    setLoading(false);
    setRefreshing(false);
  }
};

  
  const handleRefresh = () => {
    setRefreshing(true);
    fetchMetrics(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_access_token');
    localStorage.removeItem('admin_user_id');
    localStorage.removeItem('admin_role');
    localStorage.removeItem('admin_api_key');
    navigate('/');
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  useEffect(() => {
    fetchMetrics();
  }, [navigate]);

  if (loading) {
    return (
      <Container maxWidth="xl">
        <Box sx={{ mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <CircularProgress size={60} />
          <Typography sx={{ mt: 2 }}>Loading admin dashboard...</Typography>
        </Box>
      </Container>
    );
  }

  return (
    <>
      <AppBar position="static" sx={{ mb: 4, bgcolor: 'error.main' }}>
        <Toolbar>
          <DashboardIcon sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Global Clinic - Admin Command Center
          </Typography>
          <Chip 
            label="ADMIN" 
            color="warning" 
            variant="filled" 
            sx={{ mr: 2, fontWeight: 'bold' }}
          />
          <IconButton color="inherit" onClick={handleRefresh} disabled={refreshing} aria-label="Refresh">
            <RefreshIcon />
          </IconButton>
          <IconButton color="inherit" onClick={handleLogout} aria-label="Logout">
            <LogoutIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl">
        {error && (
          <Alert severity="warning" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Key Metrics Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: 'primary.main', color: 'white' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography color="inherit" gutterBottom variant="h6">
                      Total Users
                    </Typography>
                    <Typography variant="h4" fontWeight="bold">
                      {metrics.totalUsers.toLocaleString()}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>
                      {metrics.totalPatients} Patients • {metrics.totalDoctors} Doctors
                    </Typography>
                  </Box>
                  <PeopleIcon sx={{ fontSize: 60, opacity: 0.3 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: 'success.main', color: 'white' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography color="inherit" gutterBottom variant="h6">
                      Total Cases
                    </Typography>
                    <Typography variant="h4" fontWeight="bold">
                      {metrics.totalCases.toLocaleString()}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>
                      Medical consultations processed
                    </Typography>
                  </Box>
                  <CasesIcon sx={{ fontSize: 60, opacity: 0.3 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: 'warning.main', color: 'white' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography color="inherit" gutterBottom variant="h6">
                      Total Revenue
                    </Typography>
                    <Typography variant="h4" fontWeight="bold">
                      {formatCurrency(metrics.totalRevenue)}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>
                      Platform earnings (60% share)
                    </Typography>
                  </Box>
                  <MoneyIcon sx={{ fontSize: 60, opacity: 0.3 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: getSystemHealthColor(metrics.systemHealth) + '.main', color: 'white' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography color="inherit" gutterBottom variant="h6">
                      System Health
                    </Typography>
                    <Typography variant="h4" fontWeight="bold" textTransform="capitalize">
                      {metrics.systemHealth}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>
                      All systems operational
                    </Typography>
                  </Box>
                  {getSystemHealthIcon(metrics.systemHealth)}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Charts Section */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
                <TrendingUpIcon sx={{ mr: 1 }} />
                Revenue & Cases Trend
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Line yAxisId="left" type="monotone" dataKey="revenue" stroke="#1976d2" strokeWidth={3} />
                  <Line yAxisId="right" type="monotone" dataKey="cases" stroke="#dc004e" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
                <PeopleIcon sx={{ mr: 1 }} />
                User Growth
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={userGrowthData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="patients" fill="#1976d2" />
                  <Bar dataKey="doctors" fill="#dc004e" />
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
        </Grid>

        {/* System Status */}
        <Paper sx={{ p: 3, mb: 4 }}>
          <Typography variant="h6" sx={{ mb: 3 }}>
            System Status Overview
          </Typography>
          <Grid container spacing={2}>
	    // eslint-disable-next-line
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">API Response Time</Typography>
                <LinearProgress variant="determinate" value={85} color="success" sx={{ mt: 1 }} />
                <Typography variant="body2" sx={{ mt: 1 }}>85ms avg</Typography>
              </Box>
            </Grid>
	    // eslint-disable-next-line
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">Database Performance</Typography>
                <LinearProgress variant="determinate" value={92} color="success" sx={{ mt: 1 }} />
                <Typography variant="body2" sx={{ mt: 1 }}>92% optimal</Typography>
              </Box>
            </Grid>
	    // eslint-disable-next-line
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">Server Uptime</Typography>
                <LinearProgress variant="determinate" value={99.9} color="success" sx={{ mt: 1 }} />
                <Typography variant="body2" sx={{ mt: 1 }}>99.9%</Typography>
              </Box>
            </Grid>
	    // eslint-disable-next-line
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">Security Score</Typography>
                <LinearProgress variant="determinate" value={96} color="success" sx={{ mt: 1 }} />
                <Typography variant="body2" sx={{ mt: 1 }}>96/100</Typography>
              </Box>
            </Grid>
          </Grid>
        </Paper>

        {/* Quick Actions */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Quick Actions
          </Typography>
          <Grid container spacing={2}>
            <Grid item>
              <Chip 
                label="View All Users" 
                onClick={() => navigate('/users')} 
                color="primary" 
                variant="outlined"
                clickable
              />
            </Grid>
            <Grid item>
              <Chip 
                label="Audit Cases" 
                onClick={() => navigate('/cases')} 
                color="success" 
                variant="outlined"
                clickable
              />
            </Grid>
            <Grid item>
              <Chip 
                label="Financial Reports" 
                onClick={() => navigate('/transactions')} 
                color="warning" 
                variant="outlined"
                clickable
              />
            </Grid>
            <Grid item>
              <Chip 
                label="System Logs" 
                onClick={() => alert('System logs feature coming soon')} 
                color="error" 
                variant="outlined"
                clickable
              />
            </Grid>
          </Grid>
        </Paper>
      </Container>
    </>
  );
}

export default Dashboard;

