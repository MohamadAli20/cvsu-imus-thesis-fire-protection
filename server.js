const express = require("express");
const app = express();
const routes = require("./routes");
const path = require('path');
const axios = require('axios');
const cron = require("node-cron");
const PORT = process.env.PORT || 8080;  

/*using templates*/
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

/*serving static content*/
app.use(express.static("assets"));

// Middleware to parse JSON bodies
app.use(express.json());
// Middleware to parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));

/*Routes*/
app.use("/", routes); /* Base path*/
app.use("/api/:year", routes); /* For API endpoints */

app.use("/fire_data", routes);
app.use("/:instrument/:date/:range", routes);
app.use("/save_firedata", routes);
app.use("/insert_imus_firedata", routes);

const BASE_URL = 'https://zbe73xbmvq.ap-southeast-1.awsapprunner.com';
// const BASE_URL = 'http://localhost:8080';


// Schedule the task to run every minute
cron.schedule('* * * * *', () => {
    console.log("Running scheduled task to request fire from FIRMS...");
    axios.get(`${BASE_URL}/request`)
        .then(response => {
            console.log("Requesting fire data from FIRMS:", response.data);
        })
        .catch(error => {
            console.error("Error requesting fire:", error);
        });
});
cron.schedule('* * * * *', () => {
    console.log("Running scheduled task to monitor fire...");
    axios.get(`${BASE_URL}/api/fire_monitor`)
        .then(response => {
            console.log("Fire monitoring response:", response.data);
        })
        .catch(error => {
            console.error("Error monitoring fire:", error);
        });
});


app.listen(PORT, () => {
    console.log("Listening on port 8080");
    console.log("http://localhost:8080")
});
