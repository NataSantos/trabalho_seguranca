/**
 * MIDDLEWARE - Security Headers
 * Aplica cabeçalhos HTTP de segurança em todas as respostas.
 * 
 * PROTEÇÃO HISTORY MANIPULATION:
 * Cabeçalhos Cache-Control impedem que páginas sensíveis
 * sejam armazenadas em cache, evitando manipulação do histórico.
 */
function securityHeaders(req, res, next) {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    next();
}

module.exports = { securityHeaders };
