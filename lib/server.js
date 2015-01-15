module.exports = function(host, port, mocks, allowedHeaders, responseWaitTime) {

  var http  = require('http');
  var sendResponse = function(res) {
    setTimeout(function(){res.end();}, responseWaitTime || 0);
  };

  http.createServer(function(req, res) {
    var path = req.url;
    var method = req.method;

    var mocksFilePath = __dirname + '/mocks';

    console.log('Processing '+ method +' request on http://'+ host +':'+ port + path);

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Headers', allowedHeaders);
    res.setHeader('Access-Control-Allow-Methods', 'POST,GET,PUT,OPTIONS');

    for (var key in mocks) {

      if( path.match(mocks[key].path) !== null && (typeof mocks[key][method] === "function" || method === 'OPTIONS')) {

        if (method === 'OPTIONS') {
          var allowedMethods = [];
          for (var param in mocks[key]) {
            if (typeof mocks[key][param] === 'function') {
              allowedMethods.push(param);
            }
          }
          res.write('ok');
          sendResponse(res);
        }
        else {
          if (mocks[key].complex) {
            var result;
            mocks[key][method](req, function(responseData) {
              result = {
                data: responseData.data,
                fileName: mocksFilePath + '/' + mocks[key].fileName,
                http: responseData.statusCode,
                status: (responseData.statusCode === 200)
              };

              res.statusCode = responseData.statusCode || 200;
              res.write(JSON.stringify(result));
              sendResponse(res);
            });
          }
          else {
            var result = {
              "data": mocks[key][method](),
              "fileName": mocksFilePath + '/' + mocks[key].fileName,
              "http": 200,
              "status": true
            };

            res.write(JSON.stringify(result));
            sendResponse(res);

          }
        }

        return;
      }
    }

    res.statusCode = 404;
    res.write(JSON.stringify({
      "http": 404,
      "data": {
        "error": true,
        "message": "Not Found",
      },
      "status": false
    }));
    sendResponse(res);
  }).listen(port, host);

};
