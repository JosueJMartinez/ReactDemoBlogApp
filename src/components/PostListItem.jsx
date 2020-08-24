import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import Moment from 'react-moment';
import DispatchContext from './context/DispatchContext';

function PostListItem(props) {
	const appDispatch = useContext(DispatchContext);
	return (
		<Link
			to={`/post/${props.id}`}
			className="list-group-item list-group-item-action"
			onClick={
				props.search ? () => appDispatch({ type: 'closeSearch' }) : null
			}
		>
			<img className="avatar-tiny" src={props.avatar} />{' '}
			<strong>{props.title}</strong>
			<span className="text-muted small">
				{' '}
				{props.username ? `by ${props.username} ` : ''}
				on <Moment format="MM/DD/YYYY">{props.createdDate}</Moment>
			</span>
		</Link>
	);
}

export default PostListItem;
