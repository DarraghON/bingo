import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import BingoCard from './BingoCard';
import MikeCardView from './MikeCardView';
import './index.css';

const socket = io();

const userPasswords = [
  { short: "Ben", username: "user1", password: "martini", gender: "boy" },
  { short: "Darragh", username: "user2", password: "spritz", gender: "boy" },
  { short: "Mike", username: "user3", password: "daiquiri", gender: "boy" },
  { short: "Oscar", username: "user4", password: "mojito", gender: "boy" },
  { short: "Patrick", username: "user5", password: "negroni", gender: "boy" },
  { short: "Peter", username: "user6", password: "gimlet", gender: "boy" },
  { short: "Tilly", username: "user7", password: "margarita", gender: "girl" },
  { short: "Sally", username: "user8", password: "manhattan", gender: "girl" },
  { short: "Hannah", username: "user9", password: "julep", gender: "girl" },
  { short: "Jasmine", username: "user10", password: "cobbler", gender: "girl" },
  { short: "Erin", username: "user11", password: "flip", gender: "girl" },
  { short: "Mika", username: "user12", password: "colada", gender: "girl" },
  { short: "Nell", username: "user13", password: "mai-tai", gender: "girl" },
];

function App() {
  const [auth, setAuth] = useState({ token: null, username: null, short: null });
  const [users, setUsers] = useState([]);
  const [cards, setCards] = useState([]);

  // Mike accessibility state
  const [mikeMode, setMikeMode] = useState(false);
  const [mikeStep, setMikeStep] = useState(0); // 0 = gender select, 1 = user select, 2 = show card
  const [mikeGender, setMikeGender] = useState(null);
  const [mikeTarget, setMikeTarget] = useState(null);

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

      // If Mike, activate accessible mode
      if (username === "user3") {
        setMikeMode(true);
        setMikeStep(0);
        setMikeGender(null);
        setMikeTarget(null);
      }
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

  // --- Mike's accessible flow ---
  if (auth.token && mikeMode) {
    // Step 0: select gender
    if (mikeStep === 0) {
      return (
        <div className="mike-access mike-access-bg">
          <h1 className="mike-access-title">Welcome, Mike!</h1>
          <div className="mike-access-prompt">Would you like to view a boy or a girl?</div>
          <div className="mike-access-choices">
            <button className="mike-access-btn" onClick={() => { setMikeGender('boy'); setMikeStep(1); }}>Boy</button>
            <button className="mike-access-btn" onClick={() => { setMikeGender('girl'); setMikeStep(1); }}>Girl</button>
          </div>
        </div>
      );
    }
    // Step 1: select user
    if (mikeStep === 1) {
      const options = userPasswords.filter(u => u.gender === mikeGender && u.username !== "user3");
      return (
        <div className="mike-access mike-access-bg">
          <h1 className="mike-access-title">Select a {mikeGender}</h1>
          <div className="mike-access-choices" style={{ flexDirection: 'column', gap: '1.5em' }}>
            {options.map(u => (
              <button
                key={u.username}
                className="mike-access-btn"
                onClick={() => { setMikeTarget(u.username); setMikeStep(2); }}
                style={{ minWidth: 200, fontSize: '2em', margin: '0.5em 0' }}
              >
                {u.short}
              </button>
            ))}
          </div>
          <button className="mike-access-btn mike-access-back" onClick={() => setMikeStep(0)}>Back</button>
        </div>
      );
    }
    // Step 2: show card for selected user
    if (mikeStep === 2) {
      const targetCard = cards.find(c => c.username === mikeTarget);
      const targetInfo = users.find(u => u.username === mikeTarget);
      return (
        <div className="mike-access mike-access-bg">
          <button className="mike-access-btn mike-access-back" onClick={() => setMikeStep(1)} style={{ marginBottom: 20 }}>Change selection</button>
          <MikeCardView
            short={targetInfo ? targetInfo.short : ""}
            card={targetCard ? targetCard.card : []}
            onMark={(row, col) => handleMark(mikeTarget, row, col)}
            onUnmark={(row, col) => handleUnmark(mikeTarget, row, col)}
          />
        </div>
      );
    }
  }

  // --- Regular view for all other users ---
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
