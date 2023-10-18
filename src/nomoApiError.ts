import { Request } from 'express-serve-static-core';
import { NomoConfig } from './nomoConfig';

export type NomoErrorResponse = {
	error_type: string;
	error_message: string | undefined;
	jwt?: string | undefined;
};

export type NomoError = {
	status: number;
	response: NomoErrorResponse;
};

export class NomoApiError extends Error {
	public status_code: number;

	constructor(
		status_code: number,
		public message: string
	) {
		super(message);
		this.status_code = status_code;
	}
}

export function handleMiddlewareError(
	req: Request,
	nomo_config: NomoConfig,
	error: unknown,
	create_nomo_token_fct: (req: Request, nomo_config: NomoConfig) => string
): NomoError {
	if (error instanceof NomoApiError) {
		const error_response: NomoErrorResponse = {
			error_message: error.message,
			error_type: 'API_ERROR'
		};

		if (error.status_code === 403) error_response.jwt = create_nomo_token_fct(req, nomo_config);

		return {
			status: error.status_code,
			response: error_response
		} as NomoError;
	}

	return {
		status: 500,
		response: {
			error_message: error,
			error_type: 'INTERNAL_ERROR'
		} as NomoErrorResponse
	} as NomoError;
}
