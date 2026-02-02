export const config = {
  authServer: {
    baseUrl: process.env.AUTH_SERVER_URL || "http://localhost:4000",
    clientId: process.env.CLIENT_ID || "nextjs_client",
  },
  jwt: {
    issuer: process.env.JWT_ISSUER || "http://localhost:4000",
    audience: process.env.JWT_AUDIENCE || "nextjs_client",
    jwksUrl: process.env.JWT_JWKS_URL || "http://localhost:4000/.well-known/jwks.json",
  },
  app: {
    baseUrl: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  },
} as const;
