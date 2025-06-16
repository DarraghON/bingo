import React from 'react';

export default function MikeCardView({ short, card, onMark, onUnmark }) {
  // Flatten 3x5 card to a list of 15 items with their row/col
  const items = [];
  for (let r = 0; r < card.length; ++r) {
    for (let c = 0; c < card[r].length; ++c) {
      items.push({ ...card[r][c], row: r, col: c });
    }
  }
  return (
    <div className="mike-card-container" tabIndex={0} aria-label={`${short}'s Bingo Card`}>
      <h2 className="mike-card-title">{short}'s Bingo Card</h2>
      <ul className="mike-card-list">
        {items.map((cell, idx) => (
          <li key={idx} className="mike-card-row">
            <button
              className={`mike-card-btn${cell.checked ? " checked" : ""}`}
              onClick={() => {
                if (!cell.checked) onMark(cell.row, cell.col);
                else if (window.confirm('Are you sure you want to deselect this square?')) onUnmark(cell.row, cell.col);
              }}
              aria-pressed={cell.checked}
              aria-label={`${cell.label}, ${cell.checked ? "checked" : "not checked"}`}
            >
              <span className="mike-card-label">{cell.label}</span>
              <span className="mike-card-check">
                {cell.checked ? "✔" : ""}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
