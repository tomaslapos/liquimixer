// ============================================
// SUPABASE DATABASE INTEGRATION
// Šifrovaná databáze uživatelů oddělená od aplikace
// ============================================
//
// ╔══════════════════════════════════════════════════════════════════════════════╗
// ║                       MAPA FUNKCÍ - DATABASE.JS                              ║
// ║                      Aktualizováno: 08.02.2026                               ║
// ╠══════════════════════════════════════════════════════════════════════════════╣
// ║                                                                              ║
// ║ ═══════════════════════════════════════════════════════════════════════════  ║
// ║ SEKCE 1: INICIALIZACE A BEZPEČNOST (řádky 18-90)                             ║
// ║ ═══════════════════════════════════════════════════════════════════════════  ║
// ║   isAllowedDomain()              18   - Kontrola povolené domény             ║
// ║   initSupabase()                 40   - Inicializace Supabase klienta        ║
// ║   setSupabaseAuth()              63   - Nastavení autentizace                ║
// ║                                                                              ║
// ║ ═══════════════════════════════════════════════════════════════════════════  ║
// ║ SEKCE 2: UŽIVATELÉ (řádky 87-280)                                            ║
// ║ ═══════════════════════════════════════════════════════════════════════════  ║
// ║   saveUserToDatabase()           87   - Uložení uživatele do DB              ║
// ║   getUserFromDatabase()         125   - Získání uživatele z DB               ║
// ║   saveTermsAcceptance()         148   - Uložení souhlasu s podmínkami        ║
// ║   saveUserPreferences()         182   - Uložení preferencí                   ║
// ║   saveUserLocale()              209   - Uložení jazyka                       ║
// ║   getUserLocale()               248   - Získání jazyka                       ║
// ║                                                                              ║
// ║ ═══════════════════════════════════════════════════════════════════════════  ║
// ║ SEKCE 3: POMOCNÉ FUNKCE (řádky 277-375)                                      ║
// ║ ═══════════════════════════════════════════════════════════════════════════  ║
// ║   generateShareId()             277   - Generování share ID                  ║
// ║   generateProductCode()         289   - Generování kódu produktu             ║
// ║   sanitizeInput()               299   - Sanitizace vstupu                    ║
// ║   isValidClerkId()              313   - Validace Clerk ID                    ║
// ║   isValidUUID()                 342   - Validace UUID                        ║
// ║                                                                              ║
// ║ ═══════════════════════════════════════════════════════════════════════════  ║
// ║ SEKCE 4: RECEPTY (řádky 375-630)                                             ║
// ║ ═══════════════════════════════════════════════════════════════════════════  ║
// ║   saveUserRecipe()              375   - ⭐ Uložení receptu                    ║
// ║   updateUserRecipe()            429   - Aktualizace receptu                  ║
// ║   isValidShareId()              482   - Validace share ID                    ║
// ║   getRecipeByShareId()          488   - Získání receptu podle share ID       ║
// ║   getRecipeById()               517   - Získání receptu podle ID             ║
// ║   getUserRecipes()              551   - Získání všech receptů uživatele      ║
// ║   deleteUserRecipe()            581   - Smazání receptu                      ║
// ║                                                                              ║
// ║ ═══════════════════════════════════════════════════════════════════════════  ║
// ║ SEKCE 5: OBLÍBENÉ PRODUKTY (řádky 624-940)                                   ║
// ║ ═══════════════════════════════════════════════════════════════════════════  ║
// ║   saveFavoriteProduct()         624   - Uložení produktu                     ║
// ║   updateFavoriteProduct()       685   - Aktualizace produktu                 ║
// ║   updateProductStock()          731   - ⭐ Aktualizace skladu                 ║
// ║   getFavoriteProducts()         772   - Získání všech produktů               ║
// ║   getFavoriteProductById()      801   - Získání produktu podle ID            ║
// ║   getProductByCode()            835   - Získání podle kódu                   ║
// ║   getProductByShareId()         871   - Získání podle share ID               ║
// ║   deleteFavoriteProduct()       900   - Smazání produktu                     ║
// ║   uploadProductImage()          937   - Upload obrázku produktu              ║
// ║                                                                              ║
// ║ ═══════════════════════════════════════════════════════════════════════════  ║
// ║ SEKCE 6: PROPOJENÍ PRODUKTŮ A RECEPTŮ (řádky 991-1260)                       ║
// ║ ═══════════════════════════════════════════════════════════════════════════  ║
// ║   linkProductsToRecipe()        991   - Propojení produktů s receptem        ║
// ║   getLinkedProducts()          1039   - Získání propojených produktů         ║
// ║   getLinkedProductsByRecipeId() 1083  - Produkty podle recipe ID             ║
// ║   getRecipesByProductId()      1124   - Recepty podle product ID             ║
// ║   getProductByIdPublic()       1163   - Veřejný produkt podle ID             ║
// ║   copyProductToUser()          1191   - Kopírování produktu uživateli        ║
// ║   onClerkSignIn()              1261   - Handler přihlášení Clerk             ║
// ║                                                                              ║
// ║ ═══════════════════════════════════════════════════════════════════════════  ║
// ║ SEKCE 7: PŘIPOMÍNKY ZRÁNÍ (řádky 1283-1610)                                  ║
// ║ ═══════════════════════════════════════════════════════════════════════════  ║
// ║   saveReminder()               1283   - Uložení připomínky                   ║
// ║   getRecipeReminders()         1345   - Připomínky receptu                   ║
// ║   getUserReminders()           1374   - Všechny připomínky uživatele         ║
// ║   updateReminder()             1402   - Aktualizace připomínky               ║
// ║   deleteReminder()             1442   - Smazání připomínky                   ║
// ║   cancelReminder()             1470   - Zrušení připomínky                   ║
// ║   getReminderById()            1502   - Získání připomínky podle ID          ║
// ║   updateReminderStock()        1531   - Aktualizace skladu připomínky        ║
// ║   markReminderConsumed()       1567   - Označení jako spotřebováno           ║
// ║                                                                              ║
// ║ ═══════════════════════════════════════════════════════════════════════════  ║
// ║ SEKCE 8: VEŘEJNÁ DATABÁZE RECEPTŮ (řádky 1605-1850)                          ║
// ║ ═══════════════════════════════════════════════════════════════════════════  ║
// ║   getPublicRecipes()           1605   - ⭐ Načtení veřejných receptů          ║
// ║   getPublicRecipeById()        1701   - Detail veřejného receptu             ║
// ║   addRecipeRating()            1730   - Přidání hodnocení                    ║
// ║   getUserRatingForRecipe()     1775   - Hodnocení uživatele                  ║
// ║   updateRecipeRatingAvg()      1802   - Aktualizace průměru hodnocení        ║
// ║                                                                              ║
// ║ ═══════════════════════════════════════════════════════════════════════════  ║
// ║ SEKCE 9: FCM TOKENY (řádky 1846-1950)                                        ║
// ║ ═══════════════════════════════════════════════════════════════════════════  ║
// ║   saveFcmToken()               1846   - Uložení FCM tokenu                   ║
// ║   deleteFcmToken()             1886   - Smazání FCM tokenu                   ║
// ║   getFcmTokens()               1918   - Získání FCM tokenů                   ║
// ║                                                                              ║
// ╠══════════════════════════════════════════════════════════════════════════════╣
// ║ ⭐ = Důležitá funkce                                                          ║
// ╚══════════════════════════════════════════════════════════════════════════════╝

console.log('database.js: Loading...');

// Povolené domény pro přístup k databázi
const ALLOWED_DOMAINS = [
    'liquimixer.com',
    'www.liquimixer.com',
    'localhost',
    '127.0.0.1',
    'zeabur.app'  // Zeabur preview/deployment URLs
];

// Kontrola povolené domény
function isAllowedDomain() {
    const hostname = window.location.hostname;
    // V produkci striktní kontrola
    if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
        return ALLOWED_DOMAINS.some(domain => 
            hostname === domain || hostname.endsWith('.' + domain)
        );
    }
    return true; // Localhost pro vývoj
}

// Supabase konfigurace
const SUPABASE_URL = 'https://krwdfxnvhnxtkhtkbadi.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtyd2RmeG52aG54dGtodGtiYWRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU0NzA1NDcsImV4cCI6MjA4MTA0NjU0N30.IKpOTRfPaOwyBSnIpqOK2utwIDnllLM3XcV9NH-tXrA';

// Oficiální doména pro sdílené recepty
const SHARE_BASE_URL = 'https://www.liquimixer.com';

// Supabase klient (používáme supabaseClient aby nedošlo ke konfliktu s window.supabase SDK)
let supabaseClient = null;

// Inicializace Supabase
function initSupabase() {
    // Kontrola domény před inicializací
    if (!isAllowedDomain()) {
        console.error('Database access denied: unauthorized domain');
        return false;
    }
    
    if (typeof window.supabase !== 'undefined') {
        supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        });
        // Expose client globally for other modules (i18n.js)
        window.supabaseClientInstance = supabaseClient;
        return true;
    }
    console.warn('Supabase SDK not loaded');
    return false;
}

// Nastavit Clerk JWT token pro supabaseClient (pro RLS)
async function setSupabaseAuth() {
    if (!supabaseClient || typeof Clerk === 'undefined' || !Clerk.user) return false;
    
    try {
        // Získat JWT token z Clerk pro supabaseClient
        const token = await Clerk.session?.getToken({ template: 'supabaseClient' });
        if (token) {
            // Nastavit token pro všechny následující požadavky
            supabaseClient.realtime.setAuth(token);
            // Alternativně pro REST API
            supabaseClient.rest.headers['Authorization'] = `Bearer ${token}`;
        }
        return true;
    } catch (err) {
        // Pokud Clerk nemá supabaseClient template, pokračujeme bez JWT
        return false;
    }
}

// ============================================
// UŽIVATELSKÉ FUNKCE
// ============================================

// Uložit nebo aktualizovat uživatele po přihlášení přes Clerk
async function saveUserToDatabase(clerkUser) {
    if (!supabaseClient || !clerkUser) return null;
    
    const userData = {
        clerk_id: clerkUser.id,
        email: clerkUser.emailAddresses[0]?.emailAddress || null,
        first_name: clerkUser.firstName || null,
        last_name: clerkUser.lastName || null,
        profile_image: clerkUser.imageUrl || null,
        last_login: new Date().toISOString(),
        updated_at: new Date().toISOString()
    };
    
    try {
        // Upsert - vloží nového uživatele nebo aktualizuje existujícího
        const { data, error } = await supabaseClient
            .from('users')
            .upsert(userData, { 
                onConflict: 'clerk_id',
                returning: 'representation'
            })
            .select()
            .single();
        
        if (error) {
            console.error('Error saving user:', error);
            return null;
        }
        
        // User saved successfully
        return data;
    } catch (err) {
        console.error('Database error:', err);
        return null;
    }
}

