-- ============================================
-- MIGRACE: Překlady pro filtry a oblíbené produkty
-- Spusťte tento SQL v Supabase SQL Editor
-- ============================================

-- ============================================
-- ČESKÉ PŘEKLADY (cs)
-- ============================================

INSERT INTO translations (locale, key, value, category) VALUES
-- Navigace - nové položky
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
('cs', 'product_type.nicotine_booster', 'Nikotin booster', 'product_types'),
('cs', 'product_type.nicotine_salt', 'Nikotinová sůl', 'product_types'),

-- Vyhledávání a filtry - produkty
('cs', 'search.label', '🔍 Hledat', 'search'),
('cs', 'search.placeholder', 'Název nebo popis...', 'search'),
('cs', 'search.type_label', '📦 Typ', 'search'),
('cs', 'search.type_all', 'Všechny typy', 'search'),
('cs', 'search.rating_label', '⭐ Hodnocení', 'search'),
('cs', 'search.clear_rating', 'Zrušit filtr', 'search'),
('cs', 'search.results_found', 'Nalezeno {count} z {total} produktů.', 'search'),
('cs', 'search.no_results', 'Žádné produkty neodpovídají filtrům.', 'search'),

-- Vyhledávání a filtry - recepty
('cs', 'search.recipes_found', 'Nalezeno {count} z {total} receptů.', 'search'),
('cs', 'search.no_recipes', 'Žádné recepty neodpovídají filtrům.', 'search'),

-- Recepty - existující + nové
('cs', 'recipes.title', 'Mé recepty', 'recipes'),
('cs', 'recipes.no_recipes', 'Zatím nemáte žádné uložené recepty.', 'recipes'),
('cs', 'recipes.loading', 'Načítám recepty...', 'recipes'),
('cs', 'recipes.error_loading', 'Chyba při načítání receptů.', 'recipes')

ON CONFLICT (locale, key) DO UPDATE SET value = EXCLUDED.value;

-- ============================================
-- ANGLICKÉ PŘEKLADY (en)
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
('en', 'products.detail.title', 'Product Detail', 'products'),
('en', 'products.detail.edit', 'EDIT', 'products'),
('en', 'products.detail.delete', 'DELETE', 'products'),
('en', 'products.detail.open_link', '🔗 Open product link', 'products'),
('en', 'products.detail.added', 'Added:', 'products'),
('en', 'products.detail.confirm_delete', 'Are you sure you want to delete this product?', 'products'),

-- Product types
('en', 'product_type.vg', 'VG (Glycerin)', 'product_types'),
('en', 'product_type.pg', 'PG (Propylene Glycol)', 'product_types'),
('en', 'product_type.flavor', 'Flavor', 'product_types'),
('en', 'product_type.nicotine_booster', 'Nicotine Booster', 'product_types'),
('en', 'product_type.nicotine_salt', 'Nicotine Salt', 'product_types'),

-- Search and filters - products
('en', 'search.label', '🔍 Search', 'search'),
('en', 'search.placeholder', 'Name or description...', 'search'),
('en', 'search.type_label', '📦 Type', 'search'),
('en', 'search.type_all', 'All types', 'search'),
('en', 'search.rating_label', '⭐ Rating', 'search'),
('en', 'search.clear_rating', 'Clear filter', 'search'),
('en', 'search.results_found', 'Found {count} of {total} products.', 'search'),
('en', 'search.no_results', 'No products match the filters.', 'search'),

-- Search and filters - recipes
('en', 'search.recipes_found', 'Found {count} of {total} recipes.', 'search'),
('en', 'search.no_recipes', 'No recipes match the filters.', 'search'),

-- Recipes
('en', 'recipes.title', 'My Recipes', 'recipes'),
('en', 'recipes.no_recipes', 'You don''t have any saved recipes yet.', 'recipes'),
('en', 'recipes.loading', 'Loading recipes...', 'recipes'),
('en', 'recipes.error_loading', 'Error loading recipes.', 'recipes')

ON CONFLICT (locale, key) DO UPDATE SET value = EXCLUDED.value;

