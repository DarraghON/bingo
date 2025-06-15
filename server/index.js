const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const path = require('path');

const PORT = process.env.PORT || 4000;

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// --- Usernames, passwords, and short/real names mapping ---
const USER_PROFILES = [
  { username: "user1", short: "Ben", name: "Ben McElligott", password: "martini" },
  { username: "user2", short: "Darragh", name: "Darragh O’Neill", password: "spritz" },
  { username: "user3", short: "Mike", name: "Mike Brady", password: "daiquiri" },
  { username: "user4", short: "Oscar", name: "Oscar Cross", password: "mojito" },
  { username: "user5", short: "Patrick", name: "Patrick Cody", password: "negroni" },
  { username: "user6", short: "Peter", name: "Peter O'Connor", password: "gimlet" },
  { username: "user7", short: "Tilly", name: "Tilly Ludford", password: "margarita" },
  { username: "user8", short: "Sally", name: "Sally Foy", password: "manhattan" },
  { username: "user9", short: "Hannah", name: "Hannah Boylan", password: "julep" },
  { username: "user10", short: "Jasmine", name: "Jasmine O’Gara", password: "cobbler" },
  { username: "user11", short: "Erin", name: "Erin Daly", password: "flip" },
  { username: "user12", short: "Mika", name: "Mika June", password: "colada" },
  { username: "user13", short: "Nell", name: "Nell O’Hara", password: "mai-tai" }
];

// --- 15 items per user (3x5 grid) ---
const CARD_LABELS = {
  "user1": [
    "Sings a song", "Knocks over a glass", "Tells a joke", "Claps hands twice", "Waves hello",
    "Takes a selfie", "Laughs loudly", "Raises hand", "Says “Bingo!”", "Dances for 5 seconds",
    "Makes a funny face", "Snaps fingers", "Drinks water", "Points at someone", "Winks"
  ],
  "user2": [
    "Sings a song", "Claps hands twice", "Tells a joke", "Stands up", "Winks",
    "Takes a deep breath", "Laughs loudly", "Raises hand", "Says “Bingo!”", "Knocks over a glass",
    "Makes a funny face", "Dances for 5 seconds", "Drinks water", "Waves hello", "Points at someone"
  ],
  "user3": [
    "Tells a joke", "Claps hands twice", "Sings a song", "Raises hand", "Laughs loudly",
    "Knocks over a glass", "Takes a selfie", "Makes a funny face", "Winks", "Drinks water",
    "Points at someone", "Says “Bingo!”", "Waves hello", "Dances for 5 seconds", "Stands up"
  ],
  "user4": [
    "Knocks over a glass", "Sings a song", "Claps hands twice", "Laughs loudly", "Makes a funny face",
    "Raises hand", "Winks", "Takes a selfie", "Dances for 5 seconds", "Says “Bingo!”",
    "Points at someone", "Drinks water", "Waves hello", "Stands up", "Tells a joke"
  ],
  "user5": [
    "Sings a song", "Knocks over a glass", "Tells a joke", "Claps hands twice", "Laughs loudly",
    "Waves hello", "Raises hand", "Makes a funny face", "Takes a selfie", "Says “Bingo!”",
    "Points at someone", "Dances for 5 seconds", "Drinks water", "Winks", "Stands up"
  ],
  "user6": [
    "Claps hands twice", "Sings a song", "Laughs loudly", "Knocks over a glass", "Tells a joke",
    "Raises hand", "Takes a selfie", "Makes a funny face", "Waves hello", "Says “Bingo!”",
    "Points at someone", "Dances for 5 seconds", "Drinks water", "Winks", "Stands up"
  ],
  "user7": [
    "Sings a song", "Knocks over a glass", "Claps hands twice", "Laughs loudly", "Tells a joke",
    "Raises hand", "Makes a funny face", "Takes a selfie", "Waves hello", "Says “Bingo!”",
    "Points at someone", "Dances for 5 seconds", "Drinks water", "Winks", "Stands up"
  ],
  "user8": [
    "Claps hands twice", "Sings a song", "Laughs loudly", "Knocks over a glass", "Tells a joke",
    "Raises hand", "Makes a funny face", "Takes a selfie", "Waves hello", "Says “Bingo!”",
    "Points at someone", "Dances for 5 seconds", "Drinks water", "Winks", "Stands up"
  ],
  "user9": [
    "Sings a song", "Knocks over a glass", "Claps hands twice", "Laughs loudly", "Tells a joke",
    "Raises hand", "Makes a funny face", "Takes a selfie", "Waves hello", "Says “Bingo!”",
    "Points at someone", "Dances for 5 seconds", "Drinks water", "Winks", "Stands up"
  ],
  "user10": [
    "Claps hands twice", "Sings a song", "Laughs loudly", "Knocks over a glass", "Tells a joke",
    "Raises hand", "Makes a funny face", "Takes a selfie", "Waves hello", "Says “Bingo!”",
    "Points at someone", "Dances for 5 seconds", "Drinks water", "Winks", "Stands up"
  ],
  "user11": [
    "Sings a song", "Knocks over a glass", "Claps hands twice", "Laughs loudly", "Tells a joke",
    "Raises hand", "Makes a funny face", "Takes a selfie", "Waves hello", "Says “Bingo!”",
    "Points at someone", "Dances for 5 seconds", "Drinks water", "Winks", "Stands up"
  ],
  "user12": [
    "Claps hands twice", "Sings a song", "Laughs loudly", "Knocks over a glass", "Tells a joke",
    "Raises hand", "Makes a funny face", "Takes a selfie", "Waves hello", "Says “Bingo!”",
    "Points at someone", "Dances for 5 seconds", "Drinks water", "Winks", "Stands up"
  ],
  "user13": [
    "Sings a song", "Knocks over a glass", "Claps hands twice", "Laughs loudly", "Tells a joke",
    "Raises hand", "Makes a funny face", "Takes a selfie", "Waves hello", "Says “Bingo!”",
    "Points at someone", "Dances for 5 seconds", "Drinks water", "Winks", "Stands up"
  ]
};

