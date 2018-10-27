const mongoose = require("mongoose"),
	Issue = require("./issueModel"),
	Schema = mongoose.Schema;

const projectSchema = new Schema({
	projectName: { type: String, required: true, unique: true },
	issues: [{ type: Schema.Types.ObjectId, ref: "Issue" }]
});

module.exports = mongoose.model("Project", projectSchema);