// Získat uživatele z databáze
async function getUserFromDatabase(clerkId) {
    if (!supabaseClient || !clerkId) return null;
    
    try {
        const { data, error } = await supabaseClient
            .from('users')
            .select('*')
            .eq('clerk_id', clerkId)
            .single();
        
        if (error) {
            console.error('Error fetching user:', error);
            return null;
        }
        
        return data;
    } catch (err) {
        console.error('Database error:', err);
        return null;
    }
}

// Uložit souhlas s obchodními podmínkami
async function saveTermsAcceptance(clerkId) {
    if (!supabaseClient || !clerkId) return null;
    
    // Validace clerk_id
    if (!isValidClerkId(clerkId)) {
        console.error('Invalid clerk_id format');
        return null;
    }
    
    try {
        const { data, error } = await supabaseClient
            .from('users')
            .update({ 
                terms_accepted_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            })
            .eq('clerk_id', clerkId)
            .select()
            .single();
        
        if (error) {
            console.error('Error saving terms acceptance:', error);
            return null;
        }
        
        console.log('Terms acceptance saved for user:', clerkId);
        return data;
    } catch (err) {
        console.error('Database error:', err);
        return null;
    }
}

// Uložit uživatelská nastavení/preference
async function saveUserPreferences(clerkId, preferences) {
    if (!supabaseClient || !clerkId) return null;
    
    try {
        const { data, error } = await supabaseClient
            .from('users')
            .update({ 
                preferences: preferences,
                updated_at: new Date().toISOString()
            })
            .eq('clerk_id', clerkId)
            .select()
            .single();
        
        if (error) {
            console.error('Error saving preferences:', error);
            return null;
        }
        
        return data;
    } catch (err) {
        console.error('Database error:', err);
        return null;
    }
}

// Uložit preferovaný jazyk uživatele
async function saveUserLocale(clerkId, locale) {
    if (!supabaseClient || !clerkId || !locale) return null;
    
    // Validace clerk_id
    if (!isValidClerkId(clerkId)) {
        console.error('Invalid clerk_id format');
        return null;
    }
    
    // Validace locale formátu (2-5 znaků, např. "cs", "en", "ar-SA")
    if (!/^[a-z]{2}(-[A-Z]{2})?$/.test(locale)) {
        console.error('Invalid locale format');
        return null;
    }
    
    try {
        const { data, error } = await supabaseClient
            .from('users')
            .update({ 
                locale: locale,
                updated_at: new Date().toISOString()
            })
            .eq('clerk_id', clerkId)
            .select()
            .single();
        
        if (error) {
            console.error('Error saving user locale:', error);
            return null;
        }
        
        return data;
    } catch (err) {
        console.error('Database error:', err);
        return null;
    }
}

// Získat preferovaný jazyk uživatele
async function getUserLocale(clerkId) {
    if (!supabaseClient || !clerkId) return null;
    
    // Validace clerk_id
    if (!isValidClerkId(clerkId)) {
        console.error('Invalid clerk_id format');
        return null;
    }
    
    try {
        const { data, error } = await supabaseClient
            .from('users')
            .select('locale')
            .eq('clerk_id', clerkId)
            .single();
        
        if (error) {
            console.error('Error fetching user locale:', error);
            return null;
        }
        
        return data?.locale || null;
    } catch (err) {
        console.error('Database error:', err);
        return null;
    }
}

// Generovat unikátní share ID
function generateShareId() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 12; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

// Generovat unikátní product_code
// Tento kód se používá pro deduplikaci produktů při sdílení receptů
// Kód zůstává stejný i po zkopírování produktu jinému uživateli
function generateProductCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 12; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

// Sanitizace textového vstupu (ochrana proti XSS)
function sanitizeInput(input) {
    if (typeof input !== 'string') return input;
    return input
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;')
        .trim()
        .slice(0, 1000); // Max délka 1000 znaků
}

// Validace clerk_id formátu
function isValidClerkId(clerkId) {
    if (!clerkId || typeof clerkId !== 'string') return false;
    
    // Clerk ID formáty:
    // - Standardní: user_XXXXXXXXXXXXXXXXXXXX
    // - OAuth (Google, Facebook, Apple, TikTok): oauth_google_..., oauth_facebook_..., etc.
    // - External accounts mohou mít různé formáty
    
    const isProduction = window.location.hostname === 'www.liquimixer.com' || 
                         window.location.hostname === 'liquimixer.com';
    
    // Validní Clerk ID vzory
    const validPatterns = [
        /^user_[a-zA-Z0-9]{20,}$/,           // Standardní Clerk ID
        /^oauth_[a-z]+_[a-zA-Z0-9]+$/,       // OAuth provider ID (google, facebook, apple, tiktok)
        /^[a-zA-Z0-9_-]{10,50}$/             // Obecný vzor pro různé OAuth formáty
    ];
    
    if (isProduction) {
        // V produkci povolit standardní i OAuth formáty
        return validPatterns.some(pattern => pattern.test(clerkId));
    }
    
    // V development povolit i test_user
    return validPatterns.some(pattern => pattern.test(clerkId)) || 
           /^test_user_[a-zA-Z0-9_]+$/.test(clerkId);
}

// Validace UUID formátu
function isValidUUID(str) {
    if (!str) return false;
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
}

// Rate limiting - ochrana proti spamu
const rateLimiter = {
    actions: {},
    maxActions: 10, // Max 10 akcí
    windowMs: 60000, // Za 60 sekund
    
    canProceed(action) {
        const now = Date.now();
        if (!this.actions[action]) {
            this.actions[action] = [];
        }
        
        // Odstranit staré záznamy
        this.actions[action] = this.actions[action].filter(
            time => now - time < this.windowMs
        );
        
        if (this.actions[action].length >= this.maxActions) {
            console.warn('Rate limit exceeded for:', action);
            return false;
        }
        
        this.actions[action].push(now);
        return true;
    }
};

// Uložit recept uživatele
async function saveUserRecipe(clerkId, recipe) {
    if (!supabaseClient || !clerkId) return null;
    
    // Rate limiting
    if (!rateLimiter.canProceed('saveRecipe')) {
        console.error('Too many save attempts. Please wait.');
        return null;
    }
    
    // Validace clerk_id
    if (!isValidClerkId(clerkId)) {
        console.error('Invalid clerk_id format');
        return null;
    }
    
    const shareId = generateShareId();
    const shareUrl = `${SHARE_BASE_URL}/?recipe=${shareId}`;
    
    // Sanitizace vstupů
    const recipeData = {
        clerk_id: clerkId,
        name: sanitizeInput(recipe.name) || 'Bez názvu',
        description: sanitizeInput(recipe.description) || '',
        rating: Math.min(Math.max(parseInt(recipe.rating) || 0, 0), 5), // 0-5
        share_id: shareId,
        share_url: shareUrl, // Kompletní URL pro sdílení
        recipe_data: recipe.data, // JSONB - supabaseClient escapuje automaticky
        is_public: !!recipe.is_public, // Veřejná databáze receptů
        form_type: recipe.form_type || 'liquid', // Typ formuláře (liquid, shakevape, shortfill, liquidpro, shisha)
        difficulty_level: recipe.difficulty_level || 'beginner', // Automaticky vypočítaná obtížnost
        created_at: new Date().toISOString()
    };
    
    try {
        const { data, error } = await supabaseClient
            .from('recipes')
            .insert(recipeData)
            .select()
            .single();
        
        if (error) {
            console.error('Error saving recipe:', error);
            return null;
        }
        
        // Recipe saved successfully
        return data;
    } catch (err) {
        console.error('Database error:', err);
        return null;
    }
}

// Aktualizovat recept
async function updateUserRecipe(clerkId, recipeId, updates) {
    if (!supabaseClient || !clerkId) return null;
    
    // Validace clerk_id
    if (!isValidClerkId(clerkId)) {
        console.error('Invalid clerk_id format');
        return null;
    }
    
    // Sestavit objekt aktualizace
    const updateData = {
        name: sanitizeInput(updates.name),
        description: sanitizeInput(updates.description),
        rating: Math.min(Math.max(parseInt(updates.rating) || 0, 0), 5),
        updated_at: new Date().toISOString()
    };
    
    // Přidat volitelné sloupce pokud jsou v updates
    if (updates.data !== undefined) {
        updateData.recipe_data = updates.data;
    }
    if (updates.is_public !== undefined) {
        updateData.is_public = !!updates.is_public;
    }
    if (updates.form_type !== undefined) {
        updateData.form_type = updates.form_type;
    }
    if (updates.difficulty_level !== undefined) {
        updateData.difficulty_level = updates.difficulty_level;
    }
    
    try {
        const { data, error } = await supabaseClient
            .from('recipes')
            .update(updateData)
            .eq('id', recipeId)
            .eq('clerk_id', clerkId)
            .select()
            .single();
        
        if (error) {
            console.error('Error updating recipe:', error);
            return null;
        }
        
        return data;
    } catch (err) {
        console.error('Database error:', err);
        return null;
    }
}

// Validace share_id formátu
function isValidShareId(shareId) {
    if (!shareId || typeof shareId !== 'string') return false;
    return /^[A-Za-z0-9]{12}$/.test(shareId);
}

// Získat recept podle share_id (pro sdílení)
async function getRecipeByShareId(shareId) {
    if (!supabaseClient || !shareId) return null;
    
    // SECURITY: Validace formátu share_id
    if (!isValidShareId(shareId)) {
        console.error('Invalid share_id format');
        return null;
    }
    
    try {
        const { data, error } = await supabaseClient
            .from('recipes')
            .select('*')
            .eq('share_id', shareId)
            .single();
        
        if (error) {
            console.error('Error fetching shared recipe:', error);
            return null;
        }
        
        return data;
    } catch (err) {
        console.error('Database error:', err);
        return null;
    }
}

// Získat recept podle ID
async function getRecipeById(clerkId, recipeId) {
    if (!supabaseClient) return null;
    
    // SECURITY: Validace vstupů
    if (!isValidClerkId(clerkId)) {
        console.error('Invalid clerk_id format');
        return null;
    }
    if (!isValidUUID(recipeId)) {
        console.error('Invalid recipe ID format');
        return null;
    }
    
    try {
        const { data, error } = await supabaseClient
            .from('recipes')
            .select('*')
            .eq('id', recipeId)
            .eq('clerk_id', clerkId)
            .single();
        
        if (error) {
            console.error('Error fetching recipe:', error);
            return null;
        }
        
        return data;
    } catch (err) {
        console.error('Database error:', err);
        return null;
    }
}

