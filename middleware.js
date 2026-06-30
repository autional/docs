// AuthMS EdgeOne Pages Middleware
// - Root redirect: / → /zh/ or /en/ based on Accept-Language
// - API proxy: /api/v1/* → backend
// - Multi-SPA fallback: client-side routes → index.html

export function middleware(context) {
    const { request, rewrite } = context;
    const url = new URL(request.url);

    // Root: server-side language redirect (SEO-safe 302)
    if (url.pathname === '/') {
        const lang = (request.headers.get('accept-language') || '').startsWith('en') ? 'en' : 'zh';
        return Response.redirect('/' + lang + '/', 302);
    }

    // API proxy: forward /api/v1/* to backend
    if (url.pathname.startsWith('/api/v1/')) {
        return rewrite(`https://api.1266280.com${url.pathname}${url.search}`);
    }

    // Pass through real files: assets with extensions, env.js, sw.js, etc.
    if (/\.\w{2,4}$/.test(url.pathname)) {
        return context.next();
    }

    // Multi-SPA fallback per subpath prefix
    const spaRoots = [
        '/zh/', '/en/',
        '/auth/', '/admin/', '/developer/', '/user/',
        '/security/', '/status/',
        '/authenticator/', '/trust/', '/platform/'
    ];

    for (const root of spaRoots) {
        if (url.pathname.startsWith(root)) {
            return rewrite(root + 'index.html');
        }
    }

    // Docs specs — static JSON files without extension, pass through directly
    if (url.pathname.startsWith('/docs/specs/')) {
        return context.next();
    }

    // Docs — each service has its own directory with index.html
    // /docs/ → /docs/index.html
    // /docs/identity-service → /docs/identity-service/index.html
    if (url.pathname.startsWith('/docs/')) {
        const cleanPath = url.pathname.replace(/\/$/, '');
        return rewrite(cleanPath + '/index.html');
    }

    // Non-SPA paths (content/) pass through
    return context.next();
}

export const config = {
    matcher: ['/:path*'],
};
