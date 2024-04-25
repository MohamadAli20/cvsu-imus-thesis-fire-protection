// // const mysql = require('mysql');
// // const bcrypt = require("bcryptjs");

// class Student{
//     constructor(){
//         this.connection = mysql.createConnection({
//             host: 'localhost',
//             user: 'root',
//             password: '',
//             database: 'sheetsoundsynth'
//         });
//     }
//     connect(){
//         this.connection.connect((err) => {
//             if (err) {
//                 console.error('Error connecting to database:', err);
//                 return;
//             }
//             console.log('Connected to database.');
//         });
//     }
//     register_account(account_info, callback){
//         this.verify_account(account_info, (error, verified, information) => {
//             if(error){
//                 console.error(error);
//                 return;
//             }
//             if(information === false){
//                 /*hashing password*/
//                 const passwordHash = bcrypt.hashSync(account_info.password, 10);
//                 /*get current date and time*/
//                 const date = new Date();
//                 const today = `${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;

//                 this.connection.query(
//                     'INSERT INTO users(email, username, hashed_password, created_at) VALUES(?,?,?,?)', 
//                     [
//                         account_info.email,
//                         account_info.username,
//                         passwordHash,
//                         today
//                     ],
//                     (error) => {
//                         if(error){
//                             console.error(error);
//                             callback(error);
//                             return;
//                         }
//                         callback(false);
//                     }
//                 );
//             }
//             else{
//                 callback(true);
//             }
//         });
//     }
//     verify_account(credentials, callback){
//         this.connection.query(
//             "SELECT * FROM users WHERE email = ?",
//             [ credentials.login_email ],
//             (error, row) => {
//                 let verified = false;
//                 if(error){
//                     console.error(error);
//                     callback(error, null);
//                     return;
//                 }
//                 if(row.length !== 0){
//                     verified = bcrypt.compareSync(credentials.login_password, row[0].hashed_password);
//                     const information = {
//                         id: row[0].id,
//                         username: row[0].username
//                     }
//                     callback(null, verified, information);
//                 }
//                 else{
//                     callback(null, verified, false);
//                 }
//             });
//     }
//     insert_music(music_info, callback){
//         console.log(music_info);
//         const date = new Date();
//         const today = `${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;

//         this.connection.query(
//             "INSERT INTO musics(user_id, image_path, midi_path, created_at) VALUES(?,?,?,?)",
//             [ music_info.userId, music_info.imagePath, music_info.midiPath, today ],
//             (error) => {
//                 if(error){
//                     console.error(error);
//                     callback(error);
//                     return;
//                 }
//                 callback(false);
//             }
//         );
//     }
//     select_music(userId, callback){
//         this.connection.query(
//             "SELECT * FROM musics WHERE user_id = ?",
//             [ userId ],
//             (error, data) => {
//                 if(error){
//                     console.error(error);
//                     callback(error, null);
//                     return;
//                 }
//                 if(data){
//                     callback(null, data);
//                 }
//             }
//         )
//     }
//     delete_music(musicId, callback){
//         this.connection.query(
//             "DELETE FROM musics WHERE id = ?",
//             [ musicId ],
//             (error) => {
//                 if(error){
//                     console.error(error);
//                     callback(error, null);
//                     return;
//                 }
//             }
//         )
//     }
//     end(){
//         this.connection.end((err) => {
//             if (err) {
//                 console.error('Error ending connection:', err);
//                 return;
//             }
//             console.log('Connection closed.');
//         });
//     }
// }

// module.exports = new Student();
