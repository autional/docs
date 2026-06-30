// AuthMS Auth Portal EdgeOne Middleware
// Domain: auth.iam.tianv.com
// Serves auth-pages SPA — login, register, forgot-password, MFA challenge, etc.
const API_TARGET = 'https://api.iam.tianv.com';

export function middleware(context) {
    const { request, rewrite } = context;
    const url = new URL(request.url);

    // 1. API proxy
    const apiPrefixes = ['/bff/', '/api/v1/', '/oauth/', '/.well-known/'];
    for (const p of apiPrefixes) {
        if (url.pathname.startsWith(p)) {
            return rewrite(API_TARGET + url.pathname + url.search);
        }
    }

    // 2. Pass through static files with extensions
    if (/\.\w{2,4}$/.test(url.pathname)) return context.next();

    // 3. SPA fallback — all paths → index.html
    return rewrite('/index.html');
}

export const config = { matcher: ['/:path*'] };
