import { useState } from 'react'

export default function MeasurementSheet({ entry, onSave, onSkip }) {
  const [value, setValue] = useState('')
  const [value2, setValue2] = useState('')

  function handleSave() {
    const v1 = parseFloat(value)
    const v2 = entry.double ? parseFloat(value2) : null
    if (isNaN(v1)) { onSkip(); return }
    if (entry.double && isNaN(v2)) { onSkip(); return }
    onSave(entry.id, v1, v2)
  }

  return (
    <div className="sheet-bg" onClick={e => e.target === e.currentTarget && onSkip()}>
      <div className="sheet">
        <div className="sheet-header">
          <span className="sheet-emoji">{entry.btnEmoji}</span>
          <span className="sheet-title">{entry.btnLabel}</span>
        </div>
        {entry.double ? (
            <div className="sheet-inputs">
                <div className="sheet-input-wrap">
                <input
                    type="number"
                    inputMode="decimal"
                    value={value}
                    onChange={e => setValue(e.target.value)}
                    placeholder="0"
                    autoFocus
                />
                <span className="sheet-unit">{entry.label1 ?? 'first'}</span>
                </div>
                <div className="sheet-divider">/</div>
                <div className="sheet-input-wrap">
                <input
                    type="number"
                    inputMode="decimal"
                    value={value2}
                    onChange={e => setValue2(e.target.value)}
                    placeholder="0"
                />
                <span className="sheet-unit">{entry.label2 ?? 'second'}</span>
                </div>
                <span className="sheet-unit-main">{entry.unit}</span>
            </div>
            ) : (
          <div className="sheet-inputs">
            <div className="sheet-input-wrap">
              <input
                type="number"
                value={value}
                inputMode="decimal"
                onChange={e => setValue(e.target.value)}
                placeholder="0"
                autoFocus
              />
              <span className="sheet-unit-main">{entry.unit}</span>
            </div>
          </div>
        )}
        <div className="sheet-actions">
          <button className="btn-secondary" onClick={onSkip}>Skip</button>
          <button className="btn-primary" onClick={handleSave}>Save</button>
        </div>
      </div>
    </div>
  )
}