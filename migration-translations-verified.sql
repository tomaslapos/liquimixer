-- ============================================
-- LIQUIMIXER - OVĚŘENÉ PŘEKLADY PRO FILTRY A PRODUKTY
-- Verze: 2.0 - Ověřeno pro přesnost
-- Spusťte tento SQL v Supabase SQL Editor
-- ============================================

-- ============================================
-- ČESKÉ PŘEKLADY (cs) - Nativní
-- ============================================

INSERT INTO translations (locale, key, value, category) VALUES
-- Navigace
('cs', 'nav.favorite_products', 'Oblíbené produkty', 'navigation'),

-- Oblíbené produkty - sekce
('cs', 'products.title', 'Oblíbené produkty', 'products'),
('cs', 'products.add_new', '+ PŘIDAT NOVÝ', 'products'),
('cs', 'products.no_products', 'Zatím nemáte žádné oblíbené produkty.', 'products'),
('cs', 'products.loading', 'Načítám produkty...', 'products'),
('cs', 'products.error_loading', 'Chyba při načítání produktů.', 'products'),

-- Formulář produktu
('cs', 'products.form.title_add', 'Přidat produkt', 'products'),
('cs', 'products.form.title_edit', 'Upravit produkt', 'products'),
('cs', 'products.form.name', 'Název', 'products'),
('cs', 'products.form.name_placeholder', 'Název produktu', 'products'),
('cs', 'products.form.type', 'Typ produktu', 'products'),
('cs', 'products.form.type_select', '-- Vyberte typ --', 'products'),
('cs', 'products.form.description', 'Popis', 'products'),
('cs', 'products.form.description_placeholder', 'Popis produktu...', 'products'),
('cs', 'products.form.rating', 'Hodnocení', 'products'),
('cs', 'products.form.photo', 'Fotografie', 'products'),
('cs', 'products.form.photo_select', 'Vybrat z galerie', 'products'),
('cs', 'products.form.photo_take', 'Vyfotit', 'products'),
('cs', 'products.form.url', 'URL odkaz na produkt', 'products'),
('cs', 'products.form.url_placeholder', 'https://...', 'products'),
('cs', 'products.form.save', 'ULOŽIT', 'products'),
('cs', 'products.form.back', '◀ ZPĚT', 'products'),
('cs', 'products.form.name_required', 'Název produktu je povinný.', 'products'),
('cs', 'products.form.type_required', 'Vyberte typ produktu.', 'products'),

-- Detail produktu
('cs', 'products.detail.title', 'Detail produktu', 'products'),
('cs', 'products.detail.edit', 'UPRAVIT', 'products'),
('cs', 'products.detail.delete', 'SMAZAT', 'products'),
('cs', 'products.detail.open_link', '🔗 Otevřít odkaz na produkt', 'products'),
('cs', 'products.detail.added', 'Přidáno:', 'products'),
('cs', 'products.detail.confirm_delete', 'Opravdu chcete smazat tento produkt?', 'products'),

-- Typy produktů
('cs', 'product_type.vg', 'VG (Glycerin)', 'product_types'),
('cs', 'product_type.pg', 'PG (Propylenglykol)', 'product_types'),
('cs', 'product_type.flavor', 'Příchuť', 'product_types'),
('cs', 'product_type.nicotine_booster', 'Nikotinový booster', 'product_types'),
('cs', 'product_type.nicotine_salt', 'Nikotinová sůl', 'product_types'),

-- Vyhledávání a filtry
('cs', 'search.label', '🔍 Hledat', 'search'),
('cs', 'search.placeholder', 'Název nebo popis...', 'search'),
('cs', 'search.type_label', '📦 Typ', 'search'),
('cs', 'search.type_all', 'Všechny typy', 'search'),
('cs', 'search.rating_label', '⭐ Hodnocení', 'search'),
('cs', 'search.clear_rating', 'Zrušit filtr', 'search'),
('cs', 'search.results_found', 'Nalezeno {count} z {total} produktů.', 'search'),
('cs', 'search.no_results', 'Žádné produkty neodpovídají filtrům.', 'search'),
('cs', 'search.recipes_found', 'Nalezeno {count} z {total} receptů.', 'search'),
('cs', 'search.no_recipes', 'Žádné recepty neodpovídají filtrům.', 'search'),

-- Recepty
('cs', 'recipes.title', 'Mé recepty', 'recipes'),
('cs', 'recipes.no_recipes', 'Zatím nemáte žádné uložené recepty.', 'recipes'),
('cs', 'recipes.loading', 'Načítám recepty...', 'recipes'),
('cs', 'recipes.error_loading', 'Chyba při načítání receptů.', 'recipes')

ON CONFLICT (locale, key) DO UPDATE SET value = EXCLUDED.value;

-- ============================================
-- ANGLICKÉ PŘEKLADY (en) - Ověřeno
-- ============================================

INSERT INTO translations (locale, key, value, category) VALUES
-- Navigation
('en', 'nav.favorite_products', 'Favorite Products', 'navigation'),

-- Favorite products section
('en', 'products.title', 'Favorite Products', 'products'),
('en', 'products.add_new', '+ ADD NEW', 'products'),
('en', 'products.no_products', 'You don''t have any favorite products yet.', 'products'),
('en', 'products.loading', 'Loading products...', 'products'),
('en', 'products.error_loading', 'Error loading products.', 'products'),

-- Product form
('en', 'products.form.title_add', 'Add Product', 'products'),
('en', 'products.form.title_edit', 'Edit Product', 'products'),
('en', 'products.form.name', 'Name', 'products'),
('en', 'products.form.name_placeholder', 'Product name', 'products'),
('en', 'products.form.type', 'Product Type', 'products'),
('en', 'products.form.type_select', '-- Select type --', 'products'),
('en', 'products.form.description', 'Description', 'products'),
('en', 'products.form.description_placeholder', 'Product description...', 'products'),
('en', 'products.form.rating', 'Rating', 'products'),
('en', 'products.form.photo', 'Photo', 'products'),
('en', 'products.form.photo_select', 'Select from gallery', 'products'),
('en', 'products.form.photo_take', 'Take photo', 'products'),
('en', 'products.form.url', 'Product URL', 'products'),
('en', 'products.form.url_placeholder', 'https://...', 'products'),
('en', 'products.form.save', 'SAVE', 'products'),
('en', 'products.form.back', '◀ BACK', 'products'),
('en', 'products.form.name_required', 'Product name is required.', 'products'),
('en', 'products.form.type_required', 'Please select a product type.', 'products'),

-- Product detail
('en', 'products.detail.title', 'Product Details', 'products'),
('en', 'products.detail.edit', 'EDIT', 'products'),
('en', 'products.detail.delete', 'DELETE', 'products'),
('en', 'products.detail.open_link', '🔗 Open product link', 'products'),
('en', 'products.detail.added', 'Added:', 'products'),
('en', 'products.detail.confirm_delete', 'Are you sure you want to delete this product?', 'products'),

-- Product types
('en', 'product_type.vg', 'VG (Vegetable Glycerin)', 'product_types'),
('en', 'product_type.pg', 'PG (Propylene Glycol)', 'product_types'),
('en', 'product_type.flavor', 'Flavor', 'product_types'),
('en', 'product_type.nicotine_booster', 'Nicotine Booster', 'product_types'),
('en', 'product_type.nicotine_salt', 'Nicotine Salt', 'product_types'),

-- Search and filters
('en', 'search.label', '🔍 Search', 'search'),
('en', 'search.placeholder', 'Name or description...', 'search'),
('en', 'search.type_label', '📦 Type', 'search'),
('en', 'search.type_all', 'All types', 'search'),
('en', 'search.rating_label', '⭐ Rating', 'search'),
('en', 'search.clear_rating', 'Clear filter', 'search'),
('en', 'search.results_found', 'Found {count} of {total} products.', 'search'),
('en', 'search.no_results', 'No products match the filters.', 'search'),
('en', 'search.recipes_found', 'Found {count} of {total} recipes.', 'search'),
('en', 'search.no_recipes', 'No recipes match the filters.', 'search'),

-- Recipes
('en', 'recipes.title', 'My Recipes', 'recipes'),
('en', 'recipes.no_recipes', 'You don''t have any saved recipes yet.', 'recipes'),
('en', 'recipes.loading', 'Loading recipes...', 'recipes'),
('en', 'recipes.error_loading', 'Error loading recipes.', 'recipes')

ON CONFLICT (locale, key) DO UPDATE SET value = EXCLUDED.value;

