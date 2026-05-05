import React, { useMemo } from 'react';
import {
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Paper,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Chip
} from '@mui/material';
import { AuditLog } from '../../types';

interface EntityChangeDialogProps {
  open: boolean;
  onClose: () => void;
  auditLog: AuditLog;
}

// Compare two objects and find differences
const findDifferences = (oldState: any, newState: any): Array<{ key: string, oldValue: any, newValue: any }> => {
  const differences: Array<{ key: string, oldValue: any, newValue: any }> = [];

  // Create a set of all keys from both objects
  const allKeys = new Set([
    ...Object.keys(oldState || {}),
    ...Object.keys(newState || {})
  ]);

  // Check each key for differences
  allKeys.forEach(key => {
    const oldValue = oldState?.[key];
    const newValue = newState?.[key];

    // If values are different, add to differences array
    if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
      differences.push({
        key,
        oldValue,
        newValue
      });
    }
  });

  return differences;
};

// Format values for display
const formatValue = (value: any): string => {
  if (value === undefined || value === null) {
    return 'null';
  }
  
  if (typeof value === 'object') {
    return JSON.stringify(value);
  }
  
  return String(value);
};

const EntityChangeDialog: React.FC<EntityChangeDialogProps> = ({ open, onClose, auditLog }) => {
  // Calculate differences between previous and new state
  const differences = useMemo(() => {
    if (!auditLog || !auditLog.previous_state) return [];
    return findDifferences(auditLog.previous_state, auditLog.new_state);
  }, [auditLog]);

  // Format timestamp
  const formatTimestamp = (timestamp?: string): string => {
    if (!timestamp) return 'N/A';
    try {
      const date = new Date(timestamp);
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    } catch (error) {
      return timestamp;
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        Change Comparison
      </DialogTitle>
      <DialogContent dividers>
        <Box>
          <Typography variant="subtitle1" gutterBottom>
            {auditLog.entity_type.charAt(0).toUpperCase() + auditLog.entity_type.slice(1)} #{auditLog.entity_id}
            <Typography variant="caption" component="span" sx={{ ml: 2 }}>
              {formatTimestamp(auditLog.created_at)}
            </Typography>
          </Typography>

          {differences.length === 0 ? (
            <Typography variant="body1" color="text.secondary" sx={{ py: 2 }}>
              No structural changes detected.
            </Typography>
          ) : (
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Field</TableCell>
                  <TableCell>Previous Value</TableCell>
                  <TableCell>New Value</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {differences.map((diff, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        {diff.key}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={formatValue(diff.oldValue)} 
                        color="error"
                        variant="outlined"
                        size="small"
                        sx={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis' }}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={formatValue(diff.newValue)} 
                        color="success"
                        variant="outlined"
                        size="small"
                        sx={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis' }}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default EntityChangeDialog;