const express = require("express");
const Router = express.Router();

const UserController = require("./controllers/Users");
const FetchController = require("./controllers/FetchData");
const RecordController = require("./controllers/Records");
const ApiController = require("./controllers/ApiRequests");

Router.get("/", UserController.index);
Router.get("/fire_data", UserController.fire_data);
Router.get("/data_logging", UserController.data_logging);
Router.post("/retrieve_firedata", RecordController.get_all_firedata);
Router.get("/current_transaction", FetchController.getCurrentTransaction);
Router.get("/request_firedata", FetchController.requestFireData);
Router.get("/check_mapkey", RecordController.get_transaction_amount);
Router.get("/:instrument/:date/:range", FetchController.getFireData);
Router.get("/save_firedata", RecordController.store_firedata);
Router.get("/insert_imus_firedata", RecordController.store_imus_firedata);
// Router.get("/api/:name_of_place", ApiController.fetchFireData);
Router.get("/request", RecordController.getFireData);
Router.post("/request", RecordController.getFireData);

/* For the implementation of the algorthims */
Router.get("/api/fire_monitor", ApiController.detect_fire);
Router.get("/api/fire_frequency", ApiController.get_fire_frequency);
Router.get("/api/fire_risk_level", ApiController.get_risk_level);

/* API endpoints */
Router.get("/api/cavite_firedata", ApiController.get_cavite_firedata);
Router.get("/api/:year", ApiController.get_by_year);

module.exports = Router;