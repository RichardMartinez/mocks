# API Mocks Server

This is a script for running an API mock server to respond statically to a given set of resources.

## How it works

In development, we don't really want to run real API requests. It's slow, and it's just no fun. So instead, we just run a fake web server and respond to each request in a pre-defined fashion.

When the server is started, it will scan all the files under the `./mocks` directory and load them into a giant collection. When an HTTP request comes in, the server will iterate through the collection and attempt to match the request path against the stored path in an API mock. The stored path can be a string or a regular expression. When a matching path is found, the server will check if a function matching the request type exists on the matching API mock. Functions should be named `GET`, `POST`, `PUT`, `DELETE`, etc. `OPTIONS` requests are handled globally and need not be mocked.

If no matching path or request method handler is found, a 404 response is generated.

## Creating new API Mocks

An API mock is structured like so:

    'use strict';

    exports.mock = {
      path: /^\/api\/foobaz/,
      POST: function() {
        return {
          foo: "bar"
        };
      },
      GET: function() {
        return {
          foo: "baz"
        }
      }
    };

## Complex API Mocks

When APIs need to return different responses based on input data, you can create a complex API mock. Complex mocks are structured like so:

    'use strict';
    exports.mock = {
      path: /^\/api\/foobaz/,
      complex: true,
      POST: function(req, cb) {

        // Read the POST body
        var body = "";
        req.on('data', function (chunk) {
          body += chunk;
        });
        req.on('end', function () {
          var data = JSON.parse(body).data;

          if (data.isKill === 'kill') {
            cb({
              data: {
                "error": true,
                "message": "API is kill"
              },
              statusCode: 403
            });
          }
          else {
            cb({
              data: {
                "hello": 'API is not kill'
              }
            });
          }
        });
      }
    };

In a Complex API Mock, each request method handler must accept a `req` and a `cb` parameter.

## API Responses

API Responses are structured as follows:


    {
      "data": {
        "foo": "baz"
      },
      "fileName": "/path/to/node_modules/mocks/mocks/loan.js",
      "http": 200,
      "status": true
    }

API errors are represented as follows:

    {
      "http": 404,
      "status":false,
      "data": {
        "error": true,
        "message": "Not Found"
      }
    }

## Shared API Mocks

Files under the `./mocks` directory with names prefixed with an underscore, (e.g. `_my-mock.js`) will not be loaded. These can be included by other mocks, allowing reuse of data.