-- ============================================
-- SLOVENSKÉ PŘEKLADY (sk)
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
('sk', 'products.detail.delete', 'ZMAZAŤ', 'products'),
('sk', 'products.detail.open_link', '🔗 Otvoriť odkaz na produkt', 'products'),
('sk', 'products.detail.added', 'Pridané:', 'products'),
('sk', 'products.detail.confirm_delete', 'Naozaj chcete zmazať tento produkt?', 'products'),
('sk', 'product_type.vg', 'VG (Glycerín)', 'product_types'),
('sk', 'product_type.pg', 'PG (Propylénglykol)', 'product_types'),
('sk', 'product_type.flavor', 'Príchuť', 'product_types'),
('sk', 'product_type.nicotine_booster', 'Nikotín booster', 'product_types'),
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
-- POLSKÉ PŘEKLADY (pl)
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
('pl', 'products.form.url', 'URL produktu', 'products'),
('pl', 'products.form.url_placeholder', 'https://...', 'products'),
('pl', 'products.form.save', 'ZAPISZ', 'products'),
('pl', 'products.form.back', '◀ WSTECZ', 'products'),
('pl', 'products.form.name_required', 'Nazwa produktu jest wymagana.', 'products'),
('pl', 'products.form.type_required', 'Wybierz typ produktu.', 'products'),
('pl', 'products.detail.title', 'Szczegóły produktu', 'products'),
('pl', 'products.detail.edit', 'EDYTUJ', 'products'),
('pl', 'products.detail.delete', 'USUŃ', 'products'),
('pl', 'products.detail.open_link', '🔗 Otwórz link do produktu', 'products'),
('pl', 'products.detail.added', 'Dodano:', 'products'),
('pl', 'products.detail.confirm_delete', 'Czy na pewno chcesz usunąć ten produkt?', 'products'),
('pl', 'product_type.vg', 'VG (Gliceryna)', 'product_types'),
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
('pl', 'search.no_results', 'Żadne produkty nie pasują do filtrów.', 'search'),
('pl', 'search.recipes_found', 'Znaleziono {count} z {total} przepisów.', 'search'),
('pl', 'search.no_recipes', 'Żadne przepisy nie pasują do filtrów.', 'search'),
('pl', 'recipes.title', 'Moje przepisy', 'recipes'),
('pl', 'recipes.no_recipes', 'Nie masz jeszcze żadnych zapisanych przepisów.', 'recipes'),
('pl', 'recipes.loading', 'Ładowanie przepisów...', 'recipes'),
('pl', 'recipes.error_loading', 'Błąd podczas ładowania przepisów.', 'recipes')

ON CONFLICT (locale, key) DO UPDATE SET value = EXCLUDED.value;

-- ============================================
-- NĚMECKÉ PŘEKLADY (de)
-- ============================================

INSERT INTO translations (locale, key, value, category) VALUES
('de', 'nav.favorite_products', 'Lieblingsprodukte', 'navigation'),
('de', 'products.title', 'Lieblingsprodukte', 'products'),
('de', 'products.add_new', '+ NEU HINZUFÜGEN', 'products'),
('de', 'products.no_products', 'Sie haben noch keine Lieblingsprodukte.', 'products'),
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
('de', 'products.form.type_required', 'Bitte wählen Sie einen Produkttyp.', 'products'),
('de', 'products.detail.title', 'Produktdetails', 'products'),
('de', 'products.detail.edit', 'BEARBEITEN', 'products'),
('de', 'products.detail.delete', 'LÖSCHEN', 'products'),
('de', 'products.detail.open_link', '🔗 Produktlink öffnen', 'products'),
('de', 'products.detail.added', 'Hinzugefügt:', 'products'),
('de', 'products.detail.confirm_delete', 'Möchten Sie dieses Produkt wirklich löschen?', 'products'),
('de', 'product_type.vg', 'VG (Glycerin)', 'product_types'),
('de', 'product_type.pg', 'PG (Propylenglykol)', 'product_types'),
('de', 'product_type.flavor', 'Aroma', 'product_types'),
('de', 'product_type.nicotine_booster', 'Nikotin-Booster', 'product_types'),
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
('de', 'recipes.no_recipes', 'Sie haben noch keine gespeicherten Rezepte.', 'recipes'),
('de', 'recipes.loading', 'Rezepte werden geladen...', 'recipes'),
('de', 'recipes.error_loading', 'Fehler beim Laden der Rezepte.', 'recipes')

ON CONFLICT (locale, key) DO UPDATE SET value = EXCLUDED.value;

