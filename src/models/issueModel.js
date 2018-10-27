const mongoose = require("mongoose"),
	Schema = mongoose.Schema;

const issueSchema = new Schema({
	issue_title: { type: String, required: true },
	issue_text: { type: String, required: true },
	created_by: { type: String, required: true },
	assigned_to: { type: String },
	status_text: { type: String },
	created_on: { type: Date, default: new Date() },
	updated_on: { type: Date, default: null },
	open: { type: Boolean, default: true }
});

module.exports = mongoose.model("Issue", issueSchema);
