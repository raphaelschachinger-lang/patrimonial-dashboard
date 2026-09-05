# Dashboard patrimonial

App perso de suivi patrimonial (voir [cahier-des-charges-dashboard-patrimoine.md](./cahier-des-charges-dashboard-patrimoine.md)). Next.js + PostgreSQL/Prisma, auto-hébergeable via Docker.

**État actuel (Phase 1)** : squelette + écran Patrimoine (§5.1) en saisie 100% manuelle. Enable Banking (§3) pas encore branché — le compte n'est pas encore créé côté utilisateur.

## Démarrage rapide (dev local)

Prérequis : Node 20+, un Postgres accessible en local (le plus simple : `docker compose up db` si Docker est installé, sinon une instance Postgres locale/Postgres.app).

```bash
cp .env.example .env   # puis éditer les valeurs (voir ci-dessous)
npm install
npm run db:migrate     # crée les tables
npm run db:seed        # crée l'utilisateur unique (AUTH_USER_EMAIL / AUTH_PASSWORD_HASH)
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000) — redirige vers `/login`.

### Générer le mot de passe

```bash
npm run hash-password -- "mon-mot-de-passe"
```

Coller le résultat dans `AUTH_PASSWORD_HASH` (`.env`) tel quel — le script échappe déjà les `$` du hash bcrypt.

> ⚠️ Si vous éditez `AUTH_PASSWORD_HASH` à la main : Next.js fait de l'expansion de
> variables (`$VAR`) même dans les valeurs entre guillemets d'un `.env`. Un hash bcrypt
> (`$2b$10$...`) doit donc avoir chacun de ses `$` échappé en `\$`, sinon il est
> silencieusement tronqué et la connexion échoue sans message d'erreur clair.

## Docker Compose (prod / auto-hébergement)

```bash
docker compose up -d --build
```

Lance Postgres + l'app (migrations appliquées automatiquement au démarrage du conteneur `app`). Variables lues depuis `.env` à la racine.

## Scripts utiles

| Commande | Effet |
|---|---|
| `npm run dev` | Serveur de dev |
| `npm run build` / `start` | Build + run production |
| `npm run db:migrate` | Migration Prisma (dev) |
| `npm run db:seed` | (Re)crée l'utilisateur unique depuis `.env` |
| `npm run db:studio` | Prisma Studio (explorer la DB) |
| `npm run hash-password -- "..."` | Hash bcrypt prêt à coller dans `.env` |

## Roadmap

Voir §7 du cahier des charges. Prochaines étapes : intégration Enable Banking (§3, nécessite un compte control panel côté utilisateur), catégorisation auto des dépenses, Sankey, cashflow, million run.
