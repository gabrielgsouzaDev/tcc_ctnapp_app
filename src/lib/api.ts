
// This would be in something like src/lib/config.ts
export const API_BASE_URL = 'https://cantappbackendlaravel-production.up.railway.app';

// This is a simplified error type, you might want to expand it
type ApiError = {
    message: string;
    errors?: Record<string, string[]>;
};

async function handleResponse<T>(response: Response): Promise<T> {
    if (response.status === 204) {
        // No content, return a success-like object if needed, or just return
        return { success: true } as unknown as T;
    }
    
    const data = await response.json();

    if (!response.ok) {
        const error: Error & { data?: any } = new Error(data.message || 'Ocorreu um erro na API.');
        error.data = data; // Attach the full error response
        throw error;
    }
    
    return data as T;
}

// ✅ CORREÇÃO: Removido o prefixo '/api' da URL, pois o backend já o adiciona.

export async function apiGet<T>(path: string): Promise<T> {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${API_BASE_URL}/${path}`, { // /api removido
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` }),
        },
    });
    return handleResponse<T>(response);
}

export async function apiPost<T>(path: string, body: any): Promise<T> {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${API_BASE_URL}/${path}`, { // /api removido
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` }),
        },
        body: JSON.stringify(body),
    });
    return handleResponse<T>(response);
}

export async function apiPut<T>(path: string, body: any): Promise<T> {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${API_BASE_URL}/${path}`, { // /api removido
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` }),
        },
        body: JSON.stringify(body),
    });
    return handleResponse<T>(response);
}

export async function apiPatch<T>(path: string, body: any): Promise<T> {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${API_BASE_URL}/${path}`, { // /api removido
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` }),
        },
        body: JSON.stringify(body),
    });
    return handleResponse<T>(response);
}

export async function apiDelete<T>(path: string): Promise<T> {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${API_BASE_URL}/${path}`, { // /api removido
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` }),
        },
    });
    return handleResponse<T>(response);
}
