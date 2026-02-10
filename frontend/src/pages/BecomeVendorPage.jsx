import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useForm } from 'react-hook-form';
import { Store, Check, Loader2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { useAuthStore } from '../stores/authStore';
import { vendorsAPI } from '../lib/api';
import toast from 'react-hot-toast';

export default function BecomeVendorPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { isAuthenticated, user } = useAuthStore();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm();

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <Store className="w-16 h-16 mx-auto text-primary mb-6" />
        <h1 className="text-3xl font-bold mb-4">Devenir vendeur</h1>
        <p className="text-muted-foreground mb-6">Connectez-vous pour soumettre votre candidature.</p>
        <Button onClick={() => navigate('/login', { state: { from: { pathname: '/become-vendor' } } })}>
          Se connecter
        </Button>
      </div>
    );
  }

  if (user?.role === 'vendor') {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <Check className="w-16 h-16 mx-auto text-green-500 mb-6" />
        <h1 className="text-3xl font-bold mb-4">Vous êtes déjà vendeur !</h1>
        <Button onClick={() => navigate('/vendor/dashboard')}>Accéder au dashboard</Button>
      </div>
    );
  }

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      await vendorsAPI.apply(data);
      setSubmitted(true);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Erreur lors de la soumission');
    } finally {
      setIsLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <Check className="w-16 h-16 mx-auto text-green-500 mb-6" />
        <h1 className="text-3xl font-bold mb-4">Demande envoyée !</h1>
        <p className="text-muted-foreground mb-6">Nous examinerons votre demande et vous contacterons par email.</p>
        <Button onClick={() => navigate('/')}>Retour à l'accueil</Button>
      </div>
    );
  }

  return (
    <>
      <Helmet><title>Devenir vendeur - DigitalMarket</title></Helmet>
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <Store className="w-16 h-16 mx-auto text-primary mb-4" />
            <h1 className="text-3xl font-bold mb-2">Devenir vendeur</h1>
            <p className="text-muted-foreground">Vendez vos produits digitaux et gagnez 90% sur chaque vente.</p>
          </div>

          <Card>
            <CardHeader><CardTitle>Informations de votre boutique</CardTitle></CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <Label>Nom de la boutique *</Label>
                  <Input {...register('store_name', { required: true })} placeholder="Ma Super Boutique" />
                </div>
                <div>
                  <Label>Description de la boutique *</Label>
                  <Textarea {...register('store_description', { required: true })} placeholder="Décrivez votre boutique..." />
                </div>
                <div>
                  <Label>Téléphone</Label>
                  <Input {...register('phone')} placeholder="+225 XX XX XX XX XX" />
                </div>
                <div>
                  <Label>Motivation</Label>
                  <Textarea {...register('motivation')} placeholder="Pourquoi voulez-vous devenir vendeur ?" />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Envoi...</> : 'Soumettre ma demande'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
