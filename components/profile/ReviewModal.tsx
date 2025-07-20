import { useState } from "react";
import { Star } from "lucide-react";
import { createPortal } from "react-dom";

export default function ReviewModal({ open, onClose, onSubmit, booking, initialReview }) {
  const [rating, setRating] = useState(initialReview?.rating || 0);
  const [comment, setComment] = useState(initialReview?.comment || "");
  const [error, setError] = useState("");

  // Hàm kiểm tra nội dung không phù hợp
  const isInappropriate = (text) => {
    const badWords = ["dm", "đm", "cc", "vcl", "cl", "dmm", "fuck", "shit", "ngu", "địt", "lồn", "cặc", "bitch", "asshole", "dcm", "dcm", "đcm", "địt", "đụ", "đéo", "địt", "đụ", "đéo", "địt", "đụ", "đéo"];
    return badWords.some(word => text.toLowerCase().includes(word));
  };

  if (!open) return null;
  if (typeof window === 'undefined' || !document.body) return null;
  return createPortal(
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-[99999]">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-lg font-semibold mb-4">Đánh giá tour: {booking.tour_name}</h2>
        <div className="flex items-center mb-4">
          {[1,2,3,4,5].map(i => (
            <Star
              key={i}
              className={`w-8 h-8 cursor-pointer ${i <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
              onClick={() => setRating(i)}
            />
          ))}
        </div>
        {error && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-400 text-red-700 px-4 py-2 rounded mb-2 text-sm font-semibold">
            <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="#fee2e2"/>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01" />
            </svg>
            {error}
          </div>
        )}
        <textarea
          className="w-full border rounded p-2 mb-4"
          placeholder="Cảm nhận của bạn (không bắt buộc)"
          value={comment}
          onChange={e => setComment(e.target.value)}
        />
        <div className="flex justify-end gap-2">
          <button className="px-4 py-2 bg-gray-200 rounded" onClick={onClose}>Hủy</button>
          <button
            className="px-4 py-2 bg-teal-500 text-white rounded"
            onClick={() => {
              if (isInappropriate(comment)) {
                setError("Bình luận chứa nội dung không phù hợp.");
                return;
              }
              setError("");
              onSubmit({ rating, comment });
            }}
            disabled={rating === 0}
          >
            Gửi đánh giá
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
} 