import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Button, 
  TextField, 
  Grid, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  SelectChangeEvent,
  CircularProgress,
  Alert,
  Snackbar
} from '@mui/material';
import { DownloadOutlined } from '@mui/icons-material';
import { reportApi } from '../../services';
import { useAuth } from '../../context/AuthContext';
import { ReportQuery } from '../../types';

// Helper function to save a blob as a file
const saveBlob = (blob: Blob, fileName: string) => {
  // Create a URL for the blob
  const url = window.URL.createObjectURL(blob);
  
  // Create a temporary anchor element
  const a = document.createElement('a');
  a.style.display = 'none';
  a.href = url;
  a.download = fileName;
  
  // Append to the DOM, trigger a click, and clean up
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  a.remove();
};

// Define report types
type ReportType = 'batches' | 'recipes' | 'ingredients' | 'receivinglogs' | 'storagelogs';

const Reports: React.FC = () => {
  const { orgId } = useAuth();
  
  // Form state
  const [reportType, setReportType] = useState<ReportType>('batches');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [lotCode, setLotCode] = useState<string>('');
  
  // UI state
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  const handleReportTypeChange = (event: SelectChangeEvent) => {
    const newReportType = event.target.value as ReportType;
    setReportType(newReportType);
    
    // Clear lotCode field when switching to storage logs since it's not relevant
    if (newReportType === 'storagelogs') {
      setLotCode('');
    }
  };
  
  const generateFileName = () => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    return `${reportType}-report-${timestamp}.csv`;
  };
  
  const handleDownloadReport = async () => {
    setLoading(true);
    setError(null);
    
    // Build query parameters
    const queryParams: ReportQuery = {};
    
    if (startDate) {
      queryParams.date_start = startDate;
    }
    
    if (endDate) {
      queryParams.date_end = endDate;
    }
    
    if (lotCode.trim()) {
      queryParams.lotcode = lotCode.trim();
    }
    
    try {
      let response;
      
      switch (reportType) {
        case 'batches':
          response = await reportApi.downloadBatchReport(queryParams);
          break;
        case 'recipes':
          response = await reportApi.downloadRecipeReport(queryParams);
          break;
        case 'ingredients':
          response = await reportApi.downloadIngredientReport(queryParams);
          break;
        case 'receivinglogs':
          response = await reportApi.downloadReceivingLogReport(queryParams);
          break;
        case 'storagelogs':
          response = await reportApi.downloadStorageLogReport(queryParams);
          break;
      }
      
      // Save the blob as a CSV file
      saveBlob(response, generateFileName());
      setSuccessMessage('Report downloaded successfully');
    } catch (err) {
      setError('Failed to download report. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  const handleCloseSnackbar = () => {
    setSuccessMessage(null);
  };
  
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Reports
      </Typography>
      
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Generate Reports
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel id="report-type-label">Report Type</InputLabel>
              <Select
                labelId="report-type-label"
                id="report-type"
                value={reportType}
                label="Report Type"
                onChange={handleReportTypeChange}
              >
                <MenuItem value="batches">Production Batches</MenuItem>
                <MenuItem value="recipes">Recipes</MenuItem>
                <MenuItem value="ingredients">Ingredients</MenuItem>
                <MenuItem value="receivinglogs">Receiving Logs</MenuItem>
                <MenuItem value="storagelogs">Storage Logs</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Start Date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Grid>
          
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="End Date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Grid>
          
          {reportType !== 'storagelogs' && (
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Lot Code (optional)"
                value={lotCode}
                onChange={(e) => setLotCode(e.target.value)}
                placeholder="Filter by lot code"
              />
            </Grid>
          )}
          
          <Grid item xs={12}>
            <Button
              variant="contained"
              color="primary"
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <DownloadOutlined />}
              onClick={handleDownloadReport}
              disabled={loading}
            >
              {loading ? 'Generating...' : 'Download Report'}
            </Button>
          </Grid>
        </Grid>
        
        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
      </Paper>
      
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Reports Help
        </Typography>
        
        <Typography variant="body1" paragraph>
          Generate CSV reports based on your organization's data. You can filter by date range and lot code.
        </Typography>
        
        <Typography variant="body2" component="ul" sx={{ pl: 2 }}>
          <li>
            <strong>Production Batches Report:</strong> Includes information about production batches, including batch lot code, recipe, date made, and ingredients used.
          </li>
          <li>
            <strong>Recipes Report:</strong> Contains recipe details including lot code, name, ingredients, and date created.
          </li>
          <li>
            <strong>Ingredients Report:</strong> Lists all ingredients with their lot codes, names, and dates.
          </li>
          <li>
            <strong>Receiving Logs Report:</strong> Provides details on received items including company name, item name, temperature, and date.
          </li>
          <li>
            <strong>Storage Logs Report:</strong> Shows temperature and humidity logs for storage locations with timestamps and employee info.
          </li>
        </Typography>
      </Paper>
      
      <Snackbar
        open={!!successMessage}
        autoHideDuration={5000}
        onClose={handleCloseSnackbar}
        message={successMessage}
      />
    </Box>
  );
};

export default Reports;