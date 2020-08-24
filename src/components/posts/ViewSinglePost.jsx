import React, { useEffect, useState, useContext } from 'react';
import { useParams, Link, withRouter } from 'react-router-dom';
import Page from '../Page';
import Axios from 'axios';
import Moment from 'react-moment';
import LoadingDotsIcon from '../LoadingDotsIcon';
import ReactMarkdown from 'react-markdown';
import ReactTooltip from 'react-tooltip';
import PageNotFound from '../errorPages/PageNotFound';
import StateContext from '../context/StateContext';
import DispatchContext from '../context/DispatchContext';

function ViewSinglePost(props) {
	const appState = useContext(StateContext);
	const appDispatch = useContext(DispatchContext);
	const { id } = useParams();
	const [ post, setPost ] = useState({
		title: '',
		body: '',
		createDate: '',
		isVisitorOwner: false,
		author: { avatar: '', username: '' },
		_id: ''
	});
	const [ isLoading, setIsLoading ] = useState(true);

	useEffect(
		() => {
			const ourReq = Axios.CancelToken.source();

			const fetchPost = async () => {
				try {
					const resp = await Axios.get(`/post/${id}`, { cancelToken: ourReq.token });
					setPost(resp.data);
					setIsLoading(false);
				} catch (e) {
					console.log('there was a problem or the req was cancelled');
					console.log(e);
				}
			};
			fetchPost();
			return () => {
				ourReq.cancel();
			};
		},
		[ id ]
	);

	function isOwner() {
		if (appState.isLoggedIn) {
			return appState.user.username === post.author.username;
		}
		return false;
	}

	async function deleteHandler() {
		const ourReq = Axios.CancelToken.source();
		const areYouSure = window.confirm('do you really want to delete this post');
		if (areYouSure) {
			try {
				const res = await Axios.delete(
					`/post/${id}`,
					{ data: { token: appState.user.token } },
					{ cancelToken: ourReq.token }
				);

				if (res.data === 'Success') {
					appDispatch({ type: 'flashMessage', value: 'Post was successfully deleted' });
					props.history.push(`/profile/${appState.user.username}`);
				}
			} catch (e) {
				console.log('there was a problem deleting');
			}
		}
		return () => {
			ourReq.cancel();
		};
	}

	if (isLoading)
		return (
			<Page title="...">
				<LoadingDotsIcon />
			</Page>
		);

	if (!isLoading && !post) {
		return <PageNotFound />;
	}

	return (
		<Page title={`${post.title}`}>
			<div className="d-flex justify-content-between">
				<h2>{post.title}</h2>
				{isOwner() && (
					<span className="pt-2">
						<Link to={`/post/${post._id}/edit`} data-tip="Edit" data-for="edit" className="text-primary mr-2">
							<i className="fas fa-edit" />
						</Link>
						<ReactTooltip id="edit" className="custom-tooltip" />{' '}
						<a onClick={deleteHandler} className="delete-post-button text-danger" data-tip="Delete" data-for="delete">
							<i className="fas fa-trash" />
						</a>
						<ReactTooltip id="delete" className="custom-tooltip" />
					</span>
				)}
			</div>

			<p className="text-muted small mb-4">
				<Link to={`/profile/${post.author.username}`}>
					<img className="avatar-tiny" src={post.author.avatar} />
				</Link>
				Posted by <Link to={`/profile/${post.author.username}`}>{post.author.username}</Link> on{' '}
				<Moment format="MM/DD/YYYY">{post.createdDate}</Moment>
			</p>

			<div className="body-content">
				<ReactMarkdown
					source={post.body}
					allowedTypes={[ 'paragraph', 'strong', 'emphasis', 'text', 'heading', 'list', 'listItem' ]}
				/>
			</div>
		</Page>
	);
}

export default withRouter(ViewSinglePost);
