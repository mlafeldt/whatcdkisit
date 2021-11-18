import type { NextPage } from 'next'
import { GetStaticProps } from 'next'
import { request } from '@octokit/request'
import { components } from '@octokit/openapi-types'

type Release = components['schemas']['release']

type Props = {
  v1: Release
  v2: Release
}

const Page: NextPage<Props> = ({ v1, v2 }) => {
  return (
    <div>
      <h2>
        CDK {v1.tag_name} | {new Date(v1.published_at!).toDateString()} |{' '}
        <a href={v1.html_url} target="_blank" rel="noopener noreferrer">
          changelog
        </a>
      </h2>
      <h2>
        CDK {v2.tag_name} | {new Date(v2.published_at!).toDateString()} |{' '}
        <a href={v2.html_url} target="_blank" rel="noopener noreferrer">
          changelog
        </a>
      </h2>
    </div>
  )
}

export default Page

export const getStaticProps: GetStaticProps = async () => {
  const { data: cdkReleases } = await request('GET /repos/{owner}/{repo}/releases', {
    owner: 'aws',
    repo: 'aws-cdk',
  })

  const getCdkRelease = (prefix: string): Release => {
    return cdkReleases.find((r) => r.tag_name.startsWith(prefix))!
  }

  return {
    props: {
      v1: getCdkRelease('v1'),
      v2: getCdkRelease('v2'),
    },
    revalidate: 600, // update every 10 minutes
  }
}
