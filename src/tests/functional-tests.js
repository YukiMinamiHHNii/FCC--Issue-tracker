const chaiHttp = require("chai-http"),
	chai = require("chai"),
	assert = chai.assert,
	app = require(`${process.cwd()}/app`);

chai.use(chaiHttp);

let testId;

suite("Functional Tests", () => {
	suite("POST /api/issue-tracker/issues/{project} => object with issue data", () => {
		test("Every field filled in", done => {
			chai
				.request(app)
				.post("/api/issue-tracker/issues/test")
				.type("form")
				.send({
					issue_title: "Title",
					issue_text: "text",
					created_by: "Functional Test - Every field filled in",
					assigned_to: "Chai and Mocha",
					status_text: "In QA"
				})
				.end((err, res) => {
					testId = res.body._id;
					assert.equal(res.status, 200);
					assert.isNotNull(res.body._id, "Object ID is not null");
					assert.equal(res.body.issue_title, "Title");
					assert.equal(res.body.issue_text, "text");
					assert.equal(
						typeof new Date(res.body.created_on),
						"object",
						"Date is an instance of Object"
					);
					assert.equal(
						res.body.updated_on,
						null,
						"It was created just now, never updated"
					);
					assert.equal(
						res.body.created_by,
						"Functional Test - Every field filled in"
					);
					assert.equal(res.body.assigned_to, "Chai and Mocha");
					assert.equal(res.body.open, true);
					assert.equal(res.body.status_text, "In QA");
					done();
				});
		});

		test("Required fields filled in", done => {
			chai
				.request(app)
				.post("/api/issue-tracker/issues/test")
				.type("form")
				.send({
					issue_title: "Title2",
					issue_text: "text2",
					created_by: "Functional Test - Only required fields filled in",
					assigned_to: "",
					status_text: ""
				})
				.end((err, res) => {
					assert.equal(res.status, 200);
					assert.isNotNull(res.body._id, "Object ID is not null");
					assert.equal(res.body.issue_title, "Title2");
					assert.equal(res.body.issue_text, "text2");
					assert.equal(
						typeof new Date(res.body.created_on),
						"object",
						"Date is an instance of Object"
					);
					assert.equal(
						res.body.updated_on,
						null,
						"It was created just now, never updated"
					);
					assert.equal(
						res.body.created_by,
						"Functional Test - Only required fields filled in"
					);
					assert.isEmpty(res.body.assigned_to);
					assert.equal(res.body.open, true);
					assert.isEmpty(res.body.status_text);
					done();
				});
		});

		test("Missing required fields", done => {
			chai
				.request(app)
				.post("/api/issue-tracker/issues/test")
				.type("form")
				.send({
					created_by: "Functional Test - Missing required fields"
				})
				.end((err, res) => {
					assert.equal(
						res.body.status,
						"Error while saving issue... are you missing fields?"
					);
					done();
				});
		});
	});

	suite("PUT /api/issue-tracker/issues/{project} => text", () => {
		test("No body", done => {
			chai
				.request(app)
				.put("/api/issue-tracker/issues/test")
				.type("form")
				.send({ id: "some_id", issue_data: {} })
				.end((err, res) => {
					assert.equal(res.body.status, "No updated field sent");
					done();
				});
		});

		test("One field to update", done => {
			chai
				.request(app)
				.put("/api/issue-tracker/issues/test")
				.type("form")
				.send({
					issue_id: testId,
					issue_data: { issue_title: "Functional Test - One Field to Update" }
				})
				.end((err, res) => {
					assert.equal(res.body.status, "Successfully updated");
					done();
				});
		});

		test("Multiple fields to update", done => {
			chai
				.request(app)
				.put("/api/issue-tracker/issues/test")
				.type("form")
				.send({
					issue_id: testId,
					issue_data: {
						issue_title: "Functional Test - Multiple Fields to Update",
						issue_text: "MultipleFieldsUpdated",
						created_by: "Functional Test2"
					}
				})
				.end((err, res) => {
					assert.equal(res.body.status, "Successfully updated");
					done();
				});
		});
	});

	suite("GET /api/issue-tracker/issues/{project} => Array of objects with issue data", () => {
		test("No filter", done => {
			chai
				.request(app)
				.get("/api/issue-tracker/issues/test")
				.query({})
				.end((err, res) => {
					assert.equal(res.status, 200);
					assert.isArray(res.body);
					assert.property(res.body[0], "issue_title");
					assert.property(res.body[0], "issue_text");
					assert.property(res.body[0], "created_on");
					assert.property(res.body[0], "updated_on");
					assert.property(res.body[0], "created_by");
					assert.property(res.body[0], "assigned_to");
					assert.property(res.body[0], "open");
					assert.property(res.body[0], "status_text");
					assert.property(res.body[0], "_id");
					done();
				});
		});

		test("One filter", done => {
			chai
				.request(app)
				.get("/api/issue-tracker/issues/test")
				.query({ _id: testId })
				.end((err, res) => {
					assert.equal(res.status, 200);
					assert.isArray(res.body);
					assert.property(res.body[0], "issue_title");
					assert.property(res.body[0], "issue_text");
					assert.property(res.body[0], "created_on");
					assert.property(res.body[0], "updated_on");
					assert.property(res.body[0], "created_by");
					assert.property(res.body[0], "assigned_to");
					assert.property(res.body[0], "open");
					assert.property(res.body[0], "status_text");
					assert.property(res.body[0], "_id");
					done();
				});
		});

		test("Multiple filters (test for multiple fields you know will be in the db for a return)", done => {
			chai
				.request(app)
				.get("/api/issue-tracker/issues/test")
				.query({
					_id: testId,
					issue_title: "Functional Test - Multiple Fields to Update",
					issue_text: "MultipleFieldsUpdated",
					created_by: "Functional Test2"
				})
				.end((err, res) => {
					assert.equal(res.status, 200);
					assert.isArray(res.body);
					assert.property(res.body[0], "issue_title");
					assert.property(res.body[0], "issue_text");
					assert.property(res.body[0], "created_on");
					assert.property(res.body[0], "updated_on");
					assert.property(res.body[0], "created_by");
					assert.property(res.body[0], "assigned_to");
					assert.property(res.body[0], "open");
					assert.property(res.body[0], "status_text");
					assert.property(res.body[0], "_id");
					done();
				});
		});
	});

	suite("DELETE /api/issue-tracker/issues/{project} => text", () => {
		test("No _id", done => {
			chai
				.request(app)
				.delete("/api/issue-tracker/issues/test")
				.query({ _id: "" })
				.end((err, res) => {
					assert.equal(res.body.status, "_id error");
					done();
				});
		});

		test("Valid _id", done => {
			chai
				.request(app)
				.delete("/api/issue-tracker/issues/test")
				.query({ _id: testId })
				.end((err, res) => {
					assert.equal(res.body.status, `Deleted ${testId}`);
					done();
				});
		});
	});
});
