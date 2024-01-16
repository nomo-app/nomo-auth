import { Request } from 'express-serve-static-core';
import { NomoApiError } from './nomoApiError';

export type NomoHeaderData = {
	nomo_token: string;
	nomo_auth_addr: string;
	nomo_sig: string;
	nomo_eth_addr: string;
	nomo_eth_sig: string;
	nomo_auth_version: string;
	nomo_version: string;
	nomo_language: string;
	nomo_webon_name: string;
	nomo_webon_version: string;
};

export function getNomoHeaderData(req: Request): NomoHeaderData {
	const nomo_bearer_token: string | undefined = req.header('authorization') ?? req.header('Authorization');
	const nomo_token: string | undefined = nomo_bearer_token?.slice(7);

	const nomo_header_data: NomoHeaderData = {
		nomo_token: nomo_token,
		nomo_auth_addr: req.header('nomo-auth-addr'),
		nomo_sig: req.header('nomo-sig'),
		nomo_eth_addr: req.header('nomo-eth-addr'),
		nomo_eth_sig: req.header('nomo-eth-sig'),
		nomo_auth_version: req.header('nomo-auth-version'),
		nomo_version: req.header('User-Agent')?.slice(5),
		nomo_language: req.header('Accept-Language')
	} as NomoHeaderData;

	const nomo_webon_headers: string[] | undefined = req.header('nomo-webon')?.split('/');
	if (nomo_webon_headers?.length === 2) {
		nomo_header_data.nomo_webon_name = nomo_webon_headers[0];
		nomo_header_data.nomo_webon_version = nomo_webon_headers[1];
	}

	return nomo_header_data;
}

export function validateNomoHeaders(req: Request): void {
	const nomo_header_data: NomoHeaderData = getNomoHeaderData(req);
	if (!nomo_header_data.nomo_token) new NomoApiError(403, 'NOMO_MISSING_AUTHORIZATION_TOKEN');
	if (!nomo_header_data.nomo_eth_addr) new NomoApiError(403, 'NOMO_MISSING_ETH_ADDR');
	if (!nomo_header_data.nomo_eth_sig) new NomoApiError(403, 'NOMO_MISSING_ETH_SIGNATURE');
	if (!nomo_header_data.nomo_auth_version) new NomoApiError(403, 'NOMO_MISSING_AUTH_VERSION');
	if (!nomo_header_data.nomo_version) new NomoApiError(403, 'NOMO_MISSING_VERSION');
	if (!nomo_header_data.nomo_sig) new NomoApiError(403, 'NOMO_MISSING_SIGNATURE');
	if (!nomo_header_data.nomo_language) new NomoApiError(403, 'NOMO_MISSING_LANGUAGE');
	if (!nomo_header_data.nomo_webon_name) new NomoApiError(403, 'NOMO_MISSING_WEBON_NAME');
	if (!nomo_header_data.nomo_webon_version) new NomoApiError(403, 'NOMO_MISSING_WEBON_VERSION');
}
