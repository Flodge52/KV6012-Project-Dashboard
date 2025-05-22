import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import { fetchAllLocations, getResourcesForProject } from './db/locations.js'

dotenv.config()
console.log('SQL Server:', process.env.SQL_SERVER)

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
app.use(cors())
app.use(express.json())

// ✅ Serve static files
app.use('/js', express.static(path.join(__dirname, '../js')))
app.use('/styles', express.static(path.join(__dirname, '../styles')))
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../index.html'))
})

// ✅ API Routes
app.get('/api/locations', async (req, res) => {
  try {
    const locations = await fetchAllLocations()
    res.json(locations)
  } catch (err) {
    console.error('🔥 DB fetch error:', err)
    res.status(500).send('Server error: ' + err.message)
  }
})

app.get('/api/projects/:id/resources', async (req, res) => {
  try {
    const id = parseInt(req.params.id)
    const tools = await getResourcesForProject(id)
    res.json(tools)
  } catch (err) {
    console.error('Error fetching tools:', err)
    res.status(500).send('Server error')
  }
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`))