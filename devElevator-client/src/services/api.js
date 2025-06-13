import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api", // update this if deployed
  withCredentials: true, // required for GitHub OAuth cookies
});

export default api;
