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
  Alert,
  Chip
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { Checklist, Task } from '../../types';
import { taskApi, checklistApi } from '../../services';
import ChecklistForm from './ChecklistForm';

const Checklists: React.FC = () => {
  const { orgId } = useAuth();
  const [checklists, setChecklists] = useState<Checklist[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openForm, setOpenForm] = useState(false);
  const [selectedChecklist, setSelectedChecklist] = useState<Checklist | null>(null);

  // Fetch checklists and tasks from API
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const [fetchedChecklists, fetchedTasks] = await Promise.all([
        checklistApi.getAll(),
        taskApi.getAll()
      ]);
      
      setChecklists(fetchedChecklists);
      setTasks(fetchedTasks);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch checklist data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchData();
  }, []);

  // Handle form open for create
  const handleCreate = () => {
    setSelectedChecklist(null);
    setOpenForm(true);
  };

  // Handle form open for edit
  const handleEdit = (checklist: Checklist) => {
    setSelectedChecklist(checklist);
    setOpenForm(true);
  };

  // Handle checklist deletion
  const handleDelete = async (id: number) => {
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

  // Handle form submission
  const handleFormSubmit = async (checklist: Checklist) => {
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
      setOpenForm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save checklist');
      console.error(err);
    }
  };

  // Get task names for a checklist
  const getTaskNames = (taskIds: number[]): string[] => {
    return taskIds
      .map(id => tasks.find(task => task.id === id))
      .filter(task => task !== undefined)
      .map(task => task!.name);
  };

  // Format interval into human-readable text
  const formatInterval = (interval: number): string => {
    if (interval === 1) return 'Daily';
    if (interval === 7) return 'Weekly';
    if (interval === 30) return 'Monthly';
    return `Every ${interval} days`;
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4" gutterBottom>
          Checklists
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleCreate}
        >
          Add Checklist
        </Button>
      </Box>
      
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : checklists.length === 0 ? (
        <Paper sx={{ p: 2 }}>
          <Typography align="center">No checklists found</Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Completed</TableCell>
                <TableCell>Interval</TableCell>
                <TableCell>Tasks</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {checklists.map((checklist) => (
                <TableRow key={checklist.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                  <TableCell>
                    <Checkbox
                      checked={checklist.completed}
                      onChange={() => handleToggleComplete(checklist)}
                    />
                  </TableCell>
                  <TableCell sx={{ textDecoration: checklist.completed ? 'line-through' : 'none' }}>
                    {formatInterval(checklist.interval)}
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {getTaskNames(checklist.tasks).map((name, index) => (
                        <Chip
                          key={index}
                          label={name}
                          size="small"
                          sx={{ 
                            textDecoration: checklist.completed ? 'line-through' : 'none',
                            opacity: checklist.completed ? 0.7 : 1
                          }}
                        />
                      ))}
                    </Box>
                  </TableCell>
                  <TableCell align="right">
                    <IconButton onClick={() => handleEdit(checklist)} size="small">
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(checklist.id!)} size="small" color="error">
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      
      {/* Checklist Form Dialog */}
      <Dialog open={openForm} onClose={() => setOpenForm(false)} maxWidth="sm" fullWidth>
        <ChecklistForm
          checklist={selectedChecklist}
          tasks={tasks}
          onSubmit={handleFormSubmit}
          onCancel={() => setOpenForm(false)}
        />
      </Dialog>
    </Box>
  );
};

export default Checklists;