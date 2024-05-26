const { name } = require("ejs");
const model = require("../models/Record");
const axios = require('axios');

class Api{
    async printPlace(req, res){

        let data = [];
        // const MAP_KEY = '6ebaa525eb5f78cb9d68576f8599d93e';
        const MAP_KEY = 'c1cfea789591c42cfe9feb7c959d5719';
        const instrument = [
            'MODIS_NRT',
            'MODIS_SP',
            'VIIRS_NOAA20_NRT',
            'VIIRS_NOAA21_NRT',
            'VIIRS_SNPP_NRT',
            'VIIRS_SNPP_SP'
        ];
        const range = 1;

        try{
            for(let i = 0; i < instrument.length; i++){
                const response = await axios.get(`https://firms.modaps.eosdis.nasa.gov/api/country/csv/${MAP_KEY}/${instrument[i]}/PHL/${range}`);
                data.push(response);
                console.log(response)
            }
            res.json(data);
        }
        catch(error) {
            res.status(500).json({ error: error.message });
        }
    }

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
        if(namePlace === "cavite"){
            
        }
        // res.json(responseData)
    }
}

module.exports = new Api;