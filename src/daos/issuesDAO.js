const mongoose = require("mongoose"),
	Project = require("../models/projectModel"),
	Issue = require("../models/issueModel");

const filters = [""];

exports.createIssue = (projectName, issueData) => {
	return new Promise((resolve, reject) => {
		checkProject({ projectName: projectName })
			.then(foundProject => {
				let projData = foundProject
					? foundProject
					: new Project({
							projectName: projectName
					  });
				return saveIssueData(issueData, projData);
			})
			.then(result => {
				resolve({
					_id: result._id,
					issue_title: result.issue_title,
					issue_text: result.issue_text,
					created_on: result.created_on,
					updated_on: result.updated_on,
					created_by: result.created_by,
					assigned_to: result.assigned_to,
					open: result.open,
					status_text: result.status_text
				});
			})
			.catch(err => {
				reject(err);
			});
	});
};

function checkProject(projectData) {
	return new Promise((resolve, reject) => {
		Project.findOne(projectData)
			.exec()
			.then(foundProject => {
				resolve(foundProject);
			})
			.catch(err => {
				reject({
					status: `Error while querying for ${projectData.projectName}`,
					error: err.message
				});
			});
	});
}

function saveIssueData(issueData, projData) {
	return new Promise((resolve, reject) => {
		createIssueEntry(issueData)
			.then(savedIssue => {
				return saveProject(projData, savedIssue);
			})
			.then(entry => {
				resolve(entry);
			})
			.catch(err => {
				reject(err);
			});
	});
}

function createIssueEntry(issueData) {
	return new Promise((resolve, reject) => {
		Issue(issueData)
			.save()
			.then(savedIssue => {
				resolve(savedIssue);
			})
			.catch(err => {
				reject({
					status: "Error while saving issue... are you missing fields?",
					error: err.message
				});
			});
	});
}

function saveProject(project, savedIssue) {
	return new Promise((resolve, reject) => {
		project.issues.push(savedIssue._id);
		project
			.save()
			.then(savedProj => {
				resolve(savedIssue);
			})
			.catch(err => {
				reject({
					status: "Error while saving issue to project",
					error: err.message
				});
			});
	});
}

exports.readIssues = (projectName, filters) => {
	return new Promise((resolve, reject) => {
		checkOpenFilter(filters);
		getIssuesByProject(projectName, filters)
			.then(foundIssues => {
				resolve(foundIssues);
			})
			.catch(err => {
				reject(err);
			});
	});
};

function checkOpenFilter(filters) {
	if (filters.hasOwnProperty("open")) {
		switch (filters["open"].toLowerCase()) {
			case "true":
				filters["open"] = true;
				break;
			case "false":
				filters["open"] = false;
				break;
		}
	}
}

function getIssuesByProject(project, filters) {
	return new Promise((resolve, reject) => {
		Project.findOne({ projectName: project })
			.populate({ path: "issues", select: { __v: 0 }, match: filters })
			.exec()
			.then(foundProject => {
				if (foundProject) {
					resolve(foundProject.issues);
				} else {
					resolve({});
				}
			})
			.catch(err => {
				reject({
					status: "Error while reading issues",
					error: err
				});
			});
	});
}

exports.updateIssue = (projectName, updateIssue) => {
	return new Promise((resolve, reject) => {
		let checkData = checkUpdateData(updateIssue.issue_data);
		if (!checkData) {
			reject({ status: "No updated field sent" });
		} else {
			checkIssueInProject({
				projectName: projectName,
				issues: updateIssue.issue_id
			})
				.then(() => {
					return updateIssueData(updateIssue.issue_id, checkData);
				})
				.then(result => {
					resolve(result);
				})
				.catch(err => {
					reject(err);
				});
		}
	});
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

function checkIssueInProject(queryObj) {
	return new Promise((resolve, reject) => {
		checkProject(queryObj)
			.then(foundData => {
				if (foundData) {
					resolve();
				} else {
					reject({
						status: `Issue ${queryObj.issues} does not exist on project ${
							queryObj.projectName
						}`
					});
				}
			})
			.catch(err => {
				reject({
					status: `Error while checking issues in project ${
						queryObj.projectName
					}`,
					error: err.error
				});
			});
	});
}

function updateIssueData(issueId, checkData) {
	return new Promise((resolve, reject) => {
		Issue.findOneAndUpdate({ _id: issueId }, { $set: checkData }, { new: true })
			.exec()
			.then(updatedIssue => {
				resolve({ status: "Successfully updated" });
			})
			.catch(err => {
				reject({
					status: `Could not update ${updateIssue.issueId}`,
					error: err.message
				});
			});
	});
}

exports.deleteIssue = (projectName, issueData) => {
	return new Promise((resolve, reject) => {
		if (!issueData.issue_id) {
			reject({ status: "_id error" });
		} else {
			checkIssueInProject({
				projectName: projectName,
				issues: issueData.issue_id
			})
				.then(() => {
					return removeRefIssue(projectName, issueData.issue_id);
				})
				.then(() => {
					return deleteIssueData(issueData.issue_id);
				})
				.then(result => {
					resolve(result);
				})
				.catch(err => {
					reject(err);
				});
		}
	});
};

function removeRefIssue(project, issueId) {
	return new Promise((resolve, reject) => {
		Project.update({ projectName: project }, { $pull: { issues: issueId } })
			.exec()
			.then(res => {
				resolve();
			})
			.catch(err => {
				reject({
					status: `Could not delete ${issueId}`,
					error: err
				});
			});
	});
}

function deleteIssueData(issueId) {
	return new Promise((resolve, reject) => {
		Issue.findOneAndDelete({ _id: issueId })
			.exec()
			.then(deletedIssue => {
				resolve({
					status: `Deleted ${issueId}`
				});
			})
			.catch(err => {
				reject({
					status: `Could not delete ${issueId}`
				});
			});
	});
}
