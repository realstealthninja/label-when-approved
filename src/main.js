import * as core from '@actions/core'
import * as github from '@actions/github'
import ReviewerAssociation from './association'

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
    const reviewerAssociation = ReviewerAssociation.fromString(
      core.getInput('reviewer-association')
    )
    core.debug('Enum ordinal' + reviewerAssociation.enumOrdinal)

    const octokit = github.getOctokit(secret)
    const context = github.context
    const pull_request = context.payload.pull_request

    if (!pull_request) {
      throw new Error('This action can only be run on pull requests')
    }

    if (!(reviewerAssociation instanceof ReviewerAssociation)) {
      throw new Error('Invalid reviewer-association value')
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
        submitted_at: Date.now(),
        reviewerAssociation: ReviewerAssociation.fromString('NONE')
      }
    ]

    core.debug('simplifying reviews')
    simplifiedreviews = reviews.data.flatMap((review, index, array) => {
      return {
        id: review['user'].id,
        state: review['state'],
        submitted_at: Date.parse(review['submitted_at']),
        reviewerAssociation: ReviewerAssociation.fromString(
          review['author_association']
        )
      }
    })

    let userset = new Map()

    core.debug('Filtering reviews by the same authors')
    simplifiedreviews.forEach((review) => {
      core.debug(review.reviewerAssociation.string)
      if (
        ReviewerAssociation.isGreaterOrEqual(
          review.reviewerAssociation,
          reviewerAssociation
        )
      ) {
        core.debug('User has the right association')
        if (userset.has(review.id)) {
          if (review.submitted_at > userset.get(review.id).submitted_at) {
            userset.set(review.id, review)
          }
        } else {
          userset.set(review.id, review)
        }
      } else {
        core.debug("User's review has no value")
      }
    })

    core.debug('counting approvals')

    let approvals = 0
    userset.forEach((review, id) => {
      core.debug(review['state'])
      if (review['state'] === 'APPROVED') {
        approvals++
      }
    })

    core.debug('approvals: ' + String(approvals))

    if (approvals >= minapprovals) {
      core.info('Approval requirement is met, adding label')
      await octokit.rest.issues.addLabels({
        owner: context.repo.owner,
        repo: context.repo.repo,
        issue_number: pull_request.number,
        labels: [labelName]
      })
    } else if (approvals < minapprovals) {
      core.info('Approval requirement is not met, removing label')
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
