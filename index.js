const MockDate = require("mockdate");
const { run } = require("./run");

(async function main() {
  MockDate.set("2020-02-04");
  await run();
})();
