const BASE_URL = 'https://your-backend-app.azurewebsites.net/api'

export async function fetchAllProjects() {
    const res = await fetch(`${BASE_URL}/projects`)
    if (!res.ok) throw new Error('Failed to load project list')
    return await res.json()
}

export async function fetchProject(id) {
    const res = await fetch(`${BASE_URL}/project/${id}`)
    if (!res.ok) throw new Error('Failed to load project data')
    return await res.json()
}