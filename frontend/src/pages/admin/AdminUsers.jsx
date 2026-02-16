import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';
import { adminAPI } from '../../lib/api';
import { formatDate, getInitials } from '../../lib/utils';
import toast from 'react-hot-toast';
import { Loader2, UserCog } from 'lucide-react';

export default function AdminUsers() {
  const queryClient = useQueryClient();
  const [selectedUser, setSelectedUser] = useState(null);
  const [newRole, setNewRole] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => adminAPI.getUsers({ limit: 50 }).then(res => res.data),
  });

  const updateRoleMutation = useMutation({
    mutationFn: ({ userId, role }) => adminAPI.updateUser(userId, { role }),
    onSuccess: () => {
      toast.success('Rôle mis à jour avec succès !');
      queryClient.invalidateQueries(['admin-users']);
      setSelectedUser(null);
      setNewRole('');
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Erreur lors de la mise à jour');
    }
  });

  const handleChangeRole = () => {
    if (!selectedUser || !newRole) return;
    updateRoleMutation.mutate({ userId: selectedUser.id || selectedUser._id, role: newRole });
  };

  const roleColors = { admin: 'destructive', vendor: 'default', client: 'secondary' };
  const roleLabels = { admin: 'Administrateur', vendor: 'Vendeur', client: 'Client' };

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
              <Card key={user.id || user._id}>
                <CardContent className="p-4 flex items-center gap-4">
                  <Avatar>
                    <AvatarImage src={user.avatar} />
                    <AvatarFallback>{getInitials(user.first_name, user.last_name)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-semibold">{user.first_name} {user.last_name}</p>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                  <p className="text-sm text-muted-foreground hidden sm:block">{formatDate(user.created_at)}</p>
                  <Badge variant={roleColors[user.role]}>{roleLabels[user.role] || user.role}</Badge>
                  {!user.is_active && <Badge variant="outline">Inactif</Badge>}
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => {
                      setSelectedUser(user);
                      setNewRole(user.role);
                    }}
                  >
                    <UserCog className="w-4 h-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Dialog open={!!selectedUser} onOpenChange={(open) => !open && setSelectedUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier le rôle</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4 py-4">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={selectedUser.avatar} />
                  <AvatarFallback>{getInitials(selectedUser.first_name, selectedUser.last_name)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">{selectedUser.first_name} {selectedUser.last_name}</p>
                  <p className="text-sm text-muted-foreground">{selectedUser.email}</p>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Nouveau rôle</label>
                <Select value={newRole} onValueChange={setNewRole}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="client">Client</SelectItem>
                    <SelectItem value="vendor">Vendeur</SelectItem>
                    <SelectItem value="admin">Administrateur</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedUser(null)}>Annuler</Button>
            <Button 
              onClick={handleChangeRole} 
              disabled={updateRoleMutation.isPending || newRole === selectedUser?.role}
            >
              {updateRoleMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
