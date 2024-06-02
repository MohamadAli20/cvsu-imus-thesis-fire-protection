const mysql = require('mysql');
const config = require('../config');
const bcrypt = require("bcryptjs");

class User{
    constructor(){
        this.connection = mysql.createConnection(config);
    }
    check_username(username){
        return new Promise((resolve, reject) => {
            this.connection.query(
                "SELECT * FROM users WHERE username = ?",
                [username],
                (error, row) => {
                    if (error) {
                        return reject(error);
                    }
                    resolve(row);
                }
            );
        });
    }
    check_email(email){
        return new Promise((resolve, reject) => {
            this.connection.query(
                "SELECT * FROM users WHERE email = ?",
                [email],
                (error, row) => {
                    if (error) {
                        return reject(error);
                    }
                    resolve(row);
                }
            );
        });
    }
    insert_account(info, callback){
        const username = info.username;
        const email = info.username;
        const password = info.password;

        /*hashing password*/
        const passwordHash = bcrypt.hashSync(password, 10);
        /*get current date and time*/
        const date = new Date();
        const today = `${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;

        this.connection.query(
            "INSERT INTO users(username, email, password, created_at) VALUES(?,?,?,?)",
            [ username, email, passwordHash, today],
            (error) => {
                callback(error);
            }
        )
    }
    check_username(account){
        return new Promise((resolve, reject) => {
            this.connection.query(
                "SELECT * FROM users WHERE username = ?",
                [account.username],
                (error, row) => {
                    if(error){
                        return reject(error);
                    }
                    if(row.length > 0){
                        let isVerified = bcrypt.compareSync(account.password, row[0].password);
                        if(isVerified){
                            resolve("success");
                        }
                        if(!isVerified){
                            resolve("failed");
                        }
                    }
                    else{
                        resolve("failed");
                    }
                }
            );
        });
    }
}

module.exports = new User();