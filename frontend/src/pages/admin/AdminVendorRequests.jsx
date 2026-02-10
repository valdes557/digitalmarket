import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { Check, X } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { adminAPI } from '../../lib/api';
import { formatDate } from '../../lib/utils';
import toast from 'react-hot-toast';

export default function AdminVendorRequests() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ['vendor-requests'],
    queryFn: () => adminAPI.getVendorRequests({ status: 'pending' }).then(res => res.data),
  });

  const handleProcess = async (id, status) => {
    try {
      await adminAPI.processVendorRequest(id, { status });
      toast.success(`Demande ${status === 'approved' ? 'approuvée' : 'rejetée'}`);
      queryClient.invalidateQueries(['vendor-requests']);
    } catch (error) {
      toast.error('Erreur');
    }
  };

  return (
    <>
      <Helmet><title>Demandes vendeurs - Admin - DigitalMarket</title></Helmet>
      <div>
        <h1 className="text-3xl font-bold mb-8">Demandes vendeurs</h1>
        {isLoading ? (
          <div className="space-y-4">{[...Array(3)].map((_, i) => <Card key={i} className="animate-pulse h-32" />)}</div>
        ) : data?.requests?.length > 0 ? (
          <div className="space-y-4">
            {data.requests.map((request) => (
              <Card key={request.id}>
                <CardContent className="p-6">
                  <div className="flex justify-between mb-4">
                    <div>
                      <p className="font-semibold text-lg">{request.store_name}</p>
                      <p className="text-sm text-muted-foreground">{request.first_name} {request.last_name} • {request.email}</p>
                      <p className="text-sm text-muted-foreground">{formatDate(request.created_at)}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={() => handleProcess(request.id, 'approved')}>
                        <Check className="w-4 h-4 mr-1" /> Approuver
                      </Button>
                      <Button variant="destructive" onClick={() => handleProcess(request.id, 'rejected')}>
                        <X className="w-4 h-4 mr-1" /> Rejeter
                      </Button>
                    </div>
                  </div>
                  <p className="text-muted-foreground">{request.store_description}</p>
                  {request.motivation && <p className="mt-2 text-sm"><strong>Motivation:</strong> {request.motivation}</p>}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card><CardContent className="p-12 text-center text-muted-foreground">Aucune demande en attente</CardContent></Card>
        )}
      </div>
    </>
  );
}
