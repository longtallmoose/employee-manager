// A generic Result pattern to handle errors gracefully without throwing exceptions everywhere.
// This is critical for a "Error-Free" system.

export type ServiceError = {
  code: string;
  message: string;
  details?: Record<string, any>;
};

export type ServiceResult<T> = 
  | { success: true; data: T }
  | { success: false; error: ServiceError };

export const Result = {
  ok: <T>(data: T): ServiceResult<T> => ({ success: true, data }),
  fail: <T>(code: string, message: string, details?: any): ServiceResult<T> => ({
    success: false,
    error: { code, message, details }
  })
};