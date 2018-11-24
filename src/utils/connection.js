const mongoose = require("mongoose"),
	dotenv = require("dotenv").load();

exports.handleConnection = () => {
	mongoose.connect(
		process.env.MONGO_DB_CONNECTION,
		{ useNewUrlParser: true }
	);

	mongoose.connection.on("connected", () => {
		console.log("App successfully connected to DB");
	});
	mongoose.connection.on("error", err => {
		console.log(
			`Error while connecting to DB... aborting application. \nCaused by: ${err}`
		);
	});
	mongoose.connection.on("disconnected", () => {
		console.log("App has been disconnected from DB");
	});
};
