
export interface User {
  id: string;
  email?: string;
  avatar_url?: string;
  user_metadata?: {
    username?: string;
    full_name?: string;
    avatar_url?: string;
  };
}

export interface AuthContextType {
  user: User | null;
  logout: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  signUp?: (email: string, password: string, userData: any) => Promise<any>;
  session?: any;
  loading?: boolean;
  // Aliases for consistency with component usage
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}
