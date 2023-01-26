const express = require('express')
const controller=require('../controllers/tradeController');
const {isLoggedIn, isAuthor} = require('../middlewares/auth');
const {validateId, validateTrade} = require('../middlewares/validator');

const router=express.Router();

//GET '/trades'     ---> index all gadgets
router.get('/', controller.index);

//GET /trades/new    ---->new story form
router.get('/new', isLoggedIn, controller.new);

//POST /trades      ---> add new story to DB
router.post('/', isLoggedIn, validateTrade, controller.create);


//PUT /trades/:id    ------>update story
router.put("/:id", isLoggedIn, validateId, isAuthor, validateTrade, controller.update);

//GET /trades/:id  ---> display the gadget 
router.get('/:id', validateId, controller.show);

//GET /trades/:id/edit    --->editform
router.get('/:id/edit', isLoggedIn, validateId, isAuthor, controller.edit)

//DELETE /trades/:id
router.delete('/:id',isLoggedIn, validateId, isAuthor, controller.delete);

//PUT /trades/:id/watch    ------>update story
router.put("/:id/watch", isLoggedIn, validateId, controller.watch);


//GET /trades/:id/unwatch    --->editform
router.put('/:id/unwatch', isLoggedIn, validateId, controller.unwatch)
 

module.exports = router;