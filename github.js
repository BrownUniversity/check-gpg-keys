const github = require("@actions/github");

function createGitHubClient(token, repo) {
  const octokit = github.getOctokit(token);

  return {
    async getRepoData() {
      const repoName = repo.substr(repo.indexOf("/") + 1);
      const {
        data: { node_id: repoId },
      } = await octokit.repos.get({
        owner: "BrownUniversity",
        repo: repoName,
      });
      const issues = await octokit.paginate(
        "GET /repos/{owner}/{repo}/issues",
        {
          owner: "BrownUniversity",
          repo: repoName,
        }
      );
      return {
        repoId,
        issues,
      };
    },

    async createIssue({ repoId, title }) {
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

    async updateIssueTitle(issueId, title) {
      const data = await octokit.graphql(
        `mutation UpdateIssueTitle($issueId: ID!, $title: String!) {
          updateIssue(input: { id: $issueId, title: $title }) {
            issue {
              number
              title
            }
          }
        }`,
        { issueId, title }
      );
      return data.updateIssue.issue.number;
    },
  };
}

module.exports = {
  createGitHubClient,
};