// Získat recepty uživatele
async function getUserRecipes(clerkId) {
    if (!supabaseClient || !clerkId) return [];
    
    // SECURITY: Validace clerk_id
    if (!isValidClerkId(clerkId)) {
        console.error('Invalid clerk_id format');
        return [];
    }
    
    try {
        const { data, error } = await supabaseClient
            .from('recipes')
            .select('*')
            .eq('clerk_id', clerkId)
            .order('created_at', { ascending: false })
            .limit(100); // SECURITY: Limit počtu receptů
        
        if (error) {
            console.error('Error fetching recipes:', error);
            return [];
        }
        
        return data || [];
    } catch (err) {
        console.error('Database error:', err);
        return [];
    }
}

// Smazat recept
async function deleteUserRecipe(clerkId, recipeId) {
    if (!supabaseClient || !clerkId) return false;
    
    // SECURITY: Validace vstupů
    if (!isValidClerkId(clerkId)) {
        console.error('Invalid clerk_id format');
        return false;
    }
    if (!isValidUUID(recipeId)) {
        console.error('Invalid recipe ID format');
        return false;
    }
    
    // Rate limiting pro mazání
    if (!rateLimiter.canProceed('deleteRecipe')) {
        console.error('Too many delete attempts. Please wait.');
        return false;
    }
    
    try {
        const { error } = await supabaseClient
            .from('recipes')
            .delete()
            .eq('id', recipeId)
            .eq('clerk_id', clerkId); // Bezpečnostní kontrola - pouze vlastní recepty
        
        if (error) {
            console.error('Error deleting recipe:', error);
            return false;
        }
        
        return true;
    } catch (err) {
        console.error('Database error:', err);
        return false;
    }
}

// ============================================
// OBLÍBENÉ PRODUKTY
// ============================================

// Uložit oblíbený produkt
async function saveFavoriteProduct(clerkId, product) {
    if (!supabaseClient || !clerkId) return null;
    
    // Rate limiting
    if (!rateLimiter.canProceed('saveProduct')) {
        console.error('Too many save attempts. Please wait.');
        return null;
    }
    
    // Validace clerk_id
    if (!isValidClerkId(clerkId)) {
        console.error('Invalid clerk_id format');
        return null;
    }
    
    // Validace typu produktu
    const validTypes = ['vg', 'pg', 'flavor', 'nicotine_booster', 'nicotine_salt'];
    const productType = validTypes.includes(product.product_type) ? product.product_type : 'flavor';
    
    // Generování share_id a share_url pro sdílení
    const shareId = generateShareId();
    const shareUrl = `${SHARE_BASE_URL}/?product=${shareId}`;
    
    // Generování product_code pro deduplikaci při sdílení
    // Pokud produkt již má product_code (kopírovaný produkt), použít ho
    const productCode = product.product_code || generateProductCode();
    
    const productData = {
        clerk_id: clerkId,
        name: sanitizeInput(product.name) || 'Bez názvu',
        product_type: productType,
        description: sanitizeInput(product.description) || '',
        rating: Math.min(Math.max(parseInt(product.rating) || 0, 0), 5),
        image_url: product.image_url || '',
        product_url: sanitizeInput(product.product_url) || '',
        share_id: shareId,
        share_url: shareUrl,
        product_code: productCode,
        created_at: new Date().toISOString()
    };
    
    try {
        const { data, error } = await supabaseClient
            .from('favorite_products')
            .insert(productData)
            .select()
            .single();
        
        if (error) {
            console.error('Error saving product:', error);
            return null;
        }
        
        return data;
    } catch (err) {
        console.error('Database error:', err);
        return null;
    }
}

// Aktualizovat oblíbený produkt
async function updateFavoriteProduct(clerkId, productId, updates) {
    if (!supabaseClient || !clerkId) return null;
    
    if (!isValidClerkId(clerkId)) {
        console.error('Invalid clerk_id format');
        return null;
    }
    if (!isValidUUID(productId)) {
        console.error('Invalid product ID format');
        return null;
    }
    
    // Validace typu produktu
    const validTypes = ['vg', 'pg', 'flavor', 'nicotine_booster', 'nicotine_salt'];
    const productType = validTypes.includes(updates.product_type) ? updates.product_type : 'flavor';
    
    try {
        const { data, error } = await supabaseClient
            .from('favorite_products')
            .update({
                name: sanitizeInput(updates.name),
                product_type: productType,
                description: sanitizeInput(updates.description),
                rating: Math.min(Math.max(parseInt(updates.rating) || 0, 0), 5),
                image_url: updates.image_url || '',
                product_url: sanitizeInput(updates.product_url) || '',
                updated_at: new Date().toISOString()
            })
            .eq('id', productId)
            .eq('clerk_id', clerkId)
            .select()
            .single();
        
        if (error) {
            console.error('Error updating product:', error);
            return null;
        }
        
        return data;
    } catch (err) {
        console.error('Database error:', err);
        return null;
    }
}

// Aktualizovat počet kusů produktu na skladě
async function updateProductStock(clerkId, productId, quantity) {
    if (!supabaseClient || !clerkId || !productId) return null;
    
    if (!isValidClerkId(clerkId)) {
        console.error('updateProductStock: Invalid clerk_id format');
        return null;
    }
    
    if (!isValidUUID(productId)) {
        console.error('updateProductStock: Invalid product ID format');
        return null;
    }
    
    // Validace množství (min 0, zaokrouhleno na 0.5)
    const validQuantity = Math.max(0, Math.round(parseFloat(quantity) * 2) / 2);
    
    try {
        const { data, error } = await supabaseClient
            .from('favorite_products')
            .update({ 
                stock_quantity: validQuantity,
                updated_at: new Date().toISOString()
            })
            .eq('id', productId)
            .eq('clerk_id', clerkId)
            .select()
            .single();
        
        if (error) {
            console.error('updateProductStock: Error:', error);
            return null;
        }
        
        return data;
    } catch (err) {
        console.error('updateProductStock: Database error:', err);
        return null;
    }
}

// Získat oblíbené produkty uživatele
async function getFavoriteProducts(clerkId) {
    if (!supabaseClient || !clerkId) return [];
    
    if (!isValidClerkId(clerkId)) {
        console.error('Invalid clerk_id format');
        return [];
    }
    
    try {
        // JOIN na flavors tabulku pro získání kompletních parametrů příchutí
        const { data, error } = await supabaseClient
            .from('favorite_products')
            .select(`
                *,
                flavors:flavor_id (
                    min_percent,
                    max_percent,
                    recommended_percent,
                    steep_days,
                    vg_ratio,
                    manufacturer_code,
                    flavor_manufacturers (name)
                )
            `)
            .eq('clerk_id', clerkId)
            .order('created_at', { ascending: false })
            .limit(100);
        
        if (error) {
            console.error('Error fetching products:', error);
            return [];
        }
        
        // Rozbalit data z joinované flavors tabulky do hlavního objektu
        return (data || []).map(p => {
            if (p.flavors && p.product_type === 'flavor') {
                const flavorData = p.flavors;
                return {
                    ...p,
                    // Přidat parametry z veřejné databáze příchutí
                    flavor_min_percent: flavorData.min_percent,
                    flavor_max_percent: flavorData.max_percent,
                    flavor_recommended_percent: flavorData.recommended_percent,
                    flavor_steep_days: flavorData.steep_days || p.steep_days,
                    flavor_vg_ratio: flavorData.vg_ratio,
                    // Výrobce - preferovat z favorite_products, fallback na flavors
                    manufacturer: p.manufacturer || flavorData.flavor_manufacturers?.name || flavorData.manufacturer_code,
                    flavors: undefined // Odstranit vnořený objekt
                };
            }
            return p;
        });
    } catch (err) {
        console.error('Database error:', err);
        return [];
    }
}

// Získat produkt podle ID
async function getFavoriteProductById(clerkId, productId) {
    if (!supabaseClient) return null;
    
    if (!isValidClerkId(clerkId)) {
        console.error('Invalid clerk_id format');
        return null;
    }
    if (!isValidUUID(productId)) {
        console.error('Invalid product ID format');
        return null;
    }
    
    try {
        const { data, error } = await supabaseClient
            .from('favorite_products')
            .select(`
                *,
                flavors:flavor_id (
                    min_percent,
                    max_percent,
                    recommended_percent,
                    steep_days,
                    vg_ratio,
                    manufacturer_code,
                    flavor_manufacturers (
                        name
                    )
                )
            `)
            .eq('id', productId)
            .eq('clerk_id', clerkId)
            .single();
        
        if (error) {
            console.error('Error fetching product:', error);
            return null;
        }
        
        // Rozbalit parametry z připojené flavors tabulky
        if (data && data.flavors) {
            data.flavor_min_percent = data.flavors.min_percent;
            data.flavor_max_percent = data.flavors.max_percent;
            data.flavor_recommended_percent = data.flavors.recommended_percent;
            data.flavor_steep_days = data.flavors.steep_days;
            data.flavor_vg_ratio = data.flavors.vg_ratio;
            data.flavor_manufacturer_code = data.flavors.manufacturer_code;
            if (data.flavors.flavor_manufacturers) {
                data.flavor_manufacturer = data.flavors.flavor_manufacturers.name;
            }
        }
        
        return data;
    } catch (err) {
        console.error('Database error:', err);
        return null;
    }
}

// Získat produkt podle product_code (pro deduplikaci při sdílení)
// Vrací produkt pokud uživatel již má produkt se stejným kódem
async function getProductByCode(clerkId, productCode) {
    if (!supabaseClient || !clerkId || !productCode) return null;
    
    if (!isValidClerkId(clerkId)) {
        console.error('Invalid clerk_id format');
        return null;
    }
    
    // Validace product_code formátu (12 znaků, alfanumerické - velká i malá písmena)
    // SQL migrace používá UPPER(SUBSTRING(REPLACE(id::text, '-', ''), 1, 12)) což jsou HEX znaky
    if (!/^[A-Za-z0-9]{12}$/.test(productCode)) {
        console.error('Invalid product_code format:', productCode);
        return null;
    }
    
    try {
        const { data, error } = await supabaseClient
            .from('favorite_products')
            .select('*')
            .eq('clerk_id', clerkId)
            .eq('product_code', productCode)
            .single();
        
        if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
            console.error('Error fetching product by code:', error);
            return null;
        }
        
        return data || null;
    } catch (err) {
        console.error('Database error:', err);
        return null;
    }
}

// Získat produkt podle share_id (pro sdílení)
async function getProductByShareId(shareId) {
    if (!supabaseClient || !shareId) return null;
    
    // SECURITY: Validace formátu share_id
    if (!isValidShareId(shareId)) {
        console.error('Invalid share_id format');
        return null;
    }
    
    try {
        const { data, error } = await supabaseClient
            .from('favorite_products')
            .select('*')
            .eq('share_id', shareId)
            .single();
        
        if (error) {
            console.error('Error fetching shared product:', error);
            return null;
        }
        
        return data;
    } catch (err) {
        console.error('Database error:', err);
        return null;
    }
}

