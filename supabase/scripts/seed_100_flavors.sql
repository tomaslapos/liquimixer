-- =====================================================
-- 100 Oblíbených příchutí pro LiquiMixer
-- 50 VAPE + 50 SHISHA příchutí
-- Všechny s vyplněnými min%, max%, recommended% a steep_days
-- =====================================================

-- Nejprve zajistit existenci výrobců
INSERT INTO flavor_manufacturers (code, name, country, website, product_types)
VALUES 
    ('TPA', 'The Flavor Apprentice', 'USA', 'https://shop.perfumersapprentice.com', ARRAY['vape']),
    ('CAP', 'Capella Flavors', 'USA', 'https://capellaflavors.com', ARRAY['vape']),
    ('FA', 'FlavourArt', 'Italy', 'https://flavourart.com', ARRAY['vape']),
    ('FLV', 'Flavorah', 'USA', 'https://flavorah.com', ARRAY['vape']),
    ('INW', 'Inawera', 'Poland', 'https://inaweraflavours.com', ARRAY['vape']),
    ('JF', 'Jungle Flavors', 'USA', 'https://jungleflavors.com', ARRAY['vape']),
    ('WF', 'Wonder Flavours', 'Canada', 'https://wonderflavours.com', ARRAY['vape']),
    ('LB', 'LorAnn', 'USA', 'https://www.lorannoils.com', ARRAY['vape']),
    ('MF', 'Medicine Flower', 'USA', 'https://www.medicineflower.com', ARRAY['vape']),
    ('OOO', 'One on One', 'USA', 'https://www.ecigexpress.com', ARRAY['vape']),
    ('ALF', 'Al Fakher', 'UAE', 'https://www.alfakher.com', ARRAY['shisha']),
    ('ADA', 'Adalya', 'Germany', 'https://www.adalya.de', ARRAY['shisha']),
    ('STB', 'Starbuzz', 'USA', 'https://www.starbuzztobacco.com', ARRAY['shisha']),
    ('FUM', 'Fumari', 'USA', 'https://www.fumari.com', ARRAY['shisha']),
    ('DRK', 'Darkside', 'Russia', 'https://www.darkside.ru', ARRAY['shisha']),
    ('TGO', 'Tangiers', 'USA', 'https://www.tangiers.us', ARRAY['shisha']),
    ('HOL', 'Holster', 'Germany', 'https://www.holster-tobacco.com', ARRAY['shisha']),
    ('MZO', 'Mazaya', 'Jordan', 'https://www.mazaya.com', ARRAY['shisha']),
    ('NAK', 'Nakhla', 'Egypt', 'https://www.nakhla.com', ARRAY['shisha']),
    ('ARG', 'Argelini', 'Turkey', 'https://www.argelini.com', ARRAY['shisha'])
ON CONFLICT (code) DO NOTHING;

