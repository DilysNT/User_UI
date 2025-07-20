"use client"

import { useState, useEffect, useMemo } from "react"
import Image from "next/image"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Checkbox } from "../../components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select"
import { Star, MapPin, Users, Clock } from "lucide-react"
import Header from "../../components/home/header"
import Footer from "../../components/home/footer"
import Gallery from "../../components/home/gallery"

export default function SearchPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const destination = searchParams?.get("destination") || ""
  const tourName = searchParams?.get("tourName") || ""

  const [filters, setFilters] = useState({
    dateFrom: "",
    destination: "",
    category: ""
  })

  const [sortBy, setSortBy] = useState("popular")
  const [today, setToday] = useState("")

  useEffect(() => {
    setToday(new Date().toISOString().split("T")[0])
  }, [])

  // State for fetched tours (search results only)
  const [searchName, setSearchName] = useState("");
  const [tours, setTours] = useState<any[]>([]);
  const [loadingTours, setLoadingTours] = useState(false);

  // State for destination and category filter options
  const [destinations, setDestinations] = useState<{ id: string; name: string }[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);

  // Fetch tours from API and filter by searchName, tourName, or destination
  useEffect(() => {
    setLoadingTours(true);
    fetch('http://localhost:5000/api/tours')
      .then((res) => res.json())
      .then((data) => {
        let toursData = Array.isArray(data) ? data : [];
        // Ưu tiên lọc theo tourName hoặc destination từ URL nếu có
        const keyword = (tourName || destination || searchName).trim().toLowerCase();
        if (keyword) {
          toursData = toursData.filter(tour =>
            (tour.name && tour.name.toLowerCase().includes(keyword)) ||
            (tour.destination && tour.destination.toLowerCase().includes(keyword))
          );
        }
        setTours(toursData);
        setLoadingTours(false);
      })
      .catch(() => setLoadingTours(false));
  }, [searchName, tourName, destination]);

  // Fetch destination and category options on mount
  useEffect(() => {
    fetch('http://localhost:5000/api/destinations')
      .then(res => res.json())
      .then(data => setDestinations(Array.isArray(data) ? data : []));
    fetch('http://localhost:5000/api/tour-categories')
      .then(res => res.json())
      .then(data => setCategories(Array.isArray(data) ? data : []));
  }, []);

  // Premium tours array (mock data for UI only)
  const premiumTours = [
    {
      id: 201,
      title: "Alaska: Núi của London từ Fairbanks đến Công viên Quốc gia",
      image: "https://images.unsplash.com/photo-1464822759844-d150baec93c5?w=300&h=200&fit=crop",
      duration: "5 giờ",
      price: 4800000,
      rating: 4.6,
      reviews: 58,
    },
    {
      id: 204,
      title: "Alaska: Núi của London từ Fairbanks đến Công viên Quốc gia",
      image: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=300&h=200&fit=crop",
      duration: "6 giờ",
      price: 5800000,
      rating: 4.8,
      reviews: 73,
    },
  ];
  const adventureTours = [
    {
      id: 101,
      title: "Alaska: Tham quan Denali từ Fairbanks đến Công viên Quốc gia",
      image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=200&fit=crop",
      duration: "7 giờ",
      price: 6500000,
      rating: 4.4,
      reviews: 89,
    },
    {
      id: 102,
      title: "Alaska: Thông qua Denali từ Fairbanks đến Công viên Quốc gia",
      image: "https://images.unsplash.com/photo-1552733407-5d5c46c3bb3b?w=300&h=200&fit=crop",
      duration: "5 giờ",
      price: 5500000,
      rating: 4.2,
      reviews: 67,
    }
  ];

  // Filter tours based on filters
  const filteredTours = useMemo(() => {
    return tours.filter(tour => {
      // Lọc theo điểm đến
      if (filters.destination && tour.destination !== filters.destination) return false;
      // Lọc theo loại tour (dữ liệu API có thể là tour_type hoặc category)
      if (filters.category && tour.tour_type && tour.tour_type !== filters.category) return false;
      // Lọc theo ngày khởi hành (so sánh departure_date với dateFrom)
      if (filters.dateFrom && tour.departureDates && tour.departureDates.length > 0) {
        // Tìm ngày khởi hành gần nhất >= dateFrom
        const matchedDate = tour.departureDates.find(d => d.departure_date && d.departure_date >= filters.dateFrom);
        if (!matchedDate) return false;
      }
      return true;
    });
  }, [tours, filters]);

  const sortedTours = useMemo(() => {
    const sorted = [...filteredTours];
    switch (sortBy) {
      case "price-low":
        return sorted.sort((a, b) => a.price - b.price);
      case "price-high":
        return sorted.sort((a, b) => b.price - a.price);
      case "rating":
        return sorted.sort((a, b) => b.rating - a.rating);
      case "duration":
        return sorted.sort((a, b) => Number.parseFloat(a.duration) - Number.parseFloat(b.duration));
      default:
        return sorted.sort((a, b) => b.reviews - a.reviews);
    }
  }, [filteredTours, sortBy]);

  const handleFilterChange = (category: string, value: string, checked: boolean) => {
    setFilters((prev) => ({
      ...prev,
      [category]: checked ? value : "",
    }))
  }

  const clearAllFilters = () => {
    setFilters({
      dateFrom: "",
      destination: "",
      category: ""
    })
  }

  const handleBookTour = (tour: any) => {
    // Lưu đúng dữ liệu tour vào localStorage
    localStorage.setItem("selectedTour", JSON.stringify(tour));
    // Chuyển hướng đúng id tour
    if (tour && tour.id) {
      router.push(`/tour/${tour.id}`);
    } else if (tour && tour._id) {
      router.push(`/tour/${tour._id}`);
    } else {
      alert("Không tìm thấy thông tin tour hợp lệ!");
    }
  }

  const handleCheckAvailability = () => {
    console.log("Kiểm tra tình trạng từ", filters.dateFrom)
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < Math.floor(rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
      />
    ))
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header textColor="black" />
      <div className="max-w-7xl mx-auto px-4 py-8 pt-[120px]">
        <button
          className="flex items-center gap-2 mb-6 text-gray-700 hover:text-teal-600 font-medium"
          onClick={() => router.back()}
        >
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>
          Quay lại
        </button>
        <div className="flex gap-8">
          {/* Sidebar */}
          <aside className="w-80 bg-white rounded-lg shadow-sm p-6 h-fit">
            <h3 className="text-lg font-semibold mb-6 text-gray-800">Lọc tour</h3>
            {/* Ngày khởi hành chỉ chọn ngày bắt đầu */}
            <div className="mb-8">
              <h4 className="font-semibold mb-4 text-gray-700">Ngày khởi hành</h4>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Chọn ngày</label>
                  <Input
                    type="date"
                    value={filters.dateFrom}
                    onChange={(e) => setFilters((prev) => ({ ...prev, dateFrom: e.target.value }))}
                    className="w-full"
                    min={today}
                  />
                </div>
              </div>
            </div>
            {/* Destination Filter */}
            <div className="mb-8">
              <h4 className="font-semibold mb-4 text-gray-700">Điểm đến</h4>
              <Select
                value={filters.destination || ""}
                onValueChange={value => setFilters(prev => ({ ...prev, destination: value }))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Chọn điểm đến" />
                </SelectTrigger>
                <SelectContent>
                  {destinations.map(dest => (
                    <SelectItem key={dest.id} value={dest.name}>{dest.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {/* Tour Category Filter */}
            <div className="mb-8">
              <h4 className="font-semibold mb-4 text-gray-700">Loại tour</h4>
              <Select
                value={filters.category || ""}
                onValueChange={value => setFilters(prev => ({ ...prev, category: value }))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Chọn loại tour" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => (
                    <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            {/* Results Header & Search Input */}
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-end gap-8 w-full">
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-gray-800 mb-1">Kết quả tìm kiếm</h1>
                  <div className="mt-2 flex flex-wrap gap-4 text-sm text-gray-700">
                    {filters.dateFrom && (
                      <span>Ngày khởi hành: {filters.dateFrom}</span>
                    )}
                    {filters.destination && (
                      <span>Điểm đến: {filters.destination}</span>
                    )}
                    {filters.category && (
                      <span>Loại tour: {filters.category}</span>
                    )}
                    <span>Sắp xếp: {
                      sortBy === "popular" ? "Phổ biến" :
                      sortBy === "price-low" ? "Giá thấp nhất" :
                      sortBy === "price-high" ? "Giá cao nhất" :
                      sortBy === "rating" ? "Đánh giá cao" :
                      sortBy === "duration" ? "Thời lượng ngắn nhất" : sortBy
                    }</span>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <label className="text-sm text-gray-600 mb-1">Sắp xếp theo</label>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-44">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="popular">Phổ biến</SelectItem>
                      <SelectItem value="price-low">Giá thấp nhất</SelectItem>
                      <SelectItem value="price-high">Giá cao nhất</SelectItem>
                      <SelectItem value="rating">Đánh giá cao</SelectItem>
                      <SelectItem value="duration">Thời lượng ngắn nhất</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Tour Cards */}
            <div className="space-y-4">
              {sortedTours && sortedTours.length > 0 && sortedTours.map((tour) => (
                <div
                  key={tour.id}
                  className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200"
                >
                  <div className="flex">
                    <div className="w-48 h-36 relative flex-shrink-0">
                      <Image src={tour.images?.[0]?.image_url || "/placeholder.svg"} alt={tour.name} fill className="object-cover" />
                    </div>
                    <div className="flex-1 p-5 flex justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-2">{tour.name?.replace(/\s*-\s*ADMIN UPDATED/gi, '') || 'Tên tour không có'}</h3>
                        <div className="flex gap-4 mb-3 text-sm text-gray-600">
                          <span className="flex items-center gap-1" title="Thời gian">
                            <Clock className="w-4 h-4" />
                            {tour.departureDates?.[0]?.number_of_days} ngày {tour.departureDates?.[0]?.number_of_nights} đêm
                          </span>
                          <span className="flex items-center gap-1" title="Số người">
                            <Users className="w-4 h-4" />
                            {tour.max_participants} khách
                          </span>
                          <span className="flex items-center gap-1" title="Điểm đến">
                            <MapPin className="w-4 h-4" />
                            {tour.destination}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{tour.description}</p>
                        <div className="flex items-center gap-2">
                          <div className="flex">{renderStars(tour.rating)}</div>
                          <span className="text-sm font-medium text-gray-700">{tour.rating}</span>
                          <span className="text-sm text-gray-500">({tour.reviews} đánh giá)</span>
                        </div>
                      </div>
                      <div className="text-right pl-6 flex flex-col justify-between">
                        <div>
                          <div className="text-2xl font-bold text-gray-900 mb-1">
                            {tour.price != null ? tour.price.toLocaleString("vi-VN") : "--"}₫
                          </div>
                          <div className="text-sm text-gray-500">mỗi người</div>
                        </div>
                        <Button
                          onClick={() => handleBookTour(tour)}
                          className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-2 rounded-md mt-4"
                        >
                          Đặt ngay
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {sortedTours.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">Không tìm thấy tour phù hợp với bộ lọc của bạn.</p>
                <Button onClick={clearAllFilters} className="mt-4" variant="outline">
                  Xóa tất cả bộ lọc
                </Button>
              </div>
            )}
          </main>
        </div>

        {/* Outside The City Specials */}
        <section className="mt-16">
          <h2 className="text-3xl font-bold text-gray-800 mb-8">Ưu đãi đặc biệt ngoài thành phố</h2>

          {/* Premium Tours */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-6">
              <span className="inline-block bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                Premium
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {premiumTours.map((tour) => (
                <div
                  key={tour.id}
                  className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-all duration-200 hover:-translate-y-1"
                >
                  <div className="relative h-48">
                    <Image src={tour.image || "/placeholder.svg"} alt={tour.title} fill className="object-cover" />
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-800 mb-3 line-clamp-2">{tour.title}</h3>
                    <div className="flex justify-between items-center text-sm text-gray-600 mb-3">
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {tour.duration}
                      </span>
                      <div className="text-lg font-bold text-gray-900">{tour.price.toLocaleString("vi-VN")}₫</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex">{renderStars(tour.rating)}</div>
                      <span className="text-sm font-medium text-gray-700">{tour.rating}</span>
                      <span className="text-sm text-gray-500">({tour.reviews})</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Adventure Tours */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-6">
              <span className="inline-block bg-teal-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                Phiêu lưu
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {adventureTours.map((tour) => (
                <div
                  key={tour.id}
                  className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-all duration-200 hover:-translate-y-1"
                >
                  <div className="relative h-48">
                    <Image src={tour.image || "/placeholder.svg"} alt={tour.title} fill className="object-cover" />
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-800 mb-3 line-clamp-2">{tour.title}</h3>
                    <div className="flex justify-between items-center text-sm text-gray-600 mb-3">
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {tour.duration}
                      </span>
                      <div className="text-lg font-bold text-gray-900">{tour.price.toLocaleString("vi-VN")}₫</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex">{renderStars(tour.rating)}</div>
                      <span className="text-sm font-medium text-gray-700">{tour.rating}</span>
                      <span className="text-sm text-gray-500">({tour.reviews})</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
      <Gallery />
      <Footer />
    </div>
  )
}
