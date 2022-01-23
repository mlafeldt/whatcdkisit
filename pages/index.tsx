import type { NextPage } from 'next'
import { GetStaticProps } from 'next'
import Head from 'next/head'
import { request } from '@octokit/request'
import { components } from '@octokit/openapi-types'
import { formatDistanceToNowStrict } from 'date-fns'
import { FaGithub, FaTwitter } from 'react-icons/fa'
import { HiInformationCircle } from 'react-icons/hi'

type Release = components['schemas']['release']

type Props = {
  v1: Release
  v2: Release
  cdktf: Release
  cdk8s: Release
}

const Home: NextPage<Props> = ({ v1, v2, cdktf, cdk8s }) => {
  const title = 'What CDK is it?'
  const description = 'An overview of AWS CDK projects and their latest releases'
  const card = `https://whatcdkisit.com/twittercard.png`

  return (
    <div className="antialiased flex flex-col min-h-screen">
      <Head>
        <title>{title}</title>

        <meta name="description" content={description} />

        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={card} />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:site" content="@mlafeldt" />

        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:image" content={card} />
        <meta property="og:type" content="website" />

        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="flex-1">
        <div className="bg-gray-50 pt-12 sm:pt-24 md:pt-32">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7.5xl font-extrabold text-gray-900">{title}</h2>
              <p className="mt-2 text-lg md:text-2xl text-gray-500 sm:mt-4">
                An overview of{' '}
                <a
                  className="underline hover:text-gray-600"
                  href="https://aws.amazon.com/cdk/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  AWS CDK
                </a>{' '}
                projects and their latest releases
              </p>
            </div>
          </div>
          <div className="mt-6 pb-12 bg-white sm:pb-16 md:mt-16">
            <div className="relative">
              <div className="absolute inset-0 h-1/2 bg-gray-50" />
              <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <dl className="rounded-lg bg-white shadow-lg md:grid md:grid-cols-4">
                  <CdkRelease name="CDK" release={v2} />
                  <CdkRelease name="CDK v1" release={v1} />
                  <CdkRelease name="cdktf" release={cdktf} />
                  <CdkRelease name="cdk8s" release={cdk8s} />
                </dl>
              </div>
            </div>
            <div className="mt-6 p-4 rounded-md bg-blue-50 md:mt-16 max-w-fit mx-auto">
              <div className="flex">
                <div className="flex-shrink-0">
                  <HiInformationCircle className="h-5 w-5 text-blue-400" aria-hidden="true" />
                </div>
                <div className="ml-3 flex-1 md:flex md:justify-between">
                  <p className="text-sm text-blue-700">
                    CDK v1 enters maintenance mode on June 1, 2022 and reaches end-of-life on June 1, 2023.{' '}
                    <a
                      className="underline hover:text-blue-800"
                      href="https://docs.aws.amazon.com/cdk/v2/guide/migrating-v2.html"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Consider upgrading to v2.
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-gray-50">
        <div className="max-w-7xl mx-auto py-12 px-4 overflow-hidden sm:px-6 lg:px-8">
          <p className="-mx-5 -my-2 text-center text-base text-gray-400">Made by Mathias Lafeldt</p>
          <div className="mt-8 flex justify-center space-x-6">
            <a
              key="GitHub"
              href="https://github.com/mlafeldt/whatcdkisit"
              target="_blank"
              rel="noreferrer"
              className="text-gray-400 hover:text-gray-500"
            >
              <span className="sr-only">GitHub</span>
              <FaGithub />
            </a>
            <a
              key="Twitter"
              href="https://twitter.com/mlafeldt"
              target="_blank"
              rel="noreferrer"
              className="text-gray-400 hover:text-gray-500"
            >
              <span className="sr-only">Twitter</span>
              <FaTwitter />
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}

const CdkRelease = ({ name, release }: { name: string; release: Release }) => {
  const publishedAt = new Date(release.published_at!)

  return (
    <div className="flex flex-col border-b border-gray-100 p-6 text-center md:border-0 md:border-r">
      <dt className="text-3xl md:text-5xl font-extrabold text-indigo-600">{name}</dt>
      <dd className="mt-4 text-xl leading-6 font-normal text-gray-500 hover:text-gray-600 underline">
        <a href={release.html_url} target="_blank" rel="noopener noreferrer">
          {release.tag_name}
        </a>
      </dd>
      <dd className="mt-4 text-lg leading-6 font-normal text-gray-500">
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
