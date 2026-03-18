import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from 'recharts'
import { useMemo, useState, useEffect } from 'react'

function sectionTitle(text) {
  return (
    <div style={{ fontSize: 11, fontWeight: 600, color: '#999', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12, marginTop: 24 }}>
      {text}
    </div>
  )
}

function EmptyChart() {
  return <div style={{ fontSize: 13, color: '#bbb', padding: '16px 0' }}>Not enough data yet</div>
}

const COLORS = ['#FFB3B3','#C4E8FF','#D4F5C4','#E8D5FF','#FFDDB6','#FFF3B0']

export default function Dashboard({ logs, tabs }) {
  const tapLogs = useMemo(() => logs.filter(l => l.btnType === 'tap' || !l.btnType), [logs])
  const measureLogs = useMemo(() => logs.filter(l => l.btnType === 'measure' && l.value !== null), [logs])

  const allTapLabels = useMemo(() => {
    const labels = new Set()
    tapLogs.forEach(l => labels.add(l.btnLabel))
    return Array.from(labels)
  }, [tapLogs])

  const [selected, setSelected] = useState(() => new Set(allTapLabels))
  
  useEffect(() => {
  setSelected(prev => {
    const next = new Set(prev)
    allTapLabels.forEach(l => next.add(l))
    return next
  })
}, [allTapLabels])

  function toggleLabel(label) {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(label) ? next.delete(label) : next.add(label)
      return next
    })
  }

  const filteredTapLogs = useMemo(
    () => tapLogs.filter(l => selected.has(l.btnLabel)),
    [tapLogs, selected]
  )

    const frequencyData = useMemo(() => {
        const days = {}
        filteredTapLogs.forEach(l => {
            const day = new Date(l.ts).toLocaleDateString([], { month: 'short', day: 'numeric' })
            if (!days[day]) days[day] = {}
            days[day][l.btnLabel] = (days[day][l.btnLabel] ?? 0) + 1
        })
        return Object.entries(days)
            .map(([day, counts]) => ({ day, ...counts }))
            .slice(-14)
        }, [filteredTapLogs])

    const labelColors = useMemo(() => {
        const map = {}
        tapLogs.forEach(l => { map[l.btnLabel] = l.btnColor })
        return map
        }, [tapLogs])

  const timeOfDayData = useMemo(() => {
    const buckets = [
      { label: 'Night', range: [0, 6], count: 0 },
      { label: 'Morning', range: [6, 12], count: 0 },
      { label: 'Afternoon', range: [12, 18], count: 0 },
      { label: 'Evening', range: [18, 24], count: 0 },
    ]
    filteredTapLogs.forEach(l => {
      const hour = new Date(l.ts).getHours()
      const bucket = buckets.find(b => hour >= b.range[0] && hour < b.range[1])
      if (bucket) bucket.count++
    })
    return buckets.map(b => ({ label: b.label, count: b.count }))
  }, [filteredTapLogs])

  const measurementSeries = useMemo(() => {
    const series = {}
    measureLogs.forEach(l => {
      if (!series[l.btnLabel]) series[l.btnLabel] = { unit: l.unit, double: l.double, points: [] }
      series[l.btnLabel].points.push({
        time: new Date(l.ts).toLocaleDateString([], { month: 'short', day: 'numeric' }),
        value: l.value,
        value2: l.value2,
      })
    })
    return series
  }, [measureLogs])

  const visibleTapLabels = allTapLabels.filter(l => selected.has(l))

    console.log('tapLogs', tapLogs)
    console.log('frequencyData', frequencyData)
    console.log('visibleTapLabels', visibleTapLabels)
    console.log('frequencyData sample', frequencyData[0])

  return (
    <div className="dashboard">
      {allTapLabels.length > 0 && (
        <>
          {sectionTitle('Filter symptoms')}
          <div className="filter-grid">
            {allTapLabels.map((label, i) => (
              <button
                key={label}
                className={`filter-chip${selected.has(label) ? ' active' : ''}`}
                style={selected.has(label) ? { background: COLORS[i % COLORS.length] } : {}}
                onClick={() => toggleLabel(label)}
              >
                {label}
              </button>
            ))}
          </div>
        </>
      )}

      {sectionTitle('Frequency — last 14 days')}
      {frequencyData.length < 2 ? <EmptyChart /> : (
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={frequencyData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#aaa' }} />
            <YAxis tick={{ fontSize: 11, fill: '#aaa' }} allowDecimals={false} />
            <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #eee' }} />
            {visibleTapLabels.map((label, i) => (
                <Bar
                    key={label}
                    dataKey={label}
                    stackId="a"
                    fill={labelColors[label] ?? COLORS[i % COLORS.length]}
                    isAnimationActive={false}
                    radius={i === visibleTapLabels.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]}
                />
                ))}
          </BarChart>
        </ResponsiveContainer>
      )}

      {sectionTitle('Time of day')}
      {filteredTapLogs.length < 3 ? <EmptyChart /> : (
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={timeOfDayData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#aaa' }} />
            <YAxis tick={{ fontSize: 11, fill: '#aaa' }} allowDecimals={false} />
            <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #eee' }} />
            <Bar dataKey="count" fill="#C4E8FF" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}

      {Object.keys(measurementSeries).length > 0 && sectionTitle('Measurement trends')}
      {Object.entries(measurementSeries).map(([label, series]) => (
        <div key={label} style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 13, fontWeight: 500, color: '#444', marginBottom: 8 }}>
            {label} <span style={{ fontWeight: 400, color: '#aaa' }}>({series.unit})</span>
          </div>
          {series.points.length < 2 ? <EmptyChart /> : (
            <ResponsiveContainer width="100%" height={160}>
              <LineChart data={series.points} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="time" tick={{ fontSize: 11, fill: '#aaa' }} />
                <YAxis tick={{ fontSize: 11, fill: '#aaa' }} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #eee' }} />
                <Line type="monotone" dataKey="value" stroke="#FFB3B3" strokeWidth={2} dot={{ r: 3 }} />
                {series.double && (
                  <Line type="monotone" dataKey="value2" stroke="#C4E8FF" strokeWidth={2} dot={{ r: 3 }} />
                )}
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      ))}

      {logs.length === 0 && (
        <div className="empty-state">No data yet — start logging to see your dashboard</div>
      )}
    </div>
  )
}