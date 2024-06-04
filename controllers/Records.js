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
            // Check if req.body has values and assign them if they exist
            let date = req.body.range || null;
            let range = req.body.date || null;

            // Optionally remove the values from req.body if they exist
            if (date !== null && range !== null) {
                req.body.range = null;
                req.body.date = null;
            }
            model.select_mapkey( async(error, row) => {
                if(error){
                    console.log(error);
                }
                if(row){
                    let status = [];
                    for(let i = 0; i < row.length; i++){
                        let map_key = row[i].map_key;
                        try{
                            const mapKeyStatus = await axios.get(`https://firms.modaps.eosdis.nasa.gov/mapserver/mapkey_status/?MAP_KEY=${map_key}`);
                            let currentTransaction = mapKeyStatus.data;
                            currentTransaction.mapKey = map_key;
                            status.push(currentTransaction);
                        }
                        catch(error){
                            console.error(error);
                        }
                    }
                    res.json(status);
                }
            })
        }
        catch(error){
            console.error(error);
            res.status(500).json({ error: error.message });
        }
    }
    async getFireData(req, res){ 
        console.log("Get fire")
        try{
            model.select_mapkey( async(error, row) => {
                if(error){
                    console.log(error);
                }
                if(row){
                    let mapkey = [];
                    for(let i = 0; i < row.length; i++){
                        let map_key = row[i].map_key;
                        try{
                            const mapKeyStatus = await axios.get(`https://firms.modaps.eosdis.nasa.gov/mapserver/mapkey_status/?MAP_KEY=${map_key}`);
                            const currentTransaction = mapKeyStatus.data;
                            currentTransaction.mapKey = map_key
                    
                            /* Map key transaction with 1 day range cost 16
                            so, 16 x 60 = 960 */
                            if(mapKeyStatus.data.current_transactions < 500 ){
                                // console.log(mapKeyStatus.data);
                                mapkey.push(mapKeyStatus.data.mapKey);
                            }
                        }
                        catch(error){
                            console.error(error);
                        }
                    }

                    let phFireData = [];
                    let filteredData = [];
                    let caviteFireData = [];
                    let lgu = ["Alfonso","Amadeo","Bacoor","Carmona","Cavite City","Dasmarinas","General Emilio Aguinaldo","General Mariano Alvarez","General Trias","Imus","Indang","Kawit","Magallanes","Maragondon","Mendez","Naic","Noveleta","Rosario","Silang","Tagaytay","Tanza","Ternate","Trece Martires"];
                    let instrument = ["MODIS_NRT", "MODIS_SP", "VIIRS_NOAA20_NRT", "VIIRS_NOAA21_NRT", "VIIRS_SNPP_NRT", "VIIRS_SNPP_SP"];
                    let date = new Date();
                    date.setDate(date.getDate() - 3);
                    // Extract year, month, and date
                    const year = date.getFullYear();
                    const month = String(date.getMonth() + 1).padStart(2, '0'); // Month is zero-based, so add 1
                    const day = String(date.getDate()).padStart(2, '0');
                    const newDateStr = `${year}-${month}-${day}`;

                    let key = mapkey[0];
                    date = newDateStr;
                    let range = 3;
                    
                    const caviteBoundary = JSON.parse(fs.readFileSync('assets/geo_json/cavite/cavite.geojson', 'utf8'));

                    for(let j = 0; j < instrument.length; j++){                        
                        /* For testing: Add Cavite latitude and longitude */
                        // const response = `country_id,latitude,longitude,bright_ti4,scan,track,acq_date,acq_time,satellite,instrument,confidence,version,bright_ti5,frp,daynight
                        // PHL,14.405229,120.914345,349.39,0.47,0.64,2024-06-04,742,N,VIIRS,n,2.0NRT,290.13,5.59,D`
                        // const dataString = response; /*  remove this after testing*/
                        
                        /* request fire data from FIRMS, uncomment this after testing */
                        const response = await axios.get(`https://firms.modaps.eosdis.nasa.gov/api/country/csv/${key}/${instrument[j]}/PHL/${range}/${date}`);
                        const dataString = response.data
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
                        if(dataArray.length > 0 ){
                            for(let k = 0; k < dataArray.length; k++){
                                phFireData.push(dataArray[k]);
                                // console.log(dataArray[k]);
                            }
                        }
                    }
                    // console.log(phFireData);
                    for(let i = 0; i < phFireData.length; i++){
                        /* Filter to get only the fire incident happened inside Imus City */
                        let longitude = phFireData[i].longitude;
                        let latitude = phFireData[i].latitude;
                        
                        let pt = turf.point([longitude, latitude]); /* location of fire */
                        let poly = turf.polygon(caviteBoundary.geometry.coordinates); /* boundary of Cavite */
                        let result = turf.booleanPointInPolygon(pt, poly); /* check if fire location is inside the Cavite Area */
        
                        if(result){
                            filteredData.push(phFireData[i]);
                        }
                    }
                    /* Add LGU */
                    for(let k = 0; k < lgu.length; k++){
                        for(let j = 0; j < filteredData.length; j++){
                            let longitude = filteredData[j].longitude;
                            let latitude = filteredData[j].latitude;

                            const lguBoundary = JSON.parse(fs.readFileSync(`assets/geo_json/lgu/${lgu[k]}.geojson`, 'utf8'));
                            let pt = turf.point([longitude, latitude]); /* location of fire */
                            let poly = turf.polygon(lguBoundary.geometry.coordinates); /* boundary of Cavite */
                            let result = turf.booleanPointInPolygon(pt, poly); /* check if fire location is inside the Cavite Area */

                            if(result){
                                filteredData[j].lgu = lgu[k];
                                caviteFireData.push(filteredData[j]);
                            }
                        }
                    }
                    // res.json(caviteFireData);
                    let filteredCaviteData = [];
                    model.verify_if_duplicates((error, row) => {
                        if (error) {
                            console.error(error);
                            return; // Exit early if there's an error
                        }
                        if (row) {
                            for (let i = 0; i < caviteFireData.length; i++) {
                                let found = false;
                                let lat = caviteFireData[i].latitude;
                                let long = caviteFireData[i].longitude;
                                let time = caviteFireData[i].acq_time;

                                for (let j = 0; j < row.length; j++) {
                                    if (lat === row[j].latitude && long === row[j].longitude && time === row[j].acq_time) {
                                        found = true;
                                        break; // Exit the loop if a match is found
                                    }
                                }
                                // If the item is not found in the row array, add it to filteredCaviteData
                                if (!found) {
                                    filteredCaviteData.push(caviteFireData[i]);
                                }
                            }

                            // res.json(filteredCaviteData)
                            // console.log(filteredCaviteData)
                            model.insert_firedata(filteredCaviteData, (error) => {
                                if(error){
                                    console.error(error);
                                }
                            });
                            // res.json()
                        }
                        res.json(filteredCaviteData);
                    });
                }
            })
        }
        catch(error) {
            res.status(500).json({ error: error.message });
        }
    }
    async getManualFireData(req, res){ 
        console.log("Manual request fire");
        try{
            let phFireData = [];
            let filteredData = [];
            let caviteFireData = [];
            let lgu = ["Alfonso","Amadeo","Bacoor","Carmona","Cavite City","Dasmarinas","General Emilio Aguinaldo","General Mariano Alvarez","General Trias","Imus","Indang","Kawit","Magallanes","Maragondon","Mendez","Naic","Noveleta","Rosario","Silang","Tagaytay","Tanza","Ternate","Trece Martires"];
            let instrument = ["MODIS_NRT", "MODIS_SP", "VIIRS_NOAA20_NRT", "VIIRS_NOAA21_NRT", "VIIRS_SNPP_NRT", "VIIRS_SNPP_SP"];
           
            let key = req.body.mapkey
            let date = req.body.date
            let range = req.body.range
            console.log(key, date, range);
            const caviteBoundary = JSON.parse(fs.readFileSync('assets/geo_json/cavite/cavite.geojson', 'utf8'));

            for(let j = 0; j < instrument.length; j++){                        
                /* For testing: Add Cavite latitude and longitude */
                // const response = `country_id,latitude,longitude,bright_ti4,scan,track,acq_date,acq_time,satellite,instrument,confidence,version,bright_ti5,frp,daynight
                // PHL,14.405229,120.914345,349.39,0.47,0.64,2024-06-04,742,N,VIIRS,n,2.0NRT,290.13,5.59,D`
                // const dataString = response; /*  remove this after testing*/
                
                /* request fire data from FIRMS, uncomment this after testing */
                const response = await axios.get(`https://firms.modaps.eosdis.nasa.gov/api/country/csv/${key}/${instrument[j]}/PHL/${range}/${date}`);
                const dataString = response.data
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
                    if(dataArray.length > 0 ){
                        for(let k = 0; k < dataArray.length; k++){
                            phFireData.push(dataArray[k]);
                            // console.log(dataArray[k]);
                        }
                    }
                }
                // console.log(phFireData);
                for(let i = 0; i < phFireData.length; i++){
                    /* Filter to get only the fire incident happened inside Imus City */
                    let longitude = phFireData[i].longitude;
                    let latitude = phFireData[i].latitude;
                    
                    let pt = turf.point([longitude, latitude]); /* location of fire */
                    let poly = turf.polygon(caviteBoundary.geometry.coordinates); /* boundary of Cavite */
                    let result = turf.booleanPointInPolygon(pt, poly); /* check if fire location is inside the Cavite Area */
    
                    if(result){
                        filteredData.push(phFireData[i]);
                    }
                }
                /* Add LGU */
                for(let k = 0; k < lgu.length; k++){
                    for(let j = 0; j < filteredData.length; j++){
                        let longitude = filteredData[j].longitude;
                        let latitude = filteredData[j].latitude;

                        const lguBoundary = JSON.parse(fs.readFileSync(`assets/geo_json/lgu/${lgu[k]}.geojson`, 'utf8'));
                        let pt = turf.point([longitude, latitude]); /* location of fire */
                        let poly = turf.polygon(lguBoundary.geometry.coordinates); /* boundary of Cavite */
                        let result = turf.booleanPointInPolygon(pt, poly); /* check if fire location is inside the Cavite Area */

                        if(result){
                            filteredData[j].lgu = lgu[k];
                            caviteFireData.push(filteredData[j]);
                        }
                    }
                }
                // res.json(caviteFireData);
                let filteredCaviteData = [];
                model.verify_if_duplicates((error, row) => {
                    if (error) {
                        console.error(error);
                        return; // Exit early if there's an error
                    }
                    if (row) {
                        for (let i = 0; i < caviteFireData.length; i++) {
                            let found = false;
                            let lat = caviteFireData[i].latitude;
                            let long = caviteFireData[i].longitude;
                            let time = caviteFireData[i].acq_time;

                            for (let j = 0; j < row.length; j++) {
                                if (lat === row[j].latitude && long === row[j].longitude && time === row[j].acq_time) {
                                    found = true;
                                    break; // Exit the loop if a match is found
                                }
                            }
                            // If the item is not found in the row array, add it to filteredCaviteData
                            if (!found) {
                                filteredCaviteData.push(caviteFireData[i]);
                            }
                        }

                        // res.json(filteredCaviteData)
                        // console.log(filteredCaviteData)
                        model.insert_firedata(filteredCaviteData, (error) => {
                            if(error){
                                console.error(error);
                            }
                        });
                        // res.json()
                    }
                    res.json(filteredCaviteData);
                });
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