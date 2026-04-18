// Data Transfer Objects for Auth API
// These match exactly what the backend sends and receives

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthApiResponse {
  status: string;
  accessToken: string;
  refreshToken: string;
  data: {
    user: {
      id: string;
      name: string;
      email: string;
      role: "customer" | "admin";
    };
  };
}

export interface RefreshApiResponse {
  status: string;
  accessToken: string;
}

export interface GetMeApiResponse {
  status: string;
  data: {
    user: {
      _id: string;
      name: string;
      email: string;
      role: "customer" | "admin";
      createdAt: string;
    };
  };
}