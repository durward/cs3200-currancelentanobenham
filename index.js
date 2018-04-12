var express = require('express');
var bodyParser = require('body-parser')
var pg = require('pg');
var app = express();

var response = function(res) { console.log(res); };
var logError = function(err) { console.log(err); };

// operating as if first user is logged in
var userid = 1;

// local port
app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/public'));
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

// index node
app.get('/', function(request, response) {
    console.log("Main page");

    response.render('pages/main-page', {senators: false});
});

app.get('/senator/:id', function(request, response) {
  var id = request.params.id;
  var joinquery = `SELECT * FROM senators s, bills b, billsponsors bs WHERE s.senid = bs.senid AND b.billid = bs.billid AND senid = '${}';`;

  pg.connect(process.env.DATABASE_URL, function(err, client, done) {
    client.query(senatorsquery, function(err, result) {
      done();
      if (err) {
        console.error(err);
        response.sent("Error " + err);
      } else {
        response.render('pages/senator', {results: result.rows});
      }
    })
  });
});

app.post('/search', function(request, response) {
  var senatorsquery = 'SELECT * FROM senators;';
  if(request.body.fname !== "") {
    var fname = request.body.fname;
    senatorsquery = `SELECT * FROM senators WHERE fname = '${fname}';`;
  }

  reloadhomepage(response, senatorsquery);
});

app.post('/delete', function(request, response) {
  var senid = request.body.id;
  var newquery = `DELETE FROM senators WHERE senid = '${senid}';`;
  console.log(newquery);

  pg.connect(process.env.DATABASE_URL, function(err, client, done) {
    client.query(newquery, function(err, result) {
      done();
      if (err) {
        console.error(err);
        // response.sent("Error " + err);
      } else {

        var senatorsquery = 'SELECT * FROM senators;'
        // reloadhomepage(response);
      }
    })
  });
});

app.post('/insert', function(request, response) {
  var body = request.body;
  var senID = body.id;
  var fname = body.fname;
  var lname = body.lname;
  var state = body.state;
  var party = body.party;
  var website = body.website;
  var newquery = `INSERT INTO senators VALUES ('${senID}', '${fname}', '${lname}', '${state}', '${party}', '${website}')`;
  console.log(newquery);

  pg.connect(process.env.DATABASE_URL, function(err, client, done) {
    client.query(newquery, function(err, result) {
      done();
      if (err) {
        console.error(err);
        // response.sent("Error " + err);
      } else {

        var senatorsquery = 'SELECT * FROM senators;'
        // reloadhomepage(response);
      }
    })
  });
});

function reloadhomepage(response, senatorsquery) {
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
}

app.listen(app.get('port'), function() {
});