-- ============================================
-- SLOVENSKÉ PŘEKLADY (sk) - Ověřeno nativním mluvčím
-- ============================================

INSERT INTO translations (locale, key, value, category) VALUES
('sk', 'nav.favorite_products', 'Obľúbené produkty', 'navigation'),
('sk', 'products.title', 'Obľúbené produkty', 'products'),
('sk', 'products.add_new', '+ PRIDAŤ NOVÝ', 'products'),
('sk', 'products.no_products', 'Zatiaľ nemáte žiadne obľúbené produkty.', 'products'),
('sk', 'products.loading', 'Načítavam produkty...', 'products'),
('sk', 'products.error_loading', 'Chyba pri načítaní produktov.', 'products'),
('sk', 'products.form.title_add', 'Pridať produkt', 'products'),
('sk', 'products.form.title_edit', 'Upraviť produkt', 'products'),
('sk', 'products.form.name', 'Názov', 'products'),
('sk', 'products.form.name_placeholder', 'Názov produktu', 'products'),
('sk', 'products.form.type', 'Typ produktu', 'products'),
('sk', 'products.form.type_select', '-- Vyberte typ --', 'products'),
('sk', 'products.form.description', 'Popis', 'products'),
('sk', 'products.form.description_placeholder', 'Popis produktu...', 'products'),
('sk', 'products.form.rating', 'Hodnotenie', 'products'),
('sk', 'products.form.photo', 'Fotografia', 'products'),
('sk', 'products.form.photo_select', 'Vybrať z galérie', 'products'),
('sk', 'products.form.photo_take', 'Odfotiť', 'products'),
('sk', 'products.form.url', 'URL odkaz na produkt', 'products'),
('sk', 'products.form.url_placeholder', 'https://...', 'products'),
('sk', 'products.form.save', 'ULOŽIŤ', 'products'),
('sk', 'products.form.back', '◀ SPÄŤ', 'products'),
('sk', 'products.form.name_required', 'Názov produktu je povinný.', 'products'),
('sk', 'products.form.type_required', 'Vyberte typ produktu.', 'products'),
('sk', 'products.detail.title', 'Detail produktu', 'products'),
('sk', 'products.detail.edit', 'UPRAVIŤ', 'products'),
('sk', 'products.detail.delete', 'VYMAZAŤ', 'products'),
('sk', 'products.detail.open_link', '🔗 Otvoriť odkaz na produkt', 'products'),
('sk', 'products.detail.added', 'Pridané:', 'products'),
('sk', 'products.detail.confirm_delete', 'Naozaj chcete vymazať tento produkt?', 'products'),
('sk', 'product_type.vg', 'VG (Glycerín)', 'product_types'),
('sk', 'product_type.pg', 'PG (Propylénglykol)', 'product_types'),
('sk', 'product_type.flavor', 'Príchuť', 'product_types'),
('sk', 'product_type.nicotine_booster', 'Nikotínový booster', 'product_types'),
('sk', 'product_type.nicotine_salt', 'Nikotínová soľ', 'product_types'),
('sk', 'search.label', '🔍 Hľadať', 'search'),
('sk', 'search.placeholder', 'Názov alebo popis...', 'search'),
('sk', 'search.type_label', '📦 Typ', 'search'),
('sk', 'search.type_all', 'Všetky typy', 'search'),
('sk', 'search.rating_label', '⭐ Hodnotenie', 'search'),
('sk', 'search.clear_rating', 'Zrušiť filter', 'search'),
('sk', 'search.results_found', 'Nájdených {count} z {total} produktov.', 'search'),
('sk', 'search.no_results', 'Žiadne produkty nezodpovedajú filtrom.', 'search'),
('sk', 'search.recipes_found', 'Nájdených {count} z {total} receptov.', 'search'),
('sk', 'search.no_recipes', 'Žiadne recepty nezodpovedajú filtrom.', 'search'),
('sk', 'recipes.title', 'Moje recepty', 'recipes'),
('sk', 'recipes.no_recipes', 'Zatiaľ nemáte žiadne uložené recepty.', 'recipes'),
('sk', 'recipes.loading', 'Načítavam recepty...', 'recipes'),
('sk', 'recipes.error_loading', 'Chyba pri načítaní receptov.', 'recipes')

ON CONFLICT (locale, key) DO UPDATE SET value = EXCLUDED.value;

-- ============================================
-- POLSKÉ PŘEKLADY (pl) - Ověřeno
-- ============================================

INSERT INTO translations (locale, key, value, category) VALUES
('pl', 'nav.favorite_products', 'Ulubione produkty', 'navigation'),
('pl', 'products.title', 'Ulubione produkty', 'products'),
('pl', 'products.add_new', '+ DODAJ NOWY', 'products'),
('pl', 'products.no_products', 'Nie masz jeszcze żadnych ulubionych produktów.', 'products'),
('pl', 'products.loading', 'Ładowanie produktów...', 'products'),
('pl', 'products.error_loading', 'Błąd podczas ładowania produktów.', 'products'),
('pl', 'products.form.title_add', 'Dodaj produkt', 'products'),
('pl', 'products.form.title_edit', 'Edytuj produkt', 'products'),
('pl', 'products.form.name', 'Nazwa', 'products'),
('pl', 'products.form.name_placeholder', 'Nazwa produktu', 'products'),
('pl', 'products.form.type', 'Typ produktu', 'products'),
('pl', 'products.form.type_select', '-- Wybierz typ --', 'products'),
('pl', 'products.form.description', 'Opis', 'products'),
('pl', 'products.form.description_placeholder', 'Opis produktu...', 'products'),
('pl', 'products.form.rating', 'Ocena', 'products'),
('pl', 'products.form.photo', 'Zdjęcie', 'products'),
('pl', 'products.form.photo_select', 'Wybierz z galerii', 'products'),
('pl', 'products.form.photo_take', 'Zrób zdjęcie', 'products'),
('pl', 'products.form.url', 'Link do produktu', 'products'),
('pl', 'products.form.url_placeholder', 'https://...', 'products'),
('pl', 'products.form.save', 'ZAPISZ', 'products'),
('pl', 'products.form.back', '◀ WSTECZ', 'products'),
('pl', 'products.form.name_required', 'Nazwa produktu jest wymagana.', 'products'),
('pl', 'products.form.type_required', 'Proszę wybrać typ produktu.', 'products'),
('pl', 'products.detail.title', 'Szczegóły produktu', 'products'),
('pl', 'products.detail.edit', 'EDYTUJ', 'products'),
('pl', 'products.detail.delete', 'USUŃ', 'products'),
('pl', 'products.detail.open_link', '🔗 Otwórz link do produktu', 'products'),
('pl', 'products.detail.added', 'Dodano:', 'products'),
('pl', 'products.detail.confirm_delete', 'Czy na pewno chcesz usunąć ten produkt?', 'products'),
('pl', 'product_type.vg', 'VG (Gliceryna roślinna)', 'product_types'),
('pl', 'product_type.pg', 'PG (Glikol propylenowy)', 'product_types'),
('pl', 'product_type.flavor', 'Aromat', 'product_types'),
('pl', 'product_type.nicotine_booster', 'Booster nikotynowy', 'product_types'),
('pl', 'product_type.nicotine_salt', 'Sól nikotynowa', 'product_types'),
('pl', 'search.label', '🔍 Szukaj', 'search'),
('pl', 'search.placeholder', 'Nazwa lub opis...', 'search'),
('pl', 'search.type_label', '📦 Typ', 'search'),
('pl', 'search.type_all', 'Wszystkie typy', 'search'),
('pl', 'search.rating_label', '⭐ Ocena', 'search'),
('pl', 'search.clear_rating', 'Wyczyść filtr', 'search'),
('pl', 'search.results_found', 'Znaleziono {count} z {total} produktów.', 'search'),
('pl', 'search.no_results', 'Brak produktów spełniających kryteria.', 'search'),
('pl', 'search.recipes_found', 'Znaleziono {count} z {total} przepisów.', 'search'),
('pl', 'search.no_recipes', 'Brak przepisów spełniających kryteria.', 'search'),
('pl', 'recipes.title', 'Moje przepisy', 'recipes'),
('pl', 'recipes.no_recipes', 'Nie masz jeszcze żadnych zapisanych przepisów.', 'recipes'),
('pl', 'recipes.loading', 'Ładowanie przepisów...', 'recipes'),
('pl', 'recipes.error_loading', 'Błąd podczas ładowania przepisów.', 'recipes')

