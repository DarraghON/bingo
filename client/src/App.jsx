import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import BingoCard from './BingoCard';
import './index.css';

const socket = io();

const userPasswords = [
  { short: "Admin", username: "admin", password: "adminpass" },
  { short: "Ben", username: "user1", password: "martini" },
  { short: "Darragh", username: "user2", password: "spritz" },
  { short: "Mike", username: "user3", password: "daiquiri" },
  { short: "Oscar", username: "user4", password: "mojito" },
  { short: "Patrick", username: "user5", password: "negroni" },
  { short: "Peter", username: "user6", password: "gimlet" },
  { short: "Tilly", username: "user7", password: "margarita" },
  { short: "Sally", username: "user8", password: "manhattan" },
  { short: "Hannah", username: "user9", password: "julep" },
  { short: "Jasmine", username: "user10", password: "cobbler" },
  { short: "Erin", username: "user11", password: "flip" },
  { short: "Mika", username: "user12", password: "colada" },
  { short: "Nell", username: "user13", password: "mai-tai" },
];

function App() {
  // Step 1: Admin login
  const [adminAuth, setAdminAuth] = useState({ token: null, username: null, short: null });
  // Step 2: Player identity after admin login
  const [adminPlayer, setAdminPlayer] = useState(null);
  const [playerPassword, setPlayerPassword] = useState('');
  const [users, setUsers] = useState([]);
  const [cards, setCards] = useState([]);
  const [adminSelectedUser, setAdminSelectedUser] = useState('');
  const [adminCard, setAdminCard] = useState(null);

  // For normal (non-admin) login
  const [auth, setAuth] = useState({ token: null, username: null, short: null });

  // --- Admin Login Step 1 ---
  const handleAdminLogin = async (username, password, short) => {
    try {
      const res = await axios.post('/api/login', { username, password });
      setAdminAuth({ token: res.data.token, username: res.data.username, short });
    } catch {
      alert("Admin login failed");
    }
  };

  // --- Admin Login Step 2: Player selection ---
  const handleAdminPlayerLogin = e => {
    e.preventDefault();
    if (!adminPlayer || !playerPassword) {
      alert("Select player and enter password");
      return;
    }
    const userObj = userPasswords.find(u => u.username === adminPlayer);
    if (!userObj || userObj.password !== playerPassword) {
      alert("Incorrect player password");
      return;
    }
    setPlayerPassword('');
  };

  // --- Normal player login ---
  const handlePlayerLogin = async (username, password, short) => {
    try {
      const res = await axios.post('/api/login', { username, password });
      setAuth({ token: res.data.token, username: res.data.username, short });
    } catch {
      alert("Login failed");
    }
  };

  // --- Data loading ---
  useEffect(() => {
    // For both admin and player, fetch users/cards
    const token = adminAuth.token || auth.token;
    if (!token) return;
    (async () => {
      const resUsers = await axios.get('/api/users', {
        headers: { Authorization: token }
      });
      setUsers(resUsers.data);

      const resCards = await axios.get('/api/cards', {
        headers: { Authorization: token }
      });
      setCards(resCards.data);
    })();
  }, [adminAuth, auth]);

  // --- Socket setup for real time updates ---
  useEffect(() => {
    const username = adminAuth.username || auth.username;
    const token = adminAuth.token || auth.token;
    if (!token || !username) return;
    socket.emit('join', { username });

    socket.on('card_updated', ({ targetUser, card }) => {
      setCards(prev =>
        prev.map(c => (c.username === targetUser ? { ...c, card } : c))
      );
    });
    return () => socket.off('card_updated');
  }, [adminAuth, auth]);

  // --- Admin: load selected user's card for editing ---
  useEffect(() => {
    if (!adminAuth.token || !adminPlayer || !adminSelectedUser) {
      setAdminCard(null);
      return;
    }
    (async () => {
      const res = await axios.get(`/api/cards/${adminSelectedUser}`, {
        headers: { Authorization: adminAuth.token }
      });
      setAdminCard(res.data.card.map(row => row.map(cell => cell.label)));
    })();
  }, [adminAuth, adminPlayer, adminSelectedUser]);

  // --- Bingo marking ---
  const handleMark = (username, row, col) => {
    const token = adminAuth.token || auth.token;
    if (!token) return;
    socket.emit('mark_card', { targetUser: username, row, col });
  };
  const handleUnmark = (username, row, col) => {
    const token = adminAuth.token || auth.token;
    if (!token) return;
    socket.emit('unmark_card', { targetUser: username, row, col });
  };

  // --- Admin: update card ---
  const handleAdminSubmit = async e => {
    e.preventDefault();
    await axios.post(`/api/cards/${adminSelectedUser}/labels`, {
      labelGrid: adminCard
    }, { headers: { Authorization: adminAuth.token } });
    alert("Card updated!");
  };

  // --- Admin Login UI ---
  if (!adminAuth.token && !auth.token) {
    return (
      <div style={{ maxWidth: 300, margin: '100px auto', padding: 20, border: '1px solid #ccc' }}>
        <h2>Login</h2>
        <LoginForm onLogin={handlePlayerLogin} adminAllowed onAdminLogin={handleAdminLogin} />
      </div>
    );
  }

  // --- After Admin Login: select player identity ---
  if (adminAuth.token && !adminPlayer) {
    return (
      <div style={{ maxWidth: 320, margin: '100px auto', padding: 20, border: '1px solid #ccc' }}>
        <h2>Admin: Select Player Identity</h2>
        <form onSubmit={handleAdminPlayerLogin}>
          <div>
            <select
              value={adminPlayer || ''}
              onChange={e => setAdminPlayer(e.target.value)}
              style={{ width: '100%', marginBottom: 10 }}
            >
              <option value="">-- Select your player --</option>
              {userPasswords.filter(u => u.username !== 'admin').map(u =>
                <option value={u.username} key={u.username}>{u.short}</option>
              )}
            </select>
          </div>
          <div>
            <input
              value={playerPassword}
              type="text"
              onChange={e => setPlayerPassword(e.target.value)}
              placeholder="Your player password"
              style={{ width: '100%', marginBottom: 10 }}
            />
          </div>
          <button type="submit" style={{ width: '100%' }}>Continue</button>
        </form>
      </div>
    );
  }

  // --- Admin dashboard ---
  if (adminAuth.token && adminPlayer) {
    return (
      <div style={{ padding: 20 }}>
        <h1>Bingo Admin</h1>
        <div style={{ marginBottom: 10 }}>
          Logged in as Admin ({users.find(u => u.username === adminPlayer)?.short || adminPlayer})
        </div>
        <div style={{ maxWidth: 400, marginBottom: 20 }}>
          <label>
            Select Player to Edit:&nbsp;
            <select
              value={adminSelectedUser}
              onChange={e => setAdminSelectedUser(e.target.value)}
            >
              <option value="">-- choose player --</option>
              {users
                .filter(u => u.username !== 'admin' && u.username !== adminPlayer)
                .map(u =>
                  <option key={u.username} value={u.username}>{u.short}</option>
                )}
            </select>
          </label>
        </div>
        {adminCard && (
          <form onSubmit={handleAdminSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10, maxWidth: 600 }}>
              {adminCard.map((row, i) =>
                row.map((label, j) => (
                  <input
                    key={i + '-' + j}
                    type="text"
                    value={label}
                    onChange={e => {
                      const updated = adminCard.map(arr => [...arr]);
                      updated[i][j] = e.target.value;
                      setAdminCard(updated);
                    }}
                    style={{ padding: 8, borderRadius: 6, border: '1px solid #bbb', fontSize: 15 }}
                  />
                ))
              )}
            </div>
            <button type="submit" style={{ marginTop: 22, padding: '10px 24px', fontSize: 16, borderRadius: 6, background: "#56e68c", border: 0 }}>
              Update Card
            </button>
          </form>
        )}
      </div>
    );
  }

  // --- Player dashboard (normal login) ---
  if (auth.token && auth.username) {
    return (
      <div style={{ padding: 20 }}>
        <h1>Bingo Dashboard</h1>
        <div style={{ marginBottom: 10 }}>
          Logged in as <b>{auth.short}</b>
        </div>
        <div className="bingo-dashboard-container">
          {cards.map(({ username, short, card }) => (
            <BingoCard
              key={username}
              short={short}
              card={card}
              onMark={(row, col) => handleMark(username, row, col)}
              onUnmark={(row, col) => handleUnmark(username, row, col)}
            />
          ))}
        </div>
      </div>
    );
  }

  return null;
}

// --- Modified Login Form (allows admin and normal login) ---
function LoginForm({ onLogin, adminAllowed, onAdminLogin }) {
  const [selected, setSelected] = useState(userPasswords[0]);
  const [password, setPassword] = useState('');

  const submit = e => {
    e.preventDefault();
    if (adminAllowed && selected.username === 'admin') {
      onAdminLogin(selected.username, password, selected.short);
    } else {
      onLogin(selected.username, password, selected.short);
    }
  };

  return (
    <form onSubmit={submit}>
      <div>
        <select
          value={selected.username}
          onChange={e => {
            const found = userPasswords.find(u => u.username === e.target.value);
            setSelected(found);
            setPassword('');
          }}
          style={{ width: '100%', marginBottom: 10 }}
        >
          {userPasswords.map(u =>
            <option value={u.username} key={u.username}>{u.short}</option>
          )}
        </select>
      </div>
      <div>
        <input
          value={password}
          type="text"
          onChange={e => setPassword(e.target.value)}
          placeholder="Password"
          style={{ width: '100%', marginBottom: 10 }}
        />
      </div>
      <button type="submit" style={{ width: '100%' }}>Login</button>
    </form>
  );
}

export default App;
