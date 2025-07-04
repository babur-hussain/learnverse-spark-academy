
import React, { useState } from 'react';
import { Input } from '@/components/UI/input';
import { Button } from '@/components/UI/button';
import { FormLabel } from '@/components/UI/form';
import { Gift, Check } from 'lucide-react';

interface ReferralInputProps {
  onReferralValidated: (code: string | null) => void;
  initialCode: string;
}

export const ReferralInput: React.FC<ReferralInputProps> = ({ 
  onReferralValidated, 
  initialCode 
}) => {
  const [referralCode, setReferralCode] = useState(initialCode);
  const [isValid, setIsValid] = useState(false);

  const validateReferral = () => {
    // Simple validation - in real app, you'd check against database
    if (referralCode && referralCode.length >= 6) {
      setIsValid(true);
      onReferralValidated(referralCode);
    } else {
      setIsValid(false);
      onReferralValidated(null);
    }
  };

  return (
    <div className="space-y-2">
      <FormLabel className="flex items-center gap-2">
        <Gift className="h-4 w-4" />
        Referral Code (Optional)
      </FormLabel>
      <div className="flex gap-2">
        <Input
          placeholder="Enter referral code"
          value={referralCode}
          onChange={(e) => setReferralCode(e.target.value)}
          className={isValid ? 'border-green-500' : ''}
        />
        <Button
          type="button"
          variant="outline"
          onClick={validateReferral}
          disabled={!referralCode}
        >
          {isValid ? <Check className="h-4 w-4" /> : 'Apply'}
        </Button>
      </div>
      {isValid && (
        <p className="text-sm text-green-600">
          ✓ Referral code applied! You'll get ₹50 off your first purchase.
        </p>
      )}
    </div>
  );
};
