// ============================================
// SUBSCRIPTION & PAYMENT MANAGEMENT
// Předplatné a platby přes Supabase Edge Functions
// ============================================

// Supabase Edge Functions endpointy
const EDGE_FUNCTIONS = {
    billing: '/functions/v1/billing',
    subscription: '/functions/v1/subscription',
    payment: '/functions/v1/payment'
};

// Získat base URL pro Edge Functions
function getEdgeFunctionUrl(endpoint) {
    const supabaseUrl = window.supabase?.supabaseUrl || 'https://krwdfxnvhnxtkhtkbadi.supabase.co';
    return `${supabaseUrl}${endpoint}`;
}

// Získat autorizační token
async function getAuthToken() {
    if (window.Clerk && window.Clerk.session) {
        return await window.Clerk.session.getToken();
    }
    return null;
}

// ============================================
// SUBSCRIPTION FUNCTIONS (via Edge Functions)
// ============================================

// Zkontrolovat platnost předplatného
async function checkSubscription() {
    if (!window.Clerk || !window.Clerk.user) {
        return { valid: false, reason: 'not_logged_in' };
    }
    
    try {
        const token = await getAuthToken();
        if (!token) {
            return { valid: false, reason: 'no_token' };
        }
        
        const response = await fetch(getEdgeFunctionUrl(EDGE_FUNCTIONS.subscription), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ action: 'check' })
        });
        
        const result = await response.json();
        
        if (result.error) {
            console.error('Subscription check error:', result.error);
            return { valid: false, reason: 'error' };
        }
        
        return result;
    } catch (err) {
        console.error('Error checking subscription:', err);
        return { valid: false, reason: 'error' };
    }
}

// Získat aktuální ceník
async function getPricing(locale = 'cs') {
    try {
        const { data, error } = await window.supabase
            .from('pricing')
            .select('*')
            .eq('is_active', true)
            .eq('locale', locale);
        
        if (error) {
            console.error('Error fetching pricing:', error);
            return [];
        }
        
        return data || [];
    } catch (err) {
        console.error('Error fetching pricing:', err);
        return [];
    }
}

// Vytvořit nové předplatné (před platbou) - přes Edge Function
async function createSubscription(planType = 'yearly') {
    if (!window.Clerk || !window.Clerk.user) {
        throw new Error('Uživatel není přihlášen');
    }
    
    try {
        const token = await getAuthToken();
        if (!token) {
            throw new Error('Nepodařilo se získat autorizační token');
        }
        
        const response = await fetch(getEdgeFunctionUrl(EDGE_FUNCTIONS.subscription), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ 
                action: 'create', 
                data: { planType, locale: 'cs' } 
            })
        });
        
        const result = await response.json();
        
        if (!response.ok || result.error) {
            throw new Error(result.error || 'Chyba při vytváření předplatného');
        }
        
        return result.subscription;
    } catch (err) {
        console.error('Error creating subscription:', err);
        throw err;
    }
}

// Aktivovat předplatné po úspěšné platbě - přes Edge Function
// Poznámka: Aktivace probíhá automaticky přes payment callback
async function activateSubscription(subscriptionId, paymentData) {
    if (!window.Clerk || !window.Clerk.user) {
        throw new Error('Uživatel není přihlášen');
    }
    
    try {
        const token = await getAuthToken();
        if (!token) {
            throw new Error('Nepodařilo se získat autorizační token');
        }
        
        const response = await fetch(getEdgeFunctionUrl(EDGE_FUNCTIONS.subscription), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ 
                action: 'activate', 
                data: { subscriptionId, paymentData } 
            })
        });
        
        const result = await response.json();
        
        if (!response.ok || result.error) {
            throw new Error(result.error || 'Chyba při aktivaci předplatného');
        }
        
        return result.subscription;
    } catch (err) {
        console.error('Error activating subscription:', err);
        throw err;
    }
}

// ============================================
// BILLING FUNCTIONS (via Edge Functions - SECURE)
// ============================================

