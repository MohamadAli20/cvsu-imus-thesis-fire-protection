const express = require("express");
const Router = express.Router();

const UserController = require("./controllers/Users");
const FetchController = require("./controllers/FetchData");

Router.get("/", UserController.index);
Router.get("/firedata", FetchController.getFireData);

module.exports = Router;