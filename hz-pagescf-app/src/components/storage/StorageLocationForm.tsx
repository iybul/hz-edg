import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Grid,
  FormControlLabel,
  Switch,
  CircularProgress,
  SelectChangeEvent
} from '@mui/material';
import { StorageLocation } from '../../types';

interface StorageLocationFormProps {
  open: boolean;
  onClose: () => void;
  onSave: (location: StorageLocation) => void;
  location: StorageLocation | null;
  orgId: number | null;
}

const StorageLocationForm: React.FC<StorageLocationFormProps> = ({
  open,
  onClose,
  onSave,
  location,
  orgId
}) => {
  const [formState, setFormState] = useState<StorageLocation>({
    id: undefined,
    storageType: '',
    location: '',
    org_id: orgId || 0,
    acceptableRange: '',
    humidity: false
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (location) {
      setFormState(location);
    } else {
      // Reset form for new location
      setFormState({
        id: undefined,
        storageType: '',
        location: '',
        org_id: orgId || 0,
        acceptableRange: '',
        humidity: false
      });
    }
  }, [location, orgId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    console.log(`Field ${name} changed to: ${value}`);
    
    setFormState(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleTypeChange = (e: SelectChangeEvent<string>) => {
    console.log("Storage type changed to:", e.target.value);
    setFormState(prev => ({
      ...prev,
      storageType: e.target.value
    }));
    
    // Clear error for this field
    if (errors.storageType) {
      setErrors(prev => ({ ...prev, storageType: '' }));
    }
  };

  const handleSwitchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormState(prev => ({
      ...prev,
      humidity: e.target.checked
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};
    
    if (!formState.location.trim()) {
      newErrors.location = 'Location name is required';
    }
    
    if (!formState.storageType) {
      newErrors.storageType = 'Storage type is required';
    }
    
    if (!formState.acceptableRange.trim()) {
      newErrors.acceptableRange = 'Temperature range is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;
    
    setLoading(true);
    
    // Prepare the location object
    const locationToSave: StorageLocation = {
      ...formState,
      org_id: orgId || formState.org_id
    };
    
    // Debug the data being sent
    console.log("Submitting storage location with data:", JSON.stringify(locationToSave));
    
    // Call the parent's onSave function
    onSave(locationToSave);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {formState.id ? 'Edit Storage Location' : 'Add New Storage Location'}
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12} md={6}>
            <TextField
              required
              fullWidth
              label="Location Name"
              name="location"
              value={formState.location}
              onChange={handleInputChange}
              error={!!errors.location}
              helperText={errors.location}
              placeholder="e.g. Main Freezer, Dry Storage Room 1"
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <FormControl fullWidth required error={!!errors.storageType}>
              <InputLabel>Storage Type</InputLabel>
              <Select
                value={formState.storageType}
                label="Storage Type"
                onChange={handleTypeChange}
              >
                <MenuItem value="">
                  <em>Select Type</em>
                </MenuItem>
                <MenuItem value="Freezer">Freezer</MenuItem>
                <MenuItem value="Refrigerator">Refrigerator</MenuItem>
                <MenuItem value="Cold Room">Cold Room</MenuItem>
                <MenuItem value="Dry Storage">Dry Storage</MenuItem>
                <MenuItem value="Ambient">Ambient</MenuItem>
                <MenuItem value="Other">Other</MenuItem>
              </Select>
              {errors.storageType && (
                <FormHelperText>{errors.storageType}</FormHelperText>
              )}
            </FormControl>
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              required
              fullWidth
              label="Acceptable Temperature Range"
              name="acceptableRange"
              value={formState.acceptableRange}
              onChange={handleInputChange}
              error={!!errors.acceptableRange}
              helperText={errors.acceptableRange || "e.g. -18°C to -22°C, 2°C to 8°C"}
              placeholder="e.g. -18°C to -22°C, 2°C to 8°C"
            />
          </Grid>
          
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={formState.humidity}
                  onChange={handleSwitchChange}
                  name="humidity"
                  color="primary"
                />
              }
              label="Humidity Monitoring Required"
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

export default StorageLocationForm;