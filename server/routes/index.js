const express = require('express')
const router = express.Router();
const maincontroller = require('../controllers/mainController')

/*
App router
*/
router.get('/',maincontroller.homepage);
router.get('/about',maincontroller.aboutpage);
module.exports = router;
