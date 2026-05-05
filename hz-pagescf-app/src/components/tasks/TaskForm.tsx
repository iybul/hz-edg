import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  TextField,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControlLabel,
  Checkbox,
  Grid
} from '@mui/material';
import { Task } from '../../types';

interface TaskFormProps {
  task: Task | null;
  onSubmit: (task: Task) => void;
  onCancel: () => void;
}

const TaskForm: React.FC<TaskFormProps> = ({ task, onSubmit, onCancel }) => {
  const [formValues, setFormValues] = useState<Task>({
    name: '',
    description: '',
    completed: false,
    org_id: 0
  });
  
  const [errors, setErrors] = useState({
    name: '',
    description: ''
  });

  // Initialize form with task data if editing
  useEffect(() => {
    if (task) {
      setFormValues({
        id: task.id,
        name: task.name,
        description: task.description,
        completed: task.completed,
        org_id: task.org_id
      });
    } else {
      setFormValues({
        name: '',
        description: '',
        completed: false,
        org_id: 0
      });
    }
  }, [task]);

  // Handle input changes
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = event.target;
    
    // Handle checkbox separately
    if (type === 'checkbox') {
      setFormValues({
        ...formValues,
        [name]: checked
      });
    } else {
      setFormValues({
        ...formValues,
        [name]: value
      });
    }
    
    // Clear error when user edits a field
    if (name in errors) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  // Validate form
  const validateForm = (): boolean => {
    let valid = true;
    const newErrors = { ...errors };
    
    if (!formValues.name.trim()) {
      newErrors.name = 'Name is required';
      valid = false;
    }
    
    if (!formValues.description.trim()) {
      newErrors.description = 'Description is required';
      valid = false;
    }
    
    setErrors(newErrors);
    return valid;
  };

  // Handle form submission
  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    
    if (validateForm()) {
      onSubmit(formValues);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate>
      <DialogTitle>{task ? 'Edit Task' : 'Create New Task'}</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12}>
            <TextField
              name="name"
              label="Task Name"
              value={formValues.name}
              onChange={handleChange}
              fullWidth
              required
              error={!!errors.name}
              helperText={errors.name}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              name="description"
              label="Description"
              value={formValues.description}
              onChange={handleChange}
              fullWidth
              required
              multiline
              rows={3}
              error={!!errors.description}
              helperText={errors.description}
            />
          </Grid>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Checkbox
                  name="completed"
                  checked={formValues.completed}
                  onChange={handleChange}
                />
              }
              label="Completed"
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel}>Cancel</Button>
        <Button type="submit" variant="contained" color="primary">
          {task ? 'Update' : 'Create'}
        </Button>
      </DialogActions>
    </Box>
  );
};

export default TaskForm;