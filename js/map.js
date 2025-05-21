import { evaluateSafety, describeAqi } from "./logic.js"
import { fetchAirQuality, fetchWeather, fetchTools, fetchForecast, fetchAirQualityForecast } from "./api.js"
import { updateSidebar, renderForecast, setCurrentProject } from "./main.js"

export const markersByProjectId = new Map()
export let map
export let infoWindow = null

export function showPopup(location, weather, airQuality, marker) {
    infoWindow.setContent(`
      <h4>${location.name}</h4>
      <p>Temp: ${weather.temp}°C<br>
         Wind: ${weather.wind} m/s<br>
         AQI: ${airQuality.aqi}</p>
    `)
    infoWindow.open(map, marker)
}

export async function myMap(centerLat, centerLon) {
    const res = await fetch('http://localhost:3000/api/locations')
    const locations = await res.json()
    console.log(locations)

    map = new google.maps.Map(document.getElementById("googleMap"), {
        center: { lat: centerLat, lng: centerLon },
        zoom: 14,
        mapTypeId: google.maps.MapTypeId.HYBRID
    })

    infoWindow = new google.maps.InfoWindow()


    locations.forEach(location => {
        const marker = new google.maps.Marker({
            position: { lat: location.latitude, lng: location.longitude },
            map,
            title: location.name
        })

        markersByProjectId.set(location.id, { marker, location })


        marker.addListener('click', async () => {
            const weather = await fetchWeather(location.latitude, location.longitude)
            const airQuality = await fetchAirQuality(location.latitude, location.longitude)
            //const airQualityDesc = describeAqi(airQuality)
            const tools = await fetchTools(location.id)
             // 🔧 Business logic: evaluate whether work should proceed
             const flags = evaluateSafety(weather, airQuality, tools)
            const forecast = await fetchForecast(location.latitude, location.longitude)
            const aqiForecast = await fetchAirQualityForecast(location.latitude, location.longitude)


            console.log('🛠 Tools for', location.name, tools)
            console.log('📦 Fetching tools for project ID:', location.id)
            console.log(airQuality)
           
            setCurrentProject(location)

            updateSidebar(tools, flags, location)

            showPopup(location, weather, airQuality, marker)

            renderForecast(forecast, aqiForecast)

        })

        const select = document.getElementById('projectSelect')
        const option = document.createElement('option')
        option.value = location.id
        option.textContent = location.name
        select.appendChild(option)
    })
}

