const express = require("express"),
			router = express.Router(),
			issuesController = require("../controllers/issuesController");

router.post("/issues/:projectName", issuesController.createIssue);

router.put("/issues/:projectName", (req, res) => {
	res.json({ method: "PUT", status: "connected!" });
});

router.delete("/issues/:projectName", (req, res) => {
	res.json({ method: "DELETE", status: "connected!" });
});

router.get("/issues/:projectName", (req, res) => {
	res.json({ method: "GET", status: req.params });
});

module.exports = router;
