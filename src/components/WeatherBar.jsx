export default function WeatherBar({ weather, loading }) {
  return (
    <div className="weather-bar">
      {loading ? (
        <span className="weather-muted">fetching weather…</span>
      ) : weather ? (
        <>
          <span>🌡</span>
          <span className="weather-val">{weather.temp}°F</span>
          <div className="weather-dot" />
          <span>{weather.desc}</span>
          <div className="weather-dot" />
          <span>{weather.wind} mph wind</span>
          <div className="weather-dot" />
          <span className="weather-val">{weather.pressure}</span>
          <span>hPa</span>
        </>
      ) : (
        <span className="weather-muted">weather unavailable — allow location to enable</span>
      )}
    </div>
  )
}