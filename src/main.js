import * as core from '@actions/core'
import * as github from '@actions/github'

/**
 * The main function for the action.
 *
 * @returns {Promise<void>} Resolves when the action is complete.
 */
export async function run() {
  try {
    // inputs
    const secret = core.getInput('secret')
    const labelName = core.getInput('label')
    const requiredApprovals = core.getInput('required-approves')

    const octokit = github.getOctokit(secret)
    const context = github.context
    const pull_request = context.payload.pull_request

    if (!pull_request) {
      throw new Error('This action can only be run on pull requests')
    }

    const reviews = await octokit.request(
      'GET /repos/{owner}/{repo}/pulls/{pull_number}/reviews',
      {
        owner: context.repo.owner,
        repo: context.repo.repo,
        pull_number: pull_request.number
      }
    )

    let approvals = 0

    reviews.forEach((review) => {
      if (review['state'] === 'APPROVED') {
        approvals++
      }
    })

    if (approvals >= requiredApprovals) {
      await octokit.rest.issues.addLabels({
        owner: context.repo.owner,
        repo: context.repo.repo,
        issue_number: pull_request.number,
        label: labelName
      })
    }
  } catch (error) {
    // Fail the workflow run if an error occurs
    if (error instanceof Error) core.setFailed(error.message)
  }
}
