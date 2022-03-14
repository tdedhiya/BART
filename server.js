var express = require('express');
const request = require('request');
var cors = require('cors');
var app = express();

app.use(cors());

app.get('/stations', function (req, res) {
    request('http://api.bart.gov/api/stn.aspx?cmd=stns&key=QNBZ-5AEE-9NST-DWE9&json=y', { json: true }, (err, result, body) => {
        if (err) { return console.log(err); }
        res.send(result);
    });
})

app.get('/station/:source', function (req, res) {
    request('http://api.bart.gov/api/stn.aspx?cmd=stninfo&key=QNBZ-5AEE-9NST-DWE9&orig='+req.params.source+'&json=y', { json: true }, (err, result, body) => {
        if (err) { return console.log(err); }
        res.send(result);
      });

})

app.get('/trips', function (req, res) { 
    request('http://api.bart.gov/api/sched.aspx?cmd=depart&key=QNBZ-5AEE-9NST-DWE9&orig='+req.query.source+'&dest='+req.query.destination+'&date=now&b=0&a=4&l=1&json=y', { json: true }, (err, result, body) => {
        if (err) { return console.log(err); }
        res.send(result);
      });

})

var server = app.listen(process.env.PORT || 8080, function () {
   var host = server.address().address
   var port = server.address().port
   
   console.log("Example app listening at http://%s:%s", host, port)
})