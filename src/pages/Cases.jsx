import React, { useState, useEffect } from 'react';
import { 
  Typography, Container, Box, Paper, Alert, CircularProgress,
  AppBar, Toolbar, IconButton, Button, Chip, Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import { 
  ArrowBack as ArrowBackIcon, Refresh as RefreshIcon, 
  Assignment as CasesIcon, Visibility as ViewIcon
} from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

function Cases() {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCase, setSelectedCase] = useState(null);
  const [detailDialog, setDetailDialog] = useState(false);
  const navigate = useNavigate();

  const getStatusColor = (status) => {
    switch (status) {
      case 'submitted': return 'primary';
      case 'processing': return 'warning';
      case 'assigned': return 'info';
      case 'in_progress': return 'warning';
      case 'report_submitted': return 'success';
      case 'completed': return 'success';
      default: return 'default';
    }
  };

  const columns = [
    { 
      field: 'id', 
      headerName: 'Case ID', 
      width: 100,
      renderCell: (params) => (
        <Typography variant="body2" fontWeight="bold">
          #{params.value}
        </Typography>
      )
    },
    { 
      field: 'patient_id', 
      headerName: 'Patient ID', 
      width: 120,
      renderCell: (params) => (
        <Typography variant="body2">
          P-{params.value}
        </Typography>
      )
    },
    { 
      field: 'doctor_id', 
      headerName: 'Doctor ID', 
      width: 120,
      renderCell: (params) => (
        <Typography variant="body2">
          {params.value ? `D-${params.value}` : 'Unassigned'}
        </Typography>
      )
    },
    { 
      field: 'status', 
      headerName: 'Status', 
      width: 140,
      renderCell: (params) => (
        <Chip 
          label={params.value.replace('_', ' ').toUpperCase()} 
          color={getStatusColor(params.value)}
          size="small"
          variant="filled"
        />
      )
    },
    { 
      field: 'created_at', 
      headerName: 'Submitted', 
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
      field: 'updated_at', 
      headerName: 'Last Updated', 
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
      field: 'medical_history', 
      headerName: 'Medical History', 
      width: 300,
      renderCell: (params) => (
        <Typography variant="body2" sx={{ 
          overflow: 'hidden', 
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap'
        }}>
          {params.value || 'No history provided'}
        </Typography>
      )
    },
    { 
      field: 'revenue', 
      headerName: 'Revenue', 
      width: 120,
      renderCell: (params) => (
        <Typography variant="body2" fontWeight="bold" color="success.main">
          ${params.value || '200'}
        </Typography>
      )
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      sortable: false,
      renderCell: (params) => (
        <Button
          size="small"
          variant="outlined"
          startIcon={<ViewIcon />}
          onClick={() => handleViewCase(params.row)}
        >
          View
        </Button>
      ),
    },
  ];

  const fetchCases = async () => {
    setLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('admin_access_token');
      const adminKey = localStorage.getItem('admin_api_key');
      
      if (!token || !adminKey) {
        navigate('/');
        return;
      }

      const response = await axios.get(`${API_BASE_URL}/api/admin/cases`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'X-Admin-Key': adminKey
        },
      });
      
      setCases(response.data);
    } catch (error) {
      console.error('Error fetching cases:', error);
      
      if (error.response?.status === 401 || error.response?.status === 403) {
        localStorage.removeItem('admin_access_token');
        navigate('/');
      } else {
        // Mock data for demo
        setCases([
          {
            id: 1,
            patient_id: 1,
            doctor_id: 2,
            status: 'completed',
            created_at: '2024-08-25T10:30:00Z',
            updated_at: '2024-08-26T15:45:00Z',
            medical_history: 'Patient experiencing chronic back pain for 3 months',
            revenue: 200
          },
          {
            id: 2,
            patient_id: 3,
            doctor_id: null,
            status: 'submitted',
            created_at: '2024-08-30T14:20:00Z',
            updated_at: '2024-08-30T14:20:00Z',
            medical_history: 'Severe headaches and dizziness symptoms',
            revenue: 200
          },
          {
            id: 3,
            patient_id: 1,
            doctor_id: 2,
            status: 'in_progress',
            created_at: '2024-08-31T09:15:00Z',
            updated_at: '2024-08-31T11:30:00Z',
            medical_history: 'Follow-up consultation for previous treatment',
            revenue: 200
          }
        ]);
        setError('Using demo data. Live data unavailable.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleViewCase = (caseData) => {
    setSelectedCase(caseData);
    setDetailDialog(true);
  };

  const calculateTotalRevenue = () => {
    return cases.reduce((total, caseItem) => total + (caseItem.revenue || 200), 0);
  };

  useEffect(() => {
    fetchCases();
  }, [navigate]);

  if (loading) {
    return (
      <Container maxWidth="xl">
        <Box sx={{ mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <CircularProgress size={60} />
          <Typography sx={{ mt: 2 }}>Loading cases...</Typography>
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
          <CasesIcon sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Cases Audit
          </Typography>
          <IconButton color="inherit" onClick={fetchCases}>
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

        <Paper sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h5" fontWeight="bold">
              All Platform Cases
            </Typography>
            <Box sx={{ textAlign: 'right' }}>
              <Typography variant="body1" color="text.secondary">
                Total Cases: {cases.length}
              </Typography>
              <Typography variant="h6" color="success.main" fontWeight="bold">
                Total Revenue: ${calculateTotalRevenue().toLocaleString()}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ height: 600, width: '100%' }}>
            <DataGrid
              rows={cases}
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

        {/* Case Detail Dialog */}
        <Dialog open={detailDialog} onClose={() => setDetailDialog(false)} maxWidth="md" fullWidth>
          <DialogTitle>
            Case #{selectedCase?.id} Details
          </DialogTitle>
          <DialogContent>
            {selectedCase && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="h6" gutterBottom>Case Information</Typography>
                <Typography><strong>Patient ID:</strong> P-{selectedCase.patient_id}</Typography>
                <Typography><strong>Doctor ID:</strong> {selectedCase.doctor_id ? `D-${selectedCase.doctor_id}` : 'Unassigned'}</Typography>
                <Typography><strong>Status:</strong> {selectedCase.status.replace('_', ' ').toUpperCase()}</Typography>
                <Typography><strong>Created:</strong> {new Date(selectedCase.created_at).toLocaleString()}</Typography>
                <Typography><strong>Last Updated:</strong> {new Date(selectedCase.updated_at).toLocaleString()}</Typography>
                <Typography><strong>Revenue:</strong> ${selectedCase.revenue || 200}</Typography>
                
                <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>Medical History</Typography>
                <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                  <Typography>{selectedCase.medical_history || 'No medical history provided'}</Typography>
                </Paper>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDetailDialog(false)}>Close</Button>
          </DialogActions>
        </Dialog>
      </Container>
    </>
  );
}

export default Cases;

