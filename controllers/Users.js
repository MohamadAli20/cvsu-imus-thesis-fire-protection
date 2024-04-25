const model = require("../models/User");
// const multer  = require('multer')
// const upload = multer({ dest: 'uploads/' })

class Users{
    /*render view files*/
    index(req, res){
        res.render("index");
    }
}
module.exports = new Users();

