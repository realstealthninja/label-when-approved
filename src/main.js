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
    const minapprovals = core.getInput('approvals')

    const octokit = github.getOctokit(secret)
    const context = github.context
    const pull_request = context.payload.pull_request

    if (!pull_request) {
      throw new Error('This action can only be run on pull requests')
    }

    const reviews = await octokit.rest.pulls.listReviews({
      owner: context.repo.owner,
      repo: context.repo.repo,
      pull_number: pull_request.number
    })

    var simplifiedreviews = [
      {
        id: 123,
        state: 'APPROVED',
        submitted_on: Date.now()
      }
    ]

    core.debug('simplifying reviews')
    simplifiedreviews = reviews.data.flatMap((review, index, array) => {
      return {
        id: review['user'].id,
        state: review['state'],
        submitted_on: Date(review['submitted_on'])
      }
    })
    core.debug('simplified reviews: ' + simplifiedreviews.toString)

    let userset = new Map()

    core.debug('Filtering reviews by the same authors')
    simplifiedreviews.forEach((review) => {
      if (userset.has(review.id)) {
        if (review.submitted_on > userset.get(review.id).submitted_on) {
          userset.set(review.id, review)
        } else {
          userset(review.id, review)
        }
      }
    })

    core.debug('filtered reviews: ' + userset.toString())
    core.debug('counting approvals')

    let approvals = 0
    userset.forEach((review, id) => {
      if (review['state'] === 'APPROVED') {
        approvals++
      }
    })

    if (approvals >= minapprovals) {
      core.debug('Approval requirement is met, adding label')
      await octokit.rest.issues.addLabels({
        owner: context.repo.owner,
        repo: context.repo.repo,
        issue_number: pull_request.number,
        labels: [labelName]
      })
    } else if (approvals < minapprovals) {
      core.debug('Approval requirement is unmet, removing label')
      await octokit.rest.issues.removeLabel({
        owner: context.repo.owner,
        repo: context.repo.repo,
        issue_number: pull_request.number,
        labels: [labelName]
      })
    }
  } catch (error) {
    // Fail the workflow run if an error occurs
    if (error instanceof Error) core.setFailed(error.message)
  }
}
