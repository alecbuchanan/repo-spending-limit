import axios from 'axios'
import * as github from '@actions/github'

type ApiResponse = {
  total_minutes_used: number
  total_paid_minutes_used: number
  included_minutes: number
  minutes_used_breakdown: {
    UBUNTU: number
    MACOS: number
    WINDOWS: number
    ubuntu_4_core: number
    ubuntu_8_core: number
    ubuntu_16_core: number
    ubuntu_32_core: number
    ubuntu_64_core: number
    windows_4_core: number
    windows_8_core: number
    windows_16_core: number
    windows_32_core: number
    windows_64_core: number
    macos_12_core: number
    total: number
  }
}

type RateMap = {
  [key: string]: number
}

const rates: RateMap = {
  ubuntu_4_core: 0.016,
  ubuntu_8_core: 0.032,
  ubuntu_16_core: 0.064,
  ubuntu_32_core: 0.128,
  ubuntu_64_core: 0.256,
  windows_4_core: 0.016,
  windows_8_core: 0.064,
  windows_16_core: 0.128,
  windows_32_core: 0.256,
  windows_64_core: 0.512,
  macos_12_core: 0.12
}

export async function isOverSpendLimit(
  spendLimit: string,
  compareToEnterprise: boolean
): Promise<boolean> {
  const org = github.context.repo.owner
  const enterprise = process.env.ENTERPRISE_NAME // get enterprise from environment variables
  const token = process.env.GITHUB_TOKEN // use the GitHub token from environment variables

  if (!token) {
    throw new Error('GitHub token is missing')
  }

  if (!org) {
    throw new Error('Organization is missing')
  }

  if (compareToEnterprise && !enterprise) {
    throw new Error('Enterprise is missing')
  }

  if (isNaN(parseFloat(spendLimit))) {
    throw new Error('Spend limit must be a number')
  }

  let url: string
  if (compareToEnterprise) {
    url = `https://api.github.com/enterprises/${enterprise}/settings/billing/actions`
  } else {
    url = `https://api.github.com/orgs/${org}/settings/billing/actions`
  }

  try {
    const response = await axios.get(url, {
      headers: {
        Authorization: `token ${token}`,
        Accept: 'application/vnd.github+json'
      }
    })

    const data: ApiResponse = response.data

    let totalCost = 0
    for (const [key, value] of Object.entries(data.minutes_used_breakdown)) {
      if (rates[key]) {
        totalCost += value * rates[key]
      }
    }

    return totalCost > parseFloat(spendLimit)
  } catch (error) {
    // log error
    console.error(error)
    throw new Error('Failed to get billing information')
  }
}
