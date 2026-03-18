export default function NotesArea({ value, onChange }) {
  return (
    <div className="notes-area">
      <div className="notes-label">Notes</div>
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder="Add notes to your next log entry…"
        rows={2}
      />
    </div>
  )
}