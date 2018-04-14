// API CALLS
var express = require('express');
var router = express.Router();

var db = require('../queries');


router.get('/api/senators', db.getAllSenators);
router.get('/api/senators/:id', db.getSingleSenator);
router.post('/api/senators', db.createSenator);
router.put('/api/senators/:id', db.updateSenator);
router.delete('/api/senators/:id', db.removeSenator);

module.exports = router;
