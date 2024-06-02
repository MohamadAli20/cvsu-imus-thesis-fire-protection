const model = require("../models/User");

class Users{
    /*render view files*/
    index(req, res){
        res.render("index");
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
        const { username, email, password, confirmPassword } = req.body;
        let alertMessage = [];

        /* Form validation */ 
        if(username === "" || email === "" || password === "" || confirmPassword === ""){
            alertMessage.push("Fill up all information");
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if(email !== "" && !emailRegex.test(email)) {
            alertMessage.push("Invalid email format");
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
    authenticate_account(req, res){
        
    }
}
module.exports = new Users();

