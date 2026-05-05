// Core API utilities
export { apiRequest, ApiError } from './api';

// Entity-specific APIs
export { auditApi } from './AuditService';
export { batchApi } from './BatchService';
export { checklistApi, taskApi } from './TaskService';
export { employeeApi } from './EmployeeService';
export { ingredientApi, generalIngredientApi } from './IngredientService';
export { organizationApi } from './OrganizationService';
export { problemLogApi } from './ProblemLogService';
export { receivingLogApi } from './ReceivingLogService';
export { recipeApi } from './RecipeService';
export { reportApi } from './ReportService';
export { storageLocationApi, storageLogApi } from './StorageService';

// Also export the APIs defined in api.ts for backward compatibility
export { 
  recipeApi as recipeApiFromCore,
  batchApi as batchApiFromCore,
  ingredientApi as ingredientApiFromCore,
  employeeApi as employeeApiFromCore,
  organizationApi as organizationApiFromCore
} from './api';

// NOTE: This is the central export file for all API services.
// Import from this file rather than individual service files for easier refactoring.
// Example: import { employeeApi, ingredientApi } from '../services';