# nomo-auth

Is a middleware to validate the headers and the signature of NOMO App requests.

Example to add the middleware to the backend:
```bash
      app.use(nomoMiddleware({
        nomo_jwt_secret_key: 'YOUR JWT SECRET KEY'
      }));
```


