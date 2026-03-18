import { useState } from 'react'

const PALETTE = [
  '#FFD6D6','#FFDDB6','#FFF3B0','#D4F5C4','#C4E8FF','#E8D5FF',
  '#FFB3B3','#FFCA80','#FFE566','#A8E6A0','#80CCFF','#D4ACFF',
  '#FF8A8A','#FF9F40','#FFD700','#6EBF6E','#4AABFF','#B57BFF',
  '#D4E8D0','#D0E8E8','#E8E0D4','#D0D4E8','#E8D4D8','#E8E4D0',
]

function BtnEditor({ btn, tabIdx, onSave, onDelete, onClose }) {
  const [emoji, setEmoji] = useState(btn.emoji)
  const [label, setLabel] = useState(btn.label)
  const [color, setColor] = useState(btn.color)
  const [type, setType] = useState(btn.type ?? 'tap')
  const [unit, setUnit] = useState(btn.unit ?? '')
  const [double, setDouble] = useState(btn.double ?? false)
  const [label1, setLabel1] = useState(btn.label1 ?? 'first')
  const [label2, setLabel2] = useState(btn.label2 ?? 'second')

  return (
    <>
      <h3>Edit button</h3>
      <div className="modal-preview-row">
        <div className="modal-preview" style={{ background: color }}>
          <span className="btn-emoji">{emoji}</span>
          <span className="btn-label">{label}</span>
        </div>
        <div className="modal-fields">
          <div className="modal-label">Emoji</div>
          <input
            value={emoji}
            onChange={e => setEmoji(e.target.value)}
            placeholder="😊"
            inputMode="text"
            style={{ fontSize: 24, textAlign: 'center' }}
            />
          <div className="modal-label">Label</div>
          <input value={label} onChange={e => setLabel(e.target.value)} placeholder="Button name" />
        </div>
      </div>

      <div className="modal-label">Type</div>
      <div className="type-toggle">
        <button
          className={`type-btn${type === 'tap' ? ' active' : ''}`}
          onClick={() => setType('tap')}
        >
          Tap
        </button>
        <button
          className={`type-btn${type === 'measure' ? ' active' : ''}`}
          onClick={() => setType('measure')}
        >
          Measure
        </button>
      </div>

      {type === 'measure' && (
  <>
    <div className="modal-label">Unit</div>
    <input
      value={unit}
      onChange={e => setUnit(e.target.value)}
      placeholder="e.g. lbs, °F, mmHg, cm"
    />
    <div className="modal-label">Values</div>
    <div className="type-toggle">
      <button
        className={`type-btn${!double ? ' active' : ''}`}
        onClick={() => setDouble(false)}
      >
        Single
      </button>
      <button
        className={`type-btn${double ? ' active' : ''}`}
        onClick={() => setDouble(true)}
      >
        Double
      </button>
    </div>
    {double && (
      <>
        <div className="modal-label">First value label</div>
        <input
          value={label1}
          onChange={e => setLabel1(e.target.value)}
          placeholder="e.g. left, sys, before"
        />
        <div className="modal-label">Second value label</div>
        <input
          value={label2}
          onChange={e => setLabel2(e.target.value)}
          placeholder="e.g. right, dia, after"
        />
      </>
    )}
  </>
)}

      <div className="modal-label" style={{ marginTop: 12 }}>Color</div>
      <div className="color-grid">
        {PALETTE.map(c => (
          <div
            key={c}
            className={`color-swatch${color === c ? ' selected' : ''}`}
            style={{ background: c }}
            onClick={() => setColor(c)}
          />
        ))}
      </div>
      <div className="modal-actions">
        <button className="btn-danger" onClick={() => onDelete(tabIdx, btn.id)}>Delete</button>
        <button className="btn-secondary" onClick={onClose}>Cancel</button>
        <button className="btn-primary" onClick={() => onSave(tabIdx, { ...btn, emoji, label, color, type, unit, double, label1, label2 })}>Save</button>
      </div>
    </>
  )
}

function TabEditor({ tab, tabIdx, onSave, onDelete, onClose }) {
  const [name, setName] = useState(tab.name)

  return (
    <>
      <h3>Edit tab</h3>
      <div className="modal-label">Tab name</div>
      <input value={name} onChange={e => setName(e.target.value)} placeholder="Tab name" />
      <div className="modal-actions">
        <button className="btn-danger" onClick={() => onDelete(tabIdx)}>Delete</button>
        <button className="btn-secondary" onClick={onClose}>Cancel</button>
        <button className="btn-primary" onClick={() => onSave(tabIdx, name)}>Save</button>
      </div>
    </>
  )
}

export default function EditModal({ modal, tabs, onSaveBtn, onDeleteBtn, onSaveTab, onDeleteTab, onClose }) {
  return (
    <div className="modal-bg" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        {modal.type === 'editBtn' && (
          <BtnEditor
            btn={modal.btn}
            tabIdx={modal.tabIdx}
            onSave={onSaveBtn}
            onDelete={onDeleteBtn}
            onClose={onClose}
          />
        )}
        {modal.type === 'editTab' && (
          <TabEditor
            tab={tabs[modal.tabIdx]}
            tabIdx={modal.tabIdx}
            onSave={onSaveTab}
            onDelete={onDeleteTab}
            onClose={onClose}
          />
        )}
      </div>
    </div>
  )
}