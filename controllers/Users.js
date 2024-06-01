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
    data_logging(req, res){
        res.render("data_logging");
    }
    api_documentation(req, res){
        res.render("api_documentation")
    }
}
module.exports = new Users();

