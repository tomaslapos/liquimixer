-- ============================================
-- TESTOVACÍ DATA PRO LIQUIMIXER
-- Vloží testovacího uživatele a recept
-- ============================================

-- Nejprve vložit nebo aktualizovat testovacího uživatele
INSERT INTO users (clerk_id, email, first_name, last_name, last_login)
VALUES (
    'test_user_tomas',
    'tomaslapos@gmail.com',
    'Tomáš',
    'Lapoš',
    NOW()
)
ON CONFLICT (clerk_id) DO UPDATE SET
    email = EXCLUDED.email,
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    last_login = NOW();

-- Vložit testovací recept
INSERT INTO recipes (clerk_id, name, description, rating, share_id, share_url, recipe_data)
VALUES (
    'test_user_tomas',
    'Jahodový Sen',
    'Sladká jahodová příchuť s jemným krémovým nádechem. Ideální pro letní vapování.',
    5,
    'test123abc456',
    'https://www.liquimixer.com/?recipe=test123abc456',
    '{
        "formType": "liquid",
        "totalVolume": 100,
        "nicotineStrength": 3,
        "nicotineBase": 20,
        "nicotineRatio": "50:50",
        "flavorPercent": 12,
        "flavorName": "Jahoda & Smetana",
        "flavorRatio": "0:100",
        "vgPgRatio": "70:30",
        "ingredients": [
            {"name": "Nikotinová báze 20mg/ml (50:50)", "amount": "15.00 ml"},
            {"name": "Příchuť Jahoda & Smetana 12% (0:100 VG/PG)", "amount": "12.00 ml"},
            {"name": "VG (Glycerin)", "amount": "55.50 ml"},
            {"name": "PG (Propylenglykol)", "amount": "17.50 ml"}
        ],
        "calculated": {
            "nicotineVolume": 15,
            "flavorVolume": 12,
            "vgVolume": 55.5,
            "pgVolume": 17.5,
            "actualVg": 70,
            "actualPg": 30
        }
    }'::jsonb
),
(
    'test_user_tomas',
    'Mentolový Chill',
    'Osvěžující mentolová směs pro silný throat hit. Perfektní na horké dny.',
    4,
    'test789xyz012',
    'https://www.liquimixer.com/?recipe=test789xyz012',
    '{
        "formType": "liquid",
        "totalVolume": 50,
        "nicotineStrength": 6,
        "nicotineBase": 20,
        "nicotineRatio": "50:50",
        "flavorPercent": 8,
        "flavorName": "Ledový Mentol",
        "flavorRatio": "0:100",
        "vgPgRatio": "50:50",
        "ingredients": [
            {"name": "Nikotinová báze 20mg/ml (50:50)", "amount": "15.00 ml"},
            {"name": "Příchuť Ledový Mentol 8% (0:100 VG/PG)", "amount": "4.00 ml"},
            {"name": "VG (Glycerin)", "amount": "19.50 ml"},
            {"name": "PG (Propylenglykol)", "amount": "11.50 ml"}
        ],
        "calculated": {
            "nicotineVolume": 15,
            "flavorVolume": 4,
            "vgVolume": 19.5,
            "pgVolume": 11.5,
            "actualVg": 50,
            "actualPg": 50
        }
    }'::jsonb
),
(
    'test_user_tomas',
    'Tabáková Klasika',
    'Autentická tabáková chuť pro přechod z klasických cigaret.',
    3,
    'test345def678',
    'https://www.liquimixer.com/?recipe=test345def678',
    '{
        "formType": "liquid",
        "totalVolume": 30,
        "nicotineStrength": 12,
        "nicotineBase": 20,
        "nicotineRatio": "50:50",
        "flavorPercent": 10,
        "flavorName": "RY4 Tabák",
        "flavorRatio": "0:100",
        "vgPgRatio": "40:60",
        "ingredients": [
            {"name": "Nikotinová báze 20mg/ml (50:50)", "amount": "18.00 ml"},
            {"name": "Příchuť RY4 Tabák 10% (0:100 VG/PG)", "amount": "3.00 ml"},
            {"name": "VG (Glycerin)", "amount": "3.00 ml"},
            {"name": "PG (Propylenglykol)", "amount": "6.00 ml"}
        ],
        "calculated": {
            "nicotineVolume": 18,
            "flavorVolume": 3,
            "vgVolume": 3,
            "pgVolume": 6,
            "actualVg": 40,
            "actualPg": 60
        }
    }'::jsonb
);

-- Zobrazit vložené záznamy
SELECT 'Uživatel vytvořen:' as info, email, first_name, last_name FROM users WHERE clerk_id = 'test_user_tomas';
SELECT 'Recepty vytvořeny:' as info, id as recipe_id, name, rating, share_url FROM recipes WHERE clerk_id = 'test_user_tomas';


