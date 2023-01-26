/* eslint-disable @typescript-eslint/no-var-requires */
import { ApolloClient, InMemoryCache, from, HttpLink } from '@apollo/client'
import { useMemo } from 'react'

let apolloClient: any

function createIsomorphLink() {
  if (typeof window === 'undefined') {
    const { SchemaLink } = require('@apollo/client/link/schema')
    const { schema } = require('./nexusSchema')
    return new SchemaLink({ schema })
  } else {
    const httpLink = new HttpLink({
      uri: `${process.env.SERVER_URL ?? 'http://localhost:3000'}/api/graphql`,
      credentials: 'same-origin',
    })
    return from([httpLink])
  }
}

function createApolloClient() {
  return new ApolloClient({
    ssrMode: typeof window === 'undefined',
    link: createIsomorphLink(),
    cache: new InMemoryCache(),
    credentials: 'same-origin',
  })
}

export function initializeApollo(initialState = null) {
  const _apolloClient = apolloClient ?? createApolloClient()

  // If your page has Next.js data fetching methods that use Apollo Client, the initial state
  // gets hydrated here
  if (initialState) {
    _apolloClient.cache.restore(initialState)
  }
  // For SSG and SSR always create a new Apollo Client
  if (typeof window === 'undefined') return _apolloClient
  // Create the Apollo Client once in the client
  if (!apolloClient) apolloClient = _apolloClient

  return _apolloClient
}

export function useApollo(initialState: any) {
  return useMemo(() => initializeApollo(initialState), [initialState])
}
