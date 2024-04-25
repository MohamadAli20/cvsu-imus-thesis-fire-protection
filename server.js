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

/*Routes*/
app.use("/", routes);
app.use("/firedata", routes);

app.listen(8080, () => {
    console.log("Listening on port 8080");
    console.log("http://localhost:8080")
});
