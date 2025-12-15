// ============================================
// SUPABASE DATABASE INTEGRATION
// Šifrovaná databáze uživatelů oddělená od aplikace
// ============================================

// Povolené domény pro přístup k databázi
const ALLOWED_DOMAINS = [
    'liquimixer.com',
    'www.liquimixer.com',
    'localhost',
    '127.0.0.1'
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

// Supabase klient
let supabase = null;

// Inicializace Supabase
function initSupabase() {
    // Kontrola domény před inicializací
    if (!isAllowedDomain()) {
        console.error('Database access denied: unauthorized domain');
        return false;
    }
    
    if (typeof window.supabase !== 'undefined') {
        supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        });
        // Expose client globally for other modules (i18n.js)
        window.supabaseClient = supabase;
        return true;
    }
    console.warn('Supabase SDK not loaded');
    return false;
}

// Nastavit Clerk JWT token pro Supabase (pro RLS)
async function setSupabaseAuth() {
    if (!supabase || typeof Clerk === 'undefined' || !Clerk.user) return false;
    
    try {
        // Získat JWT token z Clerk pro Supabase
        const token = await Clerk.session?.getToken({ template: 'supabase' });
        if (token) {
            // Nastavit token pro všechny následující požadavky
            supabase.realtime.setAuth(token);
            // Alternativně pro REST API
            supabase.rest.headers['Authorization'] = `Bearer ${token}`;
        }
        return true;
    } catch (err) {
        // Pokud Clerk nemá Supabase template, pokračujeme bez JWT
        return false;
    }
}

// ============================================
// UŽIVATELSKÉ FUNKCE
// ============================================

// Uložit nebo aktualizovat uživatele po přihlášení přes Clerk
async function saveUserToDatabase(clerkUser) {
    if (!supabase || !clerkUser) return null;
    
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
        const { data, error } = await supabase
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
    if (!supabase || !clerkId) return null;
    
    try {
        const { data, error } = await supabase
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

// Uložit uživatelská nastavení/preference
async function saveUserPreferences(clerkId, preferences) {
    if (!supabase || !clerkId) return null;
    
    try {
        const { data, error } = await supabase
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

// Generovat unikátní share ID
function generateShareId() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
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
    if (!supabase || !clerkId) return null;
    
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
        recipe_data: recipe.data, // JSONB - Supabase escapuje automaticky
        created_at: new Date().toISOString()
    };
    
    try {
        const { data, error } = await supabase
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
    if (!supabase || !clerkId) return null;
    
    // Validace clerk_id
    if (!isValidClerkId(clerkId)) {
        console.error('Invalid clerk_id format');
        return null;
    }
    
    try {
        const { data, error } = await supabase
            .from('recipes')
            .update({
                name: sanitizeInput(updates.name),
                description: sanitizeInput(updates.description),
                rating: Math.min(Math.max(parseInt(updates.rating) || 0, 0), 5),
                recipe_data: updates.data,
                updated_at: new Date().toISOString()
            })
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
    if (!supabase || !shareId) return null;
    
    // SECURITY: Validace formátu share_id
    if (!isValidShareId(shareId)) {
        console.error('Invalid share_id format');
        return null;
    }
    
    try {
        const { data, error } = await supabase
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
    if (!supabase) return null;
    
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
        const { data, error } = await supabase
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
    if (!supabase || !clerkId) return [];
    
    // SECURITY: Validace clerk_id
    if (!isValidClerkId(clerkId)) {
        console.error('Invalid clerk_id format');
        return [];
    }
    
    try {
        const { data, error } = await supabase
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
    if (!supabase || !clerkId) return false;
    
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
        const { error } = await supabase
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
    if (!supabase || !clerkId) return null;
    
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
    
    const productData = {
        clerk_id: clerkId,
        name: sanitizeInput(product.name) || 'Bez názvu',
        product_type: productType,
        description: sanitizeInput(product.description) || '',
        rating: Math.min(Math.max(parseInt(product.rating) || 0, 0), 5),
        image_url: product.image_url || '',
        product_url: sanitizeInput(product.product_url) || '',
        created_at: new Date().toISOString()
    };
    
    try {
        const { data, error } = await supabase
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
    if (!supabase || !clerkId) return null;
    
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
        const { data, error } = await supabase
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
    if (!supabase || !clerkId) return [];
    
    if (!isValidClerkId(clerkId)) {
        console.error('Invalid clerk_id format');
        return [];
    }
    
    try {
        const { data, error } = await supabase
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
    if (!supabase) return null;
    
    if (!isValidClerkId(clerkId)) {
        console.error('Invalid clerk_id format');
        return null;
    }
    if (!isValidUUID(productId)) {
        console.error('Invalid product ID format');
        return null;
    }
    
    try {
        const { data, error } = await supabase
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

// Smazat oblíbený produkt
async function deleteFavoriteProduct(clerkId, productId) {
    if (!supabase || !clerkId) return false;
    
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
        const { error } = await supabase
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

// Upload obrázku produktu do Supabase Storage
async function uploadProductImage(clerkId, file) {
    if (!supabase || !clerkId || !file) return null;
    
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
        const { data, error } = await supabase.storage
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
        const { data: urlData } = supabase.storage
            .from('product-images')
            .getPublicUrl(fileName);
        
        return urlData.publicUrl;
    } catch (err) {
        console.error('Upload error:', err);
        return null;
    }
}

// ============================================
// INTEGRACE S CLERK
// ============================================

// Volá se po úspěšném přihlášení přes Clerk
async function onClerkSignIn(clerkUser) {
    if (!clerkUser) return;
    
    // Inicializuj Supabase pokud ještě není
    if (!supabase) {
        initSupabase();
    }
    
    // Ulož uživatele do databáze
    await saveUserToDatabase(clerkUser);
}

// Exportuj funkce pro použití v app.js
window.LiquiMixerDB = {
    init: initSupabase,
    saveUser: saveUserToDatabase,
    getUser: getUserFromDatabase,
    savePreferences: saveUserPreferences,
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
    deleteProduct: deleteFavoriteProduct,
    uploadProductImage: uploadProductImage,
    onSignIn: onClerkSignIn
};


