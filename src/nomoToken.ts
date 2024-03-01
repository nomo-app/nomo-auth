import { Request } from 'express-serve-static-core';
import { NomoApiError } from './nomoApiError';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import moment from 'moment';
import { ethers } from 'ethers';
import { getNomoHeaderData } from './nomoHeaders';
import message from 'bitcoinjs-message';
import { NomoConfig } from './nomoConfig';

type NomoToken = {
	nomo_auth_addr: string;
	nomo_eth_addr: string;
	nonce: string;
	timestamp: number;
};

export function createNomoToken(req: Request, nomo_config: NomoConfig): string {
	const { nomo_auth_addr, nomo_eth_addr } = getNomoHeaderData(req);

	const nonce = crypto.randomBytes(15).toString('hex');
	const timestamp = moment().utc().unix();

	const sign_data: NomoToken = { nomo_auth_addr, nomo_eth_addr, nonce, timestamp };
	return jwt.sign(sign_data, nomo_config.nomo_token_secret as jwt.Secret);
}

export function validateNomoToken(req: Request, nomo_config: NomoConfig): void {
	const { nomo_token, nomo_auth_addr, nomo_sig, nomo_eth_addr, nomo_eth_sig, nomo_webon_name, nomo_webon_version } = getNomoHeaderData(req);

	const { timestamp, nomo_auth_addr: nomo_token_auth_addr, nomo_eth_addr: nomo_token_eth_addr, nonce } = getNomoTokenData(nomo_token, nomo_config);

	if (!timestamp || !nomo_auth_addr || !nonce) throw new NomoApiError(403, 'NOMO_AUTH_TOKEN_INVALID');

	if (timestamp + nomo_config.nomo_token_validity < moment().utc().unix()) throw new NomoApiError(403, 'NOMO_AUTH_TOKEN_EXPIRED');

	// eth_addr signature validation
	if (nomo_eth_addr !== nomo_token_eth_addr) throw new NomoApiError(403, 'NOMO_INVALID_ETH_ADDR');

	const is_nomo_eth_sig_verified = verifyEthSignature(nomo_eth_addr, nomo_eth_sig, nomo_token);
	if (!is_nomo_eth_sig_verified) throw new NomoApiError(403, 'NOMO_INVALID_ETH_SIGNATURE');

	// Optional auth_addr signature validation, default enabled.
	if (!nomo_config.auth_addr_validation_disabled) {
		if (nomo_auth_addr !== nomo_token_auth_addr) throw new NomoApiError(403, 'NOMO_INVALID_AUTH_ADDR');

		const is_nomo_sig_verified = verifyNomoSignature(nomo_auth_addr, nomo_sig, nomo_token);
		if (!is_nomo_sig_verified) throw new NomoApiError(403, 'NOMO_INVALID_SIGNATURE');
	}

	// webon name check.
	if (!nomo_config.webon_name_list.find((x) => x.toLowerCase() === nomo_webon_name.toLowerCase()))
		throw new NomoApiError(406, 'NOMO_INVALID_WEBON_NAME');

	// webon version check
	if (nomo_config.min_webon_version && compareSemanticVersions(nomo_webon_version, nomo_config.min_webon_version) === -1)
		throw new NomoApiError(406, 'NOMO_OUTDATED_WEBON_VERSION');
}

function getNomoTokenData(nomo_token: string, nomo_config: NomoConfig): NomoToken {
	if (!nomo_token) throw new NomoApiError(403, 'NOMO_AUTH_TOKEN_INVALID');

	try {
		return jwt.verify(nomo_token, nomo_config.nomo_token_secret as jwt.Secret) as NomoToken;
	} catch (error) {
		throw new NomoApiError(403, 'NOMO_AUTH_TOKEN_INVALID');
	}
}

function verifyNomoSignature(nomo_auth_addr: string, nomo_sig: string, nomo_token: string): boolean {
	try {
		return message.verify(nomo_token, nomo_auth_addr, nomo_sig, '\x19Eurocoin Signed Message:\n');
	} catch (e) {
		return false;
	}
}

function verifyEthSignature(nomo_eth_addr: string, nomo_eth_sig: string, nomo_token: string): boolean {
	try {
		const used_eth_addr = ethers.verifyMessage(nomo_token, nomo_eth_sig);
		return used_eth_addr.toLowerCase() === nomo_eth_addr.toLowerCase();
	} catch (e) {
		return false;
	}
}

function isValidVersion(version: string) {
	// Regular expression to validate semantic versions
	const regex = /^(\d+)\.(\d+)\.(\d+)(-[0-9A-Za-z-]+(\.[0-9A-Za-z-]+)*)?(\+[0-9A-Za-z-]+)?$/;
	return regex.test(version);
}

function compareSemanticVersions(versionA: string, versionB: string) {
	if (!isValidVersion(versionA)) {
		throw new Error('Invalid semantic versionA: ' + versionA);
	}
	if (!isValidVersion(versionB)) {
		throw new Error('Invalid semantic versionB: ' + versionB);
	}

	// Split the versions and remove any build metadata
	const cleanVersionA = versionA.split('+')[0].split('-')[0];
	const cleanVersionB = versionB.split('+')[0].split('-')[0];

	const partsA = cleanVersionA.split('.').map(Number);
	const partsB = cleanVersionB.split('.').map(Number);

	for (let i = 0; i < 3; i++) {
		if (partsA[i] > partsB[i]) {
			return 1; // versionA is greater
		}
		if (partsA[i] < partsB[i]) {
			return -1; // versionB is greater
		}
	}

	return 0; // versions are equal
}
