// AuthMS API Wiki EdgeOne Middleware
const API_TARGET = 'https://api.iam.tianv.com';

export function middleware(context) {
    const { request, rewrite } = context;
    const url = new URL(request.url);

    // 1. API proxy — MUST be checked BEFORE directory rewrite
    //    (otherwise /api/v1/xxx would be rewritten to nonexistent index.html)
    const apiPrefixes = ['/bff/', '/api/v1/', '/oauth/', '/.well-known/'];
    for (const p of apiPrefixes) {
        if (url.pathname.startsWith(p)) {
            return rewrite(API_TARGET + url.pathname + url.search);
        }
    }

    // 2. Pass through static files with extensions
    if (/\.\w{2,4}$/.test(url.pathname)) return context.next();

    // 3. Wiki pages: directory → index.html rewrite
    //    EdgeOne does NOT auto-serve index.html for directories.
    //    Must explicitly rewrite (same pattern as existing middleware.js).
    //    /api/ → /api/index.html
    //    /api/identity-service/ → /api/identity-service/index.html
    //    /api/identity-service/POST-auth-login/ → .../index.html
    if (url.pathname.startsWith('/api/')) {
        const cleanPath = url.pathname.replace(/\/$/, '');
        return rewrite(cleanPath + '/index.html');
    }

    // 4. Root → index.html
    if (url.pathname === '/') {
        return rewrite('/index.html');
    }

    return context.next();
}

export const config = { matcher: ['/:path*'] };
