import React, { useEffect, Suspense } from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter, Switch, Route } from 'react-router-dom';
import { CSSTransition } from 'react-transition-group';
import { useImmerReducer } from 'use-immer';

import Axios from 'axios';
Axios.defaults.baseURL =
	process.env.BACKENDURL || 'https://backendreactcomplexapp.herokuapp.com';
// context components
import StateContext from './components/context/StateContext';
import DispatchContext from './components/context/DispatchContext';

//Custom components
import Header from './components/Header';
import Footer from './components/Footer';
import HomeGuest from './components/HomeGuest';
const About = React.lazy(() => import('./components/About'));
const Terms = React.lazy(() => import('./components/Terms'));
import Home from './components/Home';
const CreatePost = React.lazy(() =>
	import('./components/posts/CreatePost')
);
const ViewSinglePost = React.lazy(() =>
	import('./components/posts/ViewSinglePost')
);
import FlashMessages from './components/FlashMessages/FlashMessages';
const UserProfile = React.lazy(() =>
	import('./components/profile/Profile')
);
const EditPost = React.lazy(() => import('./components/posts/EditPost'));
const PageNotFound = React.lazy(() =>
	import('./components/errorPages/PageNotFound')
);
const SearchOverLay = React.lazy(() =>
	import('./components/searchOverLay/SeachOverlay')
);
const Chat = React.lazy(() => import('./components/chat/Chat'));
import LoadingDotsIcon from './components/LoadingDotsIcon';

function App(props) {
	const initState = {
		isLoggedIn: Boolean(localStorage.getItem('token')),
		flashMessages: [],
		isFlashError: false,
		user: {
			token: localStorage.getItem('token'),
			username: localStorage.getItem('username'),
			avatar: localStorage.getItem('avatar')
		},
		isSearchOpen: false,
		isChatOpen: false,
		unreadChatQueue: 0
	};

	const ourReducer = (draft, action) => {
		switch (action.type) {
			case 'login':
				draft.isLoggedIn = true;
				draft.user = action.userData;
				return;
			case 'logout':
				draft.isLoggedIn = false;
				return;
			case 'flashMessage':
				draft.isFlashError = false;
				draft.flashMessages.push(action.value);
				return;
			case 'flashMessageError':
				draft.isFlashError = true;
				draft.flashMessages.push(action.value);
				return;
			case 'openSearch':
				draft.isSearchOpen = true;
				return;
			case 'closeSearch':
				draft.isSearchOpen = false;
				return;
			case 'toggleChat':
				draft.isChatOpen = !draft.isChatOpen;
				return;
			case 'closeChat':
				draft.isChatOpen = false;
				return;
			case 'addToChatQueue':
				draft.unreadChatQueue++;
				return;
			case 'resetChatQueue':
				draft.unreadChatQueue = 0;
				return;
		}
	};

	const [ state, dispatch ] = useImmerReducer(ourReducer, initState);

	useEffect(
		() => {
			if (state.isLoggedIn) {
				localStorage.setItem('username', state.user.username);
				localStorage.setItem('avatar', state.user.avatar);
				localStorage.setItem('token', state.user.token);
			} else {
				localStorage.removeItem('avatar');
				localStorage.removeItem('username');
				localStorage.removeItem('token');
			}
		},
		[ state.isLoggedIn ]
	);

	// check if token has expired or not on first render
	useEffect(() => {
		if (state.isLoggedIn) {
			const cancelReq = Axios.CancelToken.source();

			const fetchSearch = async () => {
				try {
					const res = await Axios.post(
						'/checkToken',
						{ token: state.user.token },
						{ cancelToken: cancelReq.token }
					);
					if (!res.data) {
						dispatch({ type: 'logout' });
						dispatch({
							type: 'flashMessageError',
							value: 'Your session has expired please login again.'
						});
					}
				} catch (e) {
					console.log(e);
					console.log(
						'there was a problem with search or res was cancelled'
					);
				}
			};
			fetchSearch();

			return () => cancelReq.cancel();
		}
	}, []);

	return (
		<StateContext.Provider value={state}>
			<DispatchContext.Provider value={dispatch}>
				<BrowserRouter>
					<Header />
					<FlashMessages />
					<Suspense fallback={<LoadingDotsIcon />}>
						<Switch>
							<Route
								path="/"
								component={state.isLoggedIn ? Home : HomeGuest}
								exact
							/>
							<Route path="/about-us" component={About} />
							<Route path="/terms" component={Terms} />
							<Route path="/post/:id" component={ViewSinglePost} exact />
							<Route path="/post/:id/edit" component={EditPost} exact />
							<Route
								path="/create-post"
								component={state.isLoggedIn ? CreatePost : HomeGuest}
							/>
							<Route path="/profile/:username" component={UserProfile} />
							<Route component={PageNotFound} />
						</Switch>
					</Suspense>
					<CSSTransition
						timeout={330}
						in={state.isSearchOpen}
						classNames="search-overlay"
						unmountOnExit
					>
						<div className="search-overlay">
							<Suspense fallback="">
								<SearchOverLay />
							</Suspense>
						</div>
					</CSSTransition>

					<Suspense fallback="">{state.isLoggedIn && <Chat />}</Suspense>
					<Footer />
				</BrowserRouter>
			</DispatchContext.Provider>
		</StateContext.Provider>
	);
}

ReactDOM.render(<App />, document.querySelector('#app'));

if (module.hot) {
	module.hot.accept;
}
