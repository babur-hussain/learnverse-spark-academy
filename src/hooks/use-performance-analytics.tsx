
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { PerformanceAnalyticsService } from '@/services/PerformanceAnalyticsService';
import type { PerformanceMetrics, PerformanceAnomaly, StudentGoal } from '@/types/analytics';

export function usePerformanceAnalytics() {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [anomalies, setAnomalies] = useState<PerformanceAnomaly[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    const loadAnalytics = async () => {
      try {
        setLoading(true);
        const [metricsData, anomaliesData] = await Promise.all([
          PerformanceAnalyticsService.getStudentPerformanceMetrics(user.id),
          PerformanceAnalyticsService.getPerformanceAnomalies(user.id)
        ]);

        setMetrics(metricsData);
        setAnomalies(anomaliesData);
      } catch (err) {
        console.error('Error loading analytics:', err);
        setError('Failed to load performance analytics');
      } finally {
        setLoading(false);
      }
    };

    loadAnalytics();
  }, [user]);

  return {
    metrics,
    anomalies,
    loading,
    error
  };
}
