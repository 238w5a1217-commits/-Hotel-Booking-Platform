import { Link } from 'react-router-dom'
import { Star, MapPin, IndianRupee, Sparkles, ShieldCheck } from 'lucide-react'

export default function HotelCard({ hotel, searchParams }) {
  const rawImage = hotel.images?.[0] || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800'
  // Auto-compress and resize Unsplash image for sub-second mobile loading
  const imageUrl = rawImage.includes('images.unsplash.com')
    ? `${rawImage.split('?')[0]}?auto=format&fit=crop&w=640&q=75`
    : rawImage

  return (
    <Link
      to={`/hotels/${hotel._id}`}
      state={{ searchParams }}
      className="card card-hover overflow-hidden flex flex-col group border border-slate-200/90 bg-white">
      {/* Image Thumbnail with Overlay */}
      <div className="relative h-48 sm:h-52 w-full overflow-hidden bg-slate-100">
        <img
          src={imageUrl}
          alt={hotel.name}
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-white/95 backdrop-blur-md text-slate-800 shadow-sm border border-slate-200/50">
            <MapPin size={11} className="text-brand-600" />
            <span className="capitalize">{hotel.city}</span>
          </span>

          {hotel.starRating && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-950/75 backdrop-blur-md text-amber-300 shadow-sm">
              <Star size={11} className="fill-amber-300 text-amber-300" />
              {hotel.starRating} Star
            </span>
          )}
        </div>

        {/* Verified Badge */}
        <div className="absolute bottom-2.5 left-3 text-white/90 text-[11px] font-medium flex items-center gap-1 drop-shadow-sm">
          <ShieldCheck size={13} className="text-emerald-400" />
          <span>Verified Ajintara Partner</span>
        </div>
      </div>

      {/* Hotel Information */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-bold text-slate-900 group-hover:text-brand-600 transition-colors line-clamp-1 text-base">
              {hotel.name}
            </h3>
          </div>

          <p className="text-xs text-slate-500 line-clamp-1 mt-1">
            {hotel.address}
          </p>

          {/* Amenities Chips */}
          {hotel.amenities?.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-3">
              {hotel.amenities.slice(0, 3).map((a) => (
                <span
                  key={a}
                  className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[11px] font-medium">
                  {a}
                </span>
              ))}
              {hotel.amenities.length > 3 && (
                <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-400 text-[11px]">
                  +{hotel.amenities.length - 3}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Price & CTA Section */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-end justify-between">
          <div>
            <p className="text-[11px] text-slate-400 font-medium">Total for stay</p>
            <div className="flex items-baseline gap-0.5 text-brand-600 font-extrabold text-lg">
              <span className="text-sm font-semibold">₹</span>
              <span>{hotel.minPrice?.toLocaleString('en-IN')}</span>
            </div>
            <p className="text-[10px] text-slate-400">+ applicable GST</p>
          </div>

          <span className="btn-primary text-xs py-2 px-3.5 shadow-none group-hover:shadow-md">
            View Rooms
          </span>
        </div>
      </div>
    </Link>
  )
}
