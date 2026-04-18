// Represents the core User entity across the entire application

export interface IUser {
  id: string;
  name: string;
  email: string;
  role: "customer" | "admin";
  createdAt: string;
}

export interface IAuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface IAuthResponse {
  user: IUser;
  accessToken: string;
  refreshToken: string;
}