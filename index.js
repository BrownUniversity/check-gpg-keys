const core = require("@actions/core");
const github = require("@actions/github");

async function run() {
  const keyringDir = core.getInput("keyring-directory");
  console.log(keyringDir);
}

try {
  run();
} catch (e) {
  core.setFailed(e.message);
}
