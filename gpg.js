const gpg = require("gpg");

function extractFromKey(key, testRE, extractionIndex) {
  const match = key.match(testRE);
  if (match) {
    return match[extractionIndex];
  }
  return null;
}

function getKeyStatus(expirationDateString) {
  if (expirationDateString === null) {
    return "valid";
  }

  const now = Date.now();
  const weekFromNow = now + (1000 * 60 * 60 * 24 * 7);
  const expirationDate = new Date(expirationDateString).getTime();
  if (expirationDate < now) {
    return "expired";
  }
  if (expirationDate < weekFromNow) {
    return "expiring";
  }
  return "valid";
}

function parseKey(key) {
  const email = extractFromKey(key, /<([^>]+)>/, 1);
  const expirationDateString = extractFromKey(key, /\[expire[sd]: (\d\d\d\d-\d\d-\d\d)\]/, 1);
  return {
    email,
    status: getKeyStatus(expirationDateString)
  };
}

function parseKeys(listKeysOutput) {
  const keyLines = listKeysOutput.trim().split("\n");
  const pubs = keyLines.filter(line => line.match(/^pub/)).map(l => l.trim());
  const uids = keyLines.filter(line => line.match(/^uid/)).map(l => l.trim());
  const keys = pubs.reduce((memo, curr, index) => memo.concat(curr + uids[index]) , []);
  return keys.map(parseKey);
}

function listKeys(homedir) {
  return new Promise((resolve, reject) => {
    gpg.call("", [`--homedir=${homedir}`, "--list-keys"], (err, result) => {
      if (err) {
        return reject(err);
      }
      return resolve(result);
    });
  });
}

async function getKeys(keyringDir) {
  const listKeysOutput = await listKeys(keyringDir);
  return parseKeys(listKeysOutput);
}

module.exports = {
  parseKeys,
  getKeys
};
