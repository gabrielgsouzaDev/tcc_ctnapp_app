
// This would be in something like src/lib/config.ts
export const API_BASE_URL = 'https://cantappbackendlaravel-production.up.railway.app/api';

// This is a simplified error type, you might want to expand it
type ApiError = {
    message: string;
    errors?: Record<string, string[]>;
};

async function handleResponse<T>(response: Response): Promise<T> {
    if (response.status === 204) {
        // No content, return a default "success" object or similar
        return { success: true } as T;
    }

    const data = await response.json();

    if (!response.ok) {
        // Create an error object that includes the API message
        const error: Error & { data?: any } = new Error(data.message || 'Ocorreu um erro na API.');
        error.data = data;
        throw error;
    }
    
    // Check if the actual data is nested under a 'data' or 'user' key as per Laravel's ResponseHelper
    if (data && typeof data === 'object') {
        if ('data' in data) {
            return data.data as T;
        }
        if ('user' in data) {
             // For login/register responses that might return { user, token }
            return data as T;
        }
    }

    return data as T;
}

export async function apiGet<T>(path: string): Promise<T> {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${API_BASE_URL}${path}`, {
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
    const response = await fetch(`${API_BASE_URL}${path}`, {
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
    const response = await fetch(`${API_BASE_URL}${path}`, {
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
    const response = await fetch(`${API_BASE_URL}${path}`, {
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
