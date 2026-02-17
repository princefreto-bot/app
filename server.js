const express = require('express');
const compression = require('compression');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Enable gzip compression
app.use(compression());

// Serve static files from the dist directory
app.use(express.static(path.join(__dirname, 'dist'), {
  maxAge: '1y',
  etag: true
}));

// Serve video and other assets from public folder
app.use(express.static(path.join(__dirname, 'public'), {
  maxAge: '1d'
}));

// Handle SPA routing - always return index.html for non-file requests
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 EduAnalytics SaaS is running on port ${PORT}`);
  console.log(`📊 Access the app at http://localhost:${PORT}`);
});
