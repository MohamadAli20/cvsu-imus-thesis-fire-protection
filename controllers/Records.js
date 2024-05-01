const axios = require('axios');
const turf = require('@turf/turf');
const fs = require('fs');
const model = require("../models/Record");

class Records{
    // csv_to_db(req, res){
    //     var pt = turf.point([-77, 44]);
    //     var poly = turf.polygon([[
    //     [-81, 41],   
    //     [-81, 47],
    //     [-72, 47],
    //     [-72, 41],
    //     [-81, 41]
    //     ]]);

    //     let result = turf.booleanPointInPolygon(pt, poly);
    //     //= true
    //     res.json(result);
    // }
    /* Store Philippines fire data to MySQL */
    store_firedata(req, res){
        try{
            const jsonData = fs.readFileSync('assets/source/fire_nrt_J1V-C2_465497.json', 'utf8');
            // Parse JSON data and send it in the response
            const parsedData = JSON.parse(jsonData);
            model.insert_firedata(parsedData, (error) => {

            })
        }
        catch(error){
            console.error('Error reading JSON file:', error);
            res.status(500).json({ error: 'Error reading JSON file' });
        }
    }
    async store_imus_firedata(req, res){
        try{
            let imusFireData = [];
            const phFireData = JSON.parse(fs.readFileSync('assets/source/fire_nrt_SV-C2_465499.json', 'utf8'));
            const imusBoundary = JSON.parse(fs.readFileSync('assets/geo_json/lgu/Imus.geojson', 'utf8'));
            
            for(let i = 0; i < phFireData.length; i++){
                /* Filter to get only the fire incident happened inside Imus City */
                let longitude = phFireData[i].longitude;
                let latitude = phFireData[i].latitude;
                
                let pt = turf.point([longitude, latitude]);
                let poly = turf.polygon(imusBoundary.geometry.coordinates);

                let result = turf.booleanPointInPolygon(pt, poly);
                if(result){
                    imusFireData.push(phFireData[i]);
                }
            }
            console.log(imusFireData.length);

            model.insert_imus_firedata(imusFireData, (error) => {
                if(error){
                    console.error(error);
                }
            });
        }
        catch(error){
            console.error('Error reading JSON file:', error);
            res.status(500).json({ error: 'Error reading JSON file' });
        }

        
    }
}

module.exports = new Records();