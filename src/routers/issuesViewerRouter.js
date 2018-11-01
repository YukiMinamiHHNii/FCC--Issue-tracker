const express = require("express"),
	router = express.Router(),
	issuesViewerController = require("../controllers/issuesViewerController");

router.get("/", (req, res) => {
	res.render("index");
});

router.get("/:projectName", issuesViewerController.viewIssues);

module.exports = router;
