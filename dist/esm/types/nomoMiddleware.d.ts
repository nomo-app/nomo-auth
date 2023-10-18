import type { Request, Response } from 'express-serve-static-core';
import { NextFunction } from 'express';
import { NomoConfigInput } from './nomoConfig';
export declare function nomoMiddleware(nomo_config_input: NomoConfigInput): (req: Request, res: Response, next: NextFunction) => Promise<void>;
