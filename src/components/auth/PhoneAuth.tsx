import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CARIBBEAN_COLORS } from '@/constants';

const PhoneAuth = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Phone auth logic would go here
      console.log('Authenticating phone:', phoneNumber);
    } catch (error) {
      console.error('Auth error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6" style={{ color: CARIBBEAN_COLORS.neutral[900] }}>
        Phone Verification
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="phone">Phone Number</Label>
          <Input
            id="phone"
            type="tel"
            placeholder="+1 (876) 123-4567"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            required
          />
        </div>
        
        <Button 
          type="submit" 
          className="w-full"
          disabled={isLoading}
          style={{ backgroundColor: CARIBBEAN_COLORS.primary[500] }}
        >
          {isLoading ? 'Verifying...' : 'Verify Phone'}
        </Button>
      </form>
    </div>
  );
};

export default PhoneAuth;