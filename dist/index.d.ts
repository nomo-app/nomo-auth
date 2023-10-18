import { Request, Response } from 'express-serve-static-core';
import { NextFunction } from 'express';

type NomoConfigInput = {
    nomo_token_secret: string;
    nomo_token_validity?: number;
    nomo_browser_dev_mode?: boolean;
};
type NomoConfig = {
    nomo_token_secret: string;
    nomo_token_validity: number;
    nomo_browser_dev_mode: boolean;
};

declare function nomoMiddleware(nomo_config_input: NomoConfigInput): (req: Request, res: Response, next: NextFunction) => Promise<void>;

type NomoHeaderData = {
    nomo_token: string | undefined;
    nomo_sig: string | undefined;
    nomo_auth_addr: string | undefined;
    nomo_auth_version: string | undefined;
    nomo_version: string | undefined;
    nomo_language: string | undefined;
    nomo_plugin_name: string | undefined;
    nomo_plugin_version: string | undefined;
};
declare function getNomoHeaderData(req: Request): NomoHeaderData;

export { NomoConfig, NomoHeaderData, getNomoHeaderData, nomoMiddleware };
