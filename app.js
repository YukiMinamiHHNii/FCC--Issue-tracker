const express = require("express"),
	bodyParser = require("body-parser"),
	methodOver = require("method-override"),
	dotenv = require("dotenv").load(),
	helmet = require("helmet"),
	issuesRouter = require("./src/routers/issuesRouter");

const app = express();

app.set("view engine", "pug");
app.use(express.static(__dirname + "/public"));
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

app.use("/api/issues", issuesRouter);

app.use("/", (req, res) => {
	res.render("index");
});

app.listen(process.env.SERVER_PORT);
console.log(`App listening on port ${process.env.SERVER_PORT}`);