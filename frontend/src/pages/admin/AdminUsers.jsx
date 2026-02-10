import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { adminAPI } from '../../lib/api';
import { formatDate, getInitials } from '../../lib/utils';

export default function AdminUsers() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => adminAPI.getUsers({ limit: 50 }).then(res => res.data),
  });

  const roleColors = { admin: 'destructive', vendor: 'default', client: 'secondary' };

  return (
    <>
      <Helmet><title>Utilisateurs - Admin - DigitalMarket</title></Helmet>
      <div>
        <h1 className="text-3xl font-bold mb-8">Utilisateurs</h1>
        {isLoading ? (
          <div className="space-y-4">{[...Array(5)].map((_, i) => <Card key={i} className="animate-pulse h-16" />)}</div>
        ) : (
          <div className="space-y-4">
            {data?.users?.map((user) => (
              <Card key={user.id}>
                <CardContent className="p-4 flex items-center gap-4">
                  <Avatar>
                    <AvatarImage src={user.avatar} />
                    <AvatarFallback>{getInitials(user.first_name, user.last_name)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-semibold">{user.first_name} {user.last_name}</p>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                  <p className="text-sm text-muted-foreground">{formatDate(user.created_at)}</p>
                  <Badge variant={roleColors[user.role]}>{user.role}</Badge>
                  {!user.is_active && <Badge variant="outline">Inactif</Badge>}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
