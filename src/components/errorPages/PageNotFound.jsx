import React from 'react';
import { Link } from 'react-router-dom';
import Page from '../Page';

function PageNotFound() {
	return (
		<Page title="Post not found">
			<div className="text-center">
				<h2 className="text-center">Whoops not Found</h2>
				<p className="lead text-muted">
					Please visit <Link to="/">homepage</Link>
				</p>
			</div>
		</Page>
	);
}

export default PageNotFound;
