import {createRoot} from 'react-dom/client';
import {Provider} from 'react-redux';
import {configureStore} from '@reduxjs/toolkit';

import App from './App';
import reducer from './reducers';
import {isBrowser} from './libs/utils';

const store = configureStore({
	reducer,
	middleware: getMiddleware => {
		const middleware = getMiddleware();
		if (process.env.NODE_ENV === 'development') {
			middleware.push(require('redux-logger').logger);
		}
		return middleware;
	}
});

let appElement = (
	<Provider store={store}>
		<App highContrast />
	</Provider>
);

/* for webOS6.0(=React 16.x), webOS22(=React 17.x),
 *   import {render} from 'react-dom';
 */
// if (isBrowser()) {
// 	render(appElement, document.getElementById('root'));
// 	appElement = null;
// }

/* more equal than webOS23(=React 18)
 *   import {createRoot} from 'react-dom/client';
 */
if (isBrowser()) {
	const root = createRoot(document.getElementById('root'));
	root.render(appElement);
	appElement = null;
}

export default appElement;