-- ============================================
-- FRANCOUZSKÉ PŘEKLADY (fr)
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
('fr', 'products.form.photo_select', 'Sélectionner de la galerie', 'products'),
('fr', 'products.form.photo_take', 'Prendre une photo', 'products'),
('fr', 'products.form.url', 'URL du produit', 'products'),
('fr', 'products.form.url_placeholder', 'https://...', 'products'),
('fr', 'products.form.save', 'ENREGISTRER', 'products'),
('fr', 'products.form.back', '◀ RETOUR', 'products'),
('fr', 'products.form.name_required', 'Le nom du produit est requis.', 'products'),
('fr', 'products.form.type_required', 'Veuillez sélectionner un type de produit.', 'products'),
('fr', 'products.detail.title', 'Détails du produit', 'products'),
('fr', 'products.detail.edit', 'MODIFIER', 'products'),
('fr', 'products.detail.delete', 'SUPPRIMER', 'products'),
('fr', 'products.detail.open_link', '🔗 Ouvrir le lien du produit', 'products'),
('fr', 'products.detail.added', 'Ajouté:', 'products'),
('fr', 'products.detail.confirm_delete', 'Êtes-vous sûr de vouloir supprimer ce produit?', 'products'),
('fr', 'product_type.vg', 'VG (Glycérine)', 'product_types'),
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
('fr', 'search.results_found', '{count} sur {total} produits trouvés.', 'search'),
('fr', 'search.no_results', 'Aucun produit ne correspond aux filtres.', 'search'),
('fr', 'search.recipes_found', '{count} sur {total} recettes trouvées.', 'search'),
('fr', 'search.no_recipes', 'Aucune recette ne correspond aux filtres.', 'search'),
('fr', 'recipes.title', 'Mes recettes', 'recipes'),
('fr', 'recipes.no_recipes', 'Vous n''avez pas encore de recettes enregistrées.', 'recipes'),
('fr', 'recipes.loading', 'Chargement des recettes...', 'recipes'),
('fr', 'recipes.error_loading', 'Erreur lors du chargement des recettes.', 'recipes')

ON CONFLICT (locale, key) DO UPDATE SET value = EXCLUDED.value;

-- ============================================
-- ITALSKÉ PŘEKLADY (it)
-- ============================================

INSERT INTO translations (locale, key, value, category) VALUES
('it', 'nav.favorite_products', 'Prodotti preferiti', 'navigation'),
('it', 'products.title', 'Prodotti preferiti', 'products'),
('it', 'products.add_new', '+ AGGIUNGI', 'products'),
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
('it', 'products.form.url', 'URL del prodotto', 'products'),
('it', 'products.form.url_placeholder', 'https://...', 'products'),
('it', 'products.form.save', 'SALVA', 'products'),
('it', 'products.form.back', '◀ INDIETRO', 'products'),
('it', 'products.form.name_required', 'Il nome del prodotto è obbligatorio.', 'products'),
('it', 'products.form.type_required', 'Seleziona un tipo di prodotto.', 'products'),
('it', 'products.detail.title', 'Dettagli prodotto', 'products'),
('it', 'products.detail.edit', 'MODIFICA', 'products'),
('it', 'products.detail.delete', 'ELIMINA', 'products'),
('it', 'products.detail.open_link', '🔗 Apri link prodotto', 'products'),
('it', 'products.detail.added', 'Aggiunto:', 'products'),
('it', 'products.detail.confirm_delete', 'Sei sicuro di voler eliminare questo prodotto?', 'products'),
('it', 'product_type.vg', 'VG (Glicerina)', 'product_types'),
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
-- ŠPANĚLSKÉ PŘEKLADY (es)
-- ============================================

