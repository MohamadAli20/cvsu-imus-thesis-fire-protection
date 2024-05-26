const axios = require('axios');
const turf = require('@turf/turf');
const fs = require('fs');
const csv = require('csv-parser');
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
    async store_firedata(req, res) {
        try{
            let filteredData = [];
            let caviteFireData = [];
            let lgu = ["Alfonso","Amadeo","Bacoor","Carmona","Cavite City","Dasmarinas","General Emilio Aguinaldo","General Mariano Alvarez","General Trias","Imus","Indang","Kawit","Magallanes","Maragondon","Mendez","Naic","Noveleta","Rosario","Silang","Tagaytay","Tanza","Ternate","Trece Martires"];
            /* Change the json file */
            const phFireData = JSON.parse(fs.readFileSync('assets/source/2024/DL_FIRE_SV-C2_474013/fire_nrt_SV-C2_474013.json', 'utf8'));
            const caviteBoundary = JSON.parse(fs.readFileSync('assets/geo_json/cavite/cavite.geojson', 'utf8'));

            for(let i = 0; i < phFireData.length; i++){
                /* Filter to get only the fire incident happened inside Imus City */
                let longitude = phFireData[i].longitude;
                let latitude = phFireData[i].latitude;
                
                let pt = turf.point([longitude, latitude]); /* location of fire */
                let poly = turf.polygon(caviteBoundary.features[0].geometry.coordinates); /* boundary of Cavite */
                let result = turf.booleanPointInPolygon(pt, poly); /* check if fire location is inside the Cavite Area */

                if(result){
                    filteredData.push(phFireData[i]);
                }
            }
            for(let k = 0; k < lgu.length; k++){
                for(let j = 0; j < filteredData.length; j++){
                    let longitude = filteredData[j].longitude;
                    let latitude = filteredData[j].latitude;

                    const lguBoundary = JSON.parse(fs.readFileSync(`assets/geo_json/lgu/${lgu[k]}.geojson`, 'utf8'));
                    let pt = turf.point([longitude, latitude]); /* location of fire */
                    let poly = turf.polygon(lguBoundary.geometry.coordinates); /* boundary of Cavite */
                    let result = turf.booleanPointInPolygon(pt, poly); /* check if fire location is inside the Cavite Area */
                    // console.log(result);
                    if(result){
                        filteredData[j].lgu = lgu[k];
                        caviteFireData.push(filteredData[j]);
                        // console.log(result);
                    }
                }
            }
            console.log(caviteFireData.length)
            // console.log(caviteFireData);

            // model.insert_firedata(caviteFireData, (error) => {
            //     if(error){
            //         console.error(error);
            //     }
            // });
        }
        catch(error){
            console.error('Error reading JSON file:', error);
            res.status(500).json({ error: 'Error reading JSON file' });
        }
    }
    async store_imus_firedata(req, res){
        try{
            let imusFireData = [];
            /* Change the json file */
            const phFireData = JSON.parse(fs.readFileSync('assets/source/fire_nrt_SV-C2_465499.json', 'utf8'));
            const imusBoundary = JSON.parse(fs.readFileSync('assets/geo_json/cavite/cavite.geojson', 'utf8'));
            
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