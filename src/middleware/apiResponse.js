module.exports.successResponseWithData = (res,msg,data) => {
    const response = {
		status: true,
		message: msg,
        data:data
	};
	return res.status(200).json(response);
};

module.exports.successCompleteRes = (res,msg,data,result) => {
    const response = {
		status: true,
		message: msg,
		isexist:result,
        data:data
	};
	return res.status(200).json(response);
};

module.exports.loggingRespons = (res,msg,result,token,data) => {
    const response = {
		status: true,
		message: msg,
		isexist:result,
		token:token,
        data:data
	};
	return res.status(200).json(response);
}

module.exports.successResponse = (res,msg) => {
    const response = {
		status: true,
		message: msg,
	};
	return res.status(200).json(response);
};

module.exports.errorResponse = (res,msg) => {
    const response = {
		status: false,
		message: msg
	};
	return res.status(400).json(response);
};

module.exports.notFoundResponse = (res,msg) => {
    const response = {
		status: false,
		message: msg,
	};
	return res.status(404).json(response);
};

module.exports.badRequest = (res,error) => {
    const response = {
		status: false,
		error: error,
	};
    return res.status(404).json(response);
}