import { Request } from 'express-serve-static-core';
import { NomoConfig } from './nomoConfig';
export type NomoErrorResponse = {
    error_type: string;
    error_message: string | undefined;
    jwt?: string | undefined;
};
export type NomoError = {
    status: number;
    response: NomoErrorResponse;
};
export declare class NomoApiError extends Error {
    message: string;
    status_code: number;
    constructor(status_code: number, message: string);
}
export declare function handleMiddlewareError(req: Request, nomo_config: NomoConfig, error: unknown, create_nomo_token_fct: (req: Request, nomo_config: NomoConfig) => string): NomoError;
