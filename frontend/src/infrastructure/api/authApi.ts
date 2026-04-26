import axiosInstance from "@/infrastructure/http/axiosIstance";
import {
  RegisterRequest,
  LoginRequest,
  AuthApiResponse,
  GetMeApiResponse,
} from "@/infrastructure/dto/authDto";
import { IAuthResponse, IUser } from "@/domain/entities/userEntity";

// ─── Helper: map API response to domain entity ────────────────────────────────

const mapToAuthResponse = (data: AuthApiResponse): IAuthResponse => ({
  accessToken:  "",  // tokens are now in httpOnly cookies — not in response body
  refreshToken: "",
  user: {
    id:        data.data.user.id,
    name:      data.data.user.name,
    email:     data.data.user.email,
    role:      data.data.user.role,
    createdAt: "",
  },
});

// ─── Auth API ─────────────────────────────────────────────────────────────────

export const authApi = {
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

  // Cookies are cleared by the backend — no body needed
  logout: async (): Promise<void> => {
    await axiosInstance.post("/auth/logout");
  },

  getMe: async (): Promise<IUser> => {
    const { data } = await axiosInstance.get<GetMeApiResponse>("/auth/me");
    return {
      id:        data.data.user._id,
      name:      data.data.user.name,
      email:     data.data.user.email,
      role:      data.data.user.role,
      createdAt: data.data.user.createdAt,
    };
  },
};