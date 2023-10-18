import { Request } from 'express-serve-static-core';
import { NomoApiError } from './nomoApiError';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import moment from 'moment';
import { getNomoHeaderData } from './nomoHeaders';
import message from 'bitcoinjs-message';
import { NomoConfig } from './nomoConfig';

type NomoToken = {
	nomo_auth_addr: string;
	nonce: string;
	timestamp: number;
};

export function createNomoToken(req: Request, nomo_config: NomoConfig): string {
	const nomo_header_data = getNomoHeaderData(req);

	const nonce = crypto.randomBytes(15).toString('hex');
	const timestamp = moment().utc().unix();

	const sign_data = { nomo_auth_addr: nomo_header_data.nomo_auth_addr, nonce, timestamp } as NomoToken;
	return jwt.sign(sign_data, nomo_config.nomo_token_secret as jwt.Secret);
}

export function validateNomoToken(req: Request, nomo_config: NomoConfig): void {
	const nomo_header_data = getNomoHeaderData(req);
	if (!nomo_header_data.nomo_token) throw new NomoApiError(403, 'NOMO_AUTH_TOKEN_INVALID');

	const nomo_token = getNomoTokenData(nomo_header_data.nomo_token, nomo_config);
	if (!nomo_token) throw new NomoApiError(403, 'NOMO_AUTH_TOKEN_INVALID');

	if (!nomo_token.timestamp || !nomo_token.nomo_auth_addr || !nomo_token.nonce) throw new NomoApiError(403, 'NOMO_AUTH_TOKEN_INVALID');

	if (nomo_token.timestamp + nomo_config.nomo_token_validity < moment().utc().unix()) throw new NomoApiError(403, 'NOMO_AUTH_TOKEN_EXPIRED');

	if (nomo_header_data.nomo_auth_addr !== nomo_token.nomo_auth_addr) throw new NomoApiError(403, 'NOMO_INVALID_AUTH_ADDR');

	const is_nomo_sig_verified = verifyNomoSignature(nomo_header_data.nomo_auth_addr, nomo_header_data.nomo_sig, nomo_header_data.nomo_token);
	if (!nomo_config.nomo_browser_dev_mode && !is_nomo_sig_verified) throw new NomoApiError(403, 'NOMO_INVALID_SIGNATURE');
}

function getNomoTokenData(nomo_token: string, nomo_config: NomoConfig): NomoToken | null {
	try {
		if (!nomo_token) return null;
		return jwt.verify(nomo_token, nomo_config.nomo_token_secret as jwt.Secret) as NomoToken;
	} catch (error) {
		return null;
	}
}

function verifyNomoSignature(nomo_auth_addr: string | undefined, nomo_sig: string | undefined, nomo_token: string | undefined): boolean {
	if (!nomo_auth_addr || !nomo_sig || !nomo_token) return false;

	try {
		return message.verify(nomo_token, nomo_auth_addr, nomo_sig, '\x19Eurocoin Signed Message:\n');
	} catch (e) {
		return false;
	}
}
