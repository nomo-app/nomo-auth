# nomo-auth

Is a middleware to validate the headers and the signature of NOMO App requests.

Example to add the middleware to the backend:
```bash
      import { nomoMiddleware } from 'nomo-auth'

      app.use(nomoMiddleware({
        nomo_token_secret: 'YOUR JWT TOKEN SECRET'
      }));
```


