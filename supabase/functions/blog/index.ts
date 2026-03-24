// ============================================
// EDGE FUNCTION: Blog Articles API
// Běží na ANALYTICS DB (ikgtygabrrvbqyffcqjd)
// NE na hlavní produkční DB
// ============================================
// 6-fázový workflow:
// proposal → topic_approved → draft → approved → translating → published
// ============================================

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const DOMAIN = 'https://www.liquimixer.com';

// Analytics DB — lokální klíče (tato edge funkce běží na analytics Supabase)
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const DASHBOARD_SECRET = Deno.env.get('DASHBOARD_BIGDATA_SECRET');
const N8N_BLOG_SECRET = Deno.env.get('N8N_BLOG_SECRET');
const N8N_BASE = 'https://tomaslapos.app.n8n.cloud/webhook';

const SUPPORTED_LOCALES = ['cs','sk','en','de','pl','fr','it','es','pt','nl','ja','ko','tr','uk','ru','sv','da','no','fi','el','ar-SA','zh-CN','zh-TW','hu','et','lv','lt','ro','hr','bg','sr'];

const OG_LOCALE_MAP: Record<string, string> = {
  'cs':'cs_CZ','sk':'sk_SK','en':'en_US','de':'de_DE','pl':'pl_PL',
  'fr':'fr_FR','it':'it_IT','es':'es_ES','pt':'pt_PT','nl':'nl_NL',
  'ja':'ja_JP','ko':'ko_KR','tr':'tr_TR','uk':'uk_UA','ru':'ru_RU',
  'sv':'sv_SE','da':'da_DK','no':'nb_NO','fi':'fi_FI','el':'el_GR',
  'ar-SA':'ar_SA','zh-CN':'zh_CN','zh-TW':'zh_TW','hu':'hu_HU',
  'et':'et_EE','lv':'lv_LV','lt':'lt_LT','ro':'ro_RO','hr':'hr_HR',
  'bg':'bg_BG','sr':'sr_RS'
};

// CORS — blog je veřejný pro GET, autorizovaný pro POST
function getCorsHeaders(origin: string | null): Record<string, string> {
  return {
    'Access-Control-Allow-Origin': origin || '*',
    'Access-Control-Allow-Headers': 'authorization, apikey, content-type, x-dashboard-secret',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
    'Access-Control-Max-Age': '86400',
    'Vary': 'Origin',
  };
}