// Uložit fakturační údaje uživatele (přes Edge Function)
async function saveBillingInfo(billingData) {
    if (!window.Clerk || !window.Clerk.user) {
        throw new Error('Uživatel není přihlášen');
    }
    
    try {
        const token = await getAuthToken();
        if (!token) {
            throw new Error('Nepodařilo se získat autorizační token');
        }
        
        const response = await fetch(getEdgeFunctionUrl(EDGE_FUNCTIONS.billing), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ 
                action: 'save', 
                data: billingData 
            })
        });
        
        const result = await response.json();
        
        if (!response.ok || result.error) {
            throw new Error(result.error || 'Chyba při ukládání');
        }
        
        return result.data;
    } catch (err) {
        console.error('Error saving billing info:', err);
        throw err;
    }
}

// Získat fakturační údaje uživatele (přes Edge Function)
async function getBillingInfo() {
    if (!window.Clerk || !window.Clerk.user) {
        return null;
    }
    
    try {
        const token = await getAuthToken();
        if (!token) {
            return null;
        }
        
        const response = await fetch(getEdgeFunctionUrl(EDGE_FUNCTIONS.billing), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ action: 'get' })
        });
        
        const result = await response.json();
        
        if (!response.ok || result.error) {
            console.error('Error fetching billing info:', result.error);
            return null;
        }
        
        return result.data;
    } catch (err) {
        console.error('Error fetching billing info:', err);
        return null;
    }
}

// ============================================
// INVOICE FUNCTIONS
// ============================================

// Vytvořit fakturu
async function createInvoice(subscription) {
    if (!window.Clerk || !window.Clerk.user) {
        throw new Error('Uživatel není přihlášen');
    }
    
    const billingInfo = await getBillingInfo();
    const now = new Date();
    
    // Generovat číslo faktury
    const { data: invoiceNumber } = await window.supabase.rpc('generate_invoice_number');
    
    const invoiceData = {
        clerk_id: window.Clerk.user.id,
        subscription_id: subscription.id,
        invoice_number: invoiceNumber || `${now.getFullYear()}-${Date.now()}`,
        document_type: 'invoice',
        issue_date: now.toISOString().split('T')[0],
        taxable_supply_date: now.toISOString().split('T')[0],
        due_date: now.toISOString().split('T')[0], // Již zaplaceno
        
        // Dodavatel - DOPLŇTE ÚDAJE FIRMY WOOs
        supplier_name: 'WOOs s.r.o.',
        supplier_street: '',
        supplier_city: '',
        supplier_zip: '',
        supplier_country: 'CZ',
        supplier_ico: '',
        supplier_dic: '',
        supplier_bank_account: '',
        supplier_bank_name: '',
        
        // Odběratel
        customer_type: billingInfo?.billing_type || 'person',
        customer_name: billingInfo?.billing_name || window.Clerk.user.fullName || '',
        customer_company: billingInfo?.billing_company,
        customer_street: billingInfo?.billing_street,
        customer_city: billingInfo?.billing_city,
        customer_zip: billingInfo?.billing_zip,
        customer_country: billingInfo?.billing_country || 'CZ',
        customer_ico: billingInfo?.billing_ico,
        customer_dic: billingInfo?.billing_dic,
        customer_email: window.Clerk.user.emailAddresses[0]?.emailAddress,
        customer_phone: billingInfo?.phone,
        
        // Položky
        items: JSON.stringify([{
            description: 'Roční předplatné LiquiMixer',
            quantity: 1,
            unit: 'ks',
            unit_price: subscription.amount,
            vat_rate: subscription.vat_rate,
            vat_amount: subscription.vat_amount,
            total_without_vat: subscription.amount,
            total_with_vat: subscription.total_amount
        }]),
        
        // Částky
        subtotal: subscription.amount,
        vat_amount: subscription.vat_amount,
        total: subscription.total_amount,
        currency: subscription.currency,
        
        // Stav
        status: 'paid',
        paid_at: now.toISOString(),
        payment_method: subscription.payment_method,
        payment_reference: subscription.payment_id,
        
        locale: 'cs'
    };
    
    try {
        const { data, error } = await window.supabase
            .from('invoices')
            .insert(invoiceData)
            .select()
            .single();
        
        if (error) throw error;
        return data;
    } catch (err) {
        console.error('Error creating invoice:', err);
        throw err;
    }
}

