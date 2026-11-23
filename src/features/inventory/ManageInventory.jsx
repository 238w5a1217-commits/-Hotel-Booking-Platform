import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import api from '../../lib/api'
import toast from 'react-hot-toast'
import { ArrowLeft, Save, Plus, BedDouble, Calendar } from 'lucide-react'

export default function ManageInventory() {
  const { propertyId } = useParams()
  const navigate       = useNavigate()
  const qc             = useQueryClient()

  // Selected room type within the property
  const [selectedRoomId, setSelectedRoomId] = useState('')
  const [showAddRoom, setShowAddRoom]       = useState(false)
  const [newRoom, setNewRoom]               = useState({
    name: '',
    basePrice: '',
    totalRooms: 5,
    maxGuests: 2,
    description: '',
  })

  // Date override form
  const [form, setForm]     = useState({ date: '', price: '', availableRooms: '' })
  const [saving, setSaving] = useState(false)

  // 1. Fetch Property Details
  const { data: propertyData } = useQuery({
    queryKey: ['property', propertyId],
    queryFn: async () => {
      const { data } = await api.get(`/properties/${propertyId}`)
      return data.data
    },
    enabled: !!propertyId,
  })

  // 2. Fetch Rooms for this Property
  const { data: roomsData, isLoading: roomsLoading } = useQuery({
    queryKey: ['rooms', propertyId],
    queryFn: async () => {
      const { data } = await api.get(`/properties/${propertyId}/rooms`)
      return data.data
    },
    enabled: !!propertyId,
  })

  // Auto-select first room when rooms load
  useEffect(() => {
    if (roomsData && roomsData.length > 0 && !selectedRoomId) {
      setSelectedRoomId(roomsData[0]._id)
    }
  }, [roomsData, selectedRoomId])

  // 3. Fetch Inventory Overrides for Selected Room Type
  const { data: invData, isLoading: invLoading } = useQuery({
    queryKey: ['inventory', selectedRoomId],
    queryFn: async () => {
      if (!selectedRoomId) return []
      const { data } = await api.get(`/inventory/${selectedRoomId}`, {
        params: { from: new Date().toISOString().split('T')[0], to: '2027-12-31' },
      })
      return data.data
    },
    enabled: !!selectedRoomId,
  })

  // Save new room type
  const handleCreateRoom = async (e) => {
    e.preventDefault()
    try {
      const { data } = await api.post(`/properties/${propertyId}/rooms`, {
        ...newRoom,
        basePrice: +newRoom.basePrice,
        totalRooms: +newRoom.totalRooms,
        maxGuests: +newRoom.maxGuests,
      })
      toast.success('Room type added!')
      qc.invalidateQueries(['rooms', propertyId])
      setSelectedRoomId(data.data._id)
      setShowAddRoom(false)
      setNewRoom({ name: '', basePrice: '', totalRooms: 5, maxGuests: 2, description: '' })
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add room type')
    }
  }

  // Save date-specific override
  const handleSaveOverride = async (e) => {
    e.preventDefault()
    if (!selectedRoomId) {
      toast.error('Please select or create a room type first')
      return
    }
    setSaving(true)
    try {
      await api.post('/inventory', {
        roomTypeId: selectedRoomId,
        date: form.date,
        ...(form.price !== '' && { price: +form.price }),
        ...(form.availableRooms !== '' && { availableRooms: +form.availableRooms }),
      })
      toast.success('Inventory override updated!')
      qc.invalidateQueries(['inventory', selectedRoomId])
      setForm({ date: '', price: '', availableRooms: '' })
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update inventory')
    } finally {
      setSaving(false)
    }
  }

  const selectedRoom = roomsData?.find((r) => r._id === selectedRoomId)

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <button onClick={() => navigate('/partner')} className="flex items-center gap-2 text-gray-500 hover:text-brand-600 mb-6">
        <ArrowLeft size={18} /> Back to Dashboard
      </button>

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Manage Inventory & Date Prices</h1>
          <p className="text-gray-500 text-sm mt-1">
            Property: <strong className="text-gray-800">{propertyData?.name || 'Loading...'}</strong> ({propertyData?.city})
          </p>
        </div>
        <button
          onClick={() => setShowAddRoom(!showAddRoom)}
          className="btn-secondary text-sm flex items-center gap-1.5">
          <Plus size={16} /> {showAddRoom ? 'Close' : 'Add Room Type'}
        </button>
      </div>

      {/* Add Room Type Form Modal/Card */}
      {showAddRoom && (
        <div className="card p-5 mb-6 border-brand-200 bg-brand-50/30">
          <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <BedDouble size={18} className="text-brand-600" /> Add New Room Type to this Hotel
          </h3>
          <form onSubmit={handleCreateRoom} className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Room Name</label>
              <input className="input text-sm" placeholder="e.g. Deluxe Double" required
                value={newRoom.name} onChange={(e) => setNewRoom({ ...newRoom, name: e.target.value })} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Base Price / Night (₹)</label>
              <input className="input text-sm" type="number" min={1} placeholder="e.g. 4500" required
                value={newRoom.basePrice} onChange={(e) => setNewRoom({ ...newRoom, basePrice: e.target.value })} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Total Rooms</label>
              <input className="input text-sm" type="number" min={1} required
                value={newRoom.totalRooms} onChange={(e) => setNewRoom({ ...newRoom, totalRooms: e.target.value })} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Max Guests</label>
              <input className="input text-sm" type="number" min={1} required
                value={newRoom.maxGuests} onChange={(e) => setNewRoom({ ...newRoom, maxGuests: e.target.value })} />
            </div>
            <div className="md:col-span-4 flex justify-end">
              <button type="submit" className="btn-primary text-sm px-5">Save Room Type</button>
            </div>
          </form>
        </div>
      )}

      {/* Room Type Selector Tabs */}
      <div className="card p-4 mb-6">
        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Select Room Type:</label>
        {roomsLoading && <p className="text-sm text-gray-400">Loading rooms...</p>}
        {!roomsLoading && (!roomsData || roomsData.length === 0) && (
          <div className="text-sm text-gray-500 py-2">
            No room types created yet. Click <strong>"Add Room Type"</strong> above to add Deluxe, Standard, or Suite.
          </div>
        )}
        <div className="flex flex-wrap gap-2">
          {roomsData?.map((r) => (
            <button
              key={r._id}
              onClick={() => setSelectedRoomId(r._id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${selectedRoomId === r._id ? 'bg-brand-500 text-white shadow-sm' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}>
              <BedDouble size={16} />
              <span>{r.name}</span>
              <span className={`text-xs px-1.5 py-0.5 rounded ${selectedRoomId === r._id ? 'bg-brand-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                ₹{r.basePrice}
              </span>
            </button>
          ))}
        </div>

        {selectedRoom && (
          <div className="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-500 flex gap-4">
            <span>Base Nightly Price: <strong>₹{selectedRoom.basePrice?.toLocaleString('en-IN')}</strong></span>
            <span>Default Room Inventory: <strong>{selectedRoom.totalRooms} rooms</strong></span>
            <span>Capacity: <strong>Max {selectedRoom.maxGuests} guests</strong></span>
          </div>
        )}
      </div>

      {/* Date Override Form */}
      {selectedRoomId && (
        <div className="card p-6 mb-6">
          <h2 className="font-semibold text-gray-800 mb-1 flex items-center gap-2">
            <Calendar size={18} className="text-brand-600" /> Set Date-Specific Price & Available Rooms
          </h2>
          <p className="text-xs text-gray-500 mb-4">
            Example: Increase price to ₹4,500 on 24–26 Dec and set available rooms.
          </p>

          <form onSubmit={handleSaveOverride} className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Target Date</label>
              <input className="input" type="date" required value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Special Price (₹)</label>
              <input className="input" type="number" min={0} placeholder={`Base: ₹${selectedRoom?.basePrice || ''}`}
                value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Available Rooms</label>
              <input className="input" type="number" min={0} placeholder={`Total: ${selectedRoom?.totalRooms || ''}`}
                value={form.availableRooms} onChange={(e) => setForm({ ...form, availableRooms: e.target.value })} />
            </div>
            <button type="submit" disabled={saving} className="btn-primary flex items-center justify-center gap-2">
              <Save size={16} /> {saving ? 'Saving...' : 'Apply Override'}
            </button>
          </form>
        </div>
      )}

      {/* Overrides Table */}
      {selectedRoomId && (
        <div className="card overflow-hidden">
          <div className="p-4 border-b font-semibold text-sm flex items-center justify-between">
            <span>Active Date Overrides for {selectedRoom?.name}</span>
            <span className="text-xs text-gray-400 font-normal">Dates not listed use default base price</span>
          </div>
          {invLoading ? (
            <p className="p-4 text-gray-400 text-sm">Loading overrides...</p>
          ) : !invData || invData.length === 0 ? (
            <div className="p-6 text-center text-gray-400 text-sm">
              No date-specific overrides set for {selectedRoom?.name}. Normal base price (₹{selectedRoom?.basePrice}) and inventory ({selectedRoom?.totalRooms} rooms) apply.
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left p-3 font-medium text-gray-600">Date</th>
                  <th className="text-right p-3 font-medium text-gray-600">Override Price</th>
                  <th className="text-right p-3 font-medium text-gray-600">Available Rooms</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {invData.map((inv) => (
                  <tr key={inv._id} className="hover:bg-gray-50">
                    <td className="p-3 font-medium">{inv.date}</td>
                    <td className="p-3 text-right text-brand-600 font-semibold">
                      {inv.price != null ? `₹${inv.price.toLocaleString('en-IN')}` : `Base (₹${selectedRoom?.basePrice})`}
                    </td>
                    <td className="p-3 text-right">
                      {inv.availableRooms != null ? `${inv.availableRooms} rooms` : `Default (${selectedRoom?.totalRooms})`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  )
}
