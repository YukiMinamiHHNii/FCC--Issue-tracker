const express = require("express"),
			router = express.Router(),
			issuesController = require("../controllers/issuesController");

router.post("/:projectName", issuesController.createIssue);

router.put("/:projectName", (req, res) => {
	res.json({ method: "PUT", status: "connected!" });
});

router.delete("/:projectName", (req, res) => {
	res.json({ method: "DELETE", status: "connected!" });
});

router.get("/:projectName", (req, res) => {
	res.json({ method: "GET", status: req.params });
});

module.exports = router;
