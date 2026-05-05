import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  OutlinedInput,
  SelectChangeEvent,
  ListItemText,
  Checkbox
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { recipeApi, ingredientApi } from '../../services';
import { Recipe, Ingredient, RecipeStep } from '../../types';
import { useAuth } from '../../context/AuthContext';

// Helper function to format date as YYYY-MM-DD
const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

const initialRecipeState: Recipe = {
  id: undefined,
  recipecode: '',
  name: '',
  date_made: formatDate(new Date()),
  org_id: 0,
  general_ingredient_ids: [],
  steps: []
};

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

const Recipes: React.FC = () => {
  const navigate = useNavigate();
  const { orgId, loading: authLoading } = useAuth();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentRecipe, setCurrentRecipe] = useState<Recipe>(initialRecipeState);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    fetchRecipes();
    fetchIngredients();
  }, []);

  // Set org_id when organization is available
  useEffect(() => {
    if (orgId) {
      setCurrentRecipe(prev => ({
        ...prev,
        org_id: orgId
      }));
    }
  }, [orgId]);

  const fetchRecipes = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const fetchedRecipes = await recipeApi.getAll();
      setRecipes(fetchedRecipes);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch recipes');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchIngredients = async () => {
    try {
      const fetchedIngredients = await ingredientApi.getAll();
      setIngredients(fetchedIngredients);
    } catch (err) {
      console.error('Failed to fetch ingredients:', err);
    }
  };

  const handleOpenDialog = (recipe?: Recipe) => {
    if (recipe) {
      // Edit mode
      setCurrentRecipe({
        id: recipe.id,
        recipecode: recipe.recipecode,
        name: recipe.name,
        date_made: recipe.date_made,
        org_id: recipe.org_id,
        general_ingredient_ids: recipe.general_ingredient_ids,
        steps: recipe.steps
      });
    } else {
      // Create mode
      setCurrentRecipe({
        id: undefined,
        recipecode: '',
        name: '',
        date_made: formatDate(new Date()),
        org_id: orgId || 0,
        general_ingredient_ids: [],
        steps: []
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setFormError(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCurrentRecipe(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setCurrentRecipe(prev => ({
      ...prev,
      date_made: value
    }));
  };

  const handleGeneralIngredientsChange = (event: SelectChangeEvent<number[]>) => {
    const {
      target: { value },
    } = event;
    
    setCurrentRecipe(prev => ({
      ...prev,
      general_ingredient_ids: typeof value === 'string' ? [] : value as number[]
    }));
  };

  // Handle adding a recipe step
  const handleAddStep = () => {
    setCurrentRecipe(prev => ({
      ...prev,
      steps: [...prev.steps, { step_number: prev.steps.length + 1, instructions: '' }]
    }));
  };

  // Handle removing a recipe step
  const handleRemoveStep = (index: number) => {
    setCurrentRecipe(prev => {
      const newSteps = prev.steps.filter((_, i) => i !== index)
        .map((step, i) => ({ ...step, step_number: i + 1 })); // Re-number steps
      return { ...prev, steps: newSteps };
    });
  };

  // Handle step instruction changes
  const handleStepChange = (index: number, value: string) => {
    setCurrentRecipe(prev => {
      const newSteps = [...prev.steps];
      newSteps[index] = { ...newSteps[index], instructions: value };
      return { ...prev, steps: newSteps };
    });
  };

  const validateForm = (): boolean => {
    if (!currentRecipe.recipecode.trim()) {
      setFormError('Recipe Code is required');
      return false;
    }
    if (!currentRecipe.name.trim()) {
      setFormError('Name is required');
      return false;
    }
    if (!currentRecipe.date_made) {
      setFormError('Date is required');
      return false;
    }
    if (currentRecipe.steps.length === 0) {
      setFormError('At least one recipe step is required');
      return false;
    }
    // Check if all steps have instructions
    const emptySteps = currentRecipe.steps.some(step => !step.instructions.trim());
    if (emptySteps) {
      setFormError('All recipe steps must have instructions');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    try {
      setLoading(true);
      
      if (currentRecipe.id) {
        // Update existing recipe
        const updatedRecipe = await recipeApi.update(currentRecipe);
        setRecipes(prev => prev.map(recipe => recipe.id === updatedRecipe.id ? updatedRecipe : recipe));
        handleCloseDialog();
      } else {
        // Create new recipe
        const newRecipe = await recipeApi.create(currentRecipe);
        setRecipes(prev => [...prev, newRecipe]);
        handleCloseDialog();
      }
    } catch (err) {
      setFormError(err instanceof Error ? err.message : (currentRecipe.id ? 'Error updating recipe' : 'Error creating recipe'));
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this recipe?')) return;
    
    try {
      setLoading(true);
      await recipeApi.delete(id);
      setRecipes(prev => prev.filter(recipe => recipe.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete recipe');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Format date for display
  const formatDisplayDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
    } catch (error) {
      console.error('Invalid date format:', dateString);
      return dateString;
    }
  };

  // Get general ingredient names for display
  const getGeneralIngredientNames = (generalIngredientIds: number[]): string => {
    return generalIngredientIds
      .map(id => {
        const ingredient = ingredients.find(i => i.general_ingredient_id === id);
        return ingredient ? (ingredient.general_ingredient_name || `General Ingredient #${id}`) : '';
      })
      .filter(name => name) // Filter out empty names
      .join(', ');
  };
  
  // Format recipe steps for display in the table
  const formatStepsForDisplay = (steps: RecipeStep[]): string => {
    if (!steps || steps.length === 0) return 'No steps provided';
    
    if (steps.length === 1) {
      return steps[0].instructions;
    }
    
    return `${steps.length} steps: ${steps[0].instructions.substring(0, 30)}${steps[0].instructions.length > 30 ? '...' : ''}`;
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Recipes</Typography>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add Recipe
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
                <TableCell>ID</TableCell>
                <TableCell>Recipe Code</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>General Ingredients</TableCell>
                <TableCell>Steps</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {recipes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    No recipes found
                  </TableCell>
                </TableRow>
              ) : (
                recipes.map((recipe) => (
                  <TableRow key={recipe.id}>
                    <TableCell>{recipe.id}</TableCell>
                    <TableCell>{recipe.recipecode}</TableCell>
                    <TableCell>{recipe.name}</TableCell>
                    <TableCell>{formatDisplayDate(recipe.date_made)}</TableCell>
                    <TableCell>{getGeneralIngredientNames(recipe.general_ingredient_ids)}</TableCell>
                    <TableCell>{formatStepsForDisplay(recipe.steps)}</TableCell>
                    <TableCell align="right">
                      <Button
                        size="small"
                        color="info"
                        sx={{ mr: 1 }}
                        onClick={() => recipe.id && navigate(`/recipes/${recipe.id}`)}
                      >
                        View
                      </Button>
                      <Button
                        size="small"
                        startIcon={<EditIcon />}
                        sx={{ mr: 1 }}
                        onClick={() => handleOpenDialog(recipe)}
                      >
                        Edit
                      </Button>
                      <Button
                        size="small"
                        color="error"
                        startIcon={<DeleteIcon />}
                        onClick={() => recipe.id && handleDelete(recipe.id)}
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
      )}

      {/* Add/Edit Recipe Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {currentRecipe.id !== undefined ? 'Edit Recipe' : 'Add New Recipe'}
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
                id="recipecode"
                label="Recipe Code"
                name="recipecode"
                value={currentRecipe.recipecode}
                onChange={handleInputChange}
                autoFocus
              />
              
              <TextField
                required
                fullWidth
                id="name"
                label="Recipe Name"
                name="name"
                value={currentRecipe.name}
                onChange={handleInputChange}
              />
              
              <TextField
                type="date"
                required
                fullWidth
                id="date_made"
                label="Date"
                name="date_made"
                value={currentRecipe.date_made}
                onChange={handleDateChange}
                InputLabelProps={{
                  shrink: true,
                }}
              />

              <FormControl fullWidth>
                <InputLabel id="general-ingredients-label">General Ingredients</InputLabel>
                <Select
                  labelId="general-ingredients-label"
                  id="general_ingredient_ids"
                  multiple
                  value={currentRecipe.general_ingredient_ids}
                  onChange={handleGeneralIngredientsChange}
                  input={<OutlinedInput label="General Ingredients" />}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => {
                        const ingredient = ingredients.find(i => i.general_ingredient_id === value);
                        return ingredient ? (
                          <Chip key={value} label={ingredient.general_ingredient_name || `General Ingredient #${value}`} />
                        ) : null;
                      })}
                    </Box>
                  )}
                  MenuProps={MenuProps}
                >
                  {/* Group ingredients by general_ingredient_id to avoid duplicates */}
                  {Array.from(new Set(ingredients.map(i => i.general_ingredient_id)))
                    .map(generalId => {
                      const ingredient = ingredients.find(i => i.general_ingredient_id === generalId);
                      return ingredient ? (
                        <MenuItem key={generalId} value={generalId}>
                          <Checkbox checked={currentRecipe.general_ingredient_ids.indexOf(generalId) > -1} />
                          <ListItemText primary={ingredient.general_ingredient_name || `General Ingredient #${generalId}`} />
                        </MenuItem>
                      ) : null;
                    })}
                </Select>
              </FormControl>
              
              <Box sx={{ width: '100%' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="subtitle1">Recipe Steps</Typography>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<AddIcon />}
                    onClick={handleAddStep}
                  >
                    Add Step
                  </Button>
                </Box>
                
                {currentRecipe.steps.length === 0 ? (
                  <Typography variant="body2" color="text.secondary" sx={{ my: 2 }}>
                    No steps added yet. Click "Add Step" to add a recipe step.
                  </Typography>
                ) : (
                  currentRecipe.steps.map((step, index) => (
                    <Box key={index} sx={{ display: 'flex', mb: 2, gap: 1, alignItems: 'flex-start' }}>
                      <Box sx={{
                        minWidth: '30px',
                        height: '30px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: '50%',
                        backgroundColor: 'primary.main',
                        color: 'white',
                        fontWeight: 'bold',
                        mt: 2
                      }}>
                        {step.step_number}
                      </Box>
                      <TextField
                        fullWidth
                        label={`Step ${step.step_number} Instructions`}
                        multiline
                        rows={2}
                        value={step.instructions}
                        onChange={(e) => handleStepChange(index, e.target.value)}
                      />
                      <Button
                        color="error"
                        onClick={() => handleRemoveStep(index)}
                        sx={{ mt: 2 }}
                      >
                        <DeleteIcon />
                      </Button>
                    </Box>
                  ))
                )}
              </Box>
            </Stack>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button 
            onClick={handleSubmit} 
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

export default Recipes;