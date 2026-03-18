export default function TabBar({ tabs, activeTab, editMode, showDashboard, showExport, onSelect, onAddTab, onToggleEdit, onEditTab, onToggleDashboard, onToggleExport }) {
  return (
    <div className="tab-bar-container">
      <div className="tab-bar">
        {!showDashboard && !showExport && tabs.map((t, i) => (
          <button
            key={t.name + i}
            className={`tab-btn${activeTab === i ? ' active' : ''}`}
            onClick={() => onSelect(i)}
            onDoubleClick={() => editMode && onEditTab(i)}
          >
            {t.name}
          </button>
        ))}
        {editMode && !showDashboard && !showExport && (
          <button className="tab-btn add-tab" onClick={onAddTab}>+ tab</button>
        )}
      </div>
      <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
        <button
          className={`gear-btn${showExport ? ' active' : ''}`}
          onClick={onToggleExport}
          title="Export"
        >
          📤
        </button>
        <button
          className={`gear-btn${showDashboard ? ' active' : ''}`}
          onClick={onToggleDashboard}
          title="Dashboard"
        >
          📊
        </button>
        {!showDashboard && !showExport && (
          <button className="gear-btn" onClick={onToggleEdit} title="Customize">
            {editMode ? '✓' : '⚙️'}
          </button>
        )}
      </div>
    </div>
  )
}