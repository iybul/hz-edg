import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Chip
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, Visibility as VisibilityIcon } from '@mui/icons-material';
import { storageLocationApi } from '../../services';
import { StorageLocation } from '../../types';
import { useAuth } from '../../context/AuthContext';
import StorageLocationForm from './StorageLocationForm';

const StorageLocations: React.FC = () => {
  const navigate = useNavigate();
  const { orgId, loading: authLoading } = useAuth();
  const [locations, setLocations] = useState<StorageLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<StorageLocation | null>(null);

  useEffect(() => {
    fetchStorageLocations();
  }, []);

  const fetchStorageLocations = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const locations = await storageLocationApi.getAll();
      setLocations(locations);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch storage locations');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (location?: StorageLocation) => {
    if (location) {
      setCurrentLocation(location);
    } else {
      // Create a new empty location
      setCurrentLocation(null);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleSaveLocation = async (location: StorageLocation) => {
    setLoading(true);
    
    try {
      console.log("Storage Locations - Saving location:", JSON.stringify(location));
      
      if (location.id) {
        // Update existing location
        const updatedLocation = await storageLocationApi.update(location);
        setLocations(prev => 
          prev.map(loc => loc.id === location.id ? updatedLocation : loc)
        );
      } else {
        // Create new location
        const newLocation = await storageLocationApi.create(location);
        setLocations(prev => [...prev, newLocation]);
      }
      
      setOpenDialog(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save storage location');
      console.error("Unexpected error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this storage location? All related logs will also be deleted.')) return;
    
    setLoading(true);
    
    try {
      await storageLocationApi.delete(id);
      setLocations(prev => prev.filter(location => location.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete storage location');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewLogs = (locationId: number) => {
    navigate(`/storage-logs/${locationId}`);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Storage Locations</Typography>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add Storage Location
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
                <TableCell>Location</TableCell>
                <TableCell>Storage Type</TableCell>
                <TableCell>Temperature Range</TableCell>
                <TableCell>Humidity Monitored</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {locations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    No storage locations found
                  </TableCell>
                </TableRow>
              ) : (
                locations.map((location) => (
                  <TableRow key={location.id}>
                    <TableCell>{location.location}</TableCell>
                    <TableCell>{location.storageType}</TableCell>
                    <TableCell>{location.acceptableRange}</TableCell>
                    <TableCell>
                      <Chip 
                        label={location.humidity ? 'Yes' : 'No'} 
                        color={location.humidity ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Button
                        size="small"
                        color="info"
                        startIcon={<VisibilityIcon />}
                        sx={{ mr: 1 }}
                        onClick={() => location.id && handleViewLogs(location.id)}
                      >
                        Logs
                      </Button>
                      <Button
                        size="small"
                        startIcon={<EditIcon />}
                        sx={{ mr: 1 }}
                        onClick={() => handleOpenDialog(location)}
                      >
                        Edit
                      </Button>
                      <Button
                        size="small"
                        color="error"
                        startIcon={<DeleteIcon />}
                        onClick={() => location.id && handleDelete(location.id)}
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

      {/* Form Dialog */}
      {openDialog && (
        <StorageLocationForm
          open={openDialog}
          onClose={handleCloseDialog}
          onSave={handleSaveLocation}
          location={currentLocation}
          orgId={orgId}
        />
      )}
    </Box>
  );
};

export default StorageLocations;