-- =====================================================
-- VAPE PŘÍCHUTĚ (50 kusů)
-- =====================================================
INSERT INTO flavors (name, manufacturer_code, product_type, category, min_percent, max_percent, recommended_percent, steep_days, status) VALUES
    -- TPA (10)
    ('Strawberry Ripe', 'TPA', 'vape', 'fruit', 4.0, 8.0, 6.0, 7, 'active'),
    ('Vanilla Swirl', 'TPA', 'vape', 'cream', 3.0, 6.0, 4.0, 14, 'active'),
    ('Banana Cream', 'TPA', 'vape', 'cream', 4.0, 7.0, 5.0, 14, 'active'),
    ('Dragonfruit', 'TPA', 'vape', 'tropical', 3.0, 6.0, 4.5, 5, 'active'),
    ('Honeydew', 'TPA', 'vape', 'fruit', 3.0, 6.0, 4.0, 5, 'active'),
    ('Bavarian Cream', 'TPA', 'vape', 'cream', 2.0, 5.0, 3.5, 14, 'active'),
    ('Cheesecake Graham Crust', 'TPA', 'vape', 'dessert', 3.0, 6.0, 4.0, 21, 'active'),
    ('Peach Juicy', 'TPA', 'vape', 'fruit', 3.0, 6.0, 4.5, 7, 'active'),
    ('Coconut Extra', 'TPA', 'vape', 'tropical', 2.0, 4.0, 3.0, 7, 'active'),
    ('French Vanilla Deluxe', 'TPA', 'vape', 'cream', 2.0, 5.0, 3.5, 14, 'active'),
    
    -- CAP (10)
    ('Vanilla Custard V1', 'CAP', 'vape', 'cream', 3.0, 7.0, 5.0, 21, 'active'),
    ('Sweet Strawberry', 'CAP', 'vape', 'fruit', 4.0, 8.0, 6.0, 7, 'active'),
    ('Sugar Cookie', 'CAP', 'vape', 'bakery', 2.0, 5.0, 3.5, 14, 'active'),
    ('Graham Cracker V2', 'CAP', 'vape', 'bakery', 2.0, 4.0, 3.0, 14, 'active'),
    ('New York Cheesecake', 'CAP', 'vape', 'dessert', 3.0, 6.0, 4.5, 21, 'active'),
    ('Lemon Meringue Pie', 'CAP', 'vape', 'dessert', 3.0, 6.0, 4.5, 14, 'active'),
    ('Juicy Orange', 'CAP', 'vape', 'citrus', 3.0, 6.0, 4.5, 5, 'active'),
    ('Golden Pineapple', 'CAP', 'vape', 'tropical', 2.0, 5.0, 3.5, 5, 'active'),
    ('Double Apple', 'CAP', 'vape', 'fruit', 3.0, 6.0, 4.5, 7, 'active'),
    ('Butter Cream', 'CAP', 'vape', 'cream', 1.0, 3.0, 2.0, 14, 'active'),
    
    -- FA (10)
    ('Fuji Apple', 'FA', 'vape', 'fruit', 2.0, 4.0, 3.0, 5, 'active'),
    ('Cream Fresh', 'FA', 'vape', 'cream', 1.0, 3.0, 2.0, 14, 'active'),
    ('Meringue', 'FA', 'vape', 'dessert', 1.0, 2.5, 1.5, 7, 'active'),
    ('Forest Fruit', 'FA', 'vape', 'berry', 2.0, 4.0, 3.0, 7, 'active'),
    ('Kiwi', 'FA', 'vape', 'tropical', 1.5, 3.0, 2.0, 5, 'active'),
    ('Catalan Cream', 'FA', 'vape', 'cream', 1.0, 2.5, 1.5, 14, 'active'),
    ('Tiramisu', 'FA', 'vape', 'dessert', 2.0, 4.0, 3.0, 21, 'active'),
    ('Virginia', 'FA', 'vape', 'tobacco', 2.0, 4.0, 3.0, 21, 'active'),
    ('Polar Blast', 'FA', 'vape', 'menthol', 0.5, 2.0, 1.0, 1, 'active'),
    ('Cookie', 'FA', 'vape', 'bakery', 1.5, 3.5, 2.5, 14, 'active'),
    
    -- FLV (5)
    ('Cream', 'FLV', 'vape', 'cream', 0.5, 2.0, 1.0, 14, 'active'),
    ('Vanilla Custard', 'FLV', 'vape', 'cream', 1.0, 3.0, 2.0, 21, 'active'),
    ('Strawberry', 'FLV', 'vape', 'fruit', 1.0, 3.0, 2.0, 5, 'active'),
    ('Rich Cinnamon', 'FLV', 'vape', 'spice', 0.5, 1.5, 1.0, 7, 'active'),
    ('Mango', 'FLV', 'vape', 'tropical', 1.0, 3.0, 2.0, 5, 'active'),
    
    -- INW (5)
    ('Yes We Cheesecake', 'INW', 'vape', 'dessert', 2.0, 5.0, 3.0, 21, 'active'),
    ('Biscuit', 'INW', 'vape', 'bakery', 1.0, 3.0, 2.0, 14, 'active'),
    ('Shisha Strawberry', 'INW', 'vape', 'fruit', 2.0, 4.0, 3.0, 5, 'active'),
    ('Marzipan', 'INW', 'vape', 'nuts', 1.0, 3.0, 2.0, 14, 'active'),
    ('Cactus', 'INW', 'vape', 'tropical', 0.5, 2.0, 1.0, 3, 'active'),
    
    -- JF (5)
    ('Yellow Cake', 'JF', 'vape', 'bakery', 1.0, 3.0, 2.0, 14, 'active'),
    ('Honey Peach', 'JF', 'vape', 'fruit', 1.5, 3.5, 2.5, 5, 'active'),
    ('Sweet Strawberry', 'JF', 'vape', 'fruit', 2.0, 4.0, 3.0, 5, 'active'),
    ('Bavarian Cream', 'JF', 'vape', 'cream', 1.0, 2.5, 1.5, 14, 'active'),
    ('Fresh Cream', 'JF', 'vape', 'cream', 0.5, 2.0, 1.0, 14, 'active'),
    
    -- WF (5)
    ('Strawberry Gummy Candy', 'WF', 'vape', 'candy', 2.0, 4.0, 3.0, 5, 'active'),
    ('Vanilla Ruyan Custard', 'WF', 'vape', 'cream', 2.0, 4.0, 3.0, 21, 'active'),
    ('Sour Blue Raspberry Candy', 'WF', 'vape', 'candy', 2.0, 5.0, 3.5, 3, 'active'),
    ('Island Mango', 'WF', 'vape', 'tropical', 1.5, 3.5, 2.5, 5, 'active'),
    ('Flapper Pie', 'WF', 'vape', 'dessert', 2.0, 4.0, 3.0, 14, 'active')
