"use client"

import { useState, useEffect, useMemo } from "react"
import Image from "next/image"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Checkbox } from "../../components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select"
import { Star, MapPin, Users, Clock, Calendar } from "lucide-react"
import Header from "../../components/home/header"
import Footer from "../../components/home/footer"
import Gallery from "../../components/home/gallery"

export default function SearchPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const destination = searchParams?.get("destination") || ""
  const tourName = searchParams?.get("tourName") || ""
  const departure = searchParams?.get("departure") || ""
  const startDateRange = searchParams?.get("startDateRange") || ""
  const endDateRange = searchParams?.get("endDateRange") || ""
  const preferredDate = searchParams?.get("preferredDate") || ""

  const [filters, setFilters] = useState({
    dateFrom: "",
    destination: "",
    category: ""
  })

  const [sortBy, setSortBy] = useState("popular")
  const [today, setToday] = useState("")

  // State for search criteria from URL params
  const [searchCriteria, setSearchCriteria] = useState({
    destination: '',
    departure: '',
    preferredDate: '',
    startDateRange: '',
    endDateRange: ''
  });

  // Xác định có nên hiển thị sidebar hay không
  const shouldShowSidebar = useMemo(() => {
    // Chỉ hiển thị sidebar khi tìm kiếm theo tên tour (tourName có giá trị)
    // Và không có bất kỳ bộ lọc nào khác từ hero-section
    return tourName && !destination && !departure && !startDateRange && !endDateRange && !preferredDate;
  }, [tourName, destination, departure, startDateRange, endDateRange, preferredDate]);

  useEffect(() => {
    setToday(new Date().toISOString().split("T")[0])
    
    // Extract search params and set criteria
    const destination = searchParams.get('destination') || '';
    const departure = searchParams.get('departure') || '';
    const preferredDate = searchParams.get('preferredDate') || '';
    const startDateRange = searchParams.get('startDateRange') || '';
    const endDateRange = searchParams.get('endDateRange') || '';
    
    setSearchCriteria({
      destination,
      departure,
      preferredDate,
      startDateRange,
      endDateRange
    });
  }, [searchParams])

  // State for fetched tours (search results only)
  const [searchName, setSearchName] = useState("");
  const [tours, setTours] = useState<any[]>([]);
  const [loadingTours, setLoadingTours] = useState(false);

  // State for destination and category filter options
  const [destinations, setDestinations] = useState<{ id: string; name: string }[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  
  // State for departure dates by tour
  const [departureDatesByTour, setDepartureDatesByTour] = useState<{[tourId: string]: any[]}>({});

  // Fetch tours from API and filter by searchName, tourName, destination, departure, and dates
  useEffect(() => {
    setLoadingTours(true);
    
    const fetchToursWithDates = async () => {
      try {
        // Use searchCriteria state instead of direct searchParams
        const { destination, departure, startDateRange, endDateRange, preferredDate } = searchCriteria;
        
        console.log('🔍 Search Parameters:', {
          destination, tourName, departure, startDateRange, endDateRange, preferredDate, searchName
        });
        
        // Fetch all tours first
        const toursResponse = await fetch('http://localhost:5000/api/tours');
        
        if (!toursResponse.ok) {
          throw new Error(`API Error: ${toursResponse.status} ${toursResponse.statusText}`);
        }
        // Process tours data here
        let response = await toursResponse.json();
        let tours = Array.isArray(response.data) ? response.data : [];

        // Ưu tiên lọc theo tourName nếu có
        if (tourName && tourName.trim()) {
          const keyword = tourName.trim().toLowerCase();
          tours = tours.filter(tour => tour.name && tour.name.toLowerCase().includes(keyword));
        } else if (searchName && searchName.trim()) {
          const keyword = searchName.trim().toLowerCase();
          tours = tours.filter(tour => {
            if (!tour || typeof tour !== 'object') return false;
            const nameMatch = tour.name && tour.name.toLowerCase().includes(keyword);
            const locationMatch = tour.destination && tour.destination.toLowerCase().includes(keyword);
            return nameMatch || locationMatch;
          });
        } else if (destination && destination.trim()) {
          const destKeyword = destination.trim().toLowerCase();
          tours = tours.filter(tour => {
            if (!tour || typeof tour !== 'object') return false;
            const locationFields = [tour.location, tour.destination].filter(Boolean);
            return locationFields.some(field => field.toLowerCase().includes(destKeyword));
          });
        }

        // Filter by departure location
        if (departure) {
          const toursWithDeparture = tours.filter(t => t.departure_location);
          if (toursWithDeparture.length > 0) {
            tours = tours.filter(tour => tour.departure_location && tour.departure_location.toLowerCase().includes(departure.toLowerCase()));
          }
        }

        // Filter by departure dates within range
        if (startDateRange && endDateRange) {
          const filteredTours: any[] = [];
          for (const tour of tours) {
            try {
              const datesResponse = await fetch(`http://localhost:5000/api/departure-dates/by-tour/${tour.id}`);
              const dates = await datesResponse.json();
              if (Array.isArray(dates)) {
                const hasMatchingDate = dates.some(date => {
                  const departureDate = new Date(date.departure_date);
                  const startRange = new Date(startDateRange);
                  const endRange = new Date(endDateRange);
                  return departureDate >= startRange && departureDate <= endRange;
                });
                if (hasMatchingDate) {
                  tour.departureDates = dates;
                  filteredTours.push(tour);
                }
              }
            } catch (error) {
              // Ignore error for this tour
            }
          }
          tours = filteredTours;
        }

        // Sort by proximity to preferred date
        if (preferredDate && tours.length > 0) {
          const preferredDateTime = new Date(preferredDate).getTime();
          tours.sort((a, b) => {
            const getClosestDate = (tour) => {
              if (!tour.departureDates) return Infinity;
              return Math.min(...tour.departureDates.map(date => Math.abs(new Date(date.departure_date).getTime() - preferredDateTime)));
            };
            return getClosestDate(a) - getClosestDate(b);
          });
        }

        setTours(Array.isArray(tours) ? tours : []);
        setLoadingTours(false);
      } catch (error) {
        setTours([]);
        setLoadingTours(false);
      }
    };
    fetchToursWithDates();
  }, [searchName, tourName, searchCriteria.destination, searchCriteria.departure, searchCriteria.startDateRange, searchCriteria.endDateRange, searchCriteria.preferredDate]);

  // Fetch destination and category options on mount
  useEffect(() => {
    // Nếu đang lọc theo tên tour, chỉ lấy các destination của các tour đã lọc
    if (tourName && tourName.trim()) {
      const keyword = tourName.trim().toLowerCase();
      fetch('http://localhost:5000/api/tours')
        .then(res => res.json())
        .then(response => {
          const tours = Array.isArray(response.data) ? response.data : [];
          // Lọc các tour có tên chứa keyword
          const filteredTours = tours.filter(tour => tour.name && tour.name.toLowerCase().includes(keyword));
          // Lấy tất cả các destination từ các tour đã lọc, loại bỏ trùng lặp, null, undefined
          const dests = filteredTours
            .map(t => t.destination)
            .filter((name, idx, arr) => name && arr.indexOf(name) === idx);
          setDestinations(dests.map((name, idx) => ({ id: String(idx), name })));
        });
    } else {
      fetch('http://localhost:5000/api/destinations')
        .then(res => res.json())
        .then(data => setDestinations(Array.isArray(data) ? data : []));
    }
    // Nếu đang lọc theo tên tour, chỉ lấy các category thuộc các tour đã lọc
    if (tourName && tourName.trim()) {
      const keyword = tourName.trim().toLowerCase();
      fetch('http://localhost:5000/api/tours')
        .then(res => res.json())
        .then(response => {
          const tours = Array.isArray(response.data) ? response.data : [];
          const filteredTours = tours.filter(tour => tour.name && tour.name.toLowerCase().includes(keyword));
          // Lấy tất cả các category từ các tour đã lọc, loại bỏ trùng lặp, null, undefined
          const cats = filteredTours
            .map(t => t.category)
            .filter((name, idx, arr) => name && arr.indexOf(name) === idx);
          setCategories(cats.map((name, idx) => ({ id: String(idx), name })));
        });
    } else {
      fetch('http://localhost:5000/api/tour-categories')
        .then(res => res.json())
        .then(data => setCategories(Array.isArray(data) ? data : []));
    }
  }, []);

  // Fetch departure dates for all tours when tours change
  useEffect(() => {
    const fetchDepartureDates = async () => {
      if (tours.length === 0) {
        setDepartureDatesByTour({});
        return;
      }

      const datesByTour: {[tourId: string]: any[]} = {};
      
      // Fetch departure dates for each tour
      await Promise.all(
        tours.map(async (tour) => {
          try {
            const response = await fetch(`http://localhost:5000/api/departure-dates/by-tour/${tour.id}`);
            if (response.ok) {
              const dates = await response.json();
              if (Array.isArray(dates)) {
                // Sort dates by departure_date and take the next 3 upcoming dates
                const upcomingDates = dates
                  .filter(date => new Date(date.departure_date) >= new Date())
                  .sort((a, b) => new Date(a.departure_date).getTime() - new Date(b.departure_date).getTime())
                  .slice(0, 3);
                datesByTour[tour.id] = upcomingDates;
              }
            }
          } catch (error) {
            console.warn(`Failed to fetch dates for tour ${tour.id}:`, error);
            datesByTour[tour.id] = [];
          }
        })
      );
      
      setDepartureDatesByTour(datesByTour);
    };

    fetchDepartureDates();
  }, [tours]);

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
      // Lọc theo danh mục tour (category): kiểm tra tour.categories (mảng) có chứa category name
      if (filters.category) {
        // Nếu tour có trường categories là mảng
        if (Array.isArray(tour.categories)) {
          const hasCategory = tour.categories.some(cat => cat.name === filters.category);
          if (!hasCategory) return false;
        } else if (tour.category && tour.category !== filters.category) {
          // Nếu tour có trường category là string
          return false;
        }
      }
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
    // console.log("Kiểm tra tình trạng từ", filters.dateFrom)
  }

  // Debug component for search parameters - DISABLED
  const SearchDebugComponent = () => {
    return null; // Disabled debug component
  };

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
        
        {loadingTours ? (
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-teal-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Đang tìm kiếm tour...</p>
            </div>
          </div>
        ) : (
        <div className={`flex gap-8 ${shouldShowSidebar ? '' : 'justify-center'}`}>
          {/* Sidebar - Chỉ hiển thị khi tìm kiếm theo tên tour */}
          {shouldShowSidebar && (
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
                <h4 className="font-semibold mb-4 text-gray-700">Địa điểm</h4>
                <Select
                  value={filters.destination || ""}
                  onValueChange={value => setFilters(prev => ({ ...prev, destination: value }))}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Chọn địa điểm" />
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
                <h4 className="font-semibold mb-4 text-gray-700">Danh mục tour</h4>
                <Select
                  value={filters.category || ""}
                  onValueChange={value => setFilters(prev => ({ ...prev, category: value }))}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Chọn danh mục tour" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {/* Button to clear all filters */}
              <div className="mt-6 flex justify-center">
                <Button onClick={clearAllFilters} variant="outline" className="w-full">
                  Xóa tất cả lựa chọn
                </Button>
              </div>
            </aside>
          )}

          {/* Main Content */}
          <main className={`${shouldShowSidebar ? 'flex-1' : 'w-full max-w-6xl'}`}>
            {/* Debug component (development only) */}
            <SearchDebugComponent />
            
            {/* Results Header & Search Input */}
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-end gap-8 w-full">
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-gray-800 mb-1">
                    Kết quả tìm kiếm {filteredTours.length > 0 && `(${filteredTours.length} tour)`}
                  </h1>
                  <div className="mt-2 flex flex-wrap gap-4 text-sm text-gray-700">
                    {searchCriteria.destination && (
                      <span>Điểm đến: {searchCriteria.destination}</span>
                    )}
                    {searchCriteria.departure && (
                      <span>Điểm xuất phát: {searchCriteria.departure}</span>
                    )}
                    {searchCriteria.preferredDate && (
                      <span>Ngày mong muốn: {new Date(searchCriteria.preferredDate).toLocaleDateString('vi-VN')}</span>
                    )}
                    {searchCriteria.startDateRange && searchCriteria.endDateRange && (
                      <span>Khoảng tìm kiếm: {new Date(searchCriteria.startDateRange).toLocaleDateString('vi-VN')} - {new Date(searchCriteria.endDateRange).toLocaleDateString('vi-VN')}</span>
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
                      <Image 
                        src={
                          tour.images?.[0]?.image_url || 
                          tour.image || 
                          tour.image_url ||
                          tour.main_image ||
                          "/placeholder.svg"
                        } 
                        alt={tour.name || tour.title || 'Tour image'} 
                        fill 
                        className="object-cover" 
                      />
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
                        <div className="flex items-start gap-2">
                          <Calendar className="w-4 h-4 text-gray-500 mt-1 flex-shrink-0" />
                          <div className="flex flex-col min-w-0">
                            <span className="text-xs text-gray-500 mb-1">Các ngày khởi hành:</span>
                            <div className="flex flex-wrap gap-1">
                              {departureDatesByTour[tour.id]?.length > 0 ? (
                                departureDatesByTour[tour.id].map((date, index) => (
                                  <span
                                    key={index}
                                    className="inline-block bg-teal-50 text-teal-700 text-xs px-2 py-1 rounded-md border border-teal-200 whitespace-nowrap"
                                  >
                                    {new Date(date.departure_date).toLocaleDateString('vi-VN', {
                                      day: '2-digit',
                                      month: '2-digit',
                                      year: 'numeric'
                                    })}
                                  </span>
                                ))
                              ) : (
                                <span className="text-xs text-gray-400">Chưa có lịch khởi hành</span>
                              )}
                            </div>
                          </div>
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
        )}

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
