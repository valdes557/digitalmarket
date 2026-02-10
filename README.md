# DigitalMarket - Marketplace de Produits Digitaux

Une marketplace complète pour la vente de produits digitaux (ebooks, templates, musiques, vidéos, scripts, etc.) avec validation des vendeurs, système de commissions, téléchargements sécurisés et paiements intégrés.

## 🚀 Fonctionnalités

### Pour les Clients
- 🛒 Navigation et recherche de produits
- 🛍️ Panier et paiement sécurisé (Mobile Money & Carte)
- 📥 Téléchargements instantanés avec liens sécurisés
- ❤️ Liste de favoris
- ⭐ Système d'avis et notes
- 👤 Gestion du compte

### Pour les Vendeurs
- 📊 Dashboard avec statistiques de ventes
- 📦 Gestion des produits (CRUD)
- 💰 Suivi des revenus et retraits
- 📈 Rapports de ventes

### Pour les Administrateurs
- 🎛️ Dashboard administrateur complet
- ✅ Validation des vendeurs et produits
- 💳 Gestion des retraits
- 👥 Gestion des utilisateurs
- 📁 Gestion des catégories
- 🖼️ Gestion des bannières
- 📝 Gestion du blog
- ⚙️ Paramètres du site

## 🛠️ Stack Technique

### Frontend
- **React 18** + Vite
- **TailwindCSS** pour le styling
- **Shadcn/UI** pour les composants
- **React Query** pour la gestion des données
- **React Router** pour le routing
- **Zustand** pour le state management
- **React Hook Form** + Zod pour les formulaires

### Backend
- **Node.js** + Express
- **MySQL** pour la base de données
- **JWT** pour l'authentification
- **Cloudinary** pour le stockage de fichiers
- **Nodemailer** pour les emails
- **CinetPay** pour les paiements

## 📁 Structure du Projet

```
DigitalMarket/
├── backend/
│   ├── src/
│   │   ├── config/          # Configuration (DB, Cloudinary)
│   │   ├── controllers/     # Logique métier
│   │   ├── database/        # Schema SQL et seeds
│   │   ├── middleware/      # Auth, erreurs
│   │   ├── routes/          # Routes API
│   │   ├── utils/           # Utilitaires (email, tokens)
│   │   └── server.js        # Point d'entrée
│   ├── .env.example
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/      # Composants UI
│   │   ├── layouts/         # Layouts (Main, Admin, Vendor)
│   │   ├── lib/             # API, utils
│   │   ├── pages/           # Pages de l'app
│   │   ├── stores/          # State management
│   │   └── App.jsx
│   ├── index.html
│   └── package.json
│
└── README.md
```

## 🚦 Installation

### Prérequis
- Node.js 18+
- MySQL 8+
- Compte Cloudinary
- Compte CinetPay

### Backend

```bash
cd backend
npm install

# Configurer les variables d'environnement
cp .env.example .env
# Éditer .env avec vos valeurs

# Initialiser la base de données
npm run db:init

# Ajouter les données de test
npm run db:seed

# Démarrer le serveur
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## ⚙️ Configuration

### Variables d'environnement Backend (.env)

```env
# Server
PORT=5000
NODE_ENV=development

# Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=digitalmarket

# JWT
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_secret
JWT_EXPIRE=1h
JWT_REFRESH_EXPIRE=7d

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# CinetPay
CINETPAY_API_KEY=your_api_key
CINETPAY_SITE_ID=your_site_id
CINETPAY_SECRET_KEY=your_secret_key

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
FROM_EMAIL=noreply@digitalmarket.com

# Frontend
FRONTEND_URL=http://localhost:5173

# Commission
COMMISSION_RATE=0.10
```

## 📚 API Endpoints

### Auth
- `POST /api/auth/register` - Inscription
- `POST /api/auth/login` - Connexion
- `POST /api/auth/logout` - Déconnexion
- `GET /api/auth/me` - Profil utilisateur
- `POST /api/auth/forgot-password` - Mot de passe oublié
- `POST /api/auth/reset-password` - Réinitialiser mot de passe

### Products
- `GET /api/products` - Liste des produits
- `GET /api/products/:slug` - Détails produit
- `POST /api/products` - Créer produit (vendor)
- `PUT /api/products/:id` - Modifier produit
- `DELETE /api/products/:id` - Supprimer produit

### Orders
- `GET /api/orders/my-orders` - Mes commandes
- `GET /api/orders/my-downloads` - Mes téléchargements

### Payments
- `POST /api/payments/initialize` - Initialiser paiement
- `POST /api/payments/webhook` - Webhook CinetPay

### Vendors
- `POST /api/vendors/apply` - Demande vendeur
- `GET /api/vendors/me/dashboard` - Dashboard vendeur
- `GET /api/vendors/me/products` - Produits du vendeur

### Admin
- `GET /api/admin/dashboard` - Dashboard admin
- `GET /api/admin/users` - Liste utilisateurs
- `PUT /api/vendors/admin/requests/:id` - Traiter demande vendeur

## 🔐 Rôles et Permissions

| Rôle | Permissions |
|------|-------------|
| **client** | Acheter, télécharger, avis |
| **vendor** | + Vendre, gérer produits, retraits |
| **admin** | + Gérer tout le site |

## 💳 Paiements

Le système utilise **CinetPay** pour les paiements :
- Mobile Money (MTN, Orange, Moov)
- Cartes bancaires (Visa, MasterCard)

Commission automatique de 10% sur chaque vente.

## 📥 Téléchargements Sécurisés

- Liens temporaires (expire après 60 min)
- Limite de 5 téléchargements par achat
- Stockage sécurisé sur Cloudinary

## 🎨 Thème

L'application supporte le mode sombre/clair avec les couleurs principales :
- Primary: Violet (#7c3aed)
- Couleurs personnalisables via CSS variables

## 📧 Notifications Email

Emails automatiques pour :
- Confirmation d'inscription
- Confirmation de commande
- Approbation/rejet vendeur
- Traitement de retrait
- Nouvelle vente (vendeur)

## 🔧 Scripts Disponibles

### Backend
```bash
npm start        # Production
npm run dev      # Développement
npm run db:init  # Initialiser DB
npm run db:seed  # Données de test
```

### Frontend
```bash
npm run dev      # Développement
npm run build    # Production
npm run preview  # Prévisualisation build
```

## 📝 Licence

MIT License - Libre d'utilisation et de modification.

## 👥 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à ouvrir une issue ou une pull request.

---

Développé avec ❤️ pour la communauté africaine de créateurs digitaux.
