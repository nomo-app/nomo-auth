import type { Request, Response } from 'express-serve-static-core';
import { NextFunction } from 'express';
import { handleMiddlewareError } from './nomoApiError';
import { validateNomoHeaders } from './nomoHeaders';
import { createNomoToken, validateNomoToken } from './nomoToken';
import { getNomoConfig, NomoConfigInput } from './nomoConfig';

export function nomoMiddleware(nomo_config_input: NomoConfigInput) {
	const nomo_config = getNomoConfig(nomo_config_input);

	return async function (req: Request, res: Response, next: NextFunction) {
		try {
			if (!req.header('nomo-auth-addr')) {
				next();
				return;
			}

			validateNomoHeaders(req);
			validateNomoToken(req, nomo_config);
			next();
		} catch (error: unknown) {
			const nomo_error = handleMiddlewareError(req, nomo_config, error, createNomoToken);
			res.status(nomo_error.status).json(nomo_error.response);
			res.end();
		}
	};
}
