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
  Alert
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, Visibility as VisibilityIcon } from '@mui/icons-material';
import { batchApi, recipeApi, ingredientApi } from '../../services';
import { Batch, Recipe, Ingredient } from '../../types';
import { useAuth } from '../../context/AuthContext';
import BatchForm from './BatchForm';

// Helper function to format date as MM/DD/YYYY
const formatDisplayDate = (dateString: string) => {
  try {
    const date = new Date(dateString);
    return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
  } catch (error) {
    console.error('Invalid date format:', dateString);
    return dateString;
  }
};

const Batches: React.FC = () => {
  const navigate = useNavigate();
  const { orgId, loading: authLoading } = useAuth();
  const [batches, setBatches] = useState<Batch[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentBatch, setCurrentBatch] = useState<Batch | null>(null);

  useEffect(() => {
    fetchBatches();
    fetchRecipes();
    fetchIngredients();
  }, []);

  const fetchBatches = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const fetchedBatches = await batchApi.getAll();
      setBatches(fetchedBatches);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch batches');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecipes = async () => {
    try {
      const fetchedRecipes = await recipeApi.getAll();
      setRecipes(fetchedRecipes);
    } catch (err) {
      console.error('Failed to fetch recipes:', err);
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

  const handleOpenDialog = (batch?: Batch) => {
    if (batch) {
      setCurrentBatch(batch);
    } else {
      // Create a new empty batch
      setCurrentBatch(null);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleSaveBatch = async (batch: Batch) => {
    setLoading(true);
    
    try {
      if (batch.id) {
        // Update existing batch
        const updatedBatch = await batchApi.update(batch);
        setBatches(prev => prev.map(b => b.id === batch.id ? updatedBatch : b));
      } else {
        // Create new batch
        const newBatch = await batchApi.create(batch);
        setBatches(prev => [...prev, newBatch]);
      }
      
      setOpenDialog(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save batch');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this batch?')) return;
    
    setLoading(true);
    
    try {
      await batchApi.delete(id);
      setBatches(prev => prev.filter(batch => batch.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete batch');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Get recipe name by recipecode
  const getRecipeName = (recipecode: string): string => {
    const recipe = recipes.find(r => r.recipecode === recipecode);
    return recipe ? recipe.name : recipecode;
  };

  // Get ingredient names for display
  const getIngredientInfo = (batch: Batch): string => {
    if (!batch.ingredient_lotcodes || !batch.amount_ingredients) return 'No ingredients';
    
    return batch.ingredient_lotcodes
      .map((lotcode, index) => {
        const ingredient = ingredients.find(i => i.lotcode === lotcode);
        const amount = batch.amount_ingredients[index];
        return ingredient ? 
          `${ingredient.general_ingredient_name || `Ingredient ${lotcode}`} (${amount})` : 
          `${lotcode} (${amount})`;
      })
      .filter(name => name)
      .join(', ');
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Production Batches</Typography>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Create Batch
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
                <TableCell>Batch Lot Code</TableCell>
                <TableCell>Recipe</TableCell>
                <TableCell>Date Made</TableCell>
                <TableCell>Employee</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Ingredients Used</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {batches.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    No batches found
                  </TableCell>
                </TableRow>
              ) : (
                batches.map((batch) => (
                  <TableRow key={batch.id}>
                    <TableCell>{batch.batch_lot_code}</TableCell>
                    <TableCell>{getRecipeName(batch.recipecode)}</TableCell>
                    <TableCell>{formatDisplayDate(batch.date_made)}</TableCell>
                    <TableCell>{batch.employee}</TableCell>
                    <TableCell>{batch.amount_made}</TableCell>
                    <TableCell>{getIngredientInfo(batch)}</TableCell>
                    <TableCell align="right">
                      <Button
                        size="small"
                        color="info"
                        startIcon={<VisibilityIcon />}
                        sx={{ mr: 1 }}
                        onClick={() => batch.id && navigate(`/batches/${batch.id}`)}
                      >
                        View
                      </Button>
                      <Button
                        size="small"
                        startIcon={<EditIcon />}
                        sx={{ mr: 1 }}
                        onClick={() => handleOpenDialog(batch)}
                      >
                        Edit
                      </Button>
                      <Button
                        size="small"
                        color="error"
                        startIcon={<DeleteIcon />}
                        onClick={() => batch.id && handleDelete(batch.id)}
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

      {/* Form Dialog */}
      {openDialog && (
        <BatchForm
          open={openDialog}
          onClose={handleCloseDialog}
          onSave={handleSaveBatch}
          batch={currentBatch}
          recipes={recipes}
          ingredients={ingredients}
          organization={{ id: orgId || 0, name: "Current Organization", email: "" }}
        />
      )}
    </Box>
  );
};

export default Batches;