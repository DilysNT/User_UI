"use client";

import Image from "next/image"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export default function GalleryPage() {
  const [images, setImages] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const router = useRouter();

  useEffect(() => {
    const fetchImages = async () => {
      try {
        setIsLoading(true)
        const response = await fetch("http://localhost:5000/api/tour-images", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        })

        if (!response.ok) {
          throw new Error("Failed to fetch images")
        }

        const data = await response.json()
        const imageUrls = Array.isArray(data.data) ? data.data.map((item: { image_url: string }) => item.image_url) : []
        setImages(imageUrls)
      } catch (err) {
        setError("Không thể tải ảnh. Vui lòng thử lại sau.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchImages()
  }, [])

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-2 mb-4">
          <button
            className="mr-2 p-2 rounded-full hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-400"
            onClick={() => router.push("/")}
            aria-label="Về trang chủ"
            style={{ lineHeight: 0 }}
          >
            <span className="text-2xl md:text-3xl">←</span>
          </button>
          <h2 className="text-4xl font-bold text-gray-800">Tất Cả Ảnh</h2>
        </div>
        {isLoading ? (
          <div className="text-center text-gray-600">Đang tải ảnh...</div>
        ) : error ? (
          <div className="text-center text-red-500">{error}</div>
        ) : images.length === 0 ? (
          <div className="text-center text-gray-600">Không có ảnh để hiển thị</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {images.map((image, index) => (
              <div
                key={index}
                className="relative overflow-hidden rounded-lg group cursor-pointer"
                onClick={() => setSelectedImage(image)}
              >
                <Image
                  src={image || "/placeholder.svg"}
                  alt={`Gallery image ${index + 1}`}
                  width={300}
                  height={300}
                  className="w-full h-64 object-cover transition-transform group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all"></div>
              </div>
            ))}
          </div>
        )}

        {/* Modal xem ảnh full screen */}
        {selectedImage && (
          <div
            className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50"
            onClick={() => setSelectedImage(null)}
          >
            <div
              className="relative max-w-3xl w-full"
              onClick={e => e.stopPropagation()} // Ngăn đóng modal khi click vào ảnh
            >
              <button
                className="absolute top-2 right-2 text-white text-3xl font-bold z-10"
                onClick={() => setSelectedImage(null)}
                aria-label="Đóng"
              >
                ×
              </button>
              <Image
                src={selectedImage}
                alt="Ảnh chi tiết"
                width={1200}
                height={800}
                className="w-full h-auto max-h-[80vh] object-contain rounded-lg shadow-lg"
              />
            </div>
          </div>
        )}
      </div>
    </section>
  )
} 