const { name } = require("ejs");
const model = require("../models/ApiRequest");
const axios = require('axios');

class ApiRequests{

    get_cavite_firedata(req, res){
        const lgu = req.query.lgu;
        const instrument = req.query.instrument;
        let obj = {
            lgu: lgu,
            instrument: instrument 
        }

        model.select_cavite_firedata(obj, (error, row) => {
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