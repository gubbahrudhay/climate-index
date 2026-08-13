import { useState, useEffect } from "react";

export interface TemperatureData {
  years: number[];
  T90: (number | null)[][];
  T10: (number | null)[][];
  T90S: (number | null)[][];
  T10S: (number | null)[][];
}

const requestCache = new Map<string, Promise<TemperatureData>>();

export function useTemperatureData(level: "india" | "state" | "district", id?: string) {
  const [data, setData] = useState<TemperatureData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;
    
    async function fetchData() {
      if (level !== "india" && !id) {
        setLoading(false);
        return;
      }
      
      const cacheKey = `${level}-${id || 'india'}`;
      
      setLoading(true);
      setError(null);
      
      try {
        let fetchPromise = requestCache.get(cacheKey);
        
        if (!fetchPromise) {
          const url = `/api/temperature/${level}${id ? `?id=${encodeURIComponent(id)}` : ''}`;
          fetchPromise = fetch(url).then(async (res) => {
            if (!res.ok) {
              throw new Error(`Failed to fetch: ${res.statusText}`);
            }
            const json = await res.json();
            if (json.error) {
              throw new Error(json.error);
            }
            return json as TemperatureData;
          });
          requestCache.set(cacheKey, fetchPromise);
        }
        
        const json = await fetchPromise;
        
        if (isMounted) {
          setData(json);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [level, id]);

  return { data, loading, error };
}

export function getLatestNonNull(arr: (number | null)[][] | undefined): number | null {
  if (!arr || !Array.isArray(arr)) return null;
  
  for (let i = arr.length - 1; i >= 0; i--) {
    const yearData = arr[i];
    if (Array.isArray(yearData)) {
      // Find non-null months in this year
      const validMonths = yearData.filter(v => v !== null && typeof v === 'number' && !Number.isNaN(v)) as number[];
      if (validMonths.length > 0) {
        // Return average of valid months for the latest available year
        const sum = validMonths.reduce((a, b) => a + b, 0);
        return sum / validMonths.length;
      }
    } else if (yearData !== null && typeof yearData === 'number' && !Number.isNaN(yearData)) {
      // Fallback in case the array is 1D
      return yearData;
    }
  }
  return null;
}
