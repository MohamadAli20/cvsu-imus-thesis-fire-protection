const { name } = require("ejs");
const model = require("../models/ApiRequest");
const axios = require('axios');

class ApiRequests{

    get_cavite_firedata(req, res){
        let lgu = req.query.lgu;
        console.log(lgu);

        model.select_cavite_firedata(lgu, (error, row) => {
            if(error){
                console.error(error);
            }
            if(row){
                res.json(row);
            }
        })
    }
    get_by_year(req, res){
        const year = req.params.year;
        const lgu = req.query.lgu;

        model.select_by_year(year, lgu, (error, row) => {
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