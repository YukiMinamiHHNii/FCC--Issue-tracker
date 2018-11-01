const mongoose = require("mongoose"),
	Project = require("../models/projectModel"),
	Issue = require("../models/issueModel"),
	dotenv = require("dotenv").load();

const filters = [""];

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
								return result({
									_id: savedIssue._id,
									issue_title: savedIssue.issue_title,
									issue_text: savedIssue.issue_text,
									created_on: savedIssue.created_on,
									updated_on: savedIssue.updated_on,
									created_by: savedIssue.created_by,
									assigned_to: savedIssue.assigned_to,
									open: savedIssue.open,
									status_text: savedIssue.status_text
								});
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
	project.save({}, (err, savedProj) => {
		return err
			? result({ status: "Error while saving issue to project", error: error }) //Remove error later
			: result({ _id: savedProj._id });
	});
}

exports.readIssues = (projectName, filters, result) => {
	handleConnection((connected, error) => {
		if (!connected) {
			return result({
				status: `Error while retrieving ${projectName} issues`,
				error: error //Remove this later
			});
		} else {
			checkOpenFilter(filters);
			Project.findOne({ projectName: projectName })
				.populate({ path: "issues", select: { __v: 0 }, match: filters }) //Second argument to select just certain fields
				.exec((err, res) => {
					if (err) {
						return result({
							status: "Error, invalid filters",
							error: err //Remove this later
						});
					} else {
						return res ? result(res.issues) : result({});
					}
				});
		}
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
				checkProject(
					{
						projectName: projectName,
						issues: updateIssue.issue_id
					},
					(err, dbRes) => {
						if (err) {
							return result(dbRes);
						} else {
							if (!dbRes) {
								return result({
									status: `Issue with id: ${
										updateIssue.issue_id
									} do not exist in ${projectName}`
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
					}
				);
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

exports.deleteIssue = (projectName, issueData, result) => {
	if (!issueData.issue_id) {
		return result({ status: "_id error" });
	} else {
		handleConnection((connected, error) => {
			if (!connected) {
				return result({
					status: `Error while retrieving ${projectName} issues`,
					error: error //Remove this later
				});
			} else {
				checkProject(
					{ projectName: projectName, issues: issueData.issue_id },
					(err, dbRes) => {
						if (err) {
							return result(dbRes);
						} else {
							if (!dbRes) {
								return result({
									status: `Issue with id: ${
										issueData.issue_id
									} do not exist in ${projectName}`
								});
							} else {
								removeRefIssue(
									dbRes,
									issueData.issue_id,
									(status, removeRefError) => {
										if (!status) {
											return result(removeRefError);
										} else {
											Issue.findOneAndDelete({ _id: issueData.issue_id }).exec(
												(err, res) => {
													if (err) {
														return result({
															status: `Could not delete ${issueData.issue_id}`
														});
													} else {
														return result({
															status: `Deleted ${issueData.issue_id}`
														});
													}
												}
											);
										}
									}
								);
							}
						}
					}
				);
			}
		});
	}
};

function removeRefIssue(project, issueId, result) {
	Project.update(project, { $pull: { issues: issueId } }, (err, res) => {
		return err
			? result(false, {
					status: `Could not delete ${issueData.issue_id}`,
					error: err
			  })
			: result(true);
	});
}
