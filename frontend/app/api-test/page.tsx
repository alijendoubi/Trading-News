'use client';

import { useEffect, useState } from 'react';
import apiClient from '@/lib/apiClient';
import { API_BASE_URL } from '@/lib/config';

export default function ApiTest() {
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const testApi = async () => {
      try {
        console.log('API_BASE_URL:', API_BASE_URL);
        console.log('Calling /api/markets...');
        
        const response = await apiClient.get('/api/markets');
        console.log('Response:', response.data);
        setResult(response.data);
      } catch (err: any) {
        console.error('Error:', err);
        setError(err.message || 'Unknown error');
      }
    };
    
    testApi();
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">API Test</h1>
      <div className="mb-4">
        <strong>API Base URL:</strong> {API_BASE_URL}
      </div>
      
      {error && (
        <div className="bg-red-900/50 p-4 rounded mb-4">
          <strong>Error:</strong> {error}
        </div>
      )}
      
      {result && (
        <div className="bg-green-900/50 p-4 rounded">
          <strong>Success!</strong>
          <pre className="mt-2 overflow-auto">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
