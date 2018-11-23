const issuesDAO = require("../daos/issuesDAO");

exports.viewIssues = (req, res) => {
	issuesDAO
		.readIssues(req.params.projectName, req.body)
		.then(result => {
			res.render("issuesViewer", { issues: result });
		})
		.catch(err => {
			res.render("issuesViewer", { issues: [] });
		});
};
