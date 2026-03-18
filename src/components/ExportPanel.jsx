import { useState, useMemo } from 'react'
import { PDFDownloadLink } from '@react-pdf/renderer'
import PdfReport from './PdfReport'
import { db } from '../db'

function fmtDate(ts) {
  return new Date(ts).toISOString().split('T')[0]
}

const RANGES = [
  { label: 'Last 7 days', days: 7 },
  { label: 'Last 30 days', days: 30 },
  { label: 'Last 90 days', days: 90 },
  { label: 'All time', days: null },
]

export default function ExportPanel({ logs, tabs }) {
  const [selectedRange, setSelectedRange] = useState(1)
  const [customFrom, setCustomFrom] = useState('')
  const [customTo, setCustomTo] = useState('')
  const [useCustom, setUseCustom] = useState(false)
  const [importStatus, setImportStatus] = useState(null)

  const dateRange = useMemo(() => {
    const now = Date.now()
    if (useCustom && customFrom && customTo) {
      return {
        from: new Date(customFrom).getTime(),
        to: new Date(customTo).getTime() + 86400000,
      }
    }
    const days = RANGES[selectedRange].days
    return {
      from: days ? now - days * 86400000 : 0,
      to: now,
    }
  }, [selectedRange, useCustom, customFrom, customTo])

  const filteredLogs = useMemo(() => {
    return logs
      .filter(l => l.ts >= dateRange.from && l.ts <= dateRange.to)
      .sort((a, b) => b.ts - a.ts)
  }, [logs, dateRange])

  function handleJsonExport() {
    const data = {
      exportedAt: new Date().toISOString(),
      dateRange,
      tabs,
      logs: filteredLogs,
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `health-export-${fmtDate(Date.now())}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  async function handleJsonImport(e) {
    const file = e.target.files[0]
    if (!file) return
    try {
      const text = await file.text()
      const data = JSON.parse(text)
      if (!data.logs || !Array.isArray(data.logs)) {
        setImportStatus({ ok: false, msg: 'Invalid file — no logs found' })
        return
      }
      const toImport = data.logs.map(({ id, ...rest }) => rest)
      await db.logs.bulkAdd(toImport)
      setImportStatus({ ok: true, msg: `Imported ${toImport.length} entries` })
    } catch {
      setImportStatus({ ok: false, msg: 'Could not read file' })
    }
    e.target.value = ''
  }

  async function handleClearAll() {
  if (!window.confirm('Delete all logs permanently? This cannot be undone.')) return
  await db.logs.clear()
  window.location.reload()
}

  return (
    <div className="export-panel">
      <div className="section-head" style={{ marginBottom: 16 }}>
        <span className="section-title">Date range</span>
      </div>

      <div className="filter-grid" style={{ marginBottom: 12 }}>
        {RANGES.map((r, i) => (
          <button
            key={r.label}
            className={`filter-chip${!useCustom && selectedRange === i ? ' active' : ''}`}
            onClick={() => { setSelectedRange(i); setUseCustom(false) }}
          >
            {r.label}
          </button>
        ))}
        <button
          className={`filter-chip${useCustom ? ' active' : ''}`}
          onClick={() => setUseCustom(true)}
        >
          Custom
        </button>
      </div>

      {useCustom && (
        <div style={{ display: 'flex', gap: 8, marginBottom: 12, alignItems: 'center' }}>
          <input
            type="date"
            value={customFrom}
            onChange={e => setCustomFrom(e.target.value)}
            style={{ flex: 1, padding: '8px 10px', borderRadius: 8, border: '1px solid #ddd', fontFamily: 'inherit', fontSize: 13 }}
          />
          <span style={{ color: '#aaa' }}>→</span>
          <input
            type="date"
            value={customTo}
            onChange={e => setCustomTo(e.target.value)}
            style={{ flex: 1, padding: '8px 10px', borderRadius: 8, border: '1px solid #ddd', fontFamily: 'inherit', fontSize: 13 }}
          />
        </div>
      )}

      <div className="export-count">
        {filteredLogs.length} {filteredLogs.length === 1 ? 'entry' : 'entries'} in range
      </div>

      <div className="export-section">
        <div className="section-title" style={{ marginBottom: 10 }}>JSON backup</div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn-primary export-btn" onClick={handleJsonExport}>
            ↓ Export JSON
          </button>
          <label className="btn-secondary export-btn">
            ↑ Import JSON
            <input
              type="file"
              accept=".json"
              onChange={handleJsonImport}
              style={{ display: 'none' }}
            />
          </label>
        </div>
        {importStatus && (
          <div className={`import-status ${importStatus.ok ? 'ok' : 'err'}`}>
            {importStatus.msg}
          </div>
        )}
      </div>

      <div className="export-section">
        <div className="section-title" style={{ marginBottom: 10 }}>PDF summary</div>
        {filteredLogs.length === 0 ? (
          <div style={{ fontSize: 13, color: '#bbb' }}>No entries in this range</div>
        ) : (
          <PDFDownloadLink
            document={<PdfReport logs={filteredLogs} tabs={tabs} dateRange={dateRange} />}
            fileName={`health-summary-${fmtDate(Date.now())}.pdf`}
          >
            {({ loading }) => (
              <button className="btn-primary export-btn">
                {loading ? 'Preparing PDF…' : '↓ Download PDF'}
              </button>
            )}
          </PDFDownloadLink>
        )}
      </div>
      <div className="export-section" style={{ marginTop: 24 }}>
        <div className="section-title" style={{ marginBottom: 10 }}>Danger zone</div>
            <button className="btn-danger" style={{ width: '100%', padding: '10px', borderRadius: 8, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit' }} onClick={handleClearAll}>
                Delete all data
            </button>
        </div>
        </div>

  )
}