/**
 * Base URL for API requests.
 * Loaded from Vite environment variables (`VITE_API_URL`).
 */
const BASE_URL = import.meta.env.VITE_API_URL;

// Se define una función request que hace peticiones HTTP genéricas
// path es la ruta de la API (ej: /users).
// method es el tipo de petición (GET, POST, etc.), por defecto GET.
// headers son cabeceras extra que quieras mandar.
// body es el contenido (ej: datos de un formulario).
async function request(path, { method = 'GET', headers = {}, body } = {}) {
    // Usa fetch para enviar la petición a la API, concatenando la URL base con la ruta (BASE_URL + path). Ejemplo: http://localhost:8080/users.
    const res = await fetch(`${BASE_URL}${path}`, {
        method, // method → el verbo HTTP (GET, POST, etc.)
        headers: {
            'Content-Type': 'application/json',
            ...headers,
        }, // headers → siempre manda Content-Type: application/json, y además añade cualquier cabecera extra (...headers)
        body: body ? JSON.stringify(body) : undefined, // si hay datos, los convierte a texto JSON, si no hay, no manda nada
    });

    // Revisa si la respuesta de la API viene en formato JSON (mirando su cabecera content-type)
    const isJSON = res.headers.get('content-type')?.includes('application/json');

    // Si la respuesta es JSON, la convierte en objeto con res.json()
    const payload = isJSON ? await res.json().catch(() => null) : null;

    // Si la respuesta de la API no fue exitosa (res.ok es false en errores tipo 400 o 500)
    if (!res.ok) {
        const msg = payload?.message || payload?.error || `HTTP ${res.status}`;
        throw new Error(msg);
    }

    // Si todo salió bien, devuelve el JSON con los datos que respondió la API
    return payload;
}

/**
 * Convenience HTTP client.
 * Provides shorthand methods for common HTTP verbs.
 * Se exporta un objeto http con métodos más fáciles de usar en lugar de llamar siempre a request.
 */
export const http = {
    // Atajo para hacer peticiones GET.
    get: (path, opts) => request(path, { method: 'GET', ...opts }),

    // Atajo para hacer peticiones POST, enviando datos en el body.
    post: (path, body, opts) => request(path, { method: 'POST', body, ...opts }),

    // Atajo para hacer peticiones PUT, útil para actualizar datos
    put: (path, body, opts) => request(path, { method: 'PUT', body, ...opts }),

    // Atajo para hacer peticiones DELETE, útil para borrar datos.
    del: (path, opts) => request(path, { method: 'DELETE', ...opts }),
};