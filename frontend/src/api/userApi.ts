import api from './client';

export interface UserProfile {
  id: number;
  name: string;
  email: string;
  role: string;
  profilePicture: string | null;
  googleId: string | null;
  isActive: boolean;
}

/**
 * Fetch a specific user's profile by ID (Admin only).
 */
export const getUserById = async (id: string): Promise<UserProfile> => {
  const response = await api.get<UserProfile>(`/users/${id}`);
  return response.data;
};

/**
 * Fetch all users (Admin only).
 */
export const getAllUsers = async (): Promise<UserProfile[]> => {
  const response = await api.get<UserProfile[]>('/users');
  return response.data;
};

/**
 * Update a user's role (Admin only).
 */
export const updateUserRole = async (id: number, role: string): Promise<UserProfile> => {
  const response = await api.patch<UserProfile>(`/users/${id}/role`, { role });
  return response.data;
};

/**
 * Update a user's active status — block/unblock (Admin only).
 */
export const updateUserStatus = async (id: number, isActive: boolean): Promise<UserProfile> => {
  const response = await api.patch<UserProfile>(`/users/${id}/status`, { isActive });
  return response.data;
};
