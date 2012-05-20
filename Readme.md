[![Build Status](https://secure.travis-ci.org/TizianoPerrucci/GetThere.png?branch=master)](http://travis-ci.org/TizianoPerrucci/GetThere)

## How to run it

Install node.js http://nodejs.org/#download
Install foreman https://github.com/ddollar/foreman

Installing all application dependencies:
```bash
$ npm install
```

Run the application:
```bash
$ NODE_ENV=production foreman start
```


## How to deploy it

The application is deployed on Heroku and accessible on http://getthere.herokuapp.com

Redeploy application:
```bash
$ git push heroku master
```

## Developer information

Dependencies version:
```bash
$ npm ls
```

Run with code changes enabled:
```bash
$ supervisor app.js
```

Run tests:
```bash
$ npm test
$ ./node_modules/mocha/bin/mocha (-w for watching) (-d for debugging)
```
