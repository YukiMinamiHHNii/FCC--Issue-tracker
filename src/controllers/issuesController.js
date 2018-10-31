const issuesDAO = require("../daos/issuesDAO");

exports.createIssue = (req, res) => {
	issuesDAO.createIssue(req.params.projectName, req.body, result => {
		return res.json(result);
	});
};

exports.updateIssue = (req, res) => {
	issuesDAO.updateIssue(req.params.projectName, req.body, result=>{
		return res.json(result);
	});
};

exports.deleteIssue= (req, res)=>{
	issuesDAO.deleteIssue(req.params.projectName, req.body, result=>{
		return res.json(result);
	})
}
