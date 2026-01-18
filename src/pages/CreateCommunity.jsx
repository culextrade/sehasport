import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCommunity } from '../context/CommunityContext';
import { useAuth } from '../context/AuthContext';
import '../styles/CreateCommunity.css';

const CreateCommunity = () => {
    const navigate = useNavigate();
    const { createCommunity } = useCommunity();
    const { user } = useAuth();

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        sport: '',
        image_url: '',
        is_public: true
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const sports = [
        { value: 'tennis', label: '🎾 Tennis' },
        { value: 'padel', label: '🏸 Padel' },
        { value: 'futsal', label: '⚽ Futsal' },
        { value: 'mini soccer', label: '⚽ Mini Soccer' },
        { value: 'badminton', label: '🏸 Badminton' },
        { value: 'basketball', label: '🏀 Basketball' }
    ];

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.name.trim()) {
            setError('Community name is required');
            return;
        }
        if (!formData.sport) {
            setError('Please select a sport');
            return;
        }

        setLoading(true);
        setError('');

        const { data, error: createError } = await createCommunity(formData);

        if (createError) {
            setError(createError.message || 'Failed to create community');
            setLoading(false);
            return;
        }

        navigate(`/communities/${data.id}`);
    };

    if (!user) {
        return (
            <div className="create-community-page">
                <div className="auth-required">
                    <h2>Login Required</h2>
                    <p>You need to be logged in to create a community</p>
                    <button onClick={() => navigate('/login')}>Login</button>
                </div>
            </div>
        );
    }

    return (
        <div className="create-community-page">
            <header className="page-header">
                <button className="back-btn" onClick={() => navigate('/communities')}>
                    ← Back
                </button>
                <h1>Create Community</h1>
            </header>

            <form onSubmit={handleSubmit} className="community-form">
                {error && <div className="error-message">{error}</div>}

                <div className="form-group">
                    <label htmlFor="name">Community Name *</label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="e.g., Jakarta Tennis Club"
                        maxLength={50}
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="sport">Sport *</label>
                    <select
                        id="sport"
                        name="sport"
                        value={formData.sport}
                        onChange={handleChange}
                    >
                        <option value="">Select a sport</option>
                        {sports.map(sport => (
                            <option key={sport.value} value={sport.value}>
                                {sport.label}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="form-group">
                    <label htmlFor="description">Description</label>
                    <textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        placeholder="Tell others about your community..."
                        rows={4}
                        maxLength={500}
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="image_url">Cover Image URL</label>
                    <input
                        type="url"
                        id="image_url"
                        name="image_url"
                        value={formData.image_url}
                        onChange={handleChange}
                        placeholder="https://example.com/image.jpg"
                    />
                    {formData.image_url && (
                        <div className="image-preview">
                            <img src={formData.image_url} alt="Preview" />
                        </div>
                    )}
                </div>

                <div className="form-group checkbox-group">
                    <label>
                        <input
                            type="checkbox"
                            name="is_public"
                            checked={formData.is_public}
                            onChange={handleChange}
                        />
                        <span>Public Community</span>
                    </label>
                    <p className="help-text">
                        {formData.is_public
                            ? 'Anyone can discover and join this community'
                            : 'Only invited members can join'}
                    </p>
                </div>

                <div className="info-box">
                    <span className="icon">👑</span>
                    <p>You will become the <strong>Leader</strong> of this community with full management rights.</p>
                </div>

                <button
                    type="submit"
                    className="submit-btn"
                    disabled={loading}
                >
                    {loading ? 'Creating...' : 'Create Community'}
                </button>
            </form>
        </div>
    );
};

export default CreateCommunity;
