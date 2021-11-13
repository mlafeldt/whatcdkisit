import type { NextApiRequest, NextApiResponse } from 'next'
import { request } from '@octokit/request'

type Cdk = {
  v1: Release
  v2: Release
}

type Release = {
  version: string
  published_at: string
  changelog_url: string
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<Cdk>) {
  const { data: releases } = await request('GET /repos/{owner}/{repo}/releases', {
    owner: 'aws',
    repo: 'aws-cdk',
  })

  const findRelease = (prefix: string): Release => {
    const release = releases.find((r) => !r.draft && !r.prerelease && r.tag_name.startsWith(prefix))!
    return {
      version: release.tag_name.substring(1), // remove leading "v"
      published_at: release.published_at!,
      changelog_url: release.html_url,
    }
  }

  res.status(200).json({
    v1: findRelease('v1'),
    v2: findRelease('v2'),
  })
}
