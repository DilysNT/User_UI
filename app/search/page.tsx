"use client";
import { Suspense } from "react";
import SearchPage from "../../components/search/Search";

function SearchPageWithSuspense() {
	return (
		<Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center">
			<div className="text-center">
				<div className="animate-spin rounded-full h-32 w-32 border-b-2 border-teal-500 mx-auto mb-4"></div>
				<p className="text-gray-600">Đang tải trang tìm kiếm...</p>
			</div>
		</div>}>
			<SearchPage />
		</Suspense>
	);
}

export default function Page() {
	return <SearchPageWithSuspense />;
}