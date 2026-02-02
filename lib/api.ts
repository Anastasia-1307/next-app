import { config } from "./config";

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    username: string;
    role: string;
  };
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

export interface UserInfo {
  sub: string;
  email: string;
  name: string;
  role: string;
}

class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public response?: any
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${config.authServer.baseUrl}${endpoint}`;
  
  console.log("🔍 API Request - URL:", url);
  console.log("🔍 API Request - Options:", options);
  
  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  });

  console.log("🔍 API Response - Status:", response.status);
  console.log("🔍 API Response - StatusText:", response.statusText);

  if (!response.ok) {
    let errorMessage = "Request failed";
    try {
      const errorData = await response.json();
      errorMessage = errorData.error || errorData.message || errorMessage;
      console.log("🔍 API Error - Data:", errorData);
    } catch {
      errorMessage = response.statusText || errorMessage;
    }
    throw new ApiError(errorMessage, response.status);
  }

  const responseData = await response.json();
  console.log("🔍 API Response - Data:", responseData);
  
  // Dacă response-ul are format Elysia cu status/body, extrage body-ul
  if (responseData.status && responseData.body) {
    console.log("🔍 API Response - Elysia format detected, extracting body:", responseData.body);
    return responseData.body;
  }
  
  return responseData;
}

export const api = {
  // Classic auth
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    return apiRequest<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });
  },

  async register(data: RegisterData): Promise<AuthResponse> {
    return apiRequest<AuthResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify({
        email: data.email,
        username: data.name,
        password: data.password,
      }),
    });
  },

  // OAuth flow
  async exchangeCodeForToken(code: string, codeVerifier: string): Promise<TokenResponse> {
    return apiRequest<TokenResponse>("/token", {
      method: "POST",
      body: JSON.stringify({
        grant_type: "authorization_code",
        code,
        client_id: config.authServer.clientId,
        code_verifier: codeVerifier,
      }),
    });
  },

  async getUserInfo(token: string): Promise<UserInfo> {
    return apiRequest<UserInfo>("/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  // OAuth authorization
  initiateOAuthFlow(screen: "login" | "register" = "login", codeChallenge?: string): string {
    const params = new URLSearchParams({
      response_type: "code",
      client_id: config.authServer.clientId,
      redirect_uri: `${config.app.baseUrl}/oauth/callback`,
      code_challenge: codeChallenge || "",
      code_challenge_method: codeChallenge ? "S256" : "",
      screen,
    });
    return `${config.authServer.baseUrl}/authorize?${params.toString()}`;
  },
};

export { ApiError };
