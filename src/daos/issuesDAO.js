const mongoose = require("mongoose"),
	Project = require("../models/projectModel"),
	Issue = require("../models/issueModel");

const filters = [""];

exports.readProjects = () => {
	return Project.aggregate([
		{
			$project: {
				_id: 0,
				projectName: 1,
				issues: {
					$cond: {
						if: { $isArray: "$issues" },
						then: { $size: "$issues" },
						else: 0
					}
				}
			}
		}
	])
		.then(foundData => {
			return { projects: foundData };
		})
		.catch(err => {
			return Promise.reject({
				status: "Error while retrieving projects data",
				error: err
			});
		});
};

exports.createIssue = (projectName, issueData) => {
	return checkProject({ projectName: projectName })
		.then(foundProject => {
			let projData = foundProject
				? foundProject
				: new Project({ projectName: projectName });
			return saveIssueData(issueData, projData);
		})
		.then(result => {
			return {
				_id: result._id,
				issue_title: result.issue_title,
				issue_text: result.issue_text,
				created_on: result.created_on,
				updated_on: result.updated_on,
				created_by: result.created_by,
				assigned_to: result.assigned_to,
				open: result.open,
				status_text: result.status_text
			};
		})
		.catch(err => {
			return Promise.reject(err);
		});
};

function checkProject(projectData) {
	return Project.findOne(projectData)
		.exec()
		.then(foundProject => {
			return foundProject;
		})
		.catch(err => {
			return Promise.reject({
				status: "Error while querying for project",
				error: err.message
			});
		});
}

function saveIssueData(issueData, projData) {
	return createIssueEntry(issueData)
		.then(savedIssue => {
			return saveProject(projData, savedIssue);
		})
		.then(entry => {
			return entry;
		})
		.catch(err => {
			return Promise.reject(err);
		});
}

function createIssueEntry(issueData) {
	return Issue(issueData)
		.save()
		.then(savedIssue => {
			return savedIssue;
		})
		.catch(err => {
			return Promise.reject({
				status: "Error while saving issue... are you missing fields?",
				error: err.message
			});
		});
}

function saveProject(project, savedIssue) {
	if (project) {
		project.issues.push(savedIssue._id);
	}
	return project
		.save()
		.then(savedProj => {
			return savedIssue;
		})
		.catch(err => {
			return Promise.reject({
				status: "Error while saving issue to project",
				error: err.message
			});
		});
}

exports.readIssues = (projectName, filters) => {
	checkOpenFilter(filters);
	return getIssuesByProject(projectName, filters)
		.then(foundIssues => {
			return foundIssues;
		})
		.catch(err => {
			return Promise.reject(err);
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
	return Project.findOne({ projectName: project })
		.populate({ path: "issues", select: { __v: 0 }, match: filters })
		.exec()
		.then(foundProject => {
			if (foundProject) {
				return foundProject.issues;
			} else {
				return {};
			}
		})
		.catch(err => {
			return Promise.reject({
				status: "Error while reading issues",
				error: err
			});
		});
}

exports.updateIssue = (projectName, updateIssue) => {
	let checkData = checkUpdateData(updateIssue.issue_data);
	if (!checkData) {
		return Promise.reject({ status: "No updated field sent" });
	} else {
		return checkIssueInProject({
			projectName: projectName,
			issues: updateIssue.issue_id
		})
			.then(() => {
				return updateIssueData(updateIssue.issue_id, checkData);
			})
			.then(result => {
				return result;
			})
			.catch(err => {
				return Promise.reject(err);
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

function checkIssueInProject(queryObj) {
	return checkProject(queryObj)
		.then(foundData => {
			if (foundData) {
				return;
			} else {
				return Promise.reject({
					status: `Issue ${queryObj.issues} does not exist on project ${
						queryObj.projectName
					}`
				});
			}
		})
		.catch(err => {
			return Promise.reject({
				status: err.status
					? err.status
					: `Error while checking issues in project ${queryObj.projectName}`,
				error: err.error
			});
		});
}

function updateIssueData(issueId, checkData) {
	return Issue.findOneAndUpdate(
		{ _id: issueId },
		{ $set: checkData },
		{ new: true }
	)
		.exec()
		.then(updatedIssue => {
			return { status: "Successfully updated" };
		})
		.catch(err => {
			return Promise.reject({
				status: `Could not update ${issueId}`,
				error: err.message
			});
		});
}

exports.deleteIssue = (projectName, issueData) => {
	if (!issueData.issue_id) {
		return Promise.reject({ status: "_id error" });
	} else {
		return checkIssueInProject({
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
				return result;
			})
			.catch(err => {
				return Promise.reject(err);
			});
	}
};

function removeRefIssue(project, issueId) {
	return Project.update(
		{ projectName: project },
		{ $pull: { issues: issueId } }
	)
		.exec()
		.then(res => {
			return;
		})
		.catch(err => {
			return Promise.reject({
				status: `Could not delete ${issueId}`,
				error: err.message
			});
		});
}

function deleteIssueData(issueId) {
	return Issue.findOneAndDelete("{ _id: issueId }")
		.exec()
		.then(deletedIssue => {
			return {
				status: `Deleted ${issueId}`
			};
		})
		.catch(err => {
			return Promise.reject({
				status: `Could not delete ${issueId}`,
				error: err.message
			});
		});
}
