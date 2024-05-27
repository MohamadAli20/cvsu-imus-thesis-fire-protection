const turf = require('@turf/turf');
const fs = require('fs');
const model = require("../models/Record");
const axios = require('axios');

class Records{

    get_all_firedata(req, res){

        let details = req.body;

        model.select_firedata(details, (error, row) => {
            if(error){
                console.error(error);
            }
            if(row){
                res.json(row);
            }
        })
    }

    async get_transaction_amount(req, res){
        try{
            const mapKeyStatus = await axios.get("https://firms.modaps.eosdis.nasa.gov/mapserver/mapkey_status/?MAP_KEY=6ebaa525eb5f78cb9d68576f8599d93e");
            const currentTransaction = mapKeyStatus.data;
            currentTransaction.mapKey = "6ebaa525eb5f78cb9d68576f8599d93e";
    
            res.json(currentTransaction);
        }
        catch(error){
            console.error(error);
            res.status(500).json({ error: error.message });
        }
    }
    async getFireData(req, res) {
        try{
            const mapKey = req.body.mapKey;
            const date = req.body.date;
            const range = req.body.range;
            const instrument = req.body.instrument;
            // console.log(mapKey, date, range, instrument)

            let filteredData = [];
            let caviteFireData = [];
            let lgu = ["Alfonso","Amadeo","Bacoor","Carmona","Cavite City","Dasmarinas","General Emilio Aguinaldo","General Mariano Alvarez","General Trias","Imus","Indang","Kawit","Magallanes","Maragondon","Mendez","Naic","Noveleta","Rosario","Silang","Tagaytay","Tanza","Ternate","Trece Martires"];
            
            // const response = await axios.get(`https://firms.modaps.eosdis.nasa.gov/api/country/csv/${mapKey}/${instrument}/PHL/${range}/${date}`);
            const caviteBoundary = JSON.parse(fs.readFileSync('assets/geo_json/cavite/cavite.geojson', 'utf8'));
            /* remove this after testing*/
            const phFireData = JSON.parse(fs.readFileSync('assets/source/2024/DL_FIRE_SV-C2_474013/fire_nrt_SV-C2_474013.json', 'utf8'));

            /* Uncomment this after testing*/
            /*const dataString = response. data
            const dataArray = dataString.split('\n').slice(1).map(line => {
                const [country_id, latitude, longitude, bright_ti4, scan, track, acq_date, acq_time, satellite, instrument, confidence, version, bright_ti5, frp, daynight] = line.split(',');
                return {
                  latitude: parseFloat(latitude),
                  longitude: parseFloat(longitude),
                  acq_date,
                  acq_time,
                  frp: parseFloat(frp),
                  version,
                  bright_t31: parseFloat(bright_ti4),
                  daynight,
                  confidence,
                  satellite,
                  scan: parseFloat(scan),
                  brightness: parseFloat(bright_ti5),
                  instrument,
                  track: parseFloat(track)
                };
            });

            // console.log(dataArray);
            dataArray.push({
                latitude: 14.380980,
                longitude: 120.988440,
                acq_date: '2024-05-27',
                acq_time: '451',
                frp: 2.75,
                version: '2.0NRT',
                bright_t31: 332.03,
                daynight: 'D',
                confidence: 'n',
                satellite: 'N20',
                scan: 0.43,
                brightness: 287.78,
                instrument: 'VIIRS',
                track: 0.46
              })
            let phFireData = dataArray;*/

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
            // console.log(caviteFireData.length)
            // console.log(caviteFireData);

            let filteredCaviteData = [];
            model.verify_if_duplicates(caviteFireData, (error, row) => {
                if(error){
                    console.error(error);
                }
                if(row){
                    filteredCaviteData.push(row[0]);
                    // console.log(row[0])
                    // console.log(caviteFireData.length);


                }
            })
            console.log(filteredCaviteData);
            // model.insert_firedata(caviteFireData, (error) => {
            //     if(error){
            //         console.error(error);
            //     }
            // });
        }
        catch(error) {
            res.status(500).json({ error: error.message });
        }
    }

    /* 
    * Below methods are used to store firedata in the database
    * Fire data is filtered to get only the fire data in the Cavite
    */
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