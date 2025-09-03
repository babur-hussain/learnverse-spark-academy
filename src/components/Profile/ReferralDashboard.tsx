
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/UI/card';
import { Button } from '@/components/UI/button';
import { Badge } from '@/components/UI/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Copy, Gift, Users, IndianRupee, Share2 } from 'lucide-react';

export const ReferralDashboard: React.FC = () => {
  const { toast } = useToast();
  const [isSharing, setIsSharing] = useState(false);

  const { data: referralData, isLoading } = useQuery({
    queryKey: ['referral-dashboard'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Get user's referral code
      const { data: referralCode } = await supabase
        .from('referral_codes')
        .select('code')
        .eq('user_id', user.id)
        .single();

      // Get referrals made by this user
      const { data: referrals } = await supabase
        .from('referrals')
        .select(`
          id,
          referee_id,
          referrer_reward_amount,
          referee_reward_amount,
          referrer_rewarded,
          created_at,
          profiles!referrals_referee_id_fkey(username, full_name)
        `)
        .eq('referrer_id', user.id)
        .order('created_at', { ascending: false });

      // Get total rewards earned
      const { data: rewards } = await supabase
        .from('referral_rewards')
        .select('reward_amount')
        .eq('user_id', user.id);

      const totalRewards = rewards?.reduce((sum, reward) => sum + Number(reward.reward_amount), 0) || 0;

      return {
        referralCode: referralCode?.code || null,
        referrals: referrals || [],
        totalRewards,
        totalReferrals: referrals?.length || 0
      };
    },
  });

  const copyReferralCode = async () => {
    if (!referralData?.referralCode) return;
    
    try {
      await navigator.clipboard.writeText(referralData.referralCode);
      toast({
        title: "Copied!",
        description: "Referral code copied to clipboard.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy referral code.",
        variant: "destructive",
      });
    }
  };

  const shareReferralLink = async () => {
    if (!referralData?.referralCode) return;
    
    setIsSharing(true);
    const shareUrl = `${window.location.origin}/auth?ref=${referralData.referralCode}`;
    const shareText = `Join Spark Academy with my referral code ${referralData.referralCode} and get ₹50 off your first purchase! 🎓`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Join Spark Academy',
          text: shareText,
          url: shareUrl,
        });
      } else {
        await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
        toast({
          title: "Copied!",
          description: "Referral link copied to clipboard.",
        });
      }
    } catch (error) {
      console.error('Error sharing:', error);
    } finally {
      setIsSharing(false);
    }
  };

  if (isLoading) {
    return <div className="p-6">Loading referral data...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Gift className="h-5 w-5 text-purple-600" />
              Your Referral Code
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600 mb-2">
                {referralData?.referralCode || 'Loading...'}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyReferralCode}
                  className="flex-1"
                  disabled={!referralData?.referralCode}
                >
                  <Copy className="h-4 w-4 mr-1" />
                  Copy
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={shareReferralLink}
                  className="flex-1"
                  disabled={!referralData?.referralCode || isSharing}
                >
                  <Share2 className="h-4 w-4 mr-1" />
                  Share
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              Total Referrals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {referralData?.totalReferrals || 0}
              </div>
              <p className="text-sm text-gray-600">Friends referred</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <IndianRupee className="h-5 w-5 text-green-600" />
              Total Rewards
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                ₹{referralData?.totalRewards || 0}
              </div>
              <p className="text-sm text-gray-600">Rewards earned</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Referral History</CardTitle>
        </CardHeader>
        <CardContent>
          {referralData?.referrals && referralData.referrals.length > 0 ? (
            <div className="space-y-4">
              {referralData.referrals.map((referral: any) => (
                <div
                  key={referral.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                      <Users className="h-5 w-5 text-gray-600" />
                    </div>
                    <div>
                      <p className="font-medium">
                        {referral.profiles?.full_name || referral.profiles?.username || 'New User'}
                      </p>
                      <p className="text-sm text-gray-600">
                        Joined {new Date(referral.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant={referral.referrer_rewarded ? "default" : "secondary"}>
                      ₹{referral.referrer_reward_amount}
                    </Badge>
                    <p className="text-xs text-gray-600 mt-1">
                      {referral.referrer_rewarded ? 'Rewarded' : 'Pending'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No referrals yet</p>
              <p className="text-sm text-gray-500">
                Share your referral code to start earning rewards!
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-2">How Referrals Work</h3>
          <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
            <p>• Share your referral code with friends</p>
            <p>• When they sign up, they get ₹50 off their first purchase</p>
            <p>• You earn ₹100 as a reward when they make their first purchase</p>
            <p>• Rewards are given as discount coupons valid for 6 months</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
