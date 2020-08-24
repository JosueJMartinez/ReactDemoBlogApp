import React, { useEffect, useState, useContext } from 'react';
import Page from '../Page';
import Axios from 'axios';
import { withRouter } from 'react-router-dom';
import DispatchContext from '../context/DispatchContext';
import StateContext from '../context/StateContext';

// this still need to handle error when clickin another link while doing axios

function CreatePost(props) {
	const [ post, setPost ] = useState({ title: '', body: '' });
	const [ errors, setErrors ] = useState({ title: '', body: '' });
	const appDispatch = useContext(DispatchContext);
	const appState = useContext(StateContext);

	const handleChange = e => {
		const { name, value } = e.target;
		setErrors(prevErrors => {
			return { ...prevErrors, [name]: '' };
		});
		setPost(prevPost => {
			return { ...prevPost, [name]: value };
		});
	};

	const handleSubmit = async e => {
		e.preventDefault();
		try {
			const res = await Axios.post('/create-post', {
				...post,
				token: appState.user.token
			});
			if (res.data.length < 3) {
				for (let err of res.data) {
					if (/title/i.test(err)) {
						setErrors(prevErrors => {
							return { ...prevErrors, title: err };
						});
					} else {
						setErrors(prevErrors => {
							return { ...prevErrors, body: err };
						});
					}
				}
			} else {
				setPost({ title: '', body: '' });
				appDispatch({ type: 'flashMessage', value: 'Congratz on your new post' });
				props.history.push(`/post/${res.data}`);
			}
		} catch (e) {
			console.log(e);
		}
	};

	return (
		<Page title="Create Post">
			<form onSubmit={handleSubmit}>
				<div className="form-group">
					<label htmlFor="post-title" className="text-muted mb-1">
						<small>Title</small>
					</label>
					<input
						autoFocus
						name="title"
						id="post-title"
						className={`form-control form-control-lg form-control-title ${errors.title ? 'border-error' : ''}`}
						type="text"
						placeholder=""
						autoComplete="off"
						onChange={handleChange}
						value={post.title}
					/>
					{errors.title ? <small className="error">{errors.title}</small> : ''}
				</div>

				<div className="form-group">
					<label htmlFor="post-body" className="text-muted mb-1 d-block">
						<small>Body Content</small>
					</label>
					<textarea
						name="body"
						id="post-body"
						className={`body-content tall-textarea form-control ${errors.body ? 'border-error' : ''}`}
						type="text"
						onChange={handleChange}
						value={post.body}
					/>
					{errors.body ? <small className="error">{errors.body}</small> : ''}
				</div>

				<button className="btn btn-primary">Save New Post</button>
			</form>
		</Page>
	);
}

export default withRouter(CreatePost);
