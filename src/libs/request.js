import LS2Request from '@enact/webos/LS2Request';

const send = (Request, service, params) => {
	if (params.parameters && params.parameters.subscribe) {
		return new Request().send({...params, service});
	}

	return new Promise((onSuccess, onFailure) =>
		new Request().send({
			...params,
			service,
			onSuccess,
			onFailure
		})
	);
};

const request = service => params => {
	return send(LS2Request, service, params);
};

export default request;