// --- Helper: build a 3x5 grid from label array ---
function buildCard(labels) {
  const grid = [];
  for (let r = 0; r < 3; r++) {
    grid.push([]);
    for (let c = 0; c < 5; c++) {
      const idx = r * 5 + c;
      grid[r].push({ checked: false, label: labels[idx] });
    }
  }
  return grid;
}

// --- Map of username => card (3x5 array of {checked,label}) ---
const bingoCards = {};
USER_PROFILES.forEach(({ username }) => {
  bingoCards[username] = buildCard(CARD_LABELS[username]);
});

// --- In-memory sessions ---
const sessions = {}; // sessionToken -> username

// --- Auth endpoints ---
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  const user = USER_PROFILES.find(u => u.username === username && u.password === password);
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });
  const token = Math.random().toString(36).slice(2);
  sessions[token] = username;
  res.json({ token, username });
});

const authMiddleware = (req, res, next) => {
  const token = req.headers['authorization'];
  if (!token || !sessions[token]) return res.status(401).json({ error: 'Unauthorized' });
  req.username = sessions[token];
  next();
};

// --- User info endpoint (short names included) ---
app.get('/api/users', authMiddleware, (req, res) => {
  res.json(USER_PROFILES.map(u => ({
    username: u.username,
    short: u.short,
    name: u.name
  })));
});

// --- Card data endpoint: full card (including short/real name) for all except yourself ---
app.get('/api/cards', authMiddleware, (req, res) => {
  const others = USER_PROFILES
    .filter(u => u.username !== req.username)
    .map(u => ({
      username: u.username,
      short: u.short,
      name: u.name,
      card: bingoCards[u.username]
    }));
  res.json(others);
});

// --- Optional: (admin/host) endpoint to update a user's card labels (3x5 grid) ---
app.post('/api/cards/:username/labels', authMiddleware, (req, res) => {
  const { username } = req.params;
  const { labelGrid } = req.body; // Expecting a 3x5 array of strings

  if (!bingoCards[username] || !Array.isArray(labelGrid) || labelGrid.length !== 3) {
    return res.status(400).json({ error: 'Invalid card or label grid' });
  }
  if (!labelGrid.every(row => Array.isArray(row) && row.length === 5)) {
    return res.status(400).json({ error: 'Each row must have 5 items' });
  }

  // Reset checked status but update labels
  bingoCards[username] = labelGrid.map(row =>
    row.map(label => ({ checked: false, label }))
  );

  // Notify all clients
  io.to('bingo').emit('card_updated', { targetUser: username, card: bingoCards[username] });

  res.json({ success: true });
});

// --- Socket.IO for real-time updates ---
io.on('connection', (socket) => {
  socket.on('join', ({ username }) => {
    socket.username = username;
    socket.join('bingo');
  });

  socket.on('mark_card', ({ targetUser, row, col }) => {
    if (
      !bingoCards[targetUser] ||
      row < 0 || row > 2 ||
      col < 0 || col > 4
    ) return;

    bingoCards[targetUser][row][col].checked = true;
    io.to('bingo').emit('card_updated', { targetUser, card: bingoCards[targetUser] });
  });

  socket.on('disconnect', () => {});
});

// --- Serve frontend build statically (for Render, etc.) ---
const path = require('path');
app.use(express.static(path.join(__dirname, '../client/build')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build/index.html'));
});

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
