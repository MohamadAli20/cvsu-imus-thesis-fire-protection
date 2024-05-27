const mysql = require('mysql');
const config = require('../config');

class ApiRequest{
    constructor(){
        this.connection = mysql.createConnection(config);
    }
    select_cavite_firedata(lgu, callback){
        let years = [ 2020, 2021, 2022, 2023, 2024 ];
        let values = [];
        let query = "";

        for(let i = 0; i < years.length; i++){
            values.push(lgu);
            query += `(SELECT * FROM cavite${years[i]} `
            
            if(lgu){
                query += ` WHERE name_of_place = ?`
            }
            if(i < years.length - 1){
                query += `) 
                UNION ALL `
            }
        }
        query += ")";
        console.log(query);
        this.connection.query(
            query,
            values,
            (error, row) => {
                if(error){
                    callback(error, null);
                }
                if(row){
                    callback(null, row);
                }
            }
        )
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
