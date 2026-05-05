import React from 'react';
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
import { Edit as EditIcon } from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';

const Organizations: React.FC = () => {
  // Get authentication state from context
  const { loading, error: authError, user, orgId } = useAuth();
  
  // Create a mock organization object from the user and orgId
  const organization = user ? {
    id: orgId,
    name: user.name,
    email: user.email
  } : null;

  // Local error state in case we need to display component-specific errors
  const [error] = React.useState<string | null>(authError);

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Your Organization</Typography>
        {organization && (
          <Button
            variant="contained"
            startIcon={<EditIcon />}
          >
            Edit Organization
          </Button>
        )}
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {!organization ? (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    No organization information available
                  </TableCell>
                </TableRow>
              ) : (
                <TableRow>
                  <TableCell>{organization.id}</TableCell>
                  <TableCell>{organization.name}</TableCell>
                  <TableCell>{organization.email}</TableCell>
                  <TableCell align="right">
                    <Button
                      size="small"
                      startIcon={<EditIcon />}
                      sx={{ mr: 1 }}
                    >
                      Edit
                    </Button>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default Organizations;