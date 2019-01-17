const express = require("express"),
	bodyParser = require("body-parser"),
	methodOver = require("method-override"),
	dotenv = require("dotenv").load(),
	helmet = require("helmet"),
	cors = require("cors"),
	connection = require("./src/utils/connection"),
	issuesRouter = require("./src/routers/issuesRouter"),
	issuesViewerRouter = require("./src/routers/issuesViewerRouter");

const app = express();

connection.handleConnection();

app.set("view engine", "pug");
app.use(express.static(__dirname + "/public"));
//app.use(bodyParser.json()); //Use it if you need to allow json from something that is not a form
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
	methodOver((req, res) => {
		if (req.body._method) {
			let method = req.body._method;
			delete req.body._method;
			return method;
		}
	})
);
app.use(helmet.xssFilter());
app.use(helmet.noSniff());
app.use(cors());

app.use("/api/issue-tracker", issuesRouter);

app.use("/", issuesViewerRouter);

app.use((req, res) => {
	res
		.status(404)
		.type("text")
		.send("Not found (will improve this later :v)");
});

app.listen(process.env.SERVER_PORT);
console.log(`App listening on port ${process.env.SERVER_PORT}`);

module.exports = app;