// Získat faktury uživatele
async function getUserInvoices() {
    if (!window.Clerk || !window.Clerk.user) {
        return [];
    }
    
    try {
        const { data, error } = await window.supabase
            .from('invoices')
            .select('*')
            .eq('clerk_id', window.Clerk.user.id)
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        return data || [];
    } catch (err) {
        console.error('Error fetching invoices:', err);
        return [];
    }
}

// ============================================
// COMGATE PAYMENT INTEGRATION (via Edge Functions)
// ============================================

// Inicializovat platbu přes Comgate - BEZPEČNĚ přes Edge Function
async function initiatePayment(subscriptionId) {
    if (!window.Clerk || !window.Clerk.user) {
        throw new Error('Uživatel není přihlášen');
    }
    
    try {
        const token = await getAuthToken();
        if (!token) {
            throw new Error('Nepodařilo se získat autorizační token');
        }
        
        const response = await fetch(getEdgeFunctionUrl(EDGE_FUNCTIONS.payment), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ 
                action: 'create', 
                data: { subscriptionId } 
            })
        });
        
        const result = await response.json();
        
        if (!response.ok || result.error) {
            throw new Error(result.error || 'Chyba při vytváření platby');
        }
        
        // Přesměrovat na platební bránu
        if (result.redirectUrl) {
            window.location.href = result.redirectUrl;
        }
        
        return result;
    } catch (err) {
        console.error('Error initiating payment:', err);
        throw err;
    }
}

// Ověřit stav platby (polling po návratu z platební brány)
async function verifyPaymentStatus(subscriptionId) {
    if (!window.Clerk || !window.Clerk.user) {
        return { isPaid: false };
    }
    
    try {
        const token = await getAuthToken();
        if (!token) {
            return { isPaid: false };
        }
        
        const response = await fetch(getEdgeFunctionUrl(EDGE_FUNCTIONS.payment), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ 
                action: 'verify', 
                data: { subscriptionId } 
            })
        });
        
        const result = await response.json();
        return result;
    } catch (err) {
        console.error('Error verifying payment:', err);
        return { isPaid: false };
    }
}

// Obnovit předplatné
async function renewSubscription() {
    if (!window.Clerk || !window.Clerk.user) {
        throw new Error('Uživatel není přihlášen');
    }
    
    try {
        const token = await getAuthToken();
        if (!token) {
            throw new Error('Nepodařilo se získat autorizační token');
        }
        
        const response = await fetch(getEdgeFunctionUrl(EDGE_FUNCTIONS.subscription), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ action: 'renew', data: {} })
        });
        
        const result = await response.json();
        
        if (!response.ok || result.error) {
            throw new Error(result.error || 'Chyba při obnově předplatného');
        }
        
        return result;
    } catch (err) {
        console.error('Error renewing subscription:', err);
        throw err;
    }
}

// Nastavit automatické obnovení
async function setAutoRenewal(enabled) {
    if (!window.Clerk || !window.Clerk.user) {
        throw new Error('Uživatel není přihlášen');
    }
    
    try {
        const token = await getAuthToken();
        if (!token) {
            throw new Error('Nepodařilo se získat autorizační token');
        }
        
        const response = await fetch(getEdgeFunctionUrl(EDGE_FUNCTIONS.subscription), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ 
                action: 'setAutoRenew', 
                data: { enabled } 
            })
        });
        
        const result = await response.json();
        
        if (!response.ok || result.error) {
            throw new Error(result.error || 'Chyba při nastavení');
        }
        
        return result;
    } catch (err) {
        console.error('Error setting auto renewal:', err);
        throw err;
    }
}

// Pomocná funkce - získat předplatné podle ID
async function getSubscriptionById(subscriptionId) {
    try {
        const { data, error } = await window.supabase
            .from('subscriptions')
            .select('*')
            .eq('id', subscriptionId)
            .single();
        
        if (error) throw error;
        return data;
    } catch (err) {
        console.error('Error fetching subscription:', err);
        return null;
    }
}

// ============================================
// UI HELPER FUNCTIONS
// ============================================

