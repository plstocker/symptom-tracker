import { useState, useEffect } from 'react'
import { db } from './db'
import TabBar from './components/TabBar'
import Remote from './components/Remote'
import NotesArea from './components/NotesArea'
import WeatherBar from './components/WeatherBar'
import LogList from './components/LogList'
import EditModal from './components/EditModal'
import MeasurementSheet from './components/MeasurementSheet'
import Dashboard from './components/Dashboard'
import ExportPanel from './components/ExportPanel'
import './App.css'

const DEFAULT_TABS = [
  {
    name: 'Symptoms',
    buttons: [
      { id: 'b1', emoji: '🤕', label: 'Headache', color: '#FFB3B3', type: 'tap' },
      { id: 'b2', emoji: '😴', label: 'Fatigue', color: '#C4E8FF', type: 'tap' },
      { id: 'b3', emoji: '🤢', label: 'Nausea', color: '#D4F5C4', type: 'tap' },
      { id: 'b4', emoji: '💫', label: 'Dizzy', color: '#E8D5FF', type: 'tap' },
      { id: 'b5', emoji: '🔥', label: 'Fever', color: '#FFDDB6', type: 'tap' },
      { id: 'b6', emoji: '💪', label: 'Ache', color: '#FFF3B0', type: 'tap' },
    ]
  },
  {
    name: 'Vitals',
    buttons: [
      { id: 'v1', emoji: '🩺', label: 'Blood Pressure', color: '#FFB3B3', type: 'measure', unit: 'mmHg', double: true },
      { id: 'v2', emoji: '🌡', label: 'Temperature', color: '#FFDDB6', type: 'measure', unit: '°F', double: false },
      { id: 'v3', emoji: '⚖️', label: 'Weight', color: '#D4F5C4', type: 'measure', unit: 'lbs', double: false },
    ]
  },
]

function uid() {
  return Math.random().toString(36).slice(2, 9)
}

