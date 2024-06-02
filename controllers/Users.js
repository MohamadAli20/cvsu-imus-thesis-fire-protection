const model = require("../models/User");
const session = require('express-session');
class Users{
    /*render view files*/
    index(req, res){
        res.render('index');
    }
    fire_data(req, res){
        res.render("fire_data");
    }
    data_logging(req, res){
        res.render("data_logging");
    }
    api_documentation(req, res){
        res.render("api_documentation")
    }
    register(req, res){
        res.render("register");
    }
    // 
    async add_account(req, res){
        const adminCode = "BFP12345";
        const { username, email, code, password, confirmPassword } = req.body;
        let alertMessage = [];

        /* Form validation */ 
        if(username === "" || email === "" || code === "" || password === "" || confirmPassword === ""){
            alertMessage.push("Fill up all information");
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if(email !== "" && !emailRegex.test(email)) {
            alertMessage.push("Invalid email format");
        }
        if(code !== "" && code !== adminCode){
            alertMessage.push("Code is incorrect");
        }
        if(password !== confirmPassword && password !== "" && confirmPassword !== ""){
            alertMessage.push("Passwords do not match");
        }
        const minPasswordLength = 8;
        const maxPasswordLength = 20;
        if(password !== "" && confirmPassword !== "" && password.length < minPasswordLength || password.length > maxPasswordLength){
            alertMessage.push(`Password must be between ${minPasswordLength} and ${maxPasswordLength} characters`);
        }
        if(alertMessage.length === 0){
            console.log("Check if exists");
            try{
                /*if found return array with elements, meaning it is already exists */ 
                const usernameArr = await model.check_username(username);
                const emailArrr = await model.check_email(email);
                console.log(usernameArr)
                console.log(emailArrr)
                if(usernameArr.length > 0) {
                    alertMessage.push("Username already exists");
                }
                if(emailArrr.length > 0){
                    alertMessage.push("Email already exists");
                }
            }catch(error){
                console.error(error);
            }
            /* if credential is unique */ 
            if(alertMessage.length === 0){
                model.insert_account(req.body, (error) => {
                    if(error){
                        console.error(error);
                    }
                })
            }
        }
        res.json(alertMessage);
    }
    async retrieve_account(req, res){
        const { username, password } = req.body;
        let alertMessage = [];

        /* Form validation */ 
        if(username === "" || password === ""){
            alertMessage.push("Fill up all information");
        }
        if(username !== "" && password !== ""){
            try{
                /*if found return array with elements, meaning it is already exists */ 
                const result = await model.check_account(req.body);
                // const emailArrr = await model.check_email(email);
                if(result === "failed"){
                    alertMessage.push("Login failed");
                }
                if(result === "success"){
                    req.session.username = username;
                    return res.json({username});
                }
            }catch(error){
                console.error(error);
            }
        }
        

        res.json(alertMessage);
    }
}
module.exports = new Users();

