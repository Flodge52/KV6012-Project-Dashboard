const { getPool } = require('./connect.js')

async function fetchAllLocations() {
    const pool = await getPool()
    const result = await pool.request().query(`
    SELECT id, name, latitude, longitude, Location AS location FROM ProjectLocations
  `)
    return result.recordset
}

async function getResourcesForProject(projectId) {
    const pool = await getPool()
    const result = await pool.request()
        .input('projectId', projectId)
        .query(`
        SELECT r.resourceType, r.conditionsOfUse
        FROM ProjectResources pr
        JOIN Resources r ON pr.ResourceID = r.id
        WHERE pr.ProjectID = @projectId
      `)

    return result.recordset
}

module.exports = {fetchAllLocations, getResourcesForProject}