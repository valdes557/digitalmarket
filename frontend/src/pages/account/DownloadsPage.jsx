import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { Download, FileText } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { ordersAPI, downloadsAPI } from '../../lib/api';
import toast from 'react-hot-toast';

export default function DownloadsPage() {
  const { data: downloads, isLoading } = useQuery({
    queryKey: ['my-downloads'],
    queryFn: () => ordersAPI.getMyDownloads().then(res => res.data),
  });

  const handleDownload = async (orderItemId, fileId) => {
    try {
      const response = await downloadsAPI.generate({ order_item_id: orderItemId, file_id: fileId });
      window.open(response.data.download_url, '_blank');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Erreur de téléchargement');
    }
  };

  return (
    <>
      <Helmet><title>Téléchargements - DigitalMarket</title></Helmet>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Mes téléchargements</h1>

        {isLoading ? (
          <div className="space-y-4">{[...Array(3)].map((_, i) => <Card key={i} className="animate-pulse h-24" />)}</div>
        ) : downloads?.length > 0 ? (
          <div className="space-y-4">
            {downloads.map((item) => (
              <Card key={item.id}>
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="w-16 h-16 rounded bg-muted overflow-hidden shrink-0">
                    <img src={item.thumbnail} alt={item.product_name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold">{item.product_name}</p>
                    <p className="text-sm text-muted-foreground">
                      {item.download_count}/{item.max_downloads} téléchargements utilisés
                    </p>
                  </div>
                  <Button 
                    onClick={() => handleDownload(item.id, item.files?.[0]?.id)} 
                    disabled={!item.can_download}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Télécharger
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card><CardContent className="p-12 text-center">
            <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p>Aucun téléchargement disponible.</p>
          </CardContent></Card>
        )}
      </div>
    </>
  );
}
