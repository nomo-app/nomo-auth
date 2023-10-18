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

const nomo_default_config: NomoConfig = {
	nomo_token_secret: '',
	nomo_token_validity: 10800,
	nomo_browser_dev_mode: false
};

export function getNomoConfig(nomo_input_config: NomoConfigInput): NomoConfig {
	if (!nomo_input_config.nomo_token_secret) new Error('NOMO_TOKEN_SECRET_MISSING');

	return { ...nomo_default_config, ...nomo_input_config } as NomoConfig;
}
