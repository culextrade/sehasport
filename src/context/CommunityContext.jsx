import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from './AuthContext';

const CommunityContext = createContext();

export const useCommunity = () => useContext(CommunityContext);

export const CommunityProvider = ({ children }) => {
    const [communities, setCommunities] = useState([]);
    const [myCommunities, setMyCommunities] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    // Fetch all public communities
    const fetchCommunities = async () => {
        try {
            const { data, error } = await supabase
                .from('communities')
                .select(`
                    *,
                    community_members (
                        user_id,
                        role
                    )
                `)
                .eq('is_public', true)
                .order('created_at', { ascending: false });

            if (error) throw error;

            // Add member count
            const withCounts = (data || []).map(c => ({
                ...c,
                member_count: c.community_members?.length || 0
            }));

            setCommunities(withCounts);
        } catch (err) {
            console.error('Error fetching communities:', err);
        } finally {
            setLoading(false);
        }
    };

    // Fetch communities user is a member of
    const fetchMyCommunities = async () => {
        if (!user) {
            setMyCommunities([]);
            return;
        }

        try {
            const { data, error } = await supabase
                .from('community_members')
                .select(`
                    role,
                    communities (
                        *,
                        community_members (
                            user_id,
                            role
                        )
                    )
                `)
                .eq('user_id', user.id);

            if (error) throw error;

            const formatted = (data || []).map(m => ({
                ...m.communities,
                my_role: m.role,
                member_count: m.communities?.community_members?.length || 0
            }));

            setMyCommunities(formatted);
        } catch (err) {
            console.error('Error fetching my communities:', err);
        }
    };

    useEffect(() => {
        fetchCommunities();
    }, []);

    useEffect(() => {
        fetchMyCommunities();
    }, [user]);

    // Create a new community (user becomes LEADER)
    const createCommunity = async (communityData) => {
        if (!user) return { error: 'Not authenticated' };

        try {
            // Create community
            const { data: community, error: createError } = await supabase
                .from('communities')
                .insert([{
                    name: communityData.name,
                    description: communityData.description,
                    sport: communityData.sport,
                    image_url: communityData.image_url,
                    is_public: communityData.is_public ?? true,
                    has_membership: communityData.has_membership ?? false
                }])
                .select()
                .single();

            if (createError) throw createError;

            // Add creator as LEADER
            const { error: memberError } = await supabase
                .from('community_members')
                .insert([{
                    community_id: community.id,
                    user_id: user.id,
                    role: 'LEADER'
                }]);

            if (memberError) throw memberError;

            // Update local state
            const newCommunity = { ...community, my_role: 'LEADER', member_count: 1 };
            setMyCommunities(prev => [newCommunity, ...prev]);
            setCommunities(prev => [{ ...community, member_count: 1 }, ...prev]);

            return { data: community };
        } catch (err) {
            console.error('Error creating community:', err);
            return { error: err };
        }
    };

    // Join a community (as MEMBER)
    const joinCommunity = async (communityId) => {
        if (!user) return { error: 'Not authenticated' };

        try {
            const { data, error } = await supabase
                .from('community_members')
                .insert([{
                    community_id: communityId,
                    user_id: user.id,
                    role: 'MEMBER'
                }])
                .select()
                .single();

            if (error) throw error;

            // Update local state
            await fetchMyCommunities();
            await fetchCommunities();

            return { data };
        } catch (err) {
            console.error('Error joining community:', err);
            return { error: err };
        }
    };

    // Leave a community
    const leaveCommunity = async (communityId) => {
        if (!user) return { error: 'Not authenticated' };

        // Check if user is leader
        const myMembership = myCommunities.find(c => c.id === communityId);
        if (myMembership?.my_role === 'LEADER') {
            return { error: 'Leaders cannot leave. Transfer leadership first.' };
        }

        try {
            const { error } = await supabase
                .from('community_members')
                .delete()
                .eq('community_id', communityId)
                .eq('user_id', user.id);

            if (error) throw error;

            // Update local state
            setMyCommunities(prev => prev.filter(c => c.id !== communityId));

            return {};
        } catch (err) {
            console.error('Error leaving community:', err);
            return { error: err };
        }
    };

    // Transfer leadership to another member
    const transferLeadership = async (communityId, newLeaderId) => {
        if (!user) return { error: 'Not authenticated' };

        // Verify current user is leader
        const myMembership = myCommunities.find(c => c.id === communityId);
        if (myMembership?.my_role !== 'LEADER') {
            return { error: 'Only leaders can transfer leadership' };
        }

        try {
            // Update new leader (trigger will demote old leader to ADMIN)
            const { error } = await supabase
                .from('community_members')
                .update({ role: 'LEADER' })
                .eq('community_id', communityId)
                .eq('user_id', newLeaderId);

            if (error) throw error;

            // Refresh data
            await fetchMyCommunities();

            return {};
        } catch (err) {
            console.error('Error transferring leadership:', err);
            return { error: err };
        }
    };

    // Promote member to ADMIN (only LEADER can do this)
    const promoteMember = async (communityId, memberId) => {
        if (!user) return { error: 'Not authenticated' };

        const myMembership = myCommunities.find(c => c.id === communityId);
        if (myMembership?.my_role !== 'LEADER') {
            return { error: 'Only leaders can promote members' };
        }

        try {
            const { error } = await supabase
                .from('community_members')
                .update({ role: 'ADMIN' })
                .eq('community_id', communityId)
                .eq('user_id', memberId);

            if (error) throw error;

            return {};
        } catch (err) {
            console.error('Error promoting member:', err);
            return { error: err };
        }
    };

    // Get communities where user can create events (LEADER or ADMIN)
    const getManageableCommunities = () => {
        return myCommunities.filter(c => c.my_role === 'LEADER' || c.my_role === 'ADMIN');
    };

    // Get community by ID with full member details
    const getCommunityById = async (communityId) => {
        try {
            const { data, error } = await supabase
                .from('communities')
                .select(`
                    *,
                    community_members (
                        user_id,
                        role,
                        joined_at,
                        profiles (
                            full_name,
                            avatar_url,
                            email
                        )
                    )
                `)
                .eq('id', communityId)
                .single();

            if (error) throw error;
            return { data };
        } catch (err) {
            console.error('Error getting community:', err);
            return { error: err };
        }
    };

    // Check if user is member of a community
    const isMember = (communityId) => {
        return myCommunities.some(c => c.id === communityId);
    };

    // Get user's role in a community
    const getMyRole = (communityId) => {
        const community = myCommunities.find(c => c.id === communityId);
        return community?.my_role || null;
    };

    return (
        <CommunityContext.Provider value={{
            communities,
            myCommunities,
            loading,
            fetchCommunities,
            fetchMyCommunities,
            createCommunity,
            joinCommunity,
            leaveCommunity,
            transferLeadership,
            promoteMember,
            getManageableCommunities,
            getCommunityById,
            isMember,
            getMyRole
        }}>
            {children}
        </CommunityContext.Provider>
    );
};
