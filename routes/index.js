const express = require('express');
const router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Blcscan', version: '0.9.0' });
});

module.exports = router;
