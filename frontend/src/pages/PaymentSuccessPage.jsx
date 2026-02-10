import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle, Download, Loader2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { paymentsAPI } from '../lib/api';
import { useCartStore } from '../stores/cartStore';

export default function PaymentSuccessPage() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('loading');
  const { clearCart } = useCartStore();
  const orderNumber = searchParams.get('order');

  useEffect(() => {
    if (orderNumber) {
      paymentsAPI.checkStatus(orderNumber)
        .then(res => {
          if (res.data.payment_status === 'completed') {
            setStatus('success');
            clearCart();
          } else {
            setStatus('pending');
          }
        })
        .catch(() => setStatus('error'));
    }
  }, [orderNumber, clearCart]);

  if (status === 'loading') {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <Card className="max-w-md mx-auto text-center">
        <CardContent className="pt-12 pb-8">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Paiement réussi !</h1>
          <p className="text-muted-foreground mb-2">Commande: {orderNumber}</p>
          <p className="text-muted-foreground mb-6">
            Vos fichiers sont maintenant disponibles au téléchargement.
          </p>
          <div className="space-y-3">
            <Link to="/account/downloads">
              <Button className="w-full">
                <Download className="w-4 h-4 mr-2" />
                Télécharger mes fichiers
              </Button>
            </Link>
            <Link to="/products">
              <Button variant="outline" className="w-full">Continuer mes achats</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