INSERT INTO translations (locale, key, value, category) VALUES
('es', 'nav.favorite_products', 'Productos favoritos', 'navigation'),
('es', 'products.title', 'Productos favoritos', 'products'),
('es', 'products.add_new', '+ AÑADIR', 'products'),
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
('es', 'products.form.rating', 'Calificación', 'products'),
('es', 'products.form.photo', 'Foto', 'products'),
('es', 'products.form.photo_select', 'Seleccionar de galería', 'products'),
('es', 'products.form.photo_take', 'Tomar foto', 'products'),
('es', 'products.form.url', 'URL del producto', 'products'),
('es', 'products.form.url_placeholder', 'https://...', 'products'),
('es', 'products.form.save', 'GUARDAR', 'products'),
('es', 'products.form.back', '◀ VOLVER', 'products'),
('es', 'products.form.name_required', 'El nombre del producto es obligatorio.', 'products'),
('es', 'products.form.type_required', 'Selecciona un tipo de producto.', 'products'),
('es', 'products.detail.title', 'Detalles del producto', 'products'),
('es', 'products.detail.edit', 'EDITAR', 'products'),
('es', 'products.detail.delete', 'ELIMINAR', 'products'),
('es', 'products.detail.open_link', '🔗 Abrir enlace del producto', 'products'),
('es', 'products.detail.added', 'Añadido:', 'products'),
('es', 'products.detail.confirm_delete', '¿Estás seguro de que quieres eliminar este producto?', 'products'),
('es', 'product_type.vg', 'VG (Glicerina)', 'product_types'),
('es', 'product_type.pg', 'PG (Propilenglicol)', 'product_types'),
('es', 'product_type.flavor', 'Aroma', 'product_types'),
('es', 'product_type.nicotine_booster', 'Booster de nicotina', 'product_types'),
('es', 'product_type.nicotine_salt', 'Sal de nicotina', 'product_types'),
('es', 'search.label', '🔍 Buscar', 'search'),
('es', 'search.placeholder', 'Nombre o descripción...', 'search'),
('es', 'search.type_label', '📦 Tipo', 'search'),
('es', 'search.type_all', 'Todos los tipos', 'search'),
('es', 'search.rating_label', '⭐ Calificación', 'search'),
('es', 'search.clear_rating', 'Limpiar filtro', 'search'),
('es', 'search.results_found', '{count} de {total} productos encontrados.', 'search'),
('es', 'search.no_results', 'Ningún producto coincide con los filtros.', 'search'),
('es', 'search.recipes_found', '{count} de {total} recetas encontradas.', 'search'),
('es', 'search.no_recipes', 'Ninguna receta coincide con los filtros.', 'search'),
('es', 'recipes.title', 'Mis recetas', 'recipes'),
('es', 'recipes.no_recipes', 'Aún no tienes recetas guardadas.', 'recipes'),
('es', 'recipes.loading', 'Cargando recetas...', 'recipes'),
('es', 'recipes.error_loading', 'Error al cargar las recetas.', 'recipes')

ON CONFLICT (locale, key) DO UPDATE SET value = EXCLUDED.value;

-- ============================================
-- PORTUGALSKÉ PŘEKLADY (pt)
-- ============================================

INSERT INTO translations (locale, key, value, category) VALUES
('pt', 'nav.favorite_products', 'Produtos favoritos', 'navigation'),
('pt', 'products.title', 'Produtos favoritos', 'products'),
('pt', 'products.add_new', '+ ADICIONAR', 'products'),
('pt', 'products.no_products', 'Ainda não tem produtos favoritos.', 'products'),
('pt', 'products.loading', 'A carregar produtos...', 'products'),
('pt', 'products.error_loading', 'Erro ao carregar produtos.', 'products'),
('pt', 'products.form.title_add', 'Adicionar produto', 'products'),
('pt', 'products.form.title_edit', 'Editar produto', 'products'),
('pt', 'products.form.name', 'Nome', 'products'),
('pt', 'products.form.type', 'Tipo de produto', 'products'),
('pt', 'products.form.type_select', '-- Selecionar tipo --', 'products'),
('pt', 'products.form.description', 'Descrição', 'products'),
('pt', 'products.form.rating', 'Avaliação', 'products'),
('pt', 'products.form.save', 'GUARDAR', 'products'),
('pt', 'products.form.back', '◀ VOLTAR', 'products'),
('pt', 'product_type.vg', 'VG (Glicerina)', 'product_types'),
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
('pt', 'search.results_found', '{count} de {total} produtos encontrados.', 'search'),
('pt', 'search.no_results', 'Nenhum produto corresponde aos filtros.', 'search'),
('pt', 'search.recipes_found', '{count} de {total} receitas encontradas.', 'search'),
('pt', 'search.no_recipes', 'Nenhuma receita corresponde aos filtros.', 'search'),
('pt', 'recipes.title', 'Minhas receitas', 'recipes'),
('pt', 'recipes.no_recipes', 'Ainda não tem receitas guardadas.', 'recipes'),
('pt', 'recipes.loading', 'A carregar receitas...', 'recipes'),
('pt', 'recipes.error_loading', 'Erro ao carregar receitas.', 'recipes')

