import React, { useEffect, useContext, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Axios from 'axios';
import LoadingDotsIcon from '../../LoadingDotsIcon';
import StateContext from '../../context/StateContext';
import PostListItem from '../../PostListItem';

function ProfilePosts(props) {
	const { username } = useParams();
	const [ posts, setPosts ] = useState([]);
	const [ isLoading, setIsLoading ] = useState(true);
	const appState = useContext(StateContext);

	useEffect(
		() => {
			const userPostsReqToken = Axios.CancelToken.source();

			const fetchPosts = async () => {
				try {
					const resp = await Axios.get(`/profile/${username}/posts`, {
						cancelToken: userPostsReqToken.token
					});
					setPosts(resp.data);
					setIsLoading(false);
				} catch (e) {
					console.log('there was a problem or req was cancelled');
					console.log(e);
				}
			};
			fetchPosts();
			return () => {
				userPostsReqToken.cancel();
			};
		},
		[ username ]
	);

	if (isLoading) return <LoadingDotsIcon />;

	if (!posts.length) {
		return (
			<div className="list-group">
				<div className="list-group-item list-group-item-action bg-danger">
					<strong>
						{username === appState.user.username ? 'You' : 'They'} have no
						posts
					</strong>
				</div>
			</div>
		);
	}

	return (
		<div className="list-group">
			{posts.map(post => {
				return (
					<PostListItem
						key={post._id}
						id={post._id}
						avatar={post.author.avatar}
						title={post.title}
						date={post.createdDate}
					/>
				);
			})}
		</div>
	);
}

export default ProfilePosts;
