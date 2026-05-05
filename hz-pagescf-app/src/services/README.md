# API Services Guide

## Authentication Changes

The HazardZero API has been refactored with new authentication. Key changes:

1. JWT tokens now contain user details including `org_id` and `user_id`
2. The API now enforces authorization checks on all endpoints:
   - `/api/auth/*` endpoints are public
   - All other endpoints require valid authentication
   - Resources are scoped to organizations - users can only access data from their organization

## Service Pattern

All service modules should follow the pattern demonstrated in `ProblemLogService.ts` and `ReceivingLogService.ts`:

1. Use the `apiRequest` function from `api.ts` for all HTTP requests
2. Define backend interfaces with snake_case properties
3. Implement toCamelCase/toSnakeCase converter functions
4. Throw errors instead of returning error objects
5. Use consistent API method naming: getAll, getById, create, update, delete

## Code Organization

- `api.ts`: Core API functionality and interceptors
- `ServiceTemplate.ts`: Template for creating new service modules
- `*Service.ts`: Entity-specific service modules

## Using Services in Components

```tsx
import { entityApi } from '../services/EntityService';
import { useAuth } from '../context/AuthContext';

const MyComponent = () => {
  const { orgId } = useAuth(); // Access authenticated organization ID
  
  // Use try-catch for proper error handling
  const fetchData = async () => {
    try {
      const data = await entityApi.getAll();
      // Process data
    } catch (error) {
      // Handle error
    }
  };
};
```

## Converting Existing Services

To convert an existing service to the new pattern:

1. Copy `ServiceTemplate.ts` and rename it
2. Define proper backend interface with snake_case properties
3. Implement data conversion functions
4. Update component imports to use the new API

## Authentication Context

The updated `AuthContext` provides:

- `token`: JWT token
- `user`: Current user information
- `orgId`: Current organization ID  
- `login()`: Login function
- `logout()`: Logout function
- `isAuthenticated`: Boolean auth status

The auth context automatically handles token validation and storage.