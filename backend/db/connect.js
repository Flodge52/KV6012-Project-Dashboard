import sql from 'mssql'
import dotenv from 'dotenv'
dotenv.config()

const config = {
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
export async function getPool() {
    if (!pool) pool = await sql.connect(config)
    return pool
}
