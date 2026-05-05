import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Button, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Select, MenuItem, FormControl, InputLabel, CircularProgress,
  Alert, Grid, IconButton, FormHelperText, Switch, FormControlLabel
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, Check as CheckIcon, Close as CloseIcon } from '@mui/icons-material';
import { receivingLogApi, generalIngredientApi } from '../../services';
import { ReceivingLog, GeneralIngredient } from '../../types';
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

// Temperature options
const TEMPERATURE_OPTIONS = [
  'Refrigerated (33-41°F)',
  'Frozen (0°F or below)',
  'Room Temperature (65-75°F)',
  'Ambient (varies)',
  'Hot (above 135°F)'
];

const initialReceivingLog: ReceivingLog = {
  lotcode: '',
  company_name: '',
  item_name: '',
  temperature: '',
  date: format(new Date(), 'yyyy-MM-dd'),
  general_ingredient_id: 0, // Default to miscellaneous (ID 0)
  org_id: 0
};

const ReceivingLogs: React.FC = () => {
  const { orgId } = useAuth();
  const [receivingLogs, setReceivingLogs] = useState<ReceivingLog[]>([]);
  const [selectedLog, setSelectedLog] = useState<ReceivingLog>({ 
    ...initialReceivingLog, 
    org_id: orgId || 0 
  });
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isEditing, setIsEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
  const [generalIngredients, setGeneralIngredients] = useState<GeneralIngredient[]>([]);
  const [createWithIngredient, setCreateWithIngredient] = useState(false);

  // Fetch receiving logs on component mount
  useEffect(() => {
    fetchReceivingLogs();
    fetchGeneralIngredients();
  }, []);

  // Update org_id when organization changes
  useEffect(() => {
    if (orgId) {
      setSelectedLog(prev => ({ ...prev, org_id: orgId }));
    }
  }, [orgId]);

  // Fetch receiving logs from API
  const fetchReceivingLogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const logs = await receivingLogApi.getAll();
      setReceivingLogs(logs);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch receiving logs. Please try again.');
      console.error('Error fetching receiving logs:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch general ingredients from API
  const fetchGeneralIngredients = async () => {
    setLoading(true);
    setError(null);
    try {
      const ingredients = await generalIngredientApi.getAll();
      setGeneralIngredients(ingredients);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch general ingredients. Please try again.');
      console.error('Error fetching general ingredients:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle opening the add dialog
  const handleAddOpen = () => {
    setSelectedLog({ 
      ...initialReceivingLog, 
      org_id: orgId || 0,
      date: format(new Date(), 'yyyy-MM-dd'),
      general_ingredient_id: 0 // Default to miscellaneous (ID 0)
    });
    setFormErrors({});
    setIsEditing(false);
    setCreateWithIngredient(false);
    setOpen(true);
  };

  // Handle opening the edit dialog
  const handleEditOpen = (log: ReceivingLog) => {
    setSelectedLog({
      ...log,
      date: formatDate(log.date)
    });
    setFormErrors({});
    setIsEditing(true);
    setCreateWithIngredient(false);
    setOpen(true);
  };

  // Handle dialog close
  const handleClose = () => {
    setOpen(false);
  };

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSelectedLog(prev => ({ ...prev, [name]: value }));
    
    // Clear error for this field if it exists
    if (formErrors[name]) {
      setFormErrors(prev => {
        const updated = { ...prev };
        delete updated[name];
        return updated;
      });
    }
  };

  // Handle select changes
  const handleSelectChange = (e: any) => {
    const { name, value } = e.target;
    setSelectedLog(prev => ({ ...prev, [name]: value }));
    
    // Clear error for this field if it exists
    if (formErrors[name]) {
      setFormErrors(prev => {
        const updated = { ...prev };
        delete updated[name];
        return updated;
      });
    }
  };

  // Handle switch changes for create with ingredient
  const handleSwitchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCreateWithIngredient(e.target.checked);
    
    if (e.target.checked) {
      // If toggling on, select the first available general ingredient
      setSelectedLog(prev => ({ 
        ...prev, 
        general_ingredient_id: generalIngredients.length > 0 ? generalIngredients[0].id : undefined 
      }));
    } else {
      // If toggling off, set to miscellaneous (ID 0)
      setSelectedLog(prev => ({ 
        ...prev, 
        general_ingredient_id: 0 
      }));
    }
  };

  // Validate the form
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (!selectedLog.lotcode.trim()) {
      errors.lotcode = 'Lot code is required';
    }
    
    if (!selectedLog.company_name.trim()) {
      errors.company_name = 'Company name is required';
    }
    
    if (!selectedLog.item_name.trim()) {
      errors.item_name = 'Item name is required';
    }
    
    if (!selectedLog.temperature) {
      errors.temperature = 'Temperature is required';
    }
    
    if (!selectedLog.date) {
      errors.date = 'Date is required';
    }
    
    if (createWithIngredient && (selectedLog.general_ingredient_id === undefined || selectedLog.general_ingredient_id === 0)) {
      errors.general_ingredient_id = 'Please select a specific general ingredient';
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
      if (isEditing && selectedLog.id) {
        await receivingLogApi.update(selectedLog);
      } else {
        // Create receiving log (with or without general ingredient)
        // When no general ingredient is selected, use ID 0 for miscellaneous
        const logToCreate = {
          ...selectedLog,
          general_ingredient_id: createWithIngredient ? selectedLog.general_ingredient_id : 0
        };
        await receivingLogApi.create(logToCreate);
      }
      
      await fetchReceivingLogs();
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save receiving log. Please try again.');
      console.error('Error saving receiving log:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle delete receiving log
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
      await receivingLogApi.delete(id);
      await fetchReceivingLogs();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete receiving log. Please try again.');
      console.error('Error deleting receiving log:', err);
    } finally {
      setLoading(false);
      setConfirmDelete(null);
    }
  };

  // Helper function to find general ingredient name by ID
  const getGeneralIngredientName = (id?: number | null): string => {
    if (id === undefined || id === null) return 'None';
    if (id === 0) return 'Miscellaneous';
    const generalIngredient = generalIngredients.find(gi => gi.id === id);
    return generalIngredient ? generalIngredient.name : 'Unknown';
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Receiving Logs
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleAddOpen}
        >
          Add Receiving Log
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
                <TableCell>Lot Code</TableCell>
                <TableCell>Company</TableCell>
                <TableCell>Item</TableCell>
                <TableCell>Temperature</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>General Ingredient</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {receivingLogs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    No receiving logs found
                  </TableCell>
                </TableRow>
              ) : (
                receivingLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>{log.lotcode}</TableCell>
                    <TableCell>{log.company_name}</TableCell>
                    <TableCell>{log.item_name}</TableCell>
                    <TableCell>{log.temperature}</TableCell>
                    <TableCell>{formatDate(log.date)}</TableCell>
                    <TableCell>{getGeneralIngredientName(log.general_ingredient_id)}</TableCell>
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

      {/* Add/Edit Receiving Log Dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>
          {isEditing ? 'Edit Receiving Log' : 'Add Receiving Log'}
        </DialogTitle>
        <DialogContent>
          {!isEditing && (
            <FormControlLabel
              control={
                <Switch
                  checked={createWithIngredient}
                  onChange={handleSwitchChange}
                  name="createWithIngredient"
                  color="primary"
                  disabled={generalIngredients.length === 0}
                />
              }
              label="Create receiving log with general ingredient"
              sx={{ mt: 1, mb: 2 }}
            />
          )}
          
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                name="lotcode"
                label="Lot Code"
                fullWidth
                value={selectedLog.lotcode}
                onChange={handleInputChange}
                error={!!formErrors.lotcode}
                helperText={formErrors.lotcode}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="company_name"
                label="Company Name"
                fullWidth
                value={selectedLog.company_name}
                onChange={handleInputChange}
                error={!!formErrors.company_name}
                helperText={formErrors.company_name}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="item_name"
                label="Item Name"
                fullWidth
                value={selectedLog.item_name}
                onChange={handleInputChange}
                error={!!formErrors.item_name}
                helperText={formErrors.item_name}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth error={!!formErrors.temperature}>
                <InputLabel>Temperature</InputLabel>
                <Select
                  name="temperature"
                  value={selectedLog.temperature}
                  onChange={handleSelectChange}
                  label="Temperature"
                >
                  {TEMPERATURE_OPTIONS.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </Select>
                {formErrors.temperature && (
                  <FormHelperText>{formErrors.temperature}</FormHelperText>
                )}
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="date"
                label="Date"
                type="date"
                fullWidth
                value={selectedLog.date}
                onChange={handleInputChange}
                InputLabelProps={{ shrink: true }}
                error={!!formErrors.date}
                helperText={formErrors.date}
              />
            </Grid>
            {(createWithIngredient || selectedLog.general_ingredient_id) && (
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth error={!!formErrors.general_ingredient_id}>
                  <InputLabel>General Ingredient</InputLabel>
                  <Select
                    name="general_ingredient_id"
                    value={selectedLog.general_ingredient_id || ''}
                    onChange={handleSelectChange}
                    label="General Ingredient"
                    disabled={isEditing} // Can't change in edit mode
                  >
                    <MenuItem key={0} value={0}>
                      Miscellaneous
                    </MenuItem>
                    {generalIngredients.map((gi) => (
                      <MenuItem key={gi.id} value={gi.id}>
                        {gi.name}
                      </MenuItem>
                    ))}
                  </Select>
                  {formErrors.general_ingredient_id && (
                    <FormHelperText>{formErrors.general_ingredient_id}</FormHelperText>
                  )}
                </FormControl>
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

export default ReceivingLogs;