// Smazat oblíbený produkt
async function deleteFavoriteProduct(clerkId, productId) {
    if (!supabaseClient || !clerkId) return false;
    
    if (!isValidClerkId(clerkId)) {
        console.error('Invalid clerk_id format');
        return false;
    }
    if (!isValidUUID(productId)) {
        console.error('Invalid product ID format');
        return false;
    }
    
    if (!rateLimiter.canProceed('deleteProduct')) {
        console.error('Too many delete attempts. Please wait.');
        return false;
    }
    
    try {
        const { error } = await supabaseClient
            .from('favorite_products')
            .delete()
            .eq('id', productId)
            .eq('clerk_id', clerkId);
        
        if (error) {
            console.error('Error deleting product:', error);
            return false;
        }
        
        return true;
    } catch (err) {
        console.error('Database error:', err);
        return false;
    }
}

// Upload obrázku produktu do supabaseClient Storage
async function uploadProductImage(clerkId, file) {
    if (!supabaseClient || !clerkId || !file) return null;
    
    if (!isValidClerkId(clerkId)) {
        console.error('Invalid clerk_id format');
        return null;
    }
    
    // Validace souboru
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
        console.error('Invalid file type. Allowed: JPEG, PNG, WebP, GIF');
        return null;
    }
    
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
        console.error('File too large. Max 5MB allowed.');
        return null;
    }
    
    const fileExt = file.name.split('.').pop();
    const fileName = `${clerkId}/${Date.now()}.${fileExt}`;
    
    try {
        const { data, error } = await supabaseClient.storage
            .from('product-images')
            .upload(fileName, file, {
                cacheControl: '3600',
                upsert: false
            });
        
        if (error) {
            console.error('Error uploading image:', error);
            return null;
        }
        
        // Získat veřejnou URL
        const { data: urlData } = supabaseClient.storage
            .from('product-images')
            .getPublicUrl(fileName);
        
        return urlData.publicUrl;
    } catch (err) {
        console.error('Upload error:', err);
        return null;
    }
}

// ============================================
// PROPOJENÍ PRODUKTŮ S RECEPTY
// ============================================

// Propojit produkty s receptem
async function linkProductsToRecipe(clerkId, recipeId, productIds) {
    if (!supabaseClient || !clerkId || !recipeId || !productIds || productIds.length === 0) return false;
    
    if (!isValidClerkId(clerkId)) {
        console.error('Invalid clerk_id format');
        return false;
    }
    if (!isValidUUID(recipeId)) {
        console.error('Invalid recipe ID format');
        return false;
    }
    
    try {
        // Smazat existující propojení
        await supabaseClient
            .from('recipe_products')
            .delete()
            .eq('recipe_id', recipeId)
            .eq('clerk_id', clerkId);
        
        // Vytvořit nová propojení
        const links = productIds
            .filter(id => isValidUUID(id))
            .map(productId => ({
                recipe_id: recipeId,
                product_id: productId,
                clerk_id: clerkId
            }));
        
        if (links.length > 0) {
            const { error } = await supabaseClient
                .from('recipe_products')
                .insert(links);
            
            if (error) {
                console.error('Error linking products:', error);
                return false;
            }
        }
        
        return true;
    } catch (err) {
        console.error('Database error:', err);
        return false;
    }
}

// Získat produkty propojené s receptem
async function getLinkedProducts(clerkId, recipeId) {
    if (!supabaseClient || !clerkId || !recipeId) return [];
    
    if (!isValidClerkId(clerkId)) {
        console.error('Invalid clerk_id format');
        return [];
    }
    if (!isValidUUID(recipeId)) {
        console.error('Invalid recipe ID format');
        return [];
    }
    
    try {
        const { data, error } = await supabaseClient
            .from('recipe_products')
            .select(`
                product_id,
                favorite_products (
                    id,
                    name,
                    product_type,
                    rating,
                    image_url
                )
            `)
            .eq('recipe_id', recipeId)
            .eq('clerk_id', clerkId);
        
        if (error) {
            console.error('Error fetching linked products:', error);
            return [];
        }
        
        // Extrahovat produkty z výsledku
        return (data || [])
            .map(item => item.favorite_products)
            .filter(p => p !== null);
    } catch (err) {
        console.error('Database error:', err);
        return [];
    }
}

// Získat produkty propojené s receptem (bez ověření vlastníka - pro sdílené recepty)
async function getLinkedProductsByRecipeId(recipeId) {
    if (!supabaseClient || !recipeId) return [];
    
    if (!isValidUUID(recipeId)) {
        console.error('Invalid recipe ID format');
        return [];
    }
    
    try {
        const { data, error } = await supabaseClient
            .from('recipe_products')
            .select(`
                product_id,
                favorite_products (
                    id,
                    name,
                    product_type,
                    rating,
                    image_url,
                    description,
                    product_url
                )
            `)
            .eq('recipe_id', recipeId);
        
        if (error) {
            console.error('Error fetching linked products by recipe id:', error);
            return [];
        }
        
        // Extrahovat produkty z výsledku
        return (data || [])
            .map(item => item.favorite_products)
            .filter(p => p !== null);
    } catch (err) {
        console.error('Database error:', err);
        return [];
    }
}

// Získat recepty, ve kterých je produkt použitý
async function getRecipesByProductId(clerkId, productId) {
    if (!supabaseClient || !clerkId || !productId) return [];
    
    if (!isValidUUID(productId)) {
        console.error('Invalid product ID format');
        return [];
    }
    
    try {
        const { data, error } = await supabaseClient
            .from('recipe_products')
            .select(`
                recipe_id,
                recipes (
                    id,
                    clerk_id,
                    name,
                    rating,
                    created_at
                )
            `)
            .eq('product_id', productId);
        
        if (error) {
            console.error('Error fetching recipes by product id:', error);
            return [];
        }
        
        // Extrahovat recepty z výsledku a filtrovat pouze recepty vlastníka
        return (data || [])
            .map(item => item.recipes)
            .filter(r => r !== null && r.clerk_id === clerkId);
    } catch (err) {
        console.error('Database error:', err);
        return [];
    }
}

// Získat produkt podle ID (bez ověření vlastníka - pro sdílené recepty, read-only)
async function getProductByIdPublic(productId) {
    if (!supabaseClient || !productId) return null;
    
    if (!isValidUUID(productId)) {
        console.error('Invalid product ID format');
        return null;
    }
    
    try {
        const { data, error } = await supabaseClient
            .from('favorite_products')
            .select('*')
            .eq('id', productId)
            .single();
        
        if (error) {
            console.error('Error fetching product by id (public):', error);
            return null;
        }
        
        return data;
    } catch (err) {
        console.error('Database error:', err);
        return null;
    }
}

// Zkopírovat produkt do účtu jiného uživatele
async function copyProductToUser(productId, targetClerkId) {
    if (!supabaseClient || !productId || !targetClerkId) return null;
    
    if (!isValidUUID(productId)) {
        console.error('Invalid product ID format');
        return null;
    }
    if (!isValidClerkId(targetClerkId)) {
        console.error('Invalid clerk_id format');
        return null;
    }
    
    try {
        // Načíst původní produkt
        const original = await getProductByIdPublic(productId);
        if (!original) return null;
        
        // DEDUPLIKACE: Zkontrolovat zda cílový uživatel již nemá produkt se stejným product_code
        if (original.product_code) {
            const existingProduct = await getProductByCode(targetClerkId, original.product_code);
            if (existingProduct) {
                console.log(`[copyProductToUser] Produkt se stejným kódem ${original.product_code} již existuje, použiji existující ID: ${existingProduct.id}`);
                return existingProduct; // Vrátit existující produkt místo vytvoření nového
            }
        }
        
        // Generovat nový share_id a share_url pro kopii
        const newShareId = generateShareId();
        const newShareUrl = `${SHARE_BASE_URL}/?product=${newShareId}`;
        
        // Vytvořit kopii pro nového uživatele
        // DŮLEŽITÉ: Zachovat product_code z originálu pro budoucí deduplikaci
        const copyData = {
            clerk_id: targetClerkId,
            name: original.name,
            product_type: original.product_type,
            description: original.description || '',
            rating: original.rating || 0,
            product_url: original.product_url || '',
            image_url: original.image_url || '',
            product_code: original.product_code || generateProductCode(), // Zachovat nebo vygenerovat nový
            share_id: newShareId,
            share_url: newShareUrl,
            created_at: new Date().toISOString()
        };
        
        const { data, error } = await supabaseClient
            .from('favorite_products')
            .insert([copyData])
            .select()
            .single();
        
        if (error) {
            console.error('Error copying product:', error);
            return null;
        }
        
        console.log(`[copyProductToUser] Nový produkt vytvořen s ID: ${data.id}, product_code: ${data.product_code}`);
        return data;
    } catch (err) {
        console.error('Database error:', err);
        return null;
    }
}

// ============================================
// INTEGRACE S CLERK
// ============================================

// Volá se po úspěšném přihlášení přes Clerk
async function onClerkSignIn(clerkUser) {
    if (!clerkUser) return;
    
    // Inicializuj supabaseClient pokud ještě není
    if (!supabaseClient) {
        initSupabase();
    }
    
    // Ulož uživatele do databáze
    await saveUserToDatabase(clerkUser);
    
    // Načíst uložený jazyk uživatele a aplikovat ho
    if (window.i18n?.loadUserLocale) {
        await window.i18n.loadUserLocale(clerkUser.id);
    }
}

// =============================================
// REMINDER FUNCTIONS
// =============================================

// Uložit novou připomínku
async function saveReminder(clerkId, reminderData) {
    console.log('saveReminder called with:', { clerkId, reminderData });
    
    if (!supabaseClient || !clerkId) {
        console.error('saveReminder: Missing supabaseClient or clerkId');
        return null;
    }
    
    if (!isValidClerkId(clerkId)) {
        console.error('saveReminder: Invalid clerk_id format:', clerkId);
        return null;
    }
    
    // Validate recipe_id if provided
    if (reminderData.recipe_id && !isValidUUID(reminderData.recipe_id)) {
        console.error('saveReminder: Invalid recipe_id format:', reminderData.recipe_id);
        return null;
    }
    
    // Validate required fields
    if (!reminderData.mixed_at || !reminderData.remind_at) {
        console.error('saveReminder: Missing required date fields:', { mixed_at: reminderData.mixed_at, remind_at: reminderData.remind_at });
        return null;
    }
    
    try {
        const insertData = {
            clerk_id: clerkId,
            recipe_id: reminderData.recipe_id || null,
            mixed_at: reminderData.mixed_at,
            remind_at: reminderData.remind_at,
            remind_time: reminderData.remind_time || '16:30',
            flavor_type: reminderData.flavor_type || null,
            flavor_name: reminderData.flavor_name || null,
            recipe_name: reminderData.recipe_name || null,
            timezone: reminderData.timezone || 'Europe/Prague',
            status: 'pending',
            note: reminderData.note || null
        };
        
        console.log('saveReminder: Inserting data:', insertData);
        
        const { data, error } = await supabaseClient
            .from('recipe_reminders')
            .insert(insertData)
            .select()
            .single();
        
        if (error) {
            console.error('saveReminder: Supabase error:', error);
            return null;
        }
        
        console.log('saveReminder: Success, saved reminder:', data);
        return data;
    } catch (err) {
        console.error('saveReminder: Database error:', err);
        return null;
    }
}

