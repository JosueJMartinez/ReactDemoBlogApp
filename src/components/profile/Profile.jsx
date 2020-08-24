import React, { useEffect, useContext } from 'react';
import Page from '../Page';
import StateContext from '../context/StateContext';
import { useParams, Switch, Route, NavLink } from 'react-router-dom';
import Axios from 'axios';
import ProfilePosts from './profileComponents/ProfilePosts';
import { useImmer } from 'use-immer';
import DispatchContext from '../context/DispatchContext';
import ProfileFollow from './profileComponents/ProfileFollow';

function UserProfile() {
	const appState = useContext(StateContext);
	const appDispatch = useContext(DispatchContext);
	const { username } = useParams();
	const [ profileState, setProfileState ] = useImmer({
		followActionLoading: false,
		startFollowingReqCount: 0,
		stopFollowingReqCount: 0,
		profileData: {
			profileAvatar: 'https://gravatar.com/avatar/placeholder?s=128',
			profileUsername: '...',
			isFollowing: false,
			counts: {
				postCount: 0,
				followerCount: 0,
				followingCount: 0
			}
		}
	});

	// used for retrieving user information
	useEffect(
		() => {
			const userProfileReq = Axios.CancelToken.source();

			const fetchData = async () => {
				try {
					const res = await Axios.post(
						`/profile/${username}`,
						{ token: appState.user.token },
						{ cancelToken: userProfileReq.token }
					);

					setProfileState(draft => {
						draft.profileData = res.data;
					});
				} catch (e) {
					console.log('problem gettign profile or req was cancelled');
				}
			};
			fetchData();
			return () => {
				userProfileReq.cancel();
			};
		},
		[ username ]
	);

	function startFollowingHandler() {
		setProfileState(draft => {
			draft.startFollowingReqCount++;
		});
	}
	//watching profile following req count and updates user following request
	useEffect(
		() => {
			if (profileState.startFollowingReqCount > 0) {
				setProfileState(draft => {
					draft.followActionLoading = true;
				});
				const userProfileReq = Axios.CancelToken.source();

				const fetchData = async () => {
					try {
						const res = await Axios.post(
							`/addFollow/${profileState.profileData.profileUsername}`,
							{ token: appState.user.token },
							{ cancelToken: userProfileReq.token }
						);
						setProfileState(draft => {
							draft.profileData.isFollowing = true;
							draft.profileData.counts.followerCount++;
							draft.followActionLoading = false;
						});

						appDispatch({
							type: 'flashMessage',
							value: `Your now following ${username}`
						});
					} catch (e) {
						console.log('problem gettign profile or req was cancelled');
					}
				};
				fetchData();
				return () => {
					userProfileReq.cancel();
				};
			}
		},
		[ profileState.startFollowingReqCount ]
	);

	function stopFollowingHandler() {
		setProfileState(draft => {
			draft.stopFollowingReqCount++;
		});
	}
	// use effect to stop following an account
	// watch the counter for stopFollowingReqCount
	useEffect(
		() => {
			if (profileState.stopFollowingReqCount > 0) {
				setProfileState(draft => {
					draft.followActionLoading = true;
				});
				const userProfileReq = Axios.CancelToken.source();

				const fetchData = async () => {
					try {
						const res = await Axios.post(
							`/removeFollow/${username}`,
							{ token: appState.user.token },
							{ cancelToken: userProfileReq.token }
						);
						setProfileState(draft => {
							draft.profileData.isFollowing = false;
							draft.profileData.counts.followerCount--;
							draft.followActionLoading = false;
						});

						appDispatch({
							type: 'flashMessage',
							value: `Your not following ${username} anymore.`
						});
					} catch (e) {
						console.log('problem gettign profile or req was cancelled');
					}
				};
				fetchData();
				return () => {
					userProfileReq.cancel();
				};
			}
		},
		[ profileState.stopFollowingReqCount ]
	);

	return (
		<Page title={`Profile of ${profileState.profileData.profileUsername}`}>
			<h2>
				<img
					className="avatar-small"
					src={`${profileState.profileData.profileAvatar}`}
				/>{' '}
				{profileState.profileData.profileUsername}
				{appState.isLoggedIn &&
				!profileState.profileData.isFollowing &&
				appState.user.username !=
					profileState.profileData.profileUsername &&
				profileState.profileData.profileUsername != '...' && (
					<button
						onClick={startFollowingHandler}
						disabled={profileState.followActionLoading}
						className="btn btn-primary btn-sm ml-2"
					>
						Follow <i className="fas fa-user-plus" />
					</button>
				)}
				{appState.isLoggedIn &&
				profileState.profileData.isFollowing &&
				appState.user.username !=
					profileState.profileData.profileUsername &&
				profileState.profileData.profileUsername != '...' && (
					<button
						onClick={stopFollowingHandler}
						disabled={profileState.followActionLoading}
						className="btn btn-danger btn-sm ml-2"
					>
						Unfollow <i className="fas fa-user-times" />
					</button>
				)}
			</h2>

			<div className="profile-nav nav nav-tabs pt-2 mb-4">
				<NavLink
					exact
					to={`/profile/${profileState.profileData.profileUsername}`}
					className="nav-item nav-link"
				>
					Posts: {profileState.profileData.counts.postCount}
				</NavLink>
				<NavLink
					to={`/profile/${profileState.profileData
						.profileUsername}/followers`}
					className="nav-item nav-link"
				>
					Followers: {profileState.profileData.counts.followerCount}
				</NavLink>
				<NavLink
					to={`/profile/${profileState.profileData
						.profileUsername}/following`}
					className="nav-item nav-link"
				>
					Following: {profileState.profileData.counts.followingCount}
				</NavLink>
			</div>
			<Switch>
				<Route
					exact
					path={`/profile/:username`}
					component={ProfilePosts}
				/>
				<Route
					path={`/profile/:username/followers`}
					render={() => <ProfileFollow action="followers" />}
				/>
				<Route
					path={`/profile/:username/following`}
					render={() => <ProfileFollow action="following" />}
				/>
			</Switch>
		</Page>
	);
}

export default UserProfile;