async function fetchWeather() {
  return new Promise((resolve) => {
    if (!navigator.geolocation) { resolve(null); return }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude: lat, longitude: lon } = pos.coords
          const r = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weathercode,wind_speed_10m,pressure_msl&temperature_unit=fahrenheit`
          )
          const d = await r.json()
          const c = d.current
          const codes = { 0:'Clear', 1:'Mostly clear', 2:'Partly cloudy', 3:'Overcast', 45:'Foggy', 48:'Foggy', 51:'Drizzle', 61:'Rain', 63:'Rain', 65:'Heavy rain', 71:'Snow', 80:'Showers', 95:'Thunderstorm' }
          resolve({
            temp: Math.round(c.temperature_2m),
            desc: codes[c.weathercode] ?? 'Unknown',
            wind: Math.round(c.wind_speed_10m),
            pressure: Math.round(c.pressure_msl),
          })
        } catch { resolve(null) }
      },
      () => resolve(null)
    )
  })
}

export default function App() {
  const [tabs, setTabs] = useState(DEFAULT_TABS)
  const [tabsLoaded, setTabsLoaded] = useState(false)
  const [activeTab, setActiveTab] = useState(0)
  const [logs, setLogs] = useState([])
  const [allLogs, setAllLogs] = useState([])
  const [notes, setNotes] = useState('')
  const [weather, setWeather] = useState(null)
  const [weatherLoading, setWeatherLoading] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [modal, setModal] = useState(null)
  const [pendingEntry, setPendingEntry] = useState(null)
  const [showDashboard, setShowDashboard] = useState(false)
  const [showExport, setShowExport] = useState(false)

  useEffect(() => {
  if (navigator.storage && navigator.storage.persist) {
    navigator.storage.persist()
  }
  setWeatherLoading(true)
    fetchWeather().then(w => { setWeather(w); setWeatherLoading(false) })
  }, [])

useEffect(() => {
  db.tabs.toArray().then(saved => {
    if (saved.length > 0) {
      const sorted = saved.sort((a, b) => a.order - b.order)
      setTabs(sorted.map(({ id, order, ...rest }) => rest))
    }
    setTabsLoaded(true)
  }).catch(err => {
    console.error('tabs load error:', err)
    setTabsLoaded(true)
  })
}, [])

useEffect(() => {
  if (!tabsLoaded) return
  db.tabs.clear().then(() => {
    db.tabs.bulkAdd(tabs.map((t, i) => ({ ...t, order: i })))
  })
}, [tabs, tabsLoaded])

  useEffect(() => {
    const tab = tabs[activeTab]
    if (!tab) return
    let cancelled = false
    db.logs
      .where('tabName').equals(tab.name)
      .reverse()
      .limit(20)
      .toArray()
      .then(result => { if (!cancelled) setLogs(result) })
      .catch(err => console.error('db error:', err))
    return () => { cancelled = true }
  }, [activeTab, tabs])

  useEffect(() => {
    db.logs.orderBy('ts').reverse().limit(500).toArray().then(setAllLogs)
  }, [logs])

  async function handleLog(btn) {
    if (editMode) { setModal({ type: 'editBtn', tabIdx: activeTab, btn }); return }
    
    const tab = tabs[activeTab]
    const entry = {
      ts: Date.now(),
      tabName: tab.name,
      btnId: btn.id,
      btnEmoji: btn.emoji,
      btnLabel: btn.label,
      btnColor: btn.color,
      btnType: btn.type,
      unit: btn.unit ?? null,
      double: btn.double ?? false,
      label1: btn.label1 ?? null,
      label2: btn.label2 ?? null,
      value: null,
      value2: null,
      notes: notes.trim(),
      weather,
    }
    const id = await db.logs.add(entry)
    const saved = { ...entry, id }
    setLogs(prev => [saved, ...prev])
    setNotes('')
    if (btn.type === 'measure') setPendingEntry(saved)
  }

  async function handleMeasurement(id, value, value2) {
    await db.logs.update(id, { value, value2 })
    setLogs(prev => prev.map(l => l.id === id ? { ...l, value, value2 } : l))
    setPendingEntry(null)
  }

  async function handleUpdateNote(id, notes) {
  await db.logs.update(id, { notes })
  setLogs(prev => prev.map(l => l.id === id ? { ...l, notes } : l))
  setAllLogs(prev => prev.map(l => l.id === id ? { ...l, notes } : l))
}

async function handleDeleteEntry(id) {
  await db.logs.delete(id)
  setLogs(prev => prev.filter(l => l.id !== id))
  setAllLogs(prev => prev.filter(l => l.id !== id))
}

  function saveBtn(tabIdx, btnData) {
    setTabs(prev => prev.map((t, i) => i !== tabIdx ? t : {
      ...t,
      buttons: t.buttons.map(b => b.id === btnData.id ? btnData : b)
    }))
    setModal(null)
  }

  function addBtn(tabIdx) {
    const newBtn = { id: uid(), emoji: '✨', label: 'New', color: '#E8D5FF', type: 'tap' }
    setTabs(prev => prev.map((t, i) => i !== tabIdx ? t : { ...t, buttons: [...t.buttons, newBtn] }))
  }

  function deleteBtn(tabIdx, btnId) {
    setTabs(prev => prev.map((t, i) => i !== tabIdx ? t : { ...t, buttons: t.buttons.filter(b => b.id !== btnId) }))
    setModal(null)
  }

  function addTab() {
    const newTab = { name: 'New tab', buttons: [] }
    setTabs(prev => [...prev, newTab])
    setActiveTab(tabs.length)
    setModal({ type: 'editTab', tabIdx: tabs.length })
  }

  function saveTab(tabIdx, name) {
    setTabs(prev => prev.map((t, i) => i !== tabIdx ? t : { ...t, name }))
    setModal(null)
  }

  function deleteTab(tabIdx) {
    if (tabs.length <= 1) return
    setTabs(prev => prev.filter((_, i) => i !== tabIdx))
    setActiveTab(Math.max(0, tabIdx - 1))
    setModal(null)
  }
  
  const tab = tabs[activeTab] ?? tabs[0]

  return (
    <div className="app">
      <TabBar
        tabs={tabs}
        activeTab={activeTab}
        editMode={editMode}
        showDashboard={showDashboard}
        showExport={showExport}
        onSelect={setActiveTab}
        onAddTab={addTab}
        onToggleEdit={() => setEditMode(e => !e)}
        onEditTab={i => setModal({ type: 'editTab', tabIdx: i })}
        onToggleDashboard={() => { setShowDashboard(d => !d); setShowExport(false) }}
        onToggleExport={() => { setShowExport(e => !e); setShowDashboard(false) }}
      />
      <WeatherBar weather={weather} loading={weatherLoading} />
      {showDashboard ? (
        <Dashboard logs={allLogs} tabs={tabs} />
      ) : showExport ? (
        <ExportPanel logs={allLogs} tabs={tabs} />
      ) : (
        <>
          <Remote
            buttons={tab.buttons}
            editMode={editMode}
            onLog={handleLog}
            onAdd={() => addBtn(activeTab)}
          />
          <NotesArea value={notes} onChange={setNotes} />
          <LogList
            logs={logs}
            onUpdateNote={handleUpdateNote}
            onDeleteEntry={handleDeleteEntry}
          />
        </>
      )}
      {pendingEntry && (
        <MeasurementSheet
          entry={pendingEntry}
          onSave={handleMeasurement}
          onSkip={() => setPendingEntry(null)}
        />
      )}
      {modal && (
        <EditModal
          modal={modal}
          tabs={tabs}
          onSaveBtn={saveBtn}
          onDeleteBtn={deleteBtn}
          onSaveTab={saveTab}
          onDeleteTab={deleteTab}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  )
}