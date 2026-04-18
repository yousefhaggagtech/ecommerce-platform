import { IAuthResponse , IUser } from "@/domain/entities/userEntity";

// Defines the contract for all auth operations
// Infrastructure layer must implement this interface

export interface IAuthRepository {
  register(data: {
    name: string;
    email: string;
    password: string;
  }): Promise<IAuthResponse>;

  login(data: {
    email: string;
    password: string;
  }): Promise<IAuthResponse>;

  logout(refreshToken: string): Promise<void>;

  refresh(refreshToken: string): Promise<{ accessToken: string }>;

  getMe(): Promise<IUser>;
}