import { expect } from "chai";
import { Database } from "../jsC8";
import { c8SearchView } from "../view";

const ARANGO_VERSION = Number(process.env.ARANGO_VERSION || 30400);
const describe34 = ARANGO_VERSION >= 30400 ? describe : describe.skip;

describe34("View metadata", function() {
  // create database takes 11s in a standard cluster
  this.timeout(20000);

  let db: Database;
  let dbName = `testdb_${Date.now()}`;
  let view: c8SearchView;
  let viewName = `view-${Date.now()}`;
  before(async () => {
    db = new Database({
      url: process.env.TEST_ARANGODB_URL || "http://localhost:8529",
      arangoVersion: Number(process.env.ARANGO_VERSION || 30400)
    });
    await db.createDatabase(dbName);
    db.useDatabase(dbName);
    view = db.c8SearchView(viewName);
    await view.create();
  });
  after(async () => {
    db.useDatabase("_system");
    await db.dropDatabase(dbName);
  });
  describe("view.get", () => {
    it("should return information about a view", async () => {
      const info = await view.get();
      expect(info).to.have.property("name", viewName);
      expect(info).to.have.property("type", "c8Search");
    });
    it("should throw if view does not exists", async () => {
      try {
        await db.c8SearchView("no").get();
      } catch (err) {
        expect(err).to.have.property("errorNum", 1203);
        return;
      }
      expect.fail("should throw");
    });
  });
  describe("view.properties", () => {
    it("should return properties of a view", async () => {
      const properties = await view.properties();
      expect(properties).to.have.property("name", viewName);
      expect(properties).to.have.property("locale", "C");
      expect(properties).to.have.property("links");
      expect(properties).to.have.property("commit");
    });
  });
});