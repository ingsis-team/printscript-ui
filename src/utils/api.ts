import axios from "axios";

const api = axios.create({
    baseURL: import.meta.env.BACKEND_URL, // Update with your backend's current port
    withCredentials: true,
});

// Add JWT token to requests
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Debugging and error handling
api.interceptors.response.use(
    (response) => {
        console.log("Response received:", response);
        return response;
    },
    async (error) => {
        if (error.response && error.response.status === 401) {
            console.error("Unauthorized - Token might be invalid or expired");
            localStorage.removeItem("token"); // Clear invalid token
            // Optionally redirect to login or refresh the token
        }
        return Promise.reject(error);
    }
);

export default api;
