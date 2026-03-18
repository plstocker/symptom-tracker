import { useState } from 'react'

function fmtTime(ts) {
  const d = new Date(ts)
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' · ' +
    d.toLocaleDateString([], { month: 'short', day: 'numeric' })
}

function fmtValue(entry) {
  if (entry.btnType !== 'measure') return null
  if (entry.value === null) return null
  if (entry.double && entry.value2 !== null) {
    return `${entry.value} / ${entry.value2} ${entry.unit}`
  }
  return `${entry.value} ${entry.unit}`
}

function LogEntry({ entry, onUpdateNote, onDeleteEntry }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(entry.notes ?? '')

  function handleSave() {
    onUpdateNote(entry.id, draft)
    setEditing(false)
  }

  function handleDelete() {
    if (window.confirm('Delete this entry?')) {
      onDeleteEntry(entry.id)
    }
  }

  return (
    <div className="log-entry">
      <div className="log-entry-header">
        <span
          className="log-entry-tag"
          style={{ background: entry.btnColor + '55' }}
        >
          {entry.btnEmoji} {entry.btnLabel}
        </span>
        <span className="log-entry-time">{fmtTime(entry.ts)}</span>
        <button className="entry-edit-btn" onClick={() => setEditing(e => !e)}>
          {editing ? '✕' : '✎'}
        </button>
      </div>
      {fmtValue(entry) && (
        <div className="log-entry-value">{fmtValue(entry)}</div>
      )}
      {entry.weather && (
        <div className="log-entry-meta">
          {entry.weather.temp}°F · {entry.weather.desc}
          {entry.weather.pressure ? ` · ${entry.weather.pressure} hPa` : ''}
        </div>
      )}
      {editing ? (
        <div className="entry-edit-area">
          <textarea
            value={draft}
            onChange={e => setDraft(e.target.value)}
            placeholder="Add a note…"
            rows={2}
          />
          <div className="entry-edit-actions">
            <button className="btn-danger" onClick={handleDelete}>Delete entry</button>
            <button className="btn-secondary" onClick={() => setEditing(false)}>Cancel</button>
            <button className="btn-primary" onClick={handleSave}>Save</button>
          </div>
        </div>
      ) : (
        entry.notes && <div className="log-entry-note">{entry.notes}</div>
      )}
    </div>
  )
}

export default function LogList({ logs, onUpdateNote, onDeleteEntry }) {
  if (logs.length === 0) {
    return <div className="empty-state">Tap a button above to log your first entry</div>
  }

  return (
    <div className="log-list">
      {logs.map(entry => (
        <LogEntry
          key={entry.id}
          entry={entry}
          onUpdateNote={onUpdateNote}
          onDeleteEntry={onDeleteEntry}
        />
      ))}
    </div>
  )
}