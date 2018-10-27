const mongoose = require("mongoose"),
	Project = require("../models/projectModel"),
	Issue = require("../models/issueModel"),
	dotenv = require("dotenv").load();

function handleConnection(connected) {
	mongoose.connect(
		process.env.MONGO_DB_CONNECTION,
		error => {
			return error ? connected(false, error) : connected(true);
		}
	);
}

function saveProject(project, issueId, result) {
	project.issues.push(issueId);
	project.save((err, savedProj) => {
		return err
			? result({ status: "Error while saving issue to project", error: error }) //Remove error later
			: result(savedProj);
	});
}

exports.createIssue = (projectName, issueData, result) => {
	handleConnection((connected, error) => {
		if (!connected) {
			return result({
				status: `Error while retrieving ${projectName} issues`,
				error: error //Remove this later
			});
		} else {
			Project.findOne({ projectName: projectName }, (err, project) => {
				let projData = project
					? project
					: new Project({
							projectName: projectName
					  });
				new Issue(issueData).save((err, savedIssue) => {
					if (err) {
						return result({
							status: "Error while saving issue... are you missing fields?",
							error: error
						}); //Remove error later
					} else {
						saveProject(projData, savedIssue._id, savedProj => {
							return result(savedIssue);
						});
					}
				});
			});
		}
	});
};
