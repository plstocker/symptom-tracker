import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'

const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: 'Helvetica', fontSize: 10, color: '#333' },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 4 },
  subtitle: { fontSize: 11, color: '#888', marginBottom: 24 },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 12, fontWeight: 'bold', marginBottom: 8, paddingBottom: 4, borderBottomWidth: 1, borderBottomColor: '#eee' },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4, borderBottomWidth: 1, borderBottomColor: '#f5f5f5' },
  label: { flex: 2 },
  value: { flex: 1, textAlign: 'right', color: '#555' },
  logEntry: { marginBottom: 8, paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: '#f5f5f5' },
  logHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 },
  logLabel: { fontWeight: 'bold' },
  logTime: { color: '#888' },
  logMeta: { color: '#888', marginBottom: 2 },
  logNote: { color: '#555', fontStyle: 'italic' },
  logValue: { color: '#333', fontWeight: 'bold', marginBottom: 2 },
  empty: { color: '#aaa', fontStyle: 'italic' },
})

function fmtTime(ts) {
  const d = new Date(ts)
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' · ' +
    d.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })
}

function fmtValue(entry) {
  if (entry.btnType !== 'measure' || entry.value === null) return null
  if (entry.double && entry.value2 !== null) return `${entry.value} / ${entry.value2} ${entry.unit}`
  return `${entry.value} ${entry.unit}`
}

export default function PdfReport({ logs, tabs, dateRange }) {
  const tapLogs = logs.filter(l => l.btnType === 'tap' || !l.btnType)
  const measureLogs = logs.filter(l => l.btnType === 'measure' && l.value !== null)

  const summaryCounts = {}
  tapLogs.forEach(l => {
    summaryCounts[l.btnLabel] = (summaryCounts[l.btnLabel] ?? 0) + 1
  })

  const timeOfDay = { Night: 0, Morning: 0, Afternoon: 0, Evening: 0 }
  tapLogs.forEach(l => {
    const hour = new Date(l.ts).getHours()
    if (hour < 6) timeOfDay.Night++
    else if (hour < 12) timeOfDay.Morning++
    else if (hour < 18) timeOfDay.Afternoon++
    else timeOfDay.Evening++
  })

  const measurementSeries = {}
  measureLogs.forEach(l => {
    if (!measurementSeries[l.btnLabel]) measurementSeries[l.btnLabel] = { unit: l.unit, double: l.double, points: [] }
    measurementSeries[l.btnLabel].points.push({ ts: l.ts, value: l.value, value2: l.value2 })
  })

  const fromStr = new Date(dateRange.from).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })
  const toStr = new Date(dateRange.to).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>Health Summary</Text>
        <Text style={styles.subtitle}>{fromStr} — {toStr}</Text>

        {Object.keys(summaryCounts).length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Summary counts</Text>
            {Object.entries(summaryCounts)
              .sort((a, b) => b[1] - a[1])
              .map(([label, count]) => (
                <View key={label} style={styles.row}>
                  <Text style={styles.label}>{label}</Text>
                  <Text style={styles.value}>{count} {count === 1 ? 'time' : 'times'}</Text>
                </View>
              ))}
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Time of day</Text>
          {Object.entries(timeOfDay).map(([period, count]) => (
            <View key={period} style={styles.row}>
              <Text style={styles.label}>{period}</Text>
              <Text style={styles.value}>{count} {count === 1 ? 'entry' : 'entries'}</Text>
            </View>
          ))}
        </View>

        {Object.keys(measurementSeries).length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Measurement trends</Text>
            {Object.entries(measurementSeries).map(([label, series]) => (
              <View key={label} style={{ marginBottom: 10 }}>
                <Text style={{ fontWeight: 'bold', marginBottom: 4 }}>{label} ({series.unit})</Text>
                {series.points.map((p, i) => (
                  <View key={i} style={styles.row}>
                    <Text style={styles.label}>{fmtTime(p.ts)}</Text>
                    <Text style={styles.value}>
                      {series.double && p.value2 !== null ? `${p.value} / ${p.value2}` : p.value} {series.unit}
                    </Text>
                  </View>
                ))}
              </View>
            ))}
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Full log</Text>
          {logs.length === 0 ? (
            <Text style={styles.empty}>No entries in this date range</Text>
          ) : (
            logs.map(entry => (
              <View key={entry.id} style={styles.logEntry}>
                <View style={styles.logHeader}>
                  <Text style={styles.logLabel}>{entry.btnLabel}</Text>
                  <Text style={styles.logTime}>{fmtTime(entry.ts)}</Text>
                </View>
                {fmtValue(entry) && <Text style={styles.logValue}>{fmtValue(entry)}</Text>}
                {entry.weather && (
                    <Text style={styles.logMeta}>
                        {entry.weather.temp}°F · {entry.weather.desc}{entry.weather.pressure ? ` · ${entry.weather.pressure} hPa` : ''}
                    </Text>
                    )}
                {entry.notes ? <Text style={styles.logNote}>"{entry.notes}"</Text> : null}
              </View>
            ))
          )}
        </View>
      </Page>
    </Document>
  )
}