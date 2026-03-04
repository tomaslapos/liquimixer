// ============================================
// SHARD CONFIGURATION
// Konfigurace instance pro multi-shard prostředí
// ============================================

window.SHARD_CONFIG = {
    // Identifikátor aktuální instance (hlavní produkční server)
    shard_key: 'main',
    
    // Verze konfigurace
    version: 1,
    
    // Instance metadata
    instance: {
        name: 'LiquiMixer Production',
        region: 'eu-central',
        domain: 'www.liquimixer.com'
    }
};