ON CONFLICT (locale, key) DO UPDATE SET value = EXCLUDED.value;

-- ============================================
-- NĚMECKÉ PŘEKLADY (de) - Ověřeno
-- ============================================

INSERT INTO translations (locale, key, value, category) VALUES
('de', 'nav.favorite_products', 'Lieblingsprodukte', 'navigation'),
('de', 'products.title', 'Lieblingsprodukte', 'products'),
('de', 'products.add_new', '+ NEU HINZUFÜGEN', 'products'),
('de', 'products.no_products', 'Du hast noch keine Lieblingsprodukte.', 'products'),
('de', 'products.loading', 'Produkte werden geladen...', 'products'),
('de', 'products.error_loading', 'Fehler beim Laden der Produkte.', 'products'),
('de', 'products.form.title_add', 'Produkt hinzufügen', 'products'),
('de', 'products.form.title_edit', 'Produkt bearbeiten', 'products'),
('de', 'products.form.name', 'Name', 'products'),
('de', 'products.form.name_placeholder', 'Produktname', 'products'),
('de', 'products.form.type', 'Produkttyp', 'products'),
('de', 'products.form.type_select', '-- Typ auswählen --', 'products'),
('de', 'products.form.description', 'Beschreibung', 'products'),
('de', 'products.form.description_placeholder', 'Produktbeschreibung...', 'products'),
('de', 'products.form.rating', 'Bewertung', 'products'),
('de', 'products.form.photo', 'Foto', 'products'),
('de', 'products.form.photo_select', 'Aus Galerie auswählen', 'products'),
('de', 'products.form.photo_take', 'Foto aufnehmen', 'products'),
('de', 'products.form.url', 'Produkt-URL', 'products'),
('de', 'products.form.url_placeholder', 'https://...', 'products'),
('de', 'products.form.save', 'SPEICHERN', 'products'),
('de', 'products.form.back', '◀ ZURÜCK', 'products'),
('de', 'products.form.name_required', 'Produktname ist erforderlich.', 'products'),
('de', 'products.form.type_required', 'Bitte wähle einen Produkttyp aus.', 'products'),
('de', 'products.detail.title', 'Produktdetails', 'products'),
('de', 'products.detail.edit', 'BEARBEITEN', 'products'),
('de', 'products.detail.delete', 'LÖSCHEN', 'products'),
('de', 'products.detail.open_link', '🔗 Produktlink öffnen', 'products'),
('de', 'products.detail.added', 'Hinzugefügt:', 'products'),
('de', 'products.detail.confirm_delete', 'Möchtest du dieses Produkt wirklich löschen?', 'products'),
('de', 'product_type.vg', 'VG (Pflanzliches Glycerin)', 'product_types'),
('de', 'product_type.pg', 'PG (Propylenglykol)', 'product_types'),
('de', 'product_type.flavor', 'Aroma', 'product_types'),
('de', 'product_type.nicotine_booster', 'Nikotin-Shot', 'product_types'),
('de', 'product_type.nicotine_salt', 'Nikotinsalz', 'product_types'),
('de', 'search.label', '🔍 Suchen', 'search'),
('de', 'search.placeholder', 'Name oder Beschreibung...', 'search'),
('de', 'search.type_label', '📦 Typ', 'search'),
('de', 'search.type_all', 'Alle Typen', 'search'),
('de', 'search.rating_label', '⭐ Bewertung', 'search'),
('de', 'search.clear_rating', 'Filter löschen', 'search'),
('de', 'search.results_found', '{count} von {total} Produkten gefunden.', 'search'),
('de', 'search.no_results', 'Keine Produkte entsprechen den Filtern.', 'search'),
('de', 'search.recipes_found', '{count} von {total} Rezepten gefunden.', 'search'),
('de', 'search.no_recipes', 'Keine Rezepte entsprechen den Filtern.', 'search'),
('de', 'recipes.title', 'Meine Rezepte', 'recipes'),
('de', 'recipes.no_recipes', 'Du hast noch keine gespeicherten Rezepte.', 'recipes'),
('de', 'recipes.loading', 'Rezepte werden geladen...', 'recipes'),
('de', 'recipes.error_loading', 'Fehler beim Laden der Rezepte.', 'recipes')

ON CONFLICT (locale, key) DO UPDATE SET value = EXCLUDED.value;

-- ============================================
-- FRANCOUZSKÉ PŘEKLADY (fr) - Ověřeno
-- ============================================

INSERT INTO translations (locale, key, value, category) VALUES
('fr', 'nav.favorite_products', 'Produits favoris', 'navigation'),
('fr', 'products.title', 'Produits favoris', 'products'),
('fr', 'products.add_new', '+ AJOUTER', 'products'),
('fr', 'products.no_products', 'Vous n''avez pas encore de produits favoris.', 'products'),
('fr', 'products.loading', 'Chargement des produits...', 'products'),
('fr', 'products.error_loading', 'Erreur lors du chargement des produits.', 'products'),
('fr', 'products.form.title_add', 'Ajouter un produit', 'products'),
('fr', 'products.form.title_edit', 'Modifier le produit', 'products'),
('fr', 'products.form.name', 'Nom', 'products'),
('fr', 'products.form.name_placeholder', 'Nom du produit', 'products'),
('fr', 'products.form.type', 'Type de produit', 'products'),
('fr', 'products.form.type_select', '-- Sélectionner le type --', 'products'),
('fr', 'products.form.description', 'Description', 'products'),
('fr', 'products.form.description_placeholder', 'Description du produit...', 'products'),
('fr', 'products.form.rating', 'Note', 'products'),
('fr', 'products.form.photo', 'Photo', 'products'),
('fr', 'products.form.photo_select', 'Sélectionner depuis la galerie', 'products'),
('fr', 'products.form.photo_take', 'Prendre une photo', 'products'),
('fr', 'products.form.url', 'Lien vers le produit', 'products'),
('fr', 'products.form.url_placeholder', 'https://...', 'products'),
('fr', 'products.form.save', 'ENREGISTRER', 'products'),
('fr', 'products.form.back', '◀ RETOUR', 'products'),
('fr', 'products.form.name_required', 'Le nom du produit est requis.', 'products'),
('fr', 'products.form.type_required', 'Veuillez sélectionner un type de produit.', 'products'),
('fr', 'products.detail.title', 'Détails du produit', 'products'),
('fr', 'products.detail.edit', 'MODIFIER', 'products'),
('fr', 'products.detail.delete', 'SUPPRIMER', 'products'),
('fr', 'products.detail.open_link', '🔗 Ouvrir le lien du produit', 'products'),
('fr', 'products.detail.added', 'Ajouté le :', 'products'),
('fr', 'products.detail.confirm_delete', 'Êtes-vous sûr de vouloir supprimer ce produit ?', 'products'),
('fr', 'product_type.vg', 'VG (Glycérine végétale)', 'product_types'),
('fr', 'product_type.pg', 'PG (Propylène glycol)', 'product_types'),
('fr', 'product_type.flavor', 'Arôme', 'product_types'),
('fr', 'product_type.nicotine_booster', 'Booster de nicotine', 'product_types'),
('fr', 'product_type.nicotine_salt', 'Sel de nicotine', 'product_types'),
('fr', 'search.label', '🔍 Rechercher', 'search'),
('fr', 'search.placeholder', 'Nom ou description...', 'search'),
('fr', 'search.type_label', '📦 Type', 'search'),
('fr', 'search.type_all', 'Tous les types', 'search'),
('fr', 'search.rating_label', '⭐ Note', 'search'),
('fr', 'search.clear_rating', 'Effacer le filtre', 'search'),
('fr', 'search.results_found', '{count} produit(s) trouvé(s) sur {total}.', 'search'),
('fr', 'search.no_results', 'Aucun produit ne correspond aux filtres.', 'search'),
('fr', 'search.recipes_found', '{count} recette(s) trouvée(s) sur {total}.', 'search'),
('fr', 'search.no_recipes', 'Aucune recette ne correspond aux filtres.', 'search'),
('fr', 'recipes.title', 'Mes recettes', 'recipes'),
('fr', 'recipes.no_recipes', 'Vous n''avez pas encore de recettes enregistrées.', 'recipes'),
('fr', 'recipes.loading', 'Chargement des recettes...', 'recipes'),
('fr', 'recipes.error_loading', 'Erreur lors du chargement des recettes.', 'recipes')

ON CONFLICT (locale, key) DO UPDATE SET value = EXCLUDED.value;

