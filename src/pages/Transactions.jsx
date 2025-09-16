import React, { useState, useEffect } from 'react';
import { 
  Typography, Container, Box, Paper, Alert, CircularProgress,
  AppBar, Toolbar, IconButton, Chip, Card, CardContent, Grid
} from '@mui/material';
import { 
  ArrowBack as ArrowBackIcon, Refresh as RefreshIcon, 
  AttachMoney as MoneyIcon, TrendingUp as TrendingUpIcon,
  AccountBalance as BankIcon, Receipt as ReceiptIcon
} from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [summary, setSummary] = useState({
    totalRevenue: 0,
    platformShare: 0,
    doctorPayouts: 0,
    pendingPayouts: 0
  });
  const navigate = useNavigate();

  const getTransactionTypeColor = (type) => {
    switch (type) {
      case 'payment': return 'success';
      case 'payout': return 'warning';
      case 'refund': return 'error';
      default: return 'default';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'success';
      case 'pending': return 'warning';
      case 'failed': return 'error';
      default: return 'default';
    }
  };

  const columns = [
    { 
      field: 'id', 
      headerName: 'Transaction ID', 
      width: 140,
      renderCell: (params) => (
        <Typography variant="body2" fontWeight="bold">
          TXN-{params.value}
        </Typography>
      )
    },
    { 
      field: 'type', 
      headerName: 'Type', 
      width: 120,
      renderCell: (params) => (
        <Chip 
          label={params.value.toUpperCase()} 
          color={getTransactionTypeColor(params.value)}
          size="small"
          variant="filled"
        />
      )
    },
    { 
      field: 'case_id', 
      headerName: 'Case ID', 
      width: 100,
      renderCell: (params) => (
        <Typography variant="body2">
          {params.value ? `#${params.value}` : 'N/A'}
        </Typography>
      )
    },
    { 
      field: 'patient_id', 
      headerName: 'Patient', 
      width: 100,
      renderCell: (params) => (
        <Typography variant="body2">
          P-{params.value}
        </Typography>
      )
    },
    { 
      field: 'doctor_id', 
      headerName: 'Doctor', 
      width: 100,
      renderCell: (params) => (
        <Typography variant="body2">
          {params.value ? `D-${params.value}` : 'N/A'}
        </Typography>
      )
    },
    { 
      field: 'amount', 
      headerName: 'Amount', 
      width: 120,
      renderCell: (params) => (
        <Typography variant="body2" fontWeight="bold" 
          color={params.row.type === 'payout' ? 'error.main' : 'success.main'}>
          {params.row.type === 'payout' ? '-' : '+'}${params.value}
        </Typography>
      )
    },
    { 
      field: 'platform_share', 
      headerName: 'Platform Share', 
      width: 140,
      renderCell: (params) => (
        <Typography variant="body2" fontWeight="bold" color="primary.main">
          ${params.value || 'N/A'}
        </Typography>
      )
    },
    { 
      field: 'status', 
      headerName: 'Status', 
      width: 120,
      renderCell: (params) => (
        <Chip 
          label={params.value.toUpperCase()} 
          color={getStatusColor(params.value)}
          size="small"
          variant="outlined"
        />
      )
    },
    { 
      field: 'created_at', 
      headerName: 'Date', 
      width: 180,
      renderCell: (params) => (
        <Typography variant="body2">
          {new Date(params.value).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </Typography>
      )
    },
    { 
      field: 'payment_method', 
      headerName: 'Method', 
      width: 120,
      renderCell: (params) => (
        <Typography variant="body2">
          {params.value || 'N/A'}
        </Typography>
      )
    },
  ];

  const fetchTransactions = async () => {
    setLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('admin_access_token');
      const adminKey = localStorage.getItem('admin_api_key');
      
      if (!token || !adminKey) {
        navigate('/');
        return;
      }

      const response = await axios.get(`${API_BASE_URL}/api/admin/transactions`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'X-Admin-Key': adminKey
        },
      });
      
      setTransactions(response.data);
      
      // Calculate summary
      const totalRevenue = response.data
        .filter(t => t.type === 'payment' && t.status === 'completed')
        .reduce((sum, t) => sum + t.amount, 0);
      
      const platformShare = response.data
        .filter(t => t.type === 'payment' && t.status === 'completed')
        .reduce((sum, t) => sum + (t.platform_share || 0), 0);
      
      const doctorPayouts = response.data
        .filter(t => t.type === 'payout' && t.status === 'completed')
        .reduce((sum, t) => sum + t.amount, 0);
      
      const pendingPayouts = response.data
        .filter(t => t.type === 'payout' && t.status === 'pending')
        .reduce((sum, t) => sum + t.amount, 0);
      
      setSummary({
        totalRevenue,
        platformShare,
        doctorPayouts,
        pendingPayouts
      });
      
    } catch (error) {
      console.error('Error fetching transactions:', error);
      
      if (error.response?.status === 401 || error.response?.status === 403) {
        localStorage.removeItem('admin_access_token');
        navigate('/');
      } else {
        // Mock data for demo
        const mockTransactions = [
          {
            id: 1,
            type: 'payment',
            case_id: 1,
            patient_id: 1,
            doctor_id: 2,
            amount: 200,
            platform_share: 120,
            status: 'completed',
            created_at: '2024-08-25T10:30:00Z',
            payment_method: 'Plutu'
          },
          {
            id: 2,
            type: 'payout',
            case_id: 1,
            patient_id: 1,
            doctor_id: 2,
            amount: 80,
            platform_share: null,
            status: 'completed',
            created_at: '2024-08-26T15:45:00Z',
            payment_method: 'Bank Transfer'
          },
          {
            id: 3,
            type: 'payment',
            case_id: 3,
            patient_id: 1,
            doctor_id: 2,
            amount: 200,
            platform_share: 120,
            status: 'pending',
            created_at: '2024-08-31T09:15:00Z',
            payment_method: 'Plutu'
          }
        ];
        
        setTransactions(mockTransactions);
        setSummary({
          totalRevenue: 400,
          platformShare: 240,
          doctorPayouts: 80,
          pendingPayouts: 0
        });
        setError('Using demo data. Live data unavailable.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [navigate]);

  if (loading) {
    return (
      <Container maxWidth="xl">
        <Box sx={{ mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <CircularProgress size={60} />
          <Typography sx={{ mt: 2 }}>Loading transactions...</Typography>
        </Box>
      </Container>
    );
  }

  return (
    <>
      <AppBar position="static" sx={{ mb: 4, bgcolor: 'error.main' }}>
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={() => navigate('/dashboard')}>
            <ArrowBackIcon />
          </IconButton>
          <MoneyIcon sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Financial Transactions
          </Typography>
          <IconButton color="inherit" onClick={fetchTransactions}>
            <RefreshIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl">
        {error && (
          <Alert severity="warning" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Financial Summary Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: 'success.main', color: 'white' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography color="inherit" gutterBottom variant="h6">
                      Total Revenue
                    </Typography>
                    <Typography variant="h4" fontWeight="bold">
                      ${summary.totalRevenue.toLocaleString()}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>
                      All patient payments
                    </Typography>
                  </Box>
                  <ReceiptIcon sx={{ fontSize: 60, opacity: 0.3 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: 'primary.main', color: 'white' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography color="inherit" gutterBottom variant="h6">
                      Platform Share
                    </Typography>
                    <Typography variant="h4" fontWeight="bold">
                      ${summary.platformShare.toLocaleString()}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>
                      60% of total revenue
                    </Typography>
                  </Box>
                  <TrendingUpIcon sx={{ fontSize: 60, opacity: 0.3 }} />
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
                      Doctor Payouts
                    </Typography>
                    <Typography variant="h4" fontWeight="bold">
                      ${summary.doctorPayouts.toLocaleString()}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>
                      40% paid to doctors
                    </Typography>
                  </Box>
                  <BankIcon sx={{ fontSize: 60, opacity: 0.3 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: 'error.main', color: 'white' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography color="inherit" gutterBottom variant="h6">
                      Pending Payouts
                    </Typography>
                    <Typography variant="h4" fontWeight="bold">
                      ${summary.pendingPayouts.toLocaleString()}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>
                      Awaiting processing
                    </Typography>
                  </Box>
                  <MoneyIcon sx={{ fontSize: 60, opacity: 0.3 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Paper sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h5" fontWeight="bold">
              All Transactions
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Total: {transactions.length} transactions
            </Typography>
          </Box>

          <Box sx={{ height: 600, width: '100%' }}>
            <DataGrid
              rows={transactions}
              columns={columns}
              pageSize={25}
              rowsPerPageOptions={[25, 50, 100]}
              checkboxSelection
              disableSelectionOnClick
              sx={{
                '& .MuiDataGrid-cell': {
                  borderBottom: '1px solid #e0e0e0',
                },
                '& .MuiDataGrid-columnHeaders': {
                  backgroundColor: '#f5f5f5',
                  fontWeight: 'bold',
                },
              }}
            />
          </Box>
        </Paper>
      </Container>
    </>
  );
}

export default Transactions;

