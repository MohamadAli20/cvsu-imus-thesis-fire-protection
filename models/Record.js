const mysql = require('mysql');
const config = require('../config');

class Record{
    constructor(){
        this.connection = mysql.createConnection(config);
    }
    /* Imus fire data query */
    select_firedata(details, callback){
        let values = [];
        let year = details.year;
        let query = `SELECT * FROM cavite${year}`;
        let orderBy = ` ORDER BY acq_date DESC`;

        if(details.confidence === ''){
            query += ` WHERE confidence >= ?`;
            values.push(0);
        }
        if(details.confidence !== ''){
            query += ` WHERE confidence >= ?`;
            values.push(details.confidence);
        }
        if(details.municipalityCity !== ''){
            query += ` AND name_of_place = ?`;
            values.push(details.municipalityCity);
        }
        if(details.instrument !== ''){
            query += ` AND instrument = ?`;
            values.push(details.instrument);
        }
        query += orderBy;
        // console.log(query);
        this.connection.query(
            query,
            values,
            (error, row) => {
                if(error){
                    console.error(error);
                    callback(error, null);
                }
                if(row){
                    callback(null, row);
                }
            }
        )
    }
    verify_if_duplicates(callback){
        // for(let i = 0; i < caviteFireData.length; i++){
        //     let lat = caviteFireData[i].latitude;
        //     let long = caviteFireData[i].longitude
        //     let time = caviteFireData[i].acq_time;
            
            this.connection.query(
                `SELECT * FROM cavite2024`,
                (error, row) => {
                    if(error){
                        callback(error, null);
                    }
                    if(row && row.length > 0){ // Check if has any rows
                        callback(null, row);
                    }
                }
            )
        // }
    }
    

    /*
    * Below methods are use to store fire data from FIRMS record from 2020 to May 25, 2024 
    */
    insert_firedata(firedata, callback){
        const date = new Date();
        const today = `${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;

        for(let i = 0; i < firedata.length; i++){
            this.connection.query(
                'INSERT INTO cavite2024(latitude, longitude, name_of_place, acq_date, acq_time, track, brightness, satellite, instrument, confidence, daynight, version, bright_t31, scan, frp, created_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)', 
                [
                    firedata[i].latitude,
                    firedata[i].longitude,
                    firedata[i].lgu,
                    firedata[i].acq_date,
                    firedata[i].acq_time,
                    firedata[i].track,
                    firedata[i].brightness,
                    firedata[i].satellite,
                    firedata[i].instrument,
                    firedata[i].confidence,
                    firedata[i].daynight,
                    firedata[i].version,
                    firedata[i].bright_t31,
                    firedata[i].scan,
                    firedata[i].frp,
                    today
                ],
                (error) => {
                    if(error){
                        console.error(error);
                        callback(error);
                        return;
                    }
                    callback(false);
                }
            );
        }
    }
    insert_imus_firedata(imusFireData, callback){
        const date = new Date();
        const today = `${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
        
        for(let i = 0; i < imusFireData.length; i++){
            this.connection.query(
                'INSERT INTO imus_data(latitude, longitude, acq_date, acq_time, track, brightness, satellite, instrument, confidence, daynight, version, bright_t31, scan, frp, created_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)', 
                [
                    imusFireData[i].latitude,
                    imusFireData[i].longitude,
                    imusFireData[i].acq_date,
                    imusFireData[i].acq_time,
                    imusFireData[i].track,
                    imusFireData[i].brightness,
                    imusFireData[i].satellite,
                    imusFireData[i].instrument,
                    imusFireData[i].confidence,
                    imusFireData[i].daynight,
                    imusFireData[i].version,
                    imusFireData[i].bright_t31,
                    imusFireData[i].scan,
                    imusFireData[i].frp,
                    today
                ],
                (error) => {
                    if(error){
                        callback(error);
                        console.log(error);
                    }
                }
            )
        }
    }
}

module.exports = new Record();
