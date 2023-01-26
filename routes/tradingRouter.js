const express = require('express')
const controller=require('../controllers/tradeController');
const {isLoggedIn, isAuthor} = require('../middlewares/auth');
const {validateId} = require('../middlewares/validator');

const router=express.Router();


//POST /trades/:id/trade      ---> display owntrades  view 
router.get('/:id', isLoggedIn, validateId, controller.newtrading);

router.get('/:id/manage', isLoggedIn, validateId, controller.manageView);

//POST /trades/:id/trading      ---> add new trading to DB
router.post('/', isLoggedIn, controller.trading);

router.post('/:id/manage/cancel', isLoggedIn, validateId, controller.manageCancel);

router.post('/:id/manage/accept', isLoggedIn, validateId, controller.manageAccept);





module.exports = router;