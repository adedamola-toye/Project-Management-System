// src/types/userTypes.ts

// Define the shape of the User object
export interface User {
    id: string;
    email: string;
    username: string;
    password: string;
    confirmPassword?: string; // Optional, used on the frontend but not sent to the backend
  }
  
  // Define the state shape for user data in your Redux store
  export interface UserState {
    user: User | null;
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
    error: string | null;
  }
  
  // Define the payload for an error if needed (for example, during async thunks)
  export interface UserError {
    message: string;
    code?: number; // Optional error code
  }
  
  // This can be used for the action payloads or when handling errors
  export interface CreateUserPayload {
    email: string;
    username: string;
    password: string;
  }
  