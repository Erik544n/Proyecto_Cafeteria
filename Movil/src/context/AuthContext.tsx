import React, { createContext, useState, useContext } from 'react';
import { apiLogin } from '../services/api';

export type UserRole = 'MESERO' | 'COCINA' | 'CAJERO' | null;

interface AuthUser {
  token: string;
  role: UserRole;
  nombre: string;
  usuarioId: number;
}

interface AuthContextType {
  user: AuthUser | null;
  role: UserRole;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(false);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const data = await apiLogin(email, password);
      // La API devuelve: access_token, usuario_id, nombre, rol
      const rol = data.rol as UserRole;
      setUser({
        token: data.access_token,
        role: rol,
        nombre: data.nombre,
        usuarioId: data.usuario_id,
      });
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role ?? null,
        token: user?.token ?? null,
        loading,
        login,
        logout,
      }}
    >
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
