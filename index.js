var express = require('express');
var pg = require('pg');
var app = express();

var response = function(res) { console.log(res); };
var logError = function(err) { console.log(err); };

// operating as if first user is logged in
var userid = 1;

// local port
app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/public'));

// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

// index node
app.get('/', function(request, response) {
    console.log("Main page");

    var senatorsquery = 'SELECT * FROM senators;'

    pg.connect(process.env.DATABASE_URL, function(err, client, done) {
      client.query(senatorsquery, function(err, result) {
        done();
        if (err) {
          console.error(err);
          response.sent("Error " + err);
        } else {
          response.render('pages/main-page', {senators: result.rows});
        }
      })
    });
});

app.listen(app.get('port'), function() {
});