import { Request } from 'express-serve-static-core';
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
export declare function getNomoHeaderData(req: Request): NomoHeaderData;
export declare function validateNomoHeaders(req: Request): void;
