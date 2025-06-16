import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';

// Use relative URL for socket.io so it works in production and locally
const socket = io(); // defaults to same-origin

const userPasswords = [
  { short: "Ben", username: "user1", password: "martini" },
  { short: "Darragh", username: "user2", password: "spritz" },
  { short: "Mike", username: "user3", password: "daiquiri" },
  { short: "Oscar", username: "user4", password: "mojito" },
  { short: "Patrick", username: "user5", password: "negroni" },
  { short: "Peter", username: "user6", passwsord: "gimlet" },
  { short: "Tilly", username: "user7", password: "margarita" },
  { short: "Sally", username: "user8", password: "manhattan" },
  { short: "Hannah", username: "user9", password: "julep" },
  { short: "Jasmine", username: "user10", password: "cobbler" },
  { short: "Erin", username: "user11", password: "flip" },
  { short: "Mika", username: "user12", password: "colada" },
  { short: "Nell", username: "user13", password: "mai-tai" },
];

function BingoCard({ short, card, onMark, onUnmark }) {
  return (
    <div style={{ margin: 10, border: '1px solid #ccc', display: 'inline-block', minWidth: 320 }}>
      <div style={{ fontWeight: 'bold', textAlign: 'center', marginBottom: 5 }}>{short}</div>
      <table style={{ borderCollapse: 'collapse', width: '100%' }}>
        <tbody>
          {card.map((row, i) => (
            <tr key={i}>
              {row.map((cell, j) => (
                <td
                  key={j}
                  style={{
                    border: '1px solid #888',
                    width: 100,
                    height: 55,
                    background: cell.checked ? '#7fffd4' : '#fff',
                    cursor: 'pointer',
                    textAlign: 'center',
                    verticalAlign: 'middle',
                    fontSize: 14,
                    padding: 2,
                    position: 'relative'
                  }}
                  onClick={() => {
                    if (!cell.checked) {
                      onMark(i, j);
                    } else {
                      if (window.confirm('Are you sure you want to deselect this square?')) {
                        onUnmark(i, j);
                      }
                    }
                  }}
                  title={cell.label}
                >
                  <span style={{ opacity: cell.checked ? 0.6 : 1 }}>
                    {cell.label}
                  </span>
                  <div style={{
                    position: 'absolute',
                    right: 2,
                    bottom: 2,
                    fontWeight: 'bold',
                    color: cell.checked ? '#0c6' : '#ccc',
                    fontSize: 20
                  }}>
                    {cell.checked ? '✔' : ''}
                  </div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function App() {
  const [auth, setAuth] = useState({ token: null, username: null, short: null });
  const [users, setUsers] = useState([]);
  const [cards, setCards] = useState([]);

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

  const handleMark = (username, row, col) => {
    if (!auth.token) return;
    socket.emit('mark_card', { targetUser: username, row, col });
  };

  const handleUnmark = (username, row, col) => {
    if (!auth.token) return;
    socket.emit('unmark_card', { targetUser: username, row, col });
  };

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
      <div>
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
