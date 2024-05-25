const { name } = require("ejs");
const model = require("../models/Record");

class Api{
    fetchFireData(req, res){
        let namePlace = req.params.name_of_place;

        const responseData = [];
        
        if(namePlace === "imus"){
            model.select_firedata((error, row) => {
                if(error){
                    console.error(error);
                }
                if(row){
                    res.json(row);
                }
            })
        }
        // res.json(responseData)
    }
}

module.exports = new Api;