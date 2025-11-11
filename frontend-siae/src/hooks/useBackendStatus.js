import { useEffect, useState } from 'react';
import axios from 'axios';

function useBackendStatus(pingUrl = 'http://localhost:8080/api/health') {
  const [status, setStatus] = useState('checking'); // checking | online | offline

  useEffect(() => {
    const check = async () => {
      try {
        await axios.get(pingUrl, { timeout: 3000 });
        setStatus('online');
      } catch {
        setStatus('offline');
      }
    };
    check();
    const interval = setInterval(check, 10000); // cada 10 seg
    return () => clearInterval(interval);
  }, [pingUrl]);

  return status;
}

export default useBackendStatus;