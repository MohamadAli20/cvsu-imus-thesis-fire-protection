const { name } = require("ejs");
const model = require("../models/ApiRequest");
const axios = require('axios');

class ApiRequests{
    get_by_lgu(req, res){
        const year = req.params.year;
        const lgu = req.query.lgu;

        model.select_by_lgu(year, lgu, (error, row) => {
            if(error){
                console.error(error);
            }
            if(row){
                res.json(row);
            }
        })

        
    }
}

module.exports = new ApiRequests();