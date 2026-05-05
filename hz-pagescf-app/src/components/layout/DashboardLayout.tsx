import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import {
  Box,
  CssBaseline,
  AppBar,
  Toolbar,
  Typography,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  useMediaQuery,
  useTheme,
  Button,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Restaurant as RecipeIcon,
  ShoppingBasket as IngredientIcon,
  Business as OrgIcon,
  Logout as LogoutIcon,
  Inventory as BatchIcon,
  ReportProblem as ReportProblemIcon,
  LocalShipping as ReceivingLogIcon,
  Storage as StorageIcon,
  TaskAlt as TaskIcon,
  PlaylistAddCheck as ChecklistIcon,
  BarChart as ReportIcon,
  History as HistoryIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

// Drawer width for desktop
const drawerWidth = 240;

const DashboardLayout: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const { user, orgId, logout } = useAuth();

  // Toggle drawer
  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  // Handle navigation
  const handleNavigation = (path: string) => {
    navigate(path);
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  // Handle logout
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Navigation items
  const navItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
    // { text: 'Organizations', icon: <OrgIcon />, path: '/organizations' },
    { text: 'Employees', icon: <PeopleIcon />, path: '/employees' },
    { text: 'Tasks & Checklists', icon: <TaskIcon />, path: '/tasks-checklists' },
    { text: 'Receiving Logs', icon: <ReceivingLogIcon />, path: '/receivinglogs' },
    { text: 'Ingredients', icon: <IngredientIcon />, path: '/ingredients' },
    { text: 'Recipes', icon: <RecipeIcon />, path: '/recipes' },
    { text: 'Production Batches', icon: <BatchIcon />, path: '/batches' },
    { text: 'Problem Logs', icon: <ReportProblemIcon />, path: '/problemlogs' },
    { text: 'Storage Locations', icon: <StorageIcon />, path: '/storage-locations' },
    { text: 'Reports', icon: <ReportIcon />, path: '/reports' },
    { text: 'Audit Logs', icon: <HistoryIcon />, path: '/audit-logs' },
  ];

  // Drawer content
  const drawerContent = (
    <div>
      <Toolbar sx={{ display: 'flex', justifyContent: 'center', padding: 1 }}>
        <img 
          src={require('../resources/hzlogo.jpg')} 
          alt="HazardZero Logo" 
          style={{ maxWidth: '35%', height: 'auto' }}
        />
      </Toolbar>
      <Divider />
      <List>
        {navItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton onClick={() => handleNavigation(item.path)}>
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider />
      <List>
        <ListItem disablePadding>
          <ListItemButton onClick={handleLogout}>
            <ListItemIcon><LogoutIcon /></ListItemIcon>
            <ListItemText primary="Logout" />
          </ListItemButton>
        </ListItem>
      </List>
    </div>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      
      {/* App Bar */}
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            {user?.name || 'Organization Dashboard'}
          </Typography>
          <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
            <Button color="inherit" onClick={handleLogout}>
              Logout
            </Button>
          </Box>
        </Toolbar>
      </AppBar>
      
      {/* Drawer for mobile */}
      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better mobile performance
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawerContent}
        </Drawer>
        
        {/* Drawer for desktop */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          open
        >
          {drawerContent}
        </Drawer>
      </Box>
      
      {/* Main content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: `calc(100% - ${drawerWidth}px)` },
          mt: '64px', // Toolbar height
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

export default DashboardLayout;