// Získat připomínky pro recept
async function getRecipeReminders(clerkId, recipeId) {
    if (!supabaseClient || !clerkId || !recipeId) return [];
    
    if (!isValidClerkId(clerkId)) {
        console.error('Invalid clerk_id format');
        return [];
    }
    
    try {
        const { data, error } = await supabaseClient
            .from('recipe_reminders')
            .select('*')
            .eq('clerk_id', clerkId)
            .eq('recipe_id', recipeId)
            .order('remind_at', { ascending: true });
        
        if (error) {
            console.error('Error fetching reminders:', error);
            return [];
        }
        
        return data || [];
    } catch (err) {
        console.error('Database error:', err);
        return [];
    }
}

// Získat všechny připomínky uživatele
async function getUserReminders(clerkId) {
    if (!supabaseClient || !clerkId) return [];
    
    if (!isValidClerkId(clerkId)) {
        console.error('Invalid clerk_id format');
        return [];
    }
    
    try {
        const { data, error } = await supabaseClient
            .from('recipe_reminders')
            .select('*')
            .eq('clerk_id', clerkId)
            .order('remind_at', { ascending: true });
        
        if (error) {
            console.error('Error fetching user reminders:', error);
            return [];
        }
        
        return data || [];
    } catch (err) {
        console.error('Database error:', err);
        return [];
    }
}

// Aktualizovat připomínku
async function updateReminder(clerkId, reminderId, updateData) {
    if (!supabaseClient || !clerkId || !reminderId) return null;
    
    if (!isValidClerkId(clerkId)) {
        console.error('Invalid clerk_id format');
        return null;
    }
    
    try {
        // Sestavit objekt pro aktualizaci
        const updateObj = {
            updated_at: new Date().toISOString()
        };
        
        // Přidat pouze definovaná pole
        if (updateData.mixed_at !== undefined) updateObj.mixed_at = updateData.mixed_at;
        if (updateData.remind_at !== undefined) updateObj.remind_at = updateData.remind_at;
        if (updateData.note !== undefined) updateObj.note = updateData.note;
        
        const { data, error } = await supabaseClient
            .from('recipe_reminders')
            .update(updateObj)
            .eq('id', reminderId)
            .eq('clerk_id', clerkId)
            .select()
            .single();
        
        if (error) {
            console.error('Error updating reminder:', error);
            return null;
        }
        
        return data;
    } catch (err) {
        console.error('Database error:', err);
        return null;
    }
}

// Smazat připomínku
async function deleteReminder(clerkId, reminderId) {
    if (!supabaseClient || !clerkId || !reminderId) return false;
    
    if (!isValidClerkId(clerkId)) {
        console.error('Invalid clerk_id format');
        return false;
    }
    
    try {
        const { error } = await supabaseClient
            .from('recipe_reminders')
            .delete()
            .eq('id', reminderId)
            .eq('clerk_id', clerkId);
        
        if (error) {
            console.error('Error deleting reminder:', error);
            return false;
        }
        
        return true;
    } catch (err) {
        console.error('Database error:', err);
        return false;
    }
}

// Zrušit připomínku (změnit status na cancelled)
async function cancelReminder(clerkId, reminderId) {
    if (!supabaseClient || !clerkId || !reminderId) return false;
    
    if (!isValidClerkId(clerkId)) {
        console.error('Invalid clerk_id format');
        return false;
    }
    
    try {
        const { error } = await supabaseClient
            .from('recipe_reminders')
            .update({ status: 'cancelled', updated_at: new Date().toISOString() })
            .eq('id', reminderId)
            .eq('clerk_id', clerkId);
        
        if (error) {
            console.error('Error cancelling reminder:', error);
            return false;
        }
        
        return true;
    } catch (err) {
        console.error('Database error:', err);
        return false;
    }
}

// =============================================
// STOCK TRACKING FUNCTIONS (Reminder stock percentage)
// =============================================

// Získat jednu připomínku podle ID
async function getReminderById(clerkId, reminderId) {
    if (!supabaseClient || !clerkId || !reminderId) return null;
    
    if (!isValidClerkId(clerkId)) {
        console.error('getReminderById: Invalid clerk_id format');
        return null;
    }
    
    try {
        const { data, error } = await supabaseClient
            .from('recipe_reminders')
            .select('*')
            .eq('id', reminderId)
            .eq('clerk_id', clerkId)
            .single();
        
        if (error) {
            console.error('getReminderById: Error:', error);
            return null;
        }
        
        return data;
    } catch (err) {
        console.error('getReminderById: Database error:', err);
        return null;
    }
}

// Aktualizovat zásobu připomínky (stock_percent)
async function updateReminderStock(clerkId, reminderId, stockPercent) {
    if (!supabaseClient || !clerkId || !reminderId) return null;
    
    if (!isValidClerkId(clerkId)) {
        console.error('updateReminderStock: Invalid clerk_id format');
        return null;
    }
    
    // Validace rozsahu
    const validStock = Math.max(0, Math.min(100, parseInt(stockPercent) || 0));
    
    try {
        const { data, error } = await supabaseClient
            .from('recipe_reminders')
            .update({ 
                stock_percent: validStock,
                updated_at: new Date().toISOString()
            })
            .eq('id', reminderId)
            .eq('clerk_id', clerkId)
            .select()
            .single();
        
        if (error) {
            console.error('updateReminderStock: Error:', error);
            return null;
        }
        
        return data;
    } catch (err) {
        console.error('updateReminderStock: Database error:', err);
        return null;
    }
}

// Označit připomínku jako spotřebovanou
async function markReminderConsumed(clerkId, reminderId) {
    if (!supabaseClient || !clerkId || !reminderId) return null;
    
    if (!isValidClerkId(clerkId)) {
        console.error('markReminderConsumed: Invalid clerk_id format');
        return null;
    }
    
    try {
        const { data, error } = await supabaseClient
            .from('recipe_reminders')
            .update({ 
                stock_percent: 0,
                consumed_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            })
            .eq('id', reminderId)
            .eq('clerk_id', clerkId)
            .select()
            .single();
        
        if (error) {
            console.error('markReminderConsumed: Error:', error);
            return null;
        }
        
        return data;
    } catch (err) {
        console.error('markReminderConsumed: Database error:', err);
        return null;
    }
}

// =============================================
// PUBLIC RECIPE DATABASE FUNCTIONS
// =============================================

// Získat veřejné recepty s filtrováním a paginací
async function getPublicRecipes(filters = {}, page = 1, limit = 50) {
    if (!supabaseClient) return { recipes: [], total: 0, page: 1, limit: 50 };
    
    try {
        let query = supabaseClient
            .from('recipes')
            .select('id, name, description, is_public, public_rating_avg, public_rating_count, form_type, difficulty_level, recipe_data, created_at', { count: 'exact' })
            .eq('is_public', true);
        
        // Filtr: Metoda přípravy
        if (filters.formType) {
            query = query.eq('form_type', filters.formType);
        }
        
        // Filtr: Hledání v názvu
        if (filters.search) {
            query = query.ilike('name', `%${filters.search}%`);
        }
        
        // Filtr: Typ příchutě (v recipe_data.flavorType)
        if (filters.flavorType) {
            query = query.eq('recipe_data->flavorType', filters.flavorType);
        }
        
        // Filtr: VG poměr - min
        if (filters.vgMin !== undefined && filters.vgMin !== '' && !isNaN(filters.vgMin)) {
            query = query.gte('recipe_data->vgRatio', parseInt(filters.vgMin));
        }
        
        // Filtr: VG poměr - max
        if (filters.vgMax !== undefined && filters.vgMax !== '' && !isNaN(filters.vgMax)) {
            query = query.lte('recipe_data->vgRatio', parseInt(filters.vgMax));
        }
        
        // Filtr: Síla nikotinu - min
        if (filters.nicMin !== undefined && filters.nicMin !== '' && !isNaN(filters.nicMin)) {
            query = query.gte('recipe_data->nicStrength', parseInt(filters.nicMin));
        }
        
        // Filtr: Síla nikotinu - max
        if (filters.nicMax !== undefined && filters.nicMax !== '' && !isNaN(filters.nicMax)) {
            query = query.lte('recipe_data->nicStrength', parseInt(filters.nicMax));
        }
        
        // Filtr: Obsahuje aditiva
        if (filters.hasAdditive) {
            query = query.not('recipe_data->additive', 'is', null);
        }
        
        // Filtr: Obtížnost
        if (filters.difficulty) {
            query = query.eq('difficulty_level', filters.difficulty);
        }
        
        // Řazení
        switch (filters.sortBy) {
            case 'rating_asc':
                query = query.order('public_rating_avg', { ascending: true });
                break;
            case 'name_asc':
                query = query.order('name', { ascending: true });
                break;
            case 'name_desc':
                query = query.order('name', { ascending: false });
                break;
            case 'newest':
                query = query.order('created_at', { ascending: false });
                break;
            case 'oldest':
                query = query.order('created_at', { ascending: true });
                break;
            case 'rating_desc':
            default:
                query = query.order('public_rating_avg', { ascending: false });
                break;
        }
        
        // Paginace (50 na stránku)
        const offset = (page - 1) * limit;
        query = query.range(offset, offset + limit - 1);
        
        const { data, error, count } = await query;
        
        if (error) {
            console.error('getPublicRecipes: Error:', error);
            return { recipes: [], total: 0, page, limit };
        }
        
        return { recipes: data || [], total: count || 0, page, limit };
    } catch (err) {
        console.error('getPublicRecipes: Database error:', err);
        return { recipes: [], total: 0, page, limit };
    }
}

// Získat veřejný recept podle ID (bez ověření vlastníka)
async function getPublicRecipeById(recipeId) {
    if (!supabaseClient || !recipeId) return null;
    
    if (!isValidUUID(recipeId)) {
        console.error('getPublicRecipeById: Invalid recipe ID format');
        return null;
    }
    
    try {
        const { data, error } = await supabaseClient
            .from('recipes')
            .select('*')
            .eq('id', recipeId)
            .eq('is_public', true)
            .single();
        
        if (error) {
            console.error('getPublicRecipeById: Error:', error);
            return null;
        }
        
        return data;
    } catch (err) {
        console.error('getPublicRecipeById: Database error:', err);
        return null;
    }
}

