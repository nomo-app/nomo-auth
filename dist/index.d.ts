import { Request, Response } from 'express-serve-static-core';
import { NextFunction } from 'express';

type NomoHeaderData = {
    authorization: string | undefined;
    nomo_sig: string | undefined;
    nomo_auth_addr: string | undefined;
    nomo_auth_version: string | undefined;
};
declare function getNomoToken(req: Request): NomoToken;
declare function getNomoHeaderData(req: Request): NomoHeaderData;
declare function nomoMiddleware(custom_nomo_config: NomoConfig): (req: Request, res: Response, next: NextFunction) => Promise<void>;
type NomoConfig = {
    nomo_jwt_secret_key?: string;
    nomo_jwt_validity_in_sec?: number;
    nomo_ignore_signature?: boolean;
};
type NomoToken = {
    nomo_auth_addr: string;
    nonce: string;
    timestamp: number;
};
type NomoResponse = {
    error_message: string | null;
    error_type: string;
    jwt: string | null;
    data: any | null;
};

export { NomoConfig, NomoHeaderData, NomoResponse, NomoToken, getNomoHeaderData, getNomoToken, nomoMiddleware };
