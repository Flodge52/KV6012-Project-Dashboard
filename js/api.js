const API_KEY = '79a8e8e672ffeee7a91d579fb26b3260'

export async function fetchAirQuality(lat, lon) {
  const res = await fetch(`https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${API_KEY}`)
  const data = await res.json()

  return {
    aqi: data.list[0].main.aqi,
    components: data.list[0].components
  }
}

export async function fetchWeather(lat, lon) {
  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`
  const res = await fetch(url)
  const data = await res.json()

  return {
    temp: data.main.temp,
    description: data.weather[0].description,
    wind: data.wind.speed
  }
}

export async function fetchTools(projectId) {
  const res = await fetch(`/api/projects/${projectId}/resources`)
  return await res.json()
}

export async function fetchForecast(lat, lon) {
  const res = await fetch(`https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&exclude=minutely,hourly,current,alerts&units=metric&appid=${API_KEY}`)
  const data = await res.json()

  if (!res.ok) {
    console.error('Forecast API error:', res.status, await res.text())
    return []
  }

  return data.daily.slice(0, 8) // 8-day forecast
}

export async function fetchAirQualityForecast(lat, lon) {
  const res = await fetch(
    `https://api.openweathermap.org/data/2.5/air_pollution/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}`
  )

  if (!res.ok) {
    console.error('AQI forecast fetch failed:', res.status)
    return []
  }

  const data = await res.json()

  const grouped = {}

  data.list.forEach(entry => {
    const date = new Date(entry.dt * 1000).toISOString().split('T')[0]
    if (!grouped[date]) grouped[date] = []
    grouped[date].push(entry.main.aqi)
  })

  const dailyAQI = Object.entries(grouped).map(([date, aqiList]) => {
    const avgAQI = Math.round(
      aqiList.reduce((sum, val) => sum + val, 0) / aqiList.length
    )
    return { date, avgAQI }
  })

  // Predict next 3 days by using average of the 5 known days
  const avgOfWeek = Math.round(
    dailyAQI.reduce((sum, day) => sum + day.avgAQI, 0) / dailyAQI.length
  )

  const lastDate = new Date(dailyAQI[dailyAQI.length - 1].date)
  for (let i = 1; i <= 3; i++) {
    const futureDate = new Date(lastDate)
    futureDate.setDate(futureDate.getDate() + i)
    const futureIso = futureDate.toISOString().split('T')[0]
    dailyAQI.push({ date: futureIso, avgAQI: avgOfWeek })
  }

  return dailyAQI.slice(0, 8) // Ensure we always return 8 entries
}

export async function fetchHistoricalWeather(lat, lon, timestamp) {
  const res = await fetch(
    `https://api.openweathermap.org/data/3.0/onecall/timemachine?lat=${lat}&lon=${lon}&dt=${timestamp}&units=metric&appid=${API_KEY}`
  )

  const data = await res.json()
  console.log('📦 Historical API raw response:', data)

  if (!res.ok || !data.data) {
    console.error('❌ Failed to load historical data')
    return null
  }

  const temps = data.data.map(entry => entry.temp)
  const avgTemp = (temps.reduce((a, b) => a + b, 0) / temps.length).toFixed(1)

  const wind = data.data[0]?.wind_speed ?? '?'
  const weather = data.data[0]?.weather?.[0]?.description ?? 'Unknown'

  return {
    temp: avgTemp,
    wind,
    weather
  }
}