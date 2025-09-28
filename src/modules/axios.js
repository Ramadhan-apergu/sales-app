import axios from "axios";
import Cookies from "js-cookie";

const access_token = Cookies.get("x_atkn") || "";

const instance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 30000,
  headers: {
    Accept: "application/json",
    Authorization: `Bearer ${access_token}`,
    appId: process.env.NEXT_PUBLIC_APP_ID,
  },
  withCredentials: true,
});

instance.interceptors.request.use((config) => {
  if (config.isMultipart) {
    config.headers["Content-Type"] = "multipart/form-data";
  } else {
    config.headers["Content-Type"] = "application/json";
  }
  return config;
});

export default instance;
