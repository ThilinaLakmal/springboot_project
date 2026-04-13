import api from './client';

export interface AuthResponseData {
  token: string;
  userId: number;
  email: string;
  name: string;
  role: string;
  profilePicture: string | null;
}

/**
 * Send the Google ID token to the backend for verification and JWT generation.
 */
export const googleLogin = (credential: string) => {
  return api.post<AuthResponseData>('/auth/google', { credential });
};

/**
 * Fetch the current authenticated user's info.
 */
export const getMe = () => {
  return api.get<AuthResponseData>('/auth/me');
};
