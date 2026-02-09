-- =====================================================
-- 100 Oblíbených příchutí pro LiquiMixer
-- 50 VAPE + 50 SHISHA příchutí
-- Všechny s vyplněnými min%, max%, recommended%, steep_days a vg_ratio
-- =====================================================

-- Nejprve přidat sloupec vg_ratio pokud neexistuje
ALTER TABLE flavors 
ADD COLUMN IF NOT EXISTS vg_ratio INT DEFAULT 0 CHECK (vg_ratio >= 0 AND vg_ratio <= 100);

-- Zajistit existenci výrobců
INSERT INTO flavor_manufacturers (code, name, country_code, type, website)
VALUES 
    ('TPA', 'The Flavor Apprentice', 'US', 'vape', 'https://shop.perfumersapprentice.com'),
    ('CAP', 'Capella Flavors', 'US', 'vape', 'https://capellaflavors.com'),
    ('FA', 'FlavourArt', 'IT', 'vape', 'https://flavourart.com'),
    ('FLV', 'Flavorah', 'US', 'vape', 'https://flavorah.com'),
    ('INW', 'Inawera', 'PL', 'vape', 'https://inaweraflavours.com'),
    ('JF', 'Jungle Flavors', 'US', 'vape', 'https://jungleflavors.com'),
    ('WF', 'Wonder Flavours', 'CA', 'vape', 'https://wonderflavours.com'),
    ('ALF', 'Al Fakher', 'AE', 'shisha', 'https://www.alfakher.com'),
    ('ADA', 'Adalya', 'DE', 'shisha', 'https://www.adalya.de'),
    ('STB', 'Starbuzz', 'US', 'shisha', 'https://www.starbuzztobacco.com'),
    ('FUM', 'Fumari', 'US', 'shisha', 'https://www.fumari.com'),
    ('DRK', 'Darkside', 'RU', 'shisha', 'https://www.darkside.ru'),
    ('TGO', 'Tangiers', 'US', 'shisha', 'https://www.tangiers.us')
ON CONFLICT (code) DO NOTHING;