function esc(s: string): string {
  return s.replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function escJson(s: string): string {
  return s.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n');
}

// Generate full SEO HTML page for a single article (for crawlers + direct access)
function generateArticleHTML(article: any): string {
  const locale = article.locale;
  const ogLocale = OG_LOCALE_MAP[locale] || 'en_US';
  const url = `${DOMAIN}/blog/${locale}/${article.slug}`;
  const dir = locale === 'ar-SA' ? ' dir="rtl"' : '';

  // Hreflang tags will be added by frontend if needed
  const hreflangTags = SUPPORTED_LOCALES.map(loc =>
    `    <link rel="alternate" hreflang="${loc}" href="${DOMAIN}/blog/${loc}/${article.slug}">`
  ).join('\n') + `\n    <link rel="alternate" hreflang="x-default" href="${DOMAIN}/blog/en/${article.slug}">`;

  const publishedDate = article.published_at ? new Date(article.published_at).toISOString() : new Date().toISOString();

  return `<!DOCTYPE html>
<html lang="${locale}"${dir}>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${esc(article.title)} | LiquiMixer Blog</title>
    <meta name="description" content="${esc(article.meta_description || '')}">
    <meta name="robots" content="index, follow">
    <meta name="keywords" content="${(article.keywords || []).join(', ')}">
    <meta property="og:title" content="${esc(article.title)}">
    <meta property="og:description" content="${esc(article.meta_description || '')}">
    <meta property="og:type" content="article">
    <meta property="og:url" content="${url}">
    <meta property="og:image" content="${article.og_image || DOMAIN + '/icons/icon-512x512.png'}">
    <meta property="og:site_name" content="LiquiMixer">
    <meta property="og:locale" content="${ogLocale}">
    <meta property="article:published_time" content="${publishedDate}">
    <meta property="article:author" content="${article.author || 'LiquiMixer'}">
    <meta property="article:section" content="${article.category}">
${hreflangTags}
    <link rel="canonical" href="${url}">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Exo+2:wght@300;400;600;700&display=swap" rel="stylesheet">
    <script type="application/ld+json">
    {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": "${escJson(article.title)}",
        "description": "${escJson(article.meta_description || '')}",
        "author": { "@type": "Organization", "name": "LiquiMixer", "url": "${DOMAIN}" },
        "publisher": { "@type": "Organization", "name": "LiquiMixer", "url": "${DOMAIN}", "logo": { "@type": "ImageObject", "url": "${DOMAIN}/icons/icon-512x512.png" } },
        "datePublished": "${publishedDate}",
        "mainEntityOfPage": { "@type": "WebPage", "@id": "${url}" },
        "inLanguage": "${locale}",
        "articleSection": "${article.category}"
    }
    </script>
    <link rel="stylesheet" href="/blog/blog.css">
</head>
<body>
<div class="neon-grid"></div>
<div class="blog-container">
    <nav class="blog-nav">
        <a href="/blog/" class="blog-home-link">← LiquiMixer Blog</a>
        <a href="/index.html" class="blog-app-link">Open Calculator</a>
    </nav>
    <article class="blog-article">
        <header class="blog-header">
            <span class="blog-category">${esc(article.category)}</span>
            <h1 class="blog-title">${esc(article.title)}</h1>
            <div class="blog-meta">
                <time datetime="${publishedDate}">${new Date(publishedDate).toLocaleDateString(locale === 'cs' ? 'cs-CZ' : locale === 'ar-SA' ? 'ar-SA' : locale, { year: 'numeric', month: 'long', day: 'numeric' })}</time>
                <span class="blog-author">${article.author || 'LiquiMixer'}</span>
            </div>
        </header>
        <div class="blog-content">
            ${article.content}
        </div>
        <footer class="blog-footer">
            <div class="blog-cta">
                <a href="/index.html" class="neon-button"><span>START MIXING</span></a>
                <p class="cta-note">Free. No registration. 5000+ flavors with auto-%.</p>
            </div>
        </footer>
    </article>
    <div class="blog-site-footer">
        <a href="/index.html">LiquiMixer — E-Liquid & Shisha Calculator</a>
        <p>&copy; 2025–2026 LiquiMixer.</p>
    </div>
</div>
</body>
</html>`;
}

// Ověření autorizace pro POST akce (N8N + Dashboard)
function verifyAuth(req: Request): boolean {
  const authHeader = req.headers.get('authorization');
  const apikeyHeader = req.headers.get('apikey');
  const dashSecret = req.headers.get('x-dashboard-secret');

  // Způsob 1: Authorization: Bearer <service_role_key>
  const token = authHeader?.replace('Bearer ', '').trim();
  const isServiceRole = token === SUPABASE_SERVICE_ROLE_KEY;

  // Způsob 2: apikey header = service_role_key
  const isApiKey = apikeyHeader === SUPABASE_SERVICE_ROLE_KEY;

  // Způsob 3: x-dashboard-secret (Dashboard)
  const isDashboard = !!(dashSecret && DASHBOARD_SECRET && dashSecret === DASHBOARD_SECRET);

  // Způsob 4: x-n8n-secret (N8N workflow)
  const n8nSecret = req.headers.get('x-n8n-secret');
  const isN8N = !!(n8nSecret && N8N_BLOG_SECRET && n8nSecret === N8N_BLOG_SECRET);

  // Debug log
  console.log('verifyAuth:', {
    hasAuth: !!authHeader,
    hasApikey: !!apikeyHeader,
    hasDashSecret: !!dashSecret,
    dashSecretLen: dashSecret?.length,
    envSecretLen: DASHBOARD_SECRET?.length,
    envSecretExists: !!DASHBOARD_SECRET,
    isServiceRole, isApiKey, isDashboard, isN8N,
  });

  return isServiceRole || isApiKey || isDashboard || isN8N;
}

serve(async (req) => {
  const origin = req.headers.get('origin');
  const corsHeaders = getCorsHeaders(origin);
  const json = (data: any, status = 200, extra: Record<string, string> = {}) =>
    new Response(JSON.stringify(data), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json', ...extra } });

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const action = url.searchParams.get('action');

    // Analytics DB — lokální klient (tato edge funkce běží na analytics Supabase)
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // ════════════════════════════════════════════
    // VEŘEJNÉ GET AKCE (bez autorizace)
    // ════════════════════════════════════════════

    // GET: Seznam publikovaných článků
    // /blog?action=list&locale=en&category=guide&limit=20&offset=0
    if (req.method === 'GET' && action === 'list') {
      const locale = url.searchParams.get('locale') || 'en';
      const category = url.searchParams.get('category');
      const limit = parseInt(url.searchParams.get('limit') || '20');
      const offset = parseInt(url.searchParams.get('offset') || '0');

      let query = supabase
        .from('blog_articles')
        .select('id, slug, locale, title, meta_description, excerpt, category, published_at, og_image, hero_image')
        .eq('status', 'published')
        .eq('locale', locale)
        .order('published_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (category) query = query.eq('category', category);
      const { data, error } = await query;
      if (error) throw error;

      return json({ articles: data || [] }, 200, { 'Cache-Control': 'public, max-age=300' });
    }

    // GET: Jeden článek (JSON nebo plné HTML pro crawlery)
    // /blog?action=get&slug=xxx&locale=en
    // /blog?action=get&slug=xxx&locale=en&format=html
    if (req.method === 'GET' && action === 'get') {
      const slug = url.searchParams.get('slug');
      const locale = url.searchParams.get('locale') || 'en';
      const format = url.searchParams.get('format') || 'json';

      if (!slug) return json({ error: 'Chybí parametr slug' }, 400);

      const { data, error } = await supabase
        .from('blog_articles')
        .select('*')
        .eq('slug', slug)
        .eq('locale', locale)
        .eq('status', 'published')
        .single();

      if (error || !data) {
        if (format === 'html') {
          return new Response('<html><body><h1>404 — Článek nenalezen</h1></body></html>', {
            status: 404, headers: { ...corsHeaders, 'Content-Type': 'text/html; charset=utf-8' },
          });
        }
        return json({ error: 'Článek nenalezen' }, 404);
      }

      if (format === 'html') {
        return new Response(generateArticleHTML(data), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400' },
        });
      }

      return json({ article: data }, 200, { 'Cache-Control': 'public, max-age=300' });
    }

    // GET: Sitemap (dynamický XML)
    // /blog?action=sitemap
    if (req.method === 'GET' && action === 'sitemap') {
      const { data, error } = await supabase
        .from('blog_articles')
        .select('slug, locale, published_at')
        .eq('status', 'published')
        .order('published_at', { ascending: false });

      if (error) throw error;

      const grouped: Record<string, any[]> = {};
      for (const a of (data || [])) {
        if (!grouped[a.slug]) grouped[a.slug] = [];
        grouped[a.slug].push(a);
      }

      let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n';
      for (const [slug, articles] of Object.entries(grouped)) {
        for (const a of articles) {
          xml += `  <url>\n    <loc>${DOMAIN}/blog/${a.locale}/${slug}</loc>\n`;
          if (a.published_at) xml += `    <lastmod>${new Date(a.published_at).toISOString().split('T')[0]}</lastmod>\n`;
          for (const alt of articles) {
            xml += `    <xhtml:link rel="alternate" hreflang="${alt.locale}" href="${DOMAIN}/blog/${alt.locale}/${slug}" />\n`;
          }
          xml += '  </url>\n';
        }
      }
      xml += '</urlset>';

      return new Response(xml, {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': 'public, max-age=3600' },
      });
    }

    // ════════════════════════════════════════════
    // CHRÁNĚNÉ POST AKCE (vyžadují autorizaci)
    // Používá N8N + LM Dashboard
    // ════════════════════════════════════════════
    if (req.method === 'POST') {
      if (!verifyAuth(req)) return json({ error: 'Neautorizováno' }, 401);
      const body = await req.json();

      // ── FÁZE 1: Vytvořit návrh tématu (N8N → GPT-4 analýza) ──
      // POST /blog?action=propose
      if (action === 'propose') {
        const { slug, topic_proposal, topic_reasoning, proposed_structure, target_keywords_en, target_keywords_cs, estimated_seo_impact, category } = body;

        if (!slug || !topic_proposal) return json({ error: 'Chybí: slug, topic_proposal' }, 400);

        const { data, error } = await supabase
          .from('blog_articles')
          .insert({
            slug,
            locale: 'cs',
            title: '',
            content: '',
            topic_proposal,
            topic_reasoning: topic_reasoning || '',
            proposed_structure: proposed_structure || null,
            target_keywords_en: target_keywords_en || [],
            target_keywords_cs: target_keywords_cs || [],
            estimated_seo_impact: estimated_seo_impact || 'medium',
            category: category || 'guide',
            status: 'proposal',
          })
          .select()
          .single();

        if (error) throw error;
        return json({ article: data }, 201);
      }

      // ── FÁZE 2: Schválit/zamítnout téma (Dashboard) ──
      // POST /blog?action=approve-topic
      if (action === 'approve-topic') {
        const { id, admin_notes } = body;
        if (!id) return json({ error: 'Chybí id' }, 400);

        const updates: any = { status: 'topic_approved' };
        if (admin_notes) updates.admin_notes = admin_notes;

        const { data, error } = await supabase
          .from('blog_articles')
          .update(updates)
          .eq('id', id)
          .eq('status', 'proposal')
          .select()
          .single();

        if (error) throw error;

        // Triggerovat WF9b — Blog Article Writer
        if (data) {
          fetch(`${N8N_BASE}/blog-write-article`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id: data.id,
              slug: data.slug,
              topic_proposal: data.topic_proposal,
              proposed_structure: data.proposed_structure,
              target_keywords_en: data.target_keywords_en,
              target_keywords_cs: data.target_keywords_cs,
              category: data.category,
              admin_notes: data.admin_notes || '',
            }),
          }).catch(err => console.error('WF9b webhook error:', err));
        }

        return json({ article: data });
      }

      // POST /blog?action=reject
      if (action === 'reject') {
        const { id, admin_notes } = body;
        if (!id) return json({ error: 'Chybí id' }, 400);

        const { data, error } = await supabase
          .from('blog_articles')
          .update({ status: 'rejected', admin_notes: admin_notes || '' })
          .eq('id', id)
          .in('status', ['proposal', 'draft'])
          .select()
          .single();

        if (error) throw error;
        return json({ article: data });
      }

      // POST /blog?action=add-note  (připomínkovat bez změny statusu)
      if (action === 'add-note') {
        const { id, admin_notes } = body;
        if (!id || !admin_notes) return json({ error: 'Chybí id nebo admin_notes' }, 400);

        const { data, error } = await supabase
          .from('blog_articles')
          .update({ admin_notes })
          .eq('id', id)
          .select()
          .single();

        if (error) throw error;
        return json({ article: data });
      }

      // ── FÁZE 3: Vytvořit/aktualizovat CZ článek (N8N → GPT-4) ──
      // POST /blog?action=write-draft
      if (action === 'write-draft') {
        const { id, title, content, meta_description, keywords, excerpt, hero_image, inline_images } = body;
        if (!id || !title || !content) return json({ error: 'Chybí: id, title, content' }, 400);

        const updates: any = {
          title,
          content,
          status: 'draft',
          meta_description: meta_description || '',
          keywords: keywords || [],
          excerpt: excerpt || '',
        };
        if (hero_image) updates.hero_image = hero_image;
        if (hero_image) updates.og_image = hero_image;
        if (inline_images) updates.inline_images = inline_images;

        const { data, error } = await supabase
          .from('blog_articles')
          .update(updates)
          .eq('id', id)
          .eq('status', 'topic_approved')
          .select()
          .single();

        if (error) throw error;
        return json({ article: data });
      }

      // ── FÁZE 4: Schválit článek (Dashboard) ──
      // POST /blog?action=approve
      if (action === 'approve') {
        const { id, admin_notes } = body;
        if (!id) return json({ error: 'Chybí id' }, 400);

        const updates: any = { status: 'approved' };
        if (admin_notes) updates.admin_notes = admin_notes;

        const { data, error } = await supabase
          .from('blog_articles')
          .update(updates)
          .eq('id', id)
          .eq('status', 'draft')
          .select()
          .single();

        if (error) throw error;

        // Triggerovat WF9c — Blog Translator & Publisher
        if (data) {
          fetch(`${N8N_BASE}/blog-translate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id: data.id,
              slug: data.slug,
              article_group: data.article_group || data.id,
              title: data.title,
              content: data.content,
              meta_description: data.meta_description,
              keywords: data.keywords,
              excerpt: data.excerpt,
              category: data.category,
              hero_image: data.hero_image,
              inline_images: data.inline_images,
            }),
          }).catch(err => console.error('WF9c webhook error:', err));
        }

        return json({ article: data });
      }

      // ── FÁZE 5: Vytvořit překlad (N8N → GPT-4, voláno 30× pro každý jazyk) ──
      // POST /blog?action=create-translation
      if (action === 'create-translation') {
        const { article_group, slug, locale, title, content, meta_description, keywords, excerpt, category, hero_image, inline_images } = body;

        if (!article_group || !slug || !locale || !title || !content) {
          return json({ error: 'Chybí: article_group, slug, locale, title, content' }, 400);
        }

        const { data, error } = await supabase
          .from('blog_articles')
          .insert({
            article_group,
            slug,
            locale,
            title,
            content,
            meta_description: meta_description || '',
            keywords: keywords || [],
            excerpt: excerpt || '',
            category: category || 'guide',
            hero_image: hero_image || null,
            og_image: hero_image || null,
            inline_images: inline_images || [],
            status: 'translating',
          })
          .select()
          .single();

        if (error) throw error;
        return json({ article: data }, 201);
      }

      // ── FÁZE 6: Publikovat všechny překlady najednou ──
      // POST /blog?action=publish
      if (action === 'publish') {
        const { article_group } = body;
        if (!article_group) return json({ error: 'Chybí article_group' }, 400);

        const { data, error } = await supabase
          .from('blog_articles')
          .update({ status: 'published' })
          .eq('article_group', article_group)
          .in('status', ['approved', 'translating'])
          .select();

        if (error) throw error;
        return json({ published: data?.length || 0, articles: data });
      }

      // ── OBECNÉ: Aktualizovat libovolné pole článku ──
      // POST /blog?action=update
      if (action === 'update') {
        const { id, ...updates } = body;
        if (!id) return json({ error: 'Chybí id' }, 400);

        const { data, error } = await supabase
          .from('blog_articles')
          .update(updates)
          .eq('id', id)
          .select()
          .single();

        if (error) throw error;
        return json({ article: data });
      }

      // ── DASHBOARD: Seznam všech článků (včetně draftů, proposalů) ──
      // POST /blog?action=list-all
      if (action === 'list-all') {
        const locale = body.locale || 'cs';
        const status = body.status;

        let query = supabase
          .from('blog_articles')
          .select('*')
          .eq('locale', locale)
          .order('created_at', { ascending: false });

        if (status) query = query.eq('status', status);

        const { data, error } = await query;
        if (error) throw error;
        return json({ articles: data || [] });
      }

      // ── DASHBOARD: Statistiky blogu ──
      // POST /blog?action=stats
      if (action === 'stats') {
        const { data, error } = await supabase
          .from('blog_articles')
          .select('status, locale');

        if (error) throw error;

        const stats: Record<string, number> = {};
        for (const a of (data || [])) {
          stats[a.status] = (stats[a.status] || 0) + 1;
        }
        const uniqueSlugs = new Set((data || []).filter(a => a.status === 'published').map(a => a.locale)).size;

        return json({ stats, total: data?.length || 0, published_languages: uniqueSlugs });
      }
    }

    return json({ error: 'Neplatná akce. Dostupné: list, get, sitemap, propose, approve-topic, reject, add-note, write-draft, approve, create-translation, publish, update, list-all, stats' }, 400);

  } catch (err) {
    console.error('Blog edge function error:', err);
    return new Response(JSON.stringify({ error: 'Interní chyba serveru', details: String(err) }), {
      status: 500,
      headers: { ...getCorsHeaders(origin), 'Content-Type': 'application/json' },
    });
  }
});
