"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "../../components/ui/popover"
import { MapPin, Calendar, Users, Search, Plus, Minus } from "lucide-react"

export default function HeroSection() {
  const router = useRouter()
  const [searchData, setSearchData] = useState({
    destination: "",
    departure: "",
    startDate: "",
    endDate: "",
    tourName: "",
  })
  const [tourNames, setTourNames] = useState<string[]>([])
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [today, setToday] = useState("")
  interface Location {
    id?: string
    _id?: string
    name: string
    [key: string]: any
  }
  const [locations, setLocations] = useState<Location[]>([])
  const [departureLocations, setDepartureLocations] = useState<string[]>([])

  useEffect(() => {
    setToday(new Date().toISOString().split("T")[0])
    // Fetch locations from API
    fetch("http://localhost:5000/api/locations")
      .then((res) => res.json())
      .then((data) => {
        // Always set locations as an array
        if (Array.isArray(data)) {
          setLocations(data)
        } else if (data && Array.isArray(data.locations)) {
          setLocations(data.locations)
        } else {
          setLocations([])
        }
      })
      .catch(() => setLocations([]))
    // Fetch departure locations and tour names from tours API
    fetch("http://localhost:5000/api/tours")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          // Lấy tất cả departure_location, loại bỏ trùng lặp và null/undefined
          const departures = Array.from(new Set(data.map(tour => tour.departure_location).filter(Boolean)))
          setDepartureLocations(departures)
          // Lấy tất cả tên tour, loại bỏ trùng lặp và null/undefined
          const names = Array.from(new Set(data.map(tour => tour.name).filter(Boolean)))
          setTourNames(names)
        } else {
          setDepartureLocations([])
          setTourNames([])
        }
      })
      .catch(() => {
        setDepartureLocations([])
        setTourNames([])
      })
  }, [])

  // Gợi ý tên tour khi nhập
  const handleTourNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchData(prev => ({ ...prev, tourName: value }));
    if (value.trim().length > 0) {
      const filtered = tourNames.filter(name => name.toLowerCase().includes(value.trim().toLowerCase()));
      setSuggestions(filtered.slice(0, 5)); // chỉ gợi ý tối đa 5 tên
    } else {
      setSuggestions([]);
    }
  };

  const handleSearch = async () => {
    // Nếu có nhập tên tour thì tìm kiếm theo tên, không cần chọn bộ lọc bên dưới
    if (searchData.tourName.trim()) {
      // Gọi API lấy tất cả tour và lọc theo tên
      try {
        const res = await fetch("http://localhost:5000/api/tours")
        const tours = await res.json()
        // Lọc tour theo tên (không phân biệt hoa thường, loại bỏ khoảng trắng thừa)
        const filtered = Array.isArray(tours)
          ? tours.filter(tour => tour.name && tour.name.toLowerCase().includes(searchData.tourName.trim().toLowerCase()))
          : []
        // Chuyển kết quả sang trang search, truyền danh sách tour qua query (hoặc localStorage nếu quá dài)
        // Đơn giản: truyền tên tour qua query
        router.push(`/search?tourName=${encodeURIComponent(searchData.tourName.trim())}`)
        return
      } catch {
        alert("Không thể tìm kiếm tour theo tên. Vui lòng thử lại.")
        return
      }
    }
    // Nếu không nhập tên, dùng bộ lọc bên dưới
    if (!searchData.destination) {
      alert("Vui lòng chọn điểm đến")
      return
    }
    if (!searchData.departure) {
      alert("Vui lòng chọn điểm khởi hành")
      return
    }
    const searchParams = new URLSearchParams({
      destination: searchData.destination,
      departure: searchData.departure,
      startDate: searchData.startDate,
      endDate: searchData.endDate,
    })
    router.push(`/search?${searchParams.toString()}`)
  }

  return (
    <section className="relative h-[90vh] flex flex-col justify-between items-center">
      <video className="absolute inset-0 w-full h-full object-cover" autoPlay muted loop>
        <source src="/hero-video.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      <div className="relative z-10 w-full flex flex-col items-center mt-32">
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-7">
          Cùng Tìm Kiếm Tour Tốt Nhất Cho Bạn
        </h1>
        <p
          className="text-base md:text-lg text-white max-w-2xl text-center mb-0"
          style={{ textShadow: '0 1px 8px #000' }}
        >
          Tạo trải nghiệm độc đáo và hấp dẫn hơn với các tour trọn gói của chúng tôi, cung cấp dịch vụ tuyệt vời và những kỷ niệm không thể quên.
        </p>
      </div>
      <div className="relative z-10 w-full max-w-4xl mb-10">
        <div className="bg-white border border-[#7BBCB0] rounded-2xl shadow-xl p-6 max-w-5xl mx-auto flex flex-col gap-4">
            {/* Hàng 1: Tìm kiếm theo tên tour */}
            <div className="flex items-center gap-4 w-full">
              <div className="flex-1 min-w-[200px] relative"> {/* Thêm relative ở đây */}
                <label className="text-[#7BBCB0] font-semibold text-sm flex items-center mb-2">
                  <Search className="w-4 h-4 mr-2" />
                  Tên tour
                </label>
                <Input
                  type="text"
                  value={searchData.tourName}
                  onChange={handleTourNameChange}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleSearch();
                    }
                  }}
                  placeholder="Nhập tên tour để tìm kiếm..."
                  className="border border-[#7BBCB0] rounded-lg px-4 py-2 text-black w-full"
                />
                {/* Gợi ý tên tour */}
                {suggestions.length > 0 && (
                  <ul className="absolute bg-white border border-[#7BBCB0] rounded-lg mt-1 w-full z-50 shadow-lg text-black max-h-60 overflow-y-auto">
                    {suggestions.map((name) => (
                      <li
                        key={name}
                        className="px-4 py-2 cursor-pointer hover:bg-[#f3f3f3]"
                        onClick={() => {
                          setSearchData(prev => ({ ...prev, tourName: name }))
                          setSuggestions([])
                        }}
                      >
                        {name}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            {/* Hàng 2: Bộ lọc và nút tìm kiếm */}
            <div className="flex items-center justify-between flex-wrap md:flex-nowrap gap-6 w-full">
              {/* Địa điểm */}
              <div className="flex-1 min-w-[200px]">
                <label className="text-[#7BBCB0] font-semibold text-sm flex items-center mb-2">
                  <MapPin className="w-4 h-4 mr-2" />
                  Địa điểm
                </label>
                <Select
                  value={searchData.destination}
                  onValueChange={(value) => setSearchData((prev) => ({ ...prev, destination: value }))}
                >
                  <SelectTrigger className={`select-trigger w-full border-0 p-0 h-auto focus:ring-0`}>
                    <SelectValue placeholder="Tìm kiếm điểm đến" />
                  </SelectTrigger>
                  <SelectContent>
                    {locations
                      .filter(loc => loc.name && loc.name !== "Destination")
                      .map(loc => (
                        <SelectItem key={loc.id || loc._id || loc.name} value={loc.name}>
                          {loc.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Ngày bắt đầu */}
              <div className="flex-1 min-w-[200px] border-l border-gray-300 pl-6">
                <label className="text-[#7BBCB0] font-semibold text-sm flex items-center mb-2">
                  <Calendar className="w-4 h-4 mr-2" />
                  Ngày đi
                </label>
                <Input
                  type="date"
                  value={searchData.startDate}
                  onChange={(e) => setSearchData((prev) => ({ ...prev, startDate: e.target.value }))}
                  className="border-0 p-0 h-auto focus-visible:ring-0 text-gray-700"
                  min={today}
                />
              </div>

              {/* Điểm khởi hành */}
              <div className="flex-1 min-w-[200px] border-l border-gray-300 pl-6">
                <label className="text-[#7BBCB0] font-semibold text-sm flex items-center mb-2">
                  <MapPin className="w-4 h-4 mr-2" />
                  Điểm khởi hành
                </label>
                <Select
                  value={searchData.departure}
                  onValueChange={(value) => setSearchData((prev) => ({ ...prev, departure: value }))}
                >
                  <SelectTrigger className={`select-trigger w-full border-0 p-0 h-auto focus:ring-0`}>
                    <SelectValue placeholder="Chọn điểm khởi hành" />
                  </SelectTrigger>
                  <SelectContent>
                    {departureLocations.map((loc) => (
                      <SelectItem key={loc} value={loc}>
                        {loc}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Nút tìm kiếm */}
              <div className="flex-shrink-0">
                <Button
                  onClick={handleSearch}
                  className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold rounded-full px-8 py-3 flex items-center"
                >
                  <Search className="w-4 h-4 mr-2" />
                  Tìm kiếm
                </Button>
              </div>
            </div>
          </div>
      </div>
    </section>
  )
}
