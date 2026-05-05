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
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Stack,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, AddCircle as AddCircleIcon } from '@mui/icons-material';
import { ingredientApi, generalIngredientApi } from '../../services';
import { Ingredient, GeneralIngredient } from '../../types';
import { useAuth } from '../../context/AuthContext';

// Helper function to format date as YYYY-MM-DD
const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

// Initial state for a general ingredient
const initialGeneralIngredientState: GeneralIngredient = {
  id: undefined,
  name: '',
  org_id: 0
};

// Initial state for an ingredient
const initialIngredientState: Ingredient = {
  id: undefined,
  general_ingredient_id: 0,
  lotcode: '',
  date_received: formatDate(new Date()),
  exp_date: formatDate(new Date(Date.now() + 30*24*60*60*1000)), // 30 days from now
  quantity: 0,
  unit: 'kg',
  cost_per_unit: 0,
  org_id: 0
};

// Tab panel component
interface TabPanelProps {
  children?: React.ReactNode;
  value: number;
  index: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ pt: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const Ingredients: React.FC = () => {
  const { orgId, loading: authLoading } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  
  // General ingredients state
  const [generalIngredients, setGeneralIngredients] = useState<GeneralIngredient[]>([]);
  const [currentGeneralIngredient, setCurrentGeneralIngredient] = useState<GeneralIngredient>(initialGeneralIngredientState);
  const [openGeneralDialog, setOpenGeneralDialog] = useState(false);
  
  // Ingredients state
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [currentIngredient, setCurrentIngredient] = useState<Ingredient>(initialIngredientState);
  const [openIngredientDialog, setOpenIngredientDialog] = useState(false);
  
  // Shared state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [selectedGeneralIngredient, setSelectedGeneralIngredient] = useState<number | null>(null);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchGeneralIngredients();
    fetchIngredients();
  }, []);

  // Set org_id when organization is available
  useEffect(() => {
    if (orgId) {
      setCurrentGeneralIngredient(prev => ({
        ...prev,
        org_id: orgId
      }));
      setCurrentIngredient(prev => ({
        ...prev,
        org_id: orgId
      }));
    }
  }, [orgId]);

  // Fetch general ingredients
  const fetchGeneralIngredients = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await generalIngredientApi.getAll();
      console.log('Fetched general ingredients:', data);
      if (Array.isArray(data)) {
        setGeneralIngredients(data);
      } else {
        console.error('Unexpected response format for general ingredients:', data);
        setGeneralIngredients([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch general ingredients');
      console.error('Error fetching general ingredients:', err);
      setGeneralIngredients([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch ingredients
  const fetchIngredients = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await ingredientApi.getAll();
      console.log('Fetched ingredients:', data);
      if (Array.isArray(data)) {
        // Ensure all required fields have default values
        const processedData = data.map(ingredient => ({
          ...ingredient,
          quantity: ingredient.quantity || 0,
          unit: ingredient.unit || '',
          cost_per_unit: ingredient.cost_per_unit || 0
        }));
        setIngredients(processedData);
      } else {
        console.error('Unexpected response format for ingredients:', data);
        setIngredients([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch ingredients');
      console.error('Error fetching ingredients:', err);
      setIngredients([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch ingredients for a specific general ingredient
  const fetchIngredientsByGeneralId = async (generalId: number) => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await generalIngredientApi.getIngredientsByGeneralId(generalId);
      console.log(`Fetched ingredients for general ingredient ${generalId}:`, data);
      
      if (Array.isArray(data)) {
        // Ensure all required fields have default values
        const processedData = data.map(ingredient => ({
          ...ingredient,
          quantity: ingredient.quantity || 0,
          unit: ingredient.unit || '',
          cost_per_unit: ingredient.cost_per_unit || 0
        }));
        setIngredients(processedData);
        setSelectedGeneralIngredient(generalId);
      } else {
        console.error('Unexpected response format for ingredients by general ID:', data);
        setIngredients([]);
        setSelectedGeneralIngredient(generalId);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : `Failed to fetch ingredients for general ingredient ${generalId}`);
      console.error(`Error fetching ingredients for general ingredient ${generalId}:`, err);
      setIngredients([]);
    } finally {
      setLoading(false);
    }
  };

  // GENERAL INGREDIENT HANDLERS
  const handleOpenGeneralDialog = (generalIngredient?: GeneralIngredient) => {
    if (generalIngredient) {
      // Edit mode
      setCurrentGeneralIngredient({
        id: generalIngredient.id,
        name: generalIngredient.name,
        org_id: generalIngredient.org_id
      });
    } else {
      // Create mode
      setCurrentGeneralIngredient({
        id: undefined,
        name: '',
        org_id: orgId || 0
      });
    }
    setOpenGeneralDialog(true);
  };

  const handleCloseGeneralDialog = () => {
    setOpenGeneralDialog(false);
    setFormError(null);
  };

  const handleGeneralInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCurrentGeneralIngredient(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateGeneralForm = (): boolean => {
    if (!currentGeneralIngredient.name.trim()) {
      setFormError('Name is required');
      return false;
    }
    return true;
  };

  const handleGeneralSubmit = async () => {
    if (!validateGeneralForm()) return;
    
    try {
      setLoading(true);
      setFormError(null);
      
      if (currentGeneralIngredient.id) {
        // Update existing general ingredient
        console.log('Submitting update for general ingredient:', currentGeneralIngredient);
        const updatedGeneralIngredient = await generalIngredientApi.update(currentGeneralIngredient);
        
        if (updatedGeneralIngredient) {
          console.log('Successfully updated general ingredient:', updatedGeneralIngredient);
          setGeneralIngredients(prev => 
            prev.map(gi => gi.id === updatedGeneralIngredient.id ? updatedGeneralIngredient : gi)
          );
          handleCloseGeneralDialog();
          // Refresh the list to get the latest data
          fetchGeneralIngredients();
        } else {
          setFormError('Failed to update general ingredient: Received invalid response from server');
        }
      } else {
        // Create new general ingredient
        console.log('Submitting new general ingredient:', currentGeneralIngredient);
        const newGeneralIngredient = await generalIngredientApi.create(currentGeneralIngredient);
        
        if (newGeneralIngredient && newGeneralIngredient.id) {
          console.log('Successfully created general ingredient:', newGeneralIngredient);
          setGeneralIngredients(prev => [...prev, newGeneralIngredient]);
          handleCloseGeneralDialog();
          // Refresh the list to get the latest data
          fetchGeneralIngredients();
        } else {
          setFormError('Failed to create general ingredient: Received invalid response from server');
        }
      }
    } catch (err) {
      console.error('Error in general ingredient submission:', err);
      setFormError(
        err instanceof Error 
          ? `Error: ${err.message}` 
          : (currentGeneralIngredient.id ? 'Error updating general ingredient' : 'Error creating general ingredient')
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGeneralDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this general ingredient? This will also delete all associated ingredients.')) return;
    
    try {
      setLoading(true);
      await generalIngredientApi.delete(id);
      setGeneralIngredients(prev => prev.filter(gi => gi.id !== id));
      
      // Also refresh ingredients list as some may have been deleted
      await fetchIngredients();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete general ingredient');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // INGREDIENT HANDLERS
  const handleOpenIngredientDialog = (generalIngredientId?: number, ingredient?: Ingredient) => {
    if (ingredient) {
      // Edit mode
      setCurrentIngredient({
        id: ingredient.id,
        general_ingredient_id: ingredient.general_ingredient_id,
        lotcode: ingredient.lotcode,
        date_received: ingredient.date_received,
        exp_date: ingredient.exp_date,
        quantity: ingredient.quantity,
        unit: ingredient.unit,
        cost_per_unit: ingredient.cost_per_unit,
        org_id: ingredient.org_id,
        general_ingredient_name: ingredient.general_ingredient_name
      });
    } else {
      // Create mode
      setCurrentIngredient({
        id: undefined,
        general_ingredient_id: generalIngredientId || 0,
        lotcode: '',
        date_received: formatDate(new Date()),
        exp_date: formatDate(new Date(Date.now() + 30*24*60*60*1000)), // 30 days from now
        quantity: 0,
        unit: 'kg',
        cost_per_unit: 0,
        org_id: orgId || 0
      });
    }
    setOpenIngredientDialog(true);
  };

  const handleCloseIngredientDialog = () => {
    setOpenIngredientDialog(false);
    setFormError(null);
  };

  const handleIngredientInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCurrentIngredient(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleIngredientNumberInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCurrentIngredient(prev => ({
      ...prev,
      [name]: parseFloat(value) || 0
    }));
  };

  const handleSelectChange = (e: any) => {
    const { name, value } = e.target;
    setCurrentIngredient(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateIngredientForm = (): boolean => {
    if (!currentIngredient.lotcode.trim()) {
      setFormError('Lot Code is required');
      return false;
    }
    if (!currentIngredient.general_ingredient_id) {
      setFormError('General Ingredient is required');
      return false;
    }
    if (!currentIngredient.date_received) {
      setFormError('Received Date is required');
      return false;
    }
    if (!currentIngredient.exp_date) {
      setFormError('Expiration Date is required');
      return false;
    }
    if (currentIngredient.quantity <= 0) {
      setFormError('Quantity must be greater than 0');
      return false;
    }
    if (!currentIngredient.unit.trim()) {
      setFormError('Unit is required');
      return false;
    }
    if (currentIngredient.cost_per_unit < 0) {
      setFormError('Cost per unit cannot be negative');
      return false;
    }
    return true;
  };

  const handleIngredientSubmit = async () => {
    if (!validateIngredientForm()) return;
    
    try {
      setLoading(true);
      setFormError(null);
      
      if (currentIngredient.id) {
        // Update existing ingredient
        console.log('Submitting update for ingredient:', currentIngredient);
        const updatedIngredient = await ingredientApi.update(currentIngredient);
        
        if (updatedIngredient) {
          console.log('Successfully updated ingredient:', updatedIngredient);
          setIngredients(prev => 
            prev.map(ing => ing.id === updatedIngredient.id ? updatedIngredient : ing)
          );
          handleCloseIngredientDialog();
          
          // Refresh the appropriate list
          if (selectedGeneralIngredient) {
            fetchIngredientsByGeneralId(selectedGeneralIngredient);
          } else {
            fetchIngredients();
          }
        } else {
          setFormError('Failed to update ingredient: Received invalid response from server');
        }
      } else {
        // Create new ingredient
        console.log('Submitting new ingredient:', currentIngredient);
        
        // Make sure all required fields are present and valid
        // Cast general_ingredient_id to ensure it's a number, not undefined
        const defaultGeneralIngredientId = generalIngredients.length > 0 
          ? (generalIngredients[0].id as number) 
          : 1;
          
        const ingredientToCreate = {
          ...currentIngredient,
          general_ingredient_id: (currentIngredient.general_ingredient_id || defaultGeneralIngredientId) as number,
          // Store as number in state, but API expects string
          quantity: currentIngredient.quantity || 0,
          unit: currentIngredient.unit || '',
          // Store as number in state, but API expects string
          cost_per_unit: currentIngredient.cost_per_unit || 0
        };
        
        console.log('Prepared ingredientToCreate with valid fields:', ingredientToCreate);
        
        try {
          const newIngredient = await ingredientApi.create(ingredientToCreate);
          
          if (newIngredient && newIngredient.id) {
            console.log('Successfully created ingredient:', newIngredient);
            setIngredients(prev => [...prev, newIngredient]);
            handleCloseIngredientDialog();
            
            // Refresh the appropriate list
            if (selectedGeneralIngredient) {
              fetchIngredientsByGeneralId(selectedGeneralIngredient);
            } else {
              fetchIngredients();
            }
          } else {
            setFormError('Failed to create ingredient: Received invalid response from server');
          }
        } catch (createError) {
          console.error('Error creating ingredient:', createError);
          setFormError(createError instanceof Error 
            ? `Error: ${createError.message}` 
            : 'Failed to create ingredient: Unknown error');
        }
      }
    } catch (err) {
      console.error('Error in ingredient submission:', err);
      setFormError(
        err instanceof Error 
          ? `Error: ${err.message}` 
          : (currentIngredient.id ? 'Error updating ingredient' : 'Error creating ingredient')
      );
    } finally {
      setLoading(false);
    }
  };

  const handleIngredientDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this ingredient?')) return;
    
    try {
      setLoading(true);
      await ingredientApi.delete(id);
      setIngredients(prev => prev.filter(ing => ing.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete ingredient');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Format date for display
  const formatDisplayDate = (dateString?: string) => {
    if (!dateString) {
      return '-';
    }
    
    try {
      const date = new Date(dateString);
      // Check if date is valid
      if (isNaN(date.getTime())) {
        console.error('Invalid date:', dateString);
        return '-';
      }
      return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
    } catch (error) {
      console.error('Error formatting date:', dateString, error);
      return '-';
    }
  };

  // Helper function to find general ingredient name by ID
  const getGeneralIngredientName = (id?: number): string => {
    if (id === undefined || id === null) return 'Unknown';
    const generalIngredient = generalIngredients.find(gi => gi.id === id);
    return generalIngredient?.name || 'Unknown';
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Ingredients Management</Typography>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
          <Typography variant="body2" sx={{ mt: 1 }}>
            The ingredients API might be experiencing issues. You can still navigate the app, but ingredient functionality might be limited.
          </Typography>
        </Alert>
      )}
      
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="ingredient tabs">
          <Tab label="General Ingredients" />
          <Tab label="Ingredient Inventory" />
        </Tabs>
      </Box>
      
      {loading || authLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {/* General Ingredients Tab */}
          <TabPanel value={tabValue} index={0}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6">General Ingredients</Typography>
              <Button 
                variant="contained" 
                startIcon={<AddIcon />}
                onClick={() => handleOpenGeneralDialog()}
              >
                Add General Ingredient
              </Button>
            </Box>
            
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>Name</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {generalIngredients.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} align="center">
                        No general ingredients found
                      </TableCell>
                    </TableRow>
                  ) : (
                    generalIngredients.map((generalIngredient) => (
                      <TableRow key={generalIngredient.id}>
                        <TableCell>{generalIngredient.id}</TableCell>
                        <TableCell>{generalIngredient.name}</TableCell>
                        <TableCell align="right">
                          <Button
                            size="small"
                            color="primary"
                            startIcon={<AddCircleIcon />}
                            sx={{ mr: 1 }}
                            onClick={() => handleOpenIngredientDialog(generalIngredient.id)}
                          >
                            Add Ingredient
                          </Button>
                          <Button
                            size="small"
                            color="info"
                            onClick={() => generalIngredient.id && fetchIngredientsByGeneralId(generalIngredient.id)}
                            sx={{ mr: 1 }}
                          >
                            View Ingredients
                          </Button>
                          <Button
                            size="small"
                            startIcon={<EditIcon />}
                            sx={{ mr: 1 }}
                            onClick={() => handleOpenGeneralDialog(generalIngredient)}
                          >
                            Edit
                          </Button>
                          <Button
                            size="small"
                            color="error"
                            startIcon={<DeleteIcon />}
                            onClick={() => generalIngredient.id && handleGeneralDelete(generalIngredient.id)}
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
          </TabPanel>
          
          {/* Ingredients Tab */}
          <TabPanel value={tabValue} index={1}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6">
                {selectedGeneralIngredient 
                  ? `Ingredients for ${getGeneralIngredientName(selectedGeneralIngredient)}` 
                  : 'All Ingredients'}
              </Typography>
              <Box>
                {selectedGeneralIngredient && (
                  <Button 
                    variant="outlined" 
                    onClick={() => {
                      setSelectedGeneralIngredient(null);
                      fetchIngredients();
                    }}
                    sx={{ mr: 2 }}
                  >
                    Show All Ingredients
                  </Button>
                )}
                <Button 
                  variant="contained" 
                  startIcon={<AddIcon />}
                  onClick={() => handleOpenIngredientDialog()}
                  disabled={generalIngredients.length === 0}
                >
                  Add Ingredient
                </Button>
              </Box>
            </Box>
            
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>Lot Code</TableCell>
                    <TableCell>General Ingredient</TableCell>
                    <TableCell>Received Date</TableCell>
                    <TableCell>Exp Date</TableCell>
                    <TableCell>Quantity</TableCell>
                    <TableCell>Unit</TableCell>
                    <TableCell>Cost/Unit</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {ingredients.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} align="center">
                        No ingredients found
                      </TableCell>
                    </TableRow>
                  ) : (
                    ingredients.map((ingredient) => (
                      <TableRow key={ingredient.id}>
                        <TableCell>{ingredient.id}</TableCell>
                        <TableCell>{ingredient.lotcode}</TableCell>
                        <TableCell>
                          {ingredient.general_ingredient_name || getGeneralIngredientName(ingredient.general_ingredient_id) || 'Unknown'}
                        </TableCell>
                        <TableCell>{formatDisplayDate(ingredient.date_received)}</TableCell>
                        <TableCell>{formatDisplayDate(ingredient.exp_date)}</TableCell>
                        <TableCell>{ingredient.quantity || 0}</TableCell>
                        <TableCell>{ingredient.unit || '-'}</TableCell>
                        <TableCell>${typeof ingredient.cost_per_unit === 'number' 
                            ? ingredient.cost_per_unit.toFixed(2) 
                            : parseFloat(ingredient.cost_per_unit || '0').toFixed(2)}</TableCell>
                        <TableCell align="right">
                          <Button
                            size="small"
                            startIcon={<EditIcon />}
                            sx={{ mr: 1 }}
                            onClick={() => handleOpenIngredientDialog(undefined, ingredient)}
                          >
                            Edit
                          </Button>
                          <Button
                            size="small"
                            color="error"
                            startIcon={<DeleteIcon />}
                            onClick={() => ingredient.id && handleIngredientDelete(ingredient.id)}
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
          </TabPanel>
        </>
      )}

      {/* Add/Edit General Ingredient Dialog */}
      <Dialog open={openGeneralDialog} onClose={handleCloseGeneralDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {currentGeneralIngredient.id !== undefined ? 'Edit General Ingredient' : 'Add New General Ingredient'}
        </DialogTitle>
        <DialogContent>
          {formError && (
            <Alert severity="error" sx={{ mb: 2, mt: 1 }}>
              {formError}
            </Alert>
          )}
          <Box component="form" sx={{ mt: 1 }}>
            <Stack spacing={2}>
              <TextField
                required
                fullWidth
                id="name"
                label="General Ingredient Name"
                name="name"
                value={currentGeneralIngredient.name}
                onChange={handleGeneralInputChange}
                autoFocus
              />
            </Stack>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseGeneralDialog}>Cancel</Button>
          <Button 
            onClick={handleGeneralSubmit} 
            variant="contained" 
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add/Edit Ingredient Dialog */}
      <Dialog open={openIngredientDialog} onClose={handleCloseIngredientDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {currentIngredient.id !== undefined ? 'Edit Ingredient' : 'Add New Ingredient'}
        </DialogTitle>
        <DialogContent>
          {formError && (
            <Alert severity="error" sx={{ mb: 2, mt: 1 }}>
              {formError}
            </Alert>
          )}
          <Box component="form" sx={{ mt: 1 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required margin="normal">
                  <InputLabel id="general-ingredient-label">General Ingredient</InputLabel>
                  <Select
                    labelId="general-ingredient-label"
                    id="general_ingredient_id"
                    name="general_ingredient_id"
                    value={currentIngredient.general_ingredient_id || ''}
                    onChange={handleSelectChange}
                    label="General Ingredient"
                  >
                    {generalIngredients.map((gi) => (
                      <MenuItem key={gi.id} value={gi.id}>
                        {gi.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  margin="normal"
                  id="lotcode"
                  label="Lot Code"
                  name="lotcode"
                  value={currentIngredient.lotcode}
                  onChange={handleIngredientInputChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  margin="normal"
                  id="date_received"
                  label="Received Date"
                  name="date_received"
                  type="date"
                  value={currentIngredient.date_received}
                  onChange={handleIngredientInputChange}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  margin="normal"
                  id="exp_date"
                  label="Expiration Date"
                  name="exp_date"
                  type="date"
                  value={currentIngredient.exp_date}
                  onChange={handleIngredientInputChange}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  required
                  fullWidth
                  margin="normal"
                  id="quantity"
                  label="Quantity"
                  name="quantity"
                  type="number"
                  value={currentIngredient.quantity}
                  onChange={handleIngredientNumberInputChange}
                  inputProps={{ min: 0, step: 0.01 }}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth margin="normal">
                  <InputLabel id="unit-label">Unit</InputLabel>
                  <Select
                    labelId="unit-label"
                    id="unit"
                    name="unit"
                    value={currentIngredient.unit}
                    onChange={handleSelectChange}
                    label="Unit"
                  >
                    <MenuItem value="kg">Kilogram (kg)</MenuItem>
                    <MenuItem value="g">Gram (g)</MenuItem>
                    <MenuItem value="lb">Pound (lb)</MenuItem>
                    <MenuItem value="oz">Ounce (oz)</MenuItem>
                    <MenuItem value="l">Liter (l)</MenuItem>
                    <MenuItem value="ml">Milliliter (ml)</MenuItem>
                    <MenuItem value="gal">Gallon (gal)</MenuItem>
                    <MenuItem value="qt">Quart (qt)</MenuItem>
                    <MenuItem value="pt">Pint (pt)</MenuItem>
                    <MenuItem value="fl oz">Fluid Ounce (fl oz)</MenuItem>
                    <MenuItem value="ea">Each (ea)</MenuItem>
                    <MenuItem value="cs">Case (cs)</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  required
                  fullWidth
                  margin="normal"
                  id="cost_per_unit"
                  label="Cost per Unit"
                  name="cost_per_unit"
                  type="number"
                  value={currentIngredient.cost_per_unit}
                  onChange={handleIngredientNumberInputChange}
                  inputProps={{ min: 0, step: 0.01 }}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseIngredientDialog}>Cancel</Button>
          <Button 
            onClick={handleIngredientSubmit} 
            variant="contained" 
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Ingredients;