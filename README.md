# Nomo-Auth

`nomo-auth` is a protocol for authenticating WebOns, based on cryptographic signatures.
With `nomo-auth`, WebOns can authenticate without any passwords or even without any user interaction at all.

At its core, `nomo-auth` injects a few headers into HTTP-requests sent by a Nomo WebOn.

## Protocol Specification

See the [open-source simulation](https://github.com/nomo-app/nomo-webon-kit/blob/main/nomo-webon-kit/src/nomo_auth.ts) of the Nomo-Auth protocol.
This simulation serves as a specification of Nomo-Auth.
Nomo-Auth is a simple protocol, so the whole simulation is only a small amount of TypeScript-code.

## How to use

In the frontend, we recommend using the function [nomoAuthHttp](https://github.com/nomo-app/nomo-webon-kit/blob/main/api-docs/modules.md#nomoauthhttp) from the nomo-webon-kit.
nomoAuthHttp injects the needed HTTP-headers automatically and it retries requests upon 403-errors (according to the specification above).

In the backend, we recommend learning how to verify signatures (see the sections below).

## Signature Verification

`nomo-auth` offers two different types of address/signature-pairs: `nomo-auth-addr + nomo-sig` as well as `nomo-eth-addr + nomo-eth-sig`.
To secure a backend, at least one of those address/signature-pairs must be verified.

### nomo-auth-addr + nomo-sig

`nomo-auth-addr` is a special address that is derived from the user's wallet and the target-domain of the HTTP-request.

`nomo-sig` is an *“Eurocoin-message-signature"* that can be verified with packages like [bitcoinjs-message](https://www.npmjs.com/package/bitcoinjs-message).
See the function [verifyNomoSignature](https://github.com/nomo-app/nomo-auth/blob/5c47fe3440952b1f613d2c1c594babfad4f4c99c/src/nomoToken.ts#L52C10-L52C29) as an example for verifying a `nomo-sig`.

> :warning: `nomo-auth-addr` will change whenever the target-domain of your HTTP-requests changes! If you rely on `nomo-auth-addr` in a database, then you must never ever change the domain of your backend.

### nomo-eth-addr + nomo-eth-sig

`nomo-eth-addr` is the regular Ethereum/Smartchain-address of a Nomo user.

`nomo-eth-sig` is an *"Ethereum-message-signature"* that can be verified with packages like ethers.js or web3.js.
See the [ethSigDemo](https://github.com/nomo-app/nomo-webon-kit/blob/main/demo-webon/src/app/evm/eth_sig.ts) as an example for verifying a `nomo-eth-sig`.


## npm package

The `nomo-auth` npm package is an express.js-middleware for Nomo-Auth.
Nevertheless, even if you do not use express.js, Nomo-Auth is simple enough to be integrated without any middleware with just a few lines of code.

### Installation

To use `nomo-auth` with express.js, you can install it via npm:

```bash
npm install nomo-auth
```

### Usage

Here's an example of how to add the nomo-auth middleware to your Express application:

```typescript
import express from 'express';
import { nomoMiddleware } from 'nomo-auth';

const app = express();

const config = {
  nomo_token_secret: 'Your JWT token secret',
  nomo_token_validity: 'Token validity in seconds', // default 3h
  nomo_browser_dev_mode: 'true or false', // default false
};

app.use(nomoMiddleware(config));
```

In this example, you import the nomoMiddleware function and add it as middleware to your Express app. Replace the configuration values with the appropriate settings for your application.

### Configuration Options

The nomoMiddleware function takes an options object with the following properties:

- nomo_token_secret ( required ): The secret for the JSON Web Token (JWT) communication.
- nomo_token_validity ( optional ): How long the token is valid (in seconds).
- nomo_browser_dev_mode ( optional ): Activate this only in development mode if you are opening a WebOn in your browser.

### Nomo Headers

To retrieve these NOMO Headers, you can use the getNomoHeaderData function. This function takes an Express Request object as its parameter and returns an object containing the extracted NOMO Headers. Here's how to use it:
```typescript
import { getNomoHeaderData } from 'nomo-auth';

app.get('/your-endpoint', (req, res) => {
  const nomo_headers = getNomoHeaderData(req);

  // You can now access and use the NOMO headers in your application
  console.log(nomo_headers.nomo_token);
  console.log(nomo_headers.nomo_sig);
  // ...
  // Handle requests based on NOMO headers
});
```

If you need more information regarding Nomo Headers, please refer to the [Nomo Auth simulation](https://github.com/nomo-app/nomo-webon-kit/blob/main/nomo-webon-kit/src/nomo_auth.ts).
