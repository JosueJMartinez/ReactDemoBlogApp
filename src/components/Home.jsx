import React, { useEffect, useContext } from 'react';
import Page from './Page';
import StateContext from './context/StateContext';
import { useImmer } from 'use-immer';
import Axios from 'axios';
import PostListItem from './PostListItem';
import LoadingDotsIcon from './LoadingDotsIcon';

function Home() {
	const appState = useContext(StateContext);
	const [ feedState, setFeedState ] = useImmer({
		isLoading: true,
		feed: []
	});

	useEffect(() => {
		const userProfileReq = Axios.CancelToken.source();

		const fetchData = async () => {
			try {
				const res = await Axios.post(
					`/getHomeFeed`,
					{ token: appState.user.token },
					{ cancelToken: userProfileReq.token }
				);

				setFeedState(draft => {
					draft.isLoading = false;
					draft.feed = res.data;
				});
			} catch (e) {
				console.log('problem gettign profile or req was cancelled');
			}
		};
		fetchData();
		return () => {
			userProfileReq.cancel();
		};
	}, []);

	if (feedState.isLoading)
		return (
			<Page title={`Welcome back ${appState.user.username}`}>
				<LoadingDotsIcon />
			</Page>
		);

	function fillOutFeed() {
		if (feedState.feed.length) {
			return (
				<React.Fragment>
					<h2 className="text-center mb-4">
						The Latest From Those You Follow
					</h2>
					<div className="list-group">
						{feedState.feed.map(post => {
							return (
								<PostListItem
									key={post._id}
									id={post._id}
									avatar={post.author.avatar}
									title={post.title}
									date={post.createdDate}
									username={post.author.username}
								/>
							);
						})}
					</div>
				</React.Fragment>
			);
		}
		return (
			<React.Fragment>
				{' '}
				<h2 className="text-center">
					Hello <strong>{appState.user.username}</strong>, your feed is
					empty.
				</h2>
				<p className="lead text-muted text-center">
					Your feed displays the latest posts from the people you follow.
					If you don&rsquo;t have any friends to follow that&rsquo;s okay;
					you can use the &ldquo;Search&rdquo; feature in the top menu bar
					to find content written by people with similar interests and then
					follow them.
				</p>
			</React.Fragment>
		);
	}
	return (
		<Page title={`Welcome back ${appState.user.username}`}>
			{fillOutFeed()}
		</Page>
	);
}

export default Home;
