const core = require("@actions/core");
const { getKeys } = require("./gpg");
const { createGitHubClient } = require("./github");

function getExpiredIssueTitle(email) {
  return `blackbox key has expired: ${email}`;
}

function getExpiringIssueTitle(email) {
  return `blackbox key expiring soon: ${email}`;
}

async function findOrCreateIssuesForKeys(githubClient, keys) {
  const issues = githubClient.getIssues();
  console.log(keys, issues);

  const expiredKeys = keys.filter(k => k.status === "expired");
  await Promise.all(
    expiredKeys.map(key => {
      const expiredTitle = getExpiredIssueTitle(key.email);
      const expiredIssue = issues.find(issue => issue.title === expiredTitle);
      const expiringIssue = issues.find(issue => issue.title === getExpiringIssueTitle(key.email));

      if (expiredIssue) return null;

      if (expiringIssue) {
        return githubClient.updateIssueTitle(expiringIssue, expiringTitle);
      }

      return githubClient.createIssue(expiredTitle);
    })
  );
  
  const expiringKeys = keys.filter(k => k.status === "expiring");
  await Promise.all(
    expiredKeys.map(key => {
      const expiringTitle = getExpiringIssueTitle(key.email);
      const expiringIssue = issues.find(issue => issue.title === expiringTitle);

      if (expiringIssue) return null;

      return githubClient.createIssue(expiringTitle);
    })
  );
}

async function run() {
  try {
    const githubToken = core.getInput("github-token");
    const repoName = core.getInput("repo-name");
    const keyringDir = core.getInput("keyring-directory");

    connsole.log(createGitHubClient);
    await findOrCreateIssuesForKeys(
      createGitHubClient(githubToken, repoName),
      await getKeys(keyringDir)
    );
  } catch (e) {
    core.setFailed(e.message);
  }
}

(async function () {
  await run();
})();
