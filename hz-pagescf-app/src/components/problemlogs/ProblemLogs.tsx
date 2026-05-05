import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Button, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, MenuItem, Select, FormControl, InputLabel, Checkbox, FormControlLabel,
  CircularProgress, Chip, Alert, FormHelperText, Grid, IconButton
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, Check as CheckIcon, Close as CloseIcon } from '@mui/icons-material';
import { problemLogApi, employeeApi } from '../../services';
import { ProblemLog, Employee } from '../../types';
import { format } from 'date-fns';
import { useAuth } from '../../context/AuthContext';

// Helper function to format date
const formatDate = (dateString: string) => {
  try {
    return format(new Date(dateString), 'yyyy-MM-dd');
  } catch (error) {
    return dateString;
  }
};

// Problem types
const PROBLEM_TYPES = [
  'Product Quality',
  'Packaging Issue',
  'Delivery Delay',
  'Customer Service',
  'Technical Malfunction',
  'Billing Error',
  'Other'
];

const initialProblemLog: ProblemLog = {
  isOpen: true,
  dateOpened: format(new Date(), 'yyyy-MM-dd'),
  customerName: '',
  problemType: '',
  assignedTo: [],
  problemDescription: '',
  recall: false,
  dateResolved: undefined,
  // Set org_id to placeholder, will be replaced before submission
  org_id: 0
};

