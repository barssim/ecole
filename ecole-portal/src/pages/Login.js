import React, { useState } from "react";
import "../cssFiles/Login.css"; // Optional: Style the login form
import axios from 'axios';
import fr from "../locales/header/fr.json";
import ar from "../locales/header/ar.json";
import en from "../locales/header/en.json";
import { useNavigate } from "react-router-dom";
import { resolveTenantFromHost, setTenantId } from "../tenant";


const Login = ({language}) => {
	let content;
const navigate = useNavigate();

if (language === "fr") {
  content = fr;
} else if (language === "en") {
  content = en;
} else {
  content = ar;
};
	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');
	const [errorMessage, setErrorMessage] = useState('');
	const [isLoggedIn, setIsLoggedIn] = useState(false); // Track login status
	const [isLoading, setIsLoading] = useState(false); // Track loading state

	const handleLogin = async (e) => {
		e.preventDefault();
		setIsLoading(true);
		setErrorMessage('');

		const userCredentials = { username, password };
		const configuredBase = (process.env.REACT_APP_API_GATEWAY_URL || 'http://localhost:8085').replace(/\/$/, '');
		const apiBase = configuredBase.endsWith('/api') ? configuredBase : `${configuredBase}/api`;
		const apiUrl = `${apiBase}/auth/login`;

		// Log API details for debugging
		console.log('Login attempt - API URL:', apiUrl);
		console.log('Debug mode:', process.env.REACT_APP_DEBUG);

		// Send POST request to the backend to authenticate the user
		try {
			const response = await axios.post(
				apiUrl,
				userCredentials,
				{
					timeout: 10000,
					headers: {
						'Content-Type': 'application/json'
					}
				}
			);

			console.log('Login response:', response.data);

			// Extract token and user from response - handle different response formats
			let token, user;

			if (response.data.token) {
				// Format: { token: "...", user: {...} }
				token = response.data.token;
				user = response.data.user;
			} else if (response.data.jwt || response.data.jwtToken) {
				// Format: { jwt: "..." } or { jwtToken: "..." }
				token = response.data.jwt || response.data.jwtToken;
				user = { username: username };
			} else {
				throw new Error('Unexpected response format: No token found in response');
			}

			if (!token) {
				throw new Error('No authentication token received from server');
			}

			// Store the JWT token in sessionStorage
			sessionStorage.setItem('jwt_token', token);
			// Store the login status in localStorage
			localStorage.setItem("isLoggedIn", "true");

			// Store user info if available
			if (user && user.username) {
				localStorage.setItem("LoggedIn", user.username);
			} else {
				localStorage.setItem("LoggedIn", username);
			}

			if (user && user.id) {
				localStorage.setItem("userId", user.id);
			}

			// Store user roles - always store a valid JSON array
			const userRoles = (user && Array.isArray(user.roles)) ? user.roles : [];
			localStorage.setItem("user_roles", JSON.stringify(userRoles));
			setTenantId(user?.tenantId || response.data?.tenantId || resolveTenantFromHost());

			console.log('Login successful! Stored roles:', userRoles);

			// Set login status to true in the state
			setIsLoggedIn(true);
			// 🔄 Force full reload
			window.location.href = "/";
		} catch (error) {
			console.error('Login error:', error);
			console.error('Error code:', error.code);
			console.error('Error message:', error.message);
			if (error.response) {
				console.error('Response status:', error.response.status);
				console.error('Response data:', error.response.data);
			}

			let errorMsg = 'An error occurred during login. Please try again.';

			if (error.code === 'ECONNABORTED') {
				errorMsg = 'Connection timeout. The server is not responding. Please check your internet connection and try again.';
			} else if (error.code === 'ENOTFOUND' || error.code === 'ERR_INVALID_URL') {
				errorMsg = 'Unable to connect to the server. Please check the API endpoint configuration.';
			} else if (error.response) {
				// Server responded with error status
				if (error.response.status === 401) {
					errorMsg = 'Invalid username or password. Please try again.';
				} else if (error.response.status === 403) {
					errorMsg = 'Access forbidden. Your account may not have permission to login.';
				} else if (error.response.status === 400) {
					errorMsg = error.response.data?.message || 'Invalid request. Please check your input.';
				} else if (error.response.status === 500) {
					errorMsg = 'Server error. Please try again later.';
				} else if (error.response.status >= 400) {
					errorMsg = `Server error (${error.response.status}): ${error.response.data?.message || 'Please try again later.'}`;
				}
			} else if (error.message === 'Network Error') {
				errorMsg = 'Network error. Please check your internet connection.';
			} else if (error.message) {
				// Use the actual error message if available
				errorMsg = error.message;
			}

			setErrorMessage(errorMsg);
			setIsLoading(false);
		}
	};

	return (
		<div style={{ flex: 1, padding: "10px", textAlign: "center" }}>
			{errorMessage && <div className="error-message">{errorMessage}</div>}
			<form className="h2" onSubmit={handleLogin}>
				<div>
					<label htmlFor="username">Username</label>
					<input
						type="text"
						id="username"
						value={username}
						onChange={(e) => setUsername(e.target.value)}
						required
					/>
				</div>
				<br />
				<div>
					<label htmlFor="password">Password</label>
					<input
						type="password"
						id="password"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						required
					/>
				</div>
				<br />
				<div>
					<button
						className="buttonStyle"
						type="submit"
						disabled={isLoading}
					>
						{isLoading ? 'Logging in...' : content.enter}
					</button>
				</div>
				<br />
			</form>
		</div>
	);
};

export default Login;