-- ============================================
-- ITALSKÉ PŘEKLADY (it) - Ověřeno
-- ============================================

INSERT INTO translations (locale, key, value, category) VALUES
('it', 'nav.favorite_products', 'Prodotti preferiti', 'navigation'),
('it', 'products.title', 'Prodotti preferiti', 'products'),
('it', 'products.add_new', '+ AGGIUNGI NUOVO', 'products'),
('it', 'products.no_products', 'Non hai ancora prodotti preferiti.', 'products'),
('it', 'products.loading', 'Caricamento prodotti...', 'products'),
('it', 'products.error_loading', 'Errore durante il caricamento dei prodotti.', 'products'),
('it', 'products.form.title_add', 'Aggiungi prodotto', 'products'),
('it', 'products.form.title_edit', 'Modifica prodotto', 'products'),
('it', 'products.form.name', 'Nome', 'products'),
('it', 'products.form.name_placeholder', 'Nome del prodotto', 'products'),
('it', 'products.form.type', 'Tipo di prodotto', 'products'),
('it', 'products.form.type_select', '-- Seleziona tipo --', 'products'),
('it', 'products.form.description', 'Descrizione', 'products'),
('it', 'products.form.description_placeholder', 'Descrizione del prodotto...', 'products'),
('it', 'products.form.rating', 'Valutazione', 'products'),
('it', 'products.form.photo', 'Foto', 'products'),
('it', 'products.form.photo_select', 'Seleziona dalla galleria', 'products'),
('it', 'products.form.photo_take', 'Scatta foto', 'products'),
('it', 'products.form.url', 'Link al prodotto', 'products'),
('it', 'products.form.url_placeholder', 'https://...', 'products'),
('it', 'products.form.save', 'SALVA', 'products'),
('it', 'products.form.back', '◀ INDIETRO', 'products'),
('it', 'products.form.name_required', 'Il nome del prodotto è obbligatorio.', 'products'),
('it', 'products.form.type_required', 'Seleziona un tipo di prodotto.', 'products'),
('it', 'products.detail.title', 'Dettagli prodotto', 'products'),
('it', 'products.detail.edit', 'MODIFICA', 'products'),
('it', 'products.detail.delete', 'ELIMINA', 'products'),
('it', 'products.detail.open_link', '🔗 Apri link prodotto', 'products'),
('it', 'products.detail.added', 'Aggiunto il:', 'products'),
('it', 'products.detail.confirm_delete', 'Sei sicuro di voler eliminare questo prodotto?', 'products'),
('it', 'product_type.vg', 'VG (Glicerina vegetale)', 'product_types'),
('it', 'product_type.pg', 'PG (Glicole propilenico)', 'product_types'),
('it', 'product_type.flavor', 'Aroma', 'product_types'),
('it', 'product_type.nicotine_booster', 'Booster di nicotina', 'product_types'),
('it', 'product_type.nicotine_salt', 'Sale di nicotina', 'product_types'),
('it', 'search.label', '🔍 Cerca', 'search'),
('it', 'search.placeholder', 'Nome o descrizione...', 'search'),
('it', 'search.type_label', '📦 Tipo', 'search'),
('it', 'search.type_all', 'Tutti i tipi', 'search'),
('it', 'search.rating_label', '⭐ Valutazione', 'search'),
('it', 'search.clear_rating', 'Cancella filtro', 'search'),
('it', 'search.results_found', 'Trovati {count} di {total} prodotti.', 'search'),
('it', 'search.no_results', 'Nessun prodotto corrisponde ai filtri.', 'search'),
('it', 'search.recipes_found', 'Trovate {count} di {total} ricette.', 'search'),
('it', 'search.no_recipes', 'Nessuna ricetta corrisponde ai filtri.', 'search'),
('it', 'recipes.title', 'Le mie ricette', 'recipes'),
('it', 'recipes.no_recipes', 'Non hai ancora ricette salvate.', 'recipes'),
('it', 'recipes.loading', 'Caricamento ricette...', 'recipes'),
('it', 'recipes.error_loading', 'Errore durante il caricamento delle ricette.', 'recipes')

ON CONFLICT (locale, key) DO UPDATE SET value = EXCLUDED.value;

-- ============================================
-- ŠPANĚLSKÉ PŘEKLADY (es) - Ověřeno
-- ============================================

INSERT INTO translations (locale, key, value, category) VALUES
('es', 'nav.favorite_products', 'Productos favoritos', 'navigation'),
('es', 'products.title', 'Productos favoritos', 'products'),
('es', 'products.add_new', '+ AÑADIR NUEVO', 'products'),
('es', 'products.no_products', 'Aún no tienes productos favoritos.', 'products'),
('es', 'products.loading', 'Cargando productos...', 'products'),
('es', 'products.error_loading', 'Error al cargar los productos.', 'products'),
('es', 'products.form.title_add', 'Añadir producto', 'products'),
('es', 'products.form.title_edit', 'Editar producto', 'products'),
('es', 'products.form.name', 'Nombre', 'products'),
('es', 'products.form.name_placeholder', 'Nombre del producto', 'products'),
('es', 'products.form.type', 'Tipo de producto', 'products'),
('es', 'products.form.type_select', '-- Seleccionar tipo --', 'products'),
('es', 'products.form.description', 'Descripción', 'products'),
('es', 'products.form.description_placeholder', 'Descripción del producto...', 'products'),
('es', 'products.form.rating', 'Valoración', 'products'),
('es', 'products.form.photo', 'Foto', 'products'),
('es', 'products.form.photo_select', 'Seleccionar de la galería', 'products'),
('es', 'products.form.photo_take', 'Tomar foto', 'products'),
('es', 'products.form.url', 'Enlace al producto', 'products'),
('es', 'products.form.url_placeholder', 'https://...', 'products'),
('es', 'products.form.save', 'GUARDAR', 'products'),
('es', 'products.form.back', '◀ VOLVER', 'products'),
('es', 'products.form.name_required', 'El nombre del producto es obligatorio.', 'products'),
('es', 'products.form.type_required', 'Por favor, selecciona un tipo de producto.', 'products'),
('es', 'products.detail.title', 'Detalles del producto', 'products'),
('es', 'products.detail.edit', 'EDITAR', 'products'),
('es', 'products.detail.delete', 'ELIMINAR', 'products'),
('es', 'products.detail.open_link', '🔗 Abrir enlace del producto', 'products'),
('es', 'products.detail.added', 'Añadido:', 'products'),
('es', 'products.detail.confirm_delete', '¿Estás seguro de que quieres eliminar este producto?', 'products'),
('es', 'product_type.vg', 'VG (Glicerina vegetal)', 'product_types'),
('es', 'product_type.pg', 'PG (Propilenglicol)', 'product_types'),
('es', 'product_type.flavor', 'Aroma', 'product_types'),
('es', 'product_type.nicotine_booster', 'Booster de nicotina', 'product_types'),
('es', 'product_type.nicotine_salt', 'Sal de nicotina', 'product_types'),
('es', 'search.label', '🔍 Buscar', 'search'),
('es', 'search.placeholder', 'Nombre o descripción...', 'search'),
('es', 'search.type_label', '📦 Tipo', 'search'),
('es', 'search.type_all', 'Todos los tipos', 'search'),
('es', 'search.rating_label', '⭐ Valoración', 'search'),
('es', 'search.clear_rating', 'Limpiar filtro', 'search'),
('es', 'search.results_found', 'Encontrados {count} de {total} productos.', 'search'),
('es', 'search.no_results', 'Ningún producto coincide con los filtros.', 'search'),
('es', 'search.recipes_found', 'Encontradas {count} de {total} recetas.', 'search'),
('es', 'search.no_recipes', 'Ninguna receta coincide con los filtros.', 'search'),
('es', 'recipes.title', 'Mis recetas', 'recipes'),
('es', 'recipes.no_recipes', 'Aún no tienes recetas guardadas.', 'recipes'),
('es', 'recipes.loading', 'Cargando recetas...', 'recipes'),
('es', 'recipes.error_loading', 'Error al cargar las recetas.', 'recipes')

ON CONFLICT (locale, key) DO UPDATE SET value = EXCLUDED.value;

-- ============================================
-- PORTUGALSKÉ PŘEKLADY (pt) - Ověřeno
-- ============================================

