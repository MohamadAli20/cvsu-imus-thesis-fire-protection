const mysql = require('mysql');
const config = require('../config');

class ApiRequest{
    constructor(){
        this.connection = mysql.createConnection(config);
    }
    select_cavite_firedata(obj, callback) {
        let years = [2020, 2021, 2022, 2023, 2024];
        let values = [];
        let query = "";
        let lgu = obj.lgu;
        let instrument = obj.instrument;
        let confidence = obj.confidence;
    
        for (let i = 0; i < years.length; i++) {
            query += `(SELECT * FROM cavite${years[i]}`;
            
            if (lgu && !instrument && !confidence) {
                query += ` WHERE name_of_place = ?`;
                values.push(lgu);
            } else if (instrument && !lgu && !confidence) {
                query += ` WHERE instrument = ?`;
                values.push(instrument);
            } else if (confidence && !lgu && !instrument) {
                query += ` WHERE confidence >= ?`;
                values.push(confidence);
            } else if (lgu && instrument && !confidence) {
                query += ` WHERE name_of_place = ? AND instrument = ?`;
                values.push(lgu, instrument);
            } else if (lgu && confidence && !instrument) {
                query += ` WHERE name_of_place = ? AND confidence >= ?`;
                values.push(lgu, confidence);
            } else if (instrument && confidence && !lgu) {
                query += ` WHERE instrument = ? AND confidence >= ?`;
                values.push(instrument, confidence);
            } else if (lgu && instrument && confidence) {
                query += ` WHERE name_of_place = ? AND instrument = ? AND confidence >= ?`;
                values.push(lgu, instrument, confidence);
            }
    
            query += `)`;
    
            /* Add UNION ALL except after the last SELECT statement */
            if (i < years.length - 1) {
                query += ` UNION ALL `;
            }
        }
    
        console.log(query);
        this.connection.query(query, values, (error, rows) => {
            if (error) {
                callback(error, null);
                return;
            }
            callback(null, rows);
        });
    }
    select_by_year(obj, callback){
        let values = [];
        let year = obj.year;
        let lgu = obj.lgu;
        let instrument = obj.instrument;
        let confidence = obj.confidence;

        let query = `SELECT * FROM cavite${year}`;
        if(lgu && !instrument && !confidence){
            query += ` WHERE name_of_place = ?`;
            values.push(lgu);
        }
        else if(instrument && !lgu && !confidence){
            query += ` WHERE instrument = ?`;
            values.push(instrument);
        }
        else if(confidence && !lgu && !instrument){
            query += ` WHERE confidence >= ?`;
            values.push(confidence);
        }
        else if(lgu && confidence && !instrument){
            query += ` WHERE name_of_place = ? AND confidence >= ?`;
            values.push(lgu, confidence);
        }
        else if(lgu && !confidence && instrument){
            query += ` WHERE name_of_place = ? AND instrument = ?`;
            values.push(lgu, instrument);
        }
        else if(!lgu && confidence && instrument){
            query += ` WHERE instrument = ? AND confidence >= ?`;
            values.push(instrument, confidence);
        }
        else if(lgu && confidence && instrument){
            query += ` WHERE name_of_place = ? AND instrument = ? AND confidence >= ?`;
            values.push(lgu, instrument, confidence);
        }
        
        this.connection.query(
            query,
            values,
            (error, row) => {
                if(error){
                    callback(error, null);
                }
                if(row){
                    callback(null, row)
                }
            }
        )
    }

}

module.exports = new ApiRequest();