ON CONFLICT (locale, key) DO UPDATE SET value = EXCLUDED.value;

-- ============================================
-- NIZOZEMSKÉ PŘEKLADY (nl)
-- ============================================

INSERT INTO translations (locale, key, value, category) VALUES
('nl', 'nav.favorite_products', 'Favoriete producten', 'navigation'),
('nl', 'products.title', 'Favoriete producten', 'products'),
('nl', 'products.add_new', '+ TOEVOEGEN', 'products'),
('nl', 'products.no_products', 'Je hebt nog geen favoriete producten.', 'products'),
('nl', 'products.loading', 'Producten laden...', 'products'),
('nl', 'products.error_loading', 'Fout bij laden van producten.', 'products'),
('nl', 'products.form.title_add', 'Product toevoegen', 'products'),
('nl', 'products.form.title_edit', 'Product bewerken', 'products'),
('nl', 'products.form.name', 'Naam', 'products'),
('nl', 'products.form.type', 'Producttype', 'products'),
('nl', 'products.form.type_select', '-- Type selecteren --', 'products'),
('nl', 'products.form.description', 'Beschrijving', 'products'),
('nl', 'products.form.rating', 'Beoordeling', 'products'),
('nl', 'products.form.save', 'OPSLAAN', 'products'),
('nl', 'products.form.back', '◀ TERUG', 'products'),
('nl', 'product_type.vg', 'VG (Glycerine)', 'product_types'),
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
('nl', 'recipes.error_loading', 'Fout bij laden van recepten.', 'recipes')

ON CONFLICT (locale, key) DO UPDATE SET value = EXCLUDED.value;

-- ============================================
-- RUSKÉ PŘEKLADY (ru)
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
('ru', 'products.form.type', 'Тип продукта', 'products'),
('ru', 'products.form.type_select', '-- Выберите тип --', 'products'),
('ru', 'products.form.description', 'Описание', 'products'),
('ru', 'products.form.rating', 'Рейтинг', 'products'),
('ru', 'products.form.save', 'СОХРАНИТЬ', 'products'),
('ru', 'products.form.back', '◀ НАЗАД', 'products'),
('ru', 'product_type.vg', 'VG (Глицерин)', 'product_types'),
('ru', 'product_type.pg', 'PG (Пропиленгликоль)', 'product_types'),
('ru', 'product_type.flavor', 'Ароматизатор', 'product_types'),
('ru', 'product_type.nicotine_booster', 'Никотиновый бустер', 'product_types'),
('ru', 'product_type.nicotine_salt', 'Никотиновая соль', 'product_types'),
('ru', 'search.label', '🔍 Поиск', 'search'),
('ru', 'search.placeholder', 'Название или описание...', 'search'),
('ru', 'search.type_label', '📦 Тип', 'search'),
('ru', 'search.type_all', 'Все типы', 'search'),
('ru', 'search.rating_label', '⭐ Рейтинг', 'search'),
('ru', 'search.clear_rating', 'Очистить фильтр', 'search'),
('ru', 'search.results_found', 'Найдено {count} из {total} продуктов.', 'search'),
('ru', 'search.no_results', 'Нет продуктов, соответствующих фильтрам.', 'search'),
('ru', 'search.recipes_found', 'Найдено {count} из {total} рецептов.', 'search'),
('ru', 'search.no_recipes', 'Нет рецептов, соответствующих фильтрам.', 'search'),
('ru', 'recipes.title', 'Мои рецепты', 'recipes'),
('ru', 'recipes.no_recipes', 'У вас пока нет сохраненных рецептов.', 'recipes'),
('ru', 'recipes.loading', 'Загрузка рецептов...', 'recipes'),
('ru', 'recipes.error_loading', 'Ошибка при загрузке рецептов.', 'recipes')

ON CONFLICT (locale, key) DO UPDATE SET value = EXCLUDED.value;

-- ============================================
-- JAPONSKÉ PŘEKLADY (ja)
-- ============================================

