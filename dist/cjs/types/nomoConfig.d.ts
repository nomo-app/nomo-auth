export type NomoConfigInput = {
    nomo_token_secret: string;
    nomo_token_validity?: number;
    nomo_browser_dev_mode?: boolean;
};
export type NomoConfig = {
    nomo_token_secret: string;
    nomo_token_validity: number;
    nomo_browser_dev_mode: boolean;
};
export declare function getNomoConfig(nomo_input_config: NomoConfigInput): NomoConfig;
