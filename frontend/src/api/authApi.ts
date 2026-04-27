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

export const register = (data: any) => {
  return api.post<{message: string}>('/auth/register', data);
};

export const verifyOtp = (email: string, otp: string) => {
  return api.post<{message: string}>('/auth/verify-otp', { email, otp });
};

export const login = (data: any) => {
  return api.post<AuthResponseData>('/auth/login', data);
};

/**
 * Fetch the current authenticated user's info.
 */
export const getMe = () => {
  return api.get<AuthResponseData>('/auth/me');
};
