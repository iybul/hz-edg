import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  SelectChangeEvent
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { employeeApi } from '../../services';
import { Employee } from '../../types';
import { useAuth } from '../../context/AuthContext';

const ROLES = [
  'Manager',
  'Supervisor',
  'Employee',
  'Admin',
  'Other'
];

const initialEmployeeState: Employee = {
  id: undefined,
  name: '',
  role: '',
  org_id: 0
};

const Employees: React.FC = () => {
  const { orgId, loading: authLoading } = useAuth();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentEmployee, setCurrentEmployee] = useState<Employee>(initialEmployeeState);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    fetchEmployees();
  }, []);

  // Set org_id when organization is available
  useEffect(() => {
    if (orgId) {
      setCurrentEmployee(prev => ({
        ...prev,
        org_id: orgId
      }));
    }
  }, [orgId]);

  const fetchEmployees = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const employees = await employeeApi.getAll();
      setEmployees(employees);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch employees');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (employee?: Employee) => {
    if (employee) {
      // Edit mode
      setCurrentEmployee({
        id: employee.id,
        name: employee.name,
        role: employee.role,
        org_id: employee.org_id
      });
    } else {
      // Create mode
      setCurrentEmployee({
        id: undefined,
        name: '',
        role: '',
        org_id: orgId || 0
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setFormError(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCurrentEmployee(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRoleChange = (e: SelectChangeEvent) => {
    setCurrentEmployee(prev => ({
      ...prev,
      role: e.target.value
    }));
  };

  const validateForm = (): boolean => {
    if (!currentEmployee.name.trim()) {
      setFormError('Name is required');
      return false;
    }
    if (!currentEmployee.role) {
      setFormError('Role is required');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    try {
      setLoading(true);
      
      if (currentEmployee.id) {
        // Update existing employee
        const updatedEmployee = await employeeApi.update(currentEmployee);
        setEmployees(prev => 
          prev.map(emp => emp.id === updatedEmployee.id ? updatedEmployee : emp)
        );
        handleCloseDialog();
      } else {
        // Create new employee
        const newEmployee = await employeeApi.create(currentEmployee);
        setEmployees(prev => [...prev, newEmployee]);
        handleCloseDialog();
      }
    } catch (err) {
      setFormError(
        err instanceof Error 
          ? err.message 
          : (currentEmployee.id ? 'Error updating employee' : 'Error creating employee')
      );
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this employee?')) return;
    
    try {
      setLoading(true);
      await employeeApi.delete(id);
      setEmployees(prev => prev.filter(emp => emp.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete employee');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Employees</Typography>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add Employee
        </Button>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {loading || authLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Role</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {employees.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    No employees found
                  </TableCell>
                </TableRow>
              ) : (
                employees.map((employee) => (
                  <TableRow key={employee.id}>
                    <TableCell>{employee.id}</TableCell>
                    <TableCell>{employee.name}</TableCell>
                    <TableCell>{employee.role}</TableCell>
                    <TableCell align="right">
                      <Button
                        size="small"
                        startIcon={<EditIcon />}
                        sx={{ mr: 1 }}
                        onClick={() => handleOpenDialog(employee)}
                      >
                        Edit
                      </Button>
                      <Button
                        size="small"
                        color="error"
                        startIcon={<DeleteIcon />}
                        onClick={() => employee.id && handleDelete(employee.id)}
                      >
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Add/Edit Employee Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {currentEmployee.id !== undefined ? 'Edit Employee' : 'Add New Employee'}
        </DialogTitle>
        <DialogContent>
          {formError && (
            <Alert severity="error" sx={{ mb: 2, mt: 1 }}>
              {formError}
            </Alert>
          )}
          <Box component="form" sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="name"
              label="Employee Name"
              name="name"
              value={currentEmployee.name}
              onChange={handleInputChange}
              autoFocus
            />
            <FormControl fullWidth margin="normal" required>
              <InputLabel id="role-label">Role</InputLabel>
              <Select
                labelId="role-label"
                id="role"
                value={currentEmployee.role}
                label="Role"
                onChange={handleRoleChange}
              >
                {ROLES.map(role => (
                  <MenuItem key={role} value={role}>{role}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained" 
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Employees;