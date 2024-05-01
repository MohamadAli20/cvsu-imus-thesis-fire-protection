const express = require("express");
const Router = express.Router();

const UserController = require("./controllers/Users");
const FetchController = require("./controllers/FetchData");
const RecordController = require("./controllers/Records");

Router.get("/", UserController.index);
Router.get("/fire_data", UserController.fire_data);
Router.get("/:instrument/:date/:range", FetchController.getFireData);
Router.get("/save_firedata", RecordController.store_firedata);
Router.get("/insert_imus_firedata", RecordController.store_imus_firedata);

module.exports = Router;