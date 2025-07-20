import { Card, CardContent } from "../../components/ui/card"
import { Button } from "../../components/ui/button"
import { Calendar, User } from "lucide-react"
import Image from "next/image"

export default function LatestStories() {
  const stories = [
    {
      title: "Hành Trình & Kỷ Niệm Alaska",
      excerpt: "Khám phá vẻ đẹp hoang sơ của Alaska qua hướng dẫn chi tiết của chúng tôi...",
      author: "John Smith",
      date: "15/03/2024",
      image: "/hoian.jpeg?height=200&width=300",
      category: "Phiêu lưu",
    },
    {
      title: "Tour Thành Phố Dọc Denali & Fairbanks",
      excerpt: "Trải nghiệm những điều tuyệt vời nhất của Alaska với các tour chuyên nghiệp...",
      author: "Sarah Johnson",
      date: "12/03/2024",
      image: "/phongnha.jpeg?height=200&width=300",
      category: "Thành phố",
    },
    {
      title: "Lợi Ích Sức Khỏe Khi Du Lịch Mạo Hiểm",
      excerpt: "Tìm hiểu về lợi ích sức khỏe tuyệt vời từ du lịch mạo hiểm và hoạt động ngoài trời...",
      author: "Mike Wilson",
      date: "10/03/2024",
      image: "/halong.jpeg?height=200&width=300",
      category: "Sức khỏe",
    },
    {
      title: "5 Lợi Ích Sức Khỏe Khi Du Lịch & Khám Phá",
      excerpt: "Khám phá cách du lịch và phiêu lưu giúp cải thiện sức khỏe thể chất và tinh thần...",
      author: "Emily Davis",
      date: "08/03/2024",
      image: "/cauvan.jpeg?height=200&width=300",
      category: "Sống khỏe",
    },
  ]

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-12">
          <div>
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Câu Chuyện Mới Nhất</h2>
            <p className="text-gray-600">Đọc những câu chuyện du lịch mới nhất và truyền cảm hứng cho hành trình tiếp theo của bạn</p>
          </div>
          <Button variant="outline" className="hidden md:block">
            Xem tất cả bài viết
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stories.map((story, index) => (
            <Card key={index} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative">
                <Image
                  src={story.image || "/placeholder.svg"}
                  alt={story.title}
                  width={300}
                  height={200}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute top-4 left-4">
                  <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm">{story.category}</span>
                </div>
              </div>
              <CardContent className="p-4">
                <h3 className="font-semibold text-lg mb-2 line-clamp-2">{story.title}</h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{story.excerpt}</p>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center">
                    <User className="w-4 h-4 mr-1" />
                    {story.author}
                  </div>
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    {story.date}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-8 md:hidden">
          <Button variant="outline">Xem tất cả bài viết</Button>
        </div>
      </div>
    </section>
  )
}
