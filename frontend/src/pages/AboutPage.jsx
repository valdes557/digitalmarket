import { Helmet } from 'react-helmet-async';
import { ShoppingBag, Users, Download, Shield } from 'lucide-react';

export default function AboutPage() {
  return (
    <>
      <Helmet><title>À propos - DigitalMarket</title></Helmet>
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-center mb-6">À propos de DigitalMarket</h1>
          <p className="text-xl text-muted-foreground text-center mb-12">
            La première marketplace africaine dédiée aux produits digitaux.
          </p>
          
          <div className="prose dark:prose-invert max-w-none mb-12">
            <p>DigitalMarket est une plateforme innovante qui connecte les créateurs de contenu digital avec les acheteurs du monde entier. Notre mission est de démocratiser l'accès aux ressources numériques de qualité tout en offrant aux créateurs un moyen simple et efficace de monétiser leur travail.</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: ShoppingBag, title: '1000+', desc: 'Produits' },
              { icon: Users, title: '500+', desc: 'Vendeurs' },
              { icon: Download, title: '10K+', desc: 'Téléchargements' },
              { icon: Shield, title: '100%', desc: 'Sécurisé' },
            ].map((item, i) => (
              <div key={i} className="text-center p-6 bg-muted/50 rounded-lg">
                <item.icon className="w-10 h-10 mx-auto text-primary mb-3" />
                <div className="text-3xl font-bold">{item.title}</div>
                <div className="text-muted-foreground">{item.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
