const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://localhost:5000',
      changeOrigin: true,
      secure: false,
      logLevel: 'warn',
      on: {
        error: (err, req, res) => {
          console.error('[Proxy Error]', err.message);
          res.status(502).json({ error: 'Backend unreachable. Is the server running on port 5000?' });
        },
      },
    })
  );
};