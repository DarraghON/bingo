const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const path = require('path');
const twilio = require('twilio');

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

// --- Twilio Config (using your provided credentials!) ---
const client = twilio(
  "ACb39b27f06e2067164c79fcdef1559ed6", // Account SID
  "56f907f9052455e38210886419a601ef"    // Auth Token
);
const TWILIO_PHONE_NUMBER = "+16573773539";

// --- Usernames, passwords, short/real names mapping, phone numbers ---
const USER_PROFILES = [
  { username: "admin", short: "Admin", name: "Administrator", password: "adminpass" }, // No phone for admin
  { username: "user1", short: "Ben", name: "Ben McElligott", password: "martini", phone: "+353871107017" },
  { username: "user2", short: "Darragh", name: "Darragh O’Neill", password: "spritz", phone: "+353873968824" },
  { username: "user3", short: "Mike", name: "Mike Brady", password: "daiquiri", phone: "+353871054394" },
  { username: "user4", short: "Oscar", name: "Oscar Cross", password: "mojito", phone: "+353874654664" },
  { username: "user5", short: "Patrick", name: "Patrick Cody", password: "negroni", phone: "+353873332901" },
  { username: "user6", short: "Peter", name: "Peter O'Connor", password: "gimlet", phone: "+353858545252" },
  { username: "user7", short: "Tilly", name: "Tilly Ludford", password: "margarita", phone: "+353872779735" },
  { username: "user8", short: "Sally", name: "Sally Foy", password: "manhattan", phone: "+353831334446" },
  { username: "user9", short: "Hannah", name: "Hannah Boylan", password: "julep", phone: "+353830603355" },
  { username: "user10", short: "Jasmine", name: "Jasmine O’Gara", password: "cobbler", phone: "+353871822331" },
  { username: "user11", short: "Erin", name: "Erin Daly", password: "flip", phone: "+353899772860" },
  { username: "user12", short: "Mika", name: "Mika June", password: "colada", phone: "+353867900192" },
  { username: "user13", short: "Nell", name: "Nell O’Hara", password: "mai-tai", phone: "+353830084565" }
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
  if (username !== "admin") {
    bingoCards[username] = buildCard(CARD_LABELS[username]);
  }
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
  if (req.username === "admin") {
    const all = USER_PROFILES
      .filter(u => u.username !== "admin")
      .map(u => ({
        username: u.username,
        short: u.short,
        name: u.name,
        card: bingoCards[u.username]
      }));
    return res.json(all);
  }
  const others = USER_PROFILES
    .filter(u => u.username !== req.username && u.username !== "admin")
    .map(u => ({
      username: u.username,
      short: u.short,
      name: u.name,
      card: bingoCards[u.username]
    }));
  res.json(others);
});

// --- Endpoint for a single user's card (for admin to fetch) ---
app.get('/api/cards/:username', authMiddleware, (req, res) => {
  const { username } = req.params;
  if (req.username !== "admin") return res.status(403).json({ error: "Forbidden" });
  if (!bingoCards[username]) return res.status(404).json({ error: "Not found" });
  res.json({ card: bingoCards[username] });
});

// --- Admin-only update endpoint ---
app.post('/api/cards/:username/labels', authMiddleware, (req, res) => {
  const { username } = req.params;
  const { labelGrid } = req.body;

  if (req.username !== "admin") return res.status(403).json({ error: "Forbidden" });
  if (!bingoCards[username] || !Array.isArray(labelGrid) || labelGrid.length !== 3) {
    return res.status(400).json({ error: 'Invalid card or label grid' });
  }
  if (!labelGrid.every(row => Array.isArray(row) && row.length === 5)) {
    return res.status(400).json({ error: 'Each row must have 5 items' });
  }
  bingoCards[username] = labelGrid.map(row =>
    row.map(label => ({ checked: false, label }))
  );
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

    const card = bingoCards[targetUser];
    if (!card[row][col].checked) {
      card[row][col].checked = true;
      io.to('bingo').emit('card_updated', { targetUser, card });

      // SMS notification via Twilio
      const profile = USER_PROFILES.find(u => u.username === targetUser);
      if (profile && profile.phone) {
        const checkedCount = card.flat().filter(cell => cell.checked).length;
        const remaining = 15 - checkedCount;
        const msg = `You have just completed one of your items, you're so predictable, ${remaining}/15 items remaining`;
        client.messages.create({
          body: msg,
          from: TWILIO_PHONE_NUMBER,
          to: profile.phone
        }).catch(console.error);
      }
    }
  });

  socket.on('unmark_card', ({ targetUser, row, col }) => {
    if (
      !bingoCards[targetUser] ||
      row < 0 || row > 2 ||
      col < 0 || col > 4
    ) return;

    bingoCards[targetUser][row][col].checked = false;
    io.to('bingo').emit('card_updated', { targetUser, card: bingoCards[targetUser] });
  });

  socket.on('disconnect', () => {});
});

// --- Serve frontend build statically (for Vite: use "dist" instead of "build") ---
app.use(express.static(path.join(__dirname, '../client/dist')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
