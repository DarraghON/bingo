import React from 'react';

export default function BingoCard({ short, card, onMark, onUnmark }) {
  return (
    <div className="bingo-card">
      <div className="bingo-card-header">{short}</div>
      <table className="bingo-table">
        <tbody>
          {card.map((row, i) => (
            <tr key={i}>
              {row.map((cell, j) => (
                <td
                  key={j}
                  className={`bingo-cell${cell.checked ? " checked" : ""}`}
                  onClick={() => {
                    if (!cell.checked) onMark(i, j);
                    else if (window.confirm('Are you sure you want to deselect this square?')) onUnmark(i, j);
                  }}
                  title={cell.label}
                >
                  <span>{cell.label}</span>
                  <div className="bingo-checkmark">
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