ON CONFLICT DO NOTHING;

-- =====================================================
-- SHISHA PŘÍCHUTĚ (50 kusů)
-- Shisha příchutě mají jiné procenta - obvykle vyšší
-- =====================================================
INSERT INTO flavors (name, manufacturer_code, product_type, category, min_percent, max_percent, recommended_percent, steep_days, status) VALUES
    -- Al Fakher (10)
    ('Two Apples', 'ALF', 'shisha', 'fruit', 15.0, 25.0, 20.0, 3, 'active'),
    ('Watermelon Mint', 'ALF', 'shisha', 'fruit', 15.0, 25.0, 20.0, 2, 'active'),
    ('Peach', 'ALF', 'shisha', 'fruit', 15.0, 25.0, 20.0, 2, 'active'),
    ('Lemon Mint', 'ALF', 'shisha', 'citrus', 15.0, 25.0, 20.0, 2, 'active'),
    ('Orange', 'ALF', 'shisha', 'citrus', 15.0, 25.0, 20.0, 2, 'active'),
    ('Grape Mint', 'ALF', 'shisha', 'fruit', 15.0, 25.0, 20.0, 2, 'active'),
    ('Cherry', 'ALF', 'shisha', 'fruit', 15.0, 25.0, 20.0, 2, 'active'),
    ('Blueberry', 'ALF', 'shisha', 'berry', 15.0, 25.0, 20.0, 2, 'active'),
    ('Mango', 'ALF', 'shisha', 'tropical', 15.0, 25.0, 20.0, 2, 'active'),
    ('Strawberry', 'ALF', 'shisha', 'fruit', 15.0, 25.0, 20.0, 2, 'active'),
    
    -- Adalya (10)
    ('Love 66', 'ADA', 'shisha', 'mix', 18.0, 28.0, 23.0, 3, 'active'),
    ('Lady Killer', 'ADA', 'shisha', 'mix', 18.0, 28.0, 23.0, 3, 'active'),
    ('Hawaii', 'ADA', 'shisha', 'tropical', 18.0, 28.0, 23.0, 2, 'active'),
    ('Ice Bonbon', 'ADA', 'shisha', 'candy', 18.0, 28.0, 23.0, 2, 'active'),
    ('Baku Nights', 'ADA', 'shisha', 'mix', 18.0, 28.0, 23.0, 3, 'active'),
    ('Blueberry Mint', 'ADA', 'shisha', 'berry', 18.0, 28.0, 23.0, 2, 'active'),
    ('Mango Tango', 'ADA', 'shisha', 'tropical', 18.0, 28.0, 23.0, 2, 'active'),
    ('Watermelon', 'ADA', 'shisha', 'fruit', 18.0, 28.0, 23.0, 2, 'active'),
    ('Grape', 'ADA', 'shisha', 'fruit', 18.0, 28.0, 23.0, 2, 'active'),
    ('Raspberry Pie', 'ADA', 'shisha', 'dessert', 18.0, 28.0, 23.0, 3, 'active'),
    
    -- Starbuzz (10)
    ('Blue Mist', 'STB', 'shisha', 'mix', 20.0, 30.0, 25.0, 3, 'active'),
    ('Sex on the Beach', 'STB', 'shisha', 'mix', 20.0, 30.0, 25.0, 3, 'active'),
    ('Code 69', 'STB', 'shisha', 'mix', 20.0, 30.0, 25.0, 3, 'active'),
    ('Pirates Cave', 'STB', 'shisha', 'mix', 20.0, 30.0, 25.0, 3, 'active'),
    ('Margarita Freeze', 'STB', 'shisha', 'drink', 20.0, 30.0, 25.0, 2, 'active'),
    ('Citrus Mist', 'STB', 'shisha', 'citrus', 20.0, 30.0, 25.0, 2, 'active'),
    ('Exotic', 'STB', 'shisha', 'tropical', 20.0, 30.0, 25.0, 2, 'active'),
    ('Apple Doppio', 'STB', 'shisha', 'fruit', 20.0, 30.0, 25.0, 2, 'active'),
    ('Safari Melon Dew', 'STB', 'shisha', 'fruit', 20.0, 30.0, 25.0, 2, 'active'),
    ('Irish Peach', 'STB', 'shisha', 'fruit', 20.0, 30.0, 25.0, 2, 'active'),
    
    -- Fumari (10)
    ('White Gummi Bear', 'FUM', 'shisha', 'candy', 18.0, 28.0, 23.0, 2, 'active'),
    ('Ambrosia', 'FUM', 'shisha', 'mix', 18.0, 28.0, 23.0, 3, 'active'),
    ('Blueberry Muffin', 'FUM', 'shisha', 'bakery', 18.0, 28.0, 23.0, 3, 'active'),
    ('Mint Chocolate Chill', 'FUM', 'shisha', 'dessert', 18.0, 28.0, 23.0, 3, 'active'),
    ('Spiced Chai', 'FUM', 'shisha', 'spice', 18.0, 28.0, 23.0, 3, 'active'),
    ('Tangelo', 'FUM', 'shisha', 'citrus', 18.0, 28.0, 23.0, 2, 'active'),
    ('Island Papaya', 'FUM', 'shisha', 'tropical', 18.0, 28.0, 23.0, 2, 'active'),
    ('Mandarin Zest', 'FUM', 'shisha', 'citrus', 18.0, 28.0, 23.0, 2, 'active'),
    ('Red Gummy Bear', 'FUM', 'shisha', 'candy', 18.0, 28.0, 23.0, 2, 'active'),
    ('French Vanilla', 'FUM', 'shisha', 'cream', 18.0, 28.0, 23.0, 3, 'active'),
    
    -- Darkside (5)
    ('Falling Star', 'DRK', 'shisha', 'mix', 16.0, 26.0, 21.0, 3, 'active'),
    ('Cosmo Flower', 'DRK', 'shisha', 'mix', 16.0, 26.0, 21.0, 3, 'active'),
    ('Bananapapa', 'DRK', 'shisha', 'fruit', 16.0, 26.0, 21.0, 2, 'active'),
    ('Polar Cream', 'DRK', 'shisha', 'cream', 16.0, 26.0, 21.0, 3, 'active'),
    ('Supernova', 'DRK', 'shisha', 'mix', 16.0, 26.0, 21.0, 3, 'active'),
    
    -- Tangiers (5)
    ('Cane Mint', 'TGO', 'shisha', 'mint', 15.0, 25.0, 20.0, 3, 'active'),
    ('Kashmir Peach', 'TGO', 'shisha', 'fruit', 15.0, 25.0, 20.0, 3, 'active'),
    ('Orange Soda', 'TGO', 'shisha', 'drink', 15.0, 25.0, 20.0, 2, 'active'),
    ('Mimon', 'TGO', 'shisha', 'citrus', 15.0, 25.0, 20.0, 2, 'active'),
    ('Horchata', 'TGO', 'shisha', 'drink', 15.0, 25.0, 20.0, 3, 'active')
ON CONFLICT DO NOTHING;

-- Výpis počtu přidaných příchutí
SELECT 
    product_type,
    COUNT(*) as count 
FROM flavors 
GROUP BY product_type
ORDER BY product_type;
