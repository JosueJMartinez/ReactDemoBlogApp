import React, { useEffect, useContext } from 'react';
import Page from './Page';
import Axios from 'axios';
import { useImmerReducer } from 'use-immer';
import { CSSTransition } from 'react-transition-group';
import DispatchContext from './context/DispatchContext';

function HomeGuest() {
	const appDispatch = useContext(DispatchContext);
	const initState = {
		username: {
			value: '',
			message: '',
			hasErrors: false,
			isUnique: false,
			checkCount: 0
		},
		email: {
			value: '',
			message: '',
			hasErrors: false,
			isUnique: false,
			checkCount: 0
		},
		password: {
			value: '',
			message: '',
			hasErrors: false
		},
		submitCount: 0
	};

	function signUpReducer(draft, action) {
		switch (action.type) {
			case 'usernameImmediately':
				draft.username.hasErrors = false;
				draft.username.value = action.value;
				if (draft.username.value.length >= 30) {
					draft.username.hasErrors = true;
					draft.username.message = 'Username is over 30 characters long';
				}
				if (draft.username.value.length === 0) {
					draft.username.hasErrors = true;
					draft.username.message = 'Username field is empty.';
				}
				if (draft.username.value && /\W/g.test(draft.username.value)) {
					draft.username.hasErrors = true;
					draft.username.message = 'Only letters, numbers, or _. ';
				}
				return;
			case 'usernameAfterDelay':
				if (draft.username.value && draft.username.value.length < 4) {
					draft.username.hasErrors = true;
					draft.username.message =
						'Username must be more than three characters long.';
				}
				if (!draft.username.hasErrors && !action.noRequest) {
					draft.username.checkCount++;
				}
				return;
			case 'usernameUniqueResults':
				if (action.value) {
					draft.username.hasErrors = true;
					draft.username.isUnique = false;
					draft.username.message = 'That username is already taken';
				} else {
					draft.username.isUnique = true;
				}
				return;
			case 'usernameError':
				draft.username.hasErrors = true;
				draft.username.message = action.value;
				return;
			case 'emailImmediately':
				draft.email.hasErrors = false;
				draft.email.value = action.value;
				return;
			case 'emailAfterDelay':
				if (!/^\S+@\S+$/.test(draft.email.value)) {
					draft.email.hasErrors = true;
					draft.email.message = 'Please enter a valid email.';
				}
				if (!draft.email.hasErrors && !action.noRequest) {
					draft.email.checkCount++;
				}
				return;
			case 'emailUniqueResults':
				if (action.value) {
					draft.email.hasErrors = true;
					draft.email.isUnique = false;
					draft.email.message = 'That email has already been taken.';
				} else {
					draft.email.isUnique = true;
				}
				return;
			case 'passwordImmediately':
				draft.password.hasErrors = false;
				draft.password.value = action.value;
				if (draft.password.value.length > 50) {
					draft.password.hasErrors = true;
					draft.password.message = 'Password cannot exceed 50 characters.';
				}
				return;
			case 'passwordAfterDelay':
				if (draft.password.value.length < 12) {
					draft.password.hasErrors = true;
					draft.password.message =
						'Password must be at least 12 characters long';
				}
				if (draft.password.value && !/\W/g.test(draft.password.value)) {
					draft.password.hasErrors = true;
					draft.password.message =
						'Password must have at least one non-alphanumeric character.';
				}
				return;
			case 'submitForm':
				if (
					!draft.username.hasErrors &&
					!draft.email.hasErrors &&
					!draft.password.hasErrors &&
					draft.username.isUnique &&
					draft.email.isUnique
				) {
					draft.submitCount++;
				}
				return;
		}
	}
	const [ state, dispatch ] = useImmerReducer(signUpReducer, initState);

	//check username delay for 800ms
	useEffect(
		() => {
			if (state.username.value) {
				const delay = setTimeout(() => {
					dispatch({ type: 'usernameAfterDelay' });
				}, 800);
				return () => {
					clearTimeout(delay);
				};
			}
		},
		[ state.username.value ]
	);

	//check email with delay
	useEffect(
		() => {
			if (state.email.value) {
				const delay = setTimeout(() => {
					dispatch({ type: 'emailAfterDelay' });
				}, 800);
				return () => {
					clearTimeout(delay);
				};
			}
		},
		[ state.email.value ]
	);

	//check password with delay
	useEffect(
		() => {
			if (state.password.value) {
				const delay = setTimeout(() => {
					dispatch({ type: 'passwordAfterDelay' });
				}, 800);
				return () => {
					clearTimeout(delay);
				};
			}
		},
		[ state.password.value ]
	);

	useEffect(
		() => {
			if (state.username.checkCount) {
				const cancelReq = Axios.CancelToken.source();
				const fetchUsernameStatus = async () => {
					try {
						const req = await Axios.post(
							'/doesUsernameExist',
							{ username: state.username.value },
							{ cancelToken: cancelReq.token }
						);
						dispatch({ type: 'usernameUniqueResults', value: req.data });
					} catch (e) {
						console.log(e);
						console.log('there was a problem');
					}
				};
				fetchUsernameStatus();
				return () => {
					cancelReq.cancel();
				};
			}
		},
		[ state.username.checkCount ]
	);

	useEffect(
		() => {
			if (state.email.checkCount) {
				const cancelReq = Axios.CancelToken.source();
				const fetchEmailStatus = async () => {
					try {
						const req = await Axios.post(
							'/doesEmailExist',
							{ email: state.email.value },
							{ cancelToken: cancelReq.token }
						);
						dispatch({ type: 'emailUniqueResults', value: req.data });
					} catch (e) {
						console.log(e);
						console.log('there was a problem');
					}
				};
				fetchEmailStatus();
				return () => {
					cancelReq.cancel();
				};
			}
		},
		[ state.email.checkCount ]
	);

	useEffect(
		() => {
			if (state.submitCount) {
				const cancelReq = Axios.CancelToken.source();
				const submitData = async () => {
					try {
						let res = await Axios.post(
							'/register',
							{
								username: state.username.value,
								email: state.email.value,
								password: state.password.value
							},
							{ cancelToken: cancelReq.token }
						);
						if (res.data) {
							appDispatch({ type: 'login', userData: res.data });
							appDispatch({
								type: 'flashMessage',
								value: `Welcome to your new account ${state.username
									.value}`
							});
						}
					} catch (e) {
						console.log(e);
						console.log('there was a problem');
					}
				};
				submitData();
				return () => {
					cancelReq.cancel();
				};
			}
		},
		[ state.submitCount ]
	);

	const handleSubmit = e => {
		e.preventDefault();
		dispatch({ type: 'usernameImmediately', value: state.username.value });
		dispatch({
			type: 'usernameAfterDelay',
			value: state.username.value,
			noRequest: true
		});
		dispatch({ type: 'emailImmediately', value: state.email.value });
		dispatch({
			type: 'emailAfterDelay',
			value: state.email.value,
			noRequest: true
		});
		dispatch({ type: 'passwordImmediately', value: state.password.value });
		dispatch({ type: 'passwordAfterDelay', value: state.password.value });
		dispatch({ type: 'submitForm' });
	};

	return (
		<Page wide={true} title="Welcome">
			<div className="row align-items-center">
				<div className="col-lg-7 py-3 py-md-5">
					<h1 className="display-3">Remember Writing?</h1>
					<p className="lead text-muted">
						Are you sick of short tweets and impersonal
						&ldquo;shared&rdquo; posts that are reminiscent of the late
						90&rsquo;s email forwards? We believe getting back to actually
						writing is the key to enjoying the internet again.
					</p>
				</div>
				<div className="col-lg-5 pl-lg-5 pb-3 py-lg-5">
					<form onSubmit={handleSubmit}>
						<div className="form-group">
							<label
								htmlFor="username-register"
								className="text-muted mb-1"
							>
								<small>Username</small>
							</label>
							<input
								id="username-register"
								name="username"
								className={`form-control ${state.username.hasErrors
									? 'border-error'
									: ''}`}
								type="text"
								placeholder="Pick a username"
								autoComplete="off"
								onChange={e =>
									dispatch({
										type: 'usernameImmediately',
										value: e.target.value
									})}
								value={state.username.value}
							/>
							<CSSTransition
								in={state.username.hasErrors}
								timeout={330}
								classNames="liveValidateMessage"
								unmountOnExit
							>
								<div className="alert alert-danger small liveValidateMessage">
									{state.username.message}
								</div>
							</CSSTransition>
						</div>
						<div className="form-group">
							<label htmlFor="email-register" className="text-muted mb-1">
								<small>Email</small>
							</label>
							<input
								id="email-register"
								name="email"
								className={`form-control ${state.email.hasErrors
									? 'border-error'
									: ''}`}
								type="text"
								placeholder="you@example.com"
								autoComplete="off"
								onChange={e =>
									dispatch({
										type: 'emailImmediately',
										value: e.target.value
									})}
								value={state.email.value}
							/>
							<CSSTransition
								in={state.email.hasErrors}
								timeout={330}
								classNames="liveValidateMessage"
								unmountOnExit
							>
								<div className="alert alert-danger small liveValidateMessage">
									{state.email.message}
								</div>
							</CSSTransition>
						</div>
						<div className="form-group">
							<label
								htmlFor="password-register"
								className="text-muted mb-1"
							>
								<small>Password</small>
							</label>
							<input
								id="password-register"
								name="password"
								className={`form-control ${state.password.hasErrors
									? 'border-error'
									: ''}`}
								type="password"
								placeholder="Create a password"
								onChange={e =>
									dispatch({
										type: 'passwordImmediately',
										value: e.target.value
									})}
								value={state.password.value}
							/>
							<CSSTransition
								in={state.password.hasErrors}
								timeout={330}
								classNames="liveValidateMessage"
								unmountOnExit
							>
								<div className="alert alert-danger small liveValidateMessage">
									{state.password.message}
								</div>
							</CSSTransition>
						</div>
						<button
							type="submit"
							className="py-3 mt-4 btn btn-lg btn-success btn-block"
							disabled={
								state.username.hasErrors ||
								state.email.hasErrors ||
								state.password.hasErrors
							}
						>
							Sign up for ComplexApp
						</button>
					</form>
				</div>
			</div>
		</Page>
	);
}

export default HomeGuest;
