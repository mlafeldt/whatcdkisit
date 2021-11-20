import type { NextPage } from 'next'
import { GetStaticProps } from 'next'
import Head from 'next/head'
import { request } from '@octokit/request'
import { components } from '@octokit/openapi-types'
import { formatDistanceToNowStrict } from 'date-fns'

type Release = components['schemas']['release']

type Props = {
  v1: Release
  v2: Release
  cdktf: Release
  cdk8s: Release
}

const Home: NextPage<Props> = ({ v1, v2, cdktf, cdk8s }) => {
  return (
    <div className="antialiased">
      <Head>
        <title>What CDK is it?</title>
        <meta name="description" content="What CDK is it?" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="">
        <div className="bg-gray-50 pt-12 sm:pt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">What CDK is it?</h2>
              <p className="mt-3 text-xl text-gray-500 sm:mt-4">List of CDK releases</p>
            </div>
          </div>
          <div className="mt-10 pb-12 bg-white sm:pb-16">
            <div className="relative">
              <div className="absolute inset-0 h-1/2 bg-gray-50" />
              <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto">
                  <dl className="rounded-lg bg-white shadow-lg sm:grid sm:grid-cols-4">
                    <CdkRelease name="CDK" release={v1} />
                    <CdkRelease name="CDK v2" release={v2} />
                    <CdkRelease name="cdktf" release={cdktf} />
                    <CdkRelease name="cdk8s" release={cdk8s} />
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className=""></footer>
    </div>
  )
}

const CdkRelease = ({ name, release }: { name: string; release: Release }) => {
  const publishedAt = new Date(release.published_at!)

  return (
    <div className="flex flex-col border-b border-gray-100 p-6 text-center sm:border-0 sm:border-r">
      <dt className="text-5xl font-extrabold text-indigo-600">{name}</dt>
      <dd className="mt-2 text-lg leading-6 font-medium text-gray-500 underline">
        <a href={release.html_url} target="_blank" rel="noopener noreferrer">
          {release.tag_name}
        </a>
      </dd>
      <dd className="mt-2 text-base leading-6 font-medium text-gray-500">
        {formatDistanceToNowStrict(publishedAt, { addSuffix: true })}
      </dd>
    </div>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  const requestWithAuth = request.defaults({
    headers: {
      authorization: process.env.GITHUB_TOKEN ? `token ${process.env.GITHUB_TOKEN}` : undefined,
    },
  })

  const { data: cdkReleases } = await requestWithAuth('GET /repos/{owner}/{repo}/releases', {
    owner: 'aws',
    repo: 'aws-cdk',
  })

  const getCdkRelease = (prefix: string): Release => {
    return cdkReleases.find((r) => r.tag_name.startsWith(prefix))!
  }

  const getLatestRelease = async (owner: string, repo: string) => {
    const { data } = await requestWithAuth('GET /repos/{owner}/{repo}/releases/latest', { owner, repo })
    return data
  }

  return {
    props: {
      v1: getCdkRelease('v1'),
      v2: getCdkRelease('v2'),
      cdktf: await getLatestRelease('hashicorp', 'terraform-cdk'),
      cdk8s: await getLatestRelease('cdk8s-team', 'cdk8s-core'),
    },
    revalidate: 600, // update every 10 minutes
  }
}

export default Home
