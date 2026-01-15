import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import BottomNav from './components/BottomNav';
import Home from './pages/Home';
import Explore from './pages/Explore';
import CreateEvent from './pages/CreateEvent';
import Profile from './pages/Profile';
import EventDetail from './pages/EventDetail';
import VenueRegister from './pages/VenueRegister';
import Login from './pages/Login';

import { EventsProvider } from './context/EventsContext';
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <AuthProvider>
      <EventsProvider>
        <Router>
          <div style={{ paddingBottom: '80px' }}> {/* Space for BottomNav */}
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/explore" element={<Explore />} />
              <Route path="/create" element={<CreateEvent />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/event/:id" element={<EventDetail />} />
              <Route path="/venue/register" element={<VenueRegister />} />
              <Route path="/login" element={<Login />} />
            </Routes>
            <BottomNav />
          </div>
        </Router>
      </EventsProvider>
    </AuthProvider>
  );
}

export default App;
