import type { NextPage } from 'next'
import { GetStaticProps } from 'next'
import { request } from '@octokit/request'
import { components } from '@octokit/openapi-types'

type Release = components['schemas']['release']

type Props = {
  v1: Release
  v2: Release
  tf: Release
}

const Page: NextPage<Props> = ({ v1, v2, tf }) => {
  return (
    <div className="bg-gray-50 pt-12 sm:pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">What CDK is it?</h2>
          <p className="mt-3 text-xl text-gray-500 sm:mt-4">
            Lorem ipsum dolor, sit amet consectetur adipisicing elit. Repellendus repellat laudantium.
          </p>
        </div>
      </div>
      <div className="mt-10 pb-12 bg-white sm:pb-16">
        <div className="relative">
          <div className="absolute inset-0 h-1/2 bg-gray-50" />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <dl className="rounded-lg bg-white shadow-lg sm:grid sm:grid-cols-3">
                <CdkRelease name="CDK" release={v1} />
                <CdkRelease name="CDK v2" release={v2} />
                <CdkRelease name="CDKTF" release={tf} />
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const CdkRelease = ({ name, release }: { name: string; release: Release }) => {
  return (
    <div className="flex flex-col border-b border-gray-100 p-6 text-center sm:border-0 sm:border-r">
      <dt className="text-5xl font-extrabold text-indigo-600">{name}</dt>
      <dd className="mt-2 text-lg leading-6 font-medium text-gray-500 underline">
        <a href={release.html_url} target="_blank" rel="noopener noreferrer">
          {release.tag_name}
        </a>
      </dd>
      <dd className="mt-2 text-lg leading-6 font-medium text-gray-500">
        {new Date(release.published_at!).toDateString()}
      </dd>
    </div>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  const { data: cdkReleases } = await request('GET /repos/{owner}/{repo}/releases', {
    owner: 'aws',
    repo: 'aws-cdk',
  })

  const getCdkRelease = (prefix: string): Release => {
    return cdkReleases.find((r) => r.tag_name.startsWith(prefix))!
  }

  const { data: tfRelease } = await request('GET /repos/{owner}/{repo}/releases/latest', {
    owner: 'hashicorp',
    repo: 'terraform-cdk',
  })

  return {
    props: {
      v1: getCdkRelease('v1'),
      v2: getCdkRelease('v2'),
      tf: tfRelease,
    },
    revalidate: 600, // update every 10 minutes
  }
}

export default Page
