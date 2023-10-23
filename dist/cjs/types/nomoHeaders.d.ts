import { Request } from 'express-serve-static-core';
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
export declare function getNomoHeaderData(req: Request): NomoHeaderData;
export declare function validateNomoHeaders(req: Request): void;
