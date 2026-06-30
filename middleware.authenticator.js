// AuthMS Authenticator Portal EdgeOne Middleware
// Domain: authenticator.iam.tianv.com
const API_TARGET = 'https://api.iam.tianv.com';

export function middleware(context) {
    const { request, rewrite } = context;
    const url = new URL(request.url);

    const apiPrefixes = ['/bff/', '/api/v1/', '/oauth/', '/.well-known/'];
    for (const p of apiPrefixes) {
        if (url.pathname.startsWith(p)) {
            return rewrite(API_TARGET + url.pathname + url.search);
        }
    }

    if (/\.\w{2,4}$/.test(url.pathname)) return context.next();

    return rewrite('/index.html');
}

export const config = { matcher: ['/:path*'] };
