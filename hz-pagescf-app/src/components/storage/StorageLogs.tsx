import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
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
  Breadcrumbs,
  Link
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { storageLocationApi, storageLogApi } from '../../services';
import { StorageLog, StorageLocation } from '../../types';
import { useAuth } from '../../context/AuthContext';
import StorageLogForm from './StorageLogForm';

// Helper function to format datetime
const formatDateTime = (dateTimeString: string) => {
  try {
    const date = new Date(dateTimeString);
    return date.toLocaleString();
  } catch (error) {
    console.error('Invalid date format:', dateTimeString);
    return dateTimeString;
  }
};

// Helper function to check if temperature is outside the acceptable range
const isTemperatureOutOfRange = (temperature: number, acceptableRange?: string): boolean => {
  if (!acceptableRange) return false;
  
  const rangeMatch = acceptableRange.match(/([-+]?\d+(\.\d+)?)\s*(?:[°℃]?C)?\s*(?:to|-)\s*([-+]?\d+(\.\d+)?)\s*(?:[°℃]?C)?/);
  
  if (rangeMatch) {
    const minTemp = parseFloat(rangeMatch[1]);
    const maxTemp = parseFloat(rangeMatch[3]);
    
    return temperature < minTemp || temperature > maxTemp;
  }
  
  return false;
};

const StorageLogs: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const locationId = parseInt(id || '0');
  const { orgId, loading: authLoading } = useAuth();
  
  const [logs, setLogs] = useState<StorageLog[]>([]);
  const [location, setLocation] = useState<StorageLocation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentLog, setCurrentLog] = useState<StorageLog | null>(null);

  useEffect(() => {
    if (locationId) {
      fetchLocation();
      fetchLogs();
      
      // Debug statement to verify logs are loading
      console.log('StorageLogs component mounted for locationId:', locationId);
    }
  }, [locationId]);

  const fetchLocation = async () => {
    try {
      const location = await storageLocationApi.getById(locationId);
      setLocation(location);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch storage location details');
      console.error(err);
    }
  };

  const fetchLogs = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log(`StorageLogs component: Fetching logs for location ID ${locationId}`);
      
      // Ensure locationId is valid
      if (!locationId || isNaN(locationId)) {
        setError(`Invalid location ID: ${locationId}`);
        setLoading(false);
        return;
      }
      
      const logs = await storageLogApi.getByLocationId(locationId);
      setLogs(logs);
      console.log('Logs loaded successfully, count:', logs.length);
      console.log('Log data:', logs);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch storage logs. Please check console for details.');
      console.error('Unexpected error in fetchLogs:', err);
      // Set logs to empty array to avoid undefined errors
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (log?: StorageLog) => {
    if (log) {
      setCurrentLog(log);
    } else {
      // Create a new empty log
      setCurrentLog(null);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleSaveLog = async (log: StorageLog) => {
    setLoading(true);
    
    try {
      if (log.id) {
        // Update existing log
        console.log('Updating existing log:', log);
        const updatedLog = await storageLogApi.update(log);
        console.log('Log updated successfully:', updatedLog);
        setLogs(prev => 
          prev.map(l => l.id === log.id ? updatedLog : l)
        );
      } else {
        // Create new log
        console.log('Creating new log:', log);
        const newLog = await storageLogApi.create({
          ...log,
          storageLocationId: locationId,
        });
        console.log('Log created successfully:', newLog);
        
        // Add to local state
        // Note: In production, we would typically fetch from server again
        // but since we have mock data, we'll add directly to state
        setLogs(prev => [...prev, newLog]);
      }
      
      setOpenDialog(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save storage log');
      console.error('Unexpected error in handleSaveLog:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this storage log?')) return;
    
    setLoading(true);
    
    try {
      console.log('Deleting log with ID:', id);
      await storageLogApi.delete(id);
      console.log('Log deleted successfully');
      // Remove from local state
      setLogs(prev => prev.filter(log => log.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete storage log');
      console.error('Unexpected error in handleDelete:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
        <Link color="inherit" href="/storage-locations">
          Storage Locations
        </Link>
        <Typography color="text.primary">{location?.location || 'Storage Logs'}</Typography>
      </Breadcrumbs>
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4">{location?.location || 'Storage Logs'}</Typography>
          {location && (
            <Typography variant="subtitle1" color="text.secondary">
              {location.storageType} | Acceptable Range: {location.acceptableRange} | Humidity Monitoring: {location.humidity ? 'Yes' : 'No'}
            </Typography>
          )}
        </Box>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Record Measurement
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
                <TableCell>Date & Time</TableCell>
                <TableCell>Temperature</TableCell>
                {location?.humidity && <TableCell>Humidity</TableCell>}
                <TableCell>Recorded By</TableCell>
                <TableCell>Notes</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {logs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={location?.humidity ? 6 : 5} align="center">
                    No temperature logs found for this location
                  </TableCell>
                </TableRow>
              ) : (
                logs.map((log) => {
                  const isOutOfRange = isTemperatureOutOfRange(log.temperature, location?.acceptableRange);
                  return (
                  <TableRow 
                    key={log.id}
                    sx={isOutOfRange ? { backgroundColor: 'rgba(255,0,0,0.05)' } : {}}
                  >
                    <TableCell>{formatDateTime(log.recordedAt)}</TableCell>
                    <TableCell>
                      {isTemperatureOutOfRange(log.temperature, location?.acceptableRange) ? (
                        <Typography color="error" fontWeight="bold">
                          {log.temperature}°C
                        </Typography>
                      ) : (
                        `${log.temperature}°C`
                      )}
                    </TableCell>
                    {location?.humidity && <TableCell>{log.humidity || 'N/A'}%</TableCell>}
                    <TableCell>{log.employeeName}</TableCell>
                    <TableCell>{log.notes || 'N/A'}</TableCell>
                    <TableCell align="right">
                      <Button
                        size="small"
                        startIcon={<EditIcon />}
                        sx={{ mr: 1 }}
                        onClick={() => handleOpenDialog(log)}
                      >
                        Edit
                      </Button>
                      <Button
                        size="small"
                        color="error"
                        startIcon={<DeleteIcon />}
                        onClick={() => log.id && handleDelete(log.id)}
                      >
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Form Dialog */}
      {openDialog && location && (
        <StorageLogForm
          open={openDialog}
          onClose={handleCloseDialog}
          onSave={handleSaveLog}
          log={currentLog}
          location={location}
          orgId={orgId}
        />
      )}
    </Box>
  );
};

export default StorageLogs;