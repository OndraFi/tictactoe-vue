export default {
    API_URL: import.meta.env.VITE_API_URL || "http://localhost:9000/api/",
    SOCKET_URL: import.meta.env.VITE_SOCKET_URL || "ws://localhost:9000"
}