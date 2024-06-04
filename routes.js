const express = require("express");
const Router = express.Router();

const UserController = require("./controllers/Users");
const FetchController = require("./controllers/FetchData");
const RecordController = require("./controllers/Records");
const ApiController = require("./controllers/ApiRequests");
const User = require("./models/User");

/* Endpoints to render pages */
Router.get("/", UserController.index);
Router.get("/fire_data", UserController.fire_data);
Router.get("/data_logging", UserController.data_logging);
Router.get("/api_documentation", UserController.api_documentation);
Router.get("/register", UserController.register)
Router.get("/frequent_ask_questions", UserController.frequent_ask_questions);

/* Endpoints to execute CRUD operation*/
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
/* Register and login account */
Router.post("/account_register", UserController.add_account); 
Router.post("/account_login", UserController.retrieve_account)

/* API endpoints */
/* For the implementation of the algorithms */
Router.get("/api/fire_monitor", ApiController.detect_fire);
Router.get("/api/fire_frequency", ApiController.get_fire_frequency);
Router.get("/api/fire_risk_level", ApiController.get_risk_level);

Router.get("/api/cavite_firedata", ApiController.get_cavite_firedata);
Router.get("/api/:year", ApiController.get_by_year);

module.exports = Router;