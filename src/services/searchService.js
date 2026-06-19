import API from './api'

export const searchService = {
  search: async (query, searchType, latitude, longitude) => {
    let endpoint = searchType === 'products'
      ? `/search?products=${encodeURIComponent(query)}`
      : `/search?vendor=${encodeURIComponent(query)}`
    
    if (latitude && longitude) {
      endpoint += `&latitude=${latitude}&longitude=${longitude}`
    }
    
    const response = await API.get(endpoint)
    return response.data
  }
}
