import React from 'react';
import { Box, Typography, Grid, Paper } from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import DailyTasks from '../tasks/DailyTasks';
import OpenProblemLogs from './OpenProblemLogs';

const Dashboard: React.FC = () => {
  const { user } = useAuth();

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      <Typography variant="body1" paragraph>
        Welcome, {user?.name}!
      </Typography>
      
      <Grid container spacing={3}>
        {/* First row */}
        <Grid item xs={12}>
          <Typography variant="h5" gutterBottom sx={{ mt: 1 }}>
            Daily Overview
          </Typography>
        </Grid>
        
        {/* Tasks & Issues section */}
        <Grid item xs={12} md={6}>
          <Paper
            elevation={3}
            sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 300 }}
          >
            <DailyTasks />
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper
            elevation={3}
            sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 300 }}
          >
            <OpenProblemLogs />
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;