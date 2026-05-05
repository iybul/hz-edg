import React from 'react';
import { RouteObject } from 'react-router-dom';

// Authentication
import Login from '../components/auth/Login';
import Register from '../components/auth/Register';

// Layout
import DashboardLayout from '../components/layout/DashboardLayout';
import ProtectedRoute from '../components/routing/ProtectedRoute';

// Pages
import Dashboard from '../components/dashboard/Dashboard';
import Organizations from '../components/organizations/Organizations';
import Employees from '../components/employees/Employees';
import Recipes from '../components/recipes/Recipes';
import RecipeDetail from '../components/recipes/RecipeDetail';
import Ingredients from '../components/ingredients/Ingredients';
import Batches from '../components/batches/Batches';
import BatchDetail from '../components/batches/BatchDetail';
import ProblemLogs from '../components/problemlogs/ProblemLogs';
import ReceivingLogs from '../components/receivinglogs/ReceivingLogs';
import StorageLocations from '../components/storage/StorageLocations';
import StorageLogs from '../components/storage/StorageLogs';
import TasksChecklists from '../components/tasks/TasksChecklists';
import DailyTasks from '../components/tasks/DailyTasks';
import Reports from '../components/reports/Reports';
import AuditLogs from '../components/audit/AuditLogs';
import NotFound from '../components/common/NotFound';

/**
 * Routes configuration
 * This structure is designed to be flexible and scalable as the application grows
 */
const routes: RouteObject[] = [
  // Public routes
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/register',
    element: <Register />,
  },
  
  // Protected routes
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <DashboardLayout />,
        children: [
          // Dashboard
          {
            path: '/',
            element: <Dashboard />,
          },
          {
            path: '/dashboard',
            element: <Dashboard />,
          },
          
          // Organizations
          {
            path: '/organizations',
            element: <Organizations />,
          },
          
          // Employees routes
          {
            path: '/employees',
            element: <Employees />,
          },
          
          // Recipes routes
          {
            path: '/recipes',
            element: <Recipes />,
          },
          {
            path: '/recipes/:id',
            element: <RecipeDetail />,
          },
          
          // Ingredients routes
          {
            path: '/ingredients',
            element: <Ingredients />,
          },
          
          // Batches routes
          {
            path: '/batches',
            element: <Batches />,
          },
          {
            path: '/batches/:id',
            element: <BatchDetail />,
          },
          
          // Problem Logs routes
          {
            path: '/problemlogs',
            element: <ProblemLogs />,
          },
          
          // Receiving Logs routes
          {
            path: '/receivinglogs',
            element: <ReceivingLogs />,
          },
          
          // Storage Location routes
          {
            path: '/storage-locations',
            element: <StorageLocations />,
          },
          
          // Storage Logs routes
          {
            path: '/storage-logs/:id',
            element: <StorageLogs />,
          },
          
          // Tasks & Checklists routes
          {
            path: '/tasks-checklists',
            element: <TasksChecklists />,
          },
          
          // Daily Tasks route
          {
            path: '/daily-tasks',
            element: <DailyTasks />,
          },
          
          // Reports route
          {
            path: '/reports',
            element: <Reports />,
          },
          
          // Audit Logs route
          {
            path: '/audit-logs',
            element: <AuditLogs />,
          },
        ],
      },
    ],
  },
  
  // 404 Not Found route
  {
    path: '*',
    element: <NotFound />,
  },
];

export default routes;