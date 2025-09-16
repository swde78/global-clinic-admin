import React, { useState, useEffect } from 'react';
import { 
  Typography, Container, Box, Paper, Alert, CircularProgress,
  AppBar, Toolbar, IconButton, Button, Chip, Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import { 
  ArrowBack as ArrowBackIcon, Refresh as RefreshIcon, 
  People as PeopleIcon, Block as BlockIcon, CheckCircle as ActivateIcon
} from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [actionDialog, setActionDialog] = useState(false);
  const [actionType, setActionType] = useState('');
  const navigate = useNavigate();

  const columns = [
    { 
      field: 'id', 
      headerName: 'ID', 
      width: 80,
      renderCell: (params) => (
        <Typography variant="body2" fontWeight="bold">
          #{params.value}
        </Typography>
      )
    },
    { 
      field: 'role', 
      headerName: 'Role', 
      width: 100,
      renderCell: (params) => (
        <Chip 
          label={params.value} 
          color={params.value === 'doctor' ? 'primary' : params.value === 'patient' ? 'success' : 'default'}
          size="small"
          variant="filled"
        />
      )
    },
    { 
      field: 'email', 
      headerName: 'Email', 
      width: 250,
      renderCell: (params) => (
        <Typography variant="body2">
          {params.value || 'N/A'}
        </Typography>
      )
    },
    { 
      field: 'mobile_number', 
      headerName: 'Mobile', 
      width: 150,
      renderCell: (params) => (
        <Typography variant="body2">
          {params.value || 'N/A'}
        </Typography>
      )
    },
    { 
      field: 'is_active', 
      headerName: 'Status', 
      width: 120,
      renderCell: (params) => (
        <Chip 
          label={params.value ? 'Active' : 'Inactive'} 
          color={params.value ? 'success' : 'error'}
          size="small"
          variant="outlined"
        />
      )
    },
    { 
      field: 'created_at', 
      headerName: 'Registered', 
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
      field: 'last_login', 
      headerName: 'Last Login', 
      width: 180,
      renderCell: (params) => (
        <Typography variant="body2">
          {params.value ? new Date(params.value).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          }) : 'Never'}
        </Typography>
      )
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 200,
      sortable: false,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            size="small"
            variant="outlined"
            color={params.row.is_active ? 'error' : 'success'}
            startIcon={params.row.is_active ? <BlockIcon /> : <ActivateIcon />}
            onClick={() => handleUserAction(params.row, params.row.is_active ? 'deactivate' : 'activate')}
          >
            {params.row.is_active ? 'Block' : 'Activate'}
          </Button>
        </Box>
      ),
    },
  ];

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('admin_access_token');
      const adminKey = localStorage.getItem('admin_api_key');
      
      if (!token || !adminKey) {
        navigate('/');
        return;
      }

      const response = await axios.get(`${API_BASE_URL}/api/admin/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'X-Admin-Key': adminKey
        },
      });
      
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
      
      if (error.response?.status === 401 || error.response?.status === 403) {
        localStorage.removeItem('admin_access_token');
        navigate('/');
      } else {
        // Mock data for demo
        setUsers([
          {
            id: 1,
            role: 'patient',
            email: null,
            mobile_number: '+218912345678',
            is_active: true,
            created_at: '2024-01-15T10:30:00Z',
            last_login: '2024-08-30T14:20:00Z'
          },
          {
            id: 2,
            role: 'doctor',
            email: 'dr.smith@globalclinic.com',
            mobile_number: '+218987654321',
            is_active: true,
            created_at: '2024-01-10T09:15:00Z',
            last_login: '2024-08-31T08:45:00Z'
          },
          {
            id: 3,
            role: 'patient',
            email: null,
            mobile_number: '+218555123456',
            is_active: false,
            created_at: '2024-02-20T16:45:00Z',
            last_login: null
          }
        ]);
        setError('Using demo data. Live data unavailable.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUserAction = (user, action) => {
    setSelectedUser(user);
    setActionType(action);
    setActionDialog(true);
  };

  const confirmUserAction = async () => {
    try {
      const token = localStorage.getItem('admin_access_token');
      const adminKey = localStorage.getItem('admin_api_key');
      
      await axios.post(`${API_BASE_URL}/admin/users/${selectedUser.id}/${actionType}`, {}, {
        headers: {
          Authorization: `Bearer ${token}`,
          'X-Admin-Key': adminKey
        },
      });
      
      // Update local state
      setUsers(users.map(user => 
        user.id === selectedUser.id 
          ? { ...user, is_active: actionType === 'activate' }
          : user
      ));
      
      setActionDialog(false);
      setSelectedUser(null);
      setActionType('');
      
    } catch (error) {
      console.error('Error performing user action:', error);
      alert('Failed to perform action. Please try again.');
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [navigate]);

  if (loading) {
    return (
      <Container maxWidth="xl">
        <Box sx={{ mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <CircularProgress size={60} />
          <Typography sx={{ mt: 2 }}>Loading users...</Typography>
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
          <PeopleIcon sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            User Management
          </Typography>
          <IconButton color="inherit" onClick={fetchUsers}>
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
              All Platform Users
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Total: {users.length} users
            </Typography>
          </Box>

          <Box sx={{ height: 600, width: '100%' }}>
            <DataGrid
              rows={users}
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

        {/* Action Confirmation Dialog */}
        <Dialog open={actionDialog} onClose={() => setActionDialog(false)}>
          <DialogTitle>
            Confirm User {actionType === 'activate' ? 'Activation' : 'Deactivation'}
          </DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to {actionType} user {selectedUser?.email || selectedUser?.mobile_number}?
              {actionType === 'deactivate' && ' This will prevent them from accessing the platform.'}
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setActionDialog(false)}>Cancel</Button>
            <Button 
              onClick={confirmUserAction} 
              color={actionType === 'activate' ? 'success' : 'error'}
              variant="contained"
            >
              Confirm {actionType === 'activate' ? 'Activation' : 'Deactivation'}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </>
  );
}

export default Users;

