import React, { useEffect, useContext, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Axios from 'axios';
import LoadingDotsIcon from '../../LoadingDotsIcon';
import StateContext from '../../context/StateContext';

function ProfileFollow(props) {
	const { username } = useParams();
	const [ follows, setFollows ] = useState([]);
	const [ isLoading, setIsLoading ] = useState(true);
	const appState = useContext(StateContext);

	useEffect(
		() => {
			setIsLoading(true);
			const userFollowsReqToken = Axios.CancelToken.source();

			const fetchFollows = async () => {
				try {
					const resp = await Axios.get(`/profile/${username}/${props.action}`, {
						cancelToken: userFollowsReqToken.token
					});

					setFollows(resp.data);
					setIsLoading(false);
				} catch (e) {
					console.log('there was a problem or req was cancelled');
					console.log(e);
				}
			};
			fetchFollows();
			return () => {
				userFollowsReqToken.cancel();
			};
		},
		[ username, props.action ]
	);

	if (isLoading) return <LoadingDotsIcon />;
	if (!follows.length && username === appState.user.username) {
		return (
			<div className="list-group">
				<div className="list-group-item list-group-item-action bg-danger">
					{props.action === 'followers' ? (
						<strong>You have no current {props.action}</strong>
					) : (
						<strong>Currently you are {props.action} no one</strong>
					)}
				</div>
			</div>
		);
	} else if (!follows.length) {
		return (
			<div className="list-group">
				<div className="list-group-item list-group-item-action bg-danger">
					{props.action === 'followers' ? (
						<strong>They have no current {props.action}</strong>
					) : (
						<strong>Currently they are {props.action} no one</strong>
					)}
				</div>
			</div>
		);
	}

	return (
		<div className="list-group">
			{follows.map((follow, idx) => {
				return (
					<Link key={idx} to={`/profile/${follow.username}`} className="list-group-item list-group-item-action">
						<img className="avatar-tiny" src={follow.avatar} /> <strong>{follow.username}</strong>
					</Link>
				);
			})}
		</div>
	);
}

export default ProfileFollow;
