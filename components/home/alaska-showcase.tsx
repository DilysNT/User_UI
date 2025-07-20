import { Button } from "../../components/ui/button"
import { Card, CardContent } from "../../components/ui/card"
import { Star, MapPin, Clock, Users, Mountain, Flower, Camera, Car, Building, Eye, ChevronLeft, ChevronRight } from "lucide-react"
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

type DaNangShowcaseProps = {
  onTourClick?: (tourId?: string) => void;
  selectedCity?: string;
};

const DaNangShowcase: React.FC<DaNangShowcaseProps> = ({ onTourClick, selectedCity = "Đà Nẵng" }) => {
  const [cityInfo, setCityInfo] = useState<{ name: string, description: string, image_url?: string, id?: string } | null>(null);
  const [tours, setTours] = useState<any[]>([]);
  // State cho tour categories
  const [tourCategories, setTourCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [categoryTours, setCategoryTours] = useState<any[]>([]);
  const [categoriesWithCounts, setCategoriesWithCounts] = useState<any[]>([]);
  const [loadingCounts, setLoadingCounts] = useState(false);
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const [categoryTourPage, setCategoryTourPage] = useState(1);
  const [categoryTourTotalPages, setCategoryTourTotalPages] = useState(1);

  useEffect(() => {
    fetch("http://localhost:5000/api/search/top")
      .then(res => res.json())
      .then(data => {
        function normalize(str) {
          return (str || "")
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase()
            .trim();
        }
        const found = (data.locations || []).find((loc: any) =>
          normalize(loc.name) === normalize(selectedCity)
        ) || (data.locations && data.locations[0]);
        setCityInfo(found || null);
        // Lấy danh sách tour từ location.tours nếu có
        if (found && Array.isArray(found.tours)) {
          setTours(found.tours.slice(0, 4));
        } else {
          setTours([]);
        }
      })
      .catch(() => {
        setCityInfo(null);
        setTours([]);
      });
  }, [selectedCity]);

  useEffect(() => {
    const fetchCategoriesWithCounts = async () => {
      setLoadingCounts(true);
      try {
        const res = await fetch("http://localhost:5000/api/tour-categories");
        const data = await res.json();
        const categories = Array.isArray(data) ? data : [];
        setTourCategories(categories);
        
        // Fetch tour count for each category
        const categoriesWithCounts = await Promise.all(
          categories.map(async (cat) => {
            try {
              let url = "";
              if (cat.id || cat._id) {
                url = `http://localhost:5000/api/tour-categories/${cat.id || cat._id}/tours-only?page=1&limit=1`;
              } else {
                url = `http://localhost:5000/api/tours?category=${encodeURIComponent(cat.name)}&page=1&limit=1`;
              }
              
              const res = await fetch(url);
              const tourData = await res.json();
              
              let tourCount = 0;
              if (tourData.total !== undefined) {
                tourCount = tourData.total;
              } else if (tourData.totalCount !== undefined) {
                tourCount = tourData.totalCount;
              } else if (tourData.tours && Array.isArray(tourData.tours)) {
                tourCount = tourData.totalCount || tourData.tours.length;
              } else if (Array.isArray(tourData)) {
                tourCount = tourData.length;
              }
              
              return { ...cat, actualTourCount: tourCount };
            } catch (error) {
              console.error(`Error fetching tours for category ${cat.name}:`, error);
              return { ...cat, actualTourCount: 0 };
            }
          })
        );
        
        setCategoriesWithCounts(categoriesWithCounts);
      } catch (error) {
        console.error("Error fetching categories:", error);
        setTourCategories([]);
        setCategoriesWithCounts([]);
      } finally {
        setLoadingCounts(false);
      }
    };
    
    fetchCategoriesWithCounts();
  }, []);

  // Fetch tours by category when selected
  useEffect(() => {
    if (!selectedCategory) return;
    setCategoryTourPage(1);
  }, [selectedCategory]);

  useEffect(() => {
    if (!selectedCategory) return;
    const fetchTours = async () => {
      try {
        let url = "";
        if (selectedCategory.id || selectedCategory._id) {
          url = `http://localhost:5000/api/tour-categories/${selectedCategory.id || selectedCategory._id}/tours-only?page=${categoryTourPage}`;
        } else {
          url = `http://localhost:5000/api/tours?category=${encodeURIComponent(selectedCategory.name)}&page=${categoryTourPage}`;
        }
        
        console.log("Fetching tours from:", url);
        const res = await fetch(url);
        const data = await res.json();
        console.log("API Response:", data);
        
        if (data.tours && Array.isArray(data.tours)) {
          setCategoryTours(data.tours);
          setCategoryTourTotalPages(data.totalPages || Math.ceil((data.total || data.totalCount || data.tours.length) / 10) || 1);
        } else if (Array.isArray(data)) {
          setCategoryTours(data);
          setCategoryTourTotalPages(1);
        } else if (data.data && Array.isArray(data.data)) {
          setCategoryTours(data.data);
          setCategoryTourTotalPages(data.totalPages || Math.ceil((data.total || data.totalCount || data.data.length) / 10) || 1);
        } else {
          setCategoryTours([]);
          setCategoryTourTotalPages(1);
        }
      } catch (error) {
        console.error("Error fetching tours:", error);
        setCategoryTours([]);
        setCategoryTourTotalPages(1);
      }
    };
    fetchTours();
  }, [selectedCategory, categoryTourPage]);

  // Dữ liệu cho từng thành phố
  const cityData = {
    "Đà Nẵng": {
      backgroundImage: "/DaNang.webp",
      title: "Đà Nẵng",
      description: "Đà Nẵng nằm giữa ba di sản thế giới: cố đô Huế, phố cổ Hội An và thánh địa Mỹ Sơn. Đà Nẵng còn có nhiều danh thắng tuyệt đẹp say lòng du khách như Ngũ Hành Sơn, Bà Nà, bán đảo Sơn Trà, đèo Hải Vân, sông Hàn thơ mộng và cầu quay Sông Hàn – niềm tự hào của thành phố, và biển Mỹ Khê đẹp nhất hành tinh.",
      tours: [
        {
          id: 1,
          title: "Đà Nẵng: Tour Cầu Vàng & Bà Nà Hills",
          duration: "Cả ngày",
          transport: "Xe du lịch",
          plan: "Kế hoạch gia đình",
          image: "/hoian.jpeg",
          category: "adventure"
        },
        {
          id: 2,
          title: "Đà Nẵng: Ngũ Hành Sơn & Chùa Linh Ứng",
          duration: "Nửa ngày", 
          transport: "Xe máy/Ô tô",
          plan: "Tour nhóm nhỏ",
          image: "/cauvan.jpeg",
          category: "culture"
        },
        {
          id: 3,
          title: "Đà Nẵng: Tour biển Mỹ Khê & ẩm thực đường phố",
          duration: "3 giờ",
          transport: "Đi bộ", 
          plan: "Tour ẩm thực",
          image: "/halong.jpeg",
          category: "food"
        },
        {
          id: 4,
          title: "Đà Nẵng: Hội An cổ trấn & đèn lồng ban đêm",
          duration: "Nửa ngày",
          transport: "Xe du lịch",
          plan: "Tour văn hóa", 
          image: "/phongnha.jpeg",
          category: "culture"
        }
      ],
      additionalInfo: [
        {
          icon: Mountain,
          title: "Biển đẹp nổi tiếng",
          description: "Khám phá bãi biển Mỹ Khê và các resort sang trọng"
        },
        {
          icon: Flower,
          title: "Cầu Vàng độc đáo",
          description: "Chiêm ngưỡng kiến trúc Cầu Vàng nổi tiếng thế giới"
        },
        {
          icon: Camera,
          title: "Phố cổ Hội An",
          description: "Khám phá di sản văn hóa thế giới gần Đà Nẵng"
        }
      ]
    },
    "Hồ Chí Minh": {
      backgroundImage: "/hochiminh.webp",
      title: "Hồ Chí Minh",
      description: "Thành phố Hồ Chí Minh là trung tâm kinh tế lớn nhất Việt Nam, nơi giao thoa giữa truyền thống và hiện đại. Từ những con phố nhộn nhịp, chợ Ben Thành sầm uất đến những tòa nhà chọc trời, ẩm thực đường phố phong phú và cuộc sống không ngừng nghỉ.",
      tours: [
        {
          id: 5,
          title: "TP.HCM: Tour địa đạo Củ Chi & chợ Bến Thành",
          duration: "Cả ngày",
          transport: "Xe du lịch",
          plan: "Tour lịch sử",
          image: "/hochiminh.jpeg",
          category: "history"
        },
        {
          id: 6,
          title: "TP.HCM: Khám phá đồng bằng sông Cửu Long",
          duration: "2 ngày 1 đêm",
          transport: "Xe + Thuyền",
          plan: "Tour khám phá",
          image: "/mekong.jpeg",
          category: "nature"
        },
        {
          id: 7,
          title: "TP.HCM: Ẩm thực đường phố Sài Gòn",
          duration: "3 giờ",
          transport: "Xe máy",
          plan: "Tour ẩm thực",
          image: "/saigonfood.jpeg",
          category: "food"
        },
        {
          id: 8,
          title: "TP.HCM: City tour & bảo tàng chiến tranh",
          duration: "Nửa ngày",
          transport: "Xe du lịch",
          plan: "Tour văn hóa",
          image: "/saigon.jpeg",
          category: "culture"
        }
      ],
      additionalInfo: [
        {
          icon: Building,
          title: "Thành phố năng động",
          description: "Khám phá cuộc sống nhộn nhịp của Sài Gòn"
        },
        {
          icon: Camera,
          title: "Địa đạo Củ Chi",
          description: "Tìm hiểu lịch sử qua hệ thống địa đạo nổi tiếng"
        },
        {
          icon: Flower,
          title: "Ẩm thực phong phú",
          description: "Thưởng thức những món ăn đặc trưng Sài Gòn"
        }
      ]
    },
    "Hà Nội": {
      backgroundImage: "/hanoi.webp",
      title: "Hà Nội",
      description: "Hà Nội - thủ đô ngàn năm văn hiến của Việt Nam, nơi lưu giữ những giá trị văn hóa truyền thống đậm đà. Từ khu phố cổ với 36 phố phường, Hồ Gươm thơ mộng, đến những di tích lịch sử và ẩm thực đường phố độc đáo.",
      tours: [
        {
          id: 9,
          title: "Hà Nội: Tour phố cổ & Hồ Gươm",
          duration: "Nửa ngày",
          transport: "Đi bộ",
          plan: "Tour văn hóa",
          image: "/hanoi-old.jpeg",
          category: "culture"
        },
        {
          id: 10,
          title: "Hà Nội: Vịnh Hạ Long & động Thiên Cung",
          duration: "2 ngày 1 đêm",
          transport: "Xe + Du thuyền",
          plan: "Tour khám phá",
          image: "/halong.jpeg",
          category: "nature"
        },
        {
          id: 11,
          title: "Hà Nội: Ẩm thực phố cổ & chè đậu đỏ",
          duration: "3 giờ",
          transport: "Đi bộ",
          plan: "Tour ẩm thực",
          image: "/hanoi-food.jpeg",
          category: "food"
        },
        {
          id: 12,
          title: "Hà Nội: Văn Miếu & Hoàng thành Thăng Long",
          duration: "Nửa ngày",
          transport: "Xe du lịch",
          plan: "Tour lịch sử",
          image: "/vanmieu.jpeg",
          category: "history"
        }
      ],
      additionalInfo: [
        {
          icon: Building,
          title: "Phố cổ nghìn năm",
          description: "Khám phá 36 phố phường cổ kính của Hà Nội"
        },
        {
          icon: Mountain,
          title: "Vịnh Hạ Long gần đó",
          description: "Du ngoạn kỳ quan thiên nhiên thế giới"
        },
        {
          icon: Camera,
          title: "Di tích lịch sử",
          description: "Tìm hiểu văn hóa Việt qua các di tích"
        }
      ]
    },
    "Hội An": {
      backgroundImage: "/hoian.webp",
      title: "Hội An",
      description: "Hội An - di sản văn hóa thế giới với kiến trúc cổ kính đặc trưng, những con phố rực rỡ đèn lồng về đêm. Nơi đây còn nổi tiếng với làng nghề truyền thống, ẩm thực phong phú và những bãi biển tuyệt đẹp.",
      tours: [
        {
          id: 13,
          title: "Hội An: Phố cổ & đèn lồng đêm",
          duration: "Cả ngày",
          transport: "Đi bộ + Xe đạp",
          plan: "Tour văn hóa",
          image: "/hoian-lantern.jpeg",
          category: "culture"
        },
        {
          id: 14,
          title: "Hội An: Làng gốm Thanh Hà & rừng dừa",
          duration: "Nửa ngày",
          transport: "Xe đạp + Thúng chai",
          plan: "Tour trải nghiệm",
          image: "/coconut-forest.jpeg",
          category: "experience"
        },
        {
          id: 15,
          title: "Hội An: Học nấu món Việt truyền thống",
          duration: "4 giờ",
          transport: "Đi bộ",
          plan: "Lớp học nấu ăn",
          image: "/cooking-class.jpeg",
          category: "food"
        },
        {
          id: 16,
          title: "Hội An: Cù Lao Chám & lặn ngắm san hô",
          duration: "Cả ngày",
          transport: "Xe + Tàu cao tốc",
          plan: "Tour biển",
          image: "/cham-island.jpeg",
          category: "adventure"
        }
      ],
      additionalInfo: [
        {
          icon: Flower,
          title: "Phố cổ thơ mộng",
          description: "Dạo bước trên những con phố cổ kính"
        },
        {
          icon: Camera,
          title: "Đèn lồng rực rỡ",
          description: "Chiêm ngưỡng khung cảnh đêm lung linh"
        },
        {
          icon: Mountain,
          title: "Làng nghề truyền thống",
          description: "Khám phá các làng nghề độc đáo"
        }
      ]
    },
    "Ninh Bình": {
      backgroundImage: "/ninhbinh.webp",
      title: "Ninh Bình",
      description: "Ninh Bình được mệnh danh là 'Vịnh Hạ Long trên cạn' với những dãy núi đá vôi hùng vĩ, sông nước trong xanh và các di tích lịch sử văn hóa độc đáo. Đây là điểm đến lý tưởng cho những ai yêu thích thiên nhiên và khám phá.",
      tours: [
        {
          id: 17,
          title: "Ninh Bình: Tràng An & chùa Bái Đính",
          duration: "Cả ngày",
          transport: "Xe du lịch + Thuyền",
          plan: "Tour khám phá",
          image: "/trang-an.jpeg",
          category: "nature"
        },
        {
          id: 18,
          title: "Ninh Bình: Tam Cốc & hang Múa",
          duration: "Nửa ngày",
          transport: "Xe đạp + Thuyền",
          plan: "Tour thiên nhiên",
          image: "/tam-coc.jpeg",
          category: "nature"
        },
        {
          id: 19,
          title: "Ninh Bình: Cố đô Hoa Lư & đền vua Đinh",
          duration: "Nửa ngày",
          transport: "Xe du lịch",
          plan: "Tour lịch sử",
          image: "/hoa-lu.jpeg",
          category: "history"
        },
        {
          id: 20,
          title: "Ninh Bình: Leo núi Múa ngắm toàn cảnh",
          duration: "3 giờ",
          transport: "Xe du lịch",
          plan: "Tour phiêu lưu",
          image: "/mua-cave.jpeg",
          category: "adventure"
        }
      ],
      additionalInfo: [
        {
          icon: Mountain,
          title: "Vịnh Hạ Long trên cạn",
          description: "Khám phá cảnh quan núi nước hùng vĩ"
        },
        {
          icon: Camera,
          title: "Di tích cổ đô",
          description: "Tìm hiểu lịch sử cố đô Hoa Lư"
        },
        {
          icon: Flower,
          title: "Thiên nhiên nguyên sơ",
          description: "Thưởng ngoạn cảnh đẹp hoang sơ"
        }
      ]
    },
    "Nha Trang": {
      backgroundImage: "/nhatrang.webp",
      title: "Nha Trang",
      description: "Nha Trang - thành phố biển xinh đẹp với những bãi cát trắng trải dài, nước biển trong xanh và khí hậu nhiệt đới dễ chịu quanh năm. Đây là điểm đến lý tưởng cho những kỳ nghỉ dưỡng và các hoạt động thể thao dưới nước.",
      tours: [
        {
          id: 21,
          title: "Nha Trang: Tour 4 đảo & lặn ngắm san hô",
          duration: "Cả ngày",
          transport: "Tàu du lịch",
          plan: "Tour biển",
          image: "/nha-trang-islands.jpeg",
          category: "adventure"
        },
        {
          id: 22,
          title: "Nha Trang: Tháp Bà Ponagar & chợ đêm",
          duration: "Nửa ngày",
          transport: "Xe du lịch",
          plan: "Tour văn hóa",
          image: "/ponagar.jpeg",
          category: "culture"
        },
        {
          id: 23,
          title: "Nha Trang: Vinpearl Land & cáp treo",
          duration: "Cả ngày",
          transport: "Cáp treo",
          plan: "Tour giải trí",
          image: "/vinpearl.jpeg",
          category: "entertainment"
        },
        {
          id: 24,
          title: "Nha Trang: Tắm bùn khoáng & massage",
          duration: "4 giờ",
          transport: "Xe du lịch",
          plan: "Tour thư giãn",
          image: "/mud-bath.jpeg",
          category: "wellness"
        }
      ],
      additionalInfo: [
        {
          icon: Mountain,
          title: "Biển đẹp nhất miền Trung",
          description: "Tận hưởng bãi biển cát trắng mịn màng"
        },
        {
          icon: Camera,
          title: "Hoạt động thể thao nước",
          description: "Lặn biển, dù lượn, jet ski đầy thú vị"
        },
        {
          icon: Flower,
          title: "Ẩm thực hải sản",
          description: "Thưởng thức hải sản tươi ngon"
        }
      ]
    },
    "Huế": {
      backgroundImage: "/hue.webp",
      title: "Huế",
      description: "Huế - cố đô của triều Nguyễn với hệ thống di tích hoàng gia nguy nga, những lăng tẩm cổ kính và văn hoa cung đình tinh tế. Thành phố mang đậm dấu ấn lịch sử và là di sản văn hóa thế giới được UNESCO công nhận.",
      tours: [
        {
          id: 25,
          title: "Huế: Hoàng cung & lăng Khải Định",
          duration: "Cả ngày",
          transport: "Xe du lịch",
          plan: "Tour lịch sử",
          image: "/hue-imperial.jpeg",
          category: "history"
        },
        {
          id: 26,
          title: "Huế: Du ngoạn sông Hương & chùa Thiên Mụ",
          duration: "Nửa ngày",
          transport: "Thuyền rồng",
          plan: "Tour văn hóa",
          image: "/perfume-river.jpeg",
          category: "culture"
        },
        {
          id: 27,
          title: "Huế: Ẩm thực cung đình & bún bò Huế",
          duration: "3 giờ",
          transport: "Đi bộ",
          plan: "Tour ẩm thực",
          image: "/hue-food.jpeg",
          category: "food"
        },
        {
          id: 28,
          title: "Huế: Lăng Tự Đức & rừng thông Lagi",
          duration: "Nửa ngày",
          transport: "Xe du lịch",
          plan: "Tour khám phá",
          image: "/tu-duc-tomb.jpeg",
          category: "history"
        }
      ],
      additionalInfo: [
        {
          icon: Building,
          title: "Cố đô hoàng gia",
          description: "Khám phá kiến trúc cung đình Nguyễn"
        },
        {
          icon: Camera,
          title: "Di sản thế giới",
          description: "Tìm hiểu văn hóa cung đình độc đáo"
        },
        {
          icon: Flower,
          title: "Ẩm thực cung đình",
          description: "Thưởng thức món ăn hoàng gia tinh tế"
        }
      ]
    }
  };

  const categories = [
    { icon: Building, label: "Giao thông công cộng", color: "text-purple-500" },
    { icon: Mountain, label: "Biển & Phiêu lưu", color: "text-green-500" },
    { icon: Car, label: "Giao thông riêng", color: "text-yellow-500" },
    { icon: Building, label: "Tour kinh doanh", color: "text-red-500" },
    { icon: Eye, label: "Tham quan địa phương", color: "text-blue-500" }
  ];

  // Lấy dữ liệu theo thành phố được chọn
  // const currentCityData = cityData[selectedCity as keyof typeof cityData] || cityData["Đà Nẵng"];

  interface Tour {
    id: number;
    title: string;
    duration: string;
    transport: string;
    plan: string;
    image: string;
    category: string;
  }

  interface Category {
    icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
    label: string;
    color: string;
  }

  interface AdditionalInfo {
    icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
    title: string;
    description: string;
  }

  const handleTourClick = (id: string) => {
    router.push(`/tour/${id}`);
  };

  // Hàm lấy ảnh tour ưu tiên ảnh chính, rồi ảnh đầu tiên, rồi fallback
  const getTourImage = (tour: any) => {
    if (Array.isArray(tour.images) && tour.images.length > 0) {
      const mainImg = tour.images.find((img: any) => img.is_main && img.image_url);
      return mainImg ? mainImg.image_url : tour.images[0].image_url;
    }
    return tour.image || tour.image_url || "/placeholder.jpg";
  };

  // Lấy ngày và giờ hiện tại
  const now = new Date();
  const dateStr = format(now, "EEEE, MMMM do");
  const timeStr = format(now, "h:mm a");

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section with Background Image and Overlay Card */}
      <section className="flex justify-center items-center py-12">
        <div className="relative w-full max-w-5xl min-h-[520px] rounded-2xl overflow-hidden shadow-xl bg-white">
          {/* Ảnh nền */}
          <div className="absolute inset-0 w-full h-full">
            <img
              src={cityInfo?.image_url || cityData[selectedCity]?.backgroundImage || "/DaNang.webp"}
              alt={cityInfo?.name || selectedCity}
              className="object-cover w-full h-full scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-transparent" />
          </div>
          {/* Overlay nội dung */}
          <div className="relative z-10 p-10 flex flex-col h-full">
            <h2 className="text-4xl font-extrabold text-white mb-16 drop-shadow-lg uppercase tracking-wide">{cityInfo?.name || selectedCity}</h2>
            <div className="grid grid-cols-10 gap-6 mt-auto items-end">
              <div className="col-span-10 md:col-span-6">
                <p className="text-white/90 text-lg drop-shadow leading-relaxed">
                  {cityInfo?.description || cityData[selectedCity]?.description || "Khám phá địa điểm nổi bật với nhiều trải nghiệm hấp dẫn."}
                </p>
              </div>
              <div className="col-span-10 md:col-span-4 flex flex-row flex-wrap gap-3 justify-end">
                {categories.map((category, index) => (
                  <div key={index} className="flex items-center space-x-2 bg-white/20 px-4 py-2 rounded-full whitespace-nowrap">
                    <category.icon className={`w-5 h-5 ${category.color}`} />
                    <span className="text-sm text-white font-medium">{category.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tours Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          {tours.length < 4 ? (
            <div className="flex flex-wrap justify-center gap-8">
              {tours.map((tour, index) => (
                <div
                  onClick={() => handleTourClick(tour.id)}
                  className="cursor-pointer w-full max-w-xs group"
                  key={tour.id}
                >
                  <div className="relative rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 h-64">
                    {/* Ảnh nền */}
                    <div className="absolute inset-0 w-full h-full">
                      <img
                        src={getTourImage(tour)}
                        alt={tour.name || tour.title}
                        className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent transition-opacity duration-300" />
                    </div>
                    
                    {/* Thông tin hiển thị bình thường - tên tour và giá */}
                    <div className="absolute bottom-0 left-0 right-0 p-4 group-hover:opacity-0 transition-opacity duration-300">
                      <h3 className="font-bold text-lg mb-2 text-white leading-tight line-clamp-2 drop-shadow-lg">
                        {tour.name || tour.title}
                      </h3>
                      <div className="flex items-center justify-between">
                        <span className="text-white/80 text-sm font-medium">
                          {tour.duration || tour.transport || ""}
                        </span>
                        <span className="text-xl font-bold text-yellow-400 drop-shadow-lg">
                          {tour.price ? (typeof tour.price === 'number' ? `${tour.price.toLocaleString()}đ` : tour.price) : 'Liên hệ'}
                        </span>
                      </div>
                    </div>
                    
                    {/* Overlay content - chỉ hiển thị khi hover */}
                    <div className="absolute inset-0 p-5 flex flex-col justify-end opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <h3 className="font-bold text-lg mb-2 text-white leading-tight line-clamp-2 drop-shadow-lg">
                        {tour.name || tour.title}
                      </h3>
                      <div className="flex items-center gap-2 mb-3">
                        <span className="flex items-center gap-0.5">
                          {[1,2,3,4,5].map(i => (
                            <Star key={i} className={`w-4 h-4 ${tour.rating && i <= Math.round(tour.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                          ))}
                        </span>
                        {tour.reviews ? (
                          <span className="text-white/80 text-sm">Fair ({tour.reviews})</span>
                        ) : (
                          <span className="text-white/80 text-sm">No reviews</span>
                        )}
                      </div>
                      <div className="mb-3">
                        <p className="text-white/90 text-sm leading-relaxed line-clamp-3">
                          {tour.description || tour.summary || "Khám phá tour du lịch tuyệt vời với nhiều trải nghiệm thú vị"}
                        </p>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-white/90 text-sm font-medium">
                          {tour.duration || tour.transport || ""}
                        </span>
                        <span className="text-white/70 text-sm">
                           Xem chi tiết
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {tours.map((tour, index) => (
                <div
                  onClick={() => handleTourClick(tour.id)}
                  className="cursor-pointer w-full max-w-xs mx-auto group"
                  key={tour.id}
                >
                  <div className="relative rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 h-64">
                    {/* Ảnh nền */}
                    <div className="absolute inset-0 w-full h-full">
                      <img
                        src={getTourImage(tour)}
                        alt={tour.name || tour.title}
                        className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent transition-opacity duration-300" />
                    </div>
                    
                    {/* Thông tin hiển thị bình thường - tên tour và giá */}
                    <div className="absolute bottom-0 left-0 right-0 p-4 group-hover:opacity-0 transition-opacity duration-300">
                      <h3 className="font-bold text-lg mb-2 text-white leading-tight line-clamp-2 drop-shadow-lg">
                        {tour.name || tour.title}
                      </h3>
                      <div className="flex items-center justify-between">
                        <span className="text-white/80 text-sm font-medium">
                          {tour.duration || tour.transport || ""}
                        </span>
                        <span className="text-xl font-bold text-yellow-400 drop-shadow-lg">
                          {tour.price ? (typeof tour.price === 'number' ? `${tour.price.toLocaleString()}đ` : tour.price) : 'Liên hệ'}
                        </span>
                      </div>
                    </div>
                    
                    {/* Overlay content - chỉ hiển thị khi hover */}
                    <div className="absolute inset-0 p-5 flex flex-col justify-end opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <h3 className="font-bold text-lg mb-2 text-white leading-tight line-clamp-2 drop-shadow-lg">
                        {tour.name || tour.title}
                      </h3>
                      <div className="flex items-center gap-2 mb-3">
                        <span className="flex items-center gap-0.5">
                          {[1,2,3,4,5].map(i => (
                            <Star key={i} className={`w-4 h-4 ${tour.rating && i <= Math.round(tour.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                          ))}
                        </span>
                        {tour.reviews ? (
                          <span className="text-white/80 text-sm">Fair ({tour.reviews})</span>
                        ) : (
                          <span className="text-white/80 text-sm">No reviews</span>
                        )}
                      </div>
                      <div className="mb-3">
                        <p className="text-white/90 text-sm leading-relaxed line-clamp-3">
                          {tour.description || tour.summary || "Khám phá tour du lịch tuyệt vời với nhiều trải nghiệm thú vị"}
                        </p>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-white/90 text-sm font-medium">
                          {tour.duration || tour.transport || ""}
                        </span>
                        <span className="text-white/70 text-sm">
                          Xem chi tiết 
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Tour Categories Section */}
      <section className="pt-24 pb-10 bg-[url('/pattern.svg')] bg-repeat bg-center">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">Danh mục Tour</h2>
          <div className="relative">
            {/* Horizontal Scroll - Hiển thị tất cả categories */}
            <div 
              className="flex overflow-x-auto gap-8 pb-4" 
              style={{
                scrollSnapType: 'x mandatory',
                scrollbarWidth: 'thin',
                scrollbarColor: '#cbd5e1 #f1f5f9'
              }}
            >
              {(categoriesWithCounts.length > 0 ? categoriesWithCounts : tourCategories).map((cat, idx) => (
                <div
                  key={cat.id || cat._id || cat.name}
                  className="min-w-[240px] max-w-xs w-[240px] flex-shrink-0 rounded-3xl bg-white shadow-lg cursor-pointer group snap-center transition-transform hover:scale-105"
                  onClick={() => { 
                    console.log("Selected category:", cat);
                    setSelectedCategory(cat); 
                    setOpen(true); 
                  }}
                  style={{scrollSnapAlign: 'center'}}
                >
                  {/* Ảnh nền nếu có */}
                  <div className="relative w-full h-48 rounded-3xl overflow-hidden">
                    {cat.image ? (
                      <img src={cat.image} alt={cat.name} className="object-cover w-full h-full" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-b from-gray-300 to-gray-100" />
                    )}
                  </div>
                  <div className="flex flex-col items-center py-4">
                    <div className="text-2xl font-bold text-gray-800 mb-1 text-center">{cat.name}</div>
                    <div className="text-gray-500 text-sm mb-1">
                      {loadingCounts && cat.actualTourCount === undefined ? 
                        "Loading..." : 
                        `${cat.actualTourCount !== undefined ? cat.actualTourCount : (cat.tourCount || cat.tour_count || cat.tours?.length || 0)} tours`
                      }
                    </div>
                    <span className="text-teal-600 text-sm font-semibold mt-1">See More</span>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Scroll indicator - hiển thị khi có nhiều categories */}
            {(categoriesWithCounts.length > 0 ? categoriesWithCounts : tourCategories).length > 4 && (
              <div className="text-center mt-4 text-gray-400 text-sm">
                ← Kéo ngang để xem thêm danh mục →
              </div>
            )}
          </div>
        </div>
        {/* Modal hiển thị danh sách tour theo danh mục */}
        <Dialog open={open} onOpenChange={setOpen}>
          {selectedCategory && (
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-teal-700">
                  {selectedCategory?.name}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                {categoryTours.length === 0 && (
                  <div className="text-gray-500 text-center py-8">
                    Đang tải tours hoặc không có tour nào trong danh mục này.
                  </div>
                )}
                {categoryTours.map((tour, index) => (
                  <div key={tour.id || tour._id || index} className="p-4 rounded-lg bg-gray-50 shadow flex flex-col md:flex-row gap-4 hover:shadow-md transition-shadow">
                    {/* Ảnh tour */}
                    <div className="w-full md:w-32 h-32 rounded-lg overflow-hidden flex-shrink-0">
                      {tour.images && tour.images.length > 0 ? (
                        <img 
                          src={tour.images.find((img: any) => img.is_main)?.image_url || tour.images[0].image_url} 
                          alt={tour.name || tour.title} 
                          className="w-full h-full object-cover" 
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                          <span className="text-gray-400 text-sm">No Image</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Thông tin tour */}
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="font-semibold text-lg text-gray-800 mb-2">
                          {tour.name || tour.title || 'Tên tour không có'}
                        </div>
                        <div className="text-gray-500 text-sm mb-2 line-clamp-2">
                          {tour.description || tour.summary || 'Mô tả không có'}
                        </div>
                        {tour.price && (
                          <div className="text-green-600 font-bold text-lg">
                            {typeof tour.price === 'number' ? `${tour.price.toLocaleString()}đ` : tour.price}
                          </div>
                        )}
                      </div>
                      
                      {/* Nút xem chi tiết */}
                      <div className="flex justify-end mt-3">
                        <button 
                          className="bg-teal-600 text-white hover:bg-teal-700 font-bold px-4 py-2 rounded-lg transition-colors shadow-sm hover:shadow-md" 
                          onClick={() => {
                            router.push(`/tour/${tour.id || tour._id}`);
                            setOpen(false);
                          }}
                        >
                          Xem chi tiết
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {/* Pagination controls */}
              {categoryTourTotalPages > 1 && (
                <div className="flex justify-center items-center gap-4 mt-6">
                  <button
                    className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
                    onClick={() => setCategoryTourPage(p => Math.max(1, p - 1))}
                    disabled={categoryTourPage === 1}
                  >
                    Trước
                  </button>
                  <span className="text-gray-700">Trang {categoryTourPage} / {categoryTourTotalPages}</span>
                  <button
                    className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
                    onClick={() => setCategoryTourPage(p => Math.min(categoryTourTotalPages, p + 1))}
                    disabled={categoryTourPage === categoryTourTotalPages}
                  >
                    Tiếp
                  </button>
                </div>
              )}
            </DialogContent>
          )}
        </Dialog>
      </section>
    </div>
  )
}

export default DaNangShowcase