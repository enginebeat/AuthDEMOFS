# AuthDEMOFS
Authentication example from scratch

One of the ways to do authentication that goes a bit deeper than normal.


Security Best Practices

- Always use SSL
- Use Cookie Flags

    app.use(session({
        cookieName: 'session',
        secret: 'some_random_string',
        duration: 30 * 60 * 1000,
        activeDuration: 5 * 60 * 1000,
        httpOnly: true, // don't let JS code access cookies
        secure: true,   // only set cookies over https
        ephemeral: true // destroy cookies when the browser closes
    }));

- Wear a Helmet
    npm install helmet

    const helmet = require('helmet');

    //manage http header security
    app.use(helmet());

- Don't roll your own
    i.e.- don't use this code, instead use 
        passport
        node-login
        aqua
        Okta

        okta is developed by the Guy that provided the lecture and code.
        worth looking into this package further as passport still has 
        issues(you are still doing a lot yourself).
        
        https://www.npmjs.com/package/@okta/okta-auth-js


Ckeck out the code @ https://github.com/rdegges/ss-auth
Check the slides @ http://speaerdeck.com/rdegges


