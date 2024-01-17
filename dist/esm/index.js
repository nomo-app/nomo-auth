import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import moment from 'moment';
import { ethers } from 'ethers';
import message from 'bitcoinjs-message';

/******************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */

function __awaiter(thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

typeof SuppressedError === "function" ? SuppressedError : function (error, suppressed, message) {
    var e = new Error(message);
    return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
};

class NomoApiError extends Error {
    constructor(status_code, message) {
        super(message);
        this.message = message;
        this.status_code = status_code;
    }
}
function handleMiddlewareError(req, nomo_config, error, create_nomo_token_fct) {
    if (error instanceof NomoApiError) {
        const error_response = {
            error_message: error.message,
            error_type: 'API_ERROR'
        };
        if (error.status_code === 403)
            error_response.jwt = create_nomo_token_fct(req, nomo_config);
        return {
            status: error.status_code,
            response: error_response
        };
    }
    return {
        status: 500,
        response: {
            error_message: error,
            error_type: 'INTERNAL_ERROR'
        }
    };
}

function getNomoHeaderData(req) {
    var _a, _b, _c;
    const nomo_bearer_token = (_a = req.header('authorization')) !== null && _a !== void 0 ? _a : req.header('Authorization');
    const nomo_token = nomo_bearer_token === null || nomo_bearer_token === void 0 ? void 0 : nomo_bearer_token.slice(7);
    const nomo_header_data = {
        nomo_token: nomo_token,
        nomo_auth_addr: req.header('nomo-auth-addr'),
        nomo_sig: req.header('nomo-sig'),
        nomo_eth_addr: req.header('nomo-eth-addr'),
        nomo_eth_sig: req.header('nomo-eth-sig'),
        nomo_auth_version: req.header('nomo-auth-version'),
        nomo_version: (_b = req.header('User-Agent')) === null || _b === void 0 ? void 0 : _b.slice(5),
        nomo_language: req.header('Accept-Language')
    };
    const nomo_webon_headers = (_c = req.header('nomo-webon')) === null || _c === void 0 ? void 0 : _c.split('/');
    if ((nomo_webon_headers === null || nomo_webon_headers === void 0 ? void 0 : nomo_webon_headers.length) === 2) {
        nomo_header_data.nomo_webon_name = nomo_webon_headers[0];
        nomo_header_data.nomo_webon_version = nomo_webon_headers[1];
    }
    return nomo_header_data;
}
function validateNomoHeaders(req) {
    const nomo_header_data = getNomoHeaderData(req);
    if (!nomo_header_data.nomo_token)
        new NomoApiError(403, 'NOMO_MISSING_AUTHORIZATION_TOKEN');
    if (!nomo_header_data.nomo_eth_addr)
        new NomoApiError(403, 'NOMO_MISSING_ETH_ADDR');
    if (!nomo_header_data.nomo_eth_sig)
        new NomoApiError(403, 'NOMO_MISSING_ETH_SIGNATURE');
    if (!nomo_header_data.nomo_auth_version)
        new NomoApiError(403, 'NOMO_MISSING_AUTH_VERSION');
    if (!nomo_header_data.nomo_version)
        new NomoApiError(403, 'NOMO_MISSING_VERSION');
    if (!nomo_header_data.nomo_sig)
        new NomoApiError(403, 'NOMO_MISSING_SIGNATURE');
    if (!nomo_header_data.nomo_language)
        new NomoApiError(403, 'NOMO_MISSING_LANGUAGE');
    if (!nomo_header_data.nomo_webon_name)
        new NomoApiError(403, 'NOMO_MISSING_WEBON_NAME');
    if (!nomo_header_data.nomo_webon_version)
        new NomoApiError(403, 'NOMO_MISSING_WEBON_VERSION');
}

function createNomoToken(req, nomo_config) {
    const { nomo_auth_addr, nomo_eth_addr } = getNomoHeaderData(req);
    const nonce = crypto.randomBytes(15).toString('hex');
    const timestamp = moment().utc().unix();
    const sign_data = { nomo_auth_addr, nomo_eth_addr, nonce, timestamp };
    return jwt.sign(sign_data, nomo_config.nomo_token_secret);
}
function validateNomoToken(req, nomo_config) {
    const { nomo_token, nomo_auth_addr, nomo_sig, nomo_eth_addr, nomo_eth_sig, nomo_webon_name, nomo_webon_version } = getNomoHeaderData(req);
    const { timestamp, nomo_auth_addr: nomo_token_auth_addr, nomo_eth_addr: nomo_token_eth_addr, nonce } = getNomoTokenData(nomo_token, nomo_config);
    if (!timestamp || !nomo_auth_addr || !nonce)
        throw new NomoApiError(403, 'NOMO_AUTH_TOKEN_INVALID');
    if (timestamp + nomo_config.nomo_token_validity < moment().utc().unix())
        throw new NomoApiError(403, 'NOMO_AUTH_TOKEN_EXPIRED');
    // eth_addr signature validation
    if (nomo_eth_addr !== nomo_token_eth_addr)
        throw new NomoApiError(403, 'NOMO_INVALID_ETH_ADDR');
    const is_nomo_eth_sig_verified = verifyEthSignature(nomo_eth_addr, nomo_eth_sig, nomo_token);
    if (!is_nomo_eth_sig_verified)
        throw new NomoApiError(403, 'NOMO_INVALID_ETH_SIGNATURE');
    // Optional auth_addr signature validation, default enabled.
    if (!nomo_config.auth_addr_validation_disabled) {
        if (nomo_auth_addr !== nomo_token_auth_addr)
            throw new NomoApiError(403, 'NOMO_INVALID_AUTH_ADDR');
        const is_nomo_sig_verified = verifyNomoSignature(nomo_auth_addr, nomo_sig, nomo_token);
        if (!is_nomo_sig_verified)
            throw new NomoApiError(403, 'NOMO_INVALID_SIGNATURE');
    }
    // webon name check.
    if (!nomo_config.webon_name_list.find((x) => x.toLowerCase() === nomo_webon_name.toLowerCase()))
        throw new NomoApiError(406, 'NOMO_INVALID_WEBON_NAME');
    // webon version check
    if (nomo_config.min_webon_version && compareSemanticVersions(nomo_webon_version, nomo_config.min_webon_version) === -1)
        throw new NomoApiError(406, 'NOMO_OUTDATED_WEBON_VERSION');
}
function getNomoTokenData(nomo_token, nomo_config) {
    if (!nomo_token)
        throw new NomoApiError(403, 'NOMO_AUTH_TOKEN_INVALID');
    try {
        return jwt.verify(nomo_token, nomo_config.nomo_token_secret);
    }
    catch (error) {
        throw new NomoApiError(403, 'NOMO_AUTH_TOKEN_INVALID');
    }
}
function verifyNomoSignature(nomo_auth_addr, nomo_sig, nomo_token) {
    try {
        return message.verify(nomo_token, nomo_auth_addr, nomo_sig, '\x19Eurocoin Signed Message:\n');
    }
    catch (e) {
        return false;
    }
}
function verifyEthSignature(nomo_eth_addr, nomo_eth_sig, nomo_token) {
    try {
        const used_eth_addr = ethers.verifyMessage(nomo_token, nomo_eth_sig);
        return used_eth_addr.toLowerCase() !== nomo_eth_addr.toLowerCase();
    }
    catch (e) {
        return false;
    }
}
function isValidVersion(version) {
    // Regular expression to validate semantic versions
    const regex = /^(\d+)\.(\d+)\.(\d+)(-[0-9A-Za-z-]+(\.[0-9A-Za-z-]+)*)?(\+[0-9A-Za-z-]+)?$/;
    return regex.test(version);
}
function compareSemanticVersions(versionA, versionB) {
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

const nomo_default_config = {
    nomo_token_secret: '',
    nomo_token_validity: 10800,
    auth_addr_validation_disabled: false,
    webon_name_list: []
};
function getNomoConfig(nomo_input_config) {
    if (!nomo_input_config.nomo_token_secret)
        ;
    return Object.assign(Object.assign({}, nomo_default_config), nomo_input_config);
}

function nomoMiddleware(nomo_config_input) {
    const nomo_config = getNomoConfig(nomo_config_input);
    return function (req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!req.header('nomo-auth-addr')) {
                    next();
                    return;
                }
                validateNomoHeaders(req);
                validateNomoToken(req, nomo_config);
                next();
            }
            catch (error) {
                const nomo_error = handleMiddlewareError(req, nomo_config, error, createNomoToken);
                res.status(nomo_error.status).json(nomo_error.response);
                res.end();
            }
        });
    };
}

export { getNomoHeaderData, nomoMiddleware };
//# sourceMappingURL=index.js.map
