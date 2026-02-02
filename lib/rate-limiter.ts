import { NextRequest, NextResponse } from 'next/server';
import { RateLimiterMemory } from 'rate-limiter-flexible';

// Rate limiter configurations
const apiLimiter = new RateLimiterMemory({
  keyPrefix: 'api_limit',
  points: 50, // Number of requests
  duration: 60, // Per 1 minute
  blockDuration: 60, // Block for 1 minute
});

const authLimiter = new RateLimiterMemory({
  keyPrefix: 'auth_limit',
  points: 5, // Number of requests
  duration: 900, // Per 15 minutes
  blockDuration: 900, // Block for 15 minutes
});

export async function rateLimitMiddleware(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') || 
            request.headers.get('x-real-ip') || 
            'unknown';
  
  const path = request.nextUrl.pathname;
  
  try {
    // Different limits for different endpoints
    if (path.startsWith('/api/auth')) {
      await authLimiter.consume(ip);
    } else if (path.startsWith('/api/')) {
      await apiLimiter.consume(ip);
    }
    
    return null; // Success
  } catch (rejRes: any) {
    const secs = Math.round(rejRes.msBeforeNext / 1000) || 1;
    
    return NextResponse.json(
      { error: `Too many requests. Try again in ${secs} seconds.` },
      { 
        status: 429,
        headers: {
          'Retry-After': String(secs),
        }
      }
    );
  }
}

export { apiLimiter, authLimiter };
