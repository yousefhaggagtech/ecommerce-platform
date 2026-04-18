import axiosInstance from "@/infrastructure/http/axiosIstance";
import {
  RegisterRequest,
  LoginRequest,
  AuthApiResponse,
  RefreshApiResponse,
  GetMeApiResponse,
} from "@/infrastructure/dto/authDto";
import { IAuthRepository } from "@/domain/repositories/authRepository";
import { IAuthResponse, IUser } from "@/domain/entities/userEntity";

// ─── Helper: map API response to domain entity ────────────────────────────────

const mapToAuthResponse = (data: AuthApiResponse): IAuthResponse => ({
  accessToken: data.accessToken,
  refreshToken: data.refreshToken,
  user: {
    id: data.data.user.id,
    name: data.data.user.name,
    email: data.data.user.email,
    role: data.data.user.role,
    createdAt: "",
  },
});

// ─── Auth API Implementation ──────────────────────────────────────────────────

export const authApi: IAuthRepository = {
  register: async (payload: RegisterRequest): Promise<IAuthResponse> => {
    const { data } = await axiosInstance.post<AuthApiResponse>(
      "/auth/register",
      payload
    );
    return mapToAuthResponse(data);
  },

  login: async (payload: LoginRequest): Promise<IAuthResponse> => {
    const { data } = await axiosInstance.post<AuthApiResponse>(
      "/auth/login",
      payload
    );
    return mapToAuthResponse(data);
  },

  logout: async (refreshToken: string): Promise<void> => {
    await axiosInstance.post("/auth/logout", { refreshToken });
  },

  refresh: async (refreshToken: string): Promise<{ accessToken: string }> => {
    const { data } = await axiosInstance.post<RefreshApiResponse>(
      "/auth/refresh",
      { refreshToken }
    );
    return { accessToken: data.accessToken };
  },

  getMe: async (): Promise<IUser> => {
    const { data } = await axiosInstance.get<GetMeApiResponse>("/auth/me");
    return {
      id: data.data.user._id,
      name: data.data.user.name,
      email: data.data.user.email,
      role: data.data.user.role,
      createdAt: data.data.user.createdAt,
    };
  },
};