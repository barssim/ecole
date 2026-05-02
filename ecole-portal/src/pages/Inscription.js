import React, { useState } from "react";
import "../cssFiles/Inscription.css";
import fr from "../locales/header/fr.json";
import ar from "../locales/header/ar.json";
import en from "../locales/header/en.json";
import axios from "axios";
import { REST_API_GATEWAY_URL } from "../globals.js";

const Inscription = ({ language }) => {
	let content;

if (language === "fr") {
  content = fr;
} else if (language === "en") {
  content = en;
} else {
  content = ar;
};
	const [formData, setFormData] = useState({
		surname: "",
		firstname: "",
		email: "",
		adresse: "",
		password: "",
		confirmPassword: "",
	});

	const [error, setError] = useState({});
	const [success, setSuccess] = useState("");
	const [loading, setLoading] = useState(false);

	const handleChange = (e) => {
		const { name, value } = e.target;
		setFormData({ ...formData, [name]: value });
		setError({ ...error, [name]: "" }); // Clear field-level error on change
	};

	const validateInputs = () => {
		const { surname, firstname, email, adresse, password, confirmPassword } = formData;
		const errors = {};

		if (!surname.trim()) errors.surname = content.surnameRequired;
		if (!firstname.trim()) errors.firstname = content.firstnameRequired;
		if (!email.trim()) errors.email = content.emailRequired;
		else if (!/\S+@\S+\.\S+/.test(email)) errors.email = content.invalidEmail;

		if (!adresse.trim()) errors.adresse = content.adresseRequired;
		if (!password) errors.password = content.passwordRequired;
		if (!confirmPassword) errors.confirmPassword = content.confirmPasswordRequired;
		else if (password !== confirmPassword) errors.confirmPassword = content.passwordMismatch;

		return errors;
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);

		const errors = validateInputs();
		if (Object.keys(errors).length > 0) {
			setError(errors);
			setLoading(false);
			return;
		}

		try {
			const { surname, firstname, email, adresse, password } = formData;
			const token = sessionStorage.getItem('jwt_token');
			const response = await axios.post(`${process.env.REACT_APP_API_GATEWAY_URL}/api/auth/register`, {
				surname,
				firstname,
				email,
				adresse,
				password
			}, {
				headers: {
					'Content-Type': 'application/json', // Ensure correct content type
					Authorization: `Bearer ${token}`  // Send the token if required
				}
			});

			if (response.status === 201) {
				setSuccess(content.registrationSuccess.replace("{surname}", surname));
				setError({});
				// Redirect the user to a protected page (you can use react-router here)
				window.location.href = '/dashboard';  // Example redirection
			} else {
				setError({ general: content.registrationError });
			}
		} catch (err) {
			console.error("Error:", err);
			setError({ general: content.registrationError });
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="signup-container">
			<form className="signup-form" onSubmit={handleSubmit}>
				<h2>{content.register}</h2>
				{error.general && <p className="error-message">{error.general}</p>}
				{success && <p className="success-message">{success}</p>}
				<div className="form-group">
					<label htmlFor="surname">{content.surname}:</label>
					<input
						type="text"
						id="surname"
						name="surname"
						value={formData.surname}
						onChange={handleChange}
						placeholder="Enter your family name"
					/>
					{error.surname && <p className="field-error">{error.surname}</p>}
				</div>
				<div className="form-group">
					<label htmlFor="firstname">{content.firstname}:</label>
					<input
						type="text"
						id="firstname"
						name="firstname"
						value={formData.firstname}
						onChange={handleChange}
						placeholder="Enter your first name"
					/>
					{error.firstname && <p className="field-error">{error.firstname}</p>}
				</div>
				<div className="form-group">
					<label htmlFor="email">{content.email}:</label>
					<input
						type="email"
						id="email"
						name="email"
						value={formData.email}
						onChange={handleChange}
						placeholder="Enter your email"
					/>
					{error.email && <p className="field-error">{error.email}</p>}
				</div>
				<div className="form-group">
					<label htmlFor="adresse">{content.adresse}:</label>
					<input
						type="text"
						id="adresse"
						name="adresse"
						value={formData.adresse}
						onChange={handleChange}
						placeholder="Enter your address"
					/>
					{error.adresse && <p className="field-error">{error.adresse}</p>}
				</div>
				<div className="form-group">
					<label htmlFor="password">{content.password}:</label>
					<input
						type="password"
						id="password"
						name="password"
						value={formData.password}
						onChange={handleChange}
						placeholder="Create a password"
					/>
					{error.password && <p className="field-error">{error.password}</p>}
				</div>
				<div className="form-group">
					<label htmlFor="confirmPassword">{content.confirmPassword}:</label>
					<input
						type="password"
						id="confirmPassword"
						name="confirmPassword"
						value={formData.confirmPassword}
						onChange={handleChange}
						placeholder="Confirm your password"
					/>
					{error.confirmPassword && <p className="field-error">{error.confirmPassword}</p>}
				</div>
				<button type="submit" className="signup-button" disabled={loading}>
					{loading ? content.loading : content.submit}
				</button>
			</form>
		</div>
	);
};

export default Inscription;
