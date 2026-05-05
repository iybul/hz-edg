// Organization interface
export interface Organization {
  id?: number;
  name: string;
  email: string;
}
  
// Employee interface
export interface Employee {
  id?: number;
  name: string;
  role: string;
  org_id: number;
}
  
// General Ingredient model
export interface GeneralIngredient {
  id?: number;
  name: string;
  org_id: number;
}

// Main Ingredient model
export interface Ingredient {
  id?: number;
  general_ingredient_id: number;
  lotcode: string;
  date_received: string; // YYYY-MM-DD
  exp_date: string; // YYYY-MM-DD
  quantity: number | string; // Can be either number or string when sending to API
  unit: string;
  cost_per_unit: number | string; // Can be either number or string when sending to API
  org_id: number;
  general_ingredient_name?: string;
}
  
// Recipe Step interface
export interface RecipeStep {
  id?: number;
  recipe_id?: number;
  step_number: number;
  instructions: string;
}

// Recipe interface
export interface Recipe {
  id?: number;
  recipecode: string; // Updated from lotcode to recipecode
  name: string;
  date_made: string;
  org_id: number;
  general_ingredient_ids: number[]; // Updated from ingredients to general_ingredient_ids
  steps: RecipeStep[]; // Updated from description to steps
}

// Batch interface
export interface Batch {
  id?: number;
  org_id: number;
  employee: string;
  recipecode: string; // Updated from recipe_lotcode to recipecode
  batch_lot_code: string;
  ingredient_lotcodes: string[]; // Updated from ingredients (ids) to ingredient_lotcodes
  amount_ingredients: number[];
  date_made: string;
  amount_made: string;
}

// ProblemLog interface
export interface ProblemLog {
  id?: number;
  isOpen: boolean;
  dateOpened: string;
  customerName: string;
  problemType: string;
  assignedTo: number[];
  problemDescription: string;
  recall: boolean;
  dateResolved?: string;
  org_id?: number;
}

// ReceivingLog interface
export interface ReceivingLog {
  id?: number;
  lotcode: string;
  company_name: string;
  item_name: string;
  temperature: string;
  date: string; // YYYY-MM-DD
  general_ingredient_id?: number | null; // Can be null when no general ingredient is associated
  org_id: number;
}
  
// Auth state interface
// export interface AuthState {
//   isAuthenticated: boolean;
//   organization: Organization | null;
//   loading: boolean;
//   error: string | null;
// }
  
// Reports types
export interface ReportQuery {
  date_start?: string;
  date_end?: string;
  lotcode?: string;
}

// API response interface
// Storage Location interface
export interface StorageLocation {
  id?: number;
  storageType: string;
  location: string;
  org_id: number;
  acceptableRange: string;
  humidity: boolean;
}

// Storage Log interface
export interface StorageLog {
  id?: number;
  storageLocationId: number;
  org_id: number;
  employeeName: string;
  temperature: number;
  humidity?: number;
  recordedAt: string;
  notes?: string;
}

// Task interface
export interface Task {
  id?: number;
  name: string;
  description: string;
  org_id: number;
  completed: boolean;
}

// Checklist interface
export interface Checklist {
  id?: number;
  tasks: number[];
  interval: number;
  org_id: number;
  completed: boolean;
}

// Audit Log interface
export interface AuditLog {
  id?: number;
  user_id: number;
  org_id: number;
  action_type: string;
  entity_type: string;
  entity_id: number;
  previous_state?: any;
  new_state: any;
  ip_address?: string;
  user_agent?: string;
  created_at?: string;
}

// Audit Filter interface
export interface AuditLogFilter {
  entity_type?: string;
  entity_id?: number;
  date_start?: string;
  date_end?: string;
  action_type?: string;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
}