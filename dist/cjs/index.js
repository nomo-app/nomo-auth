"use strict";Object.defineProperty(exports,"__esModule",{value:!0});var o=require("jsonwebtoken"),e=require("crypto"),n=require("moment"),t=require("bitcoinjs-message");function r(o){return o&&"object"==typeof o&&"default"in o?o:{default:o}}var s=r(o),u=r(e),i=r(n),_=r(t);function a(o,e,n,t){return new(n||(n=Promise))((function(r,s){function u(o){try{_(t.next(o))}catch(o){s(o)}}function i(o){try{_(t.throw(o))}catch(o){s(o)}}function _(o){var e;o.done?r(o.value):(e=o.value,e instanceof n?e:new n((function(o){o(e)}))).then(u,i)}_((t=t.apply(o,e||[])).next())}))}"function"==typeof SuppressedError&&SuppressedError;class c extends Error{constructor(o,e){super(e),this.message=e,this.status_code=o}}function d(o){var e,n,t;const r=null!==(e=o.header("authorization"))&&void 0!==e?e:o.header("Authorization"),s={nomo_token:null==r?void 0:r.slice(7),nomo_auth_addr:o.header("nomo-auth-addr"),nomo_auth_version:o.header("nomo-auth-version"),nomo_sig:o.header("nomo-sig"),nomo_version:null===(n=o.header("User-Agent"))||void 0===n?void 0:n.slice(5),nomo_language:o.header("Accept-Language")},u=null===(t=o.header("nomo-plugin"))||void 0===t?void 0:t.split("/");return 2===(null==u?void 0:u.length)&&(s.nomo_plugin_name=u[0],s.nomo_plugin_version=u[1]),s}function m(o,e){const n=d(o),t=u.default.randomBytes(15).toString("hex"),r=i.default().utc().unix(),_={nomo_auth_addr:n.nomo_auth_addr,nonce:t,timestamp:r};return s.default.sign(_,e.nomo_token_secret)}function f(o,e){const n=d(o);if(!n.nomo_token)throw new c(403,"NOMO_AUTH_TOKEN_INVALID");const t=function(o,e){try{return o?s.default.verify(o,e.nomo_token_secret):null}catch(o){return null}}(n.nomo_token,e);if(!t)throw new c(403,"NOMO_AUTH_TOKEN_INVALID");if(!t.timestamp||!t.nomo_auth_addr||!t.nonce)throw new c(403,"NOMO_AUTH_TOKEN_INVALID");if(t.timestamp+e.nomo_token_validity<i.default().utc().unix())throw new c(403,"NOMO_AUTH_TOKEN_EXPIRED");if(n.nomo_auth_addr!==t.nomo_auth_addr)throw new c(403,"NOMO_INVALID_AUTH_ADDR");const r=function(o,e,n){if(!o||!e||!n)return!1;try{return _.default.verify(n,o,e,"Eurocoin Signed Message:\n")}catch(o){return!1}}(n.nomo_auth_addr,n.nomo_sig,n.nomo_token);if(!e.nomo_browser_dev_mode&&!r)throw new c(403,"NOMO_INVALID_SIGNATURE")}const h={nomo_token_secret:"",nomo_token_validity:10800,nomo_browser_dev_mode:!1};exports.getNomoHeaderData=d,exports.nomoMiddleware=function(o){const e=((n=o).nomo_token_secret,Object.assign(Object.assign({},h),n));var n;return function(o,n,t){return a(this,void 0,void 0,(function*(){try{if(!o.header("nomo-auth-addr"))return void t();!function(o){const e=d(o);if(!e.nomo_token)throw new c(403,"NOMO_AUTH_TOKEN_INVALID");e.nomo_auth_version||new c(403,"NOMO_MISSING_AUTH_VERSION"),e.nomo_token||new c(403,"NOMO_MISSING_AUTHORIZATION_TOKEN"),e.nomo_sig||new c(403,"NOMO_MISSING_SIGNATURE")}(o),f(o,e),t()}catch(t){const r=function(o,e,n,t){if(n instanceof c){const r={error_message:n.message,error_type:"API_ERROR"};return 403===n.status_code&&(r.jwt=t(o,e)),{status:n.status_code,response:r}}return{status:500,response:{error_message:n,error_type:"INTERNAL_ERROR"}}}(o,e,t,m);n.status(r.status).json(r.response),n.end()}}))}};
//# sourceMappingURL=index.js.map
