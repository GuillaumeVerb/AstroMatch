# Guide de correction : Erreur PDF - libgobject-2.0-0 manquante

## Problème
L'erreur `libgobject-2.0-0: cannot open shared object file` indique que la bibliothèque système nécessaire pour générer le PDF n'est pas installée sur Railway.

## Solutions selon votre configuration Railway

### Option 1 : Si vous utilisez un Dockerfile

Ajoutez l'installation de la bibliothèque dans votre `Dockerfile` :

```dockerfile
# Exemple pour une image Python
FROM python:3.11-slim

# Installer les dépendances système nécessaires pour PDF
RUN apt-get update && apt-get install -y \
    libgobject-2.0-0 \
    libglib2.0-0 \
    libcairo2 \
    libpango-1.0-0 \
    libpangocairo-1.0-0 \
    && rm -rf /var/lib/apt/lists/*

# ... reste de votre Dockerfile
```

**Puis redéployez sur Railway :**
1. Commitez le Dockerfile modifié
2. Push vers votre repo
3. Railway redéploiera automatiquement

---

### Option 2 : Si vous utilisez un Buildpack Python

Railway détecte automatiquement les fichiers `apt-packages.txt` ou `apt.txt` à la racine de votre projet.

**Créez un fichier `apt-packages.txt` à la racine de votre projet backend :**

```
libgobject-2.0-0
libglib2.0-0
libcairo2
libpango-1.0-0
libpangocairo-1.0-0
```

**Puis redéployez :**
1. Commitez le fichier `apt-packages.txt`
2. Push vers votre repo
3. Railway redéploiera automatiquement

---

### Option 3 : Si vous utilisez Railway avec Nixpacks

Créez un fichier `nixpacks.toml` à la racine de votre projet :

```toml
[phases.setup]
nixPkgs = ["libgobject", "glib", "cairo", "pango"]
```

Ou créez un fichier `railway.toml` :

```toml
[build]
builder = "nixpacks"

[deploy]
startCommand = "python app.py"  # ou votre commande de démarrage
```

---

### Option 4 : Installation manuelle via Railway Shell (temporaire)

⚠️ **Note : Cette solution est temporaire et sera perdue au prochain redéploiement.**

1. Allez sur votre projet Railway
2. Ouvrez le service
3. Cliquez sur "Shell" ou "Deploy Logs"
4. Exécutez :
```bash
apt-get update
apt-get install -y libgobject-2.0-0 libglib2.0-0 libcairo2 libpango-1.0-0 libpangocairo-1.0-0
```

**Mais préférez les options 1, 2 ou 3 pour une solution permanente !**

---

## Bibliothèques recommandées à installer

Pour une génération PDF complète avec Python (reportlab, weasyprint, etc.), installez :

```
libgobject-2.0-0
libglib2.0-0
libcairo2
libpango-1.0-0
libpangocairo-1.0-0
libgdk-pixbuf2.0-0
libffi-dev
```

---

## Vérification après déploiement

1. Attendez que Railway termine le déploiement
2. Testez le téléchargement PDF depuis l'interface
3. Vérifiez les logs Railway pour confirmer l'absence d'erreurs

---

## Besoin d'aide ?

Si le problème persiste après avoir appliqué ces solutions :
1. Vérifiez les logs Railway pour d'autres erreurs
2. Assurez-vous que votre backend utilise bien une bibliothèque PDF qui nécessite ces dépendances
3. Contactez le support Railway si nécessaire

