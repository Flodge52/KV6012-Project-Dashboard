export function evaluateSafety(weather, airQuality, tools) {
    const unsafe = []

    tools.forEach(tool => {
        const t = tool.resourceType.toLowerCase()

        if (weather.wind > 8 && t.includes('crane')) {
            unsafe.push(`Unsafe to use ${tool.resourceType} in high wind`)
        }

        if (weather.description.includes('rain') && ['dumper', 'drill', 'digger', 'loader'].some(type => t.includes(type))) {
            unsafe.push(`Unsafe to use ${tool.resourceType} in heavy rain`)
        }

        if (airQuality.aqi > 2 && ['digger', 'dumper', 'loader'].some(type => t.includes(type))) {
            unsafe.push(`${tool.resourceType} should not be used in poor air quality\n`)
        }
    })

    return unsafe.length ? unsafe : ['Conditions OK for work']
}

export function describeAqi(aqi) {
    return ['Good', 'Fair', 'Moderate', 'Poor', 'Very Poor'][aqi - 1] || 'Unknown'
  }
