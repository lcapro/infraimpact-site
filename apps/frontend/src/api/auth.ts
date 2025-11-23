import { api, setToken, clearAuth } from './client';
import { User } from '../types';

export interface AuthResponse {
  token: string;
  user?: User;
}

export const register = async (payload: { name: string; email: string; password: string; organizationName?: string }) => {
  const { data } = await api.post<AuthResponse>('/auth/register', payload);
  setToken(data.token);
  return data;
};

export const login = async (payload: { email: string; password: string }) => {
  const { data } = await api.post<AuthResponse>('/auth/login', payload);
  setToken(data.token);
  return data;
};

export const logout = () => {
  clearAuth();
};

export const getMe = async () => {
  const { data } = await api.get<User>('/auth/me');
  return data;
};

export const updateMe = async (payload: Partial<Pick<User, 'name'>> & { settings?: Record<string, unknown> }) => {
  const { data } = await api.patch<User>('/auth/me', payload);
  return data;
};
