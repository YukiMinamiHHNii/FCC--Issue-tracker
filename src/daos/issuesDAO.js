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

exports.createIssue = (projectName, issueData, result) => {
	handleConnection((connected, error) => {
		if (!connected) {
			return result({
				status: `Error while retrieving ${projectName} issues`,
				error: error //Remove this later
			});
		} else {
			checkProject({ projectName: projectName }, (err, dbRes) => {
				if (err) {
					return result(dbRes);
				} else {
					let projData = dbRes
						? dbRes
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
				}
			});
		}
	});
};

function checkProject(projectQuery, result) {
	Project.findOne(projectQuery).exec((err, project) => {
		if (err) {
			return result(true, {
				status: `Error while querying for ${projectName}`,
				error: err //Remove this later
			});
		} else {
			return project ? result(false, project) : result(false, false);
		}
	});
}

function saveProject(project, issueId, result) {
	project.issues.push(issueId);
	project.save((err, savedProj) => {
		return err
			? result({ status: "Error while saving issue to project", error: error }) //Remove error later
			: result(savedProj);
	});
}

exports.updateIssue = (projectName, updateIssue, result) => {
	let checkData = checkUpdateData(updateIssue.issue_data);
	if (!checkData) {
		return result({ status: "No updated field sent" });
	} else {
		handleConnection((connected, error) => {
			if (!connected) {
				return result({
					status: `Error while retrieving ${projectName} issues`,
					error: error //Remove this later
				});
			} else {
				checkProject({
					projectName: projectName,
					issues: updateIssue.issue_id
				}, (err, dbRes) => {
					if (err) {
						return result(dbRes);
					} else {
						if (!dbRes) {
							return result({
								status: `Issue with id: ${updateIssue.issue_id} do not exist in ${projectName}`
							});
						} else {
							Issue.findOneAndUpdate(
								{ _id: updateIssue.issue_id },
								{ $set: checkData },
								{ new: true }
							).exec((err, updatedIssue) => {
								return err
									? result({
											status: `Could not update ${updateIssue.issue_id}`,
											error: err //Remove this later
									  })
									: result({ status: "Successfully updated" });
							});
						}
					}
				});
			}
		});
	}
};

function checkUpdateData(updateData) {
	let result = { updated_on: new Date() };
	for (let key in updateData) {
		if (updateData[key]) {
			result[key] =
				key === "open" && updateData[key] === "on" ? false : updateData[key];
		}
	}
	return Object.keys(result).length > 1 ? result : false;
}
