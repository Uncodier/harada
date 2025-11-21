import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { type NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const token = requestUrl.searchParams.get('token');
  const type = requestUrl.searchParams.get('type');
  const next = requestUrl.searchParams.get('next') || '/dashboard';

  const supabase = await createClient();

  // Handle OAuth callback with code
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!error) {
      return redirectTo(request, requestUrl, next);
    }
  }

  // Handle email confirmation and password reset tokens
  if (token && type) {
    if (type === 'email') {
      // Email confirmation
      const { error } = await supabase.auth.verifyOtp({
        token_hash: token,
        type: 'email',
      });

      if (!error) {
        return redirectTo(request, requestUrl, '/dashboard');
      }
    } else if (type === 'recovery') {
      // Password reset - redirect to reset password page with token
      return NextResponse.redirect(
        `${requestUrl.origin}/auth/reset-password?token=${token}`
      );
    } else if (type === 'magiclink') {
      // Magic link
      const { error } = await supabase.auth.verifyOtp({
        token_hash: token,
        type: 'magiclink',
      });

      if (!error) {
        return redirectTo(request, requestUrl, '/dashboard');
      }
    }
  }

  // Return the user to login page with error
  return NextResponse.redirect(
    `${requestUrl.origin}/login?error=auth_callback_error`
  );
}

function redirectTo(request: NextRequest, requestUrl: URL, path: string) {
  const forwardedHost = request.headers.get('x-forwarded-host');
  const isLocalEnv = process.env.NODE_ENV === 'development';

  if (isLocalEnv) {
    return NextResponse.redirect(`${requestUrl.origin}${path}`);
  } else if (forwardedHost) {
    return NextResponse.redirect(`https://${forwardedHost}${path}`);
  } else {
    return NextResponse.redirect(`${requestUrl.origin}${path}`);
  }
}

