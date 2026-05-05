import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Chip,
  CircularProgress,
  Alert,
  Button,
  Divider
} from '@mui/material';
import { ProblemLog } from '../../types';
import { problemLogApi } from '../../services';
import { useNavigate } from 'react-router-dom';

const MAX_ITEMS_DISPLAYED = 3;

const OpenProblemLogs: React.FC = () => {
  const [openLogs, setOpenLogs] = useState<ProblemLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Fetch open problem logs
  const fetchOpenLogs = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const logs = await problemLogApi.getOpenLogs();
      
      // Sort by date opened (newest first)
      const sortedLogs = [...logs].sort((a, b) => 
        new Date(b.dateOpened).getTime() - new Date(a.dateOpened).getTime()
      );
      setOpenLogs(sortedLogs);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch open problem logs');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchOpenLogs();
  }, []);

  // Navigate to problem logs page
  const navigateToProblemLogs = () => {
    navigate('/problemlogs');
  };

  // Format date to a more readable format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
        <CircularProgress size={24} />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error">{error}</Alert>
    );
  }

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Typography variant="h6" gutterBottom>
        Open Issues
      </Typography>
      
      {openLogs.length === 0 ? (
        <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Typography variant="body2" color="text.secondary" align="center">
            No open issues
          </Typography>
        </Box>
      ) : (
        <List dense sx={{ flexGrow: 1, overflow: 'auto' }}>
          {openLogs.slice(0, MAX_ITEMS_DISPLAYED).map((log) => (
            <React.Fragment key={log.id}>
              <ListItem alignItems="flex-start" sx={{ py: 0.5 }}>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2" component="span" sx={{ fontWeight: 'medium' }}>
                        {log.customerName}
                      </Typography>
                      <Chip 
                        label={log.recall ? "Recall" : log.problemType} 
                        size="small" 
                        color={log.recall ? "error" : "primary"}
                        sx={{ ml: 1, height: 20, '& .MuiChip-label': { px: 1, fontSize: '0.7rem' } }}
                      />
                    </Box>
                  }
                  secondary={
                    <React.Fragment>
                      <Typography variant="caption" component="span" color="text.secondary">
                        Opened {formatDate(log.dateOpened)}
                      </Typography>
                      <Typography
                        variant="body2"
                        component="p"
                        color="text.primary"
                        sx={{
                          mt: 0.5,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                        }}
                      >
                        {log.problemDescription}
                      </Typography>
                    </React.Fragment>
                  }
                />
              </ListItem>
              <Divider component="li" />
            </React.Fragment>
          ))}
          
          {openLogs.length > MAX_ITEMS_DISPLAYED && (
            <ListItem alignItems="center">
              <ListItemText 
                primary={
                  <Typography variant="body2" color="text.secondary" align="center">
                    + {openLogs.length - MAX_ITEMS_DISPLAYED} more issues...
                  </Typography>
                } 
              />
            </ListItem>
          )}
        </List>
      )}
      
      <Box sx={{ mt: 'auto', pt: 1 }}>
        <Button 
          variant="outlined" 
          size="small" 
          onClick={navigateToProblemLogs} 
          fullWidth
          sx={{ textTransform: 'none' }}
        >
          View All Issues
        </Button>
      </Box>
    </Box>
  );
};

export default OpenProblemLogs;