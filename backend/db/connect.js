const sql = require('mssql')
const dotenv = require('dotenv')
dotenv.config()

console.log("AZURE_SQL_CONNECTION_STRING:", process.env.SQLCONNSTR_AZURE_SQL_CONNECTION_STRING)

// ✅ Use Azure connection string if in production
const azureConnectionString =
  process.env.SQLCONNSTR_SQLCONNSTR_AZURE_SQL_CONNECTION_STRING || // Fixes Azure weirdness
  process.env.SQLCONNSTR_AZURE_SQL_CONNECTION_STRING

const config = azureConnectionString
  ? {
      connectionString: azureConnectionString,
      options: {
        encrypt: true,
        trustServerCertificate: false
      }
    }
  : {
      user: process.env.SQL_USER,
      password: process.env.SQL_PASSWORD,
      server: process.env.SQL_SERVER,
      database: process.env.SQL_DATABASE,
      port: 1433,
      options: {
        encrypt: true,
        trustServerCertificate: false
      }
    }

let pool

async function getPool() {
  if (!pool) pool = await sql.connect(config)
  return pool
}

module.exports = { getPool }