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

function getAllPuppies(req, res, next) {
  db.any('select * from senators')
    .then(function (data) {
      res.status(200)
        .json({
          status: 'success',
          data: data,
          message: 'Retrieved ALL puppies'
        });
    })
    .catch(function (err) {
      return next(err);
    });
}
