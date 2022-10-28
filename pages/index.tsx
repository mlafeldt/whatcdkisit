import type { NextPage } from 'next'
import { GetStaticProps } from 'next'
import Head from 'next/head'
import { request } from '@octokit/request'
import type { components } from '@octokit/openapi-types'
import { formatDistanceToNowStrict } from 'date-fns'
import { FaGithub, FaTwitter } from 'react-icons/fa'
import { HiInformationCircle } from 'react-icons/hi'

type Release = components['schemas']['release']

type Props = { [name: string]: Release }

const Home: NextPage<Props> = (props) => {
  const title = 'What CDK is it?'
  const description = 'An overview of AWS CDK projects and their latest releases'
  const card = 'https://whatcdkisit.com/twittercard.png'

  return (
    <div className="flex min-h-screen flex-col antialiased">
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
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-4xl text-center">
              <h2 className="text-4xl font-extrabold text-gray-900 sm:text-5xl md:text-6xl lg:text-7xl">
                <span className="relative inline-flex">
                  <span
                    className="absolute inset-0 bg-yellow-300"
                    style={{ transform: 'rotate(-1.5deg) scaleX(1.05)' }}
                  ></span>
                  <span className="relative">{title}</span>
                </span>
              </h2>
              <p className="mt-2 text-lg text-gray-500 sm:mt-4 md:text-2xl">
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
          <div className="mt-6 bg-white pb-12 sm:pb-16 md:mt-16">
            <div className="relative">
              <div className="absolute inset-0 h-1/2 bg-gray-50" />
              <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <dl className="rounded-lg bg-white shadow-lg md:grid md:grid-cols-4">
                  {Object.entries(props).map(([name, release]) => (
                    <CdkRelease name={name} release={release} key={name} />
                  ))}
                </dl>
              </div>
            </div>
            <div className="mx-auto mt-6 max-w-prose rounded-md bg-blue-50 p-4 md:mt-16">
              <div className="flex">
                <div className="flex-shrink-0">
                  <HiInformationCircle className="h-5 w-5 text-blue-400" aria-hidden="true" />
                </div>
                <div className="ml-3 flex-1 md:flex md:justify-between">
                  <p className="text-sm text-blue-700">
                    The older CDK v1 is now in maintenance mode.{' '}
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
        <div className="mx-auto max-w-7xl overflow-hidden py-12 px-4 sm:px-6 lg:px-8">
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
      <dt className="text-3xl font-extrabold text-indigo-600 md:text-5xl">{name}</dt>
      <dd className="mt-4 text-xl font-normal leading-6 text-gray-500 underline hover:text-gray-600">
        <a href={release.html_url} target="_blank" rel="noopener noreferrer">
          {release.tag_name}
        </a>
      </dd>
      <dd className="mt-4 text-lg font-normal leading-6 text-gray-500">
        {formatDistanceToNowStrict(publishedAt, { addSuffix: true })}
      </dd>
    </div>
  )
}

const requestWithAuth = request.defaults({
  headers: {
    authorization: process.env.GITHUB_TOKEN ? `token ${process.env.GITHUB_TOKEN}` : undefined,
  },
})

export const getStaticProps: GetStaticProps = async () => {
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
      CDK: getCdkRelease('v2'),
      'CDK v1': getCdkRelease('v1'),
      cdktf: await getLatestRelease('hashicorp', 'terraform-cdk'),
      cdk8s: await getLatestRelease('cdk8s-team', 'cdk8s-core'),
    },
    revalidate: 60 * 60, // update every hour
  }
}

export default Home
