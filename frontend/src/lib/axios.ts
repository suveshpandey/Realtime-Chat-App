import axios from "axios";

export const axiosInstance = axios.create({
    // baseURL: import.meta.env.MODE === "development" ? "http://localhost:3000/api" : "https://talkify-by-sp.onrender.com/api",
    baseURL: "https://talkify-by-sp.onrender.com/api",
    withCredentials: true
})