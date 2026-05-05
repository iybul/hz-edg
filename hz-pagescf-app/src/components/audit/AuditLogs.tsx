import React, { useState, useEffect, useCallback } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  Button,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
  Chip,
  Tooltip,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import { 
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
  Visibility as VisibilityIcon,
  Compare as CompareIcon,
  Clear as ClearIcon,
  Help as HelpIcon,
  LabelImportant as LabelIcon,
  Info as InfoIcon,
  FilterList as FilterIcon,
  Dvr as EntityIcon,
  Numbers as NumberIcon,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { auditApi } from '../../services';
import { AuditLog, AuditLogFilter } from '../../types';
import { ReactJsonView } from './ReactJsonView';
import EntityChangeDialog from './EntityChangeDialog';

// Helper to format timestamps
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

// Action type badge color mapping
const getActionColor = (action: string): 'success' | 'error' | 'warning' | 'default' => {
  switch (action) {
    case 'CREATE':
      return 'success';
    case 'UPDATE':
      return 'warning';
    case 'DELETE':
      return 'error';
    default:
      return 'default';
  }
};

// Helper to save a blob as a file
const saveBlob = (blob: Blob, fileName: string) => {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.style.display = 'none';
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  a.remove();
};

const AuditLogs: React.FC = () => {
  const { orgId } = useAuth();
  
  // State
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [showJsonDialog, setShowJsonDialog] = useState(false);
  const [showCompareDialog, setShowCompareDialog] = useState(false);
  const [showHelpDialog, setShowHelpDialog] = useState(false);
  
  // Filter state
  const [filters, setFilters] = useState<AuditLogFilter>({});
  
  // Entity types for filter dropdown
  const entityTypes = [
    'recipe', 'ingredient', 'batch', 'problemlog', 'receivinglog', 'storagelocation', 'storagelog', 'task', 'checklist'
  ];
  
  // Action types for filter dropdown
  const actionTypes = ['CREATE', 'UPDATE', 'DELETE'];
  
  // Load audit logs
  const fetchAuditLogs = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const logs = await auditApi.getAll(filters);
      setAuditLogs(logs);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch audit logs');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [filters]);
  
  // Load initial data
  useEffect(() => {
    fetchAuditLogs();
  }, [fetchAuditLogs]);
  
  // Handle filter changes
  const handleFilterChange = (field: keyof AuditLogFilter, value: string | number | null) => {
    setFilters(prev => ({
      ...prev,
      [field]: value === null ? undefined : value
    }));
  };
  
  // Clear all filters
  const handleClearFilters = () => {
    setFilters({});
  };
  
  // Download audit log report
  const handleDownloadReport = async () => {
    setLoading(true);
    
    try {
      const reportBlob = await auditApi.downloadReport(filters);
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      saveBlob(reportBlob, `audit-log-report-${timestamp}.csv`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to download report');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  // View log details
  const handleViewLog = (log: AuditLog) => {
    setSelectedLog(log);
    setShowJsonDialog(true);
  };
  
  // View change comparison
  const handleCompareChanges = (log: AuditLog) => {
    setSelectedLog(log);
    setShowCompareDialog(true);
  };
  
  // Close dialogs
  const handleCloseDialog = () => {
    setShowJsonDialog(false);
    setShowCompareDialog(false);
    setSelectedLog(null);
  };
  
  // Toggle help dialog
  const handleToggleHelpDialog = () => {
    setShowHelpDialog(prev => !prev);
  };
  
  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h4">
          Audit Logs
        </Typography>
        <Button 
          startIcon={<HelpIcon />}
          variant="outlined"
          onClick={handleToggleHelpDialog}
        >
          Help
        </Button>
      </Box>
      
      {/* Filters */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Filters
        </Typography>
        
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel id="entity-type-label">Entity Type</InputLabel>
              <Select
                labelId="entity-type-label"
                id="entity-type"
                value={filters.entity_type || ''}
                onChange={(e) => handleFilterChange('entity_type', e.target.value || null)}
                label="Entity Type"
              >
                <MenuItem value="">All</MenuItem>
                {entityTypes.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel id="action-type-label">Action</InputLabel>
              <Select
                labelId="action-type-label"
                id="action-type"
                value={filters.action_type || ''}
                onChange={(e) => handleFilterChange('action_type', e.target.value || null)}
                label="Action"
              >
                <MenuItem value="">All</MenuItem>
                {actionTypes.map((action) => (
                  <MenuItem key={action} value={action}>
                    {action}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={2}>
            <TextField
              fullWidth
              label="Entity ID"
              type="number"
              value={filters.entity_id || ''}
              onChange={(e) => handleFilterChange('entity_id', e.target.value ? Number(e.target.value) : null)}
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Grid>
          
          <Grid item xs={12} md={2}>
            <TextField
              fullWidth
              label="From Date"
              type="date"
              value={filters.date_start || ''}
              onChange={(e) => handleFilterChange('date_start', e.target.value || null)}
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Grid>
          
          <Grid item xs={12} md={2}>
            <TextField
              fullWidth
              label="To Date"
              type="date"
              value={filters.date_end || ''}
              onChange={(e) => handleFilterChange('date_end', e.target.value || null)}
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Grid>
          
          <Grid item xs={12} container spacing={1} justifyContent="flex-end">
            <Grid item>
              <Button 
                variant="outlined" 
                startIcon={<ClearIcon />}
                onClick={handleClearFilters}
              >
                Clear
              </Button>
            </Grid>
            <Grid item>
              <Button 
                variant="contained" 
                color="primary" 
                startIcon={<SearchIcon />}
                onClick={fetchAuditLogs}
              >
                Search
              </Button>
            </Grid>
            <Grid item>
              <Button 
                variant="contained" 
                startIcon={<DownloadIcon />}
                onClick={handleDownloadReport}
                disabled={loading}
                color="secondary"
              >
                Export CSV
              </Button>
            </Grid>
          </Grid>
        </Grid>
      </Paper>
      
      {/* Error message */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {/* Audit logs table */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Timestamp</TableCell>
                <TableCell>Action</TableCell>
                <TableCell>Entity Type</TableCell>
                <TableCell>Entity ID</TableCell>
                <TableCell>User</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : auditLogs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    No audit logs found
                  </TableCell>
                </TableRow>
              ) : (
                auditLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>{formatTimestamp(log.created_at)}</TableCell>
                    <TableCell>
                      <Chip 
                        label={log.action_type} 
                        color={getActionColor(log.action_type)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {log.entity_type.charAt(0).toUpperCase() + log.entity_type.slice(1)}
                    </TableCell>
                    <TableCell>{log.entity_id}</TableCell>
                    <TableCell>{log.user_id}</TableCell>
                    <TableCell align="center">
                      <Tooltip title="View Details">
                        <IconButton 
                          color="primary" 
                          onClick={() => handleViewLog(log)}
                        >
                          <VisibilityIcon />
                        </IconButton>
                      </Tooltip>
                      
                      {log.action_type === 'UPDATE' && log.previous_state && (
                        <Tooltip title="Compare Changes">
                          <IconButton 
                            color="secondary" 
                            onClick={() => handleCompareChanges(log)}
                          >
                            <CompareIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
      
      {/* JSON View Dialog */}
      <Dialog
        open={showJsonDialog}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Audit Log Details
        </DialogTitle>
        <DialogContent dividers>
          {selectedLog && (
            <Box>
              <Typography variant="subtitle1" gutterBottom>
                {selectedLog.action_type} {selectedLog.entity_type} #{selectedLog.entity_id}
                <Typography variant="caption" component="span" sx={{ ml: 2 }}>
                  {formatTimestamp(selectedLog.created_at)}
                </Typography>
              </Typography>
              
              <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
                Current State:
              </Typography>
              <Paper sx={{ p: 2, maxHeight: 300, overflow: 'auto' }}>
                <ReactJsonView src={selectedLog.new_state} />
              </Paper>
              
              {selectedLog.previous_state && (
                <>
                  <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
                    Previous State:
                  </Typography>
                  <Paper sx={{ p: 2, maxHeight: 300, overflow: 'auto' }}>
                    <ReactJsonView src={selectedLog.previous_state} />
                  </Paper>
                </>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Close</Button>
        </DialogActions>
      </Dialog>
      
      {/* Change Comparison Dialog */}
      {selectedLog && (
        <EntityChangeDialog
          open={showCompareDialog}
          onClose={handleCloseDialog}
          auditLog={selectedLog}
        />
      )}
      
      {/* Help Dialog */}
      <Dialog 
        open={showHelpDialog}
        onClose={handleToggleHelpDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center' }}>
          <HelpIcon sx={{ mr: 1 }} /> Audit Logs Help
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom>
              What are Audit Logs?
            </Typography>
            <Typography variant="body1" paragraph>
              Audit logs provide a detailed record of all changes made to your data. They track who made changes, 
              what was changed, and when those changes occurred. This is essential for compliance, security, 
              and troubleshooting purposes.
            </Typography>
          </Box>
          
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom>
              Understanding Entities and IDs
            </Typography>
            <List>
              <ListItem>
                <ListItemIcon><EntityIcon /></ListItemIcon>
                <ListItemText 
                  primary="What is an Entity?" 
                  secondary="An entity is a type of data object in the system. Examples include recipes, ingredients, batches, problem logs, etc."
                />
              </ListItem>
              <ListItem>
                <ListItemIcon><NumberIcon /></ListItemIcon>
                <ListItemText 
                  primary="What is an Entity ID?" 
                  secondary="Every entity has a unique ID number. For example, 'Recipe #42' refers to the recipe with ID 42."
                />
              </ListItem>
              <ListItem>
                <ListItemIcon><InfoIcon /></ListItemIcon>
                <ListItemText 
                  primary="Finding Entity IDs" 
                  secondary="Entity IDs can be found in the URL when viewing or editing an item. For example, when viewing recipe details, the URL might end with '/recipes/42'."
                />
              </ListItem>
            </List>
          </Box>
          
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom>
              Using Filters
            </Typography>
            <List>
              <ListItem>
                <ListItemIcon><FilterIcon /></ListItemIcon>
                <ListItemText 
                  primary="Filter by Entity Type" 
                  secondary="Select a specific type of data to focus on (e.g., only recipes or only ingredients)."
                />
              </ListItem>
              <ListItem>
                <ListItemIcon><LabelIcon /></ListItemIcon>
                <ListItemText 
                  primary="Filter by Action" 
                  secondary="Filter by CREATE (new items), UPDATE (changed items), or DELETE (removed items)."
                />
              </ListItem>
              <ListItem>
                <ListItemIcon><NumberIcon /></ListItemIcon>
                <ListItemText 
                  primary="Filter by Entity ID" 
                  secondary="Track changes to a specific item by entering its ID number."
                />
              </ListItem>
            </List>
          </Box>
          
          <Box>
            <Typography variant="h6" gutterBottom>
              Available Actions
            </Typography>
            <Card variant="outlined" sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="subtitle1" gutterBottom>
                  <VisibilityIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 1 }} />
                  View Details
                </Typography>
                <Typography variant="body2">
                  Shows the complete state of the entity at the time of the change, including all fields and values.
                </Typography>
              </CardContent>
            </Card>
            <Card variant="outlined" sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="subtitle1" gutterBottom>
                  <CompareIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 1 }} />
                  Compare Changes (Update only)
                </Typography>
                <Typography variant="body2">
                  Shows a side-by-side comparison of values before and after an update, highlighting specific changes.
                </Typography>
              </CardContent>
            </Card>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle1" gutterBottom>
                  <DownloadIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 1 }} />
                  Export CSV
                </Typography>
                <Typography variant="body2">
                  Exports the current filtered view of audit logs as a CSV file, useful for compliance reporting and record keeping.
                </Typography>
              </CardContent>
            </Card>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleToggleHelpDialog}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AuditLogs;