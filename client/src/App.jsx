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
  const [auth, setAuth] = useState({ token: null, username: null, short: null });
  const [users, setUsers] = useState([]);
  const [cards, setCards] = useState([]);
  const [adminSelectedUser, setAdminSelectedUser] = useState('');
  const [adminCard, setAdminCard] = useState(null);

  useEffect(() => {
    if (!auth.token) return;
    socket.emit('join', { username: auth.username });

    socket.on('card_updated', ({ targetUser, card }) => {
      setCards(prev =>
        prev.map(c => (c.username === targetUser ? { ...c, card } : c))
      );
    });

    return () => {
      socket.off('card_updated');
    };
  }, [auth]);

  const login = async (username, password, short) => {
    try {
      const res = await axios.post('/api/login', { username, password });
      setAuth({ token: res.data.token, username: res.data.username, short });
    } catch (e) {
      alert('Login failed');
    }
  };

  useEffect(() => {
    if (!auth.token) return;
    (async () => {
      const resUsers = await axios.get('/api/users', {
        headers: { Authorization: auth.token }
      });
      setUsers(resUsers.data);

      const resCards = await axios.get('/api/cards', {
        headers: { Authorization: auth.token }
      });
      setCards(resCards.data);
    })();
  }, [auth]);

  // --- Admin card editing logic ---
  useEffect(() => {
    if (auth.username !== "admin" || !adminSelectedUser) {
      setAdminCard(null);
      return;
    }
    (async () => {
      const res = await axios.get(`/api/cards/${adminSelectedUser}`, {
        headers: { Authorization: auth.token }
      });
      // Flatten to array of arrays of strings for the form
      setAdminCard(res.data.card.map(row => row.map(cell => cell.label)));
    })();
  }, [auth, adminSelectedUser]);

  const handleMark = (username, row, col) => {
    if (!auth.token) return;
    socket.emit('mark_card', { targetUser: username, row, col });
  };

  const handleUnmark = (username, row, col) => {
    if (!auth.token) return;
    socket.emit('unmark_card', { targetUser: username, row, col });
  };

  // --- Admin card update submit ---
  const handleAdminSubmit = async e => {
    e.preventDefault();
    await axios.post(`/api/cards/${adminSelectedUser}/labels`, {
      labelGrid: adminCard
    }, { headers: { Authorization: auth.token } });
    alert("Card updated!");
  };

  // --- Render admin card editor ---
  if (auth.username === "admin") {
    return (
      <div style={{ padding: 20 }}>
        <h1>Bingo Admin</h1>
        <div style={{ maxWidth: 400, marginBottom: 20 }}>
          <label>
            Select Player:&nbsp;
            <select value={adminSelectedUser} onChange={e => setAdminSelectedUser(e.target.value)}>
              <option value="">-- choose player --</option>
              {users.filter(u => u.username !== "admin").map(u =>
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

  if (!auth.token) {
    return (
      <div style={{ maxWidth: 300, margin: '100px auto', padding: 20, border: '1px solid #ccc' }}>
        <h2>Login</h2>
        <LoginForm onLogin={login} />
      </div>
    );
  }

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

function LoginForm({ onLogin }) {
  const [selected, setSelected] = useState(userPasswords[0]);
  const [password, setPassword] = useState('');

  const submit = e => {
    e.preventDefault();
    onLogin(selected.username, password, selected.short);
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
