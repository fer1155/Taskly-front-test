import { http } from '../api/http.js';

/**
 * Register a new user in the system.
 *
 * Sends a POST request to the backend API (`/api/v1/users`)
 * with the provided username and password.
 */
export async function registerUser({ firstName, lastName, age, email, password, confirmPassword }) {
  return http.post('/api/v1/users', { firstName, lastName, age, email, password, confirmPassword });
}