const github = require("@actions/github");

function createGitHubClient(token, repo) {
  const octokit = github.getOctokit(token);

  return {
    getRepoData: async function() {
      const data = await octokit.graphql(
        `query openIssues($repo: String!) {
          repository(owner: "BrownUniversity", name: $repo) {
            id
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
      return {
        repoId: data.repository.id,
        issues: data.repository.issues.edges.map(e => e.node)
      };
    },

    createIssue: async function({ repoId, title }) {
      const data = await octokit.graphql(
        `mutation CreateIssue($repoId: ID!, $title: String!) {
          createIssue(input: { repositoryId: $repoId, title: $title }) {
            issue {
              number
            }
          }
        }`,
        { repoId, title }
      );
      return data.createIssue.issue.number;
    },

    updateIssueTitle: async function(issue, title) {
      console.log(`update issue ${issue.id}: ${title}`);
      const data = await octokit.graphql(
        `mutation UpdateIssueTitle($issueId: ID!, $title: String!) {
          updateIssue(input: { id: $issueId, title: $title }) {
            issue {
              number
              title
            }
          }
        }`,
        { issueId: issue.id, title }
      );
      console.log(data);
      return data.updateIssue.issue.number;
    }
  }
}

module.exports = {
  createGitHubClient
};
