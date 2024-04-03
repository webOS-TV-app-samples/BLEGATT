export const isBrowser = () => typeof window === 'object';

export const isTVBrowser = () =>
	isBrowser() && typeof window.webOSSystem === 'object';

export const isDevServe = () => !window.PalmServiceBridge;

export const closeApp = isPlatform => {
	if (!isTVBrowser()) {
		return;
	}

	if (isPlatform) {
		// https://webostv.developer.lge.com/develop/references/webostvjs-webos#platformback
		// https://webostv.developer.lge.com/develop/guides/back-button#implementing-the-back-button-function-to-exit-the-app
		window.webOSSystem.platformBack();
		return;
	}
	window.webOSSystem.close();
};

export const reload = () => {
	if (isTVBrowser()) {
		const {href} = window.location;
		const location = href.substring(0, href.lastIndexOf('/'));
		window.location.replace(`${location}/index.html`);
	}
};
