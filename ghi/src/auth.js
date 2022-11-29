import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
let internalToken = null;

export function getToken() {
	return internalToken;
}

export async function getTokenInternal() {
	const url = `${process.env.REACT_APP_ACCOUNTS_HOST}/api/accounts/me/token/`;
	try {
		const response = await fetch(url, {
			credentials: "include",
		});
		if (response.ok) {
			const data = await response.json();
			internalToken = data.token;
			return internalToken;
		}
	} catch (e) {}
	return false;
}

function handleErrorMessage(error) {
	if ("error" in error) {
		error = error.error;
		try {
			error = JSON.parse(error);
			if ("__all__" in error) {
				error = error.__all__;
			}
		} catch {}
	}
	if (Array.isArray(error)) {
		error = error.join("<br>");
	} else if (typeof error === "object") {
		error = Object.entries(error).reduce(
			(acc, x) => `${acc}<br>${x[0]}: ${x[1]}`,
			""
		);
	}
	return error;
}

export const AuthContext = createContext({
	token: null,
	setToken: () => null,
	user: null,
	setUser: () => null,
	token: null,
	setToken: () => null,
	user: null,
	setUser: () => null,
});

export const AuthProvider = ({ children }) => {
	const [token, setToken] = useState(null);
	const [user, setUser] = useState(null);

	return (
		<AuthContext.Provider value={{ token, setToken, user, setUser }}>
			{children}
		</AuthContext.Provider>
	);
};

export const useAuthContext = () => useContext(AuthContext);

export function useToken() {
	const { token, setToken, user, setUser } = useAuthContext();
	const navigate = useNavigate();

	useEffect(() => {
		async function fetchToken() {
			const token = await getTokenInternal();
			setToken(token);
			const response2 = await fetch(
				`${process.env.REACT_APP_ACCOUNTS_HOST}/users/current`,
				{
					method: "get",
					credentials: "include",
				}
			);
			setUser(await response2.json());
		}
		if (!token) {
			fetchToken();
		}
	}, [setToken, token]);
	useEffect(() => {
		async function fetchToken() {
			const token = await getTokenInternal();
			setToken(token);
			const response2 = await fetch(
				`${process.env.REACT_APP_ACCOUNTS_HOST}/users/current`,
				{
					method: "get",
					credentials: "include",
				}
			);
			setUser(await response2.json());
		}
		if (!token) {
			fetchToken();
		}
	}, [setToken, token, setUser, user]);

	async function logout() {
		if (token) {
			const url = `${process.env.REACT_APP_ACCOUNTS_HOST}/api/token/refresh/logout/`;
			await fetch(url, { method: "delete", credentials: "include" });
			internalToken = null;
			setToken(null);
			setUser(null);
			navigate("/");
		}
	}

	async function login(username, password) {
		const url = `${process.env.REACT_APP_ACCOUNTS_HOST}/login/`;
		const form = new FormData();
		form.append("username", username);
		form.append("password", password);
		const response = await fetch(url, {
			method: "post",
			credentials: "include",
			body: form,
		});
		const response2 = await fetch(
			`${process.env.REACT_APP_ACCOUNTS_HOST}/users/current`,
			{
				method: "get",
				credentials: "include",
			}
		);
		setUser(await response2.json());
		if (response.ok) {
			const token = await getTokenInternal();
			setToken(token);
			return;
		}
		let error = await response.json();
		return handleErrorMessage(error);
	}
	async function login(username, password) {
		const url = `${process.env.REACT_APP_ACCOUNTS_HOST}/token/`;
		const form = new FormData();

		form.append("username", username);
		form.append("password", password);
		const response = await fetch(url, {
			method: "post",
			credentials: "include",
			body: form,
		});
		response.then((username) => console.log(username, "is logged in"));
		// const response2 = await fetch(
		//   `${process.env.REACT_APP_ACCOUNTS_HOST}/users/current`,
		//   {
		//     method: "get",
		//     credentials: "include",
		//   }
		// );
		// setUser(await response2.json());
		// if (response.ok) {
		//   const token = await getTokenInternal();
		//   setToken(token);
		//   return;
		// }
		let error = await response.json();
		return handleErrorMessage(error);
	}

	async function signup(username, password, email, firstName, lastName) {
		const url = `${process.env.REACT_APP_ACCOUNTS_HOST}/api/accounts/`;
		const response = await fetch(url, {
			method: "post",
			body: JSON.stringify({
				username,
				password,
				email,
				first_name: firstName,
				last_name: lastName,
			}),
			headers: {
				"Content-Type": "application/json",
			},
		});
		if (response.ok) {
			await login(username, password);
		}
		return false;
	}

	async function update(username, password, email, firstName, lastName) {
		const url = `${process.env.REACT_APP_ACCOUNTS_HOST}/api/accounts/`;
		const response = await fetch(url, {
			method: "post",
			body: JSON.stringify({
				username,
				password,
				email,
				first_name: firstName,
				last_name: lastName,
			}),
			headers: {
				"Content-Type": "application/json",
			},
		});
		if (response.ok) {
			await login(username, password);
		}
		return false;
	}

	return [token, login, logout, signup, update, user];
}