INSERT INTO translations (locale, key, value, category) VALUES
('ja', 'nav.favorite_products', 'お気に入り製品', 'navigation'),
('ja', 'products.title', 'お気に入り製品', 'products'),
('ja', 'products.add_new', '+ 追加', 'products'),
('ja', 'products.no_products', 'お気に入り製品はまだありません。', 'products'),
('ja', 'products.loading', '製品を読み込み中...', 'products'),
('ja', 'products.error_loading', '製品の読み込みエラー。', 'products'),
('ja', 'products.form.title_add', '製品を追加', 'products'),
('ja', 'products.form.title_edit', '製品を編集', 'products'),
('ja', 'products.form.name', '名前', 'products'),
('ja', 'products.form.type', '製品タイプ', 'products'),
('ja', 'products.form.type_select', '-- タイプを選択 --', 'products'),
('ja', 'products.form.description', '説明', 'products'),
('ja', 'products.form.rating', '評価', 'products'),
('ja', 'products.form.save', '保存', 'products'),
('ja', 'products.form.back', '◀ 戻る', 'products'),
('ja', 'product_type.vg', 'VG（グリセリン）', 'product_types'),
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
('ja', 'recipes.error_loading', 'レシピの読み込みエラー。', 'recipes')

ON CONFLICT (locale, key) DO UPDATE SET value = EXCLUDED.value;

-- ============================================
-- KOREJSKÉ PŘEKLADY (ko)
-- ============================================

INSERT INTO translations (locale, key, value, category) VALUES
('ko', 'nav.favorite_products', '즐겨찾기 제품', 'navigation'),
('ko', 'products.title', '즐겨찾기 제품', 'products'),
('ko', 'products.add_new', '+ 추가', 'products'),
('ko', 'products.no_products', '즐겨찾기 제품이 없습니다.', 'products'),
('ko', 'products.loading', '제품 로딩 중...', 'products'),
('ko', 'products.error_loading', '제품 로딩 오류.', 'products'),
('ko', 'products.form.title_add', '제품 추가', 'products'),
('ko', 'products.form.title_edit', '제품 편집', 'products'),
('ko', 'products.form.name', '이름', 'products'),
('ko', 'products.form.type', '제품 유형', 'products'),
('ko', 'products.form.type_select', '-- 유형 선택 --', 'products'),
('ko', 'products.form.description', '설명', 'products'),
('ko', 'products.form.rating', '평점', 'products'),
('ko', 'products.form.save', '저장', 'products'),
('ko', 'products.form.back', '◀ 뒤로', 'products'),
('ko', 'product_type.vg', 'VG (글리세린)', 'product_types'),
('ko', 'product_type.pg', 'PG (프로필렌 글리콜)', 'product_types'),
('ko', 'product_type.flavor', '향료', 'product_types'),
('ko', 'product_type.nicotine_booster', '니코틴 부스터', 'product_types'),
('ko', 'product_type.nicotine_salt', '니코틴 솔트', 'product_types'),
('ko', 'search.label', '🔍 검색', 'search'),
('ko', 'search.placeholder', '이름 또는 설명...', 'search'),
('ko', 'search.type_label', '📦 유형', 'search'),
('ko', 'search.type_all', '모든 유형', 'search'),
('ko', 'search.rating_label', '⭐ 평점', 'search'),
('ko', 'search.clear_rating', '필터 지우기', 'search'),
('ko', 'search.results_found', '{total}개 중 {count}개 제품 발견.', 'search'),
('ko', 'search.no_results', '필터와 일치하는 제품이 없습니다.', 'search'),
('ko', 'search.recipes_found', '{total}개 중 {count}개 레시피 발견.', 'search'),
('ko', 'search.no_recipes', '필터와 일치하는 레시피가 없습니다.', 'search'),
('ko', 'recipes.title', '내 레시피', 'recipes'),
('ko', 'recipes.no_recipes', '저장된 레시피가 없습니다.', 'recipes'),
('ko', 'recipes.loading', '레시피 로딩 중...', 'recipes'),
('ko', 'recipes.error_loading', '레시피 로딩 오류.', 'recipes')

ON CONFLICT (locale, key) DO UPDATE SET value = EXCLUDED.value;

-- ============================================
-- OVĚŘENÍ
-- ============================================

SELECT 'Překlady pro filtry a produkty přidány!' as status;
SELECT locale, COUNT(*) as count FROM translations WHERE category IN ('products', 'product_types', 'search', 'recipes') GROUP BY locale ORDER BY locale;
