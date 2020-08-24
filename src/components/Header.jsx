import React, { useContext } from 'react';
import { Link } from 'react-router-dom';

import HeaderLoggedOut from './headerComponents/HeaderLoggedOut';
import HeaderLoggedIn from './headerComponents/HeaderLoggedIn';
import StateContext from './context/StateContext';

function Header(props) {
	const appState = useContext(StateContext);

	return (
		<header className="header-bar bg-primary mb-3">
			<div className="container d-flex flex-column flex-md-row align-items-center p-3">
				<h4 className="my-0 mr-md-auto font-weight-normal">
					<Link to="/" className="text-white">
						ComplexApp!
					</Link>
				</h4>
				{props.staticEmpty ? (
					''
				) : appState.isLoggedIn ? (
					<HeaderLoggedIn />
				) : (
					<HeaderLoggedOut />
				)}
			</div>
		</header>
	);
}
export default Header;
