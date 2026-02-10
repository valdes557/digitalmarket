import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useForm } from 'react-hook-form';
import { Loader2 } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { useAuthStore } from '../../stores/authStore';
import { userAPI } from '../../lib/api';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { user, updateUser } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const { register, handleSubmit } = useForm({ defaultValues: user });

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const response = await userAPI.updateProfile(data);
      updateUser(response.data.user);
      toast.success('Profil mis à jour');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Erreur');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Helmet><title>Mon profil - DigitalMarket</title></Helmet>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Mon profil</h1>

        <div className="max-w-2xl">
          <Card>
            <CardHeader><CardTitle>Informations personnelles</CardTitle></CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <Label>Prénom</Label>
                    <Input {...register('first_name')} />
                  </div>
                  <div>
                    <Label>Nom</Label>
                    <Input {...register('last_name')} />
                  </div>
                </div>
                <div>
                  <Label>Email</Label>
                  <Input value={user?.email} disabled />
                </div>
                <div>
                  <Label>Téléphone</Label>
                  <Input {...register('phone')} />
                </div>
                <Button type="submit" disabled={isLoading}>
                  {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Enregistrer
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
