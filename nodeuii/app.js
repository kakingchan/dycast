const express = require('express');
const path = require('path');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();

const dir = 'webapp'

// 配置静态资源目录
app.use('/assets', express.static(path.join(__dirname, dir, 'assets')));
app.use('/js', express.static(path.join(__dirname, dir,'js')));

app.use('/dy/', createProxyMiddleware({
  target: 'https://live.douyin.com/',
  changeOrigin: true,
  onProxyRes: (proxyRes) => {
    proxyRes.headers['proxy-buffer-size'] = '64k';
    proxyRes.headers['proxy-buffers'] = '32 64k';
    proxyRes.headers['proxy-busy-buffers-size'] = '128k';
  },
  pathRewrite: {
    '^/dy': '', // 重写请求路径，去掉 /dy
  },
}));

// 访问根目录时返回当前目录下的 index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname,dir, 'index.html'));
});

const port = 3000;
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});