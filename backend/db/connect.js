const sql = require('mssql')
const dotenv = require('dotenv')
dotenv.config()

console.log("AZURE_SQL_CONNECTION_STRING:", process.env.SQLCONNSTR_AZURE_SQL_CONNECTION_STRING)
console.log("🧪 Available ENV Vars:", Object.keys(process.env).filter(k => k.includes("SQL")))
console.log("🧪 AZURE_SQL_CONNECTION_STRING:", process.env.SQLCONNSTR_SQLCONNSTR_AZURE_SQL_CONNECTION_STRING)

const azureConnectionString =
  process.env.SQLCONNSTR_SQLCONNSTR_AZURE_SQL_CONNECTION_STRING ||
  process.env.SQLCONNSTR_AZURE_SQL_CONNECTION_STRING ||
  process.env.AZURE_SQL_CONNECTION_STRING

console.log("🧪 Using connection string:", azureConnectionString)

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

console.log("🧪 Final config sent to mssql:", config)

let pool

async function getPool() {
  console.log("🧪 Using config object:", config)
  if (!pool) pool = await sql.connect(config)
  return pool
}

module.exports = { getPool }