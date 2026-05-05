import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import { Box } from '@chakra-ui/react';

const App = () => {
  return (
    <Router>
      <Box bg="gray.100" minH="100vh">
        <Flex justify="center" py={4}>
          <Link to="/login" mr={4}>
            Login
          </Link>
          <Link to="/dashboard">Dashboard</Link>
        </Flex>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </Box>
    </Router>
  );
};

export default App;