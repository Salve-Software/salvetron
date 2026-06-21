/** @jsxRuntime automatic */
/** @jsxImportSource react */
import { Box, Text } from 'ink'

interface SearchBarProps {
  query: string
  width: number
  placeholder?: string
  resultCount: number
  totalCount: number
}

const RESERVED_WIDTH = 20

export function SearchBar({ query, width, placeholder = 'Filter by text…', resultCount, totalCount }: SearchBarProps) {
  const maxQueryWidth = Math.max(4, width - RESERVED_WIDTH)
  const visibleQuery = query.slice(-maxQueryWidth)

  return (
    <Box>
      <Text color="cyan">/ </Text>
      {query.length ? <Text>{visibleQuery}</Text> : <Text dimColor>{placeholder}</Text>}
      <Text color="cyan">▏</Text>
      <Text dimColor>  {resultCount}/{totalCount}</Text>
    </Box>
  )
}
