import React, { useEffect, useContext } from 'react';
import Axios from 'axios';
import DispatchContext from '../context/DispatchContext';
import { useImmerReducer } from 'use-immer';
import StateContext from '../context/StateContext';

function HeaderLoggedOut(props) {
	const appDispatch = useContext(DispatchContext);
	const appState = useContext(StateContext);
	const initState = {
		username: {
			value: '',
			hasErrors: false,
			message: ''
		},
		password: {
			value: '',
			hasErrors: false,
			message: ''
		},
		submitCount: 0,
		killError: false,
		killErrorMessage: ''
	};

	function loginReducer(draft, action) {
		switch (action.type) {
			case 'usernameImmediately':
				draft.killError = false;
				draft.username.hasErrors = false;
				draft.username.value = action.value;
				return;
			case 'passwordImmediately':
				draft.killError = false;
				draft.password.hasErrors = false;
				draft.password.value = action.value;
				return;
			case 'usernameSubmit':
				draft.username.value = action.value;
				if (draft.username.value.trim().length === 0) {
					draft.username.hasErrors = true;
					draft.username.message = 'Username field is empty';
				}
				if (draft.username.value && /\W/g.test(draft.username.value)) {
					draft.username.hasErrors = true;
					draft.username.message = 'Only letters, numbers, or _';
				}
				return;
			case 'setKillError':
				draft.killError = true;
				draft.killErrorMessage = action.value;
				return;
			case 'passwordSubmit':
				draft.password.value = action.value;
				if (draft.password.value.trim().length === 0) {
					draft.password.hasErrors = true;
					draft.password.message = 'Password is missing';
				}
				return;
			case 'submitLogin':
				draft.submitCount++;
				return;
		}
	}

	const [ state, dispatch ] = useImmerReducer(loginReducer, initState);

	const handleSubmit = async e => {
		e.preventDefault();
		dispatch({ type: 'usernameSubmit', value: state.username.value });
		dispatch({ type: 'passwordSubmit', value: state.password.value });
		dispatch({ type: 'submitLogin' });
	};

	useEffect(
		() => {
			if (state.submitCount) {
				const cancelReq = Axios.CancelToken.source();
				const submitData = async () => {
					try {
						const res = await Axios.post('/login', {
							username: state.username.value,
							password: state.password.value
						});
						console.log(res.data);
						if (res.data) {
							appDispatch({ type: 'login', userData: res.data });
							appDispatch({
								type: 'flashMessage',
								value: `Welcome back ${res.data.username}`
							});
						} else {
							dispatch({
								type: 'setKillError',
								value: 'Invalid username or password'
							});
							appDispatch({
								type: 'flashMessageError',
								value: 'Invalid username or password.'
							});
						}
					} catch (e) {
						console.log(e);
					}
				};
				if (state.setKillError)
					appDispatch({
						type: 'flashMessageError',
						value: `${state.message} `
					});
				else if (state.password.hasErrors && state.username.hasErrors)
					appDispatch({
						type: 'flashMessageError',
						value: `${state.username.message} and ${state.password
							.message}`
					});
				else if (state.password.hasErrors) {
					appDispatch({
						type: 'flashMessageError',
						value: state.password.message
					});
				} else if (state.username.hasErrors) {
					appDispatch({
						type: 'flashMessageError',
						value: state.username.message
					});
				} else submitData();
				return () => {
					cancelReq.cancel();
				};
			}
		},
		[ state.submitCount ]
	);

	return (
		<form className="mb-0 pt-2 pt-md-0" onSubmit={handleSubmit}>
			<div className="row align-items-center">
				<div className="col-md mr-0 pr-md-0 mb-3 mb-md-0">
					<input
						name="username"
						className={`form-control form-control-sm input-dark ${(state
							.username.hasErrors ||
							state.killError) &&
							'border-error'}
							`}
						type="text"
						placeholder="Username"
						autoComplete="off"
						onChange={e => {
							dispatch({
								type: 'usernameImmediately',
								value: e.target.value
							});
						}}
						value={state.username.value}
					/>
				</div>
				<div className="col-md mr-0 pr-md-0 mb-3 mb-md-0">
					<input
						name="password"
						className={`form-control form-control-sm input-dark ${(state
							.password.hasErrors ||
							state.killError) &&
							'border-error'}
							`}
						type="password"
						placeholder="Password"
						onChange={e => {
							dispatch({
								type: 'passwordImmediately',
								value: e.target.value
							});
						}}
						value={state.password.value}
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
