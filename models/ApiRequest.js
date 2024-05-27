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
    
        for (let i = 0; i < years.length; i++) {
            query += `(SELECT * FROM cavite${years[i]}`;
            
            // Construct the WHERE clause
            if (lgu && instrument === undefined) {
                query += ` WHERE name_of_place = ?`;
                values.push(lgu);
            } else if (instrument && lgu === undefined) {
                query += ` WHERE instrument = ?`;
                values.push(instrument);
            } else if (lgu && instrument) {
                query += ` WHERE name_of_place = ? AND instrument = ?`;
                values.push(lgu, instrument);
            }
    
            query += `)`;
    
            // Add UNION ALL except after the last SELECT statement
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
    
    select_by_year(year, lgu, callback){
        // Query builder
        let query = `SELECT * FROM cavite${year}`;
        if(lgu !== undefined){
            query += ` WHERE name_of_place = ?`;
        }
        
        this.connection.query(
            query,
            [ lgu ],
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
