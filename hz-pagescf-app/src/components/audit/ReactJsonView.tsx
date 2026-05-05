import React from 'react';
import { Box, Typography } from '@mui/material';

// This is a simple JSON viewer component
// In a real app, you might want to use a library like react-json-view
export const ReactJsonView: React.FC<{ src: any }> = ({ src }) => {
  const formatJSON = (json: any) => {
    try {
      return JSON.stringify(json, null, 2);
    } catch (error) {
      return 'Invalid JSON';
    }
  };

  return (
    <Box
      component="pre"
      sx={{
        fontFamily: 'monospace',
        fontSize: '0.875rem',
        margin: 0,
        whiteSpace: 'pre-wrap',
        wordWrap: 'break-word',
      }}
    >
      {formatJSON(src)}
    </Box>
  );
};