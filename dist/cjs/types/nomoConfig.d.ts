export type NomoConfigInput = {
    nomo_token_secret: string;
    nomo_token_validity?: number;
    auth_addr_validation_disabled?: boolean;
    webon_name_list: string[];
    min_webon_version?: string;
};
export type NomoConfig = {
    nomo_token_secret: string;
    nomo_token_validity: number;
    auth_addr_validation_disabled: boolean;
    webon_name_list: string[];
    min_webon_version?: string;
};
export declare function getNomoConfig(nomo_input_config: NomoConfigInput): NomoConfig;
