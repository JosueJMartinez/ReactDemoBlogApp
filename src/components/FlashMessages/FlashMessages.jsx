import React, { useEffect, useContext } from 'react';
import StateContext from '../context/StateContext';

function FlashMessages() {
	const appState = useContext(StateContext);

	return (
		<div className="floating-alerts">
			{appState.flashMessages.map((msg, idx) => {
				return (
					<div
						key={idx}
						className={`alert ${appState.isFlashError
							? 'alert-warning'
							: 'alert-success'} text-center floating-alert shadow-sm`}
					>
						{msg}
					</div>
				);
			})}
		</div>
	);
}

export default FlashMessages;
