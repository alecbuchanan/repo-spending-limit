import * as core from '@actions/core'
import { isOverSpendLimit } from './spend-check'

/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
export async function run(): Promise<void> {
  try {
    const spendLimit: string = core.getInput('spend_limit')
    const compareToEnterprise: boolean =
      core.getInput('compare_to_enterprise') === 'true'

    if (isNaN(parseFloat(spendLimit))) {
      throw new Error(`Invalid spend limit: ${spendLimit}`)
    }

    core.info(`Spend limit: $${spendLimit}`)
    core.info(`Compare to enterprise: ${compareToEnterprise}`)

    const isOverSpend = await isOverSpendLimit(spendLimit, compareToEnterprise)

    core.info(`Is over spend limit: ${isOverSpend}`)

    core.setOutput('is_over_spend_limit', isOverSpend)
  } catch (error) {
    if (error instanceof Error) {
      core.setFailed(
        `An error occurred with spend limit. Error message: ${error.message}`
      )
    }
  }
}
