import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControlLabel,
  Checkbox,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  ListItemText,
  OutlinedInput,
  SelectChangeEvent
} from '@mui/material';
import { Checklist, Task } from '../../types';

interface ChecklistFormProps {
  checklist: Checklist | null;
  tasks: Task[];
  onSubmit: (checklist: Checklist) => void;
  onCancel: () => void;
}

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

const intervals = [
  { value: 1, label: 'Daily' },
  { value: 7, label: 'Weekly' },
  { value: 30, label: 'Monthly' }
];

const ChecklistForm: React.FC<ChecklistFormProps> = ({ checklist, tasks, onSubmit, onCancel }) => {
  const [formValues, setFormValues] = useState<Checklist>({
    tasks: [],
    interval: 1,
    completed: false,
    org_id: 0
  });
  
  const [errors, setErrors] = useState({
    tasks: '',
    interval: ''
  });

  // Initialize form with checklist data if editing
  useEffect(() => {
    if (checklist) {
      setFormValues({
        id: checklist.id,
        tasks: checklist.tasks,
        interval: checklist.interval,
        completed: checklist.completed,
        org_id: checklist.org_id
      });
    } else {
      setFormValues({
        tasks: [],
        interval: 1,
        completed: false,
        org_id: 0
      });
    }
  }, [checklist]);

  // Handle task selection change
  const handleTasksChange = (event: SelectChangeEvent<number[]>) => {
    const value = event.target.value as number[];
    
    setFormValues({
      ...formValues,
      tasks: value
    });
    
    // Clear error when user selects tasks
    setErrors({
      ...errors,
      tasks: ''
    });
  };

  // Handle interval change
  const handleIntervalChange = (event: SelectChangeEvent<number>) => {
    const value = event.target.value as number;
    
    setFormValues({
      ...formValues,
      interval: value
    });
    
    // Clear error when user selects interval
    setErrors({
      ...errors,
      interval: ''
    });
  };

  // Handle checkbox change
  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormValues({
      ...formValues,
      completed: event.target.checked
    });
  };

  // Validate form
  const validateForm = (): boolean => {
    let valid = true;
    const newErrors = { ...errors };
    
    if (formValues.tasks.length === 0) {
      newErrors.tasks = 'At least one task must be selected';
      valid = false;
    }
    
    if (!formValues.interval) {
      newErrors.interval = 'Interval is required';
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
      <DialogTitle>{checklist ? 'Edit Checklist' : 'Create New Checklist'}</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12}>
            <FormControl fullWidth error={!!errors.tasks}>
              <InputLabel id="tasks-select-label">Tasks</InputLabel>
              <Select
                labelId="tasks-select-label"
                id="tasks-select"
                multiple
                value={formValues.tasks}
                onChange={handleTasksChange}
                input={<OutlinedInput label="Tasks" />}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((taskId) => {
                      const task = tasks.find(t => t.id === taskId);
                      return task ? task.name : '';
                    }).join(', ')}
                  </Box>
                )}
                MenuProps={MenuProps}
              >
                {tasks.map((task) => (
                  <MenuItem key={task.id} value={task.id}>
                    <Checkbox checked={formValues.tasks.indexOf(task.id!) > -1} />
                    <ListItemText primary={task.name} />
                  </MenuItem>
                ))}
              </Select>
              {errors.tasks && <FormHelperText>{errors.tasks}</FormHelperText>}
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <FormControl fullWidth error={!!errors.interval}>
              <InputLabel id="interval-select-label">Interval</InputLabel>
              <Select
                labelId="interval-select-label"
                id="interval-select"
                value={formValues.interval}
                label="Interval"
                onChange={handleIntervalChange}
              >
                {intervals.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
              {errors.interval && <FormHelperText>{errors.interval}</FormHelperText>}
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={formValues.completed}
                  onChange={handleCheckboxChange}
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
          {checklist ? 'Update' : 'Create'}
        </Button>
      </DialogActions>
    </Box>
  );
};

export default ChecklistForm;