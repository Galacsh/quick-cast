import { useCallback, useEffect, useMemo, useState } from 'react'
import { Action, ActionPanel, List } from '@/cast/api'
import type { History } from '@/types'
import { useNavigation, useSearch } from '@/cast/contexts'
import { history as request } from '@/extensions/actions'
import OpenInGroup from './open-in-group'

export default function Command() {
  return (
    <List
      filtering={false}
      navigationTitle="Manage Histories"
      searchBarPlaceholder="Search history for a week...">
      <HistoryList />
    </List>
  )
}

function HistoryList() {
  const { search } = useSearch()
  const { push } = useNavigation()

  const [histories, setHistories] = useState<History[]>([])
  const startTime = useMemo(() => {
    const date = new Date()
    date.setDate(date.getDate() - 7)
    return date.valueOf()
  }, [])

  const loadHistories = useCallback(async () => {
    const result = await chrome.history.search({
      text: search,
      startTime,
    })
    setHistories(result)
  }, [search, startTime])

  const open = useCallback(async (history: History) => {
    await request.open({ history })
    window.close()
  }, [])

  const openInGroup = useCallback(
    async (history: History) => {
      push(<OpenInGroup history={history} />)
    },
    [push]
  )

  const deleteHistory = useCallback(async (history: History) => {
    await request.deleteHistory({ history })
  }, [])

  useEffect(() => {
    loadHistories()
  }, [loadHistories])

  useEffect(() => {
    chrome.history.onVisited.addListener(loadHistories)
    chrome.history.onVisitRemoved.addListener(loadHistories)
    return () => {
      chrome.history.onVisited.removeListener(loadHistories)
      chrome.history.onVisitRemoved.removeListener(loadHistories)
    }
  }, [loadHistories])

  return histories.map((history) => (
    <List.Item
      key={history.id}
      icon={history.url ? faviconOf(history.url) : undefined}
      title={history.title || 'Untitled'}
      accessories={
        history.url ? (
          <span className="text-cmdk-section-title">
            {rootDomainOf(history.url)}
          </span>
        ) : undefined
      }
      actions={
        <ActionPanel>
          <Action
            title="Open"
            onAction={() => open(history)}
            shortcut={{ code: 'Enter' }}
          />
          <Action
            title="Open in group"
            onAction={() => openInGroup(history)}
            shortcut={{ code: 'Enter', ctrlMeta: true }}
          />
          <Action
            title="Remove"
            onAction={() => deleteHistory(history)}
            shortcut={{ code: 'KeyD', ctrlMeta: true }}
          />
        </ActionPanel>
      }
    />
  ))
}

function faviconSrc(url: string) {
  const _url = new URL(chrome.runtime.getURL('/_favicon/'))
  _url.searchParams.set('pageUrl', url)
  _url.searchParams.set('size', '32')
  return _url.toString()
}

function faviconOf(url: string) {
  const src = faviconSrc(url)
  const BookmarkFavicon = (props: { className?: string }) => (
    <img src={src} {...props} />
  )
  return BookmarkFavicon
}

function rootDomainOf(url: string) {
  const _url = new URL(url)
  const domainParts = _url.hostname.split('.')
  // If the domain has more than 2 parts, assume the last two are the main domain
  // Example: 'www.example.co.uk' -> 'example.co.uk'
  if (domainParts.length > 2) {
    return domainParts.slice(-2).join('.')
  }
  // If the domain has only 2 parts or fewer, return it as is
  return _url.hostname
}
