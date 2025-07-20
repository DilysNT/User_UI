import { useState, useEffect } from 'react';
import { Tour } from '../types/tour';
import { getTours, getTourById } from '../services/tourService';

// Hook để lấy danh sách tours
export const useTours = () => {
  const [tours, setTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTours = async () => {
      try {
        setLoading(true);
        const tours = await getTours();
        setTours(tours);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch tours');
      } finally {
        setLoading(false);
      }
    };

    fetchTours();
  }, []);

  return { tours, loading, error };
};

// Hook để lấy chi tiết tour theo ID
export const useTourDetail = (tourId: string) => {
  const [tour, setTour] = useState<Tour | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTourDetail = async () => {
      if (!tourId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const tour = await getTourById(tourId);
        setTour(tour);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch tour detail');
      } finally {
        setLoading(false);
      }
    };

    fetchTourDetail();
  }, [tourId]);

  return { tour, loading, error };
}; 