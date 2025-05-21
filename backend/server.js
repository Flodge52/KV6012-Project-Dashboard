import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { fetchAllLocations } from './db/locations.js'
import { getResourcesForProject } from './db/locations.js'

dotenv.config()
console.log('SQL Server:', process.env.SQL_SERVER)

const app = express()
app.use(cors())
app.use(express.json())

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
app.listen(PORT, () => console.log(`API running at http://localhost:${PORT}`))