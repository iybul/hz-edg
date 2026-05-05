import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Divider,
  Button,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
  Chip
} from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { batchApi, recipeApi, ingredientApi } from '../../services';
import { Batch, Recipe, Ingredient } from '../../types';

const BatchDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [batch, setBatch] = useState<Batch | null>(null);
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchBatch(parseInt(id, 10));
      fetchIngredients();
    }
  }, [id]);

  // Fetch the recipe once we have the batch
  useEffect(() => {
    if (batch && batch.recipecode) {
      fetchRecipe(batch.recipecode);
    }
  }, [batch]);

  const fetchBatch = async (batchId: number) => {
    setLoading(true);
    setError(null);

    try {
      const fetchedBatch = await batchApi.getById(batchId);
      setBatch(fetchedBatch);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch batch details');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecipe = async (recipecode: string) => {
    try {
      const recipes = await recipeApi.getAll();
      const foundRecipe = recipes.find(r => r.recipecode === recipecode);
      if (foundRecipe) {
        setRecipe(foundRecipe);
      }
    } catch (err) {
      console.error('Failed to fetch recipe:', err);
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

  // Get ingredient information (name and amount)
  const getIngredientInfo = () => {
    if (!batch || !batch.ingredient_lotcodes || batch.ingredient_lotcodes.length === 0) {
      return [];
    }

    return batch.ingredient_lotcodes.map((lotcode, index) => {
      const ingredient = ingredients.find(i => i.lotcode === lotcode);
      const amount = batch.amount_ingredients[index];
      
      return {
        lotcode,
        name: ingredient ? (ingredient.general_ingredient_name || `Ingredient ${lotcode}`) : `Ingredient ${lotcode}`,
        amount,
        generalIngredientId: ingredient ? ingredient.general_ingredient_id : null
      };
    });
  };

  const handleBack = () => {
    navigate('/batches');
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
          Back to Batches
        </Button>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (!batch) {
    return (
      <Box>
        <Button startIcon={<ArrowBackIcon />} onClick={handleBack} sx={{ mb: 2 }}>
          Back to Batches
        </Button>
        <Alert severity="warning">Batch not found</Alert>
      </Box>
    );
  }

  const ingredientItems = getIngredientInfo();

  return (
    <Box>
      <Button startIcon={<ArrowBackIcon />} onClick={handleBack} sx={{ mb: 2 }}>
        Back to Batches
      </Button>
      
      <Paper sx={{ p: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography variant="h4" gutterBottom>
              Batch: {batch.batch_lot_code}
            </Typography>
            
            <Box sx={{ mb: 3, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Chip label={`Made by: ${batch.employee}`} />
              <Chip label={`Date: ${formatDisplayDate(batch.date_made)}`} color="primary" />
              <Chip label={`Amount: ${batch.amount_made}`} />
              <Chip 
                label={recipe ? `Recipe: ${recipe.name} (${recipe.recipecode})` : `Recipe: ${batch.recipecode}`} 
                color="secondary" 
              />
            </Box>
          </Grid>
          
          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6" gutterBottom>
              Ingredients Used
            </Typography>
            
            {ingredientItems.length === 0 ? (
              <Typography variant="body1">No ingredients recorded for this batch</Typography>
            ) : (
              <List>
                {ingredientItems.map((item) => (
                  <ListItem key={item.lotcode} divider>
                    <ListItemText
                      primary={
                        <Typography variant="subtitle1">
                          {item.name} <Chip size="small" label={`Lot: ${item.lotcode}`} />
                        </Typography>
                      }
                      secondary={
                        <Typography variant="body2" color="text.secondary">
                          Amount used: {item.amount}
                        </Typography>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </Grid>
          
          {recipe && (
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>
                Recipe Details
              </Typography>
              {recipe.steps.length > 0 ? (
                <Box component="ol" sx={{ pl: 3 }}>
                  {recipe.steps.map((step) => (
                    <Box component="li" key={step.id} sx={{ mb: 2 }}>
                      <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
                        {step.instructions}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              ) : (
                <Typography variant="body1" sx={{ mb: 1 }}>
                  No steps provided for this recipe.
                </Typography>
              )}
              <Typography variant="body2" color="text.secondary">
                Recipe Date: {formatDisplayDate(recipe.date_made)}
              </Typography>
            </Grid>
          )}
        </Grid>
      </Paper>
    </Box>
  );
};

export default BatchDetail;