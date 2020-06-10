const core = require("@actions/core");
const github = require("@actions/github");

function getKeys(keyringDir) {
  return Promise.resolve([
    {
      status: "valid",
      email: "sumner_warren@brown.edu"
    },
    {
      status: "expiring",
      email: "sumner_warren@brown.edu"
    },
    {
      status: "expired",
      email: "sumner_warren@brown.edu"
    }
  ]);
}

async function getRepoData(octokit, repo) {
  const data = await octokit.graphql(
    `
      {
        repository(owner: "BrownUniversity", name: $repo) {
          assignableUsers(first: 50) {
            edges {
              node {
                login
                email
              }
            }
          }
          issues(first: 10, states: OPEN) {
            edges {
              node {
                title
              }
            }
          }
        }
      }
    `,
    { repo }
  );
  return {
    users: assignableUsers,
    issues
  };
}

async function findOrCreateIssue({ keys, users, issues }) {
  console.log({ keys, users, issues });
}

async function run() {
  const token = core.getInput("github-token");
  const repo = core.getInput("repo-name");
  const keyringDir = core.getInput("keyring-directory");
  const octokit = github.getOctokit(token);
  const keys = await getKeys(keyringDir);
  const { users, issues } = await getRepoData(octokit, repo);
  await findOrCreateIssue(keys);
}

try {
  run();
} catch (e) {
  core.setFailed(e.message);
}
