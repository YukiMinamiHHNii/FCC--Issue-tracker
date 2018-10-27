const chaiHttp = require("chai-http"),
	chai = require("chai"),
	assert = chai.assert,
	app = require(`${process.cwd()}/app`);

chai.use(chaiHttp);

suite("Functional Tests", () => {
	suite("POST /api/issues/{project} => object with issue data", () => {
		test("Every field filled in", done => {
			chai
				.request(app)
				.post("/api/issues/test")
				.type("form")
				.send({
					issue_title: "Title",
					issue_text: "text",
					created_by: "Functional Test - Every field filled in",
					assigned_to: "Chai and Mocha",
					status_text: "In QA"
				})
				.end((err, res) => {
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
				.post("/api/issues/test")
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
				.post("/api/issues/test")
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

	/*suite("PUT /api/issues/{project} => text", () => {
		test("No body", done => {});

		test("One field to update", done => {});

		test("Multiple fields to update", done => {});
	});

	suite("GET /api/issues/{project} => Array of objects with issue data", () => {
		test("No filter", done => {
			chai
				.request(app)
				.get("/api/issues/test")
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

		test("One filter", done => {});

		test("Multiple filters (test for multiple fields you know will be in the db for a return)", done => {});
	});

	suite("DELETE /api/issues/{project} => text", () => {
		test("No _id", done => {});

		test("Valid _id", done => {});
	});*/
});
