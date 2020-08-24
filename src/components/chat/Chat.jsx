import React, { useEffect, useContext, useRef } from 'react';
import DispatchContext from '../context/DispatchContext';
import StateContext from '../context/StateContext';
import { useImmer } from 'use-immer';
import io from 'socket.io-client';
import { Link } from 'react-router-dom';

function Chat() {
	const socket = useRef(null);
	const chatField = useRef(null);
	const chatLog = useRef(null);
	const appDispatch = useContext(DispatchContext);
	const appState = useContext(StateContext);
	const [ state, setState ] = useImmer({
		chatInput: '',
		chatCtr: 0,
		chatHistory: []
	});
	//how to imperatively change state to make autofocus
	useEffect(
		() => {
			if (appState.isChatOpen) {
				chatField.current.focus();
				appDispatch({ type: 'resetChatQueue' });
			}
		},
		[ appState.isChatOpen ]
	);

	useEffect(
		() => {
			chatLog.current.scrollTop = chatLog.current.scrollHeight;
			if (state.chatHistory.length && !appState.isChatOpen) {
				appDispatch({ type: 'addToChatQueue' });
			}
		},
		[ state.chatHistory ]
	);

	//useEffect to setup chat from server when first renders
	useEffect(() => {
		socket.current = io(
			process.env.BACKENDURL ||
				'https://backendreactcomplexapp.herokuapp.com'
		);
		socket.current.on('chatFromServer', message => {
			console.log(message);
			setState(draft => {
				draft.chatHistory.push(message);
			});
		});
		return () => socket.current.disconnect();
	}, []);

	function chatHandler(e) {
		const input = e.target.value;

		setState(draft => {
			draft.chatInput = input;
		});
	}

	function submitChatHandler(e) {
		e.preventDefault();
		//send message to chat server
		if (!state.chatInput.trim().length) {
			return;
		}
		socket.current.emit('chatFromBrowser', {
			message: state.chatInput,
			token: appState.user.token
		});
		setState(draft => {
			// add message to state collection of messages
			draft.chatHistory.push({
				username: appState.user.username,
				avatar: appState.user.avatar,
				message: draft.chatInput
			});

			draft.chatInput = '';
		});
	}

	return (
		<div
			id="chat-wrapper"
			className={`chat-wrapper ${appState.isChatOpen
				? 'chat-wrapper--is-visible'
				: ''} shadow border-top border-left border-right`}
		>
			<div className="chat-title-bar bg-primary">
				Chat
				<span
					className="chat-title-bar-close"
					onClick={() => appDispatch({ type: 'closeChat' })}
				>
					<i className="fas fa-times-circle" />
				</span>
			</div>
			<div id="chat" className="chat-log" ref={chatLog}>
				{state.chatHistory.map((chat, idx) => {
					if (chat.username === appState.user.username) {
						return (
							<div className="chat-self" key={idx}>
								<div className="chat-message">
									<div className="chat-message-inner">{chat.message}</div>
								</div>
								<img
									className="chat-avatar avatar-tiny"
									src={chat.avatar}
								/>
							</div>
						);
					}
					return (
						<div className="chat-other" key={idx}>
							<Link to={`/profile/${chat.username}`}>
								<img className="avatar-tiny" src={chat.avatar} />
							</Link>
							<div className="chat-message">
								<div className="chat-message-inner">
									<Link to={`/profile/${chat.username}`}>
										<strong>{`${chat.username}: `}</strong>
									</Link>
									{chat.message}
								</div>
							</div>
						</div>
					);
				})}
			</div>
			<form
				id="chatForm"
				onSubmit={submitChatHandler}
				className="chat-form border-top"
			>
				<input
					onChange={chatHandler}
					type="text"
					className="chat-field"
					id="chatField"
					placeholder="Type a message…"
					autoComplete="off"
					ref={chatField}
					value={state.chatInput}
					name="chat"
				/>
			</form>
		</div>
	);
}

export default Chat;
