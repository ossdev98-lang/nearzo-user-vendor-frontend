import API from './api'

export const searchService = {
  search: async (query, searchType) => {
    const endpoint = searchType === 'products'
      ? `/search?products=${encodeURIComponent(query)}`
      : `/search?vendor=${encodeURIComponent(query)}`
    
    const response = await API.get(endpoint)
    return response.data
  }
}
