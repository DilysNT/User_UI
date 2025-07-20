"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import Header from "@/components/home/header"
import Gallery from "../home/gallery"
import Footer from "@/components/home/footer"

export default function BlogPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")

  const blogPosts = [
    {
      id: 1,
      title: "Hành Trình & Kỷ Niệm Alaska - Khám Phá Vùng Đất Hoang Dã",
      excerpt:
        "Khám phá vẻ đẹp hoang sơ của Alaska qua hướng dẫn chi tiết của chúng tôi. Từ những dãy núi tuyết phủ đến động vật hoang dã độc đáo, Alaska sẽ mang đến cho bạn những trải nghiệm không thể quên.",
      content:
        "Alaska là một trong những điểm đến du lịch hấp dẫn nhất thế giới với vẻ đẹp hoang sơ và thiên nhiên tuyệt vời...",
      author: "John Smith",
      date: "15/03/2024",
      image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=250&fit=crop",
      category: "Phiêu lưu",
      readTime: "5 phút đọc",
      featured: true,
    },
    {
      id: 2,
      title: "Tour Thành Phố Dọc Denali & Fairbanks - Trải Nghiệm Tuyệt Vời",
      excerpt:
        "Trải nghiệm những điều tuyệt vời nhất của Alaska với các tour chuyên nghiệp. Khám phá Denali và Fairbanks với những hoạt động thú vị và cảnh quan nspectacular.",
      content: "Denali và Fairbanks là hai điểm đến không thể bỏ qua khi du lịch Alaska...",
      author: "Sarah Johnson",
      date: "12/03/2024",
      image: "https://images.unsplash.com/photo-1552733407-5d5c46c3bb3b?w=400&h=250&fit=crop",
      category: "Thành phố",
      readTime: "7 phút đọc",
      featured: false,
    },
    {
      id: 3,
      title: "Lợi Ích Sức Khỏe Khi Du Lịch Mạo Hiểm - Khám Phá Bản Thân",
      excerpt:
        "Tìm hiểu về lợi ích sức khỏe tuyệt vời từ du lịch mạo hiểm và hoạt động ngoài trời. Du lịch không chỉ giúp thư giãn mà còn cải thiện sức khỏe thể chất và tinh thần.",
      content: "Du lịch mạo hiểm mang lại nhiều lợi ích cho sức khỏe...",
      author: "Mike Wilson",
      date: "10/03/2024",
      image: "https://images.unsplash.com/photo-1464822759844-d150baec93c5?w=400&h=250&fit=crop",
      category: "Sức khỏe",
      readTime: "6 phút đọc",
      featured: false,
    },
    {
      id: 4,
      title: "5 Lợi Ích Sức Khỏe Khi Du Lịch & Khám Phá Thế Giới",
      excerpt:
        "Khám phá cách du lịch và phiêu lưu giúp cải thiện sức khỏe thể chất và tinh thần. Từ việc giảm stress đến tăng cường hệ miễn dịch, du lịch có nhiều tác dụng tích cực.",
      content: "Du lịch mang lại nhiều lợi ích cho sức khỏe con người...",
      author: "Emily Davis",
      date: "08/03/2024",
      image: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=250&fit=crop",
      category: "Sống khỏe",
      readTime: "4 phút đọc",
      featured: false,
    },
    {
      id: 5,
      title: "Khám Phá Vịnh Hạ Long - Kỳ Quan Thiên Nhiên Thế Giới",
      excerpt:
        "Vịnh Hạ Long với hàng nghìn hòn đảo đá vôi tạo nên một cảnh quan tuyệt đẹp. Hãy cùng khám phá những bí mật và truyền thuyết của vịnh biển nổi tiếng này.",
      content: "Vịnh Hạ Long là một trong những điểm đến du lịch hàng đầu Việt Nam...",
      author: "Nguyễn Văn A",
      date: "05/03/2024",
      image: "https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=400&h=250&fit=crop",
      category: "Thiên nhiên",
      readTime: "8 phút đọc",
      featured: true,
    },
    {
      id: 6,
      title: "Hội An Cổ Kính - Nét Đẹp Văn Hóa Truyền Thống",
      excerpt:
        "Hội An với những ngôi nhà cổ, đèn lồng rực rỡ và ẩm thực đặc sắc. Khám phá vẻ đẹp cổ kính và những câu chuyện lịch sử thú vị của phố cổ Hội An.",
      content: "Hội An là một thành phố cổ với nhiều di tích lịch sử...",
      author: "Trần Thị B",
      date: "02/03/2024",
      image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=250&fit=crop",
      category: "Văn hóa",
      readTime: "6 phút đọc",
      featured: false,
    },
    {
      id: 7,
      title: "Sapa Mùa Lúa Chín - Vẻ Đẹp Ruộng Bậc Thang",
      excerpt:
        "Sapa trong mùa lúa chín với những thửa ruộng bậc thang vàng óng. Trải nghiệm cuộc sống của người dân tộc thiểu số và khám phá văn hóa độc đáo của vùng cao.",
      content: "Sapa là điểm đến lý tưởng cho những ai yêu thích thiên nhiên...",
      author: "Lê Văn C",
      date: "28/02/2024",
      image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=250&fit=crop",
      category: "Thiên nhiên",
      readTime: "7 phút đọc",
      featured: false,
    },
    {
      id: 8,
      title: "Phú Quốc - Đảo Ngọc Thiên Đường Biển Xanh",
      excerpt:
        "Phú Quốc với những bãi biển tuyệt đẹp, nước biển trong xanh và hải sản tươi ngon. Khám phá những hoạt động thú vị và địa điểm check-in hot nhất đảo ngọc.",
      content: "Phú Quốc là hòn đảo lớn nhất Việt Nam...",
      author: "Phạm Thị D",
      date: "25/02/2024",
      image: "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=400&h=250&fit=crop",
      category: "Biển đảo",
      readTime: "5 phút đọc",
      featured: false,
    },
  ]

  const categories = [
    { id: "all", name: "Tất cả", count: blogPosts.length },
    { id: "Phiêu lưu", name: "Phiêu lưu", count: blogPosts.filter((post) => post.category === "Phiêu lưu").length },
    { id: "Thành phố", name: "Thành phố", count: blogPosts.filter((post) => post.category === "Thành phố").length },
    { id: "Sức khỏe", name: "Sức khỏe", count: blogPosts.filter((post) => post.category === "Sức khỏe").length },
    { id: "Sống khỏe", name: "Sống khỏe", count: blogPosts.filter((post) => post.category === "Sống khỏe").length },
    {
      id: "Thiên nhiên",
      name: "Thiên nhiên",
      count: blogPosts.filter((post) => post.category === "Thiên nhiên").length,
    },
    { id: "Văn hóa", name: "Văn hóa", count: blogPosts.filter((post) => post.category === "Văn hóa").length },
    { id: "Biển đảo", name: "Biển đảo", count: blogPosts.filter((post) => post.category === "Biển đảo").length },
  ]

  const filteredPosts = blogPosts.filter((post) => {
    const matchesSearch =
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "all" || post.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const featuredPosts = blogPosts.filter((post) => post.featured)
  const regularPosts = filteredPosts.filter((post) => !post.featured)

  return (
    <div className="min-h-screen bg-gray-50">
        <Header textColor="black" />

      {/* Hero Section */}
      <section className="relative h-[70vh] min-h-[500px] flex items-center justify-center">
        {/* Background Image */}
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1442850473887-0fb77cd0b337?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            alt="Travel inspiration background"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black/40" />
        </div>

        {/* Content */}
        <div className="relative z-10 text-center text-white px-4">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 tracking-wide">CẢM HỨNG DU LỊCH TỪ NHỮNG CÂU CHUYỆN</h1>
          <p className="text-xl md:text-2xl mb-8 font-light">Cảm nhận chân thật</p>

          <div className="flex justify-center">
            <div className="max-w-md w-full relative">
              <Input
                type="text"
                placeholder="Hãy tìm kiếm câu chuyện về chuyến đi của bạn"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full py-3 px-4 text-gray-900 bg-white border-0 rounded-md text-center"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Blog Posts Grid */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogPosts.map((post) => (
            <Card key={post.id} className="overflow-hidden hover:shadow-lg transition-shadow group bg-white">
              <div className="relative">
                <Image
                  src={post.image || "/placeholder.svg"}
                  alt={post.title}
                  width={400}
                  height={250}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute top-4 left-4">
                  <Badge className="bg-blue-600 text-white">{post.category}</Badge>
                </div>
              </div>
              <CardContent className="p-6">
                <h3 className="font-bold text-lg mb-3 line-clamp-2">{post.title}</h3>
                <div className="flex items-center mb-4">
                  <div className="w-8 h-8 bg-gray-300 rounded-full mr-3"></div>
                  <div>
                    <p className="text-sm font-medium">{post.author}</p>
                    <p className="text-xs text-gray-500">{post.date}</p>
                  </div>
                </div>
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">{post.excerpt}</p>
                <Button variant="outline" size="sm" className="w-full">
                  View Post
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Load More Button */}
        <div className="text-center mt-12">
          <Button variant="outline" size="lg" className="px-8">
            Load More
          </Button>
        </div>
      </div>

      {/* Richird Norton Section */}
      <section className="relative py-24 my-16">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=600&fit=crop"
            alt="Photorealistic rendering background"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black/50" />
        </div>
        <div className="relative z-10 text-center text-white px-4">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Richird Norton photorealistic rendering as real photos
          </h2>
          <p className="text-lg mb-8 max-w-2xl mx-auto">
            Progressively incentivize cooperative systems through technically sound functionalities. The credibly
            productivate seamless data.
          </p>
          <Button size="lg" className="bg-white text-gray-900 hover:bg-gray-100 px-8 py-3 rounded-full">
            Start planning your trip
          </Button>
        </div>
      </section>

      {/* Top Destinations */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Top Destinations</h2>
            <p className="text-gray-600">Sost Brilliant reasons Entrada should be your one-stop-shop!</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-12">
            {[
              {
                name: "Sost Brilliant",
                image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=200&fit=crop",
              },
              {
                name: "Magnificent Tirthan",
                image: "https://images.unsplash.com/photo-1552733407-5d5c46c3bb3b?w=300&h=200&fit=crop",
              },
              {
                name: "Doomsday Glacier",
                image: "https://images.unsplash.com/photo-1464822759844-d150baec93c5?w=300&h=200&fit=crop",
              },
              {
                name: "Doomsday Glacier",
                image: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=300&h=200&fit=crop",
              },
              {
                name: "Doomsday Glacier",
                image: "https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=300&h=200&fit=crop",
              },
            ].map((destination, index) => (
              <div key={index} className="relative overflow-hidden rounded-lg group cursor-pointer">
                <Image
                  src={destination.image || "/placeholder.svg"}
                  alt={destination.name}
                  width={300}
                  height={200}
                  className="w-full h-32 object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/30 flex items-end p-3">
                  <span className="text-white text-sm font-medium">{destination.name}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column */}
            <div className="space-y-6">
              <div>
                <h3 className="font-bold text-lg mb-2">Category name</h3>
                <div className="space-y-3">
                  {[
                    "Top new destination of year bucket list with city of year most popular destination in 2019",
                    "The most beautiful destination in year bucket list with city of year most popular destination in 2019",
                  ].map((text, index) => (
                    <div key={index} className="flex space-x-3">
                      <Image
                        src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=80&h=60&fit=crop"
                        alt="Destination"
                        width={80}
                        height={60}
                        className="w-20 h-15 object-cover rounded"
                      />
                      <div>
                        <p className="text-sm text-gray-600">{text}</p>
                        <p className="text-xs text-gray-400 mt-1">View Post</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Middle Column */}
            <div className="space-y-6">
              <div>
                <h3 className="font-bold text-lg mb-2">Category name</h3>
                <div className="space-y-3">
                  {[
                    { title: "Sunset Route", subtitle: "Sunset Route" },
                    { title: "Magical Himachal", subtitle: "Magical Himachal" },
                    { title: "New John Senna", subtitle: "New John Senna" },
                    { title: "New John Senna", subtitle: "New John Senna" },
                  ].map((item, index) => (
                    <div key={index} className="flex space-x-3">
                      <Image
                        src="https://images.unsplash.com/photo-1552733407-5d5c46c3bb3b?w=60&h=60&fit=crop"
                        alt={item.title}
                        width={60}
                        height={60}
                        className="w-15 h-15 object-cover rounded"
                      />
                      <div>
                        <p className="text-sm font-medium">{item.title}</p>
                        <p className="text-xs text-gray-500">{item.subtitle}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              <div>
                <h3 className="font-bold text-lg mb-2">Image Reads</h3>
                <div className="space-y-4">
                  {[
                    "Top new destination of year bucket list with city of year most popular destination in 2019",
                    "Top new destination of year bucket list with city of year most popular destination in 2019",
                    "Top new destination of year bucket list with city of year most popular destination in 2019",
                  ].map((text, index) => (
                    <div key={index} className="flex space-x-3">
                      <Image
                        src="https://images.unsplash.com/photo-1464822759844-d150baec93c5?w=80&h=60&fit=crop"
                        alt="Destination"
                        width={80}
                        height={60}
                        className="w-20 h-15 object-cover rounded"
                      />
                      <div>
                        <p className="text-sm text-gray-600">{text}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          Top new destination of year bucket list with city of year most popular destination in 2019
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Gallery />
      <Footer />
    </div>
  )
}
