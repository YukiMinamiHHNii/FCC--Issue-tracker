const express = require("express"),
			router = express.Router(),
			issuesController = require("../controllers/issuesController");

router.post("/issues/:projectName", issuesController.createIssue);

router.put("/issues/:projectName", issuesController.updateIssue);

router.delete("/issues/:projectName", issuesController.deleteIssue);

router.get("/issues/:projectName", (req, res) => {
	res.json({ method: "GET", status: req.params });
});

module.exports = router;
