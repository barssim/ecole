const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function configureProxy(app) {
  const target = process.env.REACT_APP_API_GATEWAY_URL || 'http://localhost:8085';

  app.use(
    '/api',
    createProxyMiddleware({
      target,
      changeOrigin: true,
      secure: false,
      logLevel: 'debug',
      onError(err, req, res) {
        console.error('API proxy error', err && err.message ? err.message : err);
        if (res && !res.headersSent) {
          res.writeHead(502, { 'Content-Type': 'application/json' });
        }
        if (res) {
          res.end(JSON.stringify({ message: 'API proxy error' }));
        }
      },
    })
  );
};
