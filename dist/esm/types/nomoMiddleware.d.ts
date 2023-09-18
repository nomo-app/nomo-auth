import type { Request, Response } from 'express-serve-static-core';
import { NextFunction } from "express";
export type NomoHeaderData = {
    authorization: string | undefined;
    nomo_sig: string | undefined;
    nomo_auth_addr: string | undefined;
    nomo_auth_version: string | undefined;
};
export declare function getNomoToken(req: Request): NomoToken;
export declare function getNomoHeaderData(req: Request): NomoHeaderData;
export declare function nomoMiddleware(custom_nomo_config: NomoConfig): (req: Request, res: Response, next: NextFunction) => Promise<void>;
export type NomoConfig = {
    nomo_jwt_secret_key?: string;
    nomo_jwt_validity_in_sec?: number;
    nomo_ignore_signature?: boolean;
};
export type NomoToken = {
    nomo_auth_addr: string;
    nonce: string;
    timestamp: number;
};
export type NomoResponse = {
    error_message: string | null;
    error_type: string;
    jwt: string | null;
    data: any | null;
};
