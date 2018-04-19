var express = require('express');
var bodyParser = require('body-parser')
var pg = require('pg');
var app = express();
var routes = require('./routes/index');

var response = function(res) { console.log(res); };
var logError = function(err) { console.log(err); };

// operating as if first user is logged in
var userid = 1;

// local port
app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/public'));
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.use('/', routes);

// index node
app.get('/', function(request, response) {
    console.log("Main page");

    response.render('pages/main-page', {senators: false, loggedin: false, errormsg: false});
});

// Logging into the website
app.post('/login', function(request, response) {
  var body = request.body;
  var uname = body.uname;
  var pwd = body.pwd;

  if (pwd == "admin" && uname == "admin") {
    response.render('pages/main-page', {senators: false, loggedin: true, errormsg: false});
  } else  {
    response.render('pages/main-page', {senators: false, loggedin: false, errormsg: false});
  }
});

// Getting to the API page
app.get('/api', function(request, response) {

    response.render('pages/api');
});

// Getting a specific senator
app.get('/senator/:id', function(request, response) {
  var id = request.params.id;
  var joinquery = `SELECT * FROM senator_bills('${id}');`;

  pg.connect(process.env.DATABASE_URL, function(err, client, done) {
    client.query(joinquery, function(err, result) {
      done();
      if (err) {
        console.error(err);
        // response.sent("Error " + err);
      } else {
        response.render('pages/senator', {results: result.rows, editing: false, errormsg: false});
      }
    })
  });
});

// Updating fields of a senator
app.post('/senator/:id', function(request, response) {
  var body = request.body;
  var senID = body.id;
  var fname = body.fname;
  var lname = body.lname;
  var state = body.state;
  var party = body.party;
  var website = body.website;
  var newquery = `update senators set fname='${fname}', lname='${lname}', state='${state}', party='${party}', website='${website}' where senid='${senID}'`;

  pg.connect(process.env.DATABASE_URL, function(err, client, done) {
    client.query(newquery, function(err, result) {
      done();
      var joinquery = `SELECT * FROM senator_bills('${senID}');`;
      if (err) {
        console.error(err);
        // response.sent("Error " + err);
        client.query(joinquery, function(err, result) {
          done();
          if (err) {
            console.error(err);
            // response.sent("Error " + err);
          } else {
            response.render('pages/senator', {results: result.rows, editing: false,
          errormsg: "Invalid update. Make sure no field was left blank (except for optional  website) and party is one of [Independent, Republican, Democratic]"});
          }
        })
      } else {
        client.query(joinquery, function(err, result) {
          done();
          if (err) {
            console.error(err);
            // response.sent("Error " + err);
          } else {
            response.render('pages/senator', {results: result.rows, editing: false, errormsg: false});
          }
        })
      }
    })
  });
  var joinquery = `SELECT * FROM senator_bills('${senID}');`;
});

// Entering edit mode for a specific senator
app.get('/senator/:id/edit', function(request, response) {
  var id = request.params.id;
  var joinquery = `SELECT * FROM senator_bills('${id}');`;

  pg.connect(process.env.DATABASE_URL, function(err, client, done) {
    client.query(joinquery, function(err, result) {
      done();
      if (err) {
        console.error(err);
        // response.sent("Error " + err);
      } else {
        response.render('pages/senator', {results: result.rows, editing: true, errormsg: false});
      }
    })
  });
});

// Searching for senator by first name
app.post('/search', function(request, response) {
  var senatorsquery = 'SELECT * FROM senators;';
  if(request.body.fname !== "") {
    var fname = request.body.fname;
    senatorsquery = `SELECT * FROM senators WHERE fname = '${fname}';`;
  }

  reloadhomepage(response, senatorsquery);
});

// Removing a senator
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
        response.render('pages/main-page', {senators: false, loggedin: true, errormsg: "Invalide Senator ID"});
      } else {
        response.render('pages/main-page', {senators: false, loggedin: true, errormsg: false});
      }
    })
  });
});

// Adding a senator
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


  if (senID == "" || fname == "" || lname == "" || state == "" || party == "") {
    response.render('pages/main-page', {senators: false, loggedin: true,
      errormsg: "Invalid input. Make sure all fields (except for optional website) have been entered and party is one of [Independent, Republican, Democratic]"});
  } else {
    pg.connect(process.env.DATABASE_URL, function(err, client, done) {
      client.query(newquery, function(err, result) {
        done();
        if (err) {
          console.error(err);
          response.render('pages/main-page', {senators: false, loggedin: true,
            errormsg: "Invalid input. Make sure all fields (except for optional website) have been entered and party is one of [Independent, Republican, Democratic]"});
        } else {
          response.render('pages/main-page', {senators: false, loggedin: true, errormsg: false});
        }
      })
    });
  }

});

// Function for reloading the homepage
function reloadhomepage(response, senatorsquery) {
  pg.connect(process.env.DATABASE_URL, function(err, client, done) {
    client.query(senatorsquery, function(err, result) {
      done();
      if (err) {
        console.error(err);
        response.sent("Error " + err);
      } else {
        response.render('pages/main-page', {senators: result.rows, loggedin: true, errormsg: false});
      }
    })
  });
}

// BILLS
// Getting a specific bill
app.get('/bill/:id', function(request, response) {
  var id = request.params.id;
  var query = `SELECT * FROM bills where billid = '${id}';`;
  var query2 = `SELECT * FROM votes v, senators s where v.billid = '${id}' and s.senid = v.senid;`;

  pg.connect(process.env.DATABASE_URL, function(err, client, done) {
    var billdata = false;
    var votedata = false;
    client.query(query, function(err, result) {
      done();
      if (err) {
        console.error(err);
        // response.sent("Error " + err);
      } else {
        billdata = result.rows;
        client.query(query2, function(err, result) {
          done();
          if (err) {
            console.error(err);
            // response.sent("Error " + err);
          } else {
            votedata = result.rows;
            console.log(billdata);
            response.render('pages/bill', {bill: billdata, votes: votedata});
          }
        })
      }
    })
  });
});



app.listen(app.get('port'), function() {
});
