'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Lock, User, Mail, Phone, Pencil, Eye, EyeOff } from 'lucide-react';
import { useSession } from "next-auth/react";
import { useToast } from '@/hooks/use-toast';

export default function ProfilePage() {
  const { toast } = useToast();
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [user, setUser] = useState({
    name: '',
    email: '',
    phone: '',
    password: ''
  });
  const [passwordVisibility, setPasswordVisibility] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  // Updated fetch user profile function
  const fetchUserProfile = async () => {
    try {
      const response = await fetch('/api/profile');
      if (!response.ok) throw new Error('Failed to fetch profile');
      
      const data = await response.json();
      setUser({
        ...data,
        phone: data.phone || '+1 234 567 8900' // Fallback if phone not in DB
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load profile information',
      });
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, []);

  // Updated password change handler
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (formData.newPassword !== formData.confirmPassword) {
        throw new Error('Passwords do not match');
      }

      const response = await fetch('/api/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error);
      }

      toast({
        title: 'Success',
        description: 'Your password has been updated successfully.',
      });

      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setIsPasswordDialogOpen(false);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to update password',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <User className="h-5 w-5 text-muted-foreground" />
              <div className="flex-grow">
                <Label>Name</Label>
                <p className="text-lg">{user.name}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Mail className="h-5 w-5 text-muted-foreground" />
              <div className="flex-grow">
                <Label>Email</Label>
                <p className="text-lg">{user.email}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Phone className="h-5 w-5 text-muted-foreground" />
              <div className="flex-grow">
                <Label>Phone</Label>
                <p className="text-lg">{user.phone}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Lock className="h-5 w-5 text-muted-foreground" />
              <div className="flex-grow">
                <Label>Password</Label>
                <div className="flex items-center">
                  <p className="text-lg">********</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsPasswordDialogOpen(true)}
                    className="ml-2"
                  >
                    <Pencil className="h-4 w-4" />
                    <span className="ml-2">Change</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
          </DialogHeader>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <div className="relative">
                <Input
                  id="currentPassword"
                  type={passwordVisibility.current ? "text" : "password"}
                  value={formData.currentPassword}
                  onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1 h-8 w-8 p-0"
                  onClick={() => setPasswordVisibility(prev => ({ ...prev, current: !prev.current }))}
                >
                  {passwordVisibility.current ? 
                    <EyeOff className="h-4 w-4 text-muted-foreground" /> : 
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  }
                </Button>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={passwordVisibility.new ? "text" : "password"}
                  value={formData.newPassword}
                  onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1 h-8 w-8 p-0"
                  onClick={() => setPasswordVisibility(prev => ({ ...prev, new: !prev.new }))}
                >
                  {passwordVisibility.new ? 
                    <EyeOff className="h-4 w-4 text-muted-foreground" /> : 
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  }
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={passwordVisibility.confirm ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1 h-8 w-8 p-0"
                  onClick={() => setPasswordVisibility(prev => ({ ...prev, confirm: !prev.confirm }))}
                >
                  {passwordVisibility.confirm ? 
                    <EyeOff className="h-4 w-4 text-muted-foreground" /> : 
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  }
                </Button>
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsPasswordDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Updating...' : 'Update Password'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

