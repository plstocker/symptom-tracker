import { useState } from 'react'

export default function Remote({ buttons, editMode, onLog, onAdd }) {
  const [flashId, setFlashId] = useState(null)

  function handleTap(btn) {
    if (!editMode) {
      setFlashId(btn.id)
      setTimeout(() => setFlashId(null), 300)
    }
    onLog(btn)
  }

  return (
    <div className="remote-grid">
      {buttons.map(btn => (
        btn.type === 'measure' ? (
          <button
            key={btn.id}
            className={`remote-btn measure-btn${flashId === btn.id ? ' flash' : ''}`}
            style={{ background: btn.color }}
            onClick={() => handleTap(btn)}
          >
            {editMode && <div className="edit-dot" />}
            <span className="btn-emoji">{btn.emoji}</span>
            <span className="btn-label">{btn.label}</span>
            <span className="btn-unit">{btn.unit}</span>
          </button>
        ) : (
          <button
            key={btn.id}
            className={`remote-btn tap-btn${flashId === btn.id ? ' flash' : ''}`}
            style={{ background: btn.color }}
            onClick={() => handleTap(btn)}
          >
            {editMode && <div className="edit-dot" />}
            <span className="btn-emoji">{btn.emoji}</span>
            <span className="btn-label">{btn.label}</span>
          </button>
        )
      ))}
      {editMode && (
        <button className="add-btn" onClick={onAdd}>+</button>
      )}
    </div>
  )
}