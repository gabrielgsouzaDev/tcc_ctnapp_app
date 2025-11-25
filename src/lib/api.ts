

// This would be in something like src/lib/config.ts
export const API_BASE_URL = 'https://cantappbackendlaravel-production.up.railway.app';

// This is a simplified error type, you might want to expand it
type ApiError = {
    message: string;
    errors?: Record<string, string[]>;
};

async function handleResponse<T>(response: Response): Promise<T> {
  const text = await response.text();
  
  if (!response.ok) {
    let errorData;
    try {
      errorData = JSON.parse(text);
    } catch (e) {
      errorData = { message: text || 'Ocorreu um erro na API.' };
    }
    const error: Error & { data?: any } = new Error(errorData.message || 'Ocorreu um erro na API.');
    error.data = errorData;
    throw error;
  }

  // Handle empty successful responses (e.g., 200 OK or 204 No Content with no body)
  if (!text) {
    return { success: true } as unknown as T;
  }

  try {
    const data = JSON.parse(text);
    // Flexible data extraction: if response has a `data` key, use it. Otherwise, use the whole object.
    return data.data !== undefined ? data.data : data;
  } catch (e) {
    console.error("JSON parsing error:", e);
    throw new Error("Falha ao analisar a resposta do servidor.");
  }
}

// ✅ CORREÇÃO: Adicionada política de cache 'no-store' para sempre buscar dados frescos.
export async function apiGet<T>(path: string): Promise<T> {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${API_BASE_URL}/api/${path}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` }),
        },
        cache: 'no-store', // <<< ADICIONADO
    });
    return handleResponse<T>(response);
}

export async function apiPost<T>(path: string, body: any): Promise<T> {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${API_BASE_URL}/api/${path}`, {
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
    const response = await fetch(`${API_BASE_URL}/api/${path}`, {
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
    const response = await fetch(`${API_BASE_URL}/api/${path}`, {
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
    const response = await fetch(`${API_BASE_URL}/api/${path}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` }),
        },
    });
    return handleResponse<T>(response);
}
