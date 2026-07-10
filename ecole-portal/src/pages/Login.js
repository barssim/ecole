import React, { useState } from "react";
import "../cssFiles/Login.css"; // Optional: Style the login form
import axios from 'axios';
import fr from "../locales/header/fr.json";
import ar from "../locales/header/ar.json";
import en from "../locales/header/en.json";
import { useNavigate } from "react-router-dom";


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

		// Send POST request to the backend to authenticate the user
		try {
			const response = await axios.post(
				`${process.env.REACT_APP_API_GATEWAY_URL}/api/auth/login`,
				userCredentials,
				{
					timeout: 10000 // 10 second timeout
				}
			);

			const { token, user } = response.data;
			// Store the JWT token in sessionStorage
			sessionStorage.setItem('jwt_token', token);
			// Store the login status in localStorage
			localStorage.setItem("isLoggedIn", "true");
			localStorage.setItem("LoggedIn", user.username);
			localStorage.setItem("userId", user.id);
			// Store user roles
			localStorage.setItem("user_roles", JSON.stringify(user.roles));
			// Set login status to true in the state
			setIsLoggedIn(true);
			// 🔄 Force full reload
			window.location.href = "/";
		} catch (error) {
			let errorMsg = 'An error occurred during login. Please try again.';

			if (error.code === 'ECONNABORTED') {
				errorMsg = 'Connection timeout. The server is not responding. Please check your internet connection and try again.';
			} else if (error.code === 'ENOTFOUND' || error.code === 'ERR_INVALID_URL') {
				errorMsg = 'Unable to connect to the server. Please check the API endpoint configuration.';
			} else if (error.response) {
				// Server responded with error status
				if (error.response.status === 401) {
					errorMsg = 'Invalid username or password. Please try again.';
				} else if (error.response.status === 500) {
					errorMsg = 'Server error. Please try again later.';
				}
			} else if (error.message === 'Network Error') {
				errorMsg = 'Network error. Please check your internet connection.';
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
