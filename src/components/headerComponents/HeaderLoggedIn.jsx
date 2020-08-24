import React, { useEffect, useContext } from 'react';
import { Link, withRouter } from 'react-router-dom';
import DispatchContext from '../context/DispatchContext';
import StateContext from '../context/StateContext';
import ReactTooltip from 'react-tooltip';

function HeaderLoggedIn(props) {
	const appDispatch = useContext(DispatchContext);
	const appState = useContext(StateContext);
	const handleLogout = () => {
		appDispatch({ type: 'closeChat' });
		appDispatch({ type: 'logout' });
		appDispatch({ type: 'flashMessage', value: 'You are now logged out' });
		props.history.push('/');
	};

	function handleSearchIcon(e) {
		e.preventDefault();
		appDispatch({ type: 'openSearch' });
	}

	return (
		<div className="flex-row my-3 my-md-0">
			<a
				onClick={handleSearchIcon}
				href="#"
				data-tip="Search"
				data-for="search"
				className="text-white mr-2 header-search-icon"
			>
				<i className="fas fa-search" />
			</a>
			<ReactTooltip
				id="search"
				place="bottom"
				className="custom-tooltip"
			/>{' '}
			<span
				data-tip="Chat"
				onClick={() => appDispatch({ type: 'toggleChat' })}
				data-for="chat"
				className={`mr-2 header-chat-icon ${appState.unreadChatQueue
					? 'text-danger'
					: 'text-white'}`}
			>
				<i className="fas fa-comment" />
				<span className={`chat-count-badge text-white`}>
					{appState.unreadChatQueue ? appState.unreadChatQueue > 9 ? (
						'9+'
					) : (
						appState.unreadChatQueue
					) : (
						''
					)}
				</span>
			</span>
			<ReactTooltip
				id="chat"
				place="bottom"
				className="custom-tooltip"
			/>{' '}
			<Link
				data-tip="My Profile"
				data-for="profile"
				to={`/profile/${appState.user.username}`}
				className="mr-2"
			>
				<img className="small-header-avatar" src={appState.user.avatar} />
			</Link>
			<ReactTooltip
				id="profile"
				place="bottom"
				className="custom-tooltip"
			/>{' '}
			<Link className="btn btn-sm btn-success mr-2" to="/create-post">
				Create Post
			</Link>{' '}
			<button className="btn btn-sm btn-secondary" onClick={handleLogout}>
				Sign Out
			</button>
		</div>
	);
}

export default withRouter(HeaderLoggedIn);
