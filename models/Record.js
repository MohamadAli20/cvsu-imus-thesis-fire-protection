const mysql = require('mysql');
const turf = require('@turf/turf');
const config = require('../config');

class Record{
    constructor(){
        this.connection = mysql.createConnection(config);
    }
    printPlace(req, res){}
    /* Imus Fire Data query */
    select_firedata(callback){
        this.connection.query(
            'SELECT * FROM imus_data',
            (error, row) => {
                if(error){
                    console.error(error);
                    callback(error, null);
                }
                if(row){
                    console.log(row);
                    callback(null, row);
                }
            }
        )
    }

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
