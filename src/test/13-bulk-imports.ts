import { expect } from "chai";
import { Fabric } from "../jsC8";
import { DocumentCollection, ImportOptions } from "../collection";
import { getDCListString } from "../util/helper";

describe("Bulk imports", function () {
  // create fabric takes 11s in a standard cluster
  this.timeout(20000);

  let fabric: Fabric;
  const testUrl = process.env.TEST_C8_URL || "https://default.dev.macrometa.io";

  let dcList: string;
  let dbName = `testdb_${Date.now()}`;
  let collection: DocumentCollection;
  let collectionName = `collection-${Date.now()}`;
  before(async () => {
    fabric = new Fabric({
      url: testUrl,
      c8Version: Number(process.env.C8_VERSION || 30400)
    });

    const response = await fabric.getAllEdgeLocations();
    dcList = getDCListString(response);

    await fabric.createFabric(dbName, [{ username: 'root' }], { dcList: dcList });
    fabric.useFabric(dbName);
    collection = fabric.collection(collectionName);
    await collection.create();
  });
  after(async () => {
    try {
      fabric.useFabric("_system");
      await fabric.dropFabric(dbName);
    } finally {
      fabric.close();
    }
  });
  describe("collection.import", () => {
    describe("with type null", () => {
      it("should accept tuples array", async () => {
        const data = [
          ["_key", "data"],
          ["ta1", "banana"],
          ["ta2", "peach"],
          ["ta3", "apricot"]
        ];
        const info = await collection.import(data, { type: null });
        expect(info).to.eql({
          error: false,
          created: 3,
          errors: 0,
          empty: 0,
          updated: 0,
          ignored: 0
        });
      });
      it("should accept tuples string", async () => {
        const data =
          '["_key", "data"]\r\n["ts1", "banana"]\r\n["ts2", "peach"]\r\n["ts3", "apricot"]\r\n';
        const info = await collection.import(data, { type: null });
        expect(info).to.eql({
          error: false,
          created: 3,
          errors: 0,
          empty: 0,
          updated: 0,
          ignored: 0
        });
      });
      it("should accept tuples buffer", async () => {
        const data = Buffer.from(
          '["_key", "data"]\r\n["tb1", "banana"]\r\n["tb2", "peach"]\r\n["tb3", "apricot"]\r\n'
        );
        const info = await collection.import(data, { type: null });
        expect(info).to.eql({
          error: false,
          created: 3,
          errors: 0,
          empty: 0,
          updated: 0,
          ignored: 0
        });
      });
    });
    for (const type of [
      undefined,
      "auto",
      "documents"
    ] as ImportOptions["type"][]) {
      describe(`with type ${JSON.stringify(type)}`, () => {
        it("should accept documents array", async () => {
          const data = [
            { _key: `da1-${type}`, data: "banana" },
            { _key: `da2-${type}`, data: "peach" },
            { _key: `da3-${type}`, data: "apricot" }
          ];
          const info = await collection.import(data, { type });
          expect(info).to.eql({
            error: false,
            created: 3,
            errors: 0,
            empty: 0,
            updated: 0,
            ignored: 0
          });
        });
        it("should accept documents string", async () => {
          const data = `{"_key": "ds1-${type}", "data": "banana"}\r\n{"_key": "ds2-${type}", "data": "peach"}\r\n{"_key": "ds3-${type}", "data": "apricot"}\r\n`;
          const info = await collection.import(data, { type });
          expect(info).to.eql({
            error: false,
            created: 3,
            errors: 0,
            empty: 0,
            updated: 0,
            ignored: 0
          });
        });
        it("should accept documents buffer", async () => {
          const data = Buffer.from(
            `{"_key": "db1-${type}", "data": "banana"}\r\n{"_key": "db2-${type}", "data": "peach"}\r\n{"_key": "db3-${type}", "data": "apricot"}\r\n`
          );
          const info = await collection.import(data, { type });
          expect(info).to.eql({
            error: false,
            created: 3,
            errors: 0,
            empty: 0,
            updated: 0,
            ignored: 0
          });
        });
      });
    }
    for (const type of [
      undefined,
      "auto",
      "array"
    ] as ImportOptions["type"][]) {
      describe(`with type ${JSON.stringify(type)}`, () => {
        it("should accept JSON string", async () => {
          const data = JSON.stringify([
            { _key: `js1-${String(type)}`, data: "banana" },
            { _key: `js2-${String(type)}`, data: "peach" },
            { _key: `js3-${String(type)}`, data: "apricot" }
          ]);
          const info = await collection.import(data, { type });
          expect(info).to.eql({
            error: false,
            created: 3,
            errors: 0,
            empty: 0,
            updated: 0,
            ignored: 0
          });
        });
        it("should accept JSON buffer", async () => {
          const data = Buffer.from(
            JSON.stringify([
              { _key: `jb1-${String(type)}`, data: "banana" },
              { _key: `jb2-${String(type)}`, data: "peach" },
              { _key: `jb3-${String(type)}`, data: "apricot" }
            ])
          );
          const info = await collection.import(data, { type });
          expect(info).to.eql({
            error: false,
            created: 3,
            errors: 0,
            empty: 0,
            updated: 0,
            ignored: 0
          });
        });
      });
    }
  });
});
