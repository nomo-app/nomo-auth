import { Request, Response } from 'express-serve-static-core';
import { NextFunction } from 'express';

type NomoConfigInput = {
    nomo_token_secret: string;
    nomo_token_validity?: number;
    auth_addr_validation_disabled?: boolean;
    webon_name_list: string[];
    min_webon_version?: string;
};
type NomoConfig = {
    nomo_token_secret: string;
    nomo_token_validity: number;
    auth_addr_validation_disabled: boolean;
    webon_name_list: string[];
    min_webon_version?: string;
};

declare function nomoMiddleware(nomo_config_input: NomoConfigInput): (req: Request, res: Response, next: NextFunction) => Promise<void>;

type NomoHeaderData = {
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
declare function getNomoHeaderData(req: Request): NomoHeaderData;

export { NomoConfig, NomoHeaderData, getNomoHeaderData, nomoMiddleware };
