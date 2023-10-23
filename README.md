# Overview

`nomo-auth` is an Express middleware designed to validate the headers and signature of NOMO App requests. It provides an extra layer of security to ensure that incoming requests are authorized and legitimate.

## Installation

To get started with `nomo-auth`, you can install it via npm:

```bash
npm install nomo-auth
```

## Usage

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

## Configuration Options

The nomoMiddleware function takes an options object with the following properties:

- nomo_token_secret ( required ): The secret for the JSON Web Token (JWT) communication.
- nomo_token_validity ( optional ): How long the token is valid (in seconds).
- nomo_browser_dev_mode ( optional ): Activate this only in development mode if you are opening the plugin in your browser.

## NOMO Headers

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

If you need more information regarding NOMO Headers, please refer to the [NOMO Plugin Kit documentation](https://github.com/nomo-app/nomo-plugin-kit/blob/main/api-docs/modules.md).