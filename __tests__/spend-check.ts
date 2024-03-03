// perform_spend_check.test.ts
import axios from 'axios'
import * as github from '@actions/github'
import { isOverSpendLimit } from '../src/spend-check'

jest.mock('axios')
jest.mock('@actions/github')

describe('isOverSpendLimit', () => {
  beforeEach(() => {
    process.env.GITHUB_TOKEN = 'test-token'
    process.env.ENTERPRISE_NAME = 'test-enterprise'
    github.context.repo.owner = 'test-org'
  })

  it('throws an error if GitHub token is missing', async () => {
    delete process.env.GITHUB_TOKEN

    await expect(isOverSpendLimit('100', false)).rejects.toThrow(
      'GitHub token is missing'
    )
  })

  it('throws an error if organization is missing', async () => {
    github.context.repo.owner = ''

    await expect(isOverSpendLimit('100', false)).rejects.toThrow(
      'Organization is missing'
    )
  })

  // More tests...

  it('returns true if total cost is over spend limit', async () => {
    (axios.get as jest.Mock).mockResolvedValue({
      data: {
        minutes_used_breakdown: {
          ubuntu_4_core: 100, // cost = 100 * .016 = 1.6
          windows_64_core: 10 // cost = 10 * .512 = 5.12
          // total cost = 1.6 + 5.12 = 6.72
        }
      }
    })

    const result = await isOverSpendLimit('5', false)

    expect(result).toBe(true)
  })

  it('returns false if total cost is not over spend limit', async () => {
    (axios.get as jest.Mock).mockResolvedValue({
      data: {
        minutes_used_breakdown: {
          ubuntu_4_core: 100, // cost = 100 * .016 = 1.6
          windows_64_core: 10 // cost = 10 * .512 = 5.12
          // total cost = 1.6 + 5.12 = 6.72
        }
      }
    })

    const result = await isOverSpendLimit('10', false)

    expect(result).toBe(false)
  })

  it('throws an error if the API call fails', async () => {
    (axios.get as jest.Mock).mockRejectedValue({
      response: {
        status: 500
      }
    })

    await expect(isOverSpendLimit('100', false)).rejects.toThrow(
      'GitHub API responded with status 500 for org test-org and enterprise test-enterprise'
    )
  })
})
