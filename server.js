const express = require("express");
const app = express();
const routes = require("./routes");
const path = require('path');
const axios = require('axios');
const PORT = process.env.POST || 8080;  

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

app.listen(PORT, () => {
    console.log("Listening on port 8080");
    console.log("http://localhost:8080")
});
