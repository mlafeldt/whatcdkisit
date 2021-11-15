import type { NextPage } from 'next'
import { GetStaticProps } from 'next'
import { request } from '@octokit/request'

type Props = {
  v1: Release
  v2: Release
}

type Release = {
  version: string
  published_at: string
  changelog_url: string
}

const Page: NextPage<Props> = ({ v1, v2 }) => {
  return (
    <div>
      <h2>
        CDK {v1.version} | {new Date(v1.published_at).toDateString()} |{' '}
        <a href={v1.changelog_url} target="_blank" rel="noopener noreferrer">
          changelog
        </a>
      </h2>
      <h2>
        CDK {v2.version} | {new Date(v2.published_at).toDateString()} |{' '}
        <a href={v2.changelog_url} target="_blank" rel="noopener noreferrer">
          changelog
        </a>
      </h2>
    </div>
  )
}

export default Page

export const getStaticProps: GetStaticProps = async () => {
  const { data: releases } = await request('GET /repos/{owner}/{repo}/releases', {
    owner: 'aws',
    repo: 'aws-cdk',
  })

  const findRelease = (prefix: string): Release => {
    const release = releases.find((r) => r.tag_name.startsWith(prefix))!
    return {
      version: release.tag_name.substring(1), // remove leading "v"
      published_at: release.published_at!,
      changelog_url: release.html_url,
    }
  }

  return {
    props: {
      v1: findRelease('v1'),
      v2: findRelease('v2'),
    },
    revalidate: 600, // update every 10 minutes
  }
}
