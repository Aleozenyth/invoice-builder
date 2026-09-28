import { createContext } from 'react';
export const PlanContext = createContext({ plan: 'local', limit: Infinity });
export const PLAN_LIMITS = { free: 10, pro: Infinity }; // total dokumen (invoice + quote)
