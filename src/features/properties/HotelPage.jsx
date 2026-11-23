import { useParams, useLocation, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import api from '../../lib/api'
import { Star, MapPin, IndianRupee, ArrowLeft, Building2 } from 'lucide-react'

export default function HotelPage() {
  const { id }    = useParams()
  const { state } = useLocation()
  const navigate  = useNavigate()
  const search    = state?.searchParams

  const { data: propData, isLoading } = useQuery({
    queryKey: ['property', id],
    queryFn: async () => { const { data } = await api.get(`/properties/${id}`); return data.data },
  })

  const { data: roomsData } = useQuery({
    queryKey: ['rooms', id],
    queryFn: async () => { const { data } = await api.get(`/properties/${id}/rooms`); return data.data },
  })

  if (isLoading) return <div className="flex justify-center py-24"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-brand-500" /></div>
  if (!propData) return <p className="text-center py-16 text-gray-500">Hotel not found.</p>

  const stars = Array.from({ length: 5 }, (_, i) => i < propData.starRating)

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 hover:text-brand-600 mb-6">
        <ArrowLeft size={18} /> Back to search
      </button>

      {/* Images */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-8 rounded-2xl overflow-hidden">
        {propData.images?.slice(0, 3).map((img, i) => (
          <img key={i} src={img} alt={propData.name}
            className={`w-full object-cover ${i === 0 ? 'md:col-span-2 h-80' : 'h-40 md:h-auto'}`} />
        ))}
        {!propData.images?.length && (
          <div className="col-span-3 h-64 bg-slate-100 rounded-2xl flex flex-col items-center justify-center text-slate-300 gap-2">
            <Building2 size={56} />
            <span className="text-sm font-medium text-slate-400">No photos available</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Details */}
        <div className="lg:col-span-2 space-y-6">
          <div>
            <h1 className="text-3xl font-bold">{propData.name}</h1>
            <div className="flex items-center gap-3 mt-2">
              <div className="flex gap-0.5">
                {stars.map((f, i) => <Star key={i} size={16} className={f ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 fill-gray-200'} />)}
              </div>
              <span className="flex items-center gap-1 text-gray-500 text-sm"><MapPin size={14} /> {propData.address}</span>
            </div>
          </div>

          <div className="card p-5">
            <h2 className="font-semibold mb-2">About Property</h2>
            <p className="text-gray-600">{propData.description}</p>
          </div>

          {propData.amenities?.length > 0 && (
            <div className="card p-5">
              <h2 className="font-semibold mb-3">Amenities</h2>
              <div className="flex flex-wrap gap-2">
                {propData.amenities.map((a) => (
                  <span key={a} className="badge bg-brand-50 text-brand-700 px-3 py-1">{a}</span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: Room Types */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Select Room</h2>
          {roomsData?.length === 0 && <p className="text-gray-400 text-sm">No rooms currently available.</p>}
          {roomsData?.map((room) => (
            <div key={room._id} className="card p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold">{room.name}</h3>
                  <p className="text-sm text-gray-500">Max {room.maxGuests} guests · {room.totalRooms} total rooms</p>
                </div>
                <div className="text-right">
                  <div className="flex items-center text-brand-600 font-bold">
                    <IndianRupee size={14} />
                    <span>{room.basePrice.toLocaleString('en-IN')}</span>
                  </div>
                  <span className="text-xs text-gray-400">/night base</span>
                </div>
              </div>
              {room.amenities?.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {room.amenities.map((a) => <span key={a} className="badge bg-gray-100 text-gray-500 text-xs">{a}</span>)}
                </div>
              )}
              {search ? (
                <button
                  onClick={() => navigate(`/book/${room._id}`, { state: { room, property: propData, searchParams: search } })}
                  className="btn-primary w-full mt-3 text-sm">
                  Book Room
                </button>
              ) : (
                <p className="text-xs text-gray-400 mt-2 text-center">Select dates on search page to book</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

