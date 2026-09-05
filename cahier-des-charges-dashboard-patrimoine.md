# Dashboard patrimonial — cahier des charges

## 1. Contexte et objectif

Remplacer Finary par une app perso auto-hébergée, sans abonnement, qui reprend le suivi patrimonial tenu jusqu'ici sur Google Sheet (fichier "MMF"). Priorité absolue : **automatiser la remontée des dépenses et soldes**, saisie manuelle réduite au minimum.

Utilisateur unique (pas de multi-compte à prévoir).

## 2. Stack technique recommandée

- **Next.js** (App Router, TypeScript) — un seul projet pour le front et l'API, plus simple à maintenir seul.
- **PostgreSQL + Prisma** — historique de soldes et transactions, requêtes d'agrégation simples.
- **Docker Compose** — pour l'auto-hébergement (VPS ou serveur perso), avec un conteneur cron pour la synchro quotidienne.
- **recharts** — graphiques (camemberts, courbes, et **Sankey natif**, pas besoin d'ajouter une lib).
- **Tabler icons** (outline) — iconographie minimale, cohérente avec l'esthétique retenue.
- Authentification simple mono-utilisateur (cookie de session signé, pas d'OAuth/SSO nécessaire).

## 3. Intégration bancaire — Enable Banking

### Pourquoi ce choix
Les anciennes solutions gratuites pour devs indé (GoCardless/Nordigen) ont fermé leurs inscriptions mi-2025. **Enable Banking** propose un mode **"restricted production"** : accès gratuit, sans contrat ni société, à condition de connecter uniquement ses propres comptes — exactement notre cas.

**Boursorama, CIC et American Express France** sont toutes les trois des ASPSP déjà intégrées chez Enable Banking (confirmé dans leur changelog produit).

### Procédure d'activation
1. Créer un compte sur le control panel Enable Banking (enablebanking.com/cp).
2. Générer une clé privée RSA + certificat auto-signé (`openssl genrsa` puis `openssl req -x509`).
3. Enregistrer une application en environnement `SANDBOX` pour tester, puis une seconde en `PRODUCTION`.
4. Activer l'app de production en mode restreint en "liant" (whitelisting) les comptes Boursorama/CIC/Amex personnels — aucun contrat requis dans ce mode.

### Flow technique (AIS — Account Information Service)
1. `POST /auth` (JWT RS256 en Authorization header) → renvoie une `url` de redirection.
2. L'utilisateur s'authentifie chez la banque, redirigé vers `redirect_url` avec un paramètre `code`.
3. `POST /sessions` avec `{code}` → renvoie `session_id` + liste des comptes (`accounts`, chacun avec un `uid` et un `identification_hash` stable).
4. `GET /accounts/{uid}/balances` et `GET /accounts/{uid}/transactions` pour la synchro.

**JWT applicatif** : header `{typ: JWT, alg: RS256, kid: <app_id>}`, payload `{iss: "enablebanking.com", aud: "api.enablebanking.com", iat, exp}`, signé avec la clé privée RSA. TTL max 24h, régénérer un JWT à chaque appel API.

### Contraintes à respecter dans l'implémentation
- Consentement valable ~180 jours max selon les banques (`maximum_consent_validity` dans `GET /aspsps`) → prévoir une notification de ré-autorisation, ce n'est pas du "zéro reconnexion" éternel.
- Synchro en arrière-plan (sans PSU headers) limitée à ~4 appels/jour par banque → une synchro quotidienne via cron suffit largement, ne pas sur-solliciter.
- Historique de transactions : 90 jours garantis par défaut, jusqu'à 1-3 ans selon la banque avec `strategy=longest` au premier import.

### Roadmap V2 (hors périmètre immédiat)
IBKR, EToro, FXPro, Binance, Crypto.com, Ledger — chacun a sa propre API (ou aucune, pour EToro côté retail), à traiter compte par compte plus tard. Le modèle de données doit rester ouvert à ça (voir §5) mais l'implémentation n'est pas prioritaire.

## 4. Direction artistique

Esthétique "précision" façon Apple / Porsche — cohérente avec l'app Life RPG (même famille visuelle entre les deux apps).

**Principes**
- Noir vraiment neutre en dark mode (pas de bleu dans le noir), blanc en light mode.
- **Un seul accent, jamais deux**, utilisé avec parcimonie et du sens plutôt que comme code couleur décoratif (ex : dans un flow de revenus, l'accent trace uniquement l'argent qui part vers l'épargne/l'investissement, pas juste "encore une couleur").
- Filets fins (hairlines) plutôt que cartes pleines ou ombres.
- Chiffres en tabulaire, alignés, gros et sobres (les nombres sont le contenu, pas le décor).
- Icônes Tabler outline, utilisées avec parcimonie.
- Graphiques autorisés et bienvenus (camemberts, Sankey/flows, courbes de projection) tant qu'ils respectent la palette restreinte — pas de multi-couleurs façon Finary.
- Pas de gradients, pas d'ombres portées, pas d'effets néon/glow.

**Palette validée**

| Rôle | Dark mode | Light mode |
|---|---|---|
| Fond | `#050505` | `#ffffff` |
| Texte principal | `#f4f4f4` | `#1d1d1f` |
| Texte secondaire/muted | `#8a8a8a` | `#86868b` |
| Accent (unique) | `#c2884f` (bronze) | `#a86b32` (bronze, assombri pour le contraste) |
| Séparateurs | `rgba(255,255,255,0.08–0.1)` | `#e5e5e5` |

Typographie : pile système sans-serif (`ui-sans-serif, -apple-system, "Segoe UI", Helvetica, Arial, sans-serif`), `font-variant-numeric: tabular-nums` sur tous les montants.

## 5. Périmètre fonctionnel V1

Seules les sections suivantes du sheet MMF sont reprises (le reste est obsolète ou expérimental) :

### 5.1 Patrimoine par secteur (ex "Cash is king" + tableau SECTEUR)
Vue d'ensemble : total net + répartition par catégorie (Cash, Private Equities, Immobilier, Autre) et par devise (EUR/USD/CHF, taux de change récupérés automatiquement, API Frankfurter gratuite sans clé).
- **Auto** : comptes bancaires connectés (Boursorama, CIC).
- **Manuel** : immobilier (valeur estimée), "autre" (montres, voitures, bijoux), comptes non connectables (EToro, IBKR, crypto — en attendant la V2).

### 5.2 Risk adjusted cash allocation
Table de stratégie cible : par broker/banque — horizon (court/moyen/long terme), type de gestion (passive/active), niveau de contrôle, nom de stratégie, montant, %, croissance potentielle, drawdown, reward/risk ajustés.
- **100% manuel** — ce sont des hypothèses/objectifs que l'utilisateur définit lui-même, pas des données bancaires. Table éditable dans l'app.

### 5.3 Cashflow run
Revenus (actif/passif) vs coût de vie, mois par mois, avec cashflow cumulé. Répartition par type de revenu (salaire, love money, marchés financiers, dividendes, immo).
- **Auto (partiel)** : détection du virement de salaire dans les transactions Boursorama (montant récurrent + libellé employeur), même logique que la catégorisation des dépenses mais appliquée aux crédits.
- Visualisation : le diagramme de flux (Sankey) validé plus haut — salaire → catégories → sous-catégories, accent réservé aux flux d'épargne/investissement.

### 5.4 Investments (suivi mensuel bourse/crypto)
Log mensuel des montants investés.
- **Auto (suggestion)** : détecter les virements sortants de Boursorama vers des comptes broker/crypto connus (EToro, IBKR, Binance...) et les logger automatiquement comme "investissement du mois" — à valider/corriger manuellement si besoin.

### 5.5 Game plan / million run
Projection patrimoniale à long terme selon un taux de croissance annuel choisi, comparée au patrimoine réellement suivi (balance de départ vs solde actuel).
- **Manuel** pour l'hypothèse de croissance (curseur/paramètre éditable), **auto** pour la courbe réelle (alimentée par 5.1).
- Visualisation : courbe de projection + courbe réelle superposées.

### 5.6 Dépenses
Détail mensuel par catégorie (dépenses communes, voiture, restaurants, sorties, variable, état français, formation, frais bancaire, santé, déco appt, sport, voyage).
- **Auto** : transactions Boursorama + American Express, catégorisées par règles à mots-clés (éditables — une correction manuelle sur une transaction devient définitive et n'est plus jamais écrasée par une resynchro).
- Visualisation : camembert par catégorie + vue Sankey (§5.3).

### Explicitement hors scope V1
Trading 2.0 (comptes prop firm JFD/FXPRO/Squared/Pepperstone — déjà couvert par le projet de dashboard trading séparé), détail stock portfolio + revue annuelle, comparatif budget fixe/variable, abonnements, dettes, simulation d'achat immobilier + tableau d'amortissement. Ne pas fermer la porte côté modèle de données (garder la possibilité d'ajouter des types de comptes/catégories), mais ne rien construire dessus pour l'instant.

## 6. Modèle de données (esquisse conceptuelle)

- **Account** — nom, institution, pays, devise, type (bancaire / broker / crypto / manuel), catégorie patrimoniale (Cash, Immobilier, Autre...), lien optionnel vers une connexion bancaire.
- **BankConnection** — connexion Enable Banking : banque, session_id, date de validité du consentement, statut (actif/expiré/erreur).
- **Balance** — historique de soldes par compte et par date (source : synchro ou saisie manuelle).
- **Transaction** — transactions importées : montant, libellé, catégorie (parente + sous-catégorie, pour le Sankey), catégorie source (auto/manuelle — ne jamais écraser une correction manuelle).
- **AllocationTarget** — table manuelle pour la répartition cible (§5.2).
- **ProjectionAssumption** — hypothèse de croissance pour le million run (§5.5).
- **ExchangeRate** — taux de change mis en cache (EUR→USD/CHF, 1 appel/jour max).

## 7. Ordre de build suggéré

1. Squelette Next.js + Postgres/Prisma + Docker Compose + auth mono-utilisateur.
2. Intégration Enable Banking (sandbox d'abord) : flow de connexion, synchro soldes + transactions pour un compte Boursorama.
3. Écran patrimoine par secteur (§5.1) avec le premier compte connecté.
4. Catégorisation automatique des dépenses + écran Dépenses (§5.6) + camembert.
5. Connexion CIC et American Express (même flow, juste une 2e/3e banque).
6. Diagramme Sankey (§5.3) une fois les catégories parent/enfant en place.
7. Détection automatique du salaire + cashflow run complet.
8. Allocation cible (§5.2, manuel) et million run (§5.5).
9. Saisie manuelle immobilier/autre pour compléter §5.1.
