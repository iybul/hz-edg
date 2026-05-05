# API Migration Status

## Changes Made

1. Created a consistent API service pattern:
   - Updated `api.ts` with `apiRequest` function that handles auth and errors
   - Updated authentication token handling in auth interceptors
   - Improved error handling throughout services
   - Standardized naming conventions with XyzApi naming pattern
   - Added proper TypeScript interfaces for backend data formats
   - Added data conversion between snake_case and camelCase when needed

2. Created services using the new pattern:
   - AuditService.ts - Full CRUD operations for audit logs 
   - BatchService.ts - Full CRUD operations for batches
   - EmployeeService.ts - Full CRUD operations for employees
   - IngredientService.ts - Full CRUD operations for ingredients
   - OrganizationService.ts - Full CRUD operations for organizations
   - ProblemLogService.ts - Full CRUD operations for problem logs
   - ReceivingLogService.ts - Full CRUD operations for receiving logs
   - RecipeService.ts - Full CRUD operations for recipes
   - ReportService.ts - Report generation operations
   - StorageService.ts - Full CRUD operations for storage locations and logs
   - TaskService.ts - Full CRUD operations for tasks and checklists
   
3. Created central export file:
   - Added `index.ts` that exports all APIs from a single place
   - Makes imports cleaner and refactoring easier

4. Documentation:
   - Created README.md with service usage instructions
   - Updated API_MIGRATION.md to track progress

## Components To Update

The following components should be updated to use the new service and auth pattern:

- [ ] Employees - Update imports to use employeeApi
- [ ] Recipes - Update imports to use recipeApi
- [ ] Batches - Update imports to use batchApi
- [ ] Ingredients - Update imports to use ingredientApi
- [ ] Storage - Update imports to use storageLocationApi and storageLogApi
- [ ] Tasks - Update imports to use taskApi and checklistApi
- [ ] Organizations - Update imports to use organizationApi
- [ ] Reports - Update imports to use reportApi
- [ ] ProblemLogs - Already updated to use problemLogApi
- [ ] ReceivingLogs - Update imports to use receivingLogApi
- [ ] AuditLogs - Update imports to use auditApi

## Steps to Complete Migration

1. For each component:
   - Update imports to use new service names from central index
   - Update service calls to handle promises properly
   - Update auth context usage to get orgId
   - Add proper error handling with try/catch
   - Replace old response.data/response.error pattern with direct returns

2. Test thoroughly:
   - Login flow
   - Data retrieval for each entity
   - Create/update/delete operations
   - Error handling
   - Token expiration handling

## Examples

### Before:
```tsx
import { employeeService } from '../../services/api';

// In component
const fetchEmployees = async () => {
  setLoading(true);
  try {
    const response = await employeeService.getAll();
    if (response.data) {
      setEmployees(response.data);
    } else if (response.error) {
      setError(response.error);
    }
  } catch (error) {
    setError('Failed to fetch employees');
  } finally {
    setLoading(false);
  }
};
```

### After:
```tsx
import { employeeApi } from '../../services';

// In component
const fetchEmployees = async () => {
  setLoading(true);
  try {
    const employees = await employeeApi.getAll();
    setEmployees(employees);
  } catch (error) {
    setError(error instanceof Error ? error.message : 'Failed to fetch employees');
  } finally {
    setLoading(false);
  }
};
```

## Organization ID Access

Instead of accessing `organization.id`, components should use `orgId` from the auth context:

```tsx
import { useAuth } from '../../context/AuthContext';

const MyComponent = () => {
  const { orgId } = useAuth();
  
  const handleCreate = async () => {
    try {
      await entityApi.create({
        ...formData,
        org_id: orgId
      });
    } catch (error) {
      // Handle error
    }
  };
};
```