import React, { useState, useEffect } from 'react';
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
  IconButton,
  Checkbox,
  Dialog,
  CircularProgress,
  Alert
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { Task } from '../../types';
import { taskApi } from '../../services';
import TaskForm from './TaskForm';

const Tasks: React.FC = () => {
  const { orgId } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openForm, setOpenForm] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  // Fetch tasks from API
  const fetchTasks = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const fetchedTasks = await taskApi.getAll();
      setTasks(fetchedTasks);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch tasks');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch tasks on component mount
  useEffect(() => {
    fetchTasks();
  }, []);

  // Handle form open for create
  const handleCreate = () => {
    setSelectedTask(null);
    setOpenForm(true);
  };

  // Handle form open for edit
  const handleEdit = (task: Task) => {
    setSelectedTask(task);
    setOpenForm(true);
  };

  // Handle task deletion
  const handleDelete = async (id: number) => {
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
  const handleToggleComplete = async (task: Task) => {
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

  // Handle form submission
  const handleFormSubmit = async (task: Task) => {
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
      setOpenForm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save task');
      console.error(err);
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4" gutterBottom>
          Tasks
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleCreate}
        >
          Add Task
        </Button>
      </Box>
      
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : tasks.length === 0 ? (
        <Paper sx={{ p: 2 }}>
          <Typography align="center">No tasks found</Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Completed</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Description</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {tasks.map((task) => (
                <TableRow key={task.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                  <TableCell>
                    <Checkbox
                      checked={task.completed}
                      onChange={() => handleToggleComplete(task)}
                    />
                  </TableCell>
                  <TableCell sx={{ textDecoration: task.completed ? 'line-through' : 'none' }}>
                    {task.name}
                  </TableCell>
                  <TableCell sx={{ textDecoration: task.completed ? 'line-through' : 'none' }}>
                    {task.description}
                  </TableCell>
                  <TableCell align="right">
                    <IconButton onClick={() => handleEdit(task)} size="small">
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(task.id!)} size="small" color="error">
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      
      {/* Task Form Dialog */}
      <Dialog open={openForm} onClose={() => setOpenForm(false)} maxWidth="sm" fullWidth>
        <TaskForm
          task={selectedTask}
          onSubmit={handleFormSubmit}
          onCancel={() => setOpenForm(false)}
        />
      </Dialog>
    </Box>
  );
};

export default Tasks;