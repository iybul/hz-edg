import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
  CircularProgress,
  Typography,
  InputAdornment,
  Alert,
  AlertTitle
} from '@mui/material';
import { StorageLog, StorageLocation } from '../../types';

interface StorageLogFormProps {
  open: boolean;
  onClose: () => void;
  onSave: (log: StorageLog) => void;
  log: StorageLog | null;
  location: StorageLocation;
  orgId: number | null;
}

const StorageLogForm: React.FC<StorageLogFormProps> = ({
  open,
  onClose,
  onSave,
  log,
  location,
  orgId
}) => {
  const [formState, setFormState] = useState<Omit<StorageLog, 'id' | 'org_id'>>({
    storageLocationId: location.id || 0,
    employeeName: '',
    temperature: 0,
    humidity: location.humidity ? 0 : undefined,
    recordedAt: new Date().toISOString().slice(0, 19), // Format: YYYY-MM-DDThh:mm:ss
    notes: ''
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);
  const [showTempWarning, setShowTempWarning] = useState<{min: number; max: number} | null>(null);

  useEffect(() => {
    if (log) {
      // Format datetime for the input field
      const recordedAt = new Date(log.recordedAt).toISOString().slice(0, 19);
      
      setFormState({
        storageLocationId: log.storageLocationId,
        employeeName: log.employeeName,
        temperature: log.temperature,
        humidity: log.humidity,
        recordedAt,
        notes: log.notes || ''
      });
    } else {
      // Reset form for new log
      setFormState({
        storageLocationId: location.id || 0,
        employeeName: '',
        temperature: 0,
        humidity: location.humidity ? 0 : undefined,
        recordedAt: new Date().toISOString().slice(0, 19),
        notes: ''
      });
    }
  }, [log, location]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name === 'temperature' || name === 'humidity') {
      setFormState(prev => ({
        ...prev,
        [name]: parseFloat(value)
      }));
    } else if (name === 'recordedAt') {
      // The datetime-local input field gives us YYYY-MM-DDThh:mm format
      // We need YYYY-MM-DDThh:mm:ss for the backend
      setFormState(prev => ({
        ...prev,
        [name]: value
      }));
    } else {
      setFormState(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};
    
    if (!formState.employeeName.trim()) {
      newErrors.employeeName = 'Employee name is required';
    }
    
    if (formState.temperature === undefined) {
      newErrors.temperature = 'Temperature is required';
    }
    
    if (location.humidity && formState.humidity === undefined) {
      newErrors.humidity = 'Humidity is required for this location';
    }
    
    if (!formState.recordedAt) {
      newErrors.recordedAt = 'Date and time are required';
    }
    
    // Parse the acceptable range to validate the temperature
    if (location.acceptableRange) {
      const rangeMatch = location.acceptableRange.match(/([-+]?\d+(\.\d+)?)\s*(?:[°℃]?C)?\s*(?:to|-)\s*([-+]?\d+(\.\d+)?)\s*(?:[°℃]?C)?/);
      
      if (rangeMatch) {
        const minTemp = parseFloat(rangeMatch[1]);
        const maxTemp = parseFloat(rangeMatch[3]);
        
        if (formState.temperature < minTemp || formState.temperature > maxTemp) {
          // Set a flag to show a warning dialog, but don't prevent submission
          setShowTempWarning({ min: minTemp, max: maxTemp });
          
          // Add a warning message
          newErrors.temperature = `WARNING: Temperature ${formState.temperature}°C is outside acceptable range (${minTemp}°C to ${maxTemp}°C)`;
          
          // Since this is just a warning, not an error, we'll keep it visible but allow submission
          delete newErrors.temperature;
        } else {
          setShowTempWarning(null);
        }
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;
    
    setLoading(true);
    
    // Prepare the log object and ensure recordedAt has seconds
    let recordedAt = formState.recordedAt;
    if (recordedAt && !recordedAt.match(/T\d{2}:\d{2}:\d{2}$/)) {
      recordedAt = recordedAt + ':00';
    }
    
    const logToSave: StorageLog = {
      ...formState,
      recordedAt,
      org_id: orgId || 0
    };
    
    console.log('Saving log with recordedAt:', recordedAt);
    
    // Call the parent's onSave function
    onSave(logToSave);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {log?.id ? 'Edit Storage Log' : 'Record New Measurement'}
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12}>
            <Typography variant="subtitle1">
              Location: {location.location} ({location.storageType})
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Acceptable Range: {location.acceptableRange}
            </Typography>
            
            {showTempWarning && (
              <Alert 
                severity="warning" 
                sx={{ mt: 1, mb: 2 }}
              >
                <AlertTitle>Temperature Out of Range</AlertTitle>
                The temperature {formState.temperature}°C is outside the acceptable range 
                ({showTempWarning.min}°C to {showTempWarning.max}°C). You can still save this 
                record, but it will be highlighted in red in the logs to indicate a problem.
              </Alert>
            )}
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              required
              fullWidth
              label="Employee Name"
              name="employeeName"
              value={formState.employeeName}
              onChange={handleInputChange}
              error={!!errors.employeeName}
              helperText={errors.employeeName}
              placeholder="e.g. John Smith"
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              required
              fullWidth
              type="datetime-local"
              label="Date & Time"
              name="recordedAt"
              value={formState.recordedAt}
              onChange={handleInputChange}
              InputLabelProps={{
                shrink: true,
              }}
              error={!!errors.recordedAt}
              helperText={errors.recordedAt}
            />
          </Grid>
          
          <Grid item xs={12} md={location.humidity ? 6 : 12}>
            <TextField
              required
              fullWidth
              type="number"
              label="Temperature"
              name="temperature"
              value={formState.temperature}
              onChange={handleInputChange}
              error={!!errors.temperature}
              helperText={errors.temperature}
              color={showTempWarning ? "warning" : "primary"}
              InputProps={{
                endAdornment: <InputAdornment position="end">°C</InputAdornment>,
                inputProps: { step: 0.1 },
                sx: showTempWarning ? { color: 'warning.main' } : {}
              }}
            />
          </Grid>
          
          {location.humidity && (
            <Grid item xs={12} md={6}>
              <TextField
                required
                fullWidth
                type="number"
                label="Humidity"
                name="humidity"
                value={formState.humidity}
                onChange={handleInputChange}
                error={!!errors.humidity}
                helperText={errors.humidity}
                InputProps={{
                  endAdornment: <InputAdornment position="end">%</InputAdornment>,
                  inputProps: { step: 0.1 }
                }}
              />
            </Grid>
          )}
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Notes"
              name="notes"
              value={formState.notes}
              onChange={handleInputChange}
              placeholder="Any additional comments or observations"
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button 
          variant="contained" 
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default StorageLogForm;