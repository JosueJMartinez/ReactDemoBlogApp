import React, { useEffect, useState, useContext } from 'react';
import Axios from 'axios';
import DispatchContext from '../context/DispatchContext';
import StateContext from '../context/StateContext';

function HeaderLoggedOut(props) {
	const [ user, setLogin ] = useState({ username: '', password: '' });
	let [ loginError, setLoginError ] = useState('');
	const appDispatch = useContext(DispatchContext);
	const appState = useContext(StateContext);

	const handleChange = e => {
		setLoginError('');
		const { name, value } = e.target;
		setLogin(prevInput => {
			return { ...prevInput, [name]: value };
		});
	};

	const handleSubmit = async e => {
		e.preventDefault();
		try {
			const res = await Axios.post('/login', user);
			if (res.data) {
				// localStorage.setItem('username', res.data.username);
				// localStorage.setItem('avatar', res.data.avatar);
				// localStorage.setItem('token', res.data.token);
				appDispatch({ type: 'login', userData: res.data });
				appDispatch({
					type: 'flashMessage',
					value: `Welcome back ${user.username}`
				});
			} else {
				appDispatch({
					type: 'flashMessageError',
					value: 'Invalid username or password.'
				});
			}
		} catch (e) {
			console.log(e.response.data);
		}
	};

	return (
		<form className="mb-0 pt-2 pt-md-0" onSubmit={handleSubmit}>
			<div className="row align-items-center">
				<div className="col-md mr-0 pr-md-0 mb-3 mb-md-0">
					<input
						name="username"
						className="form-control form-control-sm input-dark"
						type="text"
						placeholder="Username"
						autoComplete="off"
						onChange={handleChange}
					/>
				</div>
				<div className="col-md mr-0 pr-md-0 mb-3 mb-md-0">
					<input
						name="password"
						className="form-control form-control-sm input-dark"
						type="password"
						placeholder="Password"
						onChange={handleChange}
					/>
				</div>
				<div className="col-md-auto">
					<button type="submit" className="btn btn-success btn-sm">
						Sign In
					</button>
				</div>
			</div>
		</form>
	);
}

export default HeaderLoggedOut;