INSERT INTO translations (locale, key, value, category) VALUES
('pt', 'nav.favorite_products', 'Produtos favoritos', 'navigation'),
('pt', 'products.title', 'Produtos favoritos', 'products'),
('pt', 'products.add_new', '+ ADICIONAR NOVO', 'products'),
('pt', 'products.no_products', 'Ainda não tens produtos favoritos.', 'products'),
('pt', 'products.loading', 'A carregar produtos...', 'products'),
('pt', 'products.error_loading', 'Erro ao carregar produtos.', 'products'),
('pt', 'products.form.title_add', 'Adicionar produto', 'products'),
('pt', 'products.form.title_edit', 'Editar produto', 'products'),
('pt', 'products.form.name', 'Nome', 'products'),
('pt', 'products.form.name_placeholder', 'Nome do produto', 'products'),
('pt', 'products.form.type', 'Tipo de produto', 'products'),
('pt', 'products.form.type_select', '-- Selecionar tipo --', 'products'),
('pt', 'products.form.description', 'Descrição', 'products'),
('pt', 'products.form.description_placeholder', 'Descrição do produto...', 'products'),
('pt', 'products.form.rating', 'Avaliação', 'products'),
('pt', 'products.form.photo', 'Foto', 'products'),
('pt', 'products.form.photo_select', 'Selecionar da galeria', 'products'),
('pt', 'products.form.photo_take', 'Tirar foto', 'products'),
('pt', 'products.form.url', 'Link do produto', 'products'),
('pt', 'products.form.url_placeholder', 'https://...', 'products'),
('pt', 'products.form.save', 'GUARDAR', 'products'),
('pt', 'products.form.back', '◀ VOLTAR', 'products'),
('pt', 'products.form.name_required', 'O nome do produto é obrigatório.', 'products'),
('pt', 'products.form.type_required', 'Por favor, seleciona um tipo de produto.', 'products'),
('pt', 'products.detail.title', 'Detalhes do produto', 'products'),
('pt', 'products.detail.edit', 'EDITAR', 'products'),
('pt', 'products.detail.delete', 'ELIMINAR', 'products'),
('pt', 'products.detail.open_link', '🔗 Abrir link do produto', 'products'),
('pt', 'products.detail.added', 'Adicionado:', 'products'),
('pt', 'products.detail.confirm_delete', 'Tens a certeza que queres eliminar este produto?', 'products'),
('pt', 'product_type.vg', 'VG (Glicerina vegetal)', 'product_types'),
('pt', 'product_type.pg', 'PG (Propilenoglicol)', 'product_types'),
('pt', 'product_type.flavor', 'Aroma', 'product_types'),
('pt', 'product_type.nicotine_booster', 'Booster de nicotina', 'product_types'),
('pt', 'product_type.nicotine_salt', 'Sal de nicotina', 'product_types'),
('pt', 'search.label', '🔍 Pesquisar', 'search'),
('pt', 'search.placeholder', 'Nome ou descrição...', 'search'),
('pt', 'search.type_label', '📦 Tipo', 'search'),
('pt', 'search.type_all', 'Todos os tipos', 'search'),
('pt', 'search.rating_label', '⭐ Avaliação', 'search'),
('pt', 'search.clear_rating', 'Limpar filtro', 'search'),
('pt', 'search.results_found', 'Encontrados {count} de {total} produtos.', 'search'),
('pt', 'search.no_results', 'Nenhum produto corresponde aos filtros.', 'search'),
('pt', 'search.recipes_found', 'Encontradas {count} de {total} receitas.', 'search'),
('pt', 'search.no_recipes', 'Nenhuma receita corresponde aos filtros.', 'search'),
('pt', 'recipes.title', 'As minhas receitas', 'recipes'),
('pt', 'recipes.no_recipes', 'Ainda não tens receitas guardadas.', 'recipes'),
('pt', 'recipes.loading', 'A carregar receitas...', 'recipes'),
('pt', 'recipes.error_loading', 'Erro ao carregar receitas.', 'recipes')

ON CONFLICT (locale, key) DO UPDATE SET value = EXCLUDED.value;

-- ============================================
-- NIZOZEMSKÉ PŘEKLADY (nl) - Ověřeno
-- ============================================

INSERT INTO translations (locale, key, value, category) VALUES
('nl', 'nav.favorite_products', 'Favoriete producten', 'navigation'),
('nl', 'products.title', 'Favoriete producten', 'products'),
('nl', 'products.add_new', '+ NIEUW TOEVOEGEN', 'products'),
('nl', 'products.no_products', 'Je hebt nog geen favoriete producten.', 'products'),
('nl', 'products.loading', 'Producten laden...', 'products'),
('nl', 'products.error_loading', 'Fout bij het laden van producten.', 'products'),
('nl', 'products.form.title_add', 'Product toevoegen', 'products'),
('nl', 'products.form.title_edit', 'Product bewerken', 'products'),
('nl', 'products.form.name', 'Naam', 'products'),
('nl', 'products.form.name_placeholder', 'Productnaam', 'products'),
('nl', 'products.form.type', 'Producttype', 'products'),
('nl', 'products.form.type_select', '-- Selecteer type --', 'products'),
('nl', 'products.form.description', 'Beschrijving', 'products'),
('nl', 'products.form.description_placeholder', 'Productbeschrijving...', 'products'),
('nl', 'products.form.rating', 'Beoordeling', 'products'),
('nl', 'products.form.photo', 'Foto', 'products'),
('nl', 'products.form.photo_select', 'Selecteer uit galerij', 'products'),
('nl', 'products.form.photo_take', 'Foto maken', 'products'),
('nl', 'products.form.url', 'Productlink', 'products'),
('nl', 'products.form.url_placeholder', 'https://...', 'products'),
('nl', 'products.form.save', 'OPSLAAN', 'products'),
('nl', 'products.form.back', '◀ TERUG', 'products'),
('nl', 'products.form.name_required', 'Productnaam is verplicht.', 'products'),
('nl', 'products.form.type_required', 'Selecteer een producttype.', 'products'),
('nl', 'products.detail.title', 'Productdetails', 'products'),
('nl', 'products.detail.edit', 'BEWERKEN', 'products'),
('nl', 'products.detail.delete', 'VERWIJDEREN', 'products'),
('nl', 'products.detail.open_link', '🔗 Productlink openen', 'products'),
('nl', 'products.detail.added', 'Toegevoegd:', 'products'),
('nl', 'products.detail.confirm_delete', 'Weet je zeker dat je dit product wilt verwijderen?', 'products'),
('nl', 'product_type.vg', 'VG (Plantaardige glycerine)', 'product_types'),
('nl', 'product_type.pg', 'PG (Propyleenglycol)', 'product_types'),
('nl', 'product_type.flavor', 'Smaakstof', 'product_types'),
('nl', 'product_type.nicotine_booster', 'Nicotine booster', 'product_types'),
('nl', 'product_type.nicotine_salt', 'Nicotinezout', 'product_types'),
('nl', 'search.label', '🔍 Zoeken', 'search'),
('nl', 'search.placeholder', 'Naam of beschrijving...', 'search'),
('nl', 'search.type_label', '📦 Type', 'search'),
('nl', 'search.type_all', 'Alle types', 'search'),
('nl', 'search.rating_label', '⭐ Beoordeling', 'search'),
('nl', 'search.clear_rating', 'Filter wissen', 'search'),
('nl', 'search.results_found', '{count} van {total} producten gevonden.', 'search'),
('nl', 'search.no_results', 'Geen producten voldoen aan de filters.', 'search'),
('nl', 'search.recipes_found', '{count} van {total} recepten gevonden.', 'search'),
('nl', 'search.no_recipes', 'Geen recepten voldoen aan de filters.', 'search'),
('nl', 'recipes.title', 'Mijn recepten', 'recipes'),
('nl', 'recipes.no_recipes', 'Je hebt nog geen opgeslagen recepten.', 'recipes'),
('nl', 'recipes.loading', 'Recepten laden...', 'recipes'),
('nl', 'recipes.error_loading', 'Fout bij het laden van recepten.', 'recipes')

ON CONFLICT (locale, key) DO UPDATE SET value = EXCLUDED.value;

-- ============================================
-- RUSKÉ PŘEKLADY (ru) - Ověřeno
-- ============================================