-- =====================================================
-- VAPE PŘÍCHUTĚ (50 kusů)
-- vg_ratio: 0 = 100% PG (většina vape aromat je PG based)
-- =====================================================
INSERT INTO flavors (name, manufacturer_code, product_type, category, min_percent, max_percent, recommended_percent, steep_days, vg_ratio, status) VALUES
    -- TPA (10)
    ('Strawberry Ripe', 'TPA', 'vape', 'fruit', 4.0, 8.0, 6.0, 7, 0, 'active'),
    ('Vanilla Swirl', 'TPA', 'vape', 'cream', 3.0, 6.0, 4.0, 14, 0, 'active'),
    ('Banana Cream', 'TPA', 'vape', 'cream', 4.0, 7.0, 5.0, 14, 0, 'active'),
    ('Dragonfruit', 'TPA', 'vape', 'tropical', 3.0, 6.0, 4.5, 5, 0, 'active'),
    ('Honeydew', 'TPA', 'vape', 'fruit', 3.0, 6.0, 4.0, 5, 0, 'active'),
    ('Bavarian Cream', 'TPA', 'vape', 'cream', 2.0, 5.0, 3.5, 14, 0, 'active'),
    ('Cheesecake Graham Crust', 'TPA', 'vape', 'dessert', 3.0, 6.0, 4.0, 21, 0, 'active'),
    ('Peach Juicy', 'TPA', 'vape', 'fruit', 3.0, 6.0, 4.5, 7, 0, 'active'),
    ('Coconut Extra', 'TPA', 'vape', 'tropical', 2.0, 4.0, 3.0, 7, 0, 'active'),
    ('French Vanilla Deluxe', 'TPA', 'vape', 'cream', 2.0, 5.0, 3.5, 14, 0, 'active'),
    -- CAP (10)
    ('Vanilla Custard V1', 'CAP', 'vape', 'cream', 3.0, 7.0, 5.0, 21, 0, 'active'),
    ('Sweet Strawberry', 'CAP', 'vape', 'fruit', 4.0, 8.0, 6.0, 7, 0, 'active'),
    ('Sugar Cookie', 'CAP', 'vape', 'bakery', 2.0, 5.0, 3.5, 14, 0, 'active'),
    ('Graham Cracker V2', 'CAP', 'vape', 'bakery', 2.0, 4.0, 3.0, 14, 0, 'active'),
    ('New York Cheesecake', 'CAP', 'vape', 'dessert', 3.0, 6.0, 4.5, 21, 0, 'active'),
    ('Lemon Meringue Pie', 'CAP', 'vape', 'dessert', 3.0, 6.0, 4.5, 14, 0, 'active'),
    ('Juicy Orange', 'CAP', 'vape', 'citrus', 3.0, 6.0, 4.5, 5, 0, 'active'),
    ('Golden Pineapple', 'CAP', 'vape', 'tropical', 2.0, 5.0, 3.5, 5, 0, 'active'),
    ('Double Apple', 'CAP', 'vape', 'fruit', 3.0, 6.0, 4.5, 7, 0, 'active'),
    ('Butter Cream', 'CAP', 'vape', 'cream', 1.0, 3.0, 2.0, 14, 0, 'active'),
    -- FA (10)
    ('Fuji Apple', 'FA', 'vape', 'fruit', 2.0, 4.0, 3.0, 5, 0, 'active'),
    ('Cream Fresh', 'FA', 'vape', 'cream', 1.0, 3.0, 2.0, 14, 0, 'active'),
    ('Meringue', 'FA', 'vape', 'dessert', 1.0, 2.5, 1.5, 7, 0, 'active'),
    ('Forest Fruit', 'FA', 'vape', 'berry', 2.0, 4.0, 3.0, 7, 0, 'active'),
    ('Kiwi', 'FA', 'vape', 'tropical', 1.5, 3.0, 2.0, 5, 0, 'active'),
    ('Catalan Cream', 'FA', 'vape', 'cream', 1.0, 2.5, 1.5, 14, 0, 'active'),
    ('Tiramisu', 'FA', 'vape', 'dessert', 2.0, 4.0, 3.0, 21, 0, 'active'),
    ('Virginia', 'FA', 'vape', 'tobacco', 2.0, 4.0, 3.0, 21, 0, 'active'),
    ('Polar Blast', 'FA', 'vape', 'menthol', 0.5, 2.0, 1.0, 1, 0, 'active'),
    ('Cookie', 'FA', 'vape', 'bakery', 1.5, 3.5, 2.5, 14, 0, 'active'),
    -- FLV (5)
    ('Cream', 'FLV', 'vape', 'cream', 0.5, 2.0, 1.0, 14, 0, 'active'),
    ('Vanilla Custard', 'FLV', 'vape', 'cream', 1.0, 3.0, 2.0, 21, 0, 'active'),
    ('Strawberry', 'FLV', 'vape', 'fruit', 1.0, 3.0, 2.0, 5, 0, 'active'),
    ('Rich Cinnamon', 'FLV', 'vape', 'spice', 0.5, 1.5, 1.0, 7, 0, 'active'),
    ('Mango', 'FLV', 'vape', 'tropical', 1.0, 3.0, 2.0, 5, 0, 'active'),
    -- INW (5)
    ('Yes We Cheesecake', 'INW', 'vape', 'dessert', 2.0, 5.0, 3.0, 21, 0, 'active'),
    ('Biscuit', 'INW', 'vape', 'bakery', 1.0, 3.0, 2.0, 14, 0, 'active'),
    ('Shisha Strawberry', 'INW', 'vape', 'fruit', 2.0, 4.0, 3.0, 5, 0, 'active'),
    ('Marzipan', 'INW', 'vape', 'nuts', 1.0, 3.0, 2.0, 14, 0, 'active'),
    ('Cactus', 'INW', 'vape', 'tropical', 0.5, 2.0, 1.0, 3, 0, 'active'),
    -- JF (5)
    ('Yellow Cake', 'JF', 'vape', 'bakery', 1.0, 3.0, 2.0, 14, 0, 'active'),
    ('Honey Peach', 'JF', 'vape', 'fruit', 1.5, 3.5, 2.5, 5, 0, 'active'),
    ('Sweet Strawberry', 'JF', 'vape', 'fruit', 2.0, 4.0, 3.0, 5, 0, 'active'),
    ('Bavarian Cream', 'JF', 'vape', 'cream', 1.0, 2.5, 1.5, 14, 0, 'active'),
    ('Fresh Cream', 'JF', 'vape', 'cream', 0.5, 2.0, 1.0, 14, 0, 'active'),
    -- WF (5)
    ('Strawberry Gummy Candy', 'WF', 'vape', 'candy', 2.0, 4.0, 3.0, 5, 0, 'active'),
    ('Vanilla Ruyan Custard', 'WF', 'vape', 'cream', 2.0, 4.0, 3.0, 21, 0, 'active'),
    ('Sour Blue Raspberry Candy', 'WF', 'vape', 'candy', 2.0, 5.0, 3.5, 3, 0, 'active'),
    ('Island Mango', 'WF', 'vape', 'tropical', 1.5, 3.5, 2.5, 5, 0, 'active'),
    ('Flapper Pie', 'WF', 'vape', 'dessert', 2.0, 4.0, 3.0, 14, 0, 'active')
