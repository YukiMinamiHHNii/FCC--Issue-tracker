const issuesDAO = require("../daos/issuesDAO");

exports.createIssue = (req, res) => {
	issuesDAO.createIssue(req.params.projectName, req.body, result => {
		return res.send(result);
	});
};
