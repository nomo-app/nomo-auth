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

const nomo_default_config: NomoConfig = {
	nomo_token_secret: '',
	nomo_token_validity: 10800,
	auth_addr_validation_disabled: false,
	webon_name_list: []
};

export function getNomoConfig(nomo_input_config: NomoConfigInput): NomoConfig {
	if (!nomo_input_config.nomo_token_secret) new Error('NOMO_TOKEN_SECRET_MISSING');

	return { ...nomo_default_config, ...nomo_input_config } as NomoConfig;
}
