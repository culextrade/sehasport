import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import BottomNav from './components/BottomNav';
import Home from './pages/Home';
import Explore from './pages/Explore';
import CreateEvent from './pages/CreateEvent';
import Profile from './pages/Profile';
import EventDetail from './pages/EventDetail';
import VenueRegister from './pages/VenueRegister';
import Login from './pages/Login';
import Onboarding from './pages/Onboarding';
import Communities from './pages/Communities';
import CommunityDetail from './pages/CommunityDetail';
import CreateCommunity from './pages/CreateCommunity';

import { EventsProvider } from './context/EventsContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { VenueProvider } from './context/VenueContext';
import { CommunityProvider } from './context/CommunityContext';
import { useEffect } from 'react';

// Guard to check if user has a role
const RouteGuard = ({ children }) => {
  const { user, role } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // If logged in but no role, and not already on onboarding, go to onboarding
    if (user && role === null && location.pathname !== '/onboarding') {
      navigate('/onboarding');
    }
  }, [user, role, navigate, location]);

  return children;
};

function App() {
  return (
    <AuthProvider>
      <VenueProvider>
        <CommunityProvider>
          <EventsProvider>
            <Router>
              <RouteGuard>
                <div style={{ paddingBottom: '80px' }}> {/* Space for BottomNav */}
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/explore" element={<Explore />} />
                    <Route path="/create" element={<CreateEvent />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/event/:id" element={<EventDetail />} />
                    <Route path="/venue/register" element={<VenueRegister />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/onboarding" element={<Onboarding />} />
                    <Route path="/communities" element={<Communities />} />
                    <Route path="/communities/:id" element={<CommunityDetail />} />
                    <Route path="/communities/create" element={<CreateCommunity />} />
                  </Routes>
                  <BottomNav />
                </div>
              </RouteGuard>
            </Router>
          </EventsProvider>
        </CommunityProvider>
      </VenueProvider>
    </AuthProvider>
  );
}

export default App;

