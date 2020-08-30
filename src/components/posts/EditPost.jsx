import React, { useEffect, useState, useContext } from 'react';
import { useParams, Link, withRouter } from 'react-router-dom';
import { useImmerReducer } from 'use-immer';
import Page from '../Page';
import Axios from 'axios';
import LoadingDotsIcon from '../LoadingDotsIcon';
import DispatchContext from '../context/DispatchContext';
import StateContext from '../context/StateContext';
import PageNotFound from '../errorPages/PageNotFound';

function EditPost(props) {
	const appState = useContext(StateContext);
	const appDispatch = useContext(DispatchContext);

	const initState = {
		title: {
			value: '',
			hasErrors: false,
			message: ''
		},
		body: {
			value: '',
			hasErrors: false,
			message: ''
		},
		isFetching: true,
		isSaving: false,
		isVisitorOwner: false,
		author: { avatar: '', username: '' },
		id: useParams().id,
		sendCount: 0,
		notFound: false
	};

	const [ errors, setErrors ] = useState({ title: '', body: '' });

	const [ state, dispatch ] = useImmerReducer(editPostReducer, initState);

	//function to call save changes and prevent default
	const submitHandler = e => {
		e.preventDefault();
		dispatch({ type: 'titleRules', value: state.title.value });
		dispatch({ type: 'bodyRules', value: state.body.value });
		dispatch({ type: 'saveChanges' });
	};

	// this reducer used in place of useState for functions such error handling
	// retrieve and submit posts
	function editPostReducer(draft, action) {
		switch (action.type) {
			case 'fetchComplete':
				draft.title.value = action.value.title;
				draft.body.value = action.value.body;
				draft.author.avatar = action.value.author.avatar;
				draft.author.username = action.value.author.username;
				if (action.value.author.username === appState.user.username) {
					draft.isVisitorOwner = true;
				}
				draft.isFetching = false;
				return;
			case 'titleChange':
				draft.title.value = action.value;
				draft.title.hasErrors = false;
				return;
			case 'bodyChange':
				draft.body.value = action.value;
				draft.body.hasErrors = false;
				return;
			case 'saveChanges':
				if (!draft.title.hasErrors && !draft.body.hasErrors)
					draft.sendCount++;
				return;
			case 'saveReqStarted':
				draft.isSaving = true;
				return;
			case 'saveReqFinished':
				draft.isSaving = false;
				return;
			case 'titleRules':
				if (!action.value.trim()) {
					draft.title.hasErrors = true;
					draft.title.message = 'You must have a title';
				}
				return;
			case 'bodyRules':
				if (!action.value.trim()) {
					draft.body.hasErrors = true;
					draft.body.message = 'You must have a body';
				}
				return;
			case 'notFound':
				draft.notFound = true;
				draft.isFetching = false;
				return;
		}
	}

	// initial fetch of values for the post
	useEffect(() => {
		const ourReq = Axios.CancelToken.source();

		const fetchPost = async () => {
			try {
				const resp = await Axios.get(`/post/${state.id}`, {
					cancelToken: ourReq.token
				});
				if (resp.data) {
					dispatch({ type: 'fetchComplete', value: resp.data });
				} else {
					dispatch({ type: 'notFound' });
				}
			} catch (e) {
				console.log('there was a problem or the req was cancelled');
				console.log(e);
			}
		};
		fetchPost();
		return () => {
			ourReq.cancel();
		};
	}, []);

	// save values after editing form
	useEffect(
		() => {
			if (state.sendCount) {
				dispatch({ type: 'saveReqStarted' });
				const ourReq = Axios.CancelToken.source();
				const sendEditPost = async () => {
					try {
						const res = await Axios.post(
							`/post/${state.id}/edit`,
							{
								title: state.title.value,
								body: state.body.value,
								token: appState.user.token
							},
							{ cancelToken: ourReq.token }
						);
						dispatch({ type: 'saveReqFinished' });
						appDispatch({
							type: 'flashMessage',
							value: `Congratz your post ${state.title
								.value} has been saved`
						});
						props.history.push(`/post/${state.id}`);
					} catch (err) {
						console.log(err, state.sendCount);
						console.log('there was a problem');
					}
				};
				sendEditPost();
				return () => {
					ourReq.cancel();
				};
			}
		},
		[ state.sendCount ]
	);

	if (state.isFetching)
		return (
			<Page title="...">
				<LoadingDotsIcon />
			</Page>
		);

	if (!state.isVisitorOwner) {
		appDispatch({
			type: 'flashMessage',
			value: 'You do not have permission to edit this post.'
		});
		// redirect to home page
		props.history.push(`/`);
	}

	if (state.notFound) {
		return <PageNotFound />;
	}

	return (
		<Page title="Edit Post">
			<div>
				<Link className="small font-weight-bold" to={`/post/${state.id}`}>
					&laquo; Go Back
				</Link>
			</div>
			<form className="mt-3" onSubmit={submitHandler}>
				<div className="form-group">
					<label htmlFor="post-title" className="text-muted mb-1">
						<small>Title</small>
					</label>
					<input
						autoFocus
						name="title"
						id="post-title"
						className={`form-control form-control-lg form-control-title ${state
							.title.hasErrors && 'border-error'}`}
						type="text"
						placeholder=""
						autoComplete="off"
						value={state.title.value}
						onChange={e =>
							dispatch({ type: 'titleChange', value: e.target.value })}
						onBlur={e =>
							dispatch({ type: 'titleRules', value: e.target.value })}
					/>
					{state.title.hasErrors && (
						<div className="alert alert-danger small liveValidateMessage">
							{state.title.message}
						</div>
					)}
				</div>

				<div className="form-group">
					<label htmlFor="post-body" className="text-muted mb-1 d-block">
						<small>Body Content</small>
					</label>
					<textarea
						name="body"
						id="post-body"
						className={`body-content tall-textarea form-control ${state
							.body.hasErrors && 'border-error'}`}
						type="text"
						value={state.body.value}
						onChange={e =>
							dispatch({ type: 'bodyChange', value: e.target.value })}
						onBlur={e =>
							dispatch({ type: 'bodyRules', value: e.target.value })}
					/>
					{state.body.hasErrors && (
						<div className="alert alert-danger small liveValidateMessage">
							{state.body.message}
						</div>
					)}
				</div>

				<button
					className="btn btn-primary"
					disabled={
						state.body.hasErrors || state.title.hasErrors || state.isSaving
					}
				>
					{state.isSaving ? 'Saving...' : 'Save Update'}
				</button>
			</form>
		</Page>
	);
}

export default withRouter(EditPost);
