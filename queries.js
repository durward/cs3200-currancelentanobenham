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
  db.none('insert into senators' +
      "values('${senid}', '${fname}', '${lname}', '${state}', '${party}', '${website}')",
    req.body)
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
  db.none("update senators set fname='$1', lname='$2', state='$3', party='$4', website='$5' where senid='$6'",
    [req.body.fname, req.body.lname, req.body.state,
      req.body.party, req.body.website, req.params.id])
    .then(function () {
      res.status(200)
        .json({
          status: 'success',
          message: 'Updated senator ' + req.params.senid
        });
    })
    .catch(function (err) {
      return next(err);
    });
}

function removeSenator(req, res, next) {
  var senID = parseInt(req.params.id);
  db.result(`delete from pups where senid = '${senID}'`)
    .then(function (result) {
      /* jshint ignore:start */
      res.status(200)
        .json({
          status: 'success',
          message: `Removed ${result.rowCount} senator`
        });
      /* jshint ignore:end */
    })
    .catch(function (err) {
      return next(err);
    });
}
