import { Button } from "../../components/ui/button"
import Image from "next/image"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
} from "../ui/pagination";
import { cn } from "../../lib/utils";

export default function Gallery() {
  const [images, setImages] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const imagesPerPage = 8;
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

  // Pagination logic
  const totalPages = Math.ceil(images.length / imagesPerPage);
  const imagesToShow = images.slice((page - 1) * imagesPerPage, page * imagesPerPage);

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-12">
          <div>
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Thư Viện Ảnh</h2>
            <p className="text-gray-600">Khám phá những khoảnh khắc tuyệt đẹp được ghi lại trong các chuyến đi của chúng tôi</p>
          </div>
          {images.length > 8 && (
            <Button
              variant="outline"
              className="hidden md:block"
              onClick={() => router.push("/gallery")}
            >
              Xem tất cả ảnh
            </Button>
          )}
        </div>

        {isLoading ? (
          <div className="text-center text-gray-600">Đang tải ảnh...</div>
        ) : error ? (
          <div className="text-center text-red-500">{error}</div>
        ) : images.length === 0 ? (
          <div className="text-center text-gray-600">Không có ảnh để hiển thị</div>
        ) : (
          <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {imagesToShow.map((image, index) => (
              <div
                  key={index + (page-1)*imagesPerPage}
                className="relative overflow-hidden rounded-lg group cursor-pointer"
                onClick={() => setSelectedImage(image)}
              >
                <Image
                  src={image || "/placeholder.svg"}
                    alt={`Gallery image ${index + 1 + (page-1)*imagesPerPage}`}
                  width={300}
                  height={300}
                  className="w-full h-64 object-cover transition-transform group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all"></div>
              </div>
            ))}
          </div>
            {/* Pagination */}
            {totalPages > 1 && (
              <Pagination className="mt-8">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={e => { e.preventDefault(); if(page > 1) setPage(page-1); }}
                      aria-disabled={page === 1}
                      tabIndex={page === 1 ? -1 : 0}
                    >
                      Trước
                    </PaginationPrevious>
                  </PaginationItem>
                  {Array.from({ length: totalPages }, (_, i) => (
                    <PaginationItem key={i}>
                      <PaginationLink
                        href="#"
                        isActive={page === i + 1}
                        onClick={e => { e.preventDefault(); setPage(i + 1); }}
                        className={cn(
                          page === i + 1 ? "bg-blue-500 text-white border-blue-500 hover:bg-blue-600 hover:text-white" : "",
                          "font-semibold"
                        )}
                      >
                        {i + 1}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      onClick={e => { e.preventDefault(); if(page < totalPages) setPage(page+1); }}
                      aria-disabled={page === totalPages}
                      tabIndex={page === totalPages ? -1 : 0}
                    >
                      Sau
                    </PaginationNext>
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </>
        )}

        {/* Nút cho mobile */}
        {images.length > 8 && (
          <div className="text-center mt-8 md:hidden">
            <Button variant="outline" onClick={() => router.push("/gallery")}>Xem tất cả ảnh</Button>
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