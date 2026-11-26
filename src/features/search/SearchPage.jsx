import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import api from '../../lib/api'
import { Search, MapPin, Calendar, Users, Sparkles } from 'lucide-react'
import HotelCard from '../properties/HotelCard'
import toast from 'react-hot-toast'

const getTomorrow = (dateStr) => {
  const d = dateStr ? new Date(dateStr) : new Date()
  d.setDate(d.getDate() + 1)
  return d.toISOString().split('T')[0]
}

const today = new Date().toISOString().split('T')[0]
const tomorrow = getTomorrow(today)

const POPULAR_CITIES = ['all', 'hyderabad', 'mumbai', 'bangalore', 'goa', 'delhi', 'jaipur', 'chennai']

export default function SearchPage() {
  const navigate = useNavigate()
  const [params, setParams] = useState({ city: 'hyderabad', checkIn: today, checkOut: tomorrow, guests: 1 })
  const [search, setSearch] = useState({ city: 'hyderabad', checkIn: today, checkOut: tomorrow, guests: 1 })
  const [page, setPage]     = useState(1)
  const [sortBy, setSortBy] = useState('price')

  // When checkIn changes, ensure checkOut is at least 1 day after
  const handleCheckInChange = (newCheckIn) => {
    let newCheckOut = params.checkOut
    if (!newCheckOut || newCheckOut <= newCheckIn) {
      newCheckOut = getTomorrow(newCheckIn)
    }
    setParams({ ...params, checkIn: newCheckIn, checkOut: newCheckOut })
  }

  const { data, isLoading, error } = useQuery({
    queryKey: ['hotels', search, page, sortBy],
    queryFn: async () => {
      const { data } = await api.get('/search/hotels', {
        params: { ...search, page, limit: 10, sortBy },
      })
      return data
    },
  })

  const { data: citiesData } = useQuery({
    queryKey: ['cities'],
    queryFn: async () => { const { data } = await api.get('/search/cities'); return data.data },
  })

  const handleSearch = (e) => {
    if (e) e.preventDefault()
    let checkOut = params.checkOut
    if (!checkOut || checkOut <= params.checkIn) {
      checkOut = getTomorrow(params.checkIn)
      setParams({ ...params, checkOut })
    }
    setPage(1)
    setSearch({ ...params, checkOut })
  }

  const handleCityPillClick = (cityName) => {
    const updated = { ...params, city: cityName }
    setParams(updated)
    setPage(1)
    setSearch(updated)
  }

  const hotels     = data?.data || []
  const pagination = data?.pagination

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Search Header */}
      <div className="bg-gradient-to-r from-brand-600 to-orange-500 text-white py-8 sm:py-14 px-3 sm:px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-2xl sm:text-4xl font-extrabold mb-1.5 sm:mb-2 tracking-tight">Ajintara Stays</h1>
          <p className="text-xs sm:text-base text-orange-100 mb-5 sm:mb-8 font-medium">Discover verified hotels across India with instant guaranteed bookings</p>

          <form onSubmit={handleSearch} className="bg-white rounded-2xl p-3 sm:p-4 shadow-xl grid grid-cols-1 md:grid-cols-5 gap-2.5 sm:gap-3">
            <div className="relative md:col-span-1">
              <MapPin size={16} className="absolute left-3 top-3.5 text-gray-400" />
              <input
                className="input pl-9 text-gray-900 text-sm" placeholder="Destination (e.g. Hyderabad or All)"
                list="cities-list"
                value={params.city} onChange={(e) => setParams({ ...params, city: e.target.value })} />
              <datalist id="cities-list">
                {citiesData?.map((c) => <option key={c} value={c} />)}
              </datalist>
            </div>
            <div className="relative">
              <Calendar size={16} className="absolute left-3 top-3.5 text-gray-400" />
              <input className="input pl-9 text-gray-900 text-sm" type="date" required min={today}
                value={params.checkIn} onChange={(e) => handleCheckInChange(e.target.value)} />
            </div>
            <div className="relative">
              <Calendar size={16} className="absolute left-3 top-3.5 text-gray-400" />
              <input className="input pl-9 text-gray-900 text-sm" type="date" required min={getTomorrow(params.checkIn)}
                value={params.checkOut} onChange={(e) => setParams({ ...params, checkOut: e.target.value })} />
            </div>
            <div className="relative">
              <Users size={16} className="absolute left-3 top-3.5 text-gray-400" />
              <input className="input pl-9 text-gray-900 text-sm" type="number" min={1} max={10} placeholder="Guests"
                value={params.guests} onChange={(e) => setParams({ ...params, guests: +e.target.value })} />
            </div>
            <button type="submit" className="btn-primary py-3 flex items-center justify-center gap-2 font-bold shadow-md shadow-brand-500/20">
              <Search size={18} /> Search
            </button>
          </form>

          {/* Quick city pills with smooth horizontal swipe on mobile */}
          <div className="flex items-center gap-1.5 sm:gap-2 mt-4 text-xs overflow-x-auto pb-1 px-1 scrollbar-none sm:justify-center sm:flex-wrap">
            <span className="text-orange-200 shrink-0 font-medium hidden sm:inline">Popular:</span>
            {POPULAR_CITIES.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => handleCityPillClick(c)}
                className={`capitalize px-3 py-1.5 rounded-full font-medium transition-all shrink-0 ${
                  params.city?.toLowerCase() === c
                    ? 'bg-white text-brand-600 font-bold shadow-sm'
                    : 'bg-white/20 hover:bg-white/30 text-white'
                }`}>
                {c === 'all' ? 'All Hotels' : c}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-6 sm:py-8">
        {(() => {
          const displayDest = !search?.city || search.city.toLowerCase() === 'all'
            ? 'across all destinations in India'
            : `in ${search.city}`;
          return (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-slate-800">
                  {isLoading ? 'Searching verified hotels...' : `${pagination?.total || 0} properties available ${displayDest}`}
                </h2>
                {search && (
                  <p className="text-xs text-slate-500 mt-0.5">
                    Stay: {search.checkIn} to {search.checkOut} · {search.guests} Guest(s)
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2 self-end sm:self-auto">
                <span className="text-xs text-slate-400 hidden sm:inline">Sort by:</span>
                <select className="input w-auto text-xs sm:text-sm py-1.5 px-3 bg-white"
                  value={sortBy} onChange={(e) => { setSortBy(e.target.value); setPage(1) }}>
                  <option value="price">Price: Low to High</option>
                  <option value="-price">Price: High to Low</option>
                </select>
              </div>
            </div>
          );
        })()}

        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="card animate-pulse h-72 bg-gray-200 rounded-xl" />
            ))}
          </div>
        )}

        {error && (
          <div className="card p-8 text-center text-red-500 max-w-lg mx-auto">
            <p className="font-medium">Could not reach the database or server.</p>
            <p className="text-xs text-gray-500 mt-2">
              Make sure your backend is running (`npm run server` or `npm run dev`) and MongoDB is connected.
            </p>
          </div>
        )}

        {!isLoading && !error && hotels.length === 0 && (
          <div className="card p-12 text-center text-slate-500 max-w-xl mx-auto border border-slate-200/90 bg-white shadow-xs">
            <MapPin size={48} className="mx-auto mb-3 text-slate-300" />
            <p className="text-lg font-bold text-slate-800">
              No hotels currently listed {!search?.city || search.city.toLowerCase() === 'all' ? 'across all destinations' : `in ${search.city}`}
            </p>
            <p className="text-sm mt-1 text-slate-500">
              Try exploring one of India's top travel destinations below:
            </p>
            <div className="flex flex-wrap gap-2 justify-center mt-5">
              {['all', 'hyderabad', 'mumbai', 'bangalore', 'goa', 'delhi', 'jaipur'].map((c) => (
                <button
                  key={c}
                  onClick={() => handleCityPillClick(c)}
                  className="px-3.5 py-1.5 rounded-full text-xs font-bold capitalize bg-slate-100 hover:bg-brand-500 hover:text-white transition-all text-slate-700">
                  {c === 'all' ? 'Explore All Cities' : `Explore ${c}`}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {hotels.map((hotel) => (
            <HotelCard key={hotel._id} hotel={hotel} searchParams={search} />
          ))}
        </div>

        {pagination && pagination.pages > 1 && (
          <div className="flex justify-center gap-2 mt-10">
            {[...Array(pagination.pages)].map((_, i) => (
              <button key={i}
                onClick={() => setPage(i + 1)}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${page === i + 1 ? 'bg-brand-500 text-white' : 'bg-white border border-gray-200 hover:bg-gray-50'}`}>
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
