import * as core from '@actions/core'
import * as main from '../src/main'
import { isOverSpendLimit } from '../src/spend-check'

jest.mock('@actions/core')
jest.mock('../src/spend-check')

describe('action', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('sets the is_over_spend_limit output', async () => {
    (core.getInput as jest.Mock)
      .mockReturnValueOnce('100') // spend_limit
      .mockReturnValueOnce('true') // compare_to_enterprise
    ;(isOverSpendLimit as jest.Mock).mockResolvedValue(true)

    await main.run()

    expect(core.getInput).toHaveBeenCalledWith('spend_limit')
    expect(core.getInput).toHaveBeenCalledWith('compare_to_enterprise')
    expect(isOverSpendLimit).toHaveBeenCalledWith('100', true)
    expect(core.setOutput).toHaveBeenCalledWith('is_over_spend_limit', true)
  })

  it('sets a failed status when spend limit is not a number', async () => {
    (core.getInput as jest.Mock)
      .mockReturnValueOnce('not-a-number') // spend_limit
      .mockReturnValueOnce('true') // compare_to_enterprise

    await main.run()

    expect(core.setFailed).toHaveBeenCalledWith(
      'An error occurred with spend limit. Error message: Invalid spend limit: not-a-number'
    )
  })

  it('sets a failed status when isOverSpendLimit throws an error', async () => {
    (core.getInput as jest.Mock)
      .mockReturnValueOnce('100') // spend_limit
      .mockReturnValueOnce('true') // compare_to_enterprise
    ;(isOverSpendLimit as jest.Mock).mockRejectedValue(new Error('Test error'))

    await main.run()

    expect(core.setFailed).toHaveBeenCalledWith(
      'An error occurred with spend limit. Error message: Test error'
    )
  })
})
