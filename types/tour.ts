export interface Tour {
  id: string;
  agency_id: string;
  name: string;
  description: string;
  location: string;
  destination: string;
  departure_location: string;
  price: number | null;
  tour_type: string;
  max_participants: number;
  min_participants: number;
  status: string;
  created_at: string;
  updated_at: string;
  departureDates: string[];
  images?: Array<{
    id: string;
    image_url: string;
    is_main: boolean;
  }>;
}

export type TourListResponse = Tour[];
export type TourDetailResponse = Tour; 