// Zobrazit stav předplatného
async function displaySubscriptionStatus() {
    const status = await checkSubscription();
    
    if (status.valid) {
        const expiresDate = new Date(status.expiresAt);
        const formattedDate = expiresDate.toLocaleDateString('cs-CZ', {
            day: '2-digit',
            month: '2-digit', 
            year: 'numeric'
        });
        
        let statusClass = 'active';
        let statusMessage = `Aktivní do ${formattedDate}`;
        let renewalWarning = null;
        
        // Upozornění na blížící se expiraci
        if (status.needsRenewal) {
            statusClass = 'expiring';
            statusMessage = `Vyprší za ${status.daysLeft} dní (${formattedDate})`;
            renewalWarning = status.renewalMessage;
        }
        
        return {
            status: statusClass,
            message: statusMessage,
            daysLeft: status.daysLeft,
            expiresAt: status.expiresAt,
            formattedExpiresAt: formattedDate,
            needsRenewal: status.needsRenewal,
            renewalWarning: renewalWarning,
            subscription: status.subscription
        };
    } else {
        let reason = 'Nemáte aktivní předplatné';
        
        if (status.reason === 'expired') {
            const lastExpired = status.lastExpired 
                ? new Date(status.lastExpired).toLocaleDateString('cs-CZ')
                : null;
            reason = lastExpired 
                ? `Předplatné vypršelo ${lastExpired}` 
                : 'Předplatné vypršelo';
        } else if (status.reason === 'not_logged_in') {
            reason = 'Pro zobrazení se přihlaste';
        }
        
        return {
            status: 'inactive',
            message: reason,
            daysLeft: 0,
            expiresAt: null,
            formattedExpiresAt: null,
            needsRenewal: true,
            renewalWarning: null,
            subscription: null
        };
    }
}

// Zobrazit UI kartu předplatného
function renderSubscriptionCard(subscriptionStatus) {
    const { status, message, daysLeft, formattedExpiresAt, needsRenewal, renewalWarning } = subscriptionStatus;
    
    let statusColor = 'var(--neon-green)';
    let statusIcon = '✅';
    
    if (status === 'expiring') {
        statusColor = 'var(--neon-pink)';
        statusIcon = '⚠️';
    } else if (status === 'inactive') {
        statusColor = 'rgba(255, 255, 255, 0.5)';
        statusIcon = '❌';
    }
    
    let html = `
        <div class="subscription-card" style="border-color: ${statusColor};">
            <div class="subscription-header">
                <span class="subscription-icon">${statusIcon}</span>
                <h3>Předplatné LiquiMixer</h3>
            </div>
            <div class="subscription-status" style="color: ${statusColor};">
                ${message}
            </div>
    `;
    
    if (status === 'active' || status === 'expiring') {
        html += `
            <div class="subscription-details">
                <div class="subscription-row">
                    <span>Platné do:</span>
                    <strong>${formattedExpiresAt}</strong>
                </div>
                <div class="subscription-row">
                    <span>Zbývá dní:</span>
                    <strong>${daysLeft}</strong>
                </div>
            </div>
        `;
    }
    
    if (renewalWarning) {
        html += `
            <div class="subscription-warning">
                ⚠️ ${renewalWarning}
            </div>
        `;
    }
    
    if (needsRenewal || status === 'inactive') {
        html += `
            <button class="neon-button btn-green subscription-renew-btn" onclick="showRenewalModal()">
                <span>${status === 'inactive' ? '🛒 ZAKOUPIT' : '🔄 OBNOVIT'} PŘEDPLATNÉ</span>
            </button>
        `;
    }
    
    html += '</div>';
    
    return html;
}

// Formátovat cenu
function formatPrice(amount, currency = 'CZK') {
    return new Intl.NumberFormat('cs-CZ', {
        style: 'currency',
        currency: currency
    }).format(amount);
}

// ============================================
// EXPORT FUNCTIONS
// ============================================

window.LiquiMixerSubscription = {
    // Subscription
    check: checkSubscription,
    create: createSubscription,
    renew: renewSubscription,
    setAutoRenewal: setAutoRenewal,
    
    // Billing (secure via Edge Functions)
    saveBilling: saveBillingInfo,
    getBilling: getBillingInfo,
    
    // Payment (secure via Edge Functions)
    initiatePayment: initiatePayment,
    verifyPayment: verifyPaymentStatus,
    
    // Pricing & Invoices
    getPricing: getPricing,
    getInvoices: getUserInvoices,
    
    // UI Helpers
    displayStatus: displaySubscriptionStatus,
    renderCard: renderSubscriptionCard,
    formatPrice: formatPrice
};



