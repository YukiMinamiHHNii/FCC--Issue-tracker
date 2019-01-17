const express = require("express"),
	router = express.Router(),
	issuesController = require("../controllers/issuesController");

router.post("/projects", issuesController.createProject);

router.get("/projects", issuesController.readProjects);

router.post("/issues/:projectName", issuesController.createIssue);

router.get("/issues/:projectName", issuesController.readIssues);

router.put("/issues/:projectName", issuesController.updateIssue);

router.delete("/issues/:projectName", issuesController.deleteIssue);

module.exports = router;
