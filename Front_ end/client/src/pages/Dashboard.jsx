import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import DashProfile from '../components/DashProfile';
import DashProfileEdit from '../components/DashProfileEdit';
export default function Dashboard() {
  const location = useLocation();
  const [tab, setTab] = useState('');
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const tabFromUrl = urlParams.get('tab');
    if (tabFromUrl) {
      setTab(tabFromUrl);
    }
  }, [location.search]);
  return (
    <div className="min-h-screen flex flex-col md:flex-row overflow-y-auto">
      
     
      {/* profile... */}
      {tab === "profile" && <DashProfile />}
      {tab === "edit" && < DashProfileEdit/>}
      
    </div>
  );
}