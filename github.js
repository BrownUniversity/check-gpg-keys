const github = require("@actions/github");

function createGitHubClient(token, repo) {
  const octokit = github.getOctokit(token);

  return {
    getIssues: async function() {
      const data = await octokit.graphql(
        `query openIssues($repo: String!) {
          repository(owner: "BrownUniversity", name: $repo) {
            issues(first: 10, states: OPEN) {
              edges {
                node {
                  id
                  title
                }
              }
            }
          }
        }`,
        { repo: repo.substr(repo.indexOf("/") + 1) }
      );
      console.log(data);
      return {
        issues: data.repository.issues.edges.map(e => e.node)
      };
    },
    createIssue: async function(title) {
      console.log(`new issue: ${title}`);
    },
    updateIssueTitle: async function(issue, title) {
      console.log(`update issue ${issue.id}: ${title}`);
    }
  }
}

module.exports = {
  createGitHubClient
};