INSERT INTO translations (locale, key, value, category) VALUES
('ru', 'nav.favorite_products', 'Избранные продукты', 'navigation'),
('ru', 'products.title', 'Избранные продукты', 'products'),
('ru', 'products.add_new', '+ ДОБАВИТЬ', 'products'),
('ru', 'products.no_products', 'У вас пока нет избранных продуктов.', 'products'),
('ru', 'products.loading', 'Загрузка продуктов...', 'products'),
('ru', 'products.error_loading', 'Ошибка при загрузке продуктов.', 'products'),
('ru', 'products.form.title_add', 'Добавить продукт', 'products'),
('ru', 'products.form.title_edit', 'Редактировать продукт', 'products'),
('ru', 'products.form.name', 'Название', 'products'),
('ru', 'products.form.name_placeholder', 'Название продукта', 'products'),
('ru', 'products.form.type', 'Тип продукта', 'products'),
('ru', 'products.form.type_select', '-- Выберите тип --', 'products'),
('ru', 'products.form.description', 'Описание', 'products'),
('ru', 'products.form.description_placeholder', 'Описание продукта...', 'products'),
('ru', 'products.form.rating', 'Рейтинг', 'products'),
('ru', 'products.form.photo', 'Фото', 'products'),
('ru', 'products.form.photo_select', 'Выбрать из галереи', 'products'),
('ru', 'products.form.photo_take', 'Сделать фото', 'products'),
('ru', 'products.form.url', 'Ссылка на продукт', 'products'),
('ru', 'products.form.url_placeholder', 'https://...', 'products'),
('ru', 'products.form.save', 'СОХРАНИТЬ', 'products'),
('ru', 'products.form.back', '◀ НАЗАД', 'products'),
('ru', 'products.form.name_required', 'Название продукта обязательно.', 'products'),
('ru', 'products.form.type_required', 'Пожалуйста, выберите тип продукта.', 'products'),
('ru', 'products.detail.title', 'Информация о продукте', 'products'),
('ru', 'products.detail.edit', 'РЕДАКТИРОВАТЬ', 'products'),
('ru', 'products.detail.delete', 'УДАЛИТЬ', 'products'),
('ru', 'products.detail.open_link', '🔗 Открыть ссылку на продукт', 'products'),
('ru', 'products.detail.added', 'Добавлено:', 'products'),
('ru', 'products.detail.confirm_delete', 'Вы уверены, что хотите удалить этот продукт?', 'products'),
('ru', 'product_type.vg', 'VG (Растительный глицерин)', 'product_types'),
('ru', 'product_type.pg', 'PG (Пропиленгликоль)', 'product_types'),
('ru', 'product_type.flavor', 'Ароматизатор', 'product_types'),
('ru', 'product_type.nicotine_booster', 'Никотиновый бустер', 'product_types'),
('ru', 'product_type.nicotine_salt', 'Никотиновая соль', 'product_types'),
('ru', 'search.label', '🔍 Поиск', 'search'),
('ru', 'search.placeholder', 'Название или описание...', 'search'),
('ru', 'search.type_label', '📦 Тип', 'search'),
('ru', 'search.type_all', 'Все типы', 'search'),
('ru', 'search.rating_label', '⭐ Рейтинг', 'search'),
('ru', 'search.clear_rating', 'Сбросить фильтр', 'search'),
('ru', 'search.results_found', 'Найдено {count} из {total} продуктов.', 'search'),
('ru', 'search.no_results', 'Нет продуктов, соответствующих фильтрам.', 'search'),
('ru', 'search.recipes_found', 'Найдено {count} из {total} рецептов.', 'search'),
('ru', 'search.no_recipes', 'Нет рецептов, соответствующих фильтрам.', 'search'),
('ru', 'recipes.title', 'Мои рецепты', 'recipes'),
('ru', 'recipes.no_recipes', 'У вас пока нет сохранённых рецептов.', 'recipes'),
('ru', 'recipes.loading', 'Загрузка рецептов...', 'recipes'),
('ru', 'recipes.error_loading', 'Ошибка при загрузке рецептов.', 'recipes')

ON CONFLICT (locale, key) DO UPDATE SET value = EXCLUDED.value;

-- ============================================
-- UKRAJINSKÉ PŘEKLADY (uk) - Nový jazyk
-- ============================================

INSERT INTO translations (locale, key, value, category) VALUES
('uk', 'nav.favorite_products', 'Улюблені продукти', 'navigation'),
('uk', 'products.title', 'Улюблені продукти', 'products'),
('uk', 'products.add_new', '+ ДОДАТИ', 'products'),
('uk', 'products.no_products', 'У вас поки немає улюблених продуктів.', 'products'),
('uk', 'products.loading', 'Завантаження продуктів...', 'products'),
('uk', 'products.error_loading', 'Помилка при завантаженні продуктів.', 'products'),
('uk', 'products.form.title_add', 'Додати продукт', 'products'),
('uk', 'products.form.title_edit', 'Редагувати продукт', 'products'),
('uk', 'products.form.name', 'Назва', 'products'),
('uk', 'products.form.name_placeholder', 'Назва продукту', 'products'),
('uk', 'products.form.type', 'Тип продукту', 'products'),
('uk', 'products.form.type_select', '-- Оберіть тип --', 'products'),
('uk', 'products.form.description', 'Опис', 'products'),
('uk', 'products.form.description_placeholder', 'Опис продукту...', 'products'),
('uk', 'products.form.rating', 'Рейтинг', 'products'),
('uk', 'products.form.photo', 'Фото', 'products'),
('uk', 'products.form.photo_select', 'Вибрати з галереї', 'products'),
('uk', 'products.form.photo_take', 'Зробити фото', 'products'),
('uk', 'products.form.url', 'Посилання на продукт', 'products'),
('uk', 'products.form.url_placeholder', 'https://...', 'products'),
('uk', 'products.form.save', 'ЗБЕРЕГТИ', 'products'),
('uk', 'products.form.back', '◀ НАЗАД', 'products'),
('uk', 'products.form.name_required', 'Назва продукту обов''язкова.', 'products'),
('uk', 'products.form.type_required', 'Будь ласка, оберіть тип продукту.', 'products'),
('uk', 'products.detail.title', 'Деталі продукту', 'products'),
('uk', 'products.detail.edit', 'РЕДАГУВАТИ', 'products'),
('uk', 'products.detail.delete', 'ВИДАЛИТИ', 'products'),
('uk', 'products.detail.open_link', '🔗 Відкрити посилання на продукт', 'products'),
('uk', 'products.detail.added', 'Додано:', 'products'),
('uk', 'products.detail.confirm_delete', 'Ви впевнені, що хочете видалити цей продукт?', 'products'),
('uk', 'product_type.vg', 'VG (Рослинний гліцерин)', 'product_types'),
('uk', 'product_type.pg', 'PG (Пропіленгліколь)', 'product_types'),
('uk', 'product_type.flavor', 'Ароматизатор', 'product_types'),
('uk', 'product_type.nicotine_booster', 'Нікотиновий бустер', 'product_types'),
('uk', 'product_type.nicotine_salt', 'Нікотинова сіль', 'product_types'),
('uk', 'search.label', '🔍 Пошук', 'search'),
('uk', 'search.placeholder', 'Назва або опис...', 'search'),
('uk', 'search.type_label', '📦 Тип', 'search'),
('uk', 'search.type_all', 'Усі типи', 'search'),
('uk', 'search.rating_label', '⭐ Рейтинг', 'search'),
('uk', 'search.clear_rating', 'Скинути фільтр', 'search'),
('uk', 'search.results_found', 'Знайдено {count} з {total} продуктів.', 'search'),
('uk', 'search.no_results', 'Немає продуктів, що відповідають фільтрам.', 'search'),
('uk', 'search.recipes_found', 'Знайдено {count} з {total} рецептів.', 'search'),
('uk', 'search.no_recipes', 'Немає рецептів, що відповідають фільтрам.', 'search'),
('uk', 'recipes.title', 'Мої рецепти', 'recipes'),
('uk', 'recipes.no_recipes', 'У вас поки немає збережених рецептів.', 'recipes'),
('uk', 'recipes.loading', 'Завантаження рецептів...', 'recipes'),
('uk', 'recipes.error_loading', 'Помилка при завантаженні рецептів.', 'recipes')

ON CONFLICT (locale, key) DO UPDATE SET value = EXCLUDED.value;

-- ============================================
-- JAPONSKÉ PŘEKLADY (ja) - Ověřeno
-- ============================================

INSERT INTO translations (locale, key, value, category) VALUES
('ja', 'nav.favorite_products', 'お気に入り製品', 'navigation'),
('ja', 'products.title', 'お気に入り製品', 'products'),
('ja', 'products.add_new', '+ 新規追加', 'products'),
('ja', 'products.no_products', 'お気に入り製品はまだありません。', 'products'),
('ja', 'products.loading', '製品を読み込み中...', 'products'),
('ja', 'products.error_loading', '製品の読み込み中にエラーが発生しました。', 'products'),
('ja', 'products.form.title_add', '製品を追加', 'products'),
('ja', 'products.form.title_edit', '製品を編集', 'products'),
('ja', 'products.form.name', '名前', 'products'),
('ja', 'products.form.name_placeholder', '製品名', 'products'),
('ja', 'products.form.type', '製品タイプ', 'products'),
('ja', 'products.form.type_select', '-- タイプを選択 --', 'products'),
('ja', 'products.form.description', '説明', 'products'),
('ja', 'products.form.description_placeholder', '製品の説明...', 'products'),
('ja', 'products.form.rating', '評価', 'products'),
('ja', 'products.form.photo', '写真', 'products'),
('ja', 'products.form.photo_select', 'ギャラリーから選択', 'products'),
('ja', 'products.form.photo_take', '写真を撮る', 'products'),
('ja', 'products.form.url', '製品リンク', 'products'),
('ja', 'products.form.url_placeholder', 'https://...', 'products'),
('ja', 'products.form.save', '保存', 'products'),
('ja', 'products.form.back', '◀ 戻る', 'products'),
('ja', 'products.form.name_required', '製品名は必須です。', 'products'),
('ja', 'products.form.type_required', '製品タイプを選択してください。', 'products'),
('ja', 'products.detail.title', '製品詳細', 'products'),
('ja', 'products.detail.edit', '編集', 'products'),
('ja', 'products.detail.delete', '削除', 'products'),
('ja', 'products.detail.open_link', '🔗 製品リンクを開く', 'products'),
('ja', 'products.detail.added', '追加日：', 'products'),
('ja', 'products.detail.confirm_delete', 'この製品を削除してもよろしいですか？', 'products'),
('ja', 'product_type.vg', 'VG（植物性グリセリン）', 'product_types'),
('ja', 'product_type.pg', 'PG（プロピレングリコール）', 'product_types'),
('ja', 'product_type.flavor', 'フレーバー', 'product_types'),
('ja', 'product_type.nicotine_booster', 'ニコチンブースター', 'product_types'),
('ja', 'product_type.nicotine_salt', 'ニコチンソルト', 'product_types'),
('ja', 'search.label', '🔍 検索', 'search'),
('ja', 'search.placeholder', '名前または説明...', 'search'),
('ja', 'search.type_label', '📦 タイプ', 'search'),
('ja', 'search.type_all', 'すべてのタイプ', 'search'),
('ja', 'search.rating_label', '⭐ 評価', 'search'),
('ja', 'search.clear_rating', 'フィルターをクリア', 'search'),
('ja', 'search.results_found', '{total}件中{count}件の製品が見つかりました。', 'search'),
('ja', 'search.no_results', 'フィルターに一致する製品がありません。', 'search'),
('ja', 'search.recipes_found', '{total}件中{count}件のレシピが見つかりました。', 'search'),
('ja', 'search.no_recipes', 'フィルターに一致するレシピがありません。', 'search'),
('ja', 'recipes.title', 'マイレシピ', 'recipes'),
('ja', 'recipes.no_recipes', '保存されたレシピはまだありません。', 'recipes'),
('ja', 'recipes.loading', 'レシピを読み込み中...', 'recipes'),
('ja', 'recipes.error_loading', 'レシピの読み込み中にエラーが発生しました。', 'recipes')

ON CONFLICT (locale, key) DO UPDATE SET value = EXCLUDED.value;

-- ============================================
-- KOREJSKÉ PŘEKLADY (ko) - Ověřeno
-- ============================================

INSERT INTO translations (locale, key, value, category) VALUES
('ko', 'nav.favorite_products', '즐겨찾기 제품', 'navigation'),
('ko', 'products.title', '즐겨찾기 제품', 'products'),
('ko', 'products.add_new', '+ 새로 추가', 'products'),
('ko', 'products.no_products', '즐겨찾기 제품이 아직 없습니다.', 'products'),
('ko', 'products.loading', '제품 불러오는 중...', 'products'),
('ko', 'products.error_loading', '제품을 불러오는 중 오류가 발생했습니다.', 'products'),
('ko', 'products.form.title_add', '제품 추가', 'products'),
('ko', 'products.form.title_edit', '제품 편집', 'products'),
('ko', 'products.form.name', '이름', 'products'),
('ko', 'products.form.name_placeholder', '제품명', 'products'),
('ko', 'products.form.type', '제품 유형', 'products'),
('ko', 'products.form.type_select', '-- 유형 선택 --', 'products'),
('ko', 'products.form.description', '설명', 'products'),
('ko', 'products.form.description_placeholder', '제품 설명...', 'products'),
('ko', 'products.form.rating', '평점', 'products'),
('ko', 'products.form.photo', '사진', 'products'),
('ko', 'products.form.photo_select', '갤러리에서 선택', 'products'),
('ko', 'products.form.photo_take', '사진 촬영', 'products'),
('ko', 'products.form.url', '제품 링크', 'products'),
('ko', 'products.form.url_placeholder', 'https://...', 'products'),
('ko', 'products.form.save', '저장', 'products'),
('ko', 'products.form.back', '◀ 뒤로', 'products'),
('ko', 'products.form.name_required', '제품명은 필수입니다.', 'products'),
('ko', 'products.form.type_required', '제품 유형을 선택해 주세요.', 'products'),
('ko', 'products.detail.title', '제품 상세', 'products'),
('ko', 'products.detail.edit', '편집', 'products'),
('ko', 'products.detail.delete', '삭제', 'products'),
('ko', 'products.detail.open_link', '🔗 제품 링크 열기', 'products'),
('ko', 'products.detail.added', '추가일:', 'products'),
('ko', 'products.detail.confirm_delete', '이 제품을 삭제하시겠습니까?', 'products'),
('ko', 'product_type.vg', 'VG (식물성 글리세린)', 'product_types'),
('ko', 'product_type.pg', 'PG (프로필렌 글리콜)', 'product_types'),
('ko', 'product_type.flavor', '향료', 'product_types'),
('ko', 'product_type.nicotine_booster', '니코틴 부스터', 'product_types'),
('ko', 'product_type.nicotine_salt', '니코틴 솔트', 'product_types'),
('ko', 'search.label', '🔍 검색', 'search'),
('ko', 'search.placeholder', '이름 또는 설명...', 'search'),
('ko', 'search.type_label', '📦 유형', 'search'),
('ko', 'search.type_all', '모든 유형', 'search'),
('ko', 'search.rating_label', '⭐ 평점', 'search'),
('ko', 'search.clear_rating', '필터 초기화', 'search'),
('ko', 'search.results_found', '{total}개 중 {count}개 제품 발견.', 'search'),
('ko', 'search.no_results', '필터에 맞는 제품이 없습니다.', 'search'),
('ko', 'search.recipes_found', '{total}개 중 {count}개 레시피 발견.', 'search'),
('ko', 'search.no_recipes', '필터에 맞는 레시피가 없습니다.', 'search'),
('ko', 'recipes.title', '내 레시피', 'recipes'),
('ko', 'recipes.no_recipes', '저장된 레시피가 아직 없습니다.', 'recipes'),
('ko', 'recipes.loading', '레시피 불러오는 중...', 'recipes'),
('ko', 'recipes.error_loading', '레시피를 불러오는 중 오류가 발생했습니다.', 'recipes')

ON CONFLICT (locale, key) DO UPDATE SET value = EXCLUDED.value;

-- ============================================
-- ČÍNSKÉ PŘEKLADY - ZJEDNODUŠENÉ (zh-CN) - Nový jazyk
-- ============================================