const ProblemLogs: React.FC = () => {
  const { orgId } = useAuth();
  const [problemLogs, setProblemLogs] = useState<ProblemLog[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedProblemLog, setSelectedProblemLog] = useState<ProblemLog>({ ...initialProblemLog });
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isEditing, setIsEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);

  // Fetch problem logs and employees on component mount
  useEffect(() => {
    fetchProblemLogs();
    fetchEmployees();
  }, []);

  // Fetch problem logs from API
  const fetchProblemLogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const logs = await problemLogApi.getAll();
      console.log("Received problem logs from API:", logs);
      setProblemLogs(logs);
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Failed to fetch problem logs. Please try again.');
      }
      console.error('Error fetching problem logs:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch employees from API
  const fetchEmployees = async () => {
    try {
      const employees = await employeeApi.getAll();
      setEmployees(employees);
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  // Handle opening the add dialog
  const handleAddOpen = () => {
    setSelectedProblemLog({ ...initialProblemLog });
    setFormErrors({});
    setIsEditing(false);
    setOpen(true);
  };

  // Handle opening the edit dialog
  const handleEditOpen = (problemLog: ProblemLog) => {
    // Ensure assignedTo is an array
    const assignedTo = Array.isArray(problemLog.assignedTo) 
      ? problemLog.assignedTo 
      : (problemLog.assignedTo ? [problemLog.assignedTo] : []);
      
    setSelectedProblemLog({
      ...problemLog,
      // Convert date strings to required format if needed
      dateOpened: formatDate(problemLog.dateOpened),
      dateResolved: problemLog.dateResolved ? formatDate(problemLog.dateResolved) : undefined,
      assignedTo: assignedTo
    });
    
    console.log("Editing problem log:", {
      ...problemLog,
      assignedTo: assignedTo
    });
    
    setFormErrors({});
    setIsEditing(true);
    setOpen(true);
  };

  // Handle dialog close
  const handleClose = () => {
    setOpen(false);
  };

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSelectedProblemLog(prev => ({ ...prev, [name]: value }));
    
    // Clear error for this field if it exists
    if (formErrors[name]) {
      setFormErrors(prev => {
        const updated = { ...prev };
        delete updated[name];
        return updated;
      });
    }
  };

  // Handle checkbox changes
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setSelectedProblemLog(prev => ({ ...prev, [name]: checked }));
  };

  // Handle select changes
  const handleSelectChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.name as keyof ProblemLog;
    const value = e.target.value;
    setSelectedProblemLog(prev => ({ ...prev, [name]: value }));
    
    // Clear error for this field if it exists
    if (formErrors[name]) {
      setFormErrors(prev => {
        const updated = { ...prev };
        delete updated[name];
        return updated;
      });
    }
  };

  // Handle assigned employees change
  const handleAssignedEmployeesChange = (e: any) => {
    setSelectedProblemLog(prev => ({
      ...prev,
      assignedTo: e.target.value as number[]
    }));
  };

  // Validate the form
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (!selectedProblemLog.customerName.trim()) {
      errors.customerName = 'Customer name is required';
    }
    
    if (!selectedProblemLog.problemType) {
      errors.problemType = 'Problem type is required';
    }
    
    if (!selectedProblemLog.problemDescription.trim()) {
      errors.problemDescription = 'Problem description is required';
    }
    
    if (!selectedProblemLog.dateOpened) {
      errors.dateOpened = 'Date opened is required';
    }
    
    if (!selectedProblemLog.isOpen && !selectedProblemLog.dateResolved) {
      errors.dateResolved = 'Date resolved is required when problem is closed';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Make sure org_id is included
      const problemLogWithOrgId = {
        ...selectedProblemLog,
        org_id: orgId || 0
      };
      
      console.log('Submitting problem log with org_id:', problemLogWithOrgId);
      
      if (isEditing && selectedProblemLog.id) {
        await problemLogApi.update(problemLogWithOrgId);
      } else {
        await problemLogApi.create(problemLogWithOrgId);
      }
      
      await fetchProblemLogs();
      handleClose();
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Failed to save problem log. Please try again.');
      }
      console.error('Error saving problem log:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle delete problem log
  const handleDeleteConfirm = (id: number) => {
    setConfirmDelete(id);
  };

  const handleDeleteCancel = () => {
    setConfirmDelete(null);
  };

  const handleDeleteConfirmed = async (id: number) => {
    setLoading(true);
    setError(null);
    
    try {
      await problemLogApi.delete(id);
      await fetchProblemLogs();
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Failed to delete problem log. Please try again.');
      }
      console.error('Error deleting problem log:', error);
    } finally {
      setLoading(false);
      setConfirmDelete(null);
    }
  };

  // Get employee names from IDs
  const getEmployeeNames = (employeeIds: number[]): string => {
    if (!employeeIds || !Array.isArray(employeeIds) || employeeIds.length === 0) {
      return 'None';
    }
    
    return employeeIds
      .map(id => employees.find(emp => emp.id === id)?.name || 'Unknown')
      .join(', ');
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Problem Logs
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleAddOpen}
        >
          Add Problem Log
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {loading && !open ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Status</TableCell>
                <TableCell>Date Opened</TableCell>
                <TableCell>Customer</TableCell>
                <TableCell>Problem Type</TableCell>
                <TableCell>Assigned To</TableCell>
                <TableCell>Recall</TableCell>
                <TableCell>Date Resolved</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {problemLogs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    No problem logs found
                  </TableCell>
                </TableRow>
              ) : (
                problemLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>
                      <Chip 
                        label={log.isOpen ? "Open" : "Closed"} 
                        color={log.isOpen ? "error" : "success"} 
                        size="small" 
                      />
                    </TableCell>
                    <TableCell>{formatDate(log.dateOpened)}</TableCell>
                    <TableCell>{log.customerName}</TableCell>
                    <TableCell>{log.problemType}</TableCell>
                    <TableCell>{getEmployeeNames(log.assignedTo)}</TableCell>
                    <TableCell>
                      {log.recall ? <CheckIcon color="error" /> : <CloseIcon />}
                    </TableCell>
                    <TableCell>
                      {log.dateResolved ? formatDate(log.dateResolved) : '-'}
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex' }}>
                        <IconButton
                          color="primary"
                          onClick={() => handleEditOpen(log)}
                        >
                          <EditIcon />
                        </IconButton>
                        {confirmDelete === log.id ? (
                          <>
                            <IconButton
                              color="success"
                              onClick={() => handleDeleteConfirmed(log.id!)}
                            >
                              <CheckIcon />
                            </IconButton>
                            <IconButton
                              color="error"
                              onClick={handleDeleteCancel}
                            >
                              <CloseIcon />
                            </IconButton>
                          </>
                        ) : (
                          <IconButton
                            color="error"
                            onClick={() => handleDeleteConfirm(log.id!)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Add/Edit Problem Log Dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>
          {isEditing ? 'Edit Problem Log' : 'Add Problem Log'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                name="customerName"
                label="Customer Name"
                fullWidth
                value={selectedProblemLog.customerName}
                onChange={handleInputChange}
                error={!!formErrors.customerName}
                helperText={formErrors.customerName}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth error={!!formErrors.problemType}>
                <InputLabel>Problem Type</InputLabel>
                <Select
                  name="problemType"
                  value={selectedProblemLog.problemType}
                  onChange={handleSelectChange as any}
                  label="Problem Type"
                >
                  {PROBLEM_TYPES.map((type) => (
                    <MenuItem key={type} value={type}>
                      {type}
                    </MenuItem>
                  ))}
                </Select>
                {formErrors.problemType && (
                  <FormHelperText>{formErrors.problemType}</FormHelperText>
                )}
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="problemDescription"
                label="Problem Description"
                fullWidth
                multiline
                rows={4}
                value={selectedProblemLog.problemDescription}
                onChange={handleInputChange}
                error={!!formErrors.problemDescription}
                helperText={formErrors.problemDescription}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Assigned To</InputLabel>
                <Select
                  multiple
                  value={selectedProblemLog.assignedTo}
                  onChange={handleAssignedEmployeesChange as any}
                  label="Assigned To"
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {(selected as number[]).map((value) => (
                        <Chip 
                          key={value} 
                          label={employees.find(emp => emp.id === value)?.name || value} 
                          size="small" 
                        />
                      ))}
                    </Box>
                  )}
                >
                  {employees.map((employee) => (
                    <MenuItem key={employee.id} value={employee.id}>
                      {employee.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="dateOpened"
                label="Date Opened"
                type="date"
                fullWidth
                value={selectedProblemLog.dateOpened}
                onChange={handleInputChange}
                InputLabelProps={{ shrink: true }}
                error={!!formErrors.dateOpened}
                helperText={formErrors.dateOpened}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={selectedProblemLog.recall}
                    onChange={handleCheckboxChange}
                    name="recall"
                  />
                }
                label="Recall Required"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={!selectedProblemLog.isOpen}
                    onChange={(e) => 
                      setSelectedProblemLog(prev => ({ 
                        ...prev, 
                        isOpen: !e.target.checked,
                        // If we're closing the issue and there's no date resolved, set it to today
                        dateResolved: e.target.checked && !prev.dateResolved
                          ? format(new Date(), 'yyyy-MM-dd')
                          : prev.dateResolved
                      }))
                    }
                    name="isClosed"
                  />
                }
                label="Issue Resolved"
              />
            </Grid>
            {!selectedProblemLog.isOpen && (
              <Grid item xs={12} sm={6}>
                <TextField
                  name="dateResolved"
                  label="Date Resolved"
                  type="date"
                  fullWidth
                  value={selectedProblemLog.dateResolved || ''}
                  onChange={handleInputChange}
                  InputLabelProps={{ shrink: true }}
                  error={!!formErrors.dateResolved}
                  helperText={formErrors.dateResolved}
                />
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            color="primary"
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

export default ProblemLogs;