// Přidat/aktualizovat hodnocení receptu (1-5 hvězdiček)
async function addRecipeRating(clerkId, recipeId, rating) {
    if (!supabaseClient || !clerkId || !recipeId) return null;
    
    if (!isValidClerkId(clerkId)) {
        console.error('addRecipeRating: Invalid clerk_id format');
        return null;
    }
    if (!isValidUUID(recipeId)) {
        console.error('addRecipeRating: Invalid recipe ID format');
        return null;
    }
    
    // Validace hodnocení (1-5)
    const validRating = Math.max(1, Math.min(5, parseInt(rating) || 1));
    
    try {
        const { data, error } = await supabaseClient
            .from('recipe_ratings')
            .upsert({
                recipe_id: recipeId,
                clerk_id: clerkId,
                rating: validRating,
                updated_at: new Date().toISOString()
            }, {
                onConflict: 'recipe_id,clerk_id'
            })
            .select()
            .single();
        
        if (error) {
            console.error('addRecipeRating: Error:', error);
            return null;
        }
        
        // Přepočítat průměr
        await updateRecipeRatingAvg(recipeId);
        
        return data;
    } catch (err) {
        console.error('addRecipeRating: Database error:', err);
        return null;
    }
}

// Získat hodnocení uživatele pro konkrétní recept
async function getUserRatingForRecipe(clerkId, recipeId) {
    if (!supabaseClient || !clerkId || !recipeId) return 0;
    
    if (!isValidClerkId(clerkId)) return 0;
    if (!isValidUUID(recipeId)) return 0;
    
    try {
        const { data, error } = await supabaseClient
            .from('recipe_ratings')
            .select('rating')
            .eq('recipe_id', recipeId)
            .eq('clerk_id', clerkId)
            .maybeSingle();
        
        if (error) {
            console.error('getUserRatingForRecipe: Error:', error);
            return 0;
        }
        
        return data?.rating || 0;
    } catch (err) {
        console.error('getUserRatingForRecipe: Database error:', err);
        return 0;
    }
}

// Přepočítat průměrné hodnocení receptu
async function updateRecipeRatingAvg(recipeId) {
    if (!supabaseClient || !recipeId) return;
    
    if (!isValidUUID(recipeId)) return;
    
    try {
        // Získat všechna hodnocení
        const { data: ratings, error: fetchError } = await supabaseClient
            .from('recipe_ratings')
            .select('rating')
            .eq('recipe_id', recipeId);
        
        if (fetchError) {
            console.error('updateRecipeRatingAvg: Fetch error:', fetchError);
            return;
        }
        
        const count = ratings?.length || 0;
        const avg = count > 0 
            ? ratings.reduce((sum, r) => sum + r.rating, 0) / count 
            : 0;
        
        // Aktualizovat recept
        const { error: updateError } = await supabaseClient
            .from('recipes')
            .update({
                public_rating_avg: Math.round(avg * 10) / 10, // 1 desetinné místo
                public_rating_count: count
            })
            .eq('id', recipeId);
        
        if (updateError) {
            console.error('updateRecipeRatingAvg: Update error:', updateError);
        }
    } catch (err) {
        console.error('updateRecipeRatingAvg: Database error:', err);
    }
}

// =============================================
// FLAVOR DATABASE FUNCTIONS
// =============================================

// Získat všechny výrobce příchutí
async function getFlavorManufacturers() {
    if (!supabaseClient) {
        console.error('getFlavorManufacturers: Supabase not initialized');
        return [];
    }
    
    try {
        const { data, error } = await supabaseClient
            .from('flavor_manufacturers')
            .select('*')
            .eq('is_active', true)
            .order('name');
        
        if (error) {
            console.error('getFlavorManufacturers: Supabase error:', error);
            return [];
        }
        
        return data || [];
    } catch (err) {
        console.error('getFlavorManufacturers: Database error:', err);
        return [];
    }
}

// Vyhledávání příchutí s filtry
async function searchFlavors(filters = {}, page = 1, limit = 20) {
    if (!supabaseClient) {
        console.error('searchFlavors: Supabase not initialized');
        return { data: [], total: 0 };
    }
    
    try {
        let query = supabaseClient
            .from('flavors')
            .select('*, flavor_manufacturers!inner(name, country_code)', { count: 'exact' })
            .eq('status', 'active');
        
        // Filtry
        if (filters.product_type && filters.product_type !== 'all') {
            query = query.eq('product_type', filters.product_type);
        }
        
        if (filters.manufacturer_code && filters.manufacturer_code !== 'all') {
            query = query.eq('manufacturer_code', filters.manufacturer_code);
        }
        
        if (filters.category && filters.category !== 'all') {
            query = query.eq('category', filters.category);
        }
        
        if (filters.min_rating && filters.min_rating > 0) {
            query = query.gte('avg_rating', filters.min_rating);
        }
        
        // Fulltext vyhledávání
        if (filters.search && filters.search.trim().length >= 2) {
            query = query.ilike('name', `%${filters.search.trim()}%`);
        }
        
        // Řazení
        switch (filters.sort) {
            case 'rating':
                query = query.order('avg_rating', { ascending: false });
                break;
            case 'name':
                query = query.order('name', { ascending: true });
                break;
            case 'newest':
                query = query.order('created_at', { ascending: false });
                break;
            case 'popularity':
            default:
                query = query.order('usage_count', { ascending: false });
                break;
        }
        
        // Paginace
        const from = (page - 1) * limit;
        const to = from + limit - 1;
        query = query.range(from, to);
        
        const { data, error, count } = await query;
        
        if (error) {
            console.error('searchFlavors: Supabase error:', error);
            return { data: [], total: 0 };
        }
        
        return { data: data || [], total: count || 0 };
    } catch (err) {
        console.error('searchFlavors: Database error:', err);
        return { data: [], total: 0 };
    }
}

// Získat detail příchutě podle ID
async function getFlavorById(flavorId) {
    if (!supabaseClient || !flavorId) {
        console.error('getFlavorById: Missing required parameters');
        return null;
    }
    
    if (!isValidUUID(flavorId)) {
        console.error('getFlavorById: Invalid flavor_id format');
        return null;
    }
    
    try {
        const { data, error } = await supabaseClient
            .from('flavors')
            .select('*, flavor_manufacturers(name, country_code, website)')
            .eq('id', flavorId)
            .eq('status', 'active')
            .single();
        
        if (error) {
            console.error('getFlavorById: Supabase error:', error);
            return null;
        }
        
        return data;
    } catch (err) {
        console.error('getFlavorById: Database error:', err);
        return null;
    }
}

// Přidat hodnocení příchutě
async function addFlavorRating(clerkId, flavorId, rating) {
    if (!supabaseClient || !clerkId || !flavorId || !rating) {
        console.error('addFlavorRating: Missing required parameters');
        return { data: null, error: new Error('Missing required parameters') };
    }
    
    if (!isValidClerkId(clerkId)) {
        console.error('addFlavorRating: Invalid clerk_id format');
        return { data: null, error: new Error('Invalid clerk_id format') };
    }
    
    if (!isValidUUID(flavorId)) {
        console.error('addFlavorRating: Invalid flavor_id format');
        return { data: null, error: new Error('Invalid flavor_id format') };
    }
    
    if (rating < 1 || rating > 5) {
        console.error('addFlavorRating: Invalid rating value (must be 1-5)');
        return { data: null, error: new Error('Invalid rating value') };
    }
    
    try {
        const { data, error } = await supabaseClient
            .from('flavor_ratings')
            .upsert({
                flavor_id: flavorId,
                clerk_id: clerkId,
                rating: rating,
                updated_at: new Date().toISOString()
            }, {
                onConflict: 'flavor_id,clerk_id'
            })
            .select()
            .single();
        
        if (error) {
            console.error('addFlavorRating: Supabase error:', error);
            return { data: null, error };
        }
        
        console.log('addFlavorRating: Rating saved successfully');
        return { data, error: null };
    } catch (err) {
        console.error('addFlavorRating: Database error:', err);
        return { data: null, error: err };
    }
}

// Získat hodnocení uživatele pro příchuť
async function getUserFlavorRating(clerkId, flavorId) {
    if (!supabaseClient || !clerkId || !flavorId) return null;
    
    if (!isValidClerkId(clerkId) || !isValidUUID(flavorId)) return null;
    
    try {
        const { data, error } = await supabaseClient
            .from('flavor_ratings')
            .select('rating')
            .eq('clerk_id', clerkId)
            .eq('flavor_id', flavorId)
            .maybeSingle();
        
        if (error) {
            console.error('getUserFlavorRating: Supabase error:', error);
            return null;
        }
        
        return data?.rating || null;
    } catch (err) {
        console.error('getUserFlavorRating: Database error:', err);
        return null;
    }
}

// Odeslat návrh příchutě do databáze
async function submitFlavorSuggestion(clerkId, flavorData) {
    if (!supabaseClient || !clerkId || !flavorData) {
        console.error('submitFlavorSuggestion: Missing required parameters');
        return { data: null, error: new Error('Missing required parameters') };
    }
    
    if (!isValidClerkId(clerkId)) {
        console.error('submitFlavorSuggestion: Invalid clerk_id format');
        return { data: null, error: new Error('Invalid clerk_id format') };
    }
    
    // Validace povinných polí
    if (!flavorData.name || !flavorData.manufacturer_code || !flavorData.product_type || !flavorData.category) {
        console.error('submitFlavorSuggestion: Missing required flavor data');
        return { data: null, error: new Error('Missing required flavor data') };
    }
    
    // Rate limiting - max 5 návrhů za týden
    const weeklyCount = await getUserSuggestionCount(clerkId);
    if (weeklyCount >= 5) {
        console.error('submitFlavorSuggestion: Weekly limit reached');
        return { data: null, error: new Error('Weekly suggestion limit reached') };
    }
    
    try {
        const { data, error } = await supabaseClient
            .from('flavors')
            .insert({
                name: sanitizeInput(flavorData.name, 100),
                manufacturer_code: flavorData.manufacturer_code,
                product_type: flavorData.product_type,
                category: flavorData.category,
                min_percent: flavorData.min_percent || null,
                max_percent: flavorData.max_percent || null,
                recommended_percent: flavorData.recommended_percent || null,
                steep_days: flavorData.steep_days || 7,
                status: 'pending',
                submitted_by: clerkId
            })
            .select()
            .single();
        
        if (error) {
            console.error('submitFlavorSuggestion: Supabase error:', error);
            return { data: null, error };
        }
        
        console.log('submitFlavorSuggestion: Suggestion submitted successfully');
        return { data, error: null };
    } catch (err) {
        console.error('submitFlavorSuggestion: Database error:', err);
        return { data: null, error: err };
    }
}

// Počet návrhů uživatele za poslední týden
async function getUserSuggestionCount(clerkId) {
    if (!supabaseClient || !clerkId) return 0;
    
    if (!isValidClerkId(clerkId)) return 0;
    
    try {
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        
        const { count, error } = await supabaseClient
            .from('flavors')
            .select('*', { count: 'exact', head: true })
            .eq('submitted_by', clerkId)
            .gte('created_at', oneWeekAgo.toISOString());
        
        if (error) {
            console.error('getUserSuggestionCount: Supabase error:', error);
            return 0;
        }
        
        return count || 0;
    } catch (err) {
        console.error('getUserSuggestionCount: Database error:', err);
        return 0;
    }
}

// Vyhledávání příchutí pro autocomplete (kombinace oblíbených + veřejná DB)
async function searchFlavorsForAutocomplete(clerkId, searchTerm, recipeType, limit = 10) {
    if (!supabaseClient) {
        console.error('searchFlavorsForAutocomplete: Supabase not initialized');
        return { favorites: [], database: [] };
    }
    
    const results = { favorites: [], database: [] };
    const productType = ['liquid', 'liquid_pro', 'shakevape', 'shortfill'].includes(recipeType) ? 'vape' : 'shisha';
    
    try {
        // 1. Hledat v oblíbených produktech uživatele (pokud je přihlášen)
        if (clerkId && isValidClerkId(clerkId)) {
            // Načíst oblíbené příchutě - filtrovat dle typu, JOIN na flavors pro získání parametrů
            let favQuery = supabaseClient
                .from('favorite_products')
                .select(`
                    *,
                    flavors:flavor_id (
                        min_percent,
                        max_percent,
                        recommended_percent,
                        steep_days,
                        vg_ratio,
                        manufacturer_code,
                        flavor_manufacturers (name)
                    )
                `)
                .eq('clerk_id', clerkId)
                .eq('product_type', 'flavor')
                .limit(limit);
            
            if (searchTerm && searchTerm.trim().length >= 2) {
                const term = searchTerm.trim();
                // Hledat v názvu NEBO výrobci
                favQuery = favQuery.or(`name.ilike.%${term}%,manufacturer.ilike.%${term}%`);
            }
            
            const { data: favData, error: favError } = await favQuery;
            
            if (favError) {
                console.error('searchFlavorsForAutocomplete: favorites error:', favError);
            }
            
            if (!favError && favData) {
                // Filtrovat na klientovi - zahrnout příchutě odpovídajícího typu NEBO bez typu
                results.favorites = favData
                    .filter(p => !p.flavor_product_type || p.flavor_product_type === productType)
                    .map(p => {
                        // Získat data z joinované flavors tabulky, fallback na data v favorite_products
                        const flavorData = p.flavors || {};
                        return {
                            id: p.id,
                            name: p.name,
                            manufacturer: p.manufacturer || flavorData.flavor_manufacturers?.name || flavorData.manufacturer_code || null,
                            manufacturer_code: flavorData.manufacturer_code || null,
                            product_type: p.flavor_product_type || productType,
                            category: p.flavor_category || null,
                            min_percent: flavorData.min_percent || null,
                            max_percent: flavorData.max_percent || null,
                            recommended_percent: flavorData.recommended_percent || null,
                            steep_days: p.steep_days || flavorData.steep_days || null,
                            vg_ratio: flavorData.vg_ratio,
                            source: 'favorites',
                            flavor_id: p.flavor_id
                        };
                    });
            }
        }
        
        // 2. Hledat ve veřejné databázi příchutí
        // Načíst více výsledků a filtrovat na klientovi kvůli hledání v názvu výrobce
        let dbQuery = supabaseClient
            .from('flavors')
            .select('*, flavor_manufacturers(name)')
            .eq('status', 'active')
            .eq('product_type', productType)
            .order('usage_count', { ascending: false })
            .limit(searchTerm && searchTerm.trim().length >= 2 ? 100 : limit);
        
        const { data: dbData, error: dbError } = await dbQuery;
        
        if (!dbError && dbData) {
            let filteredData = dbData;
            
            // Filtrovat na klientovi - case-insensitive hledání v názvu, kódu i jménu výrobce
            if (searchTerm && searchTerm.trim().length >= 2) {
                const term = searchTerm.trim().toLowerCase();
                filteredData = dbData.filter(f => {
                    const nameMatch = f.name?.toLowerCase().includes(term);
                    const codeMatch = f.manufacturer_code?.toLowerCase().includes(term);
                    const manufacturerMatch = f.flavor_manufacturers?.name?.toLowerCase().includes(term);
                    return nameMatch || codeMatch || manufacturerMatch;
                });
            }
            
            // Omezit na požadovaný limit
            results.database = filteredData.slice(0, limit).map(f => ({
                id: f.id,
                name: f.name,
                manufacturer: f.flavor_manufacturers?.name || f.manufacturer_code,
                manufacturer_code: f.manufacturer_code,
                product_type: f.product_type,
                category: f.category,
                min_percent: f.min_percent,
                max_percent: f.max_percent,
                recommended_percent: f.recommended_percent,
                steep_days: f.steep_days,
                avg_rating: f.avg_rating,
                vg_ratio: f.vg_ratio,
                source: 'database'
            }));
        }
        
        return results;
    } catch (err) {
        console.error('searchFlavorsForAutocomplete: Database error:', err);
        return { favorites: [], database: [] };
    }
}

// Uložit příchuť z databáze do oblíbených (nebo vrátit existující)
async function saveFlavorToFavorites(clerkId, flavorId) {
    if (!supabaseClient || !clerkId || !flavorId) {
        console.error('saveFlavorToFavorites: Missing required parameters');
        return { data: null, error: new Error('Missing required parameters') };
    }
    
    if (!isValidClerkId(clerkId) || !isValidUUID(flavorId)) {
        console.error('saveFlavorToFavorites: Invalid format');
        return { data: null, error: new Error('Invalid format') };
    }
    
    try {
        // Nejprve zkontrolovat, zda příchuť už není v oblíbených
        const { data: existingFavorite, error: checkError } = await supabaseClient
            .from('favorite_products')
            .select('*')
            .eq('clerk_id', clerkId)
            .eq('flavor_id', flavorId)
            .maybeSingle();
        
        if (checkError) {
            console.error('saveFlavorToFavorites: Error checking existing:', checkError);
        }
        
        // Pokud už existuje, vrátit existující
        if (existingFavorite) {
            console.log('saveFlavorToFavorites: Flavor already in favorites, returning existing');
            return { data: existingFavorite, error: null, alreadyExists: true };
        }
        
        // Získat data příchutě z veřejné databáze
        const flavor = await getFlavorById(flavorId);
        if (!flavor) {
            return { data: null, error: new Error('Flavor not found') };
        }
        
        // Vytvořit nový oblíbený produkt
        const shareId = generateShareId();
        const shareUrl = `${SHARE_BASE_URL}/?product=${shareId}`;
        const productCode = generateProductCode();
        
        const { data, error } = await supabaseClient
            .from('favorite_products')
            .insert({
                clerk_id: clerkId,
                name: flavor.name,
                product_type: 'flavor',
                flavor_id: flavorId,
                flavor_product_type: flavor.product_type,
                flavor_category: flavor.category,
                manufacturer: flavor.flavor_manufacturers?.name || flavor.manufacturer_code,
                steep_days: flavor.steep_days,
                rating: 0,
                share_id: shareId,
                share_url: shareUrl,
                product_code: productCode,
                created_at: new Date().toISOString()
            })
            .select()
            .single();
        
        if (error) {
            console.error('saveFlavorToFavorites: Supabase error:', error);
            return { data: null, error };
        }
        
        console.log('saveFlavorToFavorites: Flavor saved to favorites');
        return { data, error: null, alreadyExists: false };
    } catch (err) {
        console.error('saveFlavorToFavorites: Database error:', err);
        return { data: null, error: err };
    }
}

// Získat unikátní kategorie příchutí
async function getFlavorCategories() {
    if (!supabaseClient) {
        console.error('getFlavorCategories: Supabase not initialized');
        return [];
    }
    
    try {
        const { data, error } = await supabaseClient
            .from('flavors')
            .select('category')
            .eq('status', 'active');
        
        if (error) {
            console.error('getFlavorCategories: Supabase error:', error);
            return [];
        }
        
        // Získat unikátní kategorie
        const categories = [...new Set(data.map(f => f.category))].filter(Boolean).sort();
        return categories;
    } catch (err) {
        console.error('getFlavorCategories: Database error:', err);
        return [];
    }
}

// =============================================
// FCM TOKEN FUNCTIONS
// =============================================

// Uložit FCM token pro push notifikace
async function saveFcmToken(clerkId, token, deviceInfo) {
    if (!supabaseClient || !clerkId || !token) {
        console.error('saveFcmToken: Missing required parameters');
        return { data: null, error: new Error('Missing required parameters') };
    }
    
    if (!isValidClerkId(clerkId)) {
        console.error('saveFcmToken: Invalid clerk_id format');
        return { data: null, error: new Error('Invalid clerk_id format') };
    }
    
    try {
        const { data, error } = await supabaseClient
            .from('fcm_tokens')
            .upsert({
                clerk_id: clerkId,
                token: token,
                device_info: deviceInfo || {},
                updated_at: new Date().toISOString(),
                last_used_at: new Date().toISOString()
            }, { 
                onConflict: 'token'
            })
            .select()
            .single();
        
        if (error) {
            console.error('saveFcmToken: Supabase error:', error);
            return { data: null, error };
        }
        
        console.log('saveFcmToken: Token saved successfully');
        return { data, error: null };
    } catch (err) {
        console.error('saveFcmToken: Database error:', err);
        return { data: null, error: err };
    }
}

// Smazat FCM token (při odhlášení nebo zneplatnění)
async function deleteFcmToken(clerkId, token) {
    if (!supabaseClient || !clerkId || !token) {
        console.error('deleteFcmToken: Missing required parameters');
        return { error: new Error('Missing required parameters') };
    }
    
    if (!isValidClerkId(clerkId)) {
        console.error('deleteFcmToken: Invalid clerk_id format');
        return { error: new Error('Invalid clerk_id format') };
    }
    
    try {
        const { error } = await supabaseClient
            .from('fcm_tokens')
            .delete()
            .eq('clerk_id', clerkId)
            .eq('token', token);
        
        if (error) {
            console.error('deleteFcmToken: Supabase error:', error);
            return { error };
        }
        
        console.log('deleteFcmToken: Token deleted successfully');
        return { error: null };
    } catch (err) {
        console.error('deleteFcmToken: Database error:', err);
        return { error: err };
    }
}

// Získat všechny FCM tokeny uživatele
async function getFcmTokens(clerkId) {
    if (!supabaseClient || !clerkId) return [];
    
    if (!isValidClerkId(clerkId)) {
        console.error('getFcmTokens: Invalid clerk_id format');
        return [];
    }
    
    try {
        const { data, error } = await supabaseClient
            .from('fcm_tokens')
            .select('*')
            .eq('clerk_id', clerkId);
        
        if (error) {
            console.error('getFcmTokens: Supabase error:', error);
            return [];
        }
        
        return data || [];
    } catch (err) {
        console.error('getFcmTokens: Database error:', err);
        return [];
    }
}

// =====================================================
// SEKCE 10: PROPOJENÍ PŘÍCHUTÍ S RECEPTY
// =====================================================

// Propojit příchutě s receptem
// flavors = array of { flavor_id?, favorite_product_id?, generic_flavor_type?, percentage, position, flavor_name?, flavor_manufacturer? }
// Při ukládání konkrétní příchutě (flavor_id) ji automaticky přidá do oblíbených uživatele
async function linkFlavorsToRecipe(clerkId, recipeId, flavors) {
    if (!supabaseClient || !clerkId || !recipeId) return false;
    
    if (!isValidClerkId(clerkId)) {
        console.error('linkFlavorsToRecipe: Invalid clerk_id format');
        return false;
    }
    if (!isValidUUID(recipeId)) {
        console.error('linkFlavorsToRecipe: Invalid recipe ID format');
        return false;
    }
    
    try {
        // Smazat existující propojení
        const { error: deleteError } = await supabaseClient
            .from('recipe_flavors')
            .delete()
            .eq('recipe_id', recipeId);
        
        if (deleteError) {
            console.error('linkFlavorsToRecipe: Error deleting existing links:', deleteError);
        }
        
        // Pokud nejsou žádné příchutě, končíme
        if (!flavors || flavors.length === 0) {
            console.log('linkFlavorsToRecipe: No flavors to link');
            return true;
        }
        
        // Zpracovat příchutě - pokud je flavor_id (z veřejné DB), uložit do oblíbených
        const links = [];
        
        for (let i = 0; i < flavors.length; i++) {
            const f = flavors[i];
            const link = {
                recipe_id: recipeId,
                flavor_id: null,
                favorite_product_id: null,
                generic_flavor_type: f.generic_flavor_type || null,
                percentage: f.percentage || 0,
                position: f.position || (i + 1),
                flavor_name: f.flavor_name || null,
                flavor_manufacturer: f.flavor_manufacturer || null
            };
            
            // Pokud má flavor_id (příchuť z veřejné databáze), uložit do oblíbených
            if (f.flavor_id && isValidUUID(f.flavor_id)) {
                console.log('linkFlavorsToRecipe: Saving flavor to favorites:', f.flavor_id);
                const saveResult = await saveFlavorToFavorites(clerkId, f.flavor_id);
                
                if (saveResult.data) {
                    // Propojit přes oblíbený produkt
                    link.favorite_product_id = saveResult.data.id;
                    link.flavor_id = f.flavor_id; // Zachovat i odkaz na veřejnou DB
                    console.log('linkFlavorsToRecipe: Flavor linked via favorite_product_id:', saveResult.data.id, 
                        saveResult.alreadyExists ? '(already existed)' : '(newly created)');
                } else {
                    // Pokud se nepodařilo uložit, propojit přímo na veřejnou DB
                    link.flavor_id = f.flavor_id;
                    console.log('linkFlavorsToRecipe: Flavor linked directly via flavor_id');
                }
            } 
            // Pokud už má favorite_product_id (z oblíbených)
            else if (f.favorite_product_id && isValidUUID(f.favorite_product_id)) {
                link.favorite_product_id = f.favorite_product_id;
            }
            
            links.push(link);
        }
        
        console.log('linkFlavorsToRecipe: Inserting links:', links.length);
        
        const { error } = await supabaseClient
            .from('recipe_flavors')
            .insert(links);
        
        if (error) {
            console.error('linkFlavorsToRecipe: Error inserting:', error);
            return false;
        }
        
        console.log('linkFlavorsToRecipe: Successfully linked', links.length, 'flavors');
        return true;
    } catch (err) {
        console.error('linkFlavorsToRecipe: Database error:', err);
        return false;
    }
}

// Získat příchutě propojené s receptem
async function getLinkedFlavors(recipeId) {
    if (!supabaseClient || !recipeId) return [];
    
    if (!isValidUUID(recipeId)) {
        console.error('getLinkedFlavors: Invalid recipe ID format');
        return [];
    }
    
    try {
        const { data, error } = await supabaseClient
            .from('recipe_flavors')
            .select(`
                *,
                flavors:flavor_id (
                    id,
                    name,
                    manufacturer_code,
                    category,
                    min_percent,
                    max_percent,
                    recommended_percent,
                    steep_days,
                    vg_ratio,
                    flavor_manufacturers (name)
                ),
                favorite_products:favorite_product_id (
                    id,
                    name,
                    manufacturer,
                    flavor_category,
                    steep_days,
                    flavor_id,
                    flavors:flavor_id (
                        min_percent,
                        max_percent,
                        recommended_percent,
                        steep_days,
                        vg_ratio,
                        flavor_manufacturers (name)
                    )
                )
            `)
            .eq('recipe_id', recipeId)
            .order('position', { ascending: true });
        
        if (error) {
            console.error('getLinkedFlavors: Supabase error:', error);
            return [];
        }
        
        // Transformovat data pro snadnější použití
        return (data || []).map(item => {
            // Získat parametry příchutě - prioritně z flavors, pak z favorite_products.flavors
            let flavorParams = null;
            
            if (item.flavors) {
                // Přímý odkaz na veřejnou DB příchutí
                flavorParams = {
                    id: item.flavors.id,
                    name: item.flavors.name,
                    manufacturer_code: item.flavors.manufacturer_code,
                    manufacturer_name: item.flavors.flavor_manufacturers?.name,
                    category: item.flavors.category,
                    min_percent: item.flavors.min_percent,
                    max_percent: item.flavors.max_percent,
                    recommended_percent: item.flavors.recommended_percent,
                    steep_days: item.flavors.steep_days,
                    vg_ratio: item.flavors.vg_ratio
                };
            } else if (item.favorite_products) {
                // Odkaz přes oblíbené produkty - získat parametry z vnořené flavors relace
                const favFlavorData = item.favorite_products.flavors;
                flavorParams = {
                    id: item.favorite_products.flavor_id,
                    name: item.favorite_products.name,
                    manufacturer_name: item.favorite_products.manufacturer || favFlavorData?.flavor_manufacturers?.name,
                    category: item.favorite_products.flavor_category,
                    min_percent: favFlavorData?.min_percent,
                    max_percent: favFlavorData?.max_percent,
                    recommended_percent: favFlavorData?.recommended_percent,
                    steep_days: item.favorite_products.steep_days || favFlavorData?.steep_days,
                    vg_ratio: favFlavorData?.vg_ratio
                };
            }
            
            return {
                id: item.id,
                position: item.position,
                percentage: item.percentage,
                flavor_name: item.flavor_name,
                flavor_manufacturer: item.flavor_manufacturer,
                generic_flavor_type: item.generic_flavor_type,
                flavor_id: item.flavor_id,
                favorite_product_id: item.favorite_product_id,
                // Konsolidovaná data příchutě
                flavor: flavorParams
            };
        });
    } catch (err) {
        console.error('getLinkedFlavors: Database error:', err);
        return [];
    }
}

// Exportuj funkce pro použití v app.js
console.log('database.js: Exporting LiquiMixerDB...');
window.LiquiMixerDB = {
    init: initSupabase,
    saveUser: saveUserToDatabase,
    getUser: getUserFromDatabase,
    saveTermsAcceptance: saveTermsAcceptance,
    savePreferences: saveUserPreferences,
    saveUserLocale: saveUserLocale,
    getUserLocale: getUserLocale,
    saveRecipe: saveUserRecipe,
    updateRecipe: updateUserRecipe,
    getRecipes: getUserRecipes,
    getRecipeById: getRecipeById,
    getRecipeByShareId: getRecipeByShareId,
    deleteRecipe: deleteUserRecipe,
    // Oblíbené produkty
    saveProduct: saveFavoriteProduct,
    updateProduct: updateFavoriteProduct,
    updateProductStock: updateProductStock,
    getProducts: getFavoriteProducts,
    getProductById: getFavoriteProductById,
    getProductByShareId: getProductByShareId,
    getProductByCode: getProductByCode,
    deleteProduct: deleteFavoriteProduct,
    uploadProductImage: uploadProductImage,
    // Propojení produktů s recepty
    linkProductsToRecipe: linkProductsToRecipe,
    getLinkedProducts: getLinkedProducts,
    getLinkedProductsByRecipeId: getLinkedProductsByRecipeId,
    getRecipesByProductId: getRecipesByProductId,
    getProductByIdPublic: getProductByIdPublic,
    copyProductToUser: copyProductToUser,
    // Připomínky
    saveReminder: saveReminder,
    getRecipeReminders: getRecipeReminders,
    getUserReminders: getUserReminders,
    updateReminder: updateReminder,
    deleteReminder: deleteReminder,
    cancelReminder: cancelReminder,
    // Stock tracking
    getReminderById: getReminderById,
    updateReminderStock: updateReminderStock,
    markReminderConsumed: markReminderConsumed,
    // Veřejné recepty
    getPublicRecipes: getPublicRecipes,
    getPublicRecipeById: getPublicRecipeById,
    addRecipeRating: addRecipeRating,
    getUserRatingForRecipe: getUserRatingForRecipe,
    updateRecipeRatingAvg: updateRecipeRatingAvg,
    // FCM tokeny
    saveFcmToken: saveFcmToken,
    deleteFcmToken: deleteFcmToken,
    getFcmTokens: getFcmTokens,
    onSignIn: onClerkSignIn,
    // Databáze příchutí
    getFlavorManufacturers: getFlavorManufacturers,
    searchFlavors: searchFlavors,
    getFlavorById: getFlavorById,
    addFlavorRating: addFlavorRating,
    getUserFlavorRating: getUserFlavorRating,
    submitFlavorSuggestion: submitFlavorSuggestion,
    getUserSuggestionCount: getUserSuggestionCount,
    searchFlavorsForAutocomplete: searchFlavorsForAutocomplete,
    saveFlavorToFavorites: saveFlavorToFavorites,
    getFlavorCategories: getFlavorCategories,
    // Propojení příchutí s recepty
    linkFlavorsToRecipe: linkFlavorsToRecipe,
    getLinkedFlavors: getLinkedFlavors
};

// Export pro fcm.js a app.js kompatibilitu
window.database = {
    saveFcmToken: saveFcmToken,
    deleteFcmToken: deleteFcmToken,
    // Stock tracking
    getReminderById: getReminderById,
    updateReminderStock: updateReminderStock,
    markReminderConsumed: markReminderConsumed,
    // Veřejné recepty
    getPublicRecipes: getPublicRecipes,
    getPublicRecipeById: getPublicRecipeById,
    addRecipeRating: addRecipeRating,
    getUserRatingForRecipe: getUserRatingForRecipe
};

console.log('database.js: LiquiMixerDB exported successfully!', !!window.LiquiMixerDB);
