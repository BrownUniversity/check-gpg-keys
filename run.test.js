const { run } = require("./run");
const { createGitHubClient } = require("./github");
const { getKeys } = require("./gpg");

jest.mock("./gpg");
jest.mock("./github");

describe("run", () => {
  describe("expiring keys", () => {
    it("does not create issues for expiring keys when an existing issue is located", async () => {
      getKeys.mockResolvedValueOnce([
        { status: "expiring", email: "josiah_carberry@brown.edu" },
      ]);
      const createIssue = jest.fn();
      createGitHubClient.mockReturnValueOnce({
        getRepoData: jest.fn(async () => ({
          repoId: "1",
          issues: [
            {
              node_id: "1",
              title: "blackbox key expiring soon: josiah_carberry@brown.edu",
            },
          ],
        })),
        createIssue,
      });
      await run();
      expect(createIssue).toHaveBeenCalledTimes(0);
    });

    it("creates issues for expiring keys when an existing issue is not located", async () => {
      getKeys.mockResolvedValueOnce([
        { status: "expiring", email: "josiah_carberry@brown.edu" },
      ]);
      const createIssue = jest.fn();
      createGitHubClient.mockReturnValueOnce({
        getRepoData: jest.fn(async () => ({
          repoId: "1",
          issues: [],
        })),
        createIssue,
      });
      await run();
      expect(createIssue).toHaveBeenCalledTimes(1);
      expect(createIssue).toHaveBeenCalledWith({
        repoId: "1",
        title: "blackbox key expiring soon: josiah_carberry@brown.edu",
      });
    });
  });

  describe("expired keys", () => {
    it("does not create issues for expired keys when an existing issue is located", async () => {
      getKeys.mockResolvedValueOnce([
        { status: "expired", email: "josiah_carberry@brown.edu" },
      ]);
      const createIssue = jest.fn();
      createGitHubClient.mockReturnValueOnce({
        getRepoData: jest.fn(async () => ({
          repoId: "1",
          issues: [
            {
              node_id: "1",
              title: "blackbox key has expired: josiah_carberry@brown.edu",
            },
          ],
        })),
        createIssue,
      });
      await run();
      expect(createIssue).toHaveBeenCalledTimes(0);
    });

    it("creates issues for expired keys when an existing issue is not located", async () => {
      getKeys.mockResolvedValueOnce([
        { status: "expired", email: "josiah_carberry@brown.edu" },
      ]);
      const createIssue = jest.fn();
      createGitHubClient.mockReturnValueOnce({
        getRepoData: jest.fn(async () => ({
          repoId: "1",
          issues: [],
        })),
        createIssue,
      });
      await run();
      expect(createIssue).toHaveBeenCalledTimes(1);
      expect(createIssue).toHaveBeenCalledWith({
        repoId: "1",
        title: "blackbox key has expired: josiah_carberry@brown.edu",
      });
    });

    it("updates issue titles for expired keys when an existing issue is located, but references an expiring key", async () => {
      getKeys.mockResolvedValueOnce([
        { status: "expired", email: "josiah_carberry@brown.edu" },
      ]);
      const createIssue = jest.fn();
      const updateIssueTitle = jest.fn();
      createGitHubClient.mockReturnValueOnce({
        getRepoData: jest.fn(async () => ({
          repoId: "1",
          issues: [
            {
              node_id: "1",
              title: "blackbox key expiring soon: josiah_carberry@brown.edu",
            },
          ],
        })),
        createIssue,
        updateIssueTitle,
      });
      await run();
      expect(createIssue).toHaveBeenCalledTimes(0);
      expect(updateIssueTitle).toHaveBeenCalledTimes(1);
      expect(updateIssueTitle).toHaveBeenCalledWith(
        "1",
        "blackbox key has expired: josiah_carberry@brown.edu"
      );
    });
  });
});
