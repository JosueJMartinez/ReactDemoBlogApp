import React, { useEffect, useContext } from 'react';
import DispatchContext from '../context/DispatchContext';
import { useImmer } from 'use-immer';
import Axios from 'axios';
import StateContext from '../context/StateContext';
import PostListItem from '../PostListItem';

function SearchOverLay() {
	const appDispatch = useContext(DispatchContext);
	const [ searchState, setSearchState ] = useImmer({
		searchField: '',
		results: [],
		show: 'neither',
		reqCount: 0
	});

	useEffect(() => {
		document.addEventListener('keyup', searchKeyPressHandler);
		return () =>
			document.removeEventListener('keyup', searchKeyPressHandler);
	}, []);

	useEffect(
		() => {
			if (searchState.searchField.trim()) {
				setSearchState(draft => {
					draft.show = 'loading';
				});
				const delay = setTimeout(() => {
					setSearchState(draft => {
						draft.reqCount++;
					});
				}, 750);
				return () => clearTimeout(delay);
			} else {
				setSearchState(draft => {
					draft.show = 'neither';
				});
			}
		},
		[ searchState.searchField ]
	);

	useEffect(
		() => {
			if (searchState.reqCount) {
				const cancelReq = Axios.CancelToken.source();

				const fetchSearch = async () => {
					try {
						const req = await Axios.post(
							'/search',
							{ searchTerm: searchState.searchField },
							{ cancelToken: cancelReq.token }
						);
						setSearchState(draft => {
							draft.results = req.data;
							draft.show = 'results';
						});
					} catch (e) {
						console.log(e);
						console.log(
							'there was a problem with search or req was cancelled'
						);
					}
				};
				fetchSearch();

				return () => cancelReq.cancel();
			}
		},
		[ searchState.reqCount ]
	);

	function searchKeyPressHandler(e) {
		if (e.keyCode === 27) {
			appDispatch({ type: 'closeSearch' });
		}
	}

	function handleSearchChange(e) {
		const value = e.target.value;
		setSearchState(draft => {
			draft.searchField = value;
		});
	}

	function displayResults() {
		if (searchState.results.length) {
			return searchState.results.map(post => {
				return (
					<PostListItem
						key={post._id}
						id={post._id}
						avatar={post.author.avatar}
						title={post.title}
						date={post.createdDate}
						username={post.author.username}
						search={true}
					/>
				);
			});
		}
		return (
			<div className="list-group-item list-group-item-action">
				Results will be displayed here
			</div>
		);
	}

	function displayErrorOrResults() {
		if (searchState.results.length) {
			return (
				<div className="list-group shadow-sm">
					<div className="list-group-item active">
						<strong>Search Results</strong> ({searchState.results.length}{' '}
						item{searchState.results.length != 1 && 's'} found)
					</div>
					{displayResults()}
				</div>
			);
		}
		return (
			<div className="list-group shadow-sm">
				<div className="list-group-item active bg-danger">
					<strong>No items found</strong>
				</div>
			</div>
		);
	}

	return (
		<React.Fragment>
			<div className="search-overlay-top shadow-sm">
				<div className="container container--narrow">
					<label
						htmlFor="live-search-field"
						className="search-overlay-icon"
					>
						<i className="fas fa-search" />
					</label>
					<input
						autoFocus
						type="text"
						autoComplete="off"
						id="live-search-field"
						className="live-search-field"
						placeholder="What are you interested in?"
						name="search"
						onChange={handleSearchChange}
						value={searchState.searchField}
					/>
					<span
						onClick={() => appDispatch({ type: 'closeSearch' })}
						className="close-live-search"
					>
						<i className="fas fa-times-circle" />
					</span>
				</div>
			</div>

			<div className="search-overlay-bottom">
				<div className="container container--narrow py-3">
					<div
						className={`circle-loader ${searchState.show === 'loading' &&
							'circle-loader--visible'}`}
					/>
					<div
						className={`live-search-results ${searchState.show ===
							'results' && 'live-search-results--visible'}`}
					>
						{displayErrorOrResults()}
					</div>
				</div>
			</div>
		</React.Fragment>
	);
}

export default SearchOverLay;
