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
      throw new ApiError(`Server returned HTML error page. Check if server is running and endpoint exists. URL: ${url}`, 500);
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
  
  // Dacă response-ul are doar user (de la middleware de eroare), aruncă eroare
  if (responseData.user && !responseData.status && Object.keys(responseData).length === 1) {
    console.error("❌ API Response - Got user object instead of data - likely auth error");
    throw new ApiError("Authentication or authorization error", response.status, responseData);
  }
  
  return responseData;
}

// Separate function for resource server requests
async function resourceApiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const baseUrl = config.resourceServer.baseUrl;
  const url = `${baseUrl}${endpoint}`;
  
  console.log("🔍 RESOURCE API Request - Base URL:", baseUrl);
  console.log("🔍 RESOURCE API Request - Endpoint:", endpoint);
  console.log("🔍 RESOURCE API Request - Full URL:", url);
  console.log("🔍 RESOURCE API Request - Method:", options.method || 'GET');
  
  if (!baseUrl) {
    throw new ApiError("RESOURCE_SERVER_URL is not configured", 500);
  }
  
  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  });

  console.log("🔍 RESOURCE API Response - URL:", url);
  console.log("🔍 RESOURCE API Response - Status:", response.status);

  if (!response.ok) {
    let errorMessage = "Request failed";
    try {
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const errorData = await response.json();
        errorMessage = errorData.error || errorData.message || errorMessage;
        console.log("🔍 RESOURCE API Error - Data:", errorData);
      } else {
        const errorText = await response.text();
        errorMessage = `Server returned HTML: ${errorText.substring(0, 100)}...`;
        console.log("🔍 RESOURCE API Error - HTML Response:", errorText.substring(0, 200));
      }
    } catch {
      errorMessage = response.statusText || errorMessage;
    }
    throw new ApiError(errorMessage, response.status);
  }

  const responseData = await response.json();
  console.log("🔍 RESOURCE API Response - Data:", responseData);
  
  // Dacă response-ul are format Elysia cu status/body, extrage body-ul
  if (responseData.status && responseData.body) {
    console.log("🔍 RESOURCE API Response - Elysia format detected, extracting body:", responseData.body);
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

export const resourceApi = {
  // Admin endpoints
  async getUsers(): Promise<any> {
    return resourceApiRequest<any>("/api/admin/users");
  },

  async getUserLogs(): Promise<any> {
    return resourceApiRequest<any>("/api/admin/user-logs");
  },

  async getOAuthUsersMerged(): Promise<any> {
    return resourceApiRequest<any>("/api/admin/oauth-users-merged");
  },

  async getMedicInfo(): Promise<any> {
    return resourceApiRequest<any>("/api/admin/medic-info");
  },

  async getProgramLucru(): Promise<any> {
    return resourceApiRequest<any>("/api/admin/program-lucru");
  },

  async getSpecialitati(): Promise<any> {
    return resourceApiRequest<any>("/api/admin/specialitati");
  },

  async getProgramari(): Promise<any> {
    return resourceApiRequest<any>("/api/admin/programari");
  },

  async getPasswordResetTokens(): Promise<any> {
    return resourceApiRequest<any>("/api/admin/password-reset-tokens");
  },

  async createMedic(data: any): Promise<any> {
    return resourceApiRequest<any>("/api/admin/medic-info", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async updateMedic(id: string, data: any): Promise<any> {
    return resourceApiRequest<any>(`/api/admin/medic-info/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  async deleteMedic(id: string): Promise<any> {
    return resourceApiRequest<any>(`/api/admin/medic-info/${id}`, {
      method: "DELETE",
    });
  },

  async createSpecialitate(data: any): Promise<any> {
    return resourceApiRequest<any>("/api/admin/specialitati", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async updateSpecialitate(id: string, data: any): Promise<any> {
    return resourceApiRequest<any>(`/api/admin/specialitati/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  async deleteSpecialitate(id: string): Promise<any> {
    return resourceApiRequest<any>(`/api/admin/specialitati/${id}`, {
      method: "DELETE",
    });
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
