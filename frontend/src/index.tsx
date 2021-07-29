import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { transitions, positions, Provider as AlertProvider } from 'react-alert';
import axios from 'axios';
import { SERVER_URL } from './appConfigs';
import AlertTemplate from 'react-alert-template-basic';

axios.defaults.baseURL = SERVER_URL;
axios.defaults.timeout = 5000;
axios.defaults.headers = {
  'Authorization': "JWT " + localStorage.getItem('access_token'),
  'Content-Type': 'application/json',
  'accept': 'application/json'
};

axios.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;

    if (error.response && error.response.status === 401 && originalRequest.url === SERVER_URL + 'api/token/refresh/') {
      window.location.href = '/login/';
      return Promise.reject(error);
    }
    if (error.response && error.response.data.code === "token_not_valid" &&
      error.response.status === 401 &&
      error.response.statusText === "Unauthorized") {
      const refresh = localStorage.getItem('refresh_token');

      if (refresh && refresh !== "undefined") {
        const tokenParts = JSON.parse(atob(refresh.split('.')[1]));

        // exp date in token is expressed in seconds, while now() returns milliseconds:
        const now = Math.ceil(Date.now() / 1000);

        if (tokenParts.exp > now) {
          try {
            const { refresh: newRefresh, access } = (await axios.post('/api/token/refresh/', { refresh })).data;
            
            localStorage.setItem('access_token', access);
            localStorage.setItem('refresh_token', newRefresh);

            axios.defaults.headers['Authorization'] = "JWT " + access;
            originalRequest.headers['Authorization'] = "JWT " + access;

            return axios(originalRequest);
          } catch (err) {
            console.error(err);
          }
        }
        console.log("Refresh token is expired", tokenParts.exp, now);
      } else {
        console.log("Refresh token not available.")
      }
    }
    return Promise.reject(error);
  }
);

// React Alert Configs
const alertOptions = {
  position: positions.BOTTOM_RIGHT,
  timeout: 7000,
  offset: '30px',
  transition: transitions.FADE
}

ReactDOM.render(
  <React.StrictMode>
    <AlertProvider template={AlertTemplate} {...alertOptions}>
      <App />
    </AlertProvider>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
