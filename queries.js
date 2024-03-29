var promise = require('bluebird');

var options = {
  // Initialization Options
  promiseLib: promise
};

var pgp = require('pg-promise')(options);
var connectionString = process.env.DATABASE_URL;
var db = pgp(connectionString);

// add query functions

module.exports = {
  getAllSenators: getAllSenators,
  getSingleSenator: getSingleSenator,
  createSenator: createSenator,
  updateSenator: updateSenator,
  removeSenator: removeSenator
};

function getAllSenators(req, res, next) {
  db.any('select * from senators')
    .then(function (data) {
      res.status(200)
        .json({
          status: 'success',
          data: data,
          message: 'Retrieved ALL senators'
        });
    })
    .catch(function (err) {
      return next(err);
    });
}

function getSingleSenator(req, res, next) {
  var senID = req.params.id;
  db.one(`select * from senators where senid = '${senID}'`)
    .then(function (data) {
      res.status(200)
        .json({
          status: 'success',
          data: data,
          message: 'Retrieved ONE senator'
        });
    })
    .catch(function (err) {
      return next(err);
    });
}

function createSenator(req, res, next) {
  console.log(req.body);
  var senid = req.body.senid;
  var fname = req.body.fname;
  var lname = req.body.lname;
  var state = req.body.state;
  var party = req.body.party;
  var website = req.body.website;

  db.none(`insert into senators values('${senid}', '${fname}', '${lname}', '${state}', '${party}', '${website}')`)
    .then(function () {
      res.status(200)
        .json({
          status: 'success',
          message: 'Inserted one senator'
        });
    })
    .catch(function (err) {
      return next(err);
    });
}

function updateSenator(req, res, next) {
  var fname = req.body.fname;
  var lname = req.body.lname;
  var state = req.body.state;
  var party = req.body.party;
  var website = req.body.website;
  var senid = req.params.id;
  db.none(`update senators set fname='${fname}', lname='${lname}', state='${state}', party='${party}', website='${website}' where senid='${senid}'`)
    .then(function () {
      res.status(200)
        .json({
          status: 'success',
          message: 'Updated senator ' + req.params.id
        });
    })
    .catch(function (err) {
      return next(err);
    });
}

function removeSenator(req, res, next) {
  var senID = req.params.id;
  db.result(`delete from senators where senid = '${senID}'`)
    .then(function (result) {
      /* jshint ignore:start */
      res.status(200)
        .json({
          status: 'success',
          message: `Removed senator ${senID}`
        });
      /* jshint ignore:end */
    })
    .catch(function (err) {
      return next(err);
    });
}
