// const model = require("../models/User");
// const multer  = require('multer')
// const upload = multer({ dest: 'uploads/' })

class Users{
    /*render view files*/
    index(req, res){
        res.render("index");
    }
    fire_data(req, res){
        res.render("fire_data");
    }
}
module.exports = new Users();

