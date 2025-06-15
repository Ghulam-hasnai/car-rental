import axios from "axios";

const API_BASE_URL = "http://127.0.0.1:5000/api/auth";

export const signup = async (userData) => {
  return await axios.post(`${API_BASE_URL}/signup`, userData);
};

export const login = async (loginData) => {
  return await axios.post(`${API_BASE_URL}/login`, loginData);
};
