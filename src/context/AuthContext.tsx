import React, { createContext, useContext, useState, ReactNode } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  department: string;
  joinedDate: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => boolean;
  logout: () => void;
  updateProfile: (userData: Partial<User>) => void;
  changePassword: (currentPassword: string, newPassword: string) => boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [storedPassword] = useState('123456');

  const login = (email: string, password: string): boolean => {
    if (email === 'admin@gmail.com' && password === '123456') {
      setUser({
        id: 'admin-1',
        name: 'John Anderson',
        email: 'admin@gmail.com',
        phone: '+1-555-0123',
        role: 'Super Administrator',
        department: 'Quality Assurance',
        joinedDate: '2020-01-15',
      });
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
  };

  const updateProfile = (userData: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...userData });
    }
  };

  const changePassword = (currentPassword: string, newPassword: string): boolean => {
    if (currentPassword === storedPassword && newPassword.length >= 6) {
      return true;
    }
    return false;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        updateProfile,
        changePassword,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
