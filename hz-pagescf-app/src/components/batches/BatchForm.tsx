import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Grid,
  Alert,
  Box,
  Typography,
  Divider,
  CircularProgress,
  SelectChangeEvent,
  IconButton
} from '@mui/material';
import { Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';
import { Batch, Recipe, Ingredient, Organization } from '../../types';

// Helper function to format date as YYYY-MM-DD
const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

interface BatchFormProps {
  open: boolean;
  onClose: () => void;
  onSave: (batch: Batch) => void;
  batch: Batch | null;
  recipes: Recipe[];
  ingredients: Ingredient[];
  organization: Organization | null;
}

const BatchForm: React.FC<BatchFormProps> = ({
  open,
  onClose,
  onSave,
  batch,
  recipes,
  ingredients,
  organization
}) => {
  const [formState, setFormState] = useState<Batch>({
    id: undefined,
    org_id: organization?.id as number || 0,
    employee: '',
    recipecode: '',
    batch_lot_code: '',
    ingredient_lotcodes: [],
    amount_ingredients: [],
    date_made: formatDate(new Date()),
    amount_made: ''
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [batchIngredients, setBatchIngredients] = useState<Array<{ id: number, amount: number }>>([]);

  useEffect(() => {
    if (batch) {
      setFormState(batch);
      
      // Set up batch ingredients with amounts
      const ingredientPairs = batch.ingredient_lotcodes.map((lotcode, index) => {
        // Find the ingredient ID by lotcode
        const ingredient = ingredients.find(i => i.lotcode === lotcode);
        return {
          id: ingredient?.id || 0,
          amount: batch.amount_ingredients[index]
        };
      });
      setBatchIngredients(ingredientPairs);
      
      // Find and set the selected recipe
      const recipe = recipes.find(r => r.recipecode === batch.recipecode);
      if (recipe) {
        setSelectedRecipe(recipe);
      }
    } else {
      // Reset form for new batch
      setFormState({
        id: undefined,
        org_id: organization?.id as number || 0,
        employee: '',
        recipecode: '',
        batch_lot_code: '',
        ingredient_lotcodes: [],
        amount_ingredients: [],
        date_made: formatDate(new Date()),
        amount_made: ''
      });
      setBatchIngredients([]);
      setSelectedRecipe(null);
    }
  }, [batch, organization, recipes, ingredients]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormState(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleRecipeChange = (e: SelectChangeEvent<string>) => {
    const recipecode = e.target.value;
    const recipe = recipes.find(r => r.recipecode === recipecode);
    
    setFormState(prev => ({
      ...prev,
      recipecode: recipecode,
    }));
    
    setSelectedRecipe(recipe || null);
    
    // Clear error for this field
    if (errors.recipecode) {
      setErrors(prev => ({ ...prev, recipecode: '' }));
    }
  };

  const handleAddIngredient = () => {
    setBatchIngredients(prev => [...prev, { id: 0, amount: 0 }]);
  };

  const handleRemoveIngredient = (index: number) => {
    setBatchIngredients(prev => prev.filter((_, i) => i !== index));
  };

  const handleIngredientChange = (index: number, field: 'id' | 'amount', value: number) => {
    setBatchIngredients(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};
    
    if (!formState.employee.trim()) {
      newErrors.employee = 'Employee name is required';
    }
    
    if (!formState.recipecode) {
      newErrors.recipecode = 'Recipe is required';
    }
    
    if (!formState.batch_lot_code.trim()) {
      newErrors.batch_lot_code = 'Batch Lot Code is required';
    }
    
    if (!formState.date_made) {
      newErrors.date_made = 'Date is required';
    }
    
    if (!formState.amount_made.trim()) {
      newErrors.amount_made = 'Amount made is required';
    }
    
    if (batchIngredients.length === 0) {
      newErrors.ingredients = 'At least one ingredient is required';
    } else {
      // Check if all ingredients are selected and amounts are greater than 0
      const hasInvalidIngredient = batchIngredients.some(ing => ing.id === 0 || ing.amount <= 0);
      if (hasInvalidIngredient) {
        newErrors.ingredients = 'All ingredients must be selected and have amount greater than 0';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;
    
    setLoading(true);
    
    // Map ingredient IDs to lotcodes and extract amounts
    const lotcodes = batchIngredients.map(ing => {
      const ingredient = ingredients.find(i => i.id === ing.id);
      return ingredient ? ingredient.lotcode : '';
    });
    const ingredientAmounts = batchIngredients.map(ing => ing.amount);
    
    // Prepare the batch object
    const batchToSave: Batch = {
      ...formState,
      ingredient_lotcodes: lotcodes,
      amount_ingredients: ingredientAmounts,
      org_id: organization?.id as number || formState.org_id
    };
    
    // Call the parent's onSave function
    onSave(batchToSave);
    
    // Note: We don't reset the form or close the dialog here
    // because the parent component will do that after the save completes
  };

  // Get ingredient name by ID
  const getIngredientName = (id: number): string => {
    const ingredient = ingredients.find(i => i.id === id);
    return ingredient ? (ingredient.general_ingredient_name || `Ingredient #${id}`) : 'Unknown';
  };

  // Filter out ingredients that are already selected (except the current one)
  const getAvailableIngredients = (currentIndex: number): Ingredient[] => {
    const selectedIds = batchIngredients
      .filter((_, index) => index !== currentIndex)
      .map(ing => ing.id);
    
    return ingredients.filter(ing => !selectedIds.includes(ing.id as number));
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {formState.id ? 'Edit Batch' : 'Create New Batch'}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                required
                fullWidth
                label="Employee Name"
                name="employee"
                value={formState.employee}
                onChange={handleInputChange}
                error={!!errors.employee}
                helperText={errors.employee}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                required
                fullWidth
                label="Batch Lot Code"
                name="batch_lot_code"
                value={formState.batch_lot_code}
                onChange={handleInputChange}
                error={!!errors.batch_lot_code}
                helperText={errors.batch_lot_code}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required error={!!errors.recipecode}>
                <InputLabel>Recipe</InputLabel>
                <Select
                  value={formState.recipecode}
                  onChange={handleRecipeChange}
                  label="Recipe"
                >
                  <MenuItem value="">
                    <em>Select a Recipe</em>
                  </MenuItem>
                  {recipes.map(recipe => (
                    <MenuItem key={recipe.id} value={recipe.recipecode}>
                      {recipe.name} ({recipe.recipecode})
                    </MenuItem>
                  ))}
                </Select>
                {errors.recipecode && (
                  <FormHelperText>{errors.recipecode}</FormHelperText>
                )}
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                type="date"
                required
                fullWidth
                label="Date Made"
                name="date_made"
                value={formState.date_made}
                onChange={handleInputChange}
                InputLabelProps={{
                  shrink: true,
                }}
                error={!!errors.date_made}
                helperText={errors.date_made}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                label="Amount Made"
                name="amount_made"
                value={formState.amount_made}
                onChange={handleInputChange}
                placeholder="e.g. 10kg, 5 liters, 20 units"
                error={!!errors.amount_made}
                helperText={errors.amount_made}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Ingredients</Typography>
                <Button 
                  startIcon={<AddIcon />} 
                  onClick={handleAddIngredient}
                  variant="outlined"
                  size="small"
                >
                  Add Ingredient
                </Button>
              </Box>
              
              {errors.ingredients && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {errors.ingredients}
                </Alert>
              )}
              
              {batchIngredients.length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ my: 2 }}>
                  No ingredients added. Select a recipe or add ingredients manually.
                </Typography>
              ) : (
                batchIngredients.map((ingredient, index) => (
                  <Box key={index} sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center' }}>
                    <FormControl sx={{ flex: 2 }} required>
                      <InputLabel>Ingredient</InputLabel>
                      <Select
                        value={ingredient.id || ''}
                        onChange={(e) => handleIngredientChange(index, 'id', Number(e.target.value))}
                        label="Ingredient"
                      >
                        <MenuItem value={0}>
                          <em>Select an Ingredient</em>
                        </MenuItem>
                        {getAvailableIngredients(index).map(ing => (
                          <MenuItem key={ing.id} value={ing.id as number}>
                            {ing.general_ingredient_name || `Ingredient #${ing.id}`} ({ing.lotcode})
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    
                    <TextField
                      sx={{ flex: 1 }}
                      label="Amount"
                      type="number"
                      value={ingredient.amount || ''}
                      onChange={(e) => handleIngredientChange(index, 'amount', Number(e.target.value))}
                      InputProps={{ inputProps: { min: 0 } }}
                    />
                    
                    <IconButton 
                      color="error" 
                      onClick={() => handleRemoveIngredient(index)}
                      sx={{ mt: 1 }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                ))
              )}
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button 
          variant="contained" 
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default BatchForm;