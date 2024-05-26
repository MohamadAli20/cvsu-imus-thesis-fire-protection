const express = require("express");
const app = express();
const routes = require("./routes");
const path = require('path');
const axios = require('axios');

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
app.use("/", routes);
app.use("/fire_data", routes);
app.use("/:instrument/:date/:range", routes);
app.use("/save_firedata", routes);
app.use("/insert_imus_firedata", routes);

app.listen(8080, () => {
    console.log("Listening on port 8080");
    console.log("http://localhost:8080")
});
