const express = require('express');
const router = express.Router();

// Random quotes
const quotes = [
  "The best time to plant a tree was 20 years ago. The second best time is now.",
  "You don't have to be great to start, but you have to start to be great.",
  "Simplicity is the ultimate sophistication.",
  "Done is better than perfect.",
  "The only way to do great work is to love what you do.",
  "Code is like humor. When you have to explain it, it's bad.",
  "First, solve the problem. Then, write the code.",
  "Talk is cheap. Show me the code.",
  "Any fool can write code that a computer can understand.",
  "Programs must be written for people to read.",
  "Make it work, make it right, make it fast.",
  "Premature optimization is the root of all evil.",
  "The best error message is the one that never shows up.",
  "Debugging is twice as hard as writing the code in the first place."
];

// GET /api/quote - random quote
router.get('/quote', (req, res) => {
  const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
  res.json({
    quote: randomQuote,
    timestamp: new Date().toISOString()
  });
});

// GET /api/time - current server time
router.get('/time', (req, res) => {
  const now = new Date();
  res.json({
    time: now.toLocaleTimeString(),
    date: now.toLocaleDateString(),
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    unix: Math.floor(now.getTime() / 1000),
    iso: now.toISOString()
  });
});

// GET /api/health - server health check
router.get('/health', (req, res) => {
  res.json({
    status: 'alive',
    uptime: process.uptime(),
    uptimeFormatted: formatUptime(process.uptime()),
    memory: {
      rss: Math.round(process.memoryUsage().rss / 1024 / 1024) + ' MB',
      heapUsed: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + ' MB',
      heapTotal: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + ' MB'
    },
    nodeVersion: process.version,
    platform: process.platform
  });
});

// GET /api/tools - list of available tools
router.get('/tools', (req, res) => {
  res.json({
    tools: [
      { id: 'timer', name: 'Focus Timer', category: 'Productivity' },
      { id: 'tasks', name: 'Tasks', category: 'Organization' },
      { id: 'notes', name: 'Notes', category: 'Writing' },
      { id: 'password', name: 'Passwords', category: 'Security' },
      { id: 'converter', name: 'Converter', category: 'Utility' },
      { id: 'customs', name: 'Customs Duty', category: 'Finance' },
      { id: 'color', name: 'Color Picker', category: 'Design' }
    ],
    total: 7
  });
});

// Helper function
function formatUptime(seconds) {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  return `${days}d ${hours}h ${mins}m ${secs}s`;
}

module.exports = router;