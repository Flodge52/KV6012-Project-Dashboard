import { showPopup, map, myMap, markersByProjectId } from './map.js'
import { fetchAirQuality, fetchTools, fetchWeather, fetchForecast, fetchAirQualityForecast, fetchHistoricalWeather } from './api.js'
import { evaluateSafety, describeAqi } from './logic.js'

let currentProject = null

export function setCurrentProject(project) {
    currentProject = project
}

export function getCurrentProject() {
    return currentProject
}

document.addEventListener('DOMContentLoaded', async () => {
    await waitForGoogleMaps()
    await myMap(54.977, -1.618) // make sure this runs first
})

async function waitForGoogleMaps(retries = 10) {
    while (!window.google || !window.google.maps) {
        if (retries-- === 0) throw new Error('Google Maps failed to load')
        await new Promise(r => setTimeout(r, 300))
    }
}

export function updateSidebar(tools, flags, location) {
    const addressDiv = document.getElementById('address-info')
    const toolDiv = document.getElementById('tool-info')
    const recommendationDiv = document.getElementById('recommendations')

    addressDiv.innerHTML = `
    <p><strong>Location:</strong><br>${location?.location ?? 'Unknown'}</p>
  `

    toolDiv.innerHTML = `
      <h3>Tools Required</h3>
      <p>${tools.map(t => t.resourceType).join(', ')}</p>
    `

    recommendationDiv.innerHTML = `
      <h3>Recommendations</h3>
      <ul>${flags.map(f => `<li>${f}</li>`).join('')}</ul>
    `
}

document.getElementById('projectSelect').addEventListener('change', async (e) => {
    const id = parseInt(e.target.value)
    if (!id) return

    const selected = markersByProjectId.get(id)
    if (!selected) return

    // Same logic as marker click:
    const { marker, location } = selected
    const weather = await fetchWeather(location.latitude, location.longitude)
    const airQuality = await fetchAirQuality(location.latitude, location.longitude)
    const tools = await fetchTools(location.id)
    const flags = evaluateSafety(weather, airQuality, tools)
    const forecast = await fetchForecast(location.latitude, location.longitude)
    const aqiForecast = await fetchAirQualityForecast(location.latitude, location.longitude)

    setCurrentProject(location)
    // Center map and show popup (optional)
    map.setCenter({ lat: location.latitude, lng: location.longitude })

    showPopup(location, weather, airQuality, marker)

    // Update sidebar
    updateSidebar(tools, flags, location)

    console.log('🧪 Weather Forecast:', forecast)
    console.log('🧪 AQI Forecast:', aqiForecast)

    renderForecast(forecast, aqiForecast)
})

export function renderForecast(weatherDays, aqiDays) {
    const container = document.getElementById('forecast-grid')

    // Create a lookup map of AQI forecasts by date string
    const aqiMap = new Map(aqiDays.map(d => [d.date, d.avgAQI]))

    container.innerHTML = weatherDays.map(day => {
        const dateObj = new Date(day.dt * 1000)
        const isoDate = dateObj.toISOString().split('T')[0]

        const aqi = aqiMap.get(isoDate) ?? '?'
        const aqiDesc = describeAqi(aqi)

        const tempMin = day?.temp?.min ?? '?'
        const tempMax = day?.temp?.max ?? '?'
        const wind = day?.wind_speed ?? '?'
        const weatherMain = day?.weather?.[0]?.main ?? 'Unknown'

        return `
      <div class="forecast-day">
        <strong>${dateObj.toDateString()}</strong><br>
        🌡 ${tempMin}°C - ${tempMax}°C<br>
        💨 ${wind} m/s<br>
        ☁️ ${weatherMain}<br>
        🫁 AQI: ${aqi} (${aqiDesc})
      </div>
    `
    }).join('')
}

document.getElementById('load-history').addEventListener('click', async () => {
    const location = getCurrentProject()
    if (!location) return alert('Please select a project first')

    console.log('📍 Selected location:', location)

    const dateStr = document.getElementById('history-date').value
    if (!dateStr) return alert('Please select a date.')

    const selectedDate = new Date(dateStr)
    selectedDate.setUTCHours(0, 0, 0, 0)
    const timestamp = Math.floor(selectedDate.getTime() / 1000)

    const history = await fetchHistoricalWeather(
        location.latitude,   // ✅ use the lat from the location object
        location.longitude,  // ✅ use the lon from the location object
        timestamp
    )

    if (!history) {
        alert('No historical data available.')
        return
    }

    renderHistoricalWeather(history, location, dateStr)
})

function renderHistoricalWeather(data, location, dateStr) {
    const container = document.getElementById('historical-tile') // or a dedicated div
    container.innerHTML = `
      <div class="historical-day">
        <strong>${location.name} on ${dateStr}</strong><br>
        🌡 Avg Temp: ${data.temp}°C<br>
        💨 Wind: ${data.wind} m/s<br>
        ☁️ ${data.weather}
      </div>
    `
}