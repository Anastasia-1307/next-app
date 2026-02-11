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
  refreshToken?: string;
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
  const baseUrl = config.authServer.baseUrl;
  const url = `${baseUrl}${endpoint}`;
  
  console.log("🔍 API Request - Base URL:", baseUrl);
  console.log("🔍 API Request - Endpoint:", endpoint);
  console.log("🔍 API Request - Full URL:", url);
  console.log("🔍 API Request - Method:", options.method || 'GET');
  console.log("🔍 API Request - Options:", options);
  
  if (!baseUrl) {
    throw new ApiError("AUTH_SERVER_URL is not configured", 500);
  }
  
  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  });

  console.log("🔍 API Response - URL:", url);
  console.log("🔍 API Response - Status:", response.status);
  console.log("🔍 API Response - StatusText:", response.statusText);
  console.log("🔍 API Response - Content-Type:", response.headers.get("content-type"));
  console.log("🔍 API Response - Headers:", Object.fromEntries(response.headers.entries()));

  if (!response.ok) {
    let errorMessage = "Request failed";
    try {
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const errorData = await response.json();
        errorMessage = errorData.error || errorData.message || errorMessage;
        console.log("🔍 API Error - Data:", errorData);
      } else {
        const errorText = await response.text();
        errorMessage = `Server returned HTML: ${errorText.substring(0, 100)}...`;
        console.log("🔍 API Error - HTML Response:", errorText.substring(0, 200));
      }
    } catch {
      errorMessage = response.statusText || errorMessage;
    }
    throw new ApiError(errorMessage, response.status);
  }

  const contentType = response.headers.get("content-type");
  if (!contentType || !contentType.includes("application/json")) {
    const text = await response.text();
    console.error("❌ Expected JSON but got:", contentType, text.substring(0, 200));
    
    // If it's an HTML response with DOCTYPE, it's likely an error page
    if (text.includes('<!DOCTYPE')) {
      throw new ApiError(`Server returned HTML error page. Check if the server is running and the endpoint exists. URL: ${url}`, 500);
    }
    
    throw new ApiError(`Expected JSON response but got ${contentType}. Response: ${text.substring(0, 100)}...`, 500);
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

  // TEMPORAR DISABLED
  /*
  async getUserInfo(token?: string): Promise<UserInfo> {
    // Dacă nu e furnizat token, încearcă să-l ia din cookie
    if (!token) {
      token = getAuthTokenFromCookie() || undefined;
    }
    
    console.log("🔍 getUserInfo - Token:", token ? token.substring(0, 50) + "..." : "NULL");
    
    if (!token) {
      throw new Error("No authentication token found");
    }
    
    console.log("🔍 getUserInfo - Token:", token ? token.substring(0, 50) + "..." : "NULL");
    
    if (!token) {
      return getAuthTokenFromCookie() || undefined;
    }
    
    return apiRequest<UserInfo>("/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },
  */

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

// Funcție pentru a obține token din cookie
function getAuthTokenFromCookie(): string | null {
  if (typeof document === 'undefined') {
    // Server-side - nu putem accesa cookies
    return null;
  }
  
  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === 'auth_token') {
      const token = decodeURIComponent(value);
      console.log("🔍 Token from cookie:", token ? token.substring(0, 50) + "..." : "NULL");
      console.log("🔍 Token length:", token ? token.length : 0);
      return token;
    }
  }
  
  console.log("🔍 No auth_token cookie found");
  return null;
}
