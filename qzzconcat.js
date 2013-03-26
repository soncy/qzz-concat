var express = require('express'),
    url = require('url'),
    argv = require('optimist').argv,
    app = express(),
    PROTOCOL = 'http';

var mime_config = {
    "js" : "application/javascript",
    "css" : "text/css"
};

function makeUpConcat(req) {
    //requestUrl格式 http://qunarzz.com/??js/jvalidator/build/jquery.jvalidator-0.2.2.min.js,jquery/prd/jquery-1.7.2.min.js
    var result = [],
        re = /(.*?)\.(css|js)$/,
        temp = req.url.split('??'),
        host = req.headers["host"],
        protocol = PROTOCOL || "http",
        type = re.exec(req.url)[2], //判断是js还是css
        path = temp[1]; // ??后面的部分

    if (!path){
        var errmsg = '[ERROR] ??后面必须有路径';
        console.log(errmsg);
        return errmsg;
    }
    
    for(var i = 0, paths = path.split(','), len = paths.length; i < len; i++) {
        var u = url.format({
            host: host,
            port: 80,
            pathname: temp[0] + paths[i],
            protocol: protocol
        }), str = '';

        if (type === 'css'){
            str = '@import url(' + u + ')\n';
        } else {
            str = '!!document.write(\'<script src="' + u + '"></script>\')\n';
        }
        result.push(str);
    }

    return {
        text: result.join(''),
        type: type
    }
}

(function(){
    app.get('*', function(req, res, next) {
        if (~req.url.indexOf('??') && ~req.url.indexOf(',')) {
            var ret = makeUpConcat(req);
            res.writeHead(200, { 'Content-Type': mime_config[ret.type] });
            res.end(ret.text);
        } else {
            next();
        }
    })

    var port = argv["port"] || argv["p"];
    app.listen(port);
})();