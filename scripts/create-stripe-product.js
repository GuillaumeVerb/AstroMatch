const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

async function createProduct() {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('❌ Erreur: STRIPE_SECRET_KEY n\'est pas définie dans les variables d\'environnement');
      console.log('💡 Créez un fichier .env.local avec: STRIPE_SECRET_KEY=sk_test_...');
      process.exit(1);
    }

    console.log('🔄 Création du produit Stripe...\n');

    // Créer le produit
    const product = await stripe.products.create({
      name: 'AstroMatch - Rapport de Compatibilité',
      description: 'Rapport complet de compatibilité astrologique entre deux personnes',
    });

    console.log('✅ Produit créé:', product.id);
    console.log('   Nom:', product.name);

    // Créer le prix (9.90 EUR)
    const price = await stripe.prices.create({
      product: product.id,
      unit_amount: 990, // 9.90 EUR en centimes
      currency: 'eur',
    });

    console.log('✅ Prix créé:', price.id);
    console.log('   Montant: 9.90 EUR\n');

    console.log('📋 Variables d\'environnement à ajouter dans .env.local:');
    console.log(`STRIPE_SECRET_KEY=${process.env.STRIPE_SECRET_KEY}`);
    console.log(`STRIPE_PRODUCT_ID=${product.id}`);
    console.log(`STRIPE_PRICE_ID=${price.id}`);
    console.log('\n⚠️  N\'oubliez pas d\'ajouter STRIPE_PRODUCT_ID et STRIPE_PRICE_ID dans Vercel aussi!');
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    if (error.type === 'StripeAuthenticationError') {
      console.log('\n💡 Vérifiez que votre STRIPE_SECRET_KEY est correcte');
    }
    process.exit(1);
  }
}

createProduct();

