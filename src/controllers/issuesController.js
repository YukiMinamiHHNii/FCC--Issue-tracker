const issuesDAO = require("../daos/issuesDAO");

exports.createProject = (req, res) => {
	issuesDAO
		.createProject(req.body.projectName)
		.then(result => {
			return res.json(result);
		})
		.catch(err => {
			return res.json(err);
		});
};


exports.readProjects = (req, res) => {
	issuesDAO
		.readProjects()
		.then(result => {
			return res.json(result);
		})
		.catch(err => {
			return res.json(err);
		});
};

exports.createIssue = (req, res) => {
	issuesDAO
		.createIssue(req.params.projectName, req.body)
		.then(result => {
			return res.json(result);
		})
		.catch(err => {
			return res.json(err);
		});
};

exports.readIssues = (req, res) => {
	issuesDAO
		.readIssues(req.params.projectName, req.query)
		.then(result => {
			return res.json(result);
		})
		.catch(err => {
			return res.json(err);
		});
};

exports.updateIssue = (req, res) => {
	issuesDAO
		.updateIssue(req.params.projectName, req.body)
		.then(result => {
			return res.json(result);
		})
		.catch(err => {
			return res.json(err);
		});
};

exports.deleteIssue = (req, res) => {
	issuesDAO
		.deleteIssue(req.params.projectName, req.query)
		.then(result => {
			return res.json(result);
		})
		.catch(err => {
			res.json(err);
		});
};
