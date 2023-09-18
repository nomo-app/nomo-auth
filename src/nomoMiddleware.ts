import type { Request, Response } from 'express-serve-static-core';
import moment from 'moment';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import message from 'bitcoinjs-message';
import {NextFunction} from "express";

export type NomoHeaderData = {
	authorization: string | undefined;
	nomo_sig: string | undefined;
	nomo_auth_addr: string | undefined;
	nomo_auth_version: string | undefined;
};

class ApiError extends Error {
	public status_code: number;

	constructor(status_code: number, public message: string) {
		super(message);
		this.status_code = status_code;
	}
}

export function getNomoToken(req: Request) {
	const nomo_header_data = getNomoHeaderData(req);

	const token = nomo_header_data.authorization?.slice(7);
	if (!token)
		throw new ApiError(403, 'AUTH_TOKEN_INVALID');

	const nomo_token = getNomoTokenData(token);
	if (!nomo_token)
		throw new ApiError(403, 'AUTH_TOKEN_INVALID');

	return nomo_token;
}

export function getNomoHeaderData(req: Request) {
	return {
		authorization: req.header('authorization') ?? req.header('Authorization'),
		nomo_auth_addr: req.header('nomo-auth-addr'),
		nomo_auth_version: req.header('nomo-auth-version'),
		nomo_sig: req.header('nomo-sig')
	} as NomoHeaderData;
}

let nomo_config: NomoConfig | null = null;
export function nomoMiddleware(custom_nomo_config: NomoConfig) {
	nomo_config = {...nomo_default_config, ...custom_nomo_config};
	if (!nomo_config.nomo_jwt_secret_key)
		new Error('MISSING_NOMO_JWT_SECRET');

	return async function(req: Request, res: Response, next: NextFunction) {
		try {
			if (!req.header('nomo-auth-addr'))
				next();

			validateNomoRequest(req, nomo_config);
			next();
		} catch (error: unknown) {

			if (error instanceof ApiError) {
				const response_body = {
					error_message: error.message,
					error_type: 'API_ERROR'
				} as NomoResponse;

				const nomo_header_data = getNomoHeaderData(req);
				if (error.status_code === 403 && nomo_header_data.nomo_auth_addr) {
					const nonce = crypto.randomBytes(15).toString('hex');
					const timestamp = moment().utc().unix();

					const sign_data = {nomo_auth_addr: nomo_header_data.nomo_auth_addr, nonce, timestamp} as NomoToken;
					response_body.jwt = jwt.sign(sign_data, nomo_config?.nomo_jwt_secret_key as jwt.Secret);
				}

				res.status(error.status_code).json(response_body);

			} else {
				console.log(error);
				res.status(500).json({
					error_message: error,
					error_type: 'INTERNAL_ERROR'
				} as NomoResponse);
			}
			res.end();
		}
	}
}

const nomo_default_config: NomoConfig = {
	nomo_jwt_secret_key: '',
	nomo_jwt_validity_in_sec: 10800,
	nomo_ignore_signature: false // Enable this for local web development
}

export type NomoConfig = {
	nomo_jwt_secret_key?: string,
	nomo_jwt_validity_in_sec?: number,
	nomo_ignore_signature?: boolean
}

export type NomoToken = {
	nomo_auth_addr: string;
	nonce: string;
	timestamp: number;
}

export type NomoResponse = {
	error_message: string | null,
	error_type: string,
	jwt: string | null,
	data: any | null
}

const ZeniqCoin = {
	messagePrefix: '\x19Eurocoin Signed Message:\n',
	bip32: {
		public: 0x0488b21e,
		private: 0x0488ade4
	},
	pubKeyHash: 87,
	scriptHash: 88,
	wif: 0x80,
	dustThreshold: 1
};

function VerifyMsg(auth_addr: string, nomo_sig: string, token: string) {
	try {
		return message.verify(token, auth_addr, nomo_sig, ZeniqCoin.messagePrefix);
	} catch (e) {
		return false;
	}
}

function getNomoTokenData(token: string): NomoToken | null {
	try {
		if (!token)
			return null;
		return jwt.verify(token, nomo_config?.nomo_jwt_secret_key as jwt.Secret) as NomoToken;

	} catch (error) {
		return null;
	}
}

function validateNomoRequest(req: Request, nomo_config: NomoConfig | null) : void {
	const nomo_header_data = getNomoHeaderData(req);

	if (!nomo_header_data.nomo_auth_version)
		throw new ApiError(403, 'NOMO_MISSING_AUTH_VERSION');

	if (!nomo_header_data.authorization)
		throw new ApiError(403, 'NOMO_MISSING_AUTHORIZATION_TOKEN');

	if (!nomo_header_data.nomo_sig)
		throw new ApiError(403, 'NOMO_MISSING_SIGNATURE');

	const token = nomo_header_data.authorization.slice(7);
	if (!token)
		throw new ApiError(403, 'AUTH_TOKEN_INVALID');

	const token_data = getNomoTokenData(token);
	if (!token_data)
		throw new ApiError(403, 'AUTH_TOKEN_INVALID');

	if(!token_data.timestamp || !token_data.nomo_auth_addr || !token_data.nonce)
		throw new ApiError(403, 'AUTH_TOKEN_INVALID');

	if (!nomo_config?.nomo_jwt_validity_in_sec || token_data.timestamp + nomo_config.nomo_jwt_validity_in_sec < moment().utc().unix())
		throw new ApiError(403, 'AUTH_TOKEN_EXPIRED');

	if (nomo_header_data.nomo_auth_addr !== token_data.nomo_auth_addr)
		throw new ApiError(403, 'NOMO_INVALID_AUTH_ADDR');

	if (!nomo_config?.nomo_ignore_signature && !VerifyMsg(nomo_header_data.nomo_auth_addr, nomo_header_data.nomo_sig, token))
		throw new ApiError(403, 'NOMO_INVALID_SIGNATURE');
}