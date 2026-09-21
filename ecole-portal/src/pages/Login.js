import React, { useState } from "react";
import "../cssFiles/Login.css"; // Optional: Style the login form
import axios from 'axios';
import fr from "../locales/header/fr.json";
import ar from "../locales/header/ar.json";
import en from "../locales/header/en.json";
import { resolveSchoolFromHost, setSchoolId } from "../school";
import { resolveApiBaseUrl } from "../utils/apiBaseUrl";

const decodeJwtPayload = (token) => {
	try {
		const payload = token.split('.')[1];
		if (!payload) return null;
		const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
		const decoded = decodeURIComponent(
			atob(normalized)
				.split('')
				.map((char) => `%${(`00${char.charCodeAt(0).toString(16)}`).slice(-2)}`)
				.join('')
		);
		return JSON.parse(decoded);
	} catch {
		return null;
	}
};

const resolveSchoolFromLoginResponse = (token, user, topLevelSchoolId) => {
	const normalizedUserSchool = String(user?.schoolId || '').trim().toLowerCase();
	if (normalizedUserSchool) {
		return normalizedUserSchool;
	}

	const normalizedTopLevelSchool = String(topLevelSchoolId || '').trim().toLowerCase();
	if (normalizedTopLevelSchool) {
		return normalizedTopLevelSchool;
	}

	const jwtPayload = decodeJwtPayload(token);
	const normalizedJwtSchool = String(jwtPayload?.school_id || '').trim().toLowerCase();
	if (normalizedJwtSchool) {
		return normalizedJwtSchool;
	}

	return resolveSchoolFromHost();
};

const resolveUserIdFromLoginResponse = (token, user) => {
	const directUserId = Number(user?.id);
	if (Number.isInteger(directUserId) && directUserId > 0) {
		return directUserId;
	}

	const jwtPayload = decodeJwtPayload(token);
	const candidate = jwtPayload?.userId ?? jwtPayload?.user_id ?? jwtPayload?.id ?? jwtPayload?.sub;
	const jwtUserId = Number(candidate);
	if (Number.isInteger(jwtUserId) && jwtUserId > 0) {
		return jwtUserId;
	}

	return null;
};

const extractRolesFromJwtPayload = (jwtPayload) => {
	if (!jwtPayload) {
		return [];
	}
	const candidate = jwtPayload.roles ?? jwtPayload.role ?? jwtPayload.authorities ?? jwtPayload.scope;
	if (Array.isArray(candidate)) {
		return candidate.map((role) => String(role || "").trim()).filter(Boolean);
	}
	if (typeof candidate === "string") {
		return candidate
			.split(/[,\s]+/)
			.map((role) => role.trim())
			.filter(Boolean);
	}
	return [];
};

const resolveRolesFromLoginResponse = (token, user) => {
	const userRoles = (user && Array.isArray(user.roles)) ? user.roles.map((role) => String(role || "").trim()).filter(Boolean) : [];
	if (userRoles.length > 0) {
		return userRoles;
	}

	const jwtPayload = decodeJwtPayload(token);
	const jwtRoles = extractRolesFromJwtPayload(jwtPayload);
	if (jwtRoles.length > 0) {
		return jwtRoles;
	}

	if (user && user.role) {
		return [String(user.role).trim()].filter(Boolean);
	}

	return [];
};

const Login = ({language}) => {
	let content;

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
	const [isLoading, setIsLoading] = useState(false); // Track loading state

	const handleLogin = async (e) => {
		e.preventDefault();
		setIsLoading(true);
		setErrorMessage('');

		const userCredentials = { username, password };
		const configuredBase = resolveApiBaseUrl('http://localhost:8085');
		const useRelativeApi = String(process.env.REACT_APP_USE_RELATIVE_API || '').trim().toLowerCase() === 'true';
		const apiUrl = useRelativeApi ? '/api/auth/login' : `${configuredBase}/api/auth/login`;
		const schoolHint = resolveSchoolFromHost();

		console.log('Login attempt - API URL:', apiUrl);
		console.log('Debug mode:', process.env.REACT_APP_DEBUG);

		try {
			const response = await axios.post(
				apiUrl,
				userCredentials,
				{
					timeout: 10000,
					headers: {
						'Content-Type': 'application/json',
						'X-School-Id': schoolHint
					}
				}
			);

			console.log('Login response:', response.data);

			let token, user;

			if (response.data.token) {
				token = response.data.token;
				user = response.data.user;
			} else if (response.data.jwt || response.data.jwtToken) {
				token = response.data.jwt || response.data.jwtToken;
				user = { username: username };
			} else {
				throw new Error('Unexpected response format: No token found in response');
			}

			if (!token) {
				throw new Error('No authentication token received from server');
			}

			sessionStorage.setItem('jwt_token', token);
			localStorage.setItem("isLoggedIn", "true");

			if (user && user.username) {
				localStorage.setItem("LoggedIn", user.username);
			} else {
				localStorage.setItem("LoggedIn", username);
			}

			if (user && user.civilite) {
				localStorage.setItem("civilite", user.civilite);
			} else {
				localStorage.removeItem("civilite");
			}

			if (user && user.firstname) {
				localStorage.setItem("firstname", user.firstname);
			} else {
				localStorage.removeItem("firstname");
			}

			const resolvedUserId = resolveUserIdFromLoginResponse(token, user);
			if (resolvedUserId !== null) {
				localStorage.setItem("userId", String(resolvedUserId));
			}

			const userRoles = resolveRolesFromLoginResponse(token, user);
			localStorage.setItem("user_roles", JSON.stringify(userRoles));
			setSchoolId(resolveSchoolFromLoginResponse(token, user, response.data?.schoolId));

			console.log('Login successful! Stored roles:', userRoles);
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
				errorMsg = `Network error. Unable to reach login endpoint (${apiUrl}).`;
			} else if (error.message) {
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
