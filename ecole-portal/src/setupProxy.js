const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function configureProxy(app) {
  const target = process.env.REACT_APP_API_GATEWAY_URL || 'http://localhost:8085';

  app.use(
    '/api',
    createProxyMiddleware({
      target,
      changeOrigin: true,
      secure: false,
    })
  );
};
