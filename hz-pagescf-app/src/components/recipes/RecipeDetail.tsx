import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Grid,
  List,
  ListItem,
  ListItemText,
  Divider,
  Button,
  CircularProgress,
  Alert,
  Chip
} from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { recipeApi, ingredientApi } from '../../services';
import { Recipe, Ingredient } from '../../types';

const RecipeDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchRecipe(parseInt(id, 10));
      fetchIngredients();
    }
  }, [id]);

  const fetchRecipe = async (recipeId: number) => {
    setLoading(true);
    setError(null);

    try {
      const fetchedRecipe = await recipeApi.getById(recipeId);
      setRecipe(fetchedRecipe);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch recipe details');
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

  // Get recipe general ingredients
  const getRecipeGeneralIngredients = (): Ingredient[] => {
    if (!recipe || !recipe.general_ingredient_ids) return [];
    
    // For each general ingredient ID, find matching ingredients
    const matchingIngredients: Ingredient[] = [];
    
    recipe.general_ingredient_ids.forEach(generalId => {
      const matches = ingredients.filter(ingredient => 
        ingredient.general_ingredient_id === generalId
      );
      matchingIngredients.push(...matches);
    });
    
    return matchingIngredients;
  };

  const handleBack = () => {
    navigate('/recipes');
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box>
        <Button startIcon={<ArrowBackIcon />} onClick={handleBack} sx={{ mb: 2 }}>
          Back to Recipes
        </Button>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (!recipe) {
    return (
      <Box>
        <Button startIcon={<ArrowBackIcon />} onClick={handleBack} sx={{ mb: 2 }}>
          Back to Recipes
        </Button>
        <Alert severity="warning">Recipe not found</Alert>
      </Box>
    );
  }

  const recipeIngredients = getRecipeGeneralIngredients();

  return (
    <Box>
      <Button startIcon={<ArrowBackIcon />} onClick={handleBack} sx={{ mb: 2 }}>
        Back to Recipes
      </Button>
      
      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          {recipe.name}
        </Typography>
        
        <Box sx={{ mb: 3 }}>
          <Chip label={`Recipe Code: ${recipe.recipecode}`} sx={{ mr: 1 }} />
          <Chip label={`Created: ${formatDisplayDate(recipe.date_made)}`} color="primary" />
        </Box>
        
        <Divider sx={{ my: 2 }} />
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              Recipe Steps
            </Typography>
            {recipe.steps.length === 0 ? (
              <Typography variant="body1">No steps provided for this recipe</Typography>
            ) : (
              <Box component="ol" sx={{ pl: 3 }}>
                {recipe.steps.map((step) => (
                  <Box component="li" key={step.id} sx={{ mb: 2 }}>
                    <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
                      {step.instructions}
                    </Typography>
                  </Box>
                ))}
              </Box>
            )}
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              Ingredients
            </Typography>
            
            {recipeIngredients.length === 0 ? (
              <Typography variant="body1">No ingredients found</Typography>
            ) : (
              <List>
                {recipeIngredients.map((ingredient) => (
                  <React.Fragment key={ingredient.id}>
                    <ListItem>
                      <ListItemText
                        primary={ingredient.general_ingredient_name || `Ingredient #${ingredient.id}`}
                        secondary={`Lot Code: ${ingredient.lotcode} | Received: ${formatDisplayDate(ingredient.date_received)} | Expires: ${formatDisplayDate(ingredient.exp_date)}`}
                      />
                    </ListItem>
                    <Divider component="li" />
                  </React.Fragment>
                ))}
              </List>
            )}
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default RecipeDetail;