ON CONFLICT DO NOTHING;

-- =====================================================
-- SHISHA PŘÍCHUTĚ (50 kusů)
-- vg_ratio: 50 = typicky 50% VG pro shisha koncentráty
-- Shisha příchutě mají vyšší procenta a jiný VG/PG poměr
-- =====================================================
INSERT INTO flavors (name, manufacturer_code, product_type, category, min_percent, max_percent, recommended_percent, steep_days, vg_ratio, status) VALUES
    -- Al Fakher (10)
    ('Two Apples', 'ALF', 'shisha', 'fruit', 15.0, 25.0, 20.0, 3, 50, 'active'),
    ('Watermelon Mint', 'ALF', 'shisha', 'fruit', 15.0, 25.0, 20.0, 2, 50, 'active'),
    ('Peach', 'ALF', 'shisha', 'fruit', 15.0, 25.0, 20.0, 2, 50, 'active'),
    ('Lemon Mint', 'ALF', 'shisha', 'citrus', 15.0, 25.0, 20.0, 2, 50, 'active'),
    ('Orange', 'ALF', 'shisha', 'citrus', 15.0, 25.0, 20.0, 2, 50, 'active'),
    ('Grape Mint', 'ALF', 'shisha', 'fruit', 15.0, 25.0, 20.0, 2, 50, 'active'),
    ('Cherry', 'ALF', 'shisha', 'fruit', 15.0, 25.0, 20.0, 2, 50, 'active'),
    ('Blueberry', 'ALF', 'shisha', 'berry', 15.0, 25.0, 20.0, 2, 50, 'active'),
    ('Mango', 'ALF', 'shisha', 'tropical', 15.0, 25.0, 20.0, 2, 50, 'active'),
    ('Strawberry', 'ALF', 'shisha', 'fruit', 15.0, 25.0, 20.0, 2, 50, 'active'),
    -- Adalya (10)
    ('Love 66', 'ADA', 'shisha', 'mix', 18.0, 28.0, 23.0, 3, 50, 'active'),
    ('Lady Killer', 'ADA', 'shisha', 'mix', 18.0, 28.0, 23.0, 3, 50, 'active'),
    ('Hawaii', 'ADA', 'shisha', 'tropical', 18.0, 28.0, 23.0, 2, 50, 'active'),
    ('Ice Bonbon', 'ADA', 'shisha', 'candy', 18.0, 28.0, 23.0, 2, 50, 'active'),
    ('Baku Nights', 'ADA', 'shisha', 'mix', 18.0, 28.0, 23.0, 3, 50, 'active'),
    ('Blueberry Mint', 'ADA', 'shisha', 'berry', 18.0, 28.0, 23.0, 2, 50, 'active'),
    ('Mango Tango', 'ADA', 'shisha', 'tropical', 18.0, 28.0, 23.0, 2, 50, 'active'),
    ('Watermelon', 'ADA', 'shisha', 'fruit', 18.0, 28.0, 23.0, 2, 50, 'active'),
    ('Grape', 'ADA', 'shisha', 'fruit', 18.0, 28.0, 23.0, 2, 50, 'active'),
    ('Raspberry Pie', 'ADA', 'shisha', 'dessert', 18.0, 28.0, 23.0, 3, 50, 'active'),
    -- Starbuzz (10)
    ('Blue Mist', 'STB', 'shisha', 'mix', 20.0, 30.0, 25.0, 3, 50, 'active'),
    ('Sex on the Beach', 'STB', 'shisha', 'mix', 20.0, 30.0, 25.0, 3, 50, 'active'),
    ('Code 69', 'STB', 'shisha', 'mix', 20.0, 30.0, 25.0, 3, 50, 'active'),
    ('Pirates Cave', 'STB', 'shisha', 'mix', 20.0, 30.0, 25.0, 3, 50, 'active'),
    ('Margarita Freeze', 'STB', 'shisha', 'drink', 20.0, 30.0, 25.0, 2, 50, 'active'),
    ('Citrus Mist', 'STB', 'shisha', 'citrus', 20.0, 30.0, 25.0, 2, 50, 'active'),
    ('Exotic', 'STB', 'shisha', 'tropical', 20.0, 30.0, 25.0, 2, 50, 'active'),
    ('Apple Doppio', 'STB', 'shisha', 'fruit', 20.0, 30.0, 25.0, 2, 50, 'active'),
    ('Safari Melon Dew', 'STB', 'shisha', 'fruit', 20.0, 30.0, 25.0, 2, 50, 'active'),
    ('Irish Peach', 'STB', 'shisha', 'fruit', 20.0, 30.0, 25.0, 2, 50, 'active'),
    -- Fumari (10)
    ('White Gummi Bear', 'FUM', 'shisha', 'candy', 18.0, 28.0, 23.0, 2, 50, 'active'),
    ('Ambrosia', 'FUM', 'shisha', 'mix', 18.0, 28.0, 23.0, 3, 50, 'active'),
    ('Blueberry Muffin', 'FUM', 'shisha', 'bakery', 18.0, 28.0, 23.0, 3, 50, 'active'),
    ('Mint Chocolate Chill', 'FUM', 'shisha', 'dessert', 18.0, 28.0, 23.0, 3, 50, 'active'),
    ('Spiced Chai', 'FUM', 'shisha', 'spice', 18.0, 28.0, 23.0, 3, 50, 'active'),
    ('Tangelo', 'FUM', 'shisha', 'citrus', 18.0, 28.0, 23.0, 2, 50, 'active'),
    ('Island Papaya', 'FUM', 'shisha', 'tropical', 18.0, 28.0, 23.0, 2, 50, 'active'),
    ('Mandarin Zest', 'FUM', 'shisha', 'citrus', 18.0, 28.0, 23.0, 2, 50, 'active'),
    ('Red Gummy Bear', 'FUM', 'shisha', 'candy', 18.0, 28.0, 23.0, 2, 50, 'active'),
    ('French Vanilla', 'FUM', 'shisha', 'cream', 18.0, 28.0, 23.0, 3, 50, 'active'),
    -- Darkside (5)
    ('Falling Star', 'DRK', 'shisha', 'mix', 16.0, 26.0, 21.0, 3, 50, 'active'),
    ('Cosmo Flower', 'DRK', 'shisha', 'mix', 16.0, 26.0, 21.0, 3, 50, 'active'),
    ('Bananapapa', 'DRK', 'shisha', 'fruit', 16.0, 26.0, 21.0, 2, 50, 'active'),
    ('Polar Cream', 'DRK', 'shisha', 'cream', 16.0, 26.0, 21.0, 3, 50, 'active'),
    ('Supernova', 'DRK', 'shisha', 'mix', 16.0, 26.0, 21.0, 3, 50, 'active'),
    -- Tangiers (5)
    ('Cane Mint', 'TGO', 'shisha', 'mint', 15.0, 25.0, 20.0, 3, 50, 'active'),
    ('Kashmir Peach', 'TGO', 'shisha', 'fruit', 15.0, 25.0, 20.0, 3, 50, 'active'),
    ('Orange Soda', 'TGO', 'shisha', 'drink', 15.0, 25.0, 20.0, 2, 50, 'active'),
    ('Mimon', 'TGO', 'shisha', 'citrus', 15.0, 25.0, 20.0, 2, 50, 'active'),
    ('Horchata', 'TGO', 'shisha', 'drink', 15.0, 25.0, 20.0, 3, 50, 'active')
ON CONFLICT DO NOTHING;

-- Výpis počtu přidaných příchutí
SELECT 
    product_type,
    vg_ratio,
    COUNT(*) as count 
FROM flavors 
GROUP BY product_type, vg_ratio
ORDER BY product_type, vg_ratio;
