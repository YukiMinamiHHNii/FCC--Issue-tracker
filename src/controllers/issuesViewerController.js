const issuesDAO = require("../daos/issuesDAO");

exports.viewIssues = (req, res) => {
	issuesDAO.readIssues(req.params.projectName, req.body, result => {
		res.render("issuesViewer", { issues: result });
	});
};
