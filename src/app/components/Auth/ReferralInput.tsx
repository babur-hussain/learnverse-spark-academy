
import React, { useState } from 'react';
import { Input } from '@/components/UI/input';
import { Label } from '@/components/UI/label';
import { Button } from '@/components/UI/button';
import { Badge } from '@/components/UI/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { Check, X, Gift } from 'lucide-react';

interface ReferralInputProps {
  onReferralValidated: (code: string | null) => void;
  initialCode?: string;
}

export const ReferralInput: React.FC<ReferralInputProps> = ({
  onReferralValidated,
  initialCode = ''
}) => {
  const [referralCode, setReferralCode] = useState(initialCode);
  const [isValidating, setIsValidating] = useState(false);
  const [validationStatus, setValidationStatus] = useState<'valid' | 'invalid' | null>(null);
  const { toast } = useToast();

  const validateReferralCode = async (code: string) => {
    if (!code.trim()) {
      setValidationStatus(null);
      onReferralValidated(null);
      return;
    }

    setIsValidating(true);
    try {
      const { data, error } = await supabase
        .from('referral_codes')
        .select('code, user_id')
        .eq('code', code.toUpperCase())
        .eq('is_active', true)
        .single();

      if (error || !data) {
        setValidationStatus('invalid');
        onReferralValidated(null);
        toast({
          title: "Invalid Referral Code",
          description: "The referral code you entered is not valid.",
          variant: "destructive",
        });
      } else {
        setValidationStatus('valid');
        onReferralValidated(code.toUpperCase());
        toast({
          title: "Valid Referral Code!",
          description: "You'll receive ₹50 off your first purchase.",
        });
      }
    } catch (error) {
      console.error('Error validating referral code:', error);
      setValidationStatus('invalid');
      onReferralValidated(null);
    } finally {
      setIsValidating(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase();
    setReferralCode(value);
    
    // Clear validation status when user types
    if (validationStatus) {
      setValidationStatus(null);
      onReferralValidated(null);
    }
  };

  const handleValidate = () => {
    validateReferralCode(referralCode);
  };

  const clearReferralCode = () => {
    setReferralCode('');
    setValidationStatus(null);
    onReferralValidated(null);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Gift className="h-4 w-4 text-purple-600" />
        <Label htmlFor="referral-code" className="text-sm font-medium">
          Referral Code (Optional)
        </Label>
      </div>
      
      <div className="space-y-2">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Input
              id="referral-code"
              type="text"
              placeholder="Enter referral code"
              value={referralCode}
              onChange={handleInputChange}
              maxLength={8}
              className={`uppercase ${
                validationStatus === 'valid' 
                  ? 'border-green-500 bg-green-50' 
                  : validationStatus === 'invalid' 
                  ? 'border-red-500 bg-red-50' 
                  : ''
              }`}
            />
            {validationStatus && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {validationStatus === 'valid' ? (
                  <Check className="h-4 w-4 text-green-600" />
                ) : (
                  <X className="h-4 w-4 text-red-600" />
                )}
              </div>
            )}
          </div>
          
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleValidate}
            disabled={!referralCode.trim() || isValidating}
          >
            {isValidating ? 'Validating...' : 'Validate'}
          </Button>
        </div>

        {validationStatus === 'valid' && (
          <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-green-700 border-green-300">
                {referralCode}
              </Badge>
              <span className="text-sm text-green-700 dark:text-green-400">
                ₹50 signup bonus applied!
              </span>
            </div>
            <Button variant="ghost" size="sm" onClick={clearReferralCode}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}

        <p className="text-xs text-gray-500 dark:text-gray-400">
          Get ₹50 off your first purchase with a valid referral code
        </p>
      </div>
    </div>
  );
};
