import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Checkbox,
  Divider,
  CircularProgress,
  Alert,
  Button
} from '@mui/material';
import { Task, Checklist } from '../../types';
import { taskApi, checklistApi } from '../../services';
import { useNavigate } from 'react-router-dom';

const DailyTasks: React.FC = () => {
  const [checklists, setChecklists] = useState<Checklist[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Fetch today's checklists and all tasks
  const fetchTodayData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const [todayChecklists, allTasks] = await Promise.all([
        checklistApi.getTodayChecklists(),
        taskApi.getAll()
      ]);
      
      setChecklists(todayChecklists);
      setTasks(allTasks);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch today\'s tasks');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchTodayData();
  }, []);

  // Handle checklist completion toggle
  const handleToggleComplete = async (checklist: Checklist) => {
    const updatedChecklist = {
      ...checklist,
      completed: !checklist.completed
    };
    
    try {
      const result = await checklistApi.update(updatedChecklist);
      // Update the checklist in the local state
      setChecklists(checklists.map(c => c.id === checklist.id ? result : c));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update checklist');
      console.error(err);
    }
  };

  // Get task details for a checklist
  const getChecklistTasks = (checklist: Checklist) => {
    return checklist.tasks
      .map(id => tasks.find(task => task.id === id))
      .filter(task => task !== undefined) as Task[];
  };

  // Navigate to tasks & checklists page
  const navigateToTasks = () => {
    navigate('/tasks-checklists');
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
      <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
    );
  }

  if (checklists.length === 0) {
    return (
      <Paper sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mb: 2 }}>
          No tasks for today
        </Typography>
        <Button variant="outlined" size="small" onClick={navigateToTasks}>
          View All Tasks & Checklists
        </Button>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Typography variant="h6" gutterBottom>
        Today's Tasks
      </Typography>
      
      <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
        <List dense>
          {checklists.map((checklist, index) => (
            <React.Fragment key={checklist.id}>
              {getChecklistTasks(checklist).map((task, taskIndex) => (
                <ListItem key={`${checklist.id}-${task.id}`} dense>
                  <ListItemIcon>
                    <Checkbox
                      edge="start"
                      checked={checklist.completed}
                      onChange={() => handleToggleComplete(checklist)}
                      tabIndex={-1}
                      disableRipple
                    />
                  </ListItemIcon>
                  <ListItemText 
                    primary={task.name}
                    sx={{ 
                      textDecoration: checklist.completed ? 'line-through' : 'none',
                      opacity: checklist.completed ? 0.7 : 1
                    }}
                  />
                </ListItem>
              ))}
              {index < checklists.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </List>
      </Box>
      
      <Box sx={{ mt: 2 }}>
        <Button variant="outlined" size="small" onClick={navigateToTasks} fullWidth>
          View All Tasks & Checklists
        </Button>
      </Box>
    </Paper>
  );
};

export default DailyTasks;