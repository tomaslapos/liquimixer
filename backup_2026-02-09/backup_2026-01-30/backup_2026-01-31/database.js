// ============================================
// SUPABASE DATABASE INTEGRATION
// Šifrovaná databáze uživatelů oddělená od aplikace
// ============================================

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
        form_type: recipe.form_type || 'liquid', // Typ formuláře (liquid, shakevape, shortfill, liquidpro)
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

// Získat oblíbené produkty uživatele
async function getFavoriteProducts(clerkId) {
    if (!supabaseClient || !clerkId) return [];
    
    if (!isValidClerkId(clerkId)) {
        console.error('Invalid clerk_id format');
        return [];
    }
    
    try {
        const { data, error } = await supabaseClient
            .from('favorite_products')
            .select('*')
            .eq('clerk_id', clerkId)
            .order('created_at', { ascending: false })
            .limit(100);
        
        if (error) {
            console.error('Error fetching products:', error);
            return [];
        }
        
        return data || [];
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
            .select('*')
            .eq('id', productId)
            .eq('clerk_id', clerkId)
            .single();
        
        if (error) {
            console.error('Error fetching product:', error);
            return null;
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
            .select('id, name, description, is_public, public_rating_avg, public_rating_count, form_type, recipe_data, created_at', { count: 'exact' })
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
                onConflict: 'clerk_id,token'
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

// =============================================
// STOCK TRACKING FUNCTIONS (Reminder Stock)
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
            console.error('getReminderById: Supabase error:', error);
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
    
    // Validace stock_percent (0-100)
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
            console.error('updateReminderStock: Supabase error:', error);
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
            console.error('markReminderConsumed: Supabase error:', error);
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
            .select('id, name, description, is_public, public_rating_avg, public_rating_count, form_type, recipe_data, created_at, clerk_id', { count: 'exact' })
            .eq('is_public', true);
        
        // Filtr: Metoda přípravy
        if (filters.formType) {
            query = query.eq('form_type', filters.formType);
        }
        
        // Filtr: Hledání v názvu
        if (filters.search) {
            query = query.ilike('name', `%${filters.search}%`);
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
            console.error('getPublicRecipes: Supabase error:', error);
            return { recipes: [], total: 0, page, limit };
        }
        
        // Aplikovat filtry na JSONB data (client-side, protože Supabase JSONB queries jsou omezené)
        let filteredData = data || [];
        
        // Filtr: Typ příchutě
        if (filters.flavorType && filteredData.length > 0) {
            filteredData = filteredData.filter(r => {
                const rd = r.recipe_data;
                if (!rd) return false;
                // Check flavorType or flavors array
                if (rd.flavorType === filters.flavorType) return true;
                if (Array.isArray(rd.flavors)) {
                    return rd.flavors.some(f => f.type === filters.flavorType);
                }
                return false;
            });
        }
        
        // Filtr: VG rozsah
        if (filters.vgMin !== undefined && filters.vgMin !== '' && filteredData.length > 0) {
            const vgMin = parseInt(filters.vgMin);
            filteredData = filteredData.filter(r => {
                const vg = r.recipe_data?.vgRatio ?? r.recipe_data?.ratio ?? 50;
                return vg >= vgMin;
            });
        }
        if (filters.vgMax !== undefined && filters.vgMax !== '' && filteredData.length > 0) {
            const vgMax = parseInt(filters.vgMax);
            filteredData = filteredData.filter(r => {
                const vg = r.recipe_data?.vgRatio ?? r.recipe_data?.ratio ?? 50;
                return vg <= vgMax;
            });
        }
        
        // Filtr: Nikotin rozsah
        if (filters.nicMin !== undefined && filters.nicMin !== '' && filteredData.length > 0) {
            const nicMin = parseInt(filters.nicMin);
            filteredData = filteredData.filter(r => {
                const nic = r.recipe_data?.nicStrength ?? r.recipe_data?.nicotineStrength ?? 0;
                return nic >= nicMin;
            });
        }
        if (filters.nicMax !== undefined && filters.nicMax !== '' && filteredData.length > 0) {
            const nicMax = parseInt(filters.nicMax);
            filteredData = filteredData.filter(r => {
                const nic = r.recipe_data?.nicStrength ?? r.recipe_data?.nicotineStrength ?? 0;
                return nic <= nicMax;
            });
        }
        
        // Filtr: Obsahuje aditiva
        if (filters.hasAdditive && filteredData.length > 0) {
            filteredData = filteredData.filter(r => {
                const rd = r.recipe_data;
                if (!rd) return false;
                return rd.additive || rd.additives || rd.hasAdditive;
            });
        }
        
        return { 
            recipes: filteredData, 
            total: count || filteredData.length, 
            page, 
            limit 
        };
    } catch (err) {
        console.error('getPublicRecipes: Database error:', err);
        return { recipes: [], total: 0, page, limit };
    }
}

// Získat veřejný recept podle ID (pro detail)
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
            console.error('getPublicRecipeById: Supabase error:', error);
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
    
    // Validace rating (1-5)
    const validRating = Math.max(1, Math.min(5, parseInt(rating) || 1));
    
    // Rate limiting
    if (!rateLimiter.canProceed('addRating')) {
        console.error('Too many rating attempts. Please wait.');
        return null;
    }
    
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
            console.error('addRecipeRating: Supabase error:', error);
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
    
    if (!isValidClerkId(clerkId)) {
        return 0;
    }
    if (!isValidUUID(recipeId)) {
        return 0;
    }
    
    try {
        const { data, error } = await supabaseClient
            .from('recipe_ratings')
            .select('rating')
            .eq('recipe_id', recipeId)
            .eq('clerk_id', clerkId)
            .maybeSingle();
        
        if (error) {
            console.error('getUserRatingForRecipe: Supabase error:', error);
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
    if (!supabaseClient || !recipeId) return false;
    
    if (!isValidUUID(recipeId)) {
        console.error('updateRecipeRatingAvg: Invalid recipe ID format');
        return false;
    }
    
    try {
        // Získat všechna hodnocení
        const { data: ratings, error: fetchError } = await supabaseClient
            .from('recipe_ratings')
            .select('rating')
            .eq('recipe_id', recipeId);
        
        if (fetchError) {
            console.error('updateRecipeRatingAvg: Fetch error:', fetchError);
            return false;
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
            return false;
        }
        
        return true;
    } catch (err) {
        console.error('updateRecipeRatingAvg: Database error:', err);
        return false;
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
    onSignIn: onClerkSignIn
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
