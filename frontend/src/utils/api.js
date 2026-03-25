import axios from "axios";

const api = axios.create({
  baseURL: "https://cas-cams-hostel-management-1.onrender.com",
  withCredentials: true,
});

export default api;
