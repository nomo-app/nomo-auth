import { Request } from 'express-serve-static-core';
import { NomoApiError } from './nomoApiError';

export type NomoHeaderData = {
	nomo_token: string | undefined;
	nomo_sig: string | undefined;
	nomo_auth_addr: string | undefined;
	nomo_auth_version: string | undefined;
	nomo_version: string | undefined;
	nomo_language: string | undefined;
	nomo_plugin_name: string | undefined;
	nomo_plugin_version: string | undefined;
};

export function getNomoHeaderData(req: Request): NomoHeaderData {
	const nomo_bearer_token: string | undefined = req.header('authorization') ?? req.header('Authorization');
	const nomo_token: string | undefined = nomo_bearer_token?.slice(7);

	const nomo_header_data: NomoHeaderData = {
		nomo_token: nomo_token,
		nomo_auth_addr: req.header('nomo-auth-addr'),
		nomo_auth_version: req.header('nomo-auth-version'),
		nomo_sig: req.header('nomo-sig'),
		nomo_version: req.header('User-Agent')?.slice(5),
		nomo_language: req.header('Accept-Language')
	} as NomoHeaderData;

	const nomo_plugin_headers: string[] | undefined = req.header('nomo-plugin')?.split('/');
	if (nomo_plugin_headers?.length === 2) {
		nomo_header_data.nomo_plugin_name = nomo_plugin_headers[0];
		nomo_header_data.nomo_plugin_version = nomo_plugin_headers[1];
	}

	return nomo_header_data;
}

export function validateNomoHeaders(req: Request): void {
	const nomo_header_data: NomoHeaderData = getNomoHeaderData(req);
	if (!nomo_header_data.nomo_token) throw new NomoApiError(403, 'NOMO_AUTH_TOKEN_INVALID');
	if (!nomo_header_data.nomo_auth_version) new NomoApiError(403, 'NOMO_MISSING_AUTH_VERSION');
	if (!nomo_header_data.nomo_token) new NomoApiError(403, 'NOMO_MISSING_AUTHORIZATION_TOKEN');
	if (!nomo_header_data.nomo_sig) new NomoApiError(403, 'NOMO_MISSING_SIGNATURE');
}
