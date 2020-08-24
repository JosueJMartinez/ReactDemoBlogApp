import React, { useEffect } from 'react';
import Page from '../Page';
import { Link } from 'react-router-dom';

function NotOwner() {
	return (
		<Page title="Not owner">
			<div className="text-center">
				<h2 className="text-center">Whoops not owner of post</h2>
				<p className="lead text-muted">
					Please visit <Link to="/">homepage</Link>
				</p>
			</div>
		</Page>
	);
}

export default NotOwner;