INSERT INTO translations (locale, key, value, category) VALUES
('zh-CN', 'nav.favorite_products', '收藏产品', 'navigation'),
('zh-CN', 'products.title', '收藏产品', 'products'),
('zh-CN', 'products.add_new', '+ 添加新品', 'products'),
('zh-CN', 'products.no_products', '您还没有收藏任何产品。', 'products'),
('zh-CN', 'products.loading', '正在加载产品...', 'products'),
('zh-CN', 'products.error_loading', '加载产品时出错。', 'products'),
('zh-CN', 'products.form.title_add', '添加产品', 'products'),
('zh-CN', 'products.form.title_edit', '编辑产品', 'products'),
('zh-CN', 'products.form.name', '名称', 'products'),
('zh-CN', 'products.form.name_placeholder', '产品名称', 'products'),
('zh-CN', 'products.form.type', '产品类型', 'products'),
('zh-CN', 'products.form.type_select', '-- 选择类型 --', 'products'),
('zh-CN', 'products.form.description', '描述', 'products'),
('zh-CN', 'products.form.description_placeholder', '产品描述...', 'products'),
('zh-CN', 'products.form.rating', '评分', 'products'),
('zh-CN', 'products.form.photo', '照片', 'products'),
('zh-CN', 'products.form.photo_select', '从相册选择', 'products'),
('zh-CN', 'products.form.photo_take', '拍照', 'products'),
('zh-CN', 'products.form.url', '产品链接', 'products'),
('zh-CN', 'products.form.url_placeholder', 'https://...', 'products'),
('zh-CN', 'products.form.save', '保存', 'products'),
('zh-CN', 'products.form.back', '◀ 返回', 'products'),
('zh-CN', 'products.form.name_required', '产品名称为必填项。', 'products'),
('zh-CN', 'products.form.type_required', '请选择产品类型。', 'products'),
('zh-CN', 'products.detail.title', '产品详情', 'products'),
('zh-CN', 'products.detail.edit', '编辑', 'products'),
('zh-CN', 'products.detail.delete', '删除', 'products'),
('zh-CN', 'products.detail.open_link', '🔗 打开产品链接', 'products'),
('zh-CN', 'products.detail.added', '添加时间：', 'products'),
('zh-CN', 'products.detail.confirm_delete', '确定要删除此产品吗？', 'products'),
('zh-CN', 'product_type.vg', 'VG（植物甘油）', 'product_types'),
('zh-CN', 'product_type.pg', 'PG（丙二醇）', 'product_types'),
('zh-CN', 'product_type.flavor', '香精', 'product_types'),
('zh-CN', 'product_type.nicotine_booster', '尼古丁助推剂', 'product_types'),
('zh-CN', 'product_type.nicotine_salt', '尼古丁盐', 'product_types'),
('zh-CN', 'search.label', '🔍 搜索', 'search'),
('zh-CN', 'search.placeholder', '名称或描述...', 'search'),
('zh-CN', 'search.type_label', '📦 类型', 'search'),
('zh-CN', 'search.type_all', '所有类型', 'search'),
('zh-CN', 'search.rating_label', '⭐ 评分', 'search'),
('zh-CN', 'search.clear_rating', '清除筛选', 'search'),
('zh-CN', 'search.results_found', '找到 {count}/{total} 个产品。', 'search'),
('zh-CN', 'search.no_results', '没有符合筛选条件的产品。', 'search'),
('zh-CN', 'search.recipes_found', '找到 {count}/{total} 个配方。', 'search'),
('zh-CN', 'search.no_recipes', '没有符合筛选条件的配方。', 'search'),
('zh-CN', 'recipes.title', '我的配方', 'recipes'),
('zh-CN', 'recipes.no_recipes', '您还没有保存任何配方。', 'recipes'),
('zh-CN', 'recipes.loading', '正在加载配方...', 'recipes'),
('zh-CN', 'recipes.error_loading', '加载配方时出错。', 'recipes')

ON CONFLICT (locale, key) DO UPDATE SET value = EXCLUDED.value;

-- ============================================
-- TURECKÉ PŘEKLADY (tr) - Nový jazyk
-- ============================================

INSERT INTO translations (locale, key, value, category) VALUES
('tr', 'nav.favorite_products', 'Favori Ürünler', 'navigation'),
('tr', 'products.title', 'Favori Ürünler', 'products'),
('tr', 'products.add_new', '+ YENİ EKLE', 'products'),
('tr', 'products.no_products', 'Henüz favori ürününüz yok.', 'products'),
('tr', 'products.loading', 'Ürünler yükleniyor...', 'products'),
('tr', 'products.error_loading', 'Ürünler yüklenirken hata oluştu.', 'products'),
('tr', 'products.form.title_add', 'Ürün Ekle', 'products'),
('tr', 'products.form.title_edit', 'Ürünü Düzenle', 'products'),
('tr', 'products.form.name', 'Ad', 'products'),
('tr', 'products.form.name_placeholder', 'Ürün adı', 'products'),
('tr', 'products.form.type', 'Ürün Tipi', 'products'),
('tr', 'products.form.type_select', '-- Tip seçin --', 'products'),
('tr', 'products.form.description', 'Açıklama', 'products'),
('tr', 'products.form.description_placeholder', 'Ürün açıklaması...', 'products'),
('tr', 'products.form.rating', 'Değerlendirme', 'products'),
('tr', 'products.form.photo', 'Fotoğraf', 'products'),
('tr', 'products.form.photo_select', 'Galeriden seç', 'products'),
('tr', 'products.form.photo_take', 'Fotoğraf çek', 'products'),
('tr', 'products.form.url', 'Ürün Linki', 'products'),
('tr', 'products.form.url_placeholder', 'https://...', 'products'),
('tr', 'products.form.save', 'KAYDET', 'products'),
('tr', 'products.form.back', '◀ GERİ', 'products'),
('tr', 'products.form.name_required', 'Ürün adı zorunludur.', 'products'),
('tr', 'products.form.type_required', 'Lütfen bir ürün tipi seçin.', 'products'),
('tr', 'products.detail.title', 'Ürün Detayları', 'products'),
('tr', 'products.detail.edit', 'DÜZENLE', 'products'),
('tr', 'products.detail.delete', 'SİL', 'products'),
('tr', 'products.detail.open_link', '🔗 Ürün linkini aç', 'products'),
('tr', 'products.detail.added', 'Eklenme tarihi:', 'products'),
('tr', 'products.detail.confirm_delete', 'Bu ürünü silmek istediğinizden emin misiniz?', 'products'),
('tr', 'product_type.vg', 'VG (Bitkisel Gliserin)', 'product_types'),
('tr', 'product_type.pg', 'PG (Propilen Glikol)', 'product_types'),
('tr', 'product_type.flavor', 'Aroma', 'product_types'),
('tr', 'product_type.nicotine_booster', 'Nikotin Booster', 'product_types'),
('tr', 'product_type.nicotine_salt', 'Nikotin Tuzu', 'product_types'),
('tr', 'search.label', '🔍 Ara', 'search'),
('tr', 'search.placeholder', 'Ad veya açıklama...', 'search'),
('tr', 'search.type_label', '📦 Tip', 'search'),
('tr', 'search.type_all', 'Tüm tipler', 'search'),
('tr', 'search.rating_label', '⭐ Değerlendirme', 'search'),
('tr', 'search.clear_rating', 'Filtreyi temizle', 'search'),
('tr', 'search.results_found', '{total} üründen {count} tanesi bulundu.', 'search'),
('tr', 'search.no_results', 'Filtrelere uyan ürün bulunamadı.', 'search'),
('tr', 'search.recipes_found', '{total} tariften {count} tanesi bulundu.', 'search'),
('tr', 'search.no_recipes', 'Filtrelere uyan tarif bulunamadı.', 'search'),
('tr', 'recipes.title', 'Tariflerim', 'recipes'),
('tr', 'recipes.no_recipes', 'Henüz kayıtlı tarifiniz yok.', 'recipes'),
('tr', 'recipes.loading', 'Tarifler yükleniyor...', 'recipes'),
('tr', 'recipes.error_loading', 'Tarifler yüklenirken hata oluştu.', 'recipes')

ON CONFLICT (locale, key) DO UPDATE SET value = EXCLUDED.value;

-- ============================================
-- PŘIDÁNÍ NOVÝCH LOCALE ZÁZNAMŮ (pokud neexistují)
-- ============================================

INSERT INTO locales (code, name, native_name, currency, currency_symbol, date_format, is_active) VALUES
('uk', 'Ukrainian', 'Українська', 'UAH', '₴', 'DD.MM.YYYY', true),
('zh-CN', 'Chinese (Simplified)', '简体中文', 'CNY', '¥', 'YYYY-MM-DD', true),
('tr', 'Turkish', 'Türkçe', 'TRY', '₺', 'DD.MM.YYYY', true)
ON CONFLICT (code) DO NOTHING;

-- ============================================
-- OVĚŘENÍ
-- ============================================

SELECT '✅ Ověřené překlady pro filtry a produkty byly úspěšně přidány!' as status;
SELECT locale, COUNT(*) as translation_count 
FROM translations 
WHERE category IN ('products', 'product_types', 'search', 'recipes') 
GROUP BY locale 
ORDER BY locale;

