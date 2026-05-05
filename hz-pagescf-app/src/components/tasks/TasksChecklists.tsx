import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Tabs,
  Tab,
  Divider,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  IconButton,
  Checkbox,
  Dialog,
  Card,
  CardContent,
  CardActions,
  Grid,
  Chip
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  KeyboardArrowRight as ArrowRightIcon,
  ArrowBack as BackIcon
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { Task, Checklist } from '../../types';
import { taskApi, checklistApi } from '../../services';
import TaskForm from './TaskForm';
import ChecklistForm from './ChecklistForm';

// Tab panel component
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tasks-tabpanel-${index}`}
      aria-labelledby={`tasks-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ pt: 2 }}>
          {children}
        </Box>
      )}
    </div>
  );
};

const TasksChecklists: React.FC = () => {
  const { orgId } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [checklists, setChecklists] = useState<Checklist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);
  
  // Task form state
  const [openTaskForm, setOpenTaskForm] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  
  // Checklist form state
  const [openChecklistForm, setOpenChecklistForm] = useState(false);
  const [selectedChecklist, setSelectedChecklist] = useState<Checklist | null>(null);
  
  // Checklist detail view state
  const [selectedChecklistView, setSelectedChecklistView] = useState<Checklist | null>(null);

  // Fetch tasks and checklists from API
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const [fetchedTasks, fetchedChecklists] = await Promise.all([
        taskApi.getAll(),
        checklistApi.getAll()
      ]);
      
      setTasks(fetchedTasks);
      setChecklists(fetchedChecklists);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch tasks and checklists');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchData();
  }, []);

  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Format interval into human-readable text
  const formatInterval = (interval: number): string => {
    if (interval === 1) return 'Daily';
    if (interval === 7) return 'Weekly';
    if (interval === 30) return 'Monthly';
    return `Every ${interval} days`;
  };

  // Get task names for a checklist
  const getChecklistTasks = (checklist: Checklist): Task[] => {
    return checklist.tasks
      .map(id => tasks.find(task => task.id === id))
      .filter(task => task !== undefined) as Task[];
  };

  // TASK HANDLERS
  
  // Handle task form open for create
  const handleCreateTask = () => {
    setSelectedTask(null);
    setOpenTaskForm(true);
  };

  // Handle task form open for edit
  const handleEditTask = (task: Task) => {
    setSelectedTask(task);
    setOpenTaskForm(true);
  };

  // Handle task deletion
  const handleDeleteTask = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await taskApi.delete(id);
        // Remove the task from the local state
        setTasks(tasks.filter(task => task.id !== id));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to delete task');
        console.error(err);
      }
    }
  };

  // Handle task completion toggle
  const handleToggleTaskComplete = async (task: Task) => {
    const updatedTask = {
      ...task,
      completed: !task.completed
    };
    
    try {
      const result = await taskApi.update(updatedTask);
      // Update the task in the local state
      setTasks(tasks.map(t => t.id === task.id ? result : t));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update task');
      console.error(err);
    }
  };

  // Handle task form submission
  const handleTaskFormSubmit = async (task: Task) => {
    try {
      if (task.id) {
        // Update existing task
        const updatedTask = await taskApi.update(task);
        // Update the task in the local state
        setTasks(tasks.map(t => t.id === task.id ? updatedTask : t));
      } else {
        // Create new task with org_id
        const newTask = {
          ...task,
          org_id: orgId || 0
        };
        const createdTask = await taskApi.create(newTask);
        // Add the new task to the local state
        setTasks([...tasks, createdTask]);
      }
      // Close the form
      setOpenTaskForm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save task');
      console.error(err);
    }
  };

  // CHECKLIST HANDLERS
  
  // Handle checklist form open for create
  const handleCreateChecklist = () => {
    setSelectedChecklist(null);
    setOpenChecklistForm(true);
  };

  // Handle checklist form open for edit
  const handleEditChecklist = (checklist: Checklist) => {
    setSelectedChecklist(checklist);
    setOpenChecklistForm(true);
  };

  // Handle checklist deletion
  const handleDeleteChecklist = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this checklist?')) {
      try {
        await checklistApi.delete(id);
        // Remove the checklist from the local state
        setChecklists(checklists.filter(checklist => checklist.id !== id));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to delete checklist');
        console.error(err);
      }
    }
  };

  // Handle checklist completion toggle
  const handleToggleChecklistComplete = async (checklist: Checklist) => {
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

  // Handle checklist form submission
  const handleChecklistFormSubmit = async (checklist: Checklist) => {
    try {
      if (checklist.id) {
        // Update existing checklist
        const updatedChecklist = await checklistApi.update(checklist);
        // Update the checklist in the local state
        setChecklists(checklists.map(c => c.id === checklist.id ? updatedChecklist : c));
      } else {
        // Create new checklist with org_id
        const newChecklist = {
          ...checklist,
          org_id: orgId || 0
        };
        const createdChecklist = await checklistApi.create(newChecklist);
        // Add the new checklist to the local state
        setChecklists([...checklists, createdChecklist]);
      }
      // Close the form
      setOpenChecklistForm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save checklist');
      console.error(err);
    }
  };

  // View checklist details
  const handleViewChecklist = (checklist: Checklist) => {
    setSelectedChecklistView(checklist);
  };

  // Back to checklist list
  const handleBackToChecklists = () => {
    setSelectedChecklistView(null);
  };

  // Content when loading
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Tasks & Checklists
      </Typography>
      
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          centered
        >
          <Tab label="Tasks" />
          <Tab label="Checklists" />
        </Tabs>
        
        {/* Tasks Tab */}
        <TabPanel value={tabValue} index={0}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={handleCreateTask}
            >
              New Task
            </Button>
          </Box>
          
          {tasks.length === 0 ? (
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="body1">No tasks found. Create your first task!</Typography>
            </Paper>
          ) : (
            <List>
              {tasks.map((task) => (
                <ListItem
                  key={task.id}
                  secondaryAction={
                    <Box>
                      <IconButton edge="end" onClick={() => handleEditTask(task)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton edge="end" onClick={() => handleDeleteTask(task.id!)} color="error">
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  }
                >
                  <ListItemIcon>
                    <Checkbox
                      edge="start"
                      checked={task.completed}
                      onChange={() => handleToggleTaskComplete(task)}
                    />
                  </ListItemIcon>
                  <ListItemText
                    primary={task.name}
                    secondary={task.description}
                    sx={{
                      '& .MuiListItemText-primary': {
                        textDecoration: task.completed ? 'line-through' : 'none',
                      },
                      '& .MuiListItemText-secondary': {
                        textDecoration: task.completed ? 'line-through' : 'none',
                        opacity: task.completed ? 0.7 : 1
                      }
                    }}
                  />
                </ListItem>
              ))}
            </List>
          )}
        </TabPanel>
        
        {/* Checklists Tab */}
        <TabPanel value={tabValue} index={1}>
          {/* Checklist detail view */}
          {selectedChecklistView ? (
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Button
                  startIcon={<BackIcon />}
                  onClick={handleBackToChecklists}
                  sx={{ mr: 2 }}
                >
                  Back to Checklists
                </Button>
                <Typography variant="h6">
                  {formatInterval(selectedChecklistView.interval)} Checklist
                </Typography>
              </Box>
              
              <Paper sx={{ p: 2, mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="subtitle1">
                    Status: {selectedChecklistView.completed ? 'Completed' : 'Pending'}
                  </Typography>
                  <Button
                    variant={selectedChecklistView.completed ? "outlined" : "contained"}
                    color={selectedChecklistView.completed ? "success" : "primary"}
                    onClick={() => handleToggleChecklistComplete(selectedChecklistView)}
                  >
                    {selectedChecklistView.completed ? 'Mark Incomplete' : 'Mark Complete'}
                  </Button>
                </Box>
              </Paper>
              
              <Typography variant="h6" gutterBottom>Tasks</Typography>
              
              <List>
                {getChecklistTasks(selectedChecklistView).map((task) => (
                  <ListItem key={task.id}>
                    <ListItemIcon>
                      <Checkbox
                        edge="start"
                        checked={selectedChecklistView.completed}
                        disabled={true}
                      />
                    </ListItemIcon>
                    <ListItemText
                      primary={task.name}
                      secondary={task.description}
                      sx={{
                        '& .MuiListItemText-primary': {
                          textDecoration: selectedChecklistView.completed ? 'line-through' : 'none',
                        },
                        '& .MuiListItemText-secondary': {
                          textDecoration: selectedChecklistView.completed ? 'line-through' : 'none',
                          opacity: selectedChecklistView.completed ? 0.7 : 1
                        }
                      }}
                    />
                  </ListItem>
                ))}
              </List>
              
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
                <Button
                  variant="outlined"
                  color="primary"
                  startIcon={<EditIcon />}
                  onClick={() => handleEditChecklist(selectedChecklistView)}
                  sx={{ mr: 1 }}
                >
                  Edit Checklist
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<DeleteIcon />}
                  onClick={() => {
                    handleDeleteChecklist(selectedChecklistView.id!);
                    handleBackToChecklists();
                  }}
                >
                  Delete Checklist
                </Button>
              </Box>
            </Box>
          ) : (
            /* Checklist list view */
            <>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<AddIcon />}
                  onClick={handleCreateChecklist}
                >
                  New Checklist
                </Button>
              </Box>
              
              {checklists.length === 0 ? (
                <Paper sx={{ p: 3, textAlign: 'center' }}>
                  <Typography variant="body1">No checklists found. Create your first checklist!</Typography>
                </Paper>
              ) : (
                <Grid container spacing={2}>
                  {checklists.map((checklist) => {
                    const checklistTasks = getChecklistTasks(checklist);
                    
                    return (
                      <Grid item xs={12} sm={6} md={4} key={checklist.id}>
                        <Card 
                          elevation={3}
                          sx={{
                            opacity: checklist.completed ? 0.8 : 1,
                            bgcolor: checklist.completed ? 'action.hover' : 'background.paper'
                          }}
                        >
                          <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                              <Typography variant="h6" component="div">
                                {formatInterval(checklist.interval)}
                              </Typography>
                              <Chip 
                                label={checklist.completed ? "Completed" : "Pending"} 
                                color={checklist.completed ? "success" : "primary"}
                                size="small"
                              />
                            </Box>
                            
                            <Typography color="text.secondary" variant="body2" sx={{ mb: 1 }}>
                              {checklistTasks.length} task{checklistTasks.length !== 1 ? 's' : ''}
                            </Typography>
                            
                            <Divider sx={{ my: 1 }} />
                            
                            <List dense sx={{ maxHeight: '120px', overflow: 'auto' }}>
                              {checklistTasks.slice(0, 3).map((task) => (
                                <ListItem key={task.id} disablePadding>
                                  <ListItemIcon sx={{ minWidth: '30px' }}>
                                    <Checkbox
                                      checked={checklist.completed}
                                      disabled={true}
                                      size="small"
                                    />
                                  </ListItemIcon>
                                  <ListItemText 
                                    primary={task.name} 
                                    sx={{
                                      '& .MuiListItemText-primary': {
                                        textDecoration: checklist.completed ? 'line-through' : 'none',
                                        fontSize: '0.875rem'
                                      }
                                    }}
                                  />
                                </ListItem>
                              ))}
                              {checklistTasks.length > 3 && (
                                <ListItem disablePadding>
                                  <ListItemText 
                                    primary={`+ ${checklistTasks.length - 3} more...`} 
                                    sx={{ 
                                      '& .MuiListItemText-primary': { 
                                        fontSize: '0.875rem',
                                        fontStyle: 'italic',
                                        color: 'text.secondary',
                                        textAlign: 'center'
                                      } 
                                    }}
                                  />
                                </ListItem>
                              )}
                            </List>
                          </CardContent>
                          <CardActions sx={{ justifyContent: 'space-between', p: 1, pt: 0 }}>
                            <Button 
                              size="small" 
                              onClick={() => handleToggleChecklistComplete(checklist)}
                            >
                              {checklist.completed ? 'Mark Incomplete' : 'Mark Complete'}
                            </Button>
                            <Box>
                              <IconButton size="small" onClick={() => handleViewChecklist(checklist)}>
                                <ArrowRightIcon />
                              </IconButton>
                              <IconButton size="small" onClick={() => handleEditChecklist(checklist)}>
                                <EditIcon fontSize="small" />
                              </IconButton>
                              <IconButton size="small" onClick={() => handleDeleteChecklist(checklist.id!)} color="error">
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Box>
                          </CardActions>
                        </Card>
                      </Grid>
                    );
                  })}
                </Grid>
              )}
            </>
          )}
        </TabPanel>
      </Paper>
      
      {/* Task Form Dialog */}
      <Dialog open={openTaskForm} onClose={() => setOpenTaskForm(false)} maxWidth="sm" fullWidth>
        <TaskForm
          task={selectedTask}
          onSubmit={handleTaskFormSubmit}
          onCancel={() => setOpenTaskForm(false)}
        />
      </Dialog>
      
      {/* Checklist Form Dialog */}
      <Dialog open={openChecklistForm} onClose={() => setOpenChecklistForm(false)} maxWidth="sm" fullWidth>
        <ChecklistForm
          checklist={selectedChecklist}
          tasks={tasks}
          onSubmit={handleChecklistFormSubmit}
          onCancel={() => setOpenChecklistForm(false)}
        />
      </Dialog>
    </Box>
  );
};

export default TasksChecklists;