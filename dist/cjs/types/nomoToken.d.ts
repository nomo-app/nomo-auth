import { Request } from 'express-serve-static-core';
import { NomoConfig } from './nomoConfig';
export declare function createNomoToken(req: Request, nomo_config: NomoConfig): string;
export declare function validateNomoToken(req: Request, nomo_config: NomoConfig): void;
