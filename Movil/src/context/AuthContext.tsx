import React, { createContext, useState, useContext } from 'react';

export type UserRole = 'MESERO' | 'COCINA' | 'CAJA' | null;

interface AuthContextType {
  role: UserRole;
  login: (selectedRole: UserRole) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRole] = useState<UserRole>(null);

  const login = (selectedRole: UserRole) => {
    setRole(selectedRole);
  };

  const logout = () => {
    setRole(null);
  };

  return (
    <AuthContext.Provider value={{ role, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};
