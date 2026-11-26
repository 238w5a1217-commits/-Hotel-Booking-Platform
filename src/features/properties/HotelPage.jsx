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
    <div className="max-w-6xl mx-auto px-4 py-6 sm:py-8 pb-24 sm:pb-8">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-500 hover:text-brand-600 mb-4 sm:mb-6 font-medium text-sm transition-colors">
        <ArrowLeft size={18} /> Back to search
      </button>

      {/* Images Gallery */}
      <div className="mb-6 sm:mb-8 rounded-2xl overflow-hidden shadow-sm border border-slate-200/80 bg-slate-50">
        {!propData.images || propData.images.length === 0 ? (
          <div className="h-56 sm:h-80 md:h-96 w-full flex flex-col items-center justify-center text-slate-300 gap-2">
            <Building2 size={56} />
            <span className="text-sm font-medium text-slate-400">No photos available</span>
          </div>
        ) : propData.images.length === 1 ? (
          <div className="h-56 sm:h-80 md:h-[420px] w-full overflow-hidden">
            <img
              src={propData.images[0]}
              alt={propData.name}
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover"
            />
          </div>
        ) : propData.images.length === 2 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 h-64 sm:h-80 md:h-[420px] w-full">
            {propData.images.slice(0, 2).map((img, i) => (
              <img
                key={i}
                src={img}
                alt={`${propData.name} ${i + 1}`}
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 h-64 sm:h-80 md:h-[420px] w-full">
            <div className="md:col-span-2 h-full overflow-hidden">
              <img
                src={propData.images[0]}
                alt={propData.name}
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="hidden md:grid grid-rows-2 gap-2 h-full">
              {propData.images.slice(1, 3).map((img, i) => (
                <div key={i} className="h-full overflow-hidden">
                  <img
                    src={img}
                    alt={`${propData.name} ${i + 2}`}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        {/* Left: Details */}
        <div className="lg:col-span-2 space-y-5 sm:space-y-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">{propData.name}</h1>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-2">
              <div className="flex gap-0.5">
                {stars.map((f, i) => <Star key={i} size={15} className={f ? 'text-amber-400 fill-amber-400' : 'text-slate-200 fill-slate-200'} />)}
              </div>
              <span className="flex items-center gap-1 text-slate-500 text-xs sm:text-sm"><MapPin size={14} className="text-brand-600 shrink-0" /> {propData.address}</span>
            </div>
          </div>

          <div className="card p-4 sm:p-5 border border-slate-200/90 bg-white">
            <h2 className="font-bold text-slate-900 mb-2 text-sm sm:text-base">About Property</h2>
            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">{propData.description}</p>
          </div>

          {propData.amenities?.length > 0 && (
            <div className="card p-4 sm:p-5 border border-slate-200/90 bg-white">
              <h2 className="font-bold text-slate-900 mb-3 text-sm sm:text-base">Amenities & Highlights</h2>
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {propData.amenities.map((a) => (
                  <span key={a} className="badge bg-brand-50 text-brand-700 px-3 py-1 font-semibold text-xs border border-brand-200/60">{a}</span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: Room Types */}
        <div id="rooms-section" className="space-y-4 scroll-mt-20">
          <div className="flex items-center justify-between">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">Select Room</h2>
            <span className="text-xs text-slate-500 font-medium">{roomsData?.length || 0} room types available</span>
          </div>
          {roomsData?.length === 0 && <p className="text-slate-400 text-sm">No rooms currently available.</p>}
          {roomsData?.map((room) => (
            <div key={room._id} className="card p-4 sm:p-5 border border-slate-200/90 bg-white shadow-xs hover:border-brand-300 transition-colors">
              <div className="flex justify-between items-start gap-2">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm sm:text-base">{room.name}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Max {room.maxGuests} guests · {room.totalRooms} rooms in hotel</p>
                </div>
                <div className="text-right shrink-0">
                  <div className="flex items-center justify-end text-brand-600 font-extrabold text-base sm:text-lg">
                    <IndianRupee size={15} />
                    <span>{room.basePrice.toLocaleString('en-IN')}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium">/night base</span>
                </div>
              </div>
              {room.amenities?.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2.5">
                  {room.amenities.map((a) => <span key={a} className="badge bg-slate-100 text-slate-600 text-[10px] font-medium">{a}</span>)}
                </div>
              )}
              {search ? (
                <button
                  onClick={() => navigate(`/book/${room._id}`, { state: { room, property: propData, searchParams: search } })}
                  className="btn-primary w-full mt-3 text-xs sm:text-sm py-2.5 font-bold shadow-sm shadow-brand-500/20">
                  Book Room
                </button>
              ) : (
                <p className="text-xs text-slate-400 mt-2 text-center">Select dates on search page to book</p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Mobile Sticky Booking Footer */}
      {roomsData && roomsData.length > 0 && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 p-3 bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-xl flex items-center justify-between z-40">
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">From</p>
            <div className="flex items-baseline gap-0.5 text-brand-600 font-extrabold text-lg">
              <span className="text-xs font-semibold">₹</span>
              <span>{Math.min(...roomsData.map((r) => r.basePrice)).toLocaleString('en-IN')}</span>
              <span className="text-[11px] font-normal text-slate-400">/night</span>
            </div>
          </div>
          <button
            onClick={() => {
              const el = document.getElementById('rooms-section');
              el?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="btn-primary text-xs py-2.5 px-4 font-bold shadow-md shadow-brand-500/20">
            View Available Rooms
          </button>
        </div>
      )}
    </div>
  )
}

