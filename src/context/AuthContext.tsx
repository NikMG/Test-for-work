import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { authApi } from '../api/auth';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      authApi
        .getCurrentUser()
        .then((response) => {
          setUser(response.data.user);
         })
        .catch(() => {
          localStorage.removeItem('authToken');
         })
        .finally(() => {
          setIsLoading(false);
         });
     } else {
      setIsLoading(false);
     }
   }, []);

  const login = async (email: string, password: string) => {
    const response = await authApi.login({ email, password });
    const userData = response.data.user;
    const token = userData.token;
    
    localStorage.setItem('authToken', token);
    setUser(userData);
   };

  const logout = () => {
    authApi.logout();
    setUser(null);
   };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
     </AuthContext.Provider>
   );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
   }
  return context;
}