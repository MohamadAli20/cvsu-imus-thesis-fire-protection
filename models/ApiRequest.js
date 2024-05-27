const mysql = require('mysql');
const config = require('../config');

class ApiRequest{
    constructor(){
        this.connection = mysql.createConnection(config);
    }
    select_by_lgu(year, lgu, callback){
        

        // Query builder

        this.connection.query(
            `SELECT * FROM cavite${year} WHERE name_of_place = ?`,
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
