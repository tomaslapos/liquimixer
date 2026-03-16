// =========================================
// LiquiMixer - E-liquid Calculator Logic
// Výpočet dle metodiky: http://www.todmuller.com/ejuice/ejuice.php
// =========================================
//
// ╔══════════════════════════════════════════════════════════════════════════════╗
// ║                           MAPA FUNKCÍ - OBSAH                                ║
// ║                      Aktualizováno: 08.02.2026                               ║
// ╠══════════════════════════════════════════════════════════════════════════════╣
// ║                                                                              ║
// ║ ═══════════════════════════════════════════════════════════════════════════  ║
// ║ SEKCE 1: BEZPEČNOST A UTILITY (řádky 1-450)                                  ║
// ║ ═══════════════════════════════════════════════════════════════════════════  ║
// ║                                                                              ║
// ║   escapeHtml()                    12    - Escapování HTML entit (XSS)        ║
// ║   showNotification()              28    - Zobrazení notifikace               ║
// ║   sanitizeUrl()                   57    - Sanitizace URL                     ║
// ║   isValidUUID()                   68    - Validace UUID formátu              ║
// ║   t()                             74    - Helper pro překlady i18n           ║
// ║                                                                              ║
// ║ ═══════════════════════════════════════════════════════════════════════════  ║
// ║ SEKCE 2: DATABÁZE A KONSTANTY (řádky 80-450)                                 ║
// ║ ═══════════════════════════════════════════════════════════════════════════  ║
// ║                                                                              ║
// ║   flavorDatabase                  85    - Databáze příchutí a steeping časů  ║
// ║   ingredientDensities            380    - Hustoty ingrediencí (g/ml)         ║
// ║   calculateCompositionDensity()  419    - Výpočet hustoty směsi              ║
// ║   calculateNicotineDensity()     431    - Hustota nikotinu podle VG/PG       ║
// ║   calculatePremixedBaseDensity() 436    - Hustota předmíchané báze           ║
// ║   mlToGrams()                    441    - Převod ml na gramy                 ║
// ║   getShishaFlavorData()          447    - Data příchutě pro Shisha           ║
// ║   calculateMaturityDate()        487    - Výpočet data zralosti              ║
// ║   calculateMaxMaturityDate()     496    - Max datum zralosti (více příchutí) ║
// ║   getNicotineDescriptionText()   554    - Popis síly nikotinu                ║
// ║   getShishaNicotineDescriptionText() 563 - Popis pro Shisha                  ║
// ║                                                                              ║
// ║ ═══════════════════════════════════════════════════════════════════════════  ║
// ║ SEKCE 3: SERVICE WORKER A PWA (řádky 599-680)                                ║
// ║ ═══════════════════════════════════════════════════════════════════════════  ║
// ║                                                                              ║
// ║   setupServiceWorkerListener()   599    - Nastavení SW listeneru             ║
// ║   showUpdateNotification()       626    - Notifikace o aktualizaci           ║
// ║   dismissUpdateNotification()    655    - Zavření notifikace                 ║
// ║   refreshApp()                   664    - Refresh aplikace                   ║
// ║   handlePaymentReturn()          682    - Zpracování návratu z platby        ║
// ║                                                                              ║
// ║ ═══════════════════════════════════════════════════════════════════════════  ║
// ║ SEKCE 4: INICIALIZACE A SLIDERY (řádky 847-1000)                             ║
// ║ ═══════════════════════════════════════════════════════════════════════════  ║
// ║                                                                              ║
// ║   initializeSliders()            847    - Inicializace všech sliderů         ║
// ║   initShakeVapeListeners()       879    - Listenery pro Shake & Vape         ║
// ║   initLiquidProListeners()       899    - Listenery pro Liquid PRO           ║
// ║   setupNicotineRatioToggle()     919    - Toggle VG/PG nikotinu              ║
// ║   setupFlavorRatioToggle()       941    - Toggle VG/PG příchutě              ║
// ║   setupSvFlavorRatioToggle()     974    - Toggle pro Shake & Vape            ║
// ║                                                                              ║
// ║ ═══════════════════════════════════════════════════════════════════════════  ║
// ║ SEKCE 5: LIQUID ZÁKLADNÍ - NASTAVENÍ BÁZE (řádky 1012-1300)                  ║
// ║ ═══════════════════════════════════════════════════════════════════════════  ║
// ║                                                                              ║
// ║   updateBaseType()              1012    - Přepnutí typu báze                 ║
// ║   updatePremixedRatio()         1042    - Aktualizace předmíchaného poměru   ║
// ║   getPremixedVgPercent()        1068    - Získání VG% z předmíchané báze     ║
// ║   autoRecalculateLiquidVgPgRatio() 1075 - Auto přepočet VG/PG               ║
// ║   calculateActualVgPgRatio()    1093    - Výpočet skutečného VG/PG           ║
// ║                                                                              ║
// ║ ═══════════════════════════════════════════════════════════════════════════  ║
// ║ SEKCE 6: LIQUID PRO - NASTAVENÍ BÁZE (řádky 1213-1460)                       ║
// ║ ═══════════════════════════════════════════════════════════════════════════  ║
// ║                                                                              ║
// ║   updateProBaseType()           1213    - Přepnutí typu báze PRO             ║
// ║   updateProPremixedRatio()      1243    - Předmíchaný poměr PRO              ║
// ║   updateProCustomPremixedPg()   1281    - Vlastní PG pro předmíchanou bázi   ║
// ║   getProPremixedVgPercent()     1302    - Získání VG% PRO                    ║
// ║                                                                              ║
// ║ ═══════════════════════════════════════════════════════════════════════════  ║
// ║ SEKCE 7: AUTENTIZACE A PROFIL (řádky 1462-2270)                              ║
// ║ ═══════════════════════════════════════════════════════════════════════════  ║
// ║                                                                              ║
// ║   updateAuthUI()                1462    - Aktualizace UI podle přihlášení    ║
// ║   toggleMenu()                  1501    - Přepnutí menu                      ║
// ║   showAuthChoiceModal()         1526    - Modal volby přihlášení             ║
// ║   showLoginModal()              1584    - Zobrazení login modalu             ║
// ║   hideLoginModal()              1868    - Skrytí login modalu                ║
// ║   showLoginRequiredModal()      1922    - Modal "vyžadováno přihlášení"      ║
// ║   updatePriceDisplay()          1953    - Aktualizace zobrazení ceny         ║
// ║   isUserLoggedIn()              1998    - Kontrola přihlášení                ║
// ║   hasActiveSubscription()       2003    - Kontrola aktivního předplatného    ║
// ║   requireLogin()                2010    - Vyžádání přihlášení                ║
// ║   requireSubscription()         2022    - Vyžádání předplatného              ║
// ║   showUserProfileModal()        2037    - Zobrazení profilu uživatele        ║
// ║   signOut()                     2101    - Odhlášení                          ║
// ║   handleContact()               2174    - Zpracování kontaktního formuláře   ║
// ║                                                                              ║
// ║ ═══════════════════════════════════════════════════════════════════════════  ║
// ║ SEKCE 8: UKLÁDÁNÍ RECEPTŮ (řádky 2270-2990)                                  ║
// ║ ═══════════════════════════════════════════════════════════════════════════  ║
// ║                                                                              ║
// ║   storeCurrentRecipe()          2270    - Uložení aktuálního receptu do RAM  ║
// ║   calculateDifficultyLevel()    2283    - Výpočet obtížnosti receptu         ║
// ║   showSaveRecipeModal()         2336    - Modal pro uložení receptu          ║
// ║   goBackToCalculator()          2388    - Návrat do formuláře                ║
// ║   showSaveAsNewModal()          2420    - Modal "Uložit jako nový"           ║
// ║   showSaveChangesModal()        2477    - Modal "Uložit změny"               ║
// ║   loadProductsForRecipe()       2567    - Načtení produktů pro recept        ║
// ║   addProductRow()               2596    - Přidání řádku produktu             ║
// ║   hideSaveRecipeModal()         2690    - Skrytí modalu                      ║
// ║   initStarRating()              2738    - Inicializace hvězdiček             ║
// ║   saveRecipe()                  2775    - ⭐ ULOŽENÍ RECEPTU DO DB            ║
// ║   getSelectedProductIds()       2972    - Získání vybraných produktů         ║
// ║                                                                              ║
// ║ ═══════════════════════════════════════════════════════════════════════════  ║
// ║ SEKCE 9: ZOBRAZENÍ RECEPTŮ (řádky 2985-3970)                                 ║
// ║ ═══════════════════════════════════════════════════════════════════════════  ║
// ║                                                                              ║
// ║   showMyRecipes()               2985    - Zobrazení mých receptů             ║
// ║   loadMaturedRecipeIds()        3016    - Načtení zralých receptů            ║
// ║   resetRecipeFilters()          3054    - Reset filtrů receptů               ║
// ║   filterRecipes()               3124    - Filtrování receptů                 ║
// ║   renderRecipesList()           3181    - Vykreslení seznamu receptů         ║
// ║   viewRecipeDetail()            3233    - ⭐ ZOBRAZENÍ DETAILU RECEPTU        ║
// ║   displayRecipeDetail()         3267    - ⭐ VYKRESLENÍ DETAILU RECEPTU       ║
// ║   editSavedRecipe()             3410    - Editace uloženého receptu          ║
// ║   prefillLiquidForm()           3452    - Předvyplnění Liquid formuláře      ║
// ║   prefillSnvForm()              3487    - Předvyplnění Shake & Vape          ║
// ║   prefillProForm()              3517    - Předvyplnění Liquid PRO            ║
// ║   prefillShishaForm()           3568    - Předvyplnění Shisha                ║
// ║   showEditRecipeForm()          3770    - Zobrazení formuláře editace        ║
// ║   shareRecipe()                 3871    - Sdílení receptu                    ║
// ║   deleteRecipe()                3938    - Smazání receptu                    ║
// ║                                                                              ║
// ║ ═══════════════════════════════════════════════════════════════════════════  ║
// ║ SEKCE 10: SDÍLENÉ RECEPTY (řádky 3972-4260)                                  ║
// ║ ═══════════════════════════════════════════════════════════════════════════  ║
// ║                                                                              ║
// ║   isValidShareId()              3972    - Validace share ID                  ║
// ║   loadSharedRecipe()            3978    - Načtení sdíleného receptu          ║
// ║   showSharedRecipeDisclaimer()  4032    - Disclaimer pro sdílený recept      ║
// ║   confirmAndShowSharedRecipe()  4045    - Potvrzení a zobrazení              ║
// ║   loadSharedRecipeContent()     4086    - Načtení obsahu sdíleného           ║
// ║   saveSharedRecipe()            4131    - Uložení sdíleného receptu          ║
// ║                                                                              ║
// ║ ═══════════════════════════════════════════════════════════════════════════  ║
// ║ SEKCE 11: OBLÍBENÉ PRODUKTY (řádky 4268-4880)                                ║
// ║ ═══════════════════════════════════════════════════════════════════════════  ║
// ║                                                                              ║
// ║   showFavoriteProducts()        4268    - Zobrazení oblíbených produktů      ║
// ║   resetProductFilters()         4296    - Reset filtrů produktů              ║
// ║   filterProducts()              4366    - Filtrování produktů                ║
// ║   renderProductsList()          4417    - Vykreslení seznamu produktů        ║
// ║   updateProductStockUI()        4476    - ⭐ AKTUALIZACE SKLADU V UI          ║
// ║   viewProductDetail()           4511    - Zobrazení detailu produktu         ║
// ║   displayProductDetail()        4547    - Vykreslení detailu produktu        ║
// ║   viewSharedProductDetail()     4637    - Detail sdíleného produktu          ║
// ║   copySharedProductToUser()     4717    - Kopírování sdíleného produktu      ║
// ║   getProductTypeLabel()         4758    - Získání popisku typu produktu      ║
// ║   showAddProductForm()          4789    - Formulář přidání produktu          ║
// ║   editProduct()                 4820    - Editace produktu                   ║
// ║   deleteProduct()               4854    - Smazání produktu                   ║
// ║   saveProduct()                 4886    - Uložení produktu                   ║
// ║                                                                              ║
// ║ ═══════════════════════════════════════════════════════════════════════════  ║
// ║ SEKCE 12: NAVIGACE A UI (řádky 5059-5170)                                    ║
// ║ ═══════════════════════════════════════════════════════════════════════════  ║
// ║                                                                              ║
// ║   togglePrepDetail()            5059    - Toggle přípravných detailů         ║
// ║   showPage()                    5085    - ⭐ NAVIGACE MEZI STRÁNKAMI          ║
// ║   initHistoryNavigation()       5121    - Inicializace historie              ║
// ║   updateHomeButtonVisibility()  5138    - Viditelnost tlačítka Domů          ║
// ║   goHome()                      5153    - Návrat na domovskou stránku        ║
// ║   goBack()                      5158    - Krok zpět v historii               ║
// ║                                                                              ║
// ║ ═══════════════════════════════════════════════════════════════════════════  ║
// ║ SEKCE 13: LIQUID ZÁKLADNÍ - SLIDERY A DISPLEJE (řádky 5172-5740)             ║
// ║ ═══════════════════════════════════════════════════════════════════════════  ║
// ║                                                                              ║
// ║   adjustRatio()                 5172    - Úprava VG/PG poměru                ║
// ║   getRatioDescriptionText()     5193    - Popis VG/PG poměru                 ║
// ║   updateRatioDisplay()          5206    - Aktualizace displeje poměru        ║
// ║   updateVgPgRatioLimits()       5229    - Aktualizace limitů VG/PG           ║
// ║   clampVgPgValue()              5393    - Omezení hodnoty VG/PG              ║
// ║   getNicotineMaxValue()         5410    - Max hodnota nikotinu               ║
// ║   getNicotineTypeName()         5417    - Název typu nikotinu                ║
// ║   showNicotineWarning()         5424    - Zobrazení varování nikotinu        ║
// ║   validateNicotineStrength()    5443    - Validace síly nikotinu             ║
// ║   updateNicotineType()          5459    - Aktualizace typu nikotinu          ║
// ║   updateMaxTargetNicotine()     5492    - Max cílový nikotin                 ║
// ║   adjustTargetNicotine()        5503    - Úprava cílového nikotinu           ║
// ║   updateNicotineDisplay()       5510    - Aktualizace displeje nikotinu      ║
// ║   updateFlavorType()            5540    - Aktualizace typu příchutě          ║
// ║   adjustFlavor()                5561    - Úprava síly příchutě               ║
// ║   getFlavorNote()               5569    - Získání poznámky k příchuti        ║
// ║   getFlavorName()               5592    - Získání názvu příchutě             ║
// ║   getIngredientName()           5599    - ⭐ PŘEKLAD NÁZVŮ INGREDIENCÍ        ║
// ║   updateFlavorDisplay()         5677    - Aktualizace displeje příchutě      ║
// ║   updateAllDisplays()           5722    - Aktualizace všech displejů         ║
// ║                                                                              ║
// ║ ═══════════════════════════════════════════════════════════════════════════  ║
// ║ SEKCE 14: LIQUID ZÁKLADNÍ - KALKULACE (řádky 5740-6280)                      ║
// ║ ═══════════════════════════════════════════════════════════════════════════  ║
// ║                                                                              ║
// ║   calculateMix()                5740    - ⭐⭐⭐ HLAVNÍ VÝPOČET LIQUID          ║
// ║   displayResults()              6022    - ⭐⭐⭐ ZOBRAZENÍ VÝSLEDKŮ             ║
// ║   calculateIngredientGrams()    6130    - Výpočet gramů ingredience          ║
// ║   generateMixingNotes()         6164    - Generování poznámek k míchání      ║
// ║   getMaxSteepingDaysFromRecipe() 6249   - Max steeping z receptu             ║
// ║   refreshResultsTable()         6282    - Refresh tabulky výsledků           ║
// ║   refreshRecipeDetail()         6322    - Refresh detailu receptu            ║
// ║   refreshProductDetail()        6342    - Refresh detailu produktu           ║
// ║                                                                              ║
// ║ ═══════════════════════════════════════════════════════════════════════════  ║
// ║ SEKCE 15: POMOCNÉ FUNKCE (řádky 6367-6500)                                   ║
// ║ ═══════════════════════════════════════════════════════════════════════════  ║
// ║                                                                              ║
// ║   adjustColorBrightness()       6367    - Úprava jasu barvy                  ║
// ║   isMobileDevice()              6383    - Detekce mobilního zařízení         ║
// ║   isIOSDevice()                 6389    - Detekce iOS                        ║
// ║   isStandalone()                6394    - Detekce standalone režimu          ║
// ║   showInstallPrompt()           6420    - Zobrazení install promptu          ║
// ║   hideInstallPrompt()           6427    - Skrytí install promptu             ║
// ║   showIOSInstallPrompt()        6434    - iOS specifický prompt              ║
// ║                                                                              ║
// ║ ═══════════════════════════════════════════════════════════════════════════  ║
// ║ SEKCE 16: ŘEDĚNÍ NIKOTINU (řádky 6505-6910)                                  ║
// ║ ═══════════════════════════════════════════════════════════════════════════  ║
// ║                                                                              ║
// ║   updateDiluteAmountType()      6505    - Typ množství pro ředění            ║
// ║   updateDiluteNicotineType()    6521    - Typ nikotinu pro ředění            ║
// ║   adjustDiluteSourceRatio()     6540    - Úprava zdrojového poměru           ║
// ║   updateDiluteSourceRatioDisplay() 6548 - Displej zdrojového poměru         ║
// ║   adjustDiluteTargetRatio()     6582    - Úprava cílového poměru             ║
// ║   updateDiluteTargetRatioDisplay() 6598 - Displej cílového poměru           ║
// ║   updateDiluteRatioLimits()     6636    - Limity poměrů                      ║
// ║   updateDiluteCalculation()     6697    - Aktualizace výpočtu ředění         ║
// ║   calculateDilution()           6718    - ⭐ VÝPOČET ŘEDĚNÍ                   ║
// ║   displayDiluteResults()        6806    - Zobrazení výsledků ředění          ║
// ║   switchFormTab()               6863    - Přepnutí záložky formuláře         ║
// ║   updateFormTabsState()         6908    - Stav záložek formuláře             ║
// ║                                                                              ║
// ║ ═══════════════════════════════════════════════════════════════════════════  ║
// ║ SEKCE 17: SHAKE & VAPE (řádky 6933-7470)                                     ║
// ║ ═══════════════════════════════════════════════════════════════════════════  ║
// ║                                                                              ║
// ║   initShakeVapeForm()           6933    - Inicializace formuláře             ║
// ║   setupSvNicotineRatioToggle()  6939    - Toggle nikotinu                    ║
// ║   updateSvBaseType()            6966    - Typ báze Shake & Vape              ║
// ║   updateSvPremixedRatio()       6996    - Předmíchaný poměr                  ║
// ║   getSvPremixedVgPercent()      7024    - VG% pro Shake & Vape               ║
// ║   autoRecalculateSvVgPgRatio()  7031    - Auto přepočet VG/PG                ║
// ║   updateSvNicotineType()        7049    - Typ nikotinu                       ║
// ║   adjustSvTargetNicotine()      7070    - Úprava cílového nikotinu           ║
// ║   updateSvNicotineDisplay()     7078    - Displej nikotinu                   ║
// ║   adjustSvRatio()               7103    - Úprava poměru                      ║
// ║   updateSvRatioDisplay()        7119    - Displej poměru                     ║
// ║   updateSvVgPgLimits()          7138    - Limity VG/PG                       ║
// ║   updateSvCalculation()         7243    - Aktualizace výpočtu                ║
// ║   calculateShakeVape()          7247    - ⭐ VÝPOČET SHAKE & VAPE             ║
// ║                                                                              ║
// ║ ═══════════════════════════════════════════════════════════════════════════  ║
// ║ SEKCE 18: SHORTFILL (řádky 7473-7600)                                        ║
// ║ ═══════════════════════════════════════════════════════════════════════════  ║
// ║                                                                              ║
// ║   calculateShortfill()          7473    - Přepočet shortfill                 ║
// ║   adjustSfShotCount()           7507    - Úprava počtu shotů                 ║
// ║   calculateShortfillMix()       7524    - ⭐ VÝPOČET SHORTFILL                ║
// ║                                                                              ║
// ║ ═══════════════════════════════════════════════════════════════════════════  ║
// ║ SEKCE 19: LIQUID PRO (řádky 7600-8970)                                       ║
// ║ ═══════════════════════════════════════════════════════════════════════════  ║
// ║                                                                              ║
// ║   autoRecalculateProVgPgRatio() 7600    - Auto přepočet VG/PG PRO            ║
// ║   initLiquidProForm()           7613    - Inicializace PRO formuláře         ║
// ║   updateProNicotineType()       7621    - Typ nikotinu PRO                   ║
// ║   adjustProNicRatio()           7657    - Úprava poměru nikotinu             ║
// ║   updateProNicRatioDisplay()    7673    - Displej poměru nikotinu            ║
// ║   adjustProTargetNicotine()     7692    - Cílový nikotin PRO                 ║
// ║   updateProNicotineDisplay()    7700    - Displej nikotinu PRO               ║
// ║   updateProFlavorType()         7730    - Typ příchutě PRO                   ║
// ║   adjustProFlavor()             7748    - Úprava příchutě PRO                ║
// ║   updateProFlavorStrength()     7758    - Síla příchutě PRO                  ║
// ║   updateProFlavorDisplay()      7765    - Displej příchutě PRO               ║
// ║   adjustProFlavorRatio()        7800    - Poměr příchutě PRO                 ║
// ║   updateProFlavorRatioDisplay() 7819    - Displej poměru příchutě            ║
// ║   addProFlavor()                7844    - ⭐ PŘIDÁNÍ PŘÍCHUTĚ                 ║
// ║   removeProFlavor()             7968    - Odebrání příchutě                  ║
// ║   renumberProFlavors()          7990    - Přečíslování příchutí              ║
// ║   updateFlavorElementIds()      8014    - Aktualizace ID elementů            ║
// ║   updateProFlavorCountHint()    8053    - Hint počtu příchutí                ║
// ║   toggleFlavorComposition()     8070    - Toggle složení příchutě            ║
// ║   prefillFlavorComposition()    8097    - Předvyplnění složení               ║
// ║   resetFlavorComposition()      8168    - Reset složení                      ║
// ║   getFlavorCustomComposition()  8174    - Vlastní složení příchutě           ║
// ║   addProAdditive()              8204    - Přidání aditivu                    ║
// ║   removeProAdditive()           8277    - Odebrání aditivu                   ║
// ║   updateProAdditiveType()       8294    - Typ aditivu                        ║
// ║   getProAdditivesData()         8407    - Data aditiv                        ║
// ║   updateProTotalFlavorPercent() 8452    - Celkové % příchutí                 ║
// ║   getProFlavorsData()           8488    - Data příchutí                      ║
// ║   adjustProRatio()              8509    - Úprava poměru PRO                  ║
// ║   updateProRatioDisplay()       8525    - Displej poměru PRO                 ║
// ║   updateProVgPgLimits()         8550    - Limity VG/PG PRO                   ║
// ║   calculateProMix()             8663    - ⭐⭐⭐ HLAVNÍ VÝPOČET LIQUID PRO      ║
// ║                                                                              ║
// ║ ═══════════════════════════════════════════════════════════════════════════  ║
// ║ SEKCE 20: PŘEDPLATNÉ (řádky 8978-9700)                                       ║
// ║ ═══════════════════════════════════════════════════════════════════════════  ║
// ║                                                                              ║
// ║   checkSubscriptionStatus()     8978    - Kontrola stavu předplatného        ║
// ║   getSupabaseUrl()              9048    - URL Supabase                       ║
// ║   getSupabaseAnonKey()          9053    - Anon klíč Supabase                 ║
// ║   getClerkToken()               9059    - Získání Clerk tokenu               ║
// ║   showSubscriptionModal()       9103    - Modal předplatného                 ║
// ║   updateGuestPayButton()        9279    - Tlačítko platby pro hosta          ║
// ║   startRegistrationAndPayment() 9288    - Start registrace + platby          ║
// ║   goToLoginFromSubscription()   9322    - Přechod na login                   ║
// ║   hideSubscriptionModal()       9332    - Skrytí modalu                      ║
// ║   detectUserLocation()          9363    - Detekce lokace uživatele           ║
// ║   updatePricingUI()             9443    - Aktualizace UI s cenami            ║
// ║   startPayment()                9475    - Start platby                       ║
// ║   processPayment()              9506    - ⭐ ZPRACOVÁNÍ PLATBY                ║
// ║   saveTermsAcceptance()         9612    - Uložení souhlasu s podmínkami      ║
// ║   updateSubscriptionStatusUI()  9631    - UI stavu předplatného              ║
// ║   renewSubscription()           9668    - Obnovení předplatného              ║
// ║   showTermsModal()              9673    - Modal podmínek                     ║
// ║                                                                              ║
// ║ ═══════════════════════════════════════════════════════════════════════════  ║
// ║ SEKCE 21: PŘIPOMÍNKY ZRÁNÍ (řádky 9700-10650)                                ║
// ║ ═══════════════════════════════════════════════════════════════════════════  ║
// ║                                                                              ║
// ║   toggleReminderFields()        9700    - Toggle polí připomínky             ║
// ║   initReminderDates()           9714    - Inicializace datumů                ║
// ║   formatDateForInput()          9725    - Formátování data pro input         ║
// ║   initDatePickers()             9733    - Inicializace date pickerů          ║
// ║   updateReminderDate()          9749    - Aktualizace data připomínky        ║
// ║   resetReminderFields()         9794    - Reset polí připomínky              ║
// ║   initReminderFieldsEnabled()   9808    - Povolení polí                      ║
// ║   getReminderDataFromForm()     9838    - Data z formuláře                   ║
// ║   requestNotificationPermissionWithPrompt() 9924 - Žádost o notifikace       ║
// ║   loadRecipeReminders()         9961    - ⭐ NAČTENÍ PŘIPOMÍNEK RECEPTU       ║
// ║   renderReminderItem()         10016    - ⭐ VYKRESLENÍ PŘIPOMÍNKY            ║
// ║   wasReminderDismissedToday()  10105    - Kontrola dismissnutí               ║
// ║   setReminderDismissedToday()  10114    - Nastavení dismissnutí              ║
// ║   checkMaturedReminders()      10152    - Kontrola zralých připomínek        ║
// ║   showMaturedLiquidsNotification() 10207 - Notifikace zralých                ║
// ║   goToSavedRecipes()           10265    - Přechod na uložené recepty         ║
// ║   showAddReminderModal()       10277    - Modal přidání připomínky           ║
// ║   showEditReminderModal()      10340    - Modal editace připomínky           ║
// ║   hideAddReminderModal()       10363    - Skrytí modalu                      ║
// ║   saveReminderFromModal()      10390    - Uložení z modalu                   ║
// ║   saveNewReminder()            10440    - Uložení nové připomínky            ║
// ║   deleteReminderConfirm()      10463    - Potvrzení smazání                  ║
// ║   showViewReminderModal()      10481    - Modal zobrazení připomínky         ║
// ║   updateViewReminderStock()    10556    - Aktualizace skladu v připomínce    ║
// ║   hideViewReminderModal()      10643    - Skrytí modalu                      ║
// ║                                                                              ║
// ║ ═══════════════════════════════════════════════════════════════════════════  ║
// ║ SEKCE 22: VEŘEJNÁ DATABÁZE RECEPTŮ (řádky 10671-11100)                       ║
// ║ ═══════════════════════════════════════════════════════════════════════════  ║
// ║                                                                              ║
// ║   showRecipeDatabase()         10671    - Zobrazení databáze receptů         ║
// ║   initFlavorFilterOptions()    10684    - Inicializace filtrů příchutí       ║
// ║   toggleDatabaseFilters()      10744    - Toggle filtrů                      ║
// ║   resetDatabaseFilters()       10767    - Reset filtrů                       ║
// ║   debounceSearch()             10783    - Debounce vyhledávání               ║
// ║   loadPublicRecipes()          10792    - ⭐ NAČTENÍ VEŘEJNÝCH RECEPTŮ        ║
// ║   renderPublicRecipeCard()     10843    - Vykreslení karty receptu           ║
// ║   renderStars()                10878    - Vykreslení hvězdiček               ║
// ║   renderDbPagination()         10893    - Vykreslení paginace                ║
// ║   goToDbPage()                 10927    - Přechod na stránku                 ║
// ║   loadPublicRecipeDetail()     10935    - Načtení detailu veřejného receptu  ║
// ║   appendRatingSection()        10975    - Přidání sekce hodnocení            ║
// ║   submitRating()               11004    - ⭐ ODESLÁNÍ HODNOCENÍ               ║
// ║   appendBackToDatabaseButton() 11066    - Tlačítko zpět do databáze          ║
// ║   removeBackToDatabaseButton() 11092    - Odebrání tlačítka                  ║
// ║                                                                              ║
// ║ ═══════════════════════════════════════════════════════════════════════════  ║
// ║ SEKCE 23: SHISHA FORMULÁŘ (řádky 11100-12800)                                ║
// ║ ═══════════════════════════════════════════════════════════════════════════  ║
// ║                                                                              ║
// ║   (Shisha funkce - hledat "Shisha" nebo "shisha" v souboru)                  ║
// ║   updateShishaBaseType()        ~11200  - Typ báze Shisha                    ║
// ║   autoRecalculateShishaVgPgRatio() ~11300 - Auto přepočet VG/PG Shisha       ║
// ║   calculateShishaMix()          ~12000  - ⭐⭐⭐ HLAVNÍ VÝPOČET SHISHA          ║
// ║                                                                              ║
// ║ ═══════════════════════════════════════════════════════════════════════════  ║
// ║ SEKCE 24: WINDOW EXPORTY (konec souboru)                                     ║
// ║ ═══════════════════════════════════════════════════════════════════════════  ║
// ║                                                                              ║
// ║   window.calculateMixture, window.showSaveRecipeModal,                       ║
// ║   window.viewRecipeDetail, window.showAddReminderModal, ...                  ║
// ║                                                                              ║
// ╠══════════════════════════════════════════════════════════════════════════════╣
// ║                                                                              ║
// ║ ⭐ = Důležitá funkce                                                          ║
// ║ ⭐⭐⭐ = Kritická funkce - NEMĚNIT BEZ DŮKLADNÉ ANALÝZY                         ║
// ║                                                                              ║
// ║ POZNÁMKA: Čísla řádků jsou orientační a mohou se lišit po editacích.         ║
// ║ Pro aktuální pozici použijte Ctrl+G (Go to Line) nebo vyhledávání.           ║
// ║                                                                              ║
// ╚══════════════════════════════════════════════════════════════════════════════╝

// =========================================
// SECURITY: HTML Sanitization
// Ochrana proti XSS útokům
// =========================================

// Escapování HTML entit - VŽDY použít pro uživatelský vstup
function escapeHtml(unsafe) {
    if (unsafe === null || unsafe === undefined) return '';
    return String(unsafe)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;');
}

// =========================================
// NOTIFICATIONS
// Toast notifikace pro uživatele
// =========================================

function showNotification(message, type = 'info') {
    // Odstranit existující notifikaci
    const existing = document.querySelector('.toast-notification');
    if (existing) {
        existing.remove();
    }
    
    // Vytvořit novou notifikaci
    const notification = document.createElement('div');
    notification.className = `toast-notification toast-${type}`;
    notification.innerHTML = `
        <span class="toast-message">${escapeHtml(message)}</span>
        <button class="toast-close" onclick="this.parentElement.remove()">×</button>
    `;
    
    // Přidat do stránky
    document.body.appendChild(notification);
    
    // Animace zobrazení
    setTimeout(() => notification.classList.add('show'), 10);
    
    // Automaticky skrýt po 5 sekundách
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 5000);
}

// Sanitizace URL - povoluje pouze bezpečné protokoly
function sanitizeUrl(url) {
    if (!url) return '';
    const safe = String(url).trim();
    // Povolit pouze http, https, mailto
    if (/^(https?:|mailto:)/i.test(safe)) {
        return encodeURI(safe);
    }
    return '';
}

// Validace UUID formátu (pro recipe ID)
function isValidUUID(str) {
    if (!str) return false;
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
}

// Helper funkce pro překlady
function t(key, fallback = null) {
    if (window.i18n && window.i18n.t) {
        return window.i18n.t(key, fallback);
    }
    return fallback || key;
}

// Flavor database with recommended percentages (15 options)
// Data z tabulky příchutí pro e-liquid
// steepingDays = doporučená doba zrání ve dnech
// composition = složení příchutě pro přesný výpočet (pg, vg, alcohol, water, other v %)
const flavorDatabase = {
    // === LIQUID PŘÍCHUTĚ (isShishaOnly: false) ===
    none: { 
        name: 'Žádná (bez příchutě)', 
        min: 0, max: 0, ideal: 0, steepingDays: 0,
        shishaMin: 0, shishaMax: 0, shishaIdeal: 0, shishaSteepingDays: 0,
        isShishaOnly: false,
        note: 'Čistá báze PG/VG + nikotin',
        composition: { pg: 0, vg: 0, alcohol: 0, water: 0, other: 0 }
    },
    fruit: { 
        name: 'Ovoce (jahoda, jablko)', 
        min: 8, max: 12, ideal: 10, steepingDays: 7,
        shishaMin: 15, shishaMax: 25, shishaIdeal: 20, shishaSteepingDays: 3,
        isShishaOnly: false,
        note: 'Optimum: 10%, zrání 3–7 dní',
        composition: { pg: 60, vg: 5, alcohol: 25, water: 5, other: 5 }
    },
    citrus: { 
        name: 'Citrónové (citron, limeta)', 
        min: 6, max: 10, ideal: 8, steepingDays: 7,
        shishaMin: 12, shishaMax: 20, shishaIdeal: 16, shishaSteepingDays: 2,
        isShishaOnly: false,
        note: 'Silné kyseliny, méně stačí',
        composition: { pg: 60, vg: 5, alcohol: 25, water: 5, other: 5 }
    },
    berry: { 
        name: 'Bobulové (borůvka, malina)', 
        min: 10, max: 15, ideal: 12, steepingDays: 7,
        shishaMin: 15, shishaMax: 25, shishaIdeal: 20, shishaSteepingDays: 3,
        isShishaOnly: false,
        note: 'Vyvážené, dobře fungují s 50/50 PG/VG',
        composition: { pg: 60, vg: 5, alcohol: 25, water: 5, other: 5 }
    },
    tropical: { 
        name: 'Tropické (ananas, mango)', 
        min: 12, max: 18, ideal: 15, steepingDays: 10,
        shishaMin: 15, shishaMax: 25, shishaIdeal: 20, shishaSteepingDays: 3,
        isShishaOnly: false,
        note: 'Sladké, potřebují vyšší % pro hloubku',
        composition: { pg: 55, vg: 10, alcohol: 25, water: 5, other: 5 }
    },
    tobacco: { 
        name: 'Tabákové (klasický, kubánský)', 
        min: 10, max: 15, ideal: 12, steepingDays: 14,
        shishaMin: 15, shishaMax: 25, shishaIdeal: 20, shishaSteepingDays: 5,
        isShishaOnly: false,
        note: 'Dlouhý steeping: 1–4 týdny pro rozvinutí',
        composition: { pg: 85, vg: 0, alcohol: 5, water: 5, other: 5 }
    },
    menthol: { 
        name: 'Mentol / Mátové', 
        min: 4, max: 8, ideal: 6, steepingDays: 7,
        shishaMin: 10, shishaMax: 18, shishaIdeal: 15, shishaSteepingDays: 1,
        isShishaOnly: false,
        note: 'Velmi koncentrované, při 10% chladí až pálí',
        composition: { pg: 35, vg: 5, alcohol: 50, water: 5, other: 5 }
    },
    mint: { 
        name: 'Máta', 
        min: 4, max: 8, ideal: 6, steepingDays: 7,
        shishaMin: 10, shishaMax: 18, shishaIdeal: 15, shishaSteepingDays: 1,
        isShishaOnly: false,
        note: 'Osvěžující mátová chuť, populární pro shisha',
        composition: { pg: 35, vg: 5, alcohol: 50, water: 5, other: 5 }
    },
    candy: { 
        name: 'Sladkosti (cukroví, karamel)', 
        min: 12, max: 20, ideal: 16, steepingDays: 10,
        shishaMin: 18, shishaMax: 28, shishaIdeal: 22, shishaSteepingDays: 3,
        isShishaOnly: false,
        note: 'Sladké tlumí škrábání, vyšší % nutné',
        composition: { pg: 50, vg: 10, alcohol: 30, water: 5, other: 5 }
    },
    dessert: { 
        name: 'Dezerty (koláč, pudink)', 
        min: 15, max: 22, ideal: 18, steepingDays: 21,
        shishaMin: 20, shishaMax: 30, shishaIdeal: 25, shishaSteepingDays: 5,
        isShishaOnly: false,
        note: 'Komplexní: 2–4 týdny zrání, riziko přechucení',
        composition: { pg: 70, vg: 10, alcohol: 10, water: 5, other: 5 }
    },
    bakery: { 
        name: 'Zákusky (tyčinka, donut)', 
        min: 18, max: 25, ideal: 20, steepingDays: 21,
        shishaMin: 22, shishaMax: 30, shishaIdeal: 26, shishaSteepingDays: 4,
        isShishaOnly: false,
        note: 'Doporučujeme vyzkoušet na 15%',
        composition: { pg: 70, vg: 10, alcohol: 10, water: 5, other: 5 }
    },
    biscuit: { 
        name: 'Piškotové (vanilka, máslo)', 
        min: 10, max: 15, ideal: 12, steepingDays: 10,
        shishaMin: 15, shishaMax: 22, shishaIdeal: 18, shishaSteepingDays: 3,
        isShishaOnly: false,
        note: 'Univerzální, funguje s vysokým VG',
        composition: { pg: 70, vg: 10, alcohol: 10, water: 5, other: 5 }
    },
    cream: { 
        name: 'Krémové (vanilka, smetana)', 
        min: 8, max: 15, ideal: 12, steepingDays: 14,
        shishaMin: 12, shishaMax: 20, shishaIdeal: 16, shishaSteepingDays: 4,
        isShishaOnly: false,
        note: 'Krémové příchutě vyžadují delší zrání',
        composition: { pg: 65, vg: 15, alcohol: 10, water: 5, other: 5 }
    },
    mix: { 
        name: 'Mix / Směs', 
        min: 10, max: 20, ideal: 15, steepingDays: 14,
        shishaMin: 15, shishaMax: 25, shishaIdeal: 20, shishaSteepingDays: 4,
        isShishaOnly: false,
        note: 'Kombinace více kategorií příchutí',
        composition: { pg: 60, vg: 10, alcohol: 20, water: 5, other: 5 }
    },
    drink: { 
        name: 'Nápojové (kola, čaj)', 
        min: 8, max: 12, ideal: 10, steepingDays: 7,
        shishaMin: 12, shishaMax: 20, shishaIdeal: 16, shishaSteepingDays: 3,
        isShishaOnly: false,
        note: 'Jemné, méně intenzivní',
        composition: { pg: 40, vg: 30, alcohol: 20, water: 5, other: 5 }
    },
    tobaccosweet: { 
        name: 'Tabák + sladké (custard tobacco)', 
        min: 15, max: 20, ideal: 17, steepingDays: 28,
        shishaMin: 20, shishaMax: 28, shishaIdeal: 24, shishaSteepingDays: 5,
        isShishaOnly: false,
        note: 'Nejsložitější: 3–6 týdnů zrání',
        composition: { pg: 50, vg: 10, alcohol: 30, water: 5, other: 5 }
    },
    nuts: { 
        name: 'Oříškové (arašíd, lískový)', 
        min: 12, max: 18, ideal: 15, steepingDays: 14,
        shishaMin: 18, shishaMax: 25, shishaIdeal: 20, shishaSteepingDays: 4,
        isShishaOnly: false,
        note: 'Dobře tlumí nikotin',
        composition: { pg: 75, vg: 5, alcohol: 10, water: 5, other: 5 }
    },
    spice: { 
        name: 'Kořeněné (skořice, perník)', 
        min: 5, max: 10, ideal: 7, steepingDays: 14,
        shishaMin: 10, shishaMax: 18, shishaIdeal: 14, shishaSteepingDays: 3,
        isShishaOnly: false,
        note: 'Silné: při 12% dominují nad vším',
        composition: { pg: 70, vg: 5, alcohol: 15, water: 5, other: 5 }
    },
    // === SHISHA-SPECIFICKÉ PŘÍCHUTĚ (isShishaOnly: true) ===
    double_apple: { 
        name: 'Double Apple (klasika)', 
        min: 15, max: 25, ideal: 20, steepingDays: 3,
        shishaMin: 15, shishaMax: 25, shishaIdeal: 20, shishaSteepingDays: 3,
        isShishaOnly: true,
        note: 'Klasická shisha chuť, výrazná',
        composition: { pg: 60, vg: 10, alcohol: 20, water: 5, other: 5 }
    },
    grape: { 
        name: 'Grape / Hroznové', 
        min: 12, max: 18, ideal: 15, steepingDays: 7,
        shishaMin: 15, shishaMax: 25, shishaIdeal: 20, shishaSteepingDays: 3,
        isShishaOnly: false,
        note: 'Sladké hrozny, univerzální',
        composition: { pg: 60, vg: 10, alcohol: 20, water: 5, other: 5 }
    },
    watermelon: { 
        name: 'Watermelon / Meloun', 
        min: 10, max: 15, ideal: 12, steepingDays: 7,
        shishaMin: 15, shishaMax: 25, shishaIdeal: 20, shishaSteepingDays: 2,
        isShishaOnly: false,
        note: 'Osvěžující letní chuť',
        composition: { pg: 55, vg: 10, alcohol: 25, water: 5, other: 5 }
    },
    lemon_mint: { 
        name: 'Lemon Mint', 
        min: 8, max: 14, ideal: 10, steepingDays: 7,
        shishaMin: 12, shishaMax: 20, shishaIdeal: 16, shishaSteepingDays: 2,
        isShishaOnly: true,
        note: 'Osvěžující kombinace citrónu a máty',
        composition: { pg: 50, vg: 5, alcohol: 35, water: 5, other: 5 }
    },
    blueberry: { 
        name: 'Blueberry / Borůvka', 
        min: 10, max: 15, ideal: 12, steepingDays: 7,
        shishaMin: 15, shishaMax: 25, shishaIdeal: 20, shishaSteepingDays: 3,
        isShishaOnly: false,
        note: 'Sladká lesní chuť',
        composition: { pg: 60, vg: 5, alcohol: 25, water: 5, other: 5 }
    },
    peach: { 
        name: 'Peach / Broskev', 
        min: 10, max: 15, ideal: 12, steepingDays: 7,
        shishaMin: 15, shishaMax: 25, shishaIdeal: 20, shishaSteepingDays: 3,
        isShishaOnly: false,
        note: 'Jemná ovocná chuť',
        composition: { pg: 55, vg: 10, alcohol: 25, water: 5, other: 5 }
    },
    mango: { 
        name: 'Mango', 
        min: 12, max: 18, ideal: 15, steepingDays: 10,
        shishaMin: 15, shishaMax: 25, shishaIdeal: 20, shishaSteepingDays: 3,
        isShishaOnly: false,
        note: 'Exotická sladká chuť',
        composition: { pg: 55, vg: 10, alcohol: 25, water: 5, other: 5 }
    },
    strawberry: { 
        name: 'Strawberry / Jahoda', 
        min: 8, max: 12, ideal: 10, steepingDays: 7,
        shishaMin: 15, shishaMax: 25, shishaIdeal: 20, shishaSteepingDays: 3,
        isShishaOnly: false,
        note: 'Klasická oblíbená chuť',
        composition: { pg: 60, vg: 5, alcohol: 25, water: 5, other: 5 }
    },
    mixed_fruit: { 
        name: 'Mixed Fruit / Ovocný mix', 
        min: 10, max: 16, ideal: 13, steepingDays: 7,
        shishaMin: 18, shishaMax: 28, shishaIdeal: 22, shishaSteepingDays: 4,
        isShishaOnly: false,
        note: 'Kombinace více ovocných chutí',
        composition: { pg: 55, vg: 10, alcohol: 25, water: 5, other: 5 }
    },
    cola: { 
        name: 'Cola', 
        min: 8, max: 12, ideal: 10, steepingDays: 7,
        shishaMin: 12, shishaMax: 20, shishaIdeal: 16, shishaSteepingDays: 3,
        isShishaOnly: false,
        note: 'Nápojová klasika',
        composition: { pg: 40, vg: 30, alcohol: 20, water: 5, other: 5 }
    },
    gum: { 
        name: 'Gum / Žvýkačka', 
        min: 12, max: 18, ideal: 15, steepingDays: 7,
        shishaMin: 15, shishaMax: 25, shishaIdeal: 20, shishaSteepingDays: 2,
        isShishaOnly: false,
        note: 'Sladká žvýkačková chuť',
        composition: { pg: 50, vg: 10, alcohol: 30, water: 5, other: 5 }
    },
    rose: { 
        name: 'Rose / Růže', 
        min: 8, max: 14, ideal: 10, steepingDays: 10,
        shishaMin: 10, shishaMax: 18, shishaIdeal: 14, shishaSteepingDays: 4,
        isShishaOnly: true,
        note: 'Jemná květinová chuť, tradiční pro shisha',
        composition: { pg: 60, vg: 5, alcohol: 25, water: 5, other: 5 }
    },
    custom: { 
        name: 'Vlastní', 
        min: 5, max: 25, ideal: 10, steepingDays: 7,
        shishaMin: 10, shishaMax: 30, shishaIdeal: 20, shishaSteepingDays: 3,
        isShishaOnly: false,
        note: 'Vlastní příchutě - nastavte dle výrobce',
        composition: { pg: 60, vg: 5, alcohol: 25, water: 5, other: 5 }
    }
};

// Additive database pro Liquid PRO
// Aditiva jako chladiva, sladidla, zesilovače, terpeny
const additiveDatabase = {
    coolant: {
        nameKey: 'additive.coolant',
        defaultPercent: 1.5,
        minPercent: 0.2,
        maxPercent: 4,
        descriptionKey: 'additive.coolant_desc',
        composition: { pg: 100, vg: 0, alcohol: 0, water: 0, other: 0 }
    },
    sweetener: {
        nameKey: 'additive.sweetener',
        defaultPercent: 0.5,
        minPercent: 0.2,
        maxPercent: 2,
        descriptionKey: 'additive.sweetener_desc',
        composition: { pg: 90, vg: 0, alcohol: 0, water: 10, other: 0 }
    },
    enhancer: {
        nameKey: 'additive.enhancer',
        defaultPercent: 1,
        minPercent: 0.5,
        maxPercent: 3,
        descriptionKey: 'additive.enhancer_desc',
        composition: { pg: 100, vg: 0, alcohol: 0, water: 0, other: 0 }
    },
    terpene: {
        nameKey: 'additive.terpene',
        defaultPercent: 2,
        minPercent: 1,
        maxPercent: 5,
        descriptionKey: 'additive.terpene_desc',
        composition: { pg: 50, vg: 0, alcohol: 40, water: 0, other: 10 }
    }
};

// Sweetener database - sladidla pro shisha
const sweetenerDatabase = {
    sucralose: {
        name: 'Sukralóza',
        nameKey: 'shisha.sweetener_sucralose',
        defaultPercent: 3,
        minPercent: 1,
        maxPercent: 8,
        density: 1.5,
        composition: { pg: 90, vg: 0, alcohol: 0, water: 10, other: 0 }
    },
    ethyl_maltol: {
        name: 'Ethyl Maltol',
        nameKey: 'shisha.sweetener_ethyl_maltol',
        defaultPercent: 2,
        minPercent: 0.5,
        maxPercent: 5,
        density: 1.0,
        composition: { pg: 100, vg: 0, alcohol: 0, water: 0, other: 0 }
    },
    stevia: {
        name: 'Stevia',
        nameKey: 'shisha.sweetener_stevia',
        defaultPercent: 2,
        minPercent: 0.5,
        maxPercent: 5,
        density: 1.0,
        composition: { pg: 80, vg: 0, alcohol: 0, water: 20, other: 0 }
    },
    honey: {
        name: 'Med',
        nameKey: 'shisha.sweetener_honey',
        defaultPercent: 5,
        minPercent: 2,
        maxPercent: 10,
        density: 1.42,
        composition: { pg: 0, vg: 0, alcohol: 0, water: 20, other: 80 }
    },
    molasses: {
        name: 'Melasa',
        nameKey: 'shisha.sweetener_molasses',
        defaultPercent: 5,
        minPercent: 2,
        maxPercent: 10,
        density: 1.4,
        composition: { pg: 0, vg: 0, alcohol: 0, water: 25, other: 75 }
    },
    agave: {
        name: 'Agáve',
        nameKey: 'shisha.sweetener_agave',
        defaultPercent: 4,
        minPercent: 2,
        maxPercent: 8,
        density: 1.35,
        composition: { pg: 0, vg: 0, alcohol: 0, water: 25, other: 75 }
    }
};

// Densities for gram calculations (g/ml)
const ingredientDensities = {
    pg: 1.036,
    vg: 1.261,
    water: 1.000,
    alcohol: 0.789,
    other: 1.000  // approximation
};

// Calculate density of a composition
function calculateCompositionDensity(composition) {
    if (!composition) return 1.036; // default to PG
    return (
        (composition.pg / 100) * ingredientDensities.pg +
        (composition.vg / 100) * ingredientDensities.vg +
        (composition.alcohol / 100) * ingredientDensities.alcohol +
        (composition.water / 100) * ingredientDensities.water +
        (composition.other / 100) * ingredientDensities.other
    );
}

// Calculate nicotine density based on VG/PG ratio
function calculateNicotineDensity(vgPercent) {
    return (vgPercent / 100) * ingredientDensities.vg + ((100 - vgPercent) / 100) * ingredientDensities.pg;
}

// Calculate premixed base density based on VG/PG ratio
function calculatePremixedBaseDensity(vgPercent) {
    return (vgPercent / 100) * ingredientDensities.vg + ((100 - vgPercent) / 100) * ingredientDensities.pg;
}

// Convert ml to grams
function mlToGrams(volumeMl, density) {
    return (volumeMl * density).toFixed(2);
}

// Helper funkce pro získání shisha hodnot z flavorDatabase
// Vrací objekt s min, max, ideal, steepingDays pro shisha formulář
function getShishaFlavorData(flavorType) {
    const flavor = flavorDatabase[flavorType] || flavorDatabase.custom;
    return {
        name: flavor.name,
        min: flavor.shishaMin ?? flavor.min,
        max: flavor.shishaMax ?? flavor.max,
        ideal: flavor.shishaIdeal ?? flavor.ideal,
        steepingDays: flavor.shishaSteepingDays ?? flavor.steepingDays,
        composition: flavor.composition,
        isShishaOnly: flavor.isShishaOnly || false
    };
}

// Alias pro zpětnou kompatibilitu - shishaFlavorDatabase nyní používá flavorDatabase
const shishaFlavorDatabase = new Proxy({}, {
    get: function(target, prop) {
        if (prop === 'custom') {
            return getShishaFlavorData('custom');
        }
        const flavor = flavorDatabase[prop];
        if (flavor) {
            return getShishaFlavorData(prop);
        }
        return undefined;
    },
    has: function(target, prop) {
        return prop in flavorDatabase;
    }
});

// Export additive database
window.additiveDatabase = additiveDatabase;
window.shishaFlavorDatabase = shishaFlavorDatabase;
window.getShishaFlavorData = getShishaFlavorData;
window.sweetenerDatabase = sweetenerDatabase;
window.ingredientDensities = ingredientDensities;
window.calculateCompositionDensity = calculateCompositionDensity;
window.mlToGrams = mlToGrams;

// Helper funkce pro výpočet doporučeného data zrání
function calculateMaturityDate(mixedDate, flavorType) {
    const flavor = flavorDatabase[flavorType] || flavorDatabase.fruit;
    const steepingDays = flavor.steepingDays || 7;
    const maturityDate = new Date(mixedDate);
    maturityDate.setDate(maturityDate.getDate() + steepingDays);
    return maturityDate;
}

// Pro Liquid PRO s více příchutěmi - najde nejdelší dobu zrání
function calculateMaxMaturityDate(mixedDate, flavorTypes) {
    if (!flavorTypes || flavorTypes.length === 0) {
        return calculateMaturityDate(mixedDate, 'fruit');
    }
    let maxSteepingDays = 0;
    for (const type of flavorTypes) {
        const flavor = flavorDatabase[type] || flavorDatabase.fruit;
        const days = flavor.steepingDays || 7;
        if (days > maxSteepingDays) {
            maxSteepingDays = days;
        }
    }
    const maturityDate = new Date(mixedDate);
    maturityDate.setDate(maturityDate.getDate() + maxSteepingDays);
    return maturityDate;
}

// Export pro použití v jiných modulech
window.flavorDatabase = flavorDatabase;
window.calculateMaturityDate = calculateMaturityDate;
window.calculateMaxMaturityDate = calculateMaxMaturityDate;

// VG/PG ratio descriptions with colors
// VG value = dým (vapor), PG value = chuť (flavor)
const ratioDescriptions = [
    { vgMin: 0, vgMax: 9, color: '#ffffff', text: 'Maximální pára, žádná chuť ani škrábání. Určeno pro zařízení s vysokým výkonem >80 W, jinak se ucpává cívka.' },
    { vgMin: 10, vgMax: 29, color: '#0044aa', text: 'Maximální pára, minimální chuť bez škrábání. Hustý liquid pro cloudové vapování. Určeno pro zařízení s vysokým výkonem >80 W, jinak se ucpává cívka.' },
    { vgMin: 30, vgMax: 34, color: '#0066dd', text: 'Výrazná pára, zeslabující nebo pokažená chuť. Stále hustý liquid.' },
    { vgMin: 35, vgMax: 40, color: '#00aaff', text: 'Znatelný nárůst páry, chuť zůstává nosná. Vyvážený liquid s důrazem na páru.' },
    { vgMin: 41, vgMax: 55, color: '#00cc66', text: 'Vyvážený poměr páry a chuti, vhodný pro většinu zařízení.' },
    { vgMin: 56, vgMax: 60, color: '#88cc00', text: 'Jemné škrábání, nosná chuť, slabší pára. Vhodné pro MTL zařízení.' },
    { vgMin: 61, vgMax: 70, color: '#ffaa00', text: 'Výraznější škrábání, výrazná chuť. Pro zkušenější vapery.' },
    { vgMin: 71, vgMax: 90, color: '#ff6600', text: 'Dráždění a škrábání krku pro suchý vzduch, výrazná chuť. Určeno jenom pro speciální zařízení DTL s vyšším odporem cívky.' },
    { vgMin: 91, vgMax: 100, color: '#ff0044', text: 'Dráždění a škrábání krku pro suchý vzduch, maximální chuť a nikotin. Žádná pára. Určeno jenom pro speciální zařízení DTL s vyšším odporem.' }
];

// Nicotine strength descriptions
const nicotineDescriptions = [
    { min: 0, max: 0, color: '#00cc66', key: 'nic_0', text: 'Bez nikotinu - vhodné pro nekuřáky nebo postupné odvykání.' },
    { min: 1, max: 3, color: '#00aaff', key: 'nic_1_3', text: 'Velmi slabý nikotin - pro příležitostné vapery a finální fáze odvykání.' },
    { min: 4, max: 6, color: '#0088dd', key: 'nic_4_6', text: 'Slabý nikotin - pro lehké kuřáky (do 10 cigaret denně).' },
    { min: 7, max: 11, color: '#00cc88', key: 'nic_7_11', text: 'Střední nikotin - pro středně silné kuřáky (10-20 cigaret denně).' },
    { min: 12, max: 20, color: '#ffaa00', key: 'nic_12_20', text: 'Pro silné kuřáky, silné cigarety, bez předchozí zkušenosti hrozí nevolnost.' },
    { min: 21, max: 35, color: '#ff6600', key: 'nic_21_35', text: 'Vysoký nikotin - pouze pro velmi silné kuřáky nebo pod-systémy. Nikotinová sůl doporučena.' },
    { min: 36, max: 45, color: '#ff0044', key: 'nic_36_45', text: 'Extrémně silný - pouze pro pod-systémy s nikotinovou solí. Nebezpečí předávkování!' }
];

// Shisha VG/PG ratio description — praktické rady pro uživatele
// vgPercent = VG/(VG+PG)*100, vgPgSharePercent = (VG+PG)/totalAmount*100
function getShishaRatioDescription(vgPercent, vgPgSharePercent) {
    let text = '';
    let color = '#00cc66';
    const vgOfTotal = Math.round(vgPgSharePercent * vgPercent / 100);
    const pgOfTotal = Math.round(vgPgSharePercent * (100 - vgPercent) / 100);
    
    if (vgPgSharePercent < 5) {
        text = t('shisha.ratio_no_vgpg', 'The blend does not contain VG or PG yet. Add flavor or glycerin for proper consistency.');
        color = '#00aaff';
    } else if (vgPgSharePercent < 60) {
        if (pgOfTotal === 0 && vgOfTotal > 0) {
            text = t('shisha.ratio_low_only_vg', '✅ OK — glycerin ({{vg}} % of volume) ensures thick smoke. Adding PG-based flavors will help the blend absorb into the tobacco.').replace('{{vg}}', vgOfTotal);
            color = '#00aaff';
        } else if (vgOfTotal === 0 && pgOfTotal > 0) {
            text = t('shisha.ratio_low_only_pg', '⚠ Without glycerin the blend will be thin and may irritate the throat. Add at least 15–20 % glycerin.');
            color = '#ffaa00';
        } else if (vgPercent < 30 && pgOfTotal > vgOfTotal) {
            text = t('shisha.ratio_low_pg_dominant', '⚠ Higher PG ({{pg}} % vs VG {{vg}} %) — strong flavor, but watch for throat irritation. Don\'t exceed 15 % total PG. We recommend adding at least 15–20 % glycerin.')
                .replace('{{pg}}', pgOfTotal).replace('{{vg}}', vgOfTotal);
            color = '#ffaa00';
        } else {
            text = t('shisha.ratio_low_balanced', '✅ OK — VG ({{vg}} %) and PG ({{pg}} %) in acceptable ratio. The rest is sweetener and water.').replace('{{vg}}', vgOfTotal).replace('{{pg}}', pgOfTotal);
            color = '#00cc66';
        }
    } else {
        if (vgPercent >= 90) {
            text = t('shisha.ratio_extreme_vg', '⚠ Too thick blend — risk of burning and poor draw. Add flavor or reduce glycerin.');
            color = '#ff6600';
        } else if (vgPercent >= 80) {
            text = t('shisha.ratio_high_vg', '⚠ Very thick blend — may burn on the coals. Consider adding flavor (PG base) for better consistency.');
            color = '#ffaa00';
        } else if (vgPercent >= 70) {
            text = t('shisha.ratio_more_vg', '👍 Thicker smoke, good draw. Flavor may be slightly muted — add more flavor if you want a stronger taste.');
            color = '#00aaff';
        } else if (vgPercent >= 56) {
            text = t('shisha.ratio_ideal_vg', '✅ Excellent — thick smoke and good flavor. Ideal ratio for most shisha blends.');
            color = '#00cc66';
        } else if (vgPercent >= 45) {
            text = t('shisha.ratio_balanced', '✅ Balanced ratio — pleasant smoke and flavor. Universal base for shisha.');
            color = '#00cc66';
        } else if (vgPercent >= 30) {
            text = t('shisha.ratio_more_pg', '⚠ Thinner blend — less smoke, but more pronounced flavor. May slightly irritate the throat during longer sessions.');
            color = '#ffaa00';
        } else if (vgPercent >= 10) {
            text = t('shisha.ratio_high_pg', '⚠ Too thin blend — weak smoke, may irritate the throat. Add glycerin for thicker smoke and smoother draw.');
            color = '#ff6600';
        } else {
            text = t('shisha.ratio_extreme_pg', '❌ Not suitable for shisha — almost no smoke, will irritate the throat. Add glycerin (at least 30 % VG).');
            color = '#ff0044';
        }
    }
    
    return { text, color };
}

// Shisha nicotine descriptions - max 10mg, přizpůsobeno pro shisha zvyklosti
const shishaNicotineDescriptions = [
    { min: 0, max: 0, color: '#00cc66', key: 'sh_nic_0', text: 'No nicotine - traditional shisha experience without nicotine.' },
    { min: 1, max: 2, color: '#00aaff', key: 'sh_nic_1_2', text: 'Very light - gentle nicotine touch, suitable for beginners.' },
    { min: 3, max: 4, color: '#0088dd', key: 'sh_nic_3_4', text: 'Light - mild nicotine for occasional users.' },
    { min: 5, max: 6, color: '#00cc88', key: 'sh_nic_5_6', text: 'Medium - balanced strength for regular users.' },
    { min: 7, max: 8, color: '#ffaa00', key: 'sh_nic_7_8', text: 'Stronger - for experienced users, may cause dizziness.' },
    { min: 9, max: 10, color: '#ff6600', key: 'sh_nic_9_10', text: 'Strong - maximum recommended strength for shisha, experienced users only.' }
];

// Shisha base (sweetener/glycerin/water) descriptions
function getShishaBaseDescription(sweet, glyc, water) {
    let text = '';
    let color = '#00cc66';
    
    // Analýza sladidla
    if (sweet >= 70) {
        text = t('shisha.base_sweet_very_high', 'Very sweet blend. High sweetener content can be too intense and overpower other flavors. We recommend reducing below 60 %.');
        color = '#ff6600';
    } else if (sweet >= 55 && sweet <= 69) {
        text = t('shisha.base_sweet_high', 'Sweet blend with a pronounced flavor base. Suitable for fruity and dessert flavors.');
        color = '#ffaa00';
    } else if (sweet >= 40 && sweet <= 54) {
        text = t('shisha.base_sweet_balanced', 'Balanced blend. Good ratio of sweetness and density, universal base for most flavors.');
        color = '#00cc66';
    } else if (sweet >= 20 && sweet <= 39) {
        text = t('shisha.base_sweet_low', 'Less sweet blend. Glycerin dominates, the blend will be thicker with more pronounced smoke.');
        color = '#00aaff';
    } else if (sweet >= 1 && sweet <= 19) {
        text = t('shisha.base_sweet_minimal', 'Minimal sweetness. The blend will have the character of pure glycerin with water.');
        color = '#0088dd';
    } else if (sweet === 0) {
        text = t('shisha.base_sweet_none', 'No sweetener. Only glycerin and water — neutral base suitable for strong flavors.');
        color = '#0066cc';
    }
    
    // Doplnění o analýzu vody
    if (water > 30) {
        text += t('shisha.base_water_very_high', ' Warning: high water content (over 30 %) significantly thins the blend and reduces smoke production.');
        color = '#ff6600';
    } else if (water >= 20 && water <= 30) {
        text += t('shisha.base_water_high', ' Higher water content ensures a thinner blend with a lighter draw.');
    } else if (water >= 10 && water <= 19) {
        text += t('shisha.base_water_medium', ' Moderate amount of water for a balanced draw.');
    } else if (water >= 1 && water <= 9) {
        text += t('shisha.base_water_low', ' Low water content — thicker blend with more intense smoke.');
    } else if (water === 0) {
        text += t('shisha.base_water_none', ' No water — maximum blend density.');
    }
    
    // Analýza glycerinu
    if (glyc >= 60) {
        text += t('shisha.base_glyc_very_high', ' Very thick blend due to high glycerin — rich smoke.');
    } else if (glyc <= 10 && glyc > 0) {
        text += t('shisha.base_glyc_low', ' Low glycerin — the blend will be thinner with less smoke production.');
    } else if (glyc === 0) {
        text += t('shisha.base_glyc_none', ' No glycerin — minimal smoke production, only sweetener and water.');
        color = '#ff6600';
    }
    
    return { text, color };
}

// Získat přeložený popis nikotinu
function getNicotineDescriptionText(value) {
    const desc = nicotineDescriptions.find(d => value >= d.min && value <= d.max);
    if (desc) {
        return t(`nicotine_descriptions.${desc.key}`, desc.text);
    }
    return '';
}

// Získat přeložený popis nikotinu pro shisha
function getShishaNicotineDescriptionText(value) {
    const desc = shishaNicotineDescriptions.find(d => value >= d.min && value <= d.max);
    if (desc) {
        return t(`shisha_nicotine_descriptions.${desc.key}`, desc.text);
    }
    return '';
}

// GDPR result page handler — shows overlay after redirect from Supabase edge function
function handleGdprResult() {
    const params = new URLSearchParams(window.location.search);
    const gdprResult = params.get('gdpr');
    if (!gdprResult) return;

    const lang = params.get('lang') || document.documentElement.lang || 'en';
    const S = '#00ff88', W = '#ffaa00', E = '#ff4444';
    const msgs = {
        deleted: {
            cs: { h: 'Váš účet byl smazán', m: 'Všechna vaše data byla nenávratně odstraněna v souladu s GDPR.', icon: '✓', color: S },
            sk: { h: 'Váš účet bol zmazaný', m: 'Všetky vaše dáta boli nenávratne odstránené v súlade s GDPR.', icon: '✓', color: S },
            en: { h: 'Your account has been deleted', m: 'All your data has been permanently removed in compliance with GDPR.', icon: '✓', color: S },
            de: { h: 'Ihr Konto wurde gelöscht', m: 'Alle Ihre Daten wurden gemäß DSGVO dauerhaft entfernt.', icon: '✓', color: S },
            fr: { h: 'Votre compte a été supprimé', m: 'Toutes vos données ont été définitivement supprimées conformément au RGPD.', icon: '✓', color: S },
            es: { h: 'Tu cuenta ha sido eliminada', m: 'Todos tus datos han sido eliminados permanentemente de acuerdo con el RGPD.', icon: '✓', color: S },
            it: { h: 'Il tuo account è stato eliminato', m: 'Tutti i tuoi dati sono stati rimossi permanentemente in conformità con il GDPR.', icon: '✓', color: S },
            pt: { h: 'A sua conta foi eliminada', m: 'Todos os seus dados foram permanentemente removidos em conformidade com o RGPD.', icon: '✓', color: S },
            pl: { h: 'Twoje konto zostało usunięte', m: 'Wszystkie Twoje dane zostały trwale usunięte zgodnie z RODO.', icon: '✓', color: S },
            nl: { h: 'Uw account is verwijderd', m: 'Al uw gegevens zijn permanent verwijderd in overeenstemming met de AVG.', icon: '✓', color: S },
            ru: { h: 'Ваш аккаунт удалён', m: 'Все ваши данные были безвозвратно удалены в соответствии с GDPR.', icon: '✓', color: S },
            uk: { h: 'Ваш акаунт видалено', m: 'Усі ваші дані було безповоротно видалено відповідно до GDPR.', icon: '✓', color: S },
            ro: { h: 'Contul dvs. a fost șters', m: 'Toate datele dvs. au fost șterse permanent în conformitate cu GDPR.', icon: '✓', color: S },
            hu: { h: 'Fiókja törölve', m: 'Minden adata véglegesen eltávolításra került a GDPR-nek megfelelően.', icon: '✓', color: S },
            bg: { h: 'Акаунтът ви е изтрит', m: 'Всички ваши данни са окончателно премахнати в съответствие с GDPR.', icon: '✓', color: S },
            hr: { h: 'Vaš račun je izbrisan', m: 'Svi vaši podaci trajno su uklonjeni u skladu s GDPR-om.', icon: '✓', color: S },
            sr: { h: 'Ваш налог је обрисан', m: 'Сви ваши подаци су трајно уклоњени у складу са ГДПР-ом.', icon: '✓', color: S },
            el: { h: 'Ο λογαριασμός σας διαγράφηκε', m: 'Όλα τα δεδομένα σας αφαιρέθηκαν μόνιμα σύμφωνα με τον GDPR.', icon: '✓', color: S },
            tr: { h: 'Hesabınız silindi', m: 'Tüm verileriniz KVKK uyarınca kalıcı olarak kaldırıldı.', icon: '✓', color: S },
            fi: { h: 'Tilisi on poistettu', m: 'Kaikki tietosi on poistettu pysyvästi GDPR:n mukaisesti.', icon: '✓', color: S },
            sv: { h: 'Ditt konto har raderats', m: 'All din data har permanent tagits bort i enlighet med GDPR.', icon: '✓', color: S },
            no: { h: 'Kontoen din er slettet', m: 'Alle dine data er permanent fjernet i samsvar med GDPR.', icon: '✓', color: S },
            da: { h: 'Din konto er slettet', m: 'Alle dine data er permanent fjernet i overensstemmelse med GDPR.', icon: '✓', color: S },
            lt: { h: 'Jūsų paskyra ištrinta', m: 'Visi jūsų duomenys buvo negrįžtamai pašalinti pagal BDAR.', icon: '✓', color: S },
            lv: { h: 'Jūsu konts ir dzēsts', m: 'Visi jūsu dati ir neatgriezeniski dzēsti saskaņā ar VDAR.', icon: '✓', color: S },
            et: { h: 'Teie konto on kustutatud', m: 'Kõik teie andmed on jäädavalt eemaldatud vastavalt GDPR-ile.', icon: '✓', color: S },
            ja: { h: 'アカウントが削除されました', m: 'GDPRに準拠して、すべてのデータが完全に削除されました。', icon: '✓', color: S },
            ko: { h: '계정이 삭제되었습니다', m: 'GDPR에 따라 모든 데이터가 영구적으로 삭제되었습니다.', icon: '✓', color: S },
            'zh-CN': { h: '您的账户已删除', m: '根据GDPR，您的所有数据已被永久删除。', icon: '✓', color: S },
            'zh-TW': { h: '您的帳戶已刪除', m: '根據GDPR，您的所有資料已被永久刪除。', icon: '✓', color: S },
            'ar-SA': { h: 'تم حذف حسابك', m: 'تم حذف جميع بياناتك نهائيًا وفقًا للائحة GDPR.', icon: '✓', color: S }
        },
        cancelled: {
            cs: { h: 'Váš účet zůstává aktivní', m: 'Děkujeme, že zůstáváte s LiquiMixer! Požadavek na smazání byl zrušen.', icon: '✓', color: S },
            sk: { h: 'Váš účet zostáva aktívny', m: 'Ďakujeme, že zostávate s LiquiMixer! Požiadavka na zmazanie bola zrušená.', icon: '✓', color: S },
            en: { h: 'Your account remains active', m: 'Thank you for staying with LiquiMixer! The deletion request has been cancelled.', icon: '✓', color: S },
            de: { h: 'Ihr Konto bleibt aktiv', m: 'Danke, dass Sie bei LiquiMixer bleiben! Der Löschantrag wurde storniert.', icon: '✓', color: S },
            fr: { h: 'Votre compte reste actif', m: 'Merci de rester avec LiquiMixer ! La demande de suppression a été annulée.', icon: '✓', color: S },
            es: { h: 'Tu cuenta sigue activa', m: '¡Gracias por quedarte con LiquiMixer! La solicitud de eliminación ha sido cancelada.', icon: '✓', color: S },
            it: { h: 'Il tuo account resta attivo', m: 'Grazie per restare con LiquiMixer! La richiesta di cancellazione è stata annullata.', icon: '✓', color: S },
            pt: { h: 'A sua conta permanece ativa', m: 'Obrigado por ficar com o LiquiMixer! O pedido de eliminação foi cancelado.', icon: '✓', color: S },
            pl: { h: 'Twoje konto pozostaje aktywne', m: 'Dziękujemy, że zostajesz z LiquiMixer! Żądanie usunięcia zostało anulowane.', icon: '✓', color: S },
            nl: { h: 'Uw account blijft actief', m: 'Bedankt dat u bij LiquiMixer blijft! Het verwijderingsverzoek is geannuleerd.', icon: '✓', color: S },
            ru: { h: 'Ваш аккаунт остаётся активным', m: 'Спасибо, что остаётесь с LiquiMixer! Запрос на удаление отменён.', icon: '✓', color: S },
            uk: { h: 'Ваш акаунт залишається активним', m: 'Дякуємо, що залишаєтесь з LiquiMixer! Запит на видалення скасовано.', icon: '✓', color: S },
            ro: { h: 'Contul dvs. rămâne activ', m: 'Vă mulțumim că rămâneți cu LiquiMixer! Cererea de ștergere a fost anulată.', icon: '✓', color: S },
            hu: { h: 'Fiókja aktív marad', m: 'Köszönjük, hogy marad a LiquiMixerrel! A törlési kérelem visszavonva.', icon: '✓', color: S },
            bg: { h: 'Акаунтът ви остава активен', m: 'Благодарим, че оставате с LiquiMixer! Заявката за изтриване е отменена.', icon: '✓', color: S },
            hr: { h: 'Vaš račun ostaje aktivan', m: 'Hvala što ostajete s LiquiMixerom! Zahtjev za brisanje je otkazan.', icon: '✓', color: S },
            sr: { h: 'Ваш налог остаје активан', m: 'Хвала што остајете са LiquiMixer-ом! Захтев за брисање је отказан.', icon: '✓', color: S },
            el: { h: 'Ο λογαριασμός σας παραμένει ενεργός', m: 'Ευχαριστούμε που μένετε με το LiquiMixer! Το αίτημα διαγραφής ακυρώθηκε.', icon: '✓', color: S },
            tr: { h: 'Hesabınız aktif kalıyor', m: 'LiquiMixer ile kaldığınız için teşekkürler! Silme talebi iptal edildi.', icon: '✓', color: S },
            fi: { h: 'Tilisi pysyy aktiivisena', m: 'Kiitos että pysyt LiquiMixerin käyttäjänä! Poistopyyntö on peruutettu.', icon: '✓', color: S },
            sv: { h: 'Ditt konto förblir aktivt', m: 'Tack för att du stannar med LiquiMixer! Raderingsbegäran har avbrutits.', icon: '✓', color: S },
            no: { h: 'Kontoen din forblir aktiv', m: 'Takk for at du blir med LiquiMixer! Sletteforespørselen er kansellert.', icon: '✓', color: S },
            da: { h: 'Din konto forbliver aktiv', m: 'Tak fordi du bliver hos LiquiMixer! Sletteanmodningen er annulleret.', icon: '✓', color: S },
            lt: { h: 'Jūsų paskyra lieka aktyvi', m: 'Ačiū, kad liekate su LiquiMixer! Ištrynimo užklausa atšaukta.', icon: '✓', color: S },
            lv: { h: 'Jūsu konts paliek aktīvs', m: 'Paldies, ka paliekat ar LiquiMixer! Dzēšanas pieprasījums ir atcelts.', icon: '✓', color: S },
            et: { h: 'Teie konto jääb aktiivseks', m: 'Täname, et jääte LiquiMixeriga! Kustutamistaotlus on tühistatud.', icon: '✓', color: S },
            ja: { h: 'アカウントは有効です', m: 'LiquiMixerをご利用いただきありがとうございます！削除リクエストはキャンセルされました。', icon: '✓', color: S },
            ko: { h: '계정이 활성 상태입니다', m: 'LiquiMixer를 계속 이용해 주셔서 감사합니다! 삭제 요청이 취소되었습니다.', icon: '✓', color: S },
            'zh-CN': { h: '您的账户保持活跃', m: '感谢您继续使用LiquiMixer！删除请求已取消。', icon: '✓', color: S },
            'zh-TW': { h: '您的帳戶保持活躍', m: '感謝您繼續使用LiquiMixer！刪除請求已取消。', icon: '✓', color: S },
            'ar-SA': { h: 'حسابك لا يزال نشطًا', m: 'شكرًا لبقائك مع LiquiMixer! تم إلغاء طلب الحذف.', icon: '✓', color: S }
        },
        expired: {
            cs: { h: 'Odkaz vypršel', m: 'Platnost tohoto odkazu vypršela (24 hodin). Pokud si stále přejete smazat účet, podejte nový požadavek.', icon: '⚠', color: W },
            sk: { h: 'Odkaz vypršal', m: 'Platnosť tohto odkazu vypršala (24 hodín). Ak si stále prajete zmazať účet, podajte novú požiadavku.', icon: '⚠', color: W },
            en: { h: 'Link expired', m: 'This link has expired (24 hours). If you still wish to delete your account, please submit a new request.', icon: '⚠', color: W },
            de: { h: 'Link abgelaufen', m: 'Dieser Link ist abgelaufen (24 Stunden). Stellen Sie bitte einen neuen Antrag.', icon: '⚠', color: W },
            fr: { h: 'Lien expiré', m: 'Ce lien a expiré (24 heures). Veuillez soumettre une nouvelle demande.', icon: '⚠', color: W },
            es: { h: 'Enlace caducado', m: 'Este enlace ha caducado (24 horas). Envía una nueva solicitud.', icon: '⚠', color: W },
            it: { h: 'Link scaduto', m: 'Questo link è scaduto (24 ore). Invia una nuova richiesta.', icon: '⚠', color: W },
            pt: { h: 'Link expirado', m: 'Este link expirou (24 horas). Envie um novo pedido.', icon: '⚠', color: W },
            pl: { h: 'Link wygasł', m: 'Ten link wygasł (24 godziny). Złóż nowe żądanie.', icon: '⚠', color: W },
            nl: { h: 'Link verlopen', m: 'Deze link is verlopen (24 uur). Dien een nieuw verzoek in.', icon: '⚠', color: W },
            ru: { h: 'Ссылка истекла', m: 'Срок действия ссылки истёк (24 часа). Подайте новый запрос.', icon: '⚠', color: W },
            uk: { h: 'Посилання прострочене', m: 'Термін дії посилання минув (24 години). Подайте новий запит.', icon: '⚠', color: W },
            ro: { h: 'Link expirat', m: 'Acest link a expirat (24 ore). Trimiteți o nouă cerere.', icon: '⚠', color: W },
            hu: { h: 'A link lejárt', m: 'Ez a link lejárt (24 óra). Kérjük, küldjön új kérelmet.', icon: '⚠', color: W },
            bg: { h: 'Линкът е изтекъл', m: 'Този линк е изтекъл (24 часа). Подайте нова заявка.', icon: '⚠', color: W },
            hr: { h: 'Poveznica je istekla', m: 'Ova poveznica je istekla (24 sata). Pošaljite novi zahtjev.', icon: '⚠', color: W },
            sr: { h: 'Линк је истекао', m: 'Овај линк је истекао (24 сата). Поднесите нови захтев.', icon: '⚠', color: W },
            el: { h: 'Ο σύνδεσμος έληξε', m: 'Αυτός ο σύνδεσμος έληξε (24 ώρες). Υποβάλετε νέο αίτημα.', icon: '⚠', color: W },
            tr: { h: 'Bağlantı süresi doldu', m: 'Bu bağlantının süresi doldu (24 saat). Yeni bir talep gönderin.', icon: '⚠', color: W },
            fi: { h: 'Linkki vanhentunut', m: 'Tämä linkki on vanhentunut (24 tuntia). Lähetä uusi pyyntö.', icon: '⚠', color: W },
            sv: { h: 'Länken har gått ut', m: 'Denna länk har gått ut (24 timmar). Skicka en ny begäran.', icon: '⚠', color: W },
            no: { h: 'Lenken er utløpt', m: 'Denne lenken er utløpt (24 timer). Send en ny forespørsel.', icon: '⚠', color: W },
            da: { h: 'Linket er udløbet', m: 'Dette link er udløbet (24 timer). Indsend en ny anmodning.', icon: '⚠', color: W },
            lt: { h: 'Nuoroda nebegalioja', m: 'Ši nuoroda nebegalioja (24 val.). Pateikite naują užklausą.', icon: '⚠', color: W },
            lv: { h: 'Saite ir beigusies', m: 'Šī saite ir beigusies (24 stundas). Iesniedziet jaunu pieprasījumu.', icon: '⚠', color: W },
            et: { h: 'Link on aegunud', m: 'See link on aegunud (24 tundi). Esitage uus taotlus.', icon: '⚠', color: W },
            ja: { h: 'リンクの有効期限切れ', m: 'このリンクは期限切れです（24時間）。新しいリクエストを送信してください。', icon: '⚠', color: W },
            ko: { h: '링크가 만료되었습니다', m: '이 링크는 만료되었습니다(24시간). 새 요청을 제출하세요.', icon: '⚠', color: W },
            'zh-CN': { h: '链接已过期', m: '此链接已过期（24小时）。请提交新的请求。', icon: '⚠', color: W },
            'zh-TW': { h: '連結已過期', m: '此連結已過期（24小時）。請提交新的請求。', icon: '⚠', color: W },
            'ar-SA': { h: 'انتهت صلاحية الرابط', m: 'انتهت صلاحية هذا الرابط (24 ساعة). يرجى تقديم طلب جديد.', icon: '⚠', color: W }
        },
        invalid: {
            cs: { h: 'Neplatný odkaz', m: 'Tento odkaz je neplatný nebo byl již použit.', icon: '✕', color: E },
            sk: { h: 'Neplatný odkaz', m: 'Tento odkaz je neplatný alebo bol už použitý.', icon: '✕', color: E },
            en: { h: 'Invalid link', m: 'This link is invalid or has already been used.', icon: '✕', color: E },
            de: { h: 'Ungültiger Link', m: 'Dieser Link ist ungültig oder wurde bereits verwendet.', icon: '✕', color: E },
            fr: { h: 'Lien invalide', m: 'Ce lien est invalide ou a déjà été utilisé.', icon: '✕', color: E },
            es: { h: 'Enlace inválido', m: 'Este enlace es inválido o ya ha sido utilizado.', icon: '✕', color: E },
            it: { h: 'Link non valido', m: 'Questo link non è valido o è già stato utilizzato.', icon: '✕', color: E },
            pt: { h: 'Link inválido', m: 'Este link é inválido ou já foi utilizado.', icon: '✕', color: E },
            pl: { h: 'Nieprawidłowy link', m: 'Ten link jest nieprawidłowy lub został już użyty.', icon: '✕', color: E },
            nl: { h: 'Ongeldige link', m: 'Deze link is ongeldig of is al gebruikt.', icon: '✕', color: E },
            ru: { h: 'Недействительная ссылка', m: 'Эта ссылка недействительна или уже была использована.', icon: '✕', color: E },
            uk: { h: 'Недійсне посилання', m: 'Це посилання недійсне або вже було використане.', icon: '✕', color: E },
            ro: { h: 'Link invalid', m: 'Acest link este invalid sau a fost deja utilizat.', icon: '✕', color: E },
            hu: { h: 'Érvénytelen link', m: 'Ez a link érvénytelen vagy már felhasználták.', icon: '✕', color: E },
            bg: { h: 'Невалиден линк', m: 'Този линк е невалиден или вече е бил използван.', icon: '✕', color: E },
            hr: { h: 'Nevažeća poveznica', m: 'Ova poveznica nije važeća ili je već korištena.', icon: '✕', color: E },
            sr: { h: 'Неважећи линк', m: 'Овај линк је неважећи или је већ коришћен.', icon: '✕', color: E },
            el: { h: 'Μη έγκυρος σύνδεσμος', m: 'Αυτός ο σύνδεσμος δεν είναι έγκυρος ή έχει ήδη χρησιμοποιηθεί.', icon: '✕', color: E },
            tr: { h: 'Geçersiz bağlantı', m: 'Bu bağlantı geçersiz veya zaten kullanılmış.', icon: '✕', color: E },
            fi: { h: 'Virheellinen linkki', m: 'Tämä linkki on virheellinen tai sitä on jo käytetty.', icon: '✕', color: E },
            sv: { h: 'Ogiltig länk', m: 'Denna länk är ogiltig eller har redan använts.', icon: '✕', color: E },
            no: { h: 'Ugyldig lenke', m: 'Denne lenken er ugyldig eller har allerede blitt brukt.', icon: '✕', color: E },
            da: { h: 'Ugyldigt link', m: 'Dette link er ugyldigt eller er allerede blevet brugt.', icon: '✕', color: E },
            lt: { h: 'Netinkama nuoroda', m: 'Ši nuoroda netinkama arba jau buvo panaudota.', icon: '✕', color: E },
            lv: { h: 'Nederīga saite', m: 'Šī saite ir nederīga vai jau ir izmantota.', icon: '✕', color: E },
            et: { h: 'Kehtetu link', m: 'See link on kehtetu või on juba kasutatud.', icon: '✕', color: E },
            ja: { h: '無効なリンク', m: 'このリンクは無効か、すでに使用されています。', icon: '✕', color: E },
            ko: { h: '잘못된 링크', m: '이 링크는 유효하지 않거나 이미 사용되었습니다.', icon: '✕', color: E },
            'zh-CN': { h: '无效链接', m: '此链接无效或已被使用。', icon: '✕', color: E },
            'zh-TW': { h: '無效連結', m: '此連結無效或已被使用。', icon: '✕', color: E },
            'ar-SA': { h: 'رابط غير صالح', m: 'هذا الرابط غير صالح أو تم استخدامه بالفعل.', icon: '✕', color: E }
        },
        used: {
            cs: { h: 'Odkaz již byl použit', m: 'Tento požadavek již byl zpracován.', icon: '⚠', color: W },
            sk: { h: 'Odkaz už bol použitý', m: 'Táto požiadavka už bola spracovaná.', icon: '⚠', color: W },
            en: { h: 'Link already used', m: 'This request has already been processed.', icon: '⚠', color: W },
            de: { h: 'Link bereits verwendet', m: 'Dieser Antrag wurde bereits bearbeitet.', icon: '⚠', color: W },
            fr: { h: 'Lien déjà utilisé', m: 'Cette demande a déjà été traitée.', icon: '⚠', color: W },
            es: { h: 'Enlace ya utilizado', m: 'Esta solicitud ya ha sido procesada.', icon: '⚠', color: W },
            it: { h: 'Link già utilizzato', m: 'Questa richiesta è già stata elaborata.', icon: '⚠', color: W },
            pt: { h: 'Link já utilizado', m: 'Este pedido já foi processado.', icon: '⚠', color: W },
            pl: { h: 'Link już użyty', m: 'To żądanie zostało już przetworzone.', icon: '⚠', color: W },
            nl: { h: 'Link al gebruikt', m: 'Dit verzoek is al verwerkt.', icon: '⚠', color: W },
            ru: { h: 'Ссылка уже использована', m: 'Этот запрос уже обработан.', icon: '⚠', color: W },
            uk: { h: 'Посилання вже використане', m: 'Цей запит вже оброблено.', icon: '⚠', color: W },
            ro: { h: 'Link deja utilizat', m: 'Această cerere a fost deja procesată.', icon: '⚠', color: W },
            hu: { h: 'A link már felhasználva', m: 'Ez a kérelem már feldolgozásra került.', icon: '⚠', color: W },
            bg: { h: 'Линкът вече е използван', m: 'Тази заявка вече е обработена.', icon: '⚠', color: W },
            hr: { h: 'Poveznica već korištena', m: 'Ovaj zahtjev je već obrađen.', icon: '⚠', color: W },
            sr: { h: 'Линк је већ коришћен', m: 'Овај захтев је већ обрађен.', icon: '⚠', color: W },
            el: { h: 'Ο σύνδεσμος χρησιμοποιήθηκε', m: 'Αυτό το αίτημα έχει ήδη επεξεργαστεί.', icon: '⚠', color: W },
            tr: { h: 'Bağlantı zaten kullanıldı', m: 'Bu talep zaten işlendi.', icon: '⚠', color: W },
            fi: { h: 'Linkki on jo käytetty', m: 'Tämä pyyntö on jo käsitelty.', icon: '⚠', color: W },
            sv: { h: 'Länken har redan använts', m: 'Denna begäran har redan behandlats.', icon: '⚠', color: W },
            no: { h: 'Lenken er allerede brukt', m: 'Denne forespørselen er allerede behandlet.', icon: '⚠', color: W },
            da: { h: 'Linket er allerede brugt', m: 'Denne anmodning er allerede behandlet.', icon: '⚠', color: W },
            lt: { h: 'Nuoroda jau panaudota', m: 'Ši užklausa jau apdorota.', icon: '⚠', color: W },
            lv: { h: 'Saite jau izmantota', m: 'Šis pieprasījums jau ir apstrādāts.', icon: '⚠', color: W },
            et: { h: 'Link on juba kasutatud', m: 'See taotlus on juba töödeldud.', icon: '⚠', color: W },
            ja: { h: 'リンクは使用済みです', m: 'このリクエストはすでに処理されています。', icon: '⚠', color: W },
            ko: { h: '링크가 이미 사용되었습니다', m: '이 요청은 이미 처리되었습니다.', icon: '⚠', color: W },
            'zh-CN': { h: '链接已使用', m: '此请求已被处理。', icon: '⚠', color: W },
            'zh-TW': { h: '連結已使用', m: '此請求已被處理。', icon: '⚠', color: W },
            'ar-SA': { h: 'الرابط مستخدم بالفعل', m: 'تم معالجة هذا الطلب بالفعل.', icon: '⚠', color: W }
        },
        error: {
            cs: { h: 'Nastala chyba', m: 'Zkuste to prosím znovu později.', icon: '✕', color: E },
            sk: { h: 'Nastala chyba', m: 'Skúste to prosím znova neskôr.', icon: '✕', color: E },
            en: { h: 'An error occurred', m: 'Please try again later.', icon: '✕', color: E },
            de: { h: 'Ein Fehler ist aufgetreten', m: 'Bitte versuchen Sie es später erneut.', icon: '✕', color: E },
            fr: { h: 'Une erreur est survenue', m: 'Veuillez réessayer plus tard.', icon: '✕', color: E },
            es: { h: 'Se produjo un error', m: 'Por favor, inténtelo de nuevo más tarde.', icon: '✕', color: E },
            it: { h: 'Si è verificato un errore', m: 'Riprova più tardi.', icon: '✕', color: E },
            pt: { h: 'Ocorreu um erro', m: 'Tente novamente mais tarde.', icon: '✕', color: E },
            pl: { h: 'Wystąpił błąd', m: 'Spróbuj ponownie później.', icon: '✕', color: E },
            nl: { h: 'Er is een fout opgetreden', m: 'Probeer het later opnieuw.', icon: '✕', color: E },
            ru: { h: 'Произошла ошибка', m: 'Попробуйте позже.', icon: '✕', color: E },
            uk: { h: 'Сталася помилка', m: 'Спробуйте пізніше.', icon: '✕', color: E },
            ro: { h: 'A apărut o eroare', m: 'Încercați din nou mai târziu.', icon: '✕', color: E },
            hu: { h: 'Hiba történt', m: 'Kérjük, próbálja újra később.', icon: '✕', color: E },
            bg: { h: 'Възникна грешка', m: 'Моля, опитайте отново по-късно.', icon: '✕', color: E },
            hr: { h: 'Došlo je do pogreške', m: 'Pokušajte ponovno kasnije.', icon: '✕', color: E },
            sr: { h: 'Дошло је до грешке', m: 'Покушајте поново касније.', icon: '✕', color: E },
            el: { h: 'Παρουσιάστηκε σφάλμα', m: 'Δοκιμάστε ξανά αργότερα.', icon: '✕', color: E },
            tr: { h: 'Bir hata oluştu', m: 'Lütfen daha sonra tekrar deneyin.', icon: '✕', color: E },
            fi: { h: 'Tapahtui virhe', m: 'Yritä myöhemmin uudelleen.', icon: '✕', color: E },
            sv: { h: 'Ett fel uppstod', m: 'Försök igen senare.', icon: '✕', color: E },
            no: { h: 'Det oppstod en feil', m: 'Prøv igjen senere.', icon: '✕', color: E },
            da: { h: 'Der opstod en fejl', m: 'Prøv igen senere.', icon: '✕', color: E },
            lt: { h: 'Įvyko klaida', m: 'Bandykite vėliau.', icon: '✕', color: E },
            lv: { h: 'Radās kļūda', m: 'Lūdzu, mēģiniet vēlāk.', icon: '✕', color: E },
            et: { h: 'Tekkis viga', m: 'Palun proovige hiljem uuesti.', icon: '✕', color: E },
            ja: { h: 'エラーが発生しました', m: '後でもう一度お試しください。', icon: '✕', color: E },
            ko: { h: '오류가 발생했습니다', m: '나중에 다시 시도하세요.', icon: '✕', color: E },
            'zh-CN': { h: '发生错误', m: '请稍后重试。', icon: '✕', color: E },
            'zh-TW': { h: '發生錯誤', m: '請稍後重試。', icon: '✕', color: E },
            'ar-SA': { h: 'حدث خطأ', m: 'يرجى المحاولة مرة أخرى لاحقًا.', icon: '✕', color: E }
        }
    };

    const resultMsgs = msgs[gdprResult];
    if (!resultMsgs) return;
    const t = resultMsgs[lang] || resultMsgs['en'];

    const overlay = document.createElement('div');
    overlay.id = 'gdpr-result-overlay';
    overlay.innerHTML = `
        <div style="position:fixed;inset:0;background:rgba(0,0,0,0.85);z-index:99999;display:flex;align-items:center;justify-content:center;padding:20px;">
            <div style="max-width:480px;width:100%;text-align:center;background:rgba(30,30,40,0.95);border:1px solid rgba(255,255,255,0.1);border-radius:16px;padding:40px 30px;backdrop-filter:blur(10px);">
                <div style="font-size:28px;font-weight:900;background:linear-gradient(135deg,#ff00ff,#00ffff);-webkit-background-clip:text;-webkit-text-fill-color:transparent;margin-bottom:24px;">LiquiMixer</div>
                <div style="width:80px;height:80px;border-radius:50%;border:3px solid ${t.color};display:flex;align-items:center;justify-content:center;margin:0 auto 24px;font-size:36px;color:${t.color};">${t.icon}</div>
                <h1 style="font-size:24px;margin-bottom:16px;color:${t.color};font-family:'Segoe UI',Tahoma,sans-serif;">${t.h}</h1>
                <p style="font-size:16px;line-height:1.6;color:#cccccc;margin-bottom:30px;font-family:'Segoe UI',Tahoma,sans-serif;">${t.m}</p>
                <button onclick="document.getElementById('gdpr-result-overlay').remove();history.replaceState(null,'',window.location.pathname);" style="background:linear-gradient(135deg,#ff00ff,#aa00ff);color:white;padding:12px 28px;border:none;border-radius:8px;font-weight:600;font-size:16px;cursor:pointer;">OK</button>
                <p style="margin-top:20px;font-size:12px;color:#666666;">© 2026 LiquiMixer — WOOs, s. r. o.</p>
            </div>
        </div>`;
    document.body.appendChild(overlay);
    history.replaceState(null, '', window.location.pathname);
}

// DOM Elements
let vgPgRatioSlider, targetNicotineSlider, flavorStrengthSlider;
let nicotineTypeSelect, flavorTypeSelect;

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    // GDPR result page — redirect from Supabase edge function
    handleGdprResult();

    initializeSliders();
    updateAllDisplays();
    initSearchStarsHover();
    initRecipeSearchStarsHover();
    
    // Inicializovat navigační historii pro tlačítka Zpět
    initHistoryNavigation();
    
    // Event listener pro kontaktní formulář (bezpečnější než inline onclick)
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', handleContact);
    }
    
    // Zpracovat návrat z platební brány
    handlePaymentReturn();
    
    // Listener pro zprávy od Service Workeru (upozornění na novou verzi)
    setupServiceWorkerListener();
    
    // Inicializovat flavor autocomplete pro formuláře receptů
    initRecipeFlavorAutocomplete();
    
});

// Nastavit listener pro zprávy od Service Workeru
function setupServiceWorkerListener() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.addEventListener('message', (event) => {
            if (event.data && event.data.type === 'SW_UPDATED') {
                console.log('LiquiMixer: New version available:', event.data.version);
                showUpdateNotification();
            }
            if (event.data && event.data.type === 'NOTIFICATION_CLICKED') {
                console.log('LiquiMixer: Opened from push notification');
                checkMaturedReminders();
            }
        });
        
        // PWA standalone: když se app vrátí z pozadí, znovu zkontrolovat vyzrálé liquidy
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible' && isFullyInitialized) {
                console.log('LiquiMixer: App returned to foreground, checking matured reminders');
                checkMaturedReminders();
            }
        });
        
        // Po SW update — re-registrovat FCM token (záloha pro fcm.js SW_UPDATED listener)
        // controllerchange fire vždy když nový SW převezme kontrolu
        // saveFcmToken() automaticky smaže staré tokeny → žádné duplicitní notifikace
        navigator.serviceWorker.addEventListener('controllerchange', () => {
            console.log('LiquiMixer: SW controller changed, scheduling FCM token refresh');
            setTimeout(async () => {
                if (window.fcm && window.fcm.getToken && Notification.permission === 'granted' && window.Clerk?.user) {
                    try {
                        await window.fcm.getToken();
                        console.log('LiquiMixer: FCM token re-registered after SW update');
                    } catch (e) {
                        console.warn('LiquiMixer: FCM token refresh failed:', e);
                    }
                }
            }, 3000);
        });
        
        // Kontrola, zda je k dispozici nová verze Service Workeru
        navigator.serviceWorker.ready.then((registration) => {
            registration.addEventListener('updatefound', () => {
                const newWorker = registration.installing;
                if (newWorker) {
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            // Nový SW je nainstalovaný, ale starý ještě běží
                            showUpdateNotification();
                        }
                    });
                }
            });
        });
    }
}

// Zobrazit notifikaci o nové verzi aplikace
// Debounce flag - zabránit opakovanému zobrazení
let updateNotificationShown = false;

function showUpdateNotification() {
    // Zkontrolovat, zda už notifikace není zobrazena nebo byla zobrazena v této session
    if (document.getElementById('updateNotification')) return;
    if (updateNotificationShown) {
        console.log('LiquiMixer SW: Update prompt suppressed (debounce)');
        return;
    }
    
    // Zkontrolovat sessionStorage - zabránit opakování po refresh
    const lastUpdatePrompt = sessionStorage.getItem('lastUpdatePrompt');
    const now = Date.now();
    if (lastUpdatePrompt && (now - parseInt(lastUpdatePrompt)) < 60000) {
        // Poslední prompt byl před méně než 60 sekund - ignorovat
        console.log('LiquiMixer SW: Update prompt suppressed (recent)');
        return;
    }
    
    updateNotificationShown = true;
    sessionStorage.setItem('lastUpdatePrompt', now.toString());
    
    const notification = document.createElement('div');
    notification.id = 'updateNotification';
    notification.className = 'update-notification';
    notification.innerHTML = `
        <div class="update-notification-content">
            <span class="update-notification-icon">🔄</span>
            <div class="update-notification-text">
                <strong>${t('update.new_version_title', 'New version available')}</strong>
                <p>${t('update.new_version_text', 'A new version of LiquiMixer is available. Click to update.')}</p>
            </div>
        </div>
        <div class="update-notification-actions">
            <button class="update-btn-refresh" onclick="refreshApp()">${t('update.refresh', 'Aktualizovat')}</button>
            <button class="update-btn-dismiss" onclick="dismissUpdateNotification()">${t('update.dismiss', 'Later')}</button>
        </div>
    `;
    document.body.appendChild(notification);
    
    // Animace vstupu
    setTimeout(() => {
        notification.classList.add('visible');
    }, 100);
}

// Zavřít notifikaci o aktualizaci
function dismissUpdateNotification() {
    const notification = document.getElementById('updateNotification');
    if (notification) {
        notification.classList.remove('visible');
        setTimeout(() => notification.remove(), 300);
    }
}

// Obnovit aplikaci (hard refresh)
function refreshApp() {
    // Nastavit flag že update byl proveden - zabránit opakování
    sessionStorage.setItem('updateCompleted', Date.now().toString());
    
    // Vymazat cache a znovu načíst stránku
    if ('caches' in window) {
        caches.keys().then((names) => {
            names.forEach(name => caches.delete(name));
        }).then(() => {
            window.location.reload(true);
        });
    } else {
        window.location.reload(true);
    }
}

// Export funkcí
window.refreshApp = refreshApp;
window.dismissUpdateNotification = dismissUpdateNotification;

// Zpracování návratu z platební brány GP WebPay
function handlePaymentReturn() {
    const urlParams = new URLSearchParams(window.location.search);
    const paymentStatus = urlParams.get('payment');
    
    if (paymentStatus === 'success') {
        // Úspěšná platba - zobrazit notifikaci a vyčistit URL
        console.log('Payment successful, refreshing subscription status...');
        
        // Vyčistit URL parametry
        window.history.replaceState({}, document.title, window.location.pathname);
        
        // Počkat na Clerk, načíst uživatelský jazyk, pak zobrazit notifikaci
        let clerkCheckAttempts = 0;
        const maxClerkCheckAttempts = 20; // Max 10 sekund čekání
        
        const checkClerkAndShowNotification = async () => {
            clerkCheckAttempts++;
            
            if (window.Clerk?.user) {
                console.log('User is signed in after payment');
                // Vyčistit uložené clerk_id - už ho nepotřebujeme
                localStorage.removeItem('liquimixer_pending_payment_clerk_id');
                
                // Jazyk uživatele se načte automaticky v onSignIn() volaném při načtení stránky
                
                // Zobrazit notifikaci ve správném jazyce
                const showSuccessMessage = () => {
                    const translatedMessage = window.i18n?.t?.('subscription.payment_success');
                    if (translatedMessage && translatedMessage !== 'subscription.payment_success') {
                        showNotification(translatedMessage, 'success');
                    } else {
                        setTimeout(showSuccessMessage, 300);
                    }
                };
                showSuccessMessage();
                
                // Zkontrolovat stav předplatného
                checkSubscriptionStatus();
                
            } else if (clerkCheckAttempts < maxClerkCheckAttempts) {
                setTimeout(checkClerkAndShowNotification, 500);
            } else {
                console.log('User is not signed in after payment redirect - session may have expired');
                // Vyčistit uložené clerk_id
                localStorage.removeItem('liquimixer_pending_payment_clerk_id');
                
                // Uživatel není přihlášen - platba ale proběhla úspěšně
                // Zobrazíme informativní notifikaci a login modal
                const showLoginPrompt = () => {
                    const translatedMessage = window.i18n?.t?.('subscription.payment_success_login_required');
                    if (translatedMessage && translatedMessage !== 'subscription.payment_success_login_required') {
                        showNotification(translatedMessage, 'info');
                    } else if (window.i18n) {
                        showNotification('Payment successful! Please log in to access your subscription.', 'info');
                    } else {
                        setTimeout(showLoginPrompt, 300);
                        return;
                    }
                    // Zobrazit login modal
                    if (typeof showLoginModal === 'function') {
                        setTimeout(() => showLoginModal('signIn'), 500);
                    }
                };
                showLoginPrompt();
            }
        };
        checkClerkAndShowNotification();
        
    } else if (paymentStatus === 'failed') {
        // Neúspěšná platba
        const prcode = urlParams.get('prcode');
        const srcode = urlParams.get('srcode');
        
        console.error('Payment failed:', { prcode, srcode });
        
        // Vyčistit URL parametry
        window.history.replaceState({}, document.title, window.location.pathname);
        
        // Zobrazit chybovou notifikaci po načtení překladů
        const showFailMessage = () => {
            const translatedMessage = window.i18n?.t?.('subscription.payment_failed');
            if (translatedMessage && translatedMessage !== 'subscription.payment_failed') {
                showNotification(translatedMessage, 'error');
                // Zobrazit subscription modal pro opakování platby
                if (window.Clerk?.user) {
                    showSubscriptionModal();
                }
            } else {
                setTimeout(showFailMessage, 300);
            }
        };
        setTimeout(showFailMessage, 1000);
    }
}

// Aktualizovat dynamické texty při změně jazyka
window.addEventListener('localeChanged', () => {
    // Aktualizovat hero savings s dynamickými cenami (musí být po applyTranslations)
    updateHeroSavings();
    
    // Aktualizovat popisy u posuvníků (VG/PG, nikotin, příchuť)
    updateAllDisplays();
    
    // Aktualizovat varování o omezení VG/PG
    updateVgPgRatioLimits();
    
    // Aktualizovat Shake & Vape pokud je inicializován
    if (document.getElementById('svVgPgRatio')) {
        updateSvVgPgLimits();
        updateSvRatioDisplay();
        updateSvNicotineDisplay();
    }
    
    // Aktualizovat Liquid PRO pokud je inicializován
    if (document.getElementById('proVgPgRatio')) {
        updateProVgPgLimits();
        updateProRatioDisplay();
        updateProNicotineDisplay();
    }
    
    // Aktualizovat Dilute pokud je inicializován
    if (document.getElementById('diluteTargetRatio')) {
        updateDiluteRatioLimits();
        updateDiluteSourceRatioDisplay();
        updateDiluteTargetRatioDisplay();
    }
    
    // Aktualizovat Shisha formulář pokud je inicializován (3-mode)
    if (document.getElementById('shMode')) {
        // Mode 2: DIY
        if (document.getElementById('shDiyVgValue')) {
            updateDiyBaseDisplay(null);
            autoRecalculateShishaDiyVgPgRatio();
            updateShishaDiyNicotineDisplay();
            for (let i = 1; i <= 4; i++) {
                if (document.getElementById(`shDiyFlavorType${i}`)) {
                    updateShishaDiyFlavorStrength(i);
                    updateShishaDiyFlavorRatioDisplay(i);
                }
            }
            if (typeof updateDiyPurePgDisplay === 'function') updateDiyPurePgDisplay();
        }
        // Mode 3: Molasses
        if (document.getElementById('shMolVgValue')) {
            updateMolBaseDisplay(null);
            autoRecalculateShishaMolVgPgRatio();
            updateShishaMolNicotineDisplay();
            for (let i = 1; i <= 4; i++) {
                if (document.getElementById(`shMolFlavorType${i}`)) {
                    updateShishaMolFlavorStrength(i);
                    updateShishaMolFlavorRatioDisplay(i);
                }
            }
            if (typeof updateMolPurePgDisplay === 'function') updateMolPurePgDisplay();
        }
        // Shisha Tweak
        if (document.getElementById('shTweakTargetNicotine')) {
            updateShishaTweakNicotineDisplay();
            if (typeof getShishaTweakFlavorIndices === 'function') {
                getShishaTweakFlavorIndices().forEach(fi => {
                    updateShishaTweakFlavorStrength(fi);
                    updateShishaTweakFlavorRatioDisplay(fi);
                });
            }
        }
    }
    
    // Přegenerovat všechny dynamické warning texty (.percent-fallback-warning)
    document.querySelectorAll('.percent-fallback-warning').forEach(el => {
        if (!el.classList.contains('hidden')) {
            el.innerHTML = `<span class="warning-icon">⚠</span> ${t('flavor_form.percent_not_set', 'Doporučené % není nastaveno, chybí ověřená data. Nastavte dle doporučení výrobce.')}`;
        }
    });
    
    // Přegenerovat flavor slider descriptions (Ideální rozsah, Pod/Nad doporučeným rozsahem)
    document.querySelectorAll('.flavor-slider').forEach(slider => {
        if (slider.dataset.flavorMin !== undefined) {
            const hasExact = slider.dataset.hasExactPercent === 'true';
            const descId = slider.id.replace('Strength', 'StrengthDisplay');
            const descEl = document.getElementById(descId);
            if (descEl) {
                updateFlavorSliderDescription(
                    slider.value,
                    parseFloat(slider.dataset.flavorMin),
                    parseFloat(slider.dataset.flavorMax),
                    descEl,
                    hasExact
                );
            }
        }
    });
    
    // Aktualizovat Liquid formulář flavor description
    if (typeof updateFlavorDisplay === 'function' && document.getElementById('flavorStrength')) {
        updateFlavorDisplay();
    }
    
    // Aktualizovat Liquid PRO flavor descriptions
    for (let i = 1; i <= 4; i++) {
        if (document.getElementById(`proFlavorStrength${i}`)) {
            updateProFlavorDisplay(i);
        }
    }
    
    // Překreslit výsledky výpočtu pokud existují
    refreshResultsTable();
    
    // Překreslit detail receptu pokud je zobrazen
    refreshRecipeDetail();
    
    // Překreslit detail produktu pokud je zobrazen (pro sekci "Použito v receptech")
    refreshProductDetail();
    
    // Překreslit veřejný recept z databáze pokud je zobrazen
    refreshPublicRecipeDetail();
    
    // Aktualizovat stav předplatného v profilu (pokud je zobrazen)
    if (subscriptionData) {
        updateSubscriptionStatusUI(subscriptionData);
    }
    
    // Překreslit databázi příchutí pokud je zobrazena
    const flavorDbPage = document.getElementById('flavor-database');
    if (flavorDbPage && flavorDbPage.classList.contains('active')) {
        // Znovu inicializovat filtry s aktuálními překlady
        initFlavorDatabaseFilters();
        // Znovu načíst příchutě s aktuálními překlady
        loadFlavors();
    }
    
    // Překreslit detail příchutě pokud je zobrazen
    const flavorDetailPage = document.getElementById('flavor-detail');
    if (flavorDetailPage && flavorDetailPage.classList.contains('active') && currentFlavorDetail) {
        showFlavorDetail(currentFlavorDetail.id);
    }
    
    // Překreslit databázi receptů pokud je zobrazena
    const recipeDbPage = document.getElementById('recipe-database');
    if (recipeDbPage && recipeDbPage.classList.contains('active')) {
        // Znovu načíst recepty s aktuálními překlady
        loadPublicRecipes();
    }
});

function initializeSliders() {
    vgPgRatioSlider = document.getElementById('vgPgRatio');
    targetNicotineSlider = document.getElementById('targetNicotine');
    flavorStrengthSlider = document.getElementById('flavorStrength');
    nicotineTypeSelect = document.getElementById('nicotineType');
    flavorTypeSelect = document.getElementById('flavorType');

    // Add event listeners
    vgPgRatioSlider.addEventListener('input', clampVgPgValue);
    targetNicotineSlider.addEventListener('input', updateNicotineDisplay);
    flavorStrengthSlider.addEventListener('input', updateFlavorDisplay);
    
    document.getElementById('nicotineBaseStrength').addEventListener('input', () => {
        validateNicotineStrength();
        autoRecalculateLiquidVgPgRatio();
    });
    document.getElementById('totalAmount').addEventListener('input', autoRecalculateLiquidVgPgRatio);
    
    // Setup nicotine ratio toggle buttons
    setupNicotineRatioToggle();
    
    // Setup flavor ratio toggle buttons
    setupFlavorRatioToggle();
    setupSvFlavorRatioToggle();

    // Initialize Shake & Vape form listeners
    initShakeVapeListeners();
    
    // Initialize Liquid PRO form listeners
    initLiquidProListeners();
}

function initShakeVapeListeners() {
    const svTotalAmount = document.getElementById('svTotalAmount');
    const svFlavorVolume = document.getElementById('svFlavorVolume');
    const svTargetNicotine = document.getElementById('svTargetNicotine');
    const svNicotineBaseStrength = document.getElementById('svNicotineBaseStrength');
    const svVgPgRatio = document.getElementById('svVgPgRatio');
    
    if (svTotalAmount) {
        svTotalAmount.addEventListener('input', updateSvVgPgLimits);
    }
    if (svFlavorVolume) {
        svFlavorVolume.addEventListener('input', updateSvVgPgLimits);
    }
    if (svTargetNicotine) {
        svTargetNicotine.addEventListener('input', updateSvNicotineDisplay);
    }
    if (svNicotineBaseStrength) {
        svNicotineBaseStrength.addEventListener('input', updateSvVgPgLimits);
    }
    // Přidat listener pro ruční změnu VG/PG slideru
    if (svVgPgRatio) {
        svVgPgRatio.addEventListener('input', () => {
            shakevapeUserManuallyChangedRatio = true;
            updateSvRatioDisplay();
        });
    }
}

function initLiquidProListeners() {
    const proTotalAmount = document.getElementById('proTotalAmount');
    const proTargetNicotine = document.getElementById('proTargetNicotine');
    const proFlavorStrength = document.getElementById('proFlavorStrength');
    const proNicotineBaseStrength = document.getElementById('proNicotineBaseStrength');
    const proVgPgRatio = document.getElementById('proVgPgRatio');
    
    if (proTotalAmount) {
        proTotalAmount.addEventListener('input', updateProVgPgLimits);
    }
    if (proTargetNicotine) {
        proTargetNicotine.addEventListener('input', updateProNicotineDisplay);
    }
    if (proFlavorStrength) {
        proFlavorStrength.addEventListener('input', updateProFlavorDisplay);
    }
    if (proNicotineBaseStrength) {
        proNicotineBaseStrength.addEventListener('input', updateProVgPgLimits);
    }
    // Přidat listener pro ruční změnu VG/PG slideru
    if (proVgPgRatio) {
        proVgPgRatio.addEventListener('input', () => {
            proUserManuallyChangedRatio = true;
            updateProRatioDisplay();
        });
    }
}

function setupNicotineRatioToggle() {
    const ratio5050Btn = document.getElementById('ratio5050');
    const ratio7030Btn = document.getElementById('ratio7030');
    const nicotineRatioInput = document.getElementById('nicotineRatio');

    if (ratio5050Btn && ratio7030Btn && nicotineRatioInput) {
        ratio5050Btn.addEventListener('click', () => {
            ratio5050Btn.classList.add('active');
            ratio7030Btn.classList.remove('active');
            nicotineRatioInput.value = '50/50';
            autoRecalculateLiquidVgPgRatio();
        });

        ratio7030Btn.addEventListener('click', () => {
            ratio7030Btn.classList.add('active');
            ratio5050Btn.classList.remove('active');
            nicotineRatioInput.value = '70/30';
            autoRecalculateLiquidVgPgRatio();
        });
    }
}

function setupFlavorRatioToggle() {
    const ratio0100Btn = document.getElementById('flavorRatio0100');
    const ratio8020Btn = document.getElementById('flavorRatio8020');
    const ratio7030Btn = document.getElementById('flavorRatio7030');
    const flavorRatioInput = document.getElementById('flavorRatio');

    if (ratio0100Btn && ratio8020Btn && ratio7030Btn && flavorRatioInput) {
        ratio0100Btn.addEventListener('click', () => {
            ratio0100Btn.classList.add('active');
            ratio8020Btn.classList.remove('active');
            ratio7030Btn.classList.remove('active');
            flavorRatioInput.value = '0/100';
            autoRecalculateLiquidVgPgRatio();
        });

        ratio8020Btn.addEventListener('click', () => {
            ratio0100Btn.classList.remove('active');
            ratio8020Btn.classList.add('active');
            ratio7030Btn.classList.remove('active');
            flavorRatioInput.value = '80/20';
            autoRecalculateLiquidVgPgRatio();
        });

        ratio7030Btn.addEventListener('click', () => {
            ratio0100Btn.classList.remove('active');
            ratio8020Btn.classList.remove('active');
            ratio7030Btn.classList.add('active');
            flavorRatioInput.value = '70/30';
            autoRecalculateLiquidVgPgRatio();
        });
    }
}

function setupSvFlavorRatioToggle() {
    const ratio0100Btn = document.getElementById('svFlavorRatio0100');
    const ratio8020Btn = document.getElementById('svFlavorRatio8020');
    const ratio7030Btn = document.getElementById('svFlavorRatio7030');
    const flavorRatioInput = document.getElementById('svFlavorRatio');

    if (ratio0100Btn && ratio8020Btn && ratio7030Btn && flavorRatioInput) {
        ratio0100Btn.addEventListener('click', () => {
            ratio0100Btn.classList.add('active');
            ratio8020Btn.classList.remove('active');
            ratio7030Btn.classList.remove('active');
            flavorRatioInput.value = '0/100';
            autoRecalculateSvVgPgRatio();
        });

        ratio8020Btn.addEventListener('click', () => {
            ratio0100Btn.classList.remove('active');
            ratio8020Btn.classList.add('active');
            ratio7030Btn.classList.remove('active');
            flavorRatioInput.value = '80/20';
            autoRecalculateSvVgPgRatio();
        });

        ratio7030Btn.addEventListener('click', () => {
            ratio0100Btn.classList.remove('active');
            ratio8020Btn.classList.remove('active');
            ratio7030Btn.classList.add('active');
            flavorRatioInput.value = '70/30';
            autoRecalculateSvVgPgRatio();
        });
    }
}

// ============================================
// PREMIXED BASE FUNCTIONS
// ============================================

// Update base type (separate or premixed)
function updateBaseType(type) {
    const baseTypeInput = document.getElementById('baseType');
    const premixedContainer = document.getElementById('premixedRatioContainer');
    const separateBtn = document.getElementById('baseSeparate');
    const premixedBtn = document.getElementById('basePremixed');
    
    if (baseTypeInput) baseTypeInput.value = type;
    
    // Při prefill uloženého receptu nepřepisovat slider ani neresetovat flag
    if (!_prefillingSavedRecipe) {
        liquidUserManuallyChangedRatio = false;
    }
    
    if (type === 'premixed') {
        separateBtn.classList.remove('active');
        premixedBtn.classList.add('active');
        if (premixedContainer) premixedContainer.classList.remove('hidden');
        
        // Automaticky nastavit VG/PG slider na skutečný výsledný poměr
        if (!_prefillingSavedRecipe) {
            const actualVg = calculateActualVgPgRatio('liquid');
            const slider = document.getElementById('vgPgRatio');
            if (slider) {
                slider.value = actualVg;
                updateRatioDisplay();
            }
        }
    } else {
        separateBtn.classList.add('active');
        premixedBtn.classList.remove('active');
        if (premixedContainer) premixedContainer.classList.add('hidden');
    }
    
    if (!_prefillingSavedRecipe) {
        updateVgPgRatioLimits();
    }
}

// Update premixed ratio
function updatePremixedRatio(ratio) {
    const premixedRatioInput = document.getElementById('premixedRatio');
    if (premixedRatioInput) premixedRatioInput.value = ratio;
    
    // Update button states
    const buttons = document.querySelectorAll('.premixed-ratio-btn');
    buttons.forEach(btn => {
        if (btn.dataset.value === ratio) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    
    // Automaticky nastavit VG/PG slider na skutečný výsledný poměr
    // POUZE pokud uživatel ručně neměnil poměr a neprobíhá prefill
    if (!liquidUserManuallyChangedRatio && !_prefillingSavedRecipe) {
        const actualVg = calculateActualVgPgRatio('liquid');
        const slider = document.getElementById('vgPgRatio');
        if (slider) {
            slider.value = actualVg;
            updateRatioDisplay();
        }
    }
    
    if (!_prefillingSavedRecipe) {
        updateVgPgRatioLimits();
    }
}

// Get premixed base VG percent
function getPremixedVgPercent() {
    const premixedRatio = document.getElementById('premixedRatio')?.value || '60/40';
    const parts = premixedRatio.split('/');
    return parseInt(parts[0]) || 60;
}

// Automaticky přepočítat VG/PG slider při změně jakéhokoliv parametru (pouze v premixed mode) - LIQUID form
function autoRecalculateLiquidVgPgRatio() {
    if (_prefillingSavedRecipe) return;
    const baseType = document.getElementById('baseType')?.value || 'separate';
    // Přepočítat POUZE pokud uživatel ručně neměnil poměr
    if (baseType === 'premixed' && !liquidUserManuallyChangedRatio) {
        const actualVg = calculateActualVgPgRatio('liquid');
        const slider = document.getElementById('vgPgRatio');
        if (slider) {
            slider.value = actualVg;
            updateRatioDisplay();
        }
    }
    updateVgPgRatioLimits();
}

// ============================================
// LIQUID PRO PREMIXED BASE FUNCTIONS
// ============================================

// Calculate actual VG/PG ratio from all components (for premixed mode)
function calculateActualVgPgRatio(formType) {
    let totalAmount, nicotineType, targetNicotine, baseNicotine, nicVgPercent;
    let flavorVolume = 0, flavorVgPercent = 0;
    let premixedVgPercent = 50;
    
    // Extra volume pro složky, které se nezapočítávají do VG/PG (voda, sladidlo, aditiva)
    let extraNonVgPgVolume = 0;
    
    // Přímý VG objem z příchutí (pro PRO formulář s detailní kompozicí)
    let directFlavorVgVolume = null;
    
    if (formType === 'shisha') {
        // Shisha form
        totalAmount = parseFloat(document.getElementById('shTotalAmount')?.value) || 200;
        // Podporuje nový select i starý toggle pro zpětnou kompatibilitu
        const nicTypeSelect = document.getElementById('shNicotineType');
        const nicToggle = document.getElementById('shNicotineToggle');
        nicotineType = (nicTypeSelect && nicTypeSelect.value !== 'none') ? nicTypeSelect.value 
            : (nicToggle && nicToggle.checked) ? 'freebase' : 'none';
        targetNicotine = parseFloat(document.getElementById('shTargetNicotine')?.value) || 0;
        baseNicotine = parseFloat(document.getElementById('shNicotineBaseStrength')?.value) || 20;
        // Parsovat VG/PG poměr z hidden inputu (formát "50/50")
        const nicRatioInput = document.getElementById('shNicotineRatio');
        const nicRatioValue = nicRatioInput?.value || '50/50';
        nicVgPercent = parseInt(nicRatioValue.split('/')[0]) || 50;
        
        // Get flavors data
        const flavorsData = typeof getShishaFlavorsData === 'function' ? getShishaFlavorsData() : [];
        if (flavorsData.length > 0) {
            const totalFlavorVg = flavorsData.reduce((sum, f) => sum + (f.vgRatio * f.percent), 0);
            const totalFlavorPercent = flavorsData.reduce((sum, f) => sum + f.percent, 0);
            flavorVgPercent = totalFlavorPercent > 0 ? totalFlavorVg / totalFlavorPercent : 0;
            flavorVolume = (totalFlavorPercent / 100) * totalAmount;
        }
        
        // OPRAVA: Přidat sladidlo a vodu do výpočtu zbývajícího objemu
        // Sweetener - nezapočítává se do VG/PG
        const sweetenerSelect = document.getElementById('shSweetenerSelect');
        if (sweetenerSelect && sweetenerSelect.value !== 'none') {
            const sweetenerPercent = parseFloat(document.getElementById('shSweetenerStrength')?.value) || 0;
            extraNonVgPgVolume += (sweetenerPercent / 100) * totalAmount;
        }
        
        // Water - nezapočítává se do VG/PG
        const waterPercent = parseFloat(document.getElementById('shWaterPercent')?.value) || 0;
        if (waterPercent > 0) {
            extraNonVgPgVolume += (waterPercent / 100) * totalAmount;
        }
        
        // Get premixed ratio
        const premixedRatio = document.getElementById('shPremixedRatio')?.value || '80/20';
        if (premixedRatio === 'custom') {
            premixedVgPercent = parseInt(document.getElementById('shCustomPremixedVg')?.value) || 80;
        } else {
            premixedVgPercent = parseInt(premixedRatio.split('/')[0]) || 80;
        }
    } else if (formType === 'pro') {
        totalAmount = parseFloat(document.getElementById('proTotalAmount')?.value) || 100;
        nicotineType = document.getElementById('proNicotineType')?.value || 'none';
        targetNicotine = parseFloat(document.getElementById('proTargetNicotine')?.value) || 0;
        baseNicotine = parseFloat(document.getElementById('proNicotineBaseStrength')?.value) || 0;
        nicVgPercent = parseInt(document.getElementById('proNicotineRatioSlider')?.value) || 50;
        
        // Get flavors data - použít detailní kompozici pro přesný výpočet
        const flavorsData = typeof getProFlavorsData === 'function' ? getProFlavorsData() : [];
        let totalFlavorVgVolume = 0;
        let totalFlavorPgVolume = 0;
        let totalFlavorOtherVolume = 0; // alkohol, voda, ostatní - nezapočítávají se do VG/PG
        
        flavorsData.forEach(flavor => {
            const vol = (flavor.percent / 100) * totalAmount;
            flavorVolume += vol;
            
            // Použít detailní kompozici pro přesný výpočet VG/PG
            const comp = flavor.customComposition || { vg: flavor.vgRatio, pg: 100 - flavor.vgRatio, alcohol: 0, water: 0, other: 0 };
            totalFlavorVgVolume += vol * (comp.vg / 100);
            totalFlavorPgVolume += vol * (comp.pg / 100);
            // Alkohol, voda, ostatní - jdou do objemu ale ne do VG/PG poměru
            totalFlavorOtherVolume += vol * ((comp.alcohol + comp.water + comp.other) / 100);
        });
        
        // Nastavit přímý VG objem z příchutí pro použití ve finálním výpočtu
        directFlavorVgVolume = totalFlavorVgVolume;
        
        // Vypočítat vážený průměr VG% pro zpětnou kompatibilitu
        if (flavorsData.length > 0 && flavorVolume > 0) {
            // Skutečný VG% z příchutí (pouze VG část, ne celý objem)
            flavorVgPercent = (totalFlavorVgVolume / flavorVolume) * 100;
        }
        
        // OPRAVA: Přidat aditiva do výpočtu zbývajícího objemu
        const additivesData = typeof getProAdditivesData === 'function' ? getProAdditivesData() : [];
        if (additivesData.length > 0) {
            const totalAdditivePercent = additivesData.reduce((sum, a) => sum + a.percent, 0);
            extraNonVgPgVolume += (totalAdditivePercent / 100) * totalAmount;
        }
        
        const premixedRatio = document.getElementById('proPremixedRatio')?.value || '50/50';
        premixedVgPercent = parseInt(premixedRatio.split('/')[0]) || 50;
    } else if (formType === 'shakevape') {
        // Shake & Vape form
        totalAmount = parseFloat(document.getElementById('svTotalAmount')?.value) || 60;
        nicotineType = document.getElementById('svNicotineType')?.value || 'none';
        targetNicotine = parseFloat(document.getElementById('svTargetNicotine')?.value) || 0;
        baseNicotine = parseFloat(document.getElementById('svNicotineBaseStrength')?.value) || 0;
        const nicRatio = document.getElementById('svNicotineRatio')?.value || '50/50';
        nicVgPercent = nicRatio === '70/30' ? 70 : 50;
        
        // Flavor in S&V is by volume, not percent
        flavorVolume = parseFloat(document.getElementById('svFlavorVolume')?.value) || 0;
        const svFlavorRatio = document.getElementById('svFlavorRatio')?.value || '0/100';
        // Dynamické parsování VG ratio z formátu "VG/PG"
        flavorVgPercent = parseInt(svFlavorRatio.split('/')[0]) || 0;
        
        const premixedRatio = document.getElementById('svPremixedRatio')?.value || '50/50';
        premixedVgPercent = parseInt(premixedRatio.split('/')[0]) || 50;
    } else {
        // Standard Liquid form
        totalAmount = parseFloat(document.getElementById('totalAmount')?.value) || 100;
        nicotineType = document.getElementById('nicotineType')?.value || 'none';
        targetNicotine = parseFloat(document.getElementById('targetNicotine')?.value) || 0;
        baseNicotine = parseFloat(document.getElementById('nicotineBaseStrength')?.value) || 0;
        const nicRatio = document.getElementById('nicotineRatio')?.value || '50/50';
        nicVgPercent = nicRatio === '70/30' ? 70 : 50;
        
        // Kontrola konkrétní příchutě z autocomplete
        const flavorAutocomplete = document.getElementById('flavorAutocomplete');
        const hasSpecificFlavor = (flavorAutocomplete?.dataset.flavorId || flavorAutocomplete?.dataset.favoriteProductId || flavorAutocomplete?.dataset.flavorData) && flavorAutocomplete?.dataset.flavorSource !== 'generic';
        const flavorType = document.getElementById('flavorType')?.value || 'none';
        // Příchuť je aktivní pokud je vybraná konkrétní NEBO je zvolena kategorie
        const hasFlavor = hasSpecificFlavor || (flavorType !== 'none' && flavorType !== '');
        const flavorPercent = hasFlavor ? parseFloat(document.getElementById('flavorStrength')?.value) || 0 : 0;
        const flavorRatio = document.getElementById('flavorRatio')?.value || '0/100';
        // Dynamické parsování VG ratio z formátu "VG/PG"
        flavorVgPercent = parseInt(flavorRatio.split('/')[0]) || 0;
        flavorVolume = (flavorPercent / 100) * totalAmount;
        
        const premixedRatio = document.getElementById('premixedRatio')?.value || '50/50';
        premixedVgPercent = parseInt(premixedRatio.split('/')[0]) || 50;
    }
    
    // Calculate nicotine volume
    let nicotineVolume = 0;
    if (nicotineType !== 'none' && targetNicotine > 0 && baseNicotine > 0) {
        nicotineVolume = (targetNicotine * totalAmount) / baseNicotine;
    }
    
    // Remaining volume for carrier (premixed base) - OPRAVA: zahrnout extraNonVgPgVolume
    const remainingVolume = totalAmount - nicotineVolume - flavorVolume - extraNonVgPgVolume;
    
    // Calculate VG from each component
    const vgFromNicotine = nicotineVolume * (nicVgPercent / 100);
    // Použít přímý VG objem pokud je k dispozici (PRO formulář s detailní kompozicí)
    // jinak vypočítat ze zjednodušeného flavorVgPercent
    const vgFromFlavor = directFlavorVgVolume !== null 
        ? directFlavorVgVolume 
        : flavorVolume * (flavorVgPercent / 100);
    const vgFromBase = Math.max(0, remainingVolume) * (premixedVgPercent / 100);
    
    // Total VG
    const totalVg = vgFromNicotine + vgFromFlavor + vgFromBase;
    
    // OPRAVA: Dělit VG+PG objemem, ne celkovým objemem
    // extraNonVgPgVolume obsahuje složky které nejsou VG ani PG (sladidlo, voda, aditiva s alkoholem)
    const vgPgVolume = totalAmount - extraNonVgPgVolume;
    const actualVgPercent = vgPgVolume > 0 
        ? Math.round((totalVg / vgPgVolume) * 100)
        : Math.round((totalVg / totalAmount) * 100);
    const clampedVg = Math.max(0, Math.min(100, actualVgPercent));
    
    // For shisha, return object with actualVg
    if (formType === 'shisha') {
        return { actualVg: clampedVg };
    }
    
    return clampedVg;
}

// Update PRO base type (separate or premixed)
function updateProBaseType(type) {
    const baseTypeInput = document.getElementById('proBaseType');
    const premixedContainer = document.getElementById('proPremixedRatioContainer');
    const separateBtn = document.getElementById('proBaseSeparate');
    const premixedBtn = document.getElementById('proBasePremixed');
    
    if (baseTypeInput) baseTypeInput.value = type;
    
    if (!_prefillingSavedRecipe) {
        proUserManuallyChangedRatio = false;
    }
    
    if (type === 'premixed') {
        separateBtn.classList.remove('active');
        premixedBtn.classList.add('active');
        if (premixedContainer) premixedContainer.classList.remove('hidden');
        
        if (!_prefillingSavedRecipe) {
            const actualVg = calculateActualVgPgRatio('pro');
            const slider = document.getElementById('proVgPgRatio');
            if (slider) {
                slider.value = actualVg;
                updateProRatioDisplay();
            }
        }
    } else {
        separateBtn.classList.add('active');
        premixedBtn.classList.remove('active');
        if (premixedContainer) premixedContainer.classList.add('hidden');
    }
    
    if (!_prefillingSavedRecipe) {
        updateProVgPgLimits();
    }
}

// Update PRO premixed ratio
function updateProPremixedRatio(ratio) {
    const premixedRatioInput = document.getElementById('proPremixedRatio');
    const customContainer = document.getElementById('proCustomPremixedContainer');
    
    // Update button states
    const buttons = document.querySelectorAll('.pro-premixed-ratio-btn');
    buttons.forEach(btn => {
        if (btn.dataset.value === ratio) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    
    // DŮLEŽITÉ: Nejprve nastavit hodnotu, pak počítat ratio
    if (ratio === 'custom') {
        if (customContainer) customContainer.classList.remove('hidden');
        // Get custom values
        const customVg = parseInt(document.getElementById('proCustomPremixedVg')?.value) || 65;
        if (premixedRatioInput) premixedRatioInput.value = `${customVg}/${100 - customVg}`;
    } else {
        if (customContainer) customContainer.classList.add('hidden');
        if (premixedRatioInput) premixedRatioInput.value = ratio;
    }
    
    // Automaticky nastavit VG/PG slider na skutečný výsledný poměr (po nastavení proPremixedRatio)
    // POUZE pokud uživatel ručně neměnil poměr a neprobíhá prefill
    const _wasPrefilling = _prefillingSavedRecipe;
    setTimeout(() => {
        if (!proUserManuallyChangedRatio && !_wasPrefilling) {
            const actualVg = calculateActualVgPgRatio('pro');
            const slider = document.getElementById('proVgPgRatio');
            if (slider) {
                slider.value = actualVg;
                updateProRatioDisplay();
            }
        }
        if (!_wasPrefilling) {
            updateProVgPgLimits();
        }
    }, 0);
}

// Update PRO custom premixed PG (auto-calculate from VG)
function updateProCustomPremixedPg() {
    const vgInput = document.getElementById('proCustomPremixedVg');
    const pgInput = document.getElementById('proCustomPremixedPg');
    const premixedRatioInput = document.getElementById('proPremixedRatio');
    
    if (vgInput && pgInput) {
        let vgValue = parseInt(vgInput.value) || 0;
        if (vgValue > 100) vgValue = 100;
        if (vgValue < 0) vgValue = 0;
        vgInput.value = vgValue;
        pgInput.value = 100 - vgValue;
        
        if (premixedRatioInput) {
            premixedRatioInput.value = `${vgValue}/${100 - vgValue}`;
        }
    }
    
    updateProVgPgLimits();
}

// Get PRO premixed base VG percent
function getProPremixedVgPercent() {
    const premixedRatio = document.getElementById('proPremixedRatio')?.value || '60/40';
    const parts = premixedRatio.split('/');
    return parseInt(parts[0]) || 60;
}

// Export premixed base functions
window.updateBaseType = updateBaseType;
window.updatePremixedRatio = updatePremixedRatio;
window.getPremixedVgPercent = getPremixedVgPercent;
window.updateProBaseType = updateProBaseType;
window.updateProPremixedRatio = updateProPremixedRatio;
window.updateProCustomPremixedPg = updateProCustomPremixedPg;
window.getProPremixedVgPercent = getProPremixedVgPercent;

// Force HTTPS redirect
if (location.protocol !== 'https:' && location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') {
    location.replace('https://' + location.hostname + location.pathname + location.search);
}

// Clerk Authentication
let clerkLoaded = false;

// Initialize Clerk when loaded
window.addEventListener('load', async function() {
    try {
        // Initialize database
        if (window.LiquiMixerDB) {
            window.LiquiMixerDB.init();
        }
        
        if (window.Clerk) {
            await window.Clerk.load();
            clerkLoaded = true;
            
            // Save user to database if signed in
            if (window.Clerk.user && window.LiquiMixerDB) {
                // onSignIn() načte i jazyk uživatele z databáze
                await window.LiquiMixerDB.onSignIn(window.Clerk.user);
                
                // PRIORITA: Zkontrolovat zda se uživatel právě vrátil z registrace (subscription flow)
                // Po email verifikaci Clerk reloaduje stránku — localStorage flagy přežijí
                const fromSubscriptionOnLoad = localStorage.getItem('liquimixer_from_subscription') === 'true';
                const termsAcceptedOnLoad = localStorage.getItem('liquimixer_terms_accepted') === 'true';
                
                if (fromSubscriptionOnLoad) {
                    console.log('Initial load: User returned from subscription registration flow');
                    
                    // Uložit souhlas s OP do DB
                    if (termsAcceptedOnLoad) {
                        await window.LiquiMixerDB.saveTermsAcceptance(window.Clerk.user.id);
                    }
                    
                    // Vyčistit flagy
                    localStorage.removeItem('liquimixer_from_subscription');
                    localStorage.removeItem('liquimixer_terms_accepted');
                    localStorage.removeItem('liquimixer_terms_accepted_at');
                    
                    // Ihned zobrazit platební modál (Stav B) — žádný flash hlavní stránky
                    showSubscriptionModal(true);
                } else {
                    // Standardní flow: kontrola předplatného a UI
                    // KONTROLA PŘEDPLATNÉHO IHNED - před aktualizací UI!
                    await checkSubscriptionStatus();
                    // Teprve po kontrole předplatného aktualizovat UI
                    updateAuthUI();
                    // Zkontrolovat pending sdílený recept (až po ověření předplatného)
                    await checkPendingSharedRecipe();
                    
                    // Zkontrolovat vyzrálé liquidy a zobrazit in-app notifikaci
                    await checkMaturedReminders();
                }
            } else {
                // Nepřihlášený uživatel - aktualizovat UI
                updateAuthUI();
            }
            
            // Listen for auth changes (OAuth callback, sign in/out)
            // Oddělená logika pro: (1) odhlášení, (2) token refresh, (3) skutečné přihlášení/změna uživatele
            let lastAuthUserId = window.Clerk.user?.id || null;
            let isFullyInitialized = !!window.Clerk.user; // Pokud je user při startu, jsme inicializováni
            // Guard: pokud initial load již zpracoval fromSubscription, nastavit na true
            const initialLoadHandledSubscription = !localStorage.getItem('liquimixer_from_subscription') && document.getElementById('subscriptionModal') && !document.getElementById('subscriptionModal').classList.contains('hidden');
            let processingSubscriptionFlow = initialLoadHandledSubscription; // Guard proti dvojímu zpracování
            
            window.Clerk.addListener(async (event) => {
                console.log('Clerk auth event:', event);
                
                const currentUserId = window.Clerk.user?.id || null;
                
                // ====== 1. ODHLÁŠENÍ ======
                if (!currentUserId && lastAuthUserId) {
                    console.log('Clerk: User signed out');
                    lastAuthUserId = null;
                    isFullyInitialized = false;
                    processingSubscriptionFlow = false;
                    clearSubscriptionCache();
                    subscriptionData = null;
                    document.body.classList.remove('subscription-flow-pending');
                    updateAuthUI();
                    return;
                }
                
                // ====== 2. TOKEN REFRESH (stejný user, již inicializován) ======
                if (currentUserId && currentUserId === lastAuthUserId && isFullyInitialized) {
                    console.log('Clerk: Token refresh only, refreshing Supabase token...');
                    // Pouze obnovit JWT token pro Supabase, žádná re-inicializace
                    if (window.LiquiMixerDB?.refreshToken) {
                        await window.LiquiMixerDB.refreshToken();
                    }
                    return;
                }
                
                // ====== 2b. GUARD: subscription flow se již zpracovává ======
                if (processingSubscriptionFlow) {
                    console.log('Clerk: Subscription flow already in progress, skipping duplicate event');
                    return;
                }
                
                // ====== 3. SKUTEČNÉ PŘIHLÁŠENÍ NEBO ZMĚNA UŽIVATELE ======
                if (window.Clerk.user) {
                    console.log('Clerk: Full sign-in flow for user:', window.Clerk.user.id);
                    lastAuthUserId = currentUserId;
                    
                    // Save user to database on sign in
                    if (window.LiquiMixerDB) {
                        await window.LiquiMixerDB.onSignIn(window.Clerk.user);
                    }
                    
                    // Automaticky získat a uložit FCM token při přihlášení
                    if (window.fcm && window.fcm.getToken && Notification.permission === 'granted') {
                        try {
                            await window.fcm.getToken();
                            console.log('FCM token refreshed after sign in');
                        } catch (fcmError) {
                            console.warn('Failed to refresh FCM token:', fcmError);
                        }
                    }
                    
                    // Jazyk uživatele se načte automaticky v onSignIn() výše
                    
                    // Zkontrolovat zda uživatel přišel ze subscription modalu
                    // (registrace přes email nebo login ze subscription flow)
                    const fromSubscription = localStorage.getItem('liquimixer_from_subscription') === 'true';
                    const termsAccepted = localStorage.getItem('liquimixer_terms_accepted') === 'true';
                    
                    if (fromSubscription) {
                        // GUARD: zamezit dvojímu zpracování (Clerk fire-ne listener vícekrát při email verifikaci)
                        processingSubscriptionFlow = true;
                        
                        // Odstranit pending overlay a ihned zobrazit subscription modál
                        document.body.classList.remove('subscription-flow-pending');
                        
                        // Zavřít login modal BEZ updateAuthUI (nechceme flash hlavní obrazovky)
                        hideLoginModal();
                        
                        // Pokud souhlasil s OP při registraci, uložit do DB
                        if (termsAccepted && window.LiquiMixerDB) {
                            console.log('Saving terms acceptance to database...');
                            await window.LiquiMixerDB.saveTermsAcceptance(window.Clerk.user.id);
                        }
                        
                        // Vyčistit flagy AŽ PO uložení do DB
                        localStorage.removeItem('liquimixer_from_subscription');
                        localStorage.removeItem('liquimixer_terms_accepted');
                        localStorage.removeItem('liquimixer_terms_accepted_at');
                        
                        console.log('User came from subscription modal - showing payment step (State B)...');
                        showSubscriptionModal(true);
                        isFullyInitialized = true;
                        // processingSubscriptionFlow zůstává TRUE — zabrání opakovanému zobrazení
                        // modálu při dalších Clerk events (email verifikace fire-ne listener vícekrát)
                        // Resetuje se v hideSubscriptionModal() nebo při odhlášení
                        return; // Nepokračovat dál - uživatel musí zaplatit
                    }
                    
                    // Zavřít login modal a aktualizovat UI (pouze pokud NENÍ subscription flow)
                    hideLoginModal();
                    updateAuthUI();
                    
                    // DETEKCE NOVÉHO UŽIVATELE: Pokud byl účet vytvořen v posledních 60 sekundách
                    // Toto zachytí OAuth registrace (Continue with Google) které obcházejí subscription modal
                    const userCreatedAt = new Date(window.Clerk.user.createdAt);
                    const now = new Date();
                    const secondsSinceCreation = (now - userCreatedAt) / 1000;
                    const isNewUser = secondsSinceCreation < 60; // Účet vytvořen před méně než 60s
                    
                    console.log('User created at:', userCreatedAt, 'seconds since creation:', secondsSinceCreation, 'isNewUser:', isNewUser);
                    
                    // Pro nové uživatele (OAuth bez subscription flow) - zobrazit subscription modal (musí souhlasit s OP a zaplatit)
                    // Guard: nepřepisovat subscription modal pokud již běží (email verifikace fire-ne listener vícekrát)
                    if (isNewUser && !processingSubscriptionFlow) {
                        console.log('New user detected via OAuth - showing subscription modal for terms acceptance...');
                        processingSubscriptionFlow = true;
                        showSubscriptionModal();
                        isFullyInitialized = true;
                        return; // Nepokračovat - uživatel musí souhlasit s OP a zaplatit
                    }
                    
                    // Kontrola předplatného pro existující uživatele (pouze pokud nepřišel ze subscription flow)
                    await checkSubscriptionStatus();
                    
                    // Zkontrolovat pending sdílený recept (až po ověření předplatného)
                    await checkPendingSharedRecipe();
                    
                    // Zkontrolovat vyzrálé liquidy a zobrazit in-app notifikaci
                    await checkMaturedReminders();
                    
                    // Označit jako plně inicializován
                    isFullyInitialized = true;
                }
            });
            
            // Kontrola OAuth callback v URL
            if (window.location.hash.includes('__clerk') || 
                window.location.search.includes('__clerk')) {
                // Po OAuth přihlášení počkej a aktualizuj UI
                setTimeout(() => {
                    updateAuthUI();
                    // Vyčistit URL od Clerk parametrů
                    if (window.history.replaceState) {
                        const cleanUrl = window.location.origin + window.location.pathname;
                        window.history.replaceState({}, '', cleanUrl);
                    }
                }, 500);
            }
        }
    } catch (error) {
        console.log('Clerk not configured yet:', error.message);
    }
});

// Update UI based on auth state - with debounce to prevent multiple rapid calls
let updateAuthUITimeout = null;
let lastAuthState = null;

function updateAuthUI() {
    // Debounce - prevent multiple rapid calls
    if (updateAuthUITimeout) {
        clearTimeout(updateAuthUITimeout);
    }
    
    // Check if auth state actually changed
    const currentAuthState = window.Clerk?.user?.id || 'anonymous';
    if (currentAuthState === lastAuthState) {
        console.log('updateAuthUI: Auth state unchanged, skipping');
        return;
    }
    
    updateAuthUITimeout = setTimeout(() => {
        updateAuthUIActual();
    }, 100);
}

function updateAuthUIActual() {
    const currentAuthState = window.Clerk?.user?.id || 'anonymous';
    console.log('updateAuthUI called, clerkLoaded:', clerkLoaded, 'Clerk.user:', currentAuthState);
    lastAuthState = currentAuthState;
    
    if (!clerkLoaded || !window.Clerk) {
        console.log('Clerk not ready yet');
        return;
    }
    
    const loginBtn = document.querySelector('.login-btn');
    if (!loginBtn) {
        console.log('Login button not found in DOM');
        return;
    }
    
    if (window.Clerk.user) {
        // User is signed in
        console.log('User signed in:', window.Clerk.user.id);
        // SECURITY: Escapovat uživatelské jméno proti XSS
        const userName = escapeHtml(
            window.Clerk.user.firstName || 
            window.Clerk.user.username ||
            window.Clerk.user.emailAddresses?.[0]?.emailAddress || 
            t('auth.user_default', 'User')
        );
        loginBtn.innerHTML = `<span class="nav-icon">👤</span><span class="nav-text">${userName}</span>`;
        loginBtn.onclick = showUserProfileModal;
        loginBtn.classList.add('logged-in');
    } else {
        // User is signed out
        console.log('User signed out');
        const loginText = t('nav.login', 'Login');
        loginBtn.innerHTML = `<span class="nav-icon">👤</span><span class="nav-text" data-i18n="nav.login">${loginText}</span>`;
        // Zobrazit rozhodovací modal (Mám účet / Chci se registrovat) místo přímého Clerk SignIn
        loginBtn.onclick = showAuthChoiceModal;
        loginBtn.classList.remove('logged-in');
    }
}

// Menu and Login functions
function toggleMenu() {
    const menuDropdown = document.getElementById('menuDropdown');
    const loginModal = document.getElementById('loginModal');
    const userProfileModal = document.getElementById('userProfileModal');
    
    // Close modals if open
    if (loginModal && !loginModal.classList.contains('hidden')) {
        loginModal.classList.add('hidden');
    }
    if (userProfileModal && !userProfileModal.classList.contains('hidden')) {
        userProfileModal.classList.add('hidden');
    }
    
    // Toggle menu
    if (menuDropdown) {
        menuDropdown.classList.toggle('hidden');
        
        // Předvyplnit email přihlášeného uživatele v kontaktním formuláři
        if (!menuDropdown.classList.contains('hidden')) {
            prefillContactEmail();
        }
    }
}

// ============================================
// AUTH CHOICE MODAL - Rozhodovací modal
// Zobrazí se při kliknutí na "Přihlášení" pro nepřihlášené uživatele
// ============================================

// Zobrazit Auth Choice modal (výběr mezi přihlášením a registrací)
function showAuthChoiceModal() {
    const modal = document.getElementById('authChoiceModal');
    if (modal) {
        modal.classList.remove('hidden');
        // Aplikovat překlady
        if (window.i18n && window.i18n.applyTranslations) {
            window.i18n.applyTranslations();
        }
    }
}

// Skrýt Auth Choice modal
function hideAuthChoiceModal() {
    const modal = document.getElementById('authChoiceModal');
    if (modal) {
        modal.classList.add('hidden');
    }
}

// Klik na pozadí zavře modal
function handleAuthChoiceModalBackdropClick(event) {
    if (event.target.id === 'authChoiceModal') {
        hideAuthChoiceModal();
    }
}

// Uživatel má účet → zobrazit Clerk SignIn
function handleHaveAccount() {
    hideAuthChoiceModal();
    setTimeout(() => {
        showLoginModal('signIn');
    }, 50);
}

// Uživatel se chce registrovat → zobrazit subscriptionModal (vidí cenu, souhlasí s OP)
function handleWantRegister() {
    hideAuthChoiceModal();
    setTimeout(() => {
        showSubscriptionModal();
    }, 50);
}

// Handler pro přihlášení z loginRequiredModal
function handleLoginFromRequired() {
    hideLoginRequiredModal();
    setTimeout(() => {
        showLoginModal();
    }, 50);
}

// Handler pro registraci z loginRequiredModal - přesměruje na subscriptionModal
function handleRegisterFromRequired() {
    hideLoginRequiredModal();
    setTimeout(() => {
        showSubscriptionModal();
    }, 50);
}

async function showLoginModal(mode = 'signIn') {
    // Pokud Clerk ještě není načtený, zobrazit loading a počkat na načtení
    if (!clerkLoaded || !window.Clerk) {
        const loginBtn = document.querySelector('.login-btn');
        if (loginBtn) {
            const originalContent = loginBtn.innerHTML;
            loginBtn.innerHTML = '<span class="nav-icon clerk-loading-spinner"></span>';
            loginBtn.disabled = true;
            // Počkat max 5 sekund na Clerk
            let waited = 0;
            const waitInterval = setInterval(() => {
                waited += 200;
                if ((clerkLoaded && window.Clerk) || waited >= 5000) {
                    clearInterval(waitInterval);
                    loginBtn.disabled = false;
                    // Obnovit původní obsah a zobrazit správný modal
                    if (clerkLoaded && window.Clerk) {
                        updateAuthUI();
                        if (window.Clerk.user) {
                            showUserProfileModal();
                        } else {
                            showLoginModal(mode);
                        }
                    } else {
                        loginBtn.innerHTML = originalContent;
                        showNotification(t('auth.loading_error', 'Connection error. Please try again.'), 'error');
                    }
                }
            }, 200);
        }
        return;
    }
    
    // Pokud je uživatel přihlášen, zobrazit profil místo login modalu
    if (window.Clerk.user) {
        showUserProfileModal();
        return;
    }
    
    const menuDropdown = document.getElementById('menuDropdown');
    const loginModal = document.getElementById('loginModal');
    const userProfileModal = document.getElementById('userProfileModal');
    
    // Close other modals
    if (menuDropdown && !menuDropdown.classList.contains('hidden')) {
        menuDropdown.classList.add('hidden');
    }
    if (userProfileModal && !userProfileModal.classList.contains('hidden')) {
        userProfileModal.classList.add('hidden');
    }
    
    // Pokud Clerk má neúplnou session (client exists ale user ne), vyčistit ji
    if (window.Clerk && window.Clerk.client && !window.Clerk.user) {
        try {
            const signUpStatus = window.Clerk.client.signUp?.status;
            const signInStatus = window.Clerk.client.signIn?.status;
            
            // Pokud existuje aktivní sign-up nebo sign-in flow, zrušit ho
            if (signUpStatus && signUpStatus !== 'complete') {
                console.log('Clearing incomplete sign-up session:', signUpStatus);
                await window.Clerk.signOut();
            } else if (signInStatus && signInStatus !== 'complete') {
                console.log('Clearing incomplete sign-in session:', signInStatus);
                await window.Clerk.signOut();
            }
        } catch (e) {
            console.log('Error clearing Clerk session:', e);
        }
    }
    
    // Show login modal
    if (loginModal) {
        loginModal.classList.remove('hidden');
        
        // Aktualizovat titulek podle mode
        const modalTitle = loginModal.querySelector('.menu-title');
        const modalSubtitle = loginModal.querySelector('.login-subtitle');
        if (modalTitle && modalSubtitle) {
            if (mode === 'signUp') {
                // Změnit data-i18n atribut a text
                modalTitle.setAttribute('data-i18n', 'auth.register_title');
                modalSubtitle.setAttribute('data-i18n', 'auth.register_subtitle');
                modalTitle.textContent = t('auth.register_title', 'Registrace');
                modalSubtitle.textContent = t('auth.register_subtitle', 'Create an account to access all features');
            } else {
                // Změnit data-i18n atribut a text
                modalTitle.setAttribute('data-i18n', 'auth.login_title');
                modalSubtitle.setAttribute('data-i18n', 'auth.login_subtitle');
                modalTitle.textContent = t('auth.login_title', 'Login');
                modalSubtitle.textContent = t('auth.login_subtitle', 'Sign in to access your saved recipes and products');
            }
        }
        
        // Mount Clerk SignIn/SignUp component
        if (clerkLoaded && window.Clerk) {
            const signInDiv = document.getElementById('clerk-sign-in');
            if (signInDiv) {
                signInDiv.innerHTML = '';
                // Získat aktuální jazyk pro lokalizaci Clerk
                const currentLang = window.i18n?.currentLanguage || 'cs';
                
                // Česká lokalizace pro Clerk (struktura dle Clerk dokumentace)
                const czechLocalization = {
                    formButtonPrimary: 'Pokračovat',
                    formFieldLabel__emailAddress: 'E-mailová adresa',
                    formFieldLabel__emailAddress_username: 'E-mail nebo uživatelské jméno',
                    formFieldLabel__username: 'Uživatelské jméno',
                    formFieldLabel__password: 'Heslo',
                    formFieldLabel__firstName: 'Jméno',
                    formFieldLabel__lastName: 'Příjmení',
                    formFieldInputPlaceholder__emailAddress: 'Zadejte e-mail',
                    formFieldInputPlaceholder__emailAddress_username: 'Zadejte e-mail nebo uživatelské jméno',
                    formFieldInputPlaceholder__password: 'Zadejte heslo',
                    formFieldInputPlaceholder__firstName: 'Zadejte jméno',
                    formFieldInputPlaceholder__lastName: 'Zadejte příjmení',
                    formFieldHintText__optional: 'Volitelné',
                    dividerText: 'nebo',
                    socialButtonsBlockButton: 'Pokračovat přes {{provider|titleize}}',
                    socialButtonsBlockButtonManyInView: '{{provider|titleize}}',
                    signIn: {
                        start: {
                            title: 'Přihlášení',
                            subtitle: 'pro přístup do {{applicationName}}',
                            actionText: 'Nemáte účet?',
                            actionLink: 'Zaregistrovat se'
                        },
                        password: {
                            title: 'Zadejte heslo',
                            subtitle: 'pro pokračování do {{applicationName}}',
                            actionLink: 'Použít jinou metodu'
                        },
                        emailCode: {
                            title: 'Ověřte e-mail',
                            subtitle: 'pro pokračování do {{applicationName}}',
                            formTitle: 'Ověřovací kód',
                            formSubtitle: 'Zadejte ověřovací kód zaslaný na váš e-mail',
                            resendButton: 'Znovu odeslat kód'
                        }
                    },
                    signUp: {
                        start: {
                            title: 'Registrace',
                            subtitle: 'pro přístup do {{applicationName}}',
                            actionText: 'Máte již účet?',
                            actionLink: 'Přihlásit se'
                        }
                    },
                    footerActionLink__signIn: 'Přihlásit se',
                    footerActionLink__signUp: 'Zaregistrovat se',
                    footerActionLink__useAnotherMethod: 'Použít jinou metodu',
                    footerPageLink__help: 'Nápověda',
                    footerPageLink__privacy: 'Ochrana soukromí',
                    footerPageLink__terms: 'Podmínky'
                };
                
                // Další jazyky
                const localizations = {
                    cs: czechLocalization,
                    sk: {
                        formButtonPrimary: 'Pokračovať',
                        dividerText: 'alebo',
                        formFieldLabel__emailAddress: 'E-mailová adresa',
                        formFieldLabel__emailAddress_username: 'E-mail alebo užívateľské meno',
                        formFieldLabel__password: 'Heslo'
                    },
                    de: {
                        formButtonPrimary: 'Fortfahren',
                        dividerText: 'oder'
                    },
                    pl: {
                        formButtonPrimary: 'Kontynuuj',
                        dividerText: 'lub'
                    }
                };
                
                const clerkOptions = {
                    appearance: {
                        variables: {
                            colorPrimary: '#ff00ff',
                            colorBackground: '#0a0a15',
                            colorText: '#ffffff',
                            colorTextSecondary: 'rgba(255,255,255,0.7)',
                            colorInputBackground: 'rgba(0,0,0,0.5)',
                            colorInputText: '#ffffff',
                            borderRadius: '8px'
                        },
                        elements: {
                            rootBox: {
                                width: '100%'
                            },
                            card: {
                                background: 'transparent',
                                boxShadow: 'none',
                                border: 'none'
                            },
                            headerTitle: {
                                display: 'none'
                            },
                            headerSubtitle: {
                                display: 'none'
                            },
                            formButtonPrimary: {
                                background: 'linear-gradient(135deg, #ff00ff 0%, #aa00ff 100%)',
                                border: 'none',
                                color: '#ffffff',
                                fontFamily: 'Orbitron, sans-serif',
                                fontWeight: '600',
                                fontSize: '16px',
                                padding: '14px 24px',
                                textShadow: '0 0 10px rgba(0,0,0,0.5)'
                            },
                            'formButtonPrimary:hover': {
                                background: 'linear-gradient(135deg, #ff33ff 0%, #cc33ff 100%)',
                                boxShadow: '0 0 20px rgba(255, 0, 255, 0.5)'
                            },
                            footerActionLink: {
                                color: '#00ffff'
                            },
                            socialButtonsProviderIcon__apple: {
                                filter: 'invert(1) brightness(2)'
                            }
                        }
                    },
                    localization: localizations[currentLang] || czechLocalization,
                    // Zabránit automatickému přesměrování na Clerk doménu
                    routing: 'virtual'
                };
                
                // Mount SignIn nebo SignUp podle mode
                if (mode === 'signUp') {
                    // Pro registraci použít mountSignUp
                    window.Clerk.mountSignUp(signInDiv, clerkOptions);
                    signInDiv._clerkMode = 'signUp';
                    
                    // Zachytit klik na "Sign in" link v Clerk SignUp
                    // (přesměrovat na náš login modal místo externí Clerk stránky)
                    const signUpObserver = new MutationObserver((mutations) => {
                        const signInSelectors = [
                            'a[href*="sign-in"]',
                            '.cl-footerActionLink',
                            '[data-localization-key*="signIn"]',
                            '.cl-footer a',
                            '.cl-footerAction a',
                            '.cl-footerAction button',
                            '.cl-footerActionText ~ a',
                            '.cl-footerActionText ~ button'
                        ];
                        
                        signInSelectors.forEach(selector => {
                            const elements = signInDiv.querySelectorAll(selector);
                            elements.forEach(link => {
                                // Zachytit pouze "Sign in" linky, ne ostatní
                                const linkText = link.textContent?.toLowerCase() || '';
                                const linkHref = link.href?.toLowerCase() || '';
                                if ((linkText.includes('sign in') || linkText.includes('přihlásit') || linkHref.includes('sign-in')) 
                                    && !link.dataset.interceptedSignIn) {
                                    link.dataset.interceptedSignIn = 'true';
                                    link.addEventListener('click', (e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        e.stopImmediatePropagation();
                                        hideLoginModal();
                                        setTimeout(() => {
                                            showLoginModal('signIn');
                                        }, 150);
                                        return false;
                                    }, true);
                                }
                            });
                        });
                    });
                    
                    signUpObserver.observe(signInDiv, { childList: true, subtree: true });
                    signInDiv._clerkObserver = signUpObserver;
                } else {
                    // Pro přihlášení použít mountSignIn
                    window.Clerk.mountSignIn(signInDiv, clerkOptions);
                    signInDiv._clerkMode = 'signIn';
                    
                    // Zachytit klik na "Sign up" link v Clerku pomocí MutationObserver
                    // (přesměrovat na subscription modal)
                    const observer = new MutationObserver((mutations) => {
                        const signUpSelectors = [
                            'a[href*="sign-up"]',
                            '.cl-footerActionLink',
                            '[data-localization-key*="signUp"]',
                            '.cl-footer a',
                            '.cl-footerAction a',
                            '.cl-footerAction button',
                            '.cl-footerActionText ~ a',
                            '.cl-footerActionText ~ button'
                        ];
                        
                        signUpSelectors.forEach(selector => {
                            const elements = signInDiv.querySelectorAll(selector);
                            elements.forEach(link => {
                                // Zachytit pouze "Sign up" linky, ne ostatní
                                const linkText = link.textContent?.toLowerCase() || '';
                                const linkHref = link.href?.toLowerCase() || '';
                                if ((linkText.includes('sign up') || linkText.includes('zaregistrovat') || linkHref.includes('sign-up')) 
                                    && !link.dataset.intercepted) {
                                    link.dataset.intercepted = 'true';
                                    link.addEventListener('click', (e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        e.stopImmediatePropagation();
                                        hideLoginModal();
                                        setTimeout(() => {
                                            showSubscriptionModal();
                                        }, 150);
                                        return false;
                                    }, true);
                                }
                            });
                        });
                    });
                    
                    observer.observe(signInDiv, { childList: true, subtree: true });
                    signInDiv._clerkObserver = observer;
                }
            }
        }
    }
}

function hideLoginModal() {
    const loginModal = document.getElementById('loginModal');
    if (loginModal) {
        loginModal.classList.add('hidden');
        // Cleanup observer a unmount Clerk component
        const signInDiv = document.getElementById('clerk-sign-in');
        if (signInDiv && signInDiv._clerkObserver) {
            signInDiv._clerkObserver.disconnect();
            signInDiv._clerkObserver = null;
        }
        if (clerkLoaded && window.Clerk && signInDiv) {
            // Unmount podle toho co bylo mountnuté
            if (signInDiv._clerkMode === 'signUp') {
                window.Clerk.unmountSignUp(signInDiv);
            } else {
                window.Clerk.unmountSignIn(signInDiv);
            }
            signInDiv._clerkMode = null;
        }
    }
    // Odstranit speciální třídu pro přihlášení ze sdíleného receptu
    document.body.classList.remove('login-for-shared-recipe');
}

// Zavřít modal tlačítkem X
function handleLoginModalClose() {
    // Vyčistit pending payment flag pokud uživatel ruší registraci
    localStorage.removeItem('liquimixer_pending_payment');
    localStorage.removeItem('liquimixer_terms_accepted');
    localStorage.removeItem('liquimixer_terms_accepted_at');
    localStorage.removeItem('liquimixer_from_subscription');
    document.body.classList.remove('subscription-flow-pending');
    hideLoginModal();
}

// Zavřít modal kliknutím na pozadí
function handleLoginModalBackdropClick(event) {
    if (event.target.id === 'loginModal') {
        // Vyčistit pending payment flag pokud uživatel ruší registraci
        localStorage.removeItem('liquimixer_pending_payment');
        localStorage.removeItem('liquimixer_terms_accepted');
        localStorage.removeItem('liquimixer_terms_accepted_at');
        localStorage.removeItem('liquimixer_from_subscription');
        document.body.classList.remove('subscription-flow-pending');
        hideLoginModal();
    }
}

function handleProfileModalBackdropClick(event) {
    if (event.target.id === 'userProfileModal') {
        hideUserProfileModal();
    }
}

// ============================================
// LOGIN REQUIRED MODAL (pro nepřihlášené)
// ============================================

function showLoginRequiredModal() {
    const modal = document.getElementById('loginRequiredModal');
    if (modal) {
        // Aplikovat překlady globálně
        if (window.i18n && window.i18n.applyTranslations) {
            window.i18n.applyTranslations();
        }
        
        // Přeložit texty v modálu (kromě cen - ty se nastaví podle jazyka)
        modal.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            // Přeskočit cenové elementy - ty se nastaví podle jazyka
            if (key.includes('promo_price')) return;
            
            if (typeof t === 'function') {
                el.textContent = t(key, el.textContent);
            }
        });
        
        // Aktualizovat zobrazení ceny podle aktuálního jazyka (MUSÍ být po překladu)
        updatePriceDisplay();
        
        modal.classList.remove('hidden');
        
        // Zajistit správné scroll pozice - modal nahoře
        modal.scrollTop = 0;
        window.scrollTo(0, 0);
    }
}

// Aktualizace zobrazení ceny podle jazyka
function updatePriceDisplay() {
    // Získat aktuální jazyk z i18n modulu
    let currentLocale = 'cs'; // default
    if (typeof window.i18n !== 'undefined' && typeof window.i18n.getLocale === 'function') {
        currentLocale = window.i18n.getLocale();
    }
    
    const priceCzElements = document.querySelectorAll('.price-cz');
    const priceEuElements = document.querySelectorAll('.price-eu');
    const priceUsdElements = document.querySelectorAll('.price-usd');
    
    // USD země: en, ja, ko, zh-CN, zh-TW, ar-SA
    const usdLocales = ['en', 'ja', 'ko', 'zh-CN', 'zh-TW', 'ar-SA'];
    
    // Skrýt všechny ceny
    priceCzElements.forEach(el => el.classList.add('hidden'));
    priceEuElements.forEach(el => el.classList.add('hidden'));
    priceUsdElements.forEach(el => el.classList.add('hidden'));
    
    if (currentLocale === 'cs') {
        // Pro češtinu zobrazit CZK cenu
        priceCzElements.forEach(el => el.classList.remove('hidden'));
    } else if (usdLocales.includes(currentLocale)) {
        // Pro USD země zobrazit USD cenu
        priceUsdElements.forEach(el => el.classList.remove('hidden'));
    } else {
        // Pro ostatní jazyky (EUR země) zobrazit EUR cenu
        priceEuElements.forEach(el => el.classList.remove('hidden'));
    }
}

function hideLoginRequiredModal() {
    const modal = document.getElementById('loginRequiredModal');
    if (modal) {
        modal.classList.add('hidden');
    }
}

function handleLoginRequiredModalBackdropClick(event) {
    if (event.target.id === 'loginRequiredModal') {
        hideLoginRequiredModal();
    }
}

// Kontrola, zda je uživatel přihlášen
function isUserLoggedIn() {
    return clerkLoaded && window.Clerk?.user;
}

// Kontrola, zda má uživatel aktivní předplatné
function hasActiveSubscription() {
    // Kontrola skutečného stavu předplatného z checkSubscriptionStatus()
    // subscriptionData je nastavena při přihlášení uživatele
    return subscriptionData?.valid === true;
}

// Požadovat přihlášení pro přístup k funkci
function requireLogin(callback) {
    if (!isUserLoggedIn()) {
        showLoginRequiredModal();
        return false;
    }
    if (callback && typeof callback === 'function') {
        callback();
    }
    return true;
}

// Požadovat předplatné pro přístup k PRO funkcím
function requireSubscription(callback) {
    if (!isUserLoggedIn()) {
        showLoginRequiredModal();
        return false;
    }
    if (!hasActiveSubscription()) {
        showSubscriptionModal();
        return false;
    }
    if (callback && typeof callback === 'function') {
        callback();
    }
    return true;
}

function showUserProfileModal() {
    const menuDropdown = document.getElementById('menuDropdown');
    const loginModal = document.getElementById('loginModal');
    const userProfileModal = document.getElementById('userProfileModal');
    
    // Close other modals
    if (menuDropdown && !menuDropdown.classList.contains('hidden')) {
        menuDropdown.classList.add('hidden');
    }
    if (loginModal && !loginModal.classList.contains('hidden')) {
        loginModal.classList.add('hidden');
    }
    
    // Show user profile modal
    if (userProfileModal) {
        userProfileModal.classList.remove('hidden');
        
        // Aplikovat překlady na modal (pro případ, že se jazyk změnil)
        if (window.i18n && window.i18n.applyTranslations) {
            window.i18n.applyTranslations();
        }
        
        // Zobrazit informace o uživateli
        if (clerkLoaded && window.Clerk?.user) {
            const profileInfoDiv = document.getElementById('userProfileInfo');
            if (profileInfoDiv) {
                // SECURITY: Escapovat uživatelská data proti XSS
                const user = window.Clerk.user;
                const safeEmail = escapeHtml(user.emailAddresses?.[0]?.emailAddress || '');
                const safeName = escapeHtml(user.fullName || user.firstName || '');
                const avatarUrl = user.imageUrl;
                
                // Vytvořit avatar - buď obrázek nebo placeholder s iniciálami
                let avatarHtml;
                if (avatarUrl) {
                    avatarHtml = `<img src="${escapeHtml(avatarUrl)}" alt="Avatar" class="profile-avatar">`;
                } else {
                    const initials = safeName ? safeName.charAt(0).toUpperCase() : '👤';
                    avatarHtml = `<div class="profile-avatar-placeholder">${initials}</div>`;
                }
                
                profileInfoDiv.innerHTML = `
                    ${avatarHtml}
                    <div class="profile-details">
                        <div class="profile-name">${safeName || t('auth.user', 'User')}</div>
                        <div class="profile-email">${safeEmail}</div>
                    </div>
                `;
            }
        }
        
        // Vytvořit výběr jazyka
        if (window.i18n?.createLanguageSelector) {
            window.i18n.createLanguageSelector('profileLanguageSelector');
        }
        
        // Aplikovat překlady na nově přidané elementy
        if (window.i18n?.applyTranslations) {
            window.i18n.applyTranslations();
        }
    }
}

// Funkce pro odhlášení
async function signOut() {
    if (clerkLoaded && window.Clerk) {
        clearSubscriptionCache();
        subscriptionData = null;
        await window.Clerk.signOut();
        hideUserProfileModal();
        updateAuthUI();
        showPage('intro');
    }
}

function hideUserProfileModal() {
    const userProfileModal = document.getElementById('userProfileModal');
    if (userProfileModal) {
        userProfileModal.classList.add('hidden');
    }
}

async function handleSignOut() {
    if (clerkLoaded && window.Clerk) {
        clearSubscriptionCache();
        subscriptionData = null;
        await window.Clerk.signOut();
        hideUserProfileModal();
        updateAuthUI();
    }
}

function showRegisterInfo() {
    // Clerk handles registration in the SignIn component
    showLoginModal();
}

// Předvyplnit email přihlášeného uživatele v kontaktním formuláři
function prefillContactEmail() {
    const emailInput = document.getElementById('contactEmail');
    if (!emailInput) return;
    
    const userEmail = window.Clerk?.user?.primaryEmailAddress?.emailAddress;
    if (userEmail) {
        emailInput.value = userEmail;
        emailInput.readOnly = true;
        emailInput.style.opacity = '0.7';
        emailInput.style.cursor = 'not-allowed';
    } else {
        emailInput.readOnly = false;
        emailInput.style.opacity = '';
        emailInput.style.cursor = '';
    }
}

// Rate limiter pro kontaktní formulář (client-side)
const contactRateLimiter = {
    lastSubmit: 0,
    minInterval: 30000, // 30 sekund mezi odesláními
    
    canSubmit() {
        const now = Date.now();
        if (now - this.lastSubmit < this.minInterval) {
            return false;
        }
        this.lastSubmit = now;
        return true;
    }
};

// Zobrazit stav kontaktního formuláře
function showContactStatus(message, isError = false) {
    const statusEl = document.getElementById('contactStatus');
    if (!statusEl) return;
    
    statusEl.textContent = message;
    statusEl.className = 'contact-status ' + (isError ? 'error' : 'success');
    statusEl.style.display = 'block';
    
    // Automaticky skrýt po 5 sekundách
    setTimeout(() => {
        statusEl.style.display = 'none';
    }, 5000);
}

// Nastavit loading stav tlačítka
function setContactLoading(isLoading) {
    const btn = document.getElementById('contactSubmitBtn');
    const text = document.getElementById('contactSubmitText');
    const loader = document.getElementById('contactSubmitLoader');
    
    if (btn && text && loader) {
        btn.disabled = isLoading;
        text.style.display = isLoading ? 'none' : 'inline';
        loader.classList.toggle('hidden', !isLoading);
    }
}

// Hlavní handler kontaktního formuláře
async function handleContact(event) {
    event.preventDefault();
    
    // Honeypot kontrola (anti-spam)
    const honeypot = document.getElementById('contactHoneypot');
    if (honeypot && honeypot.value) {
        console.warn('Spam detected (honeypot)');
        showContactStatus(t('menu.contact_success', 'Thank you!'), false); // Fake success pro boty
        return false;
    }
    
    // Rate limiting
    if (!contactRateLimiter.canSubmit()) {
        showContactStatus(t('menu.contact_rate_limit', 'Please wait 30 seconds before sending another message.'), true);
        return false;
    }
    
    const email = document.getElementById('contactEmail').value.trim();
    const subject = document.getElementById('contactSubject').value.trim();
    const message = document.getElementById('contactMessage').value.trim();
    
    // Validace
    if (!email || !subject || !message) {
        showContactStatus(t('menu.contact_fill_all', 'Please fill in all fields.'), true);
        return false;
    }
    
    // Email validace
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showContactStatus(t('menu.contact_invalid_email', 'Please enter a valid email address.'), true);
        return false;
    }
    
    // Délka validace
    if (subject.length < 3 || subject.length > 200) {
        showContactStatus(t('menu.contact_subject_length', 'Subject must be 3-200 characters.'), true);
        return false;
    }
    
    if (message.length < 10 || message.length > 5000) {
        showContactStatus(t('menu.contact_message_length', 'Message must be 10-5000 characters.'), true);
        return false;
    }
    
    // Získat kategorii
    const categorySelect = document.getElementById('contactCategory');
    const category = categorySelect ? categorySelect.value : 'other';
    
    if (!category) {
        showContactStatus(t('menu.contact_category_placeholder', 'Please select a category.'), true);
        return false;
    }
    
    setContactLoading(true);
    
    try {
        // Získat Clerk token (pokud přihlášen)
        const clerkToken = window.Clerk?.user ? await getClerkToken() : null;
        
        // Získat aktuální locale
        const locale = (window.i18n && window.i18n.getLocale) ? window.i18n.getLocale() : 'cs';
        
        // Volat edge funkci contact (triggeruje N8N webhook)
        const response = await fetch(`${getSupabaseUrl()}/functions/v1/contact`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getSupabaseAnonKey()}`,
                ...(clerkToken ? { 'x-clerk-token': clerkToken } : {})
            },
            body: JSON.stringify({
                action: 'submit',
                data: {
                    email: email,
                    category: category,
                    subject: subject,
                    message: message,
                    locale: locale
                }
            })
        });
        
        const result = await response.json();
        
        if (!response.ok || result.error) {
            console.error('Contact form error:', result.error);
            throw new Error(result.error || 'Failed to send message');
        }
        
        // Úspěch
        showContactStatus(t('menu.contact_success', 'Thank you! Your message has been sent.'), false);
        
        // Vymazat formulář (email přihlášeného uživatele zůstane)
        document.getElementById('contactSubject').value = '';
        document.getElementById('contactMessage').value = '';
        document.getElementById('contactCategory').selectedIndex = 0;
        prefillContactEmail();
        
    } catch (err) {
        console.error('Error sending contact message:', err);
        showContactStatus(t('menu.contact_error', 'Sorry, the message could not be sent. Please try again later.'), true);
    } finally {
        setContactLoading(false);
    }
    
    return false;
}

// ============================================
// RECIPE SAVING AND SHARING FUNCTIONS
// ============================================

let currentRecipeData = null;
let currentViewingRecipe = null;
let selectedRating = 0;

// Uložit aktuální recept do paměti pro pozdější uložení
function storeCurrentRecipe(data) {
    currentRecipeData = data;
    // Asynchronně logovat výpočet do analytics DB
    logCalculation(data);
}

// ============================================
// CALCULATION LOGGING (Analytics DB)
// ============================================

// Anonymní UUID — identifikuje zařízení bez přihlášení
function getAnonymousId() {
    let id = localStorage.getItem('liquimixer_anonymous_id');
    if (!id) {
        id = crypto.randomUUID();
        localStorage.setItem('liquimixer_anonymous_id', id);
    }
    return id;
}

// Detekce typu zařízení
function getDeviceType() {
    const ua = navigator.userAgent;
    if (/tablet|ipad|playbook|silk/i.test(ua)) return 'tablet';
    if (/mobile|iphone|ipod|android.*mobile|windows phone/i.test(ua)) return 'mobile';
    return 'desktop';
}

// Detekce PWA režimu
function getIsPwa() {
    return window.matchMedia('(display-mode: standalone)').matches ||
           window.navigator.standalone === true ||
           document.referrer.includes('android-app://');
}

// Session hash (fingerprint bez osobních údajů)
function getSessionHash() {
    const raw = [
        navigator.language,
        screen.width + 'x' + screen.height,
        new Date().toISOString().substring(0, 10),
        getDeviceType()
    ].join('|');
    let hash = 0;
    for (let i = 0; i < raw.length; i++) {
        hash = ((hash << 5) - hash) + raw.charCodeAt(i);
        hash |= 0;
    }
    return Math.abs(hash).toString(36);
}

// Mapovat formType na calc_type
function getCalcType(data) {
    const ft = data.formType || data.form_type || 'liquid';
    const map = {
        'liquid': 'liquid',
        'shakevape': 'shakevape',
        'snv': 'shakevape',
        'liquidpro': 'liquidpro',
        'pro': 'liquidpro',
        'shortfill': 'shortfill',
        'dilute': 'dilution',
        'dilution': 'dilution',
        'shisha': data.shishaMode === 'mix' ? 'shisha_mix' :
                  data.shishaMode === 'diy' ? 'shisha_diy' :
                  data.shishaMode === 'molasses' ? 'shisha_molasses' :
                  data.shishaMode === 'tweak' ? 'shisha_tweak' : 'shisha_mix'
    };
    return map[ft] || 'liquid';
}

// Client-side rate limit (max 25 za minutu)
let calcLogCount = 0;
let calcLogResetAt = 0;

async function logCalculation(data) {
    try {
        // Client-side rate limit
        const now = Date.now();
        if (now > calcLogResetAt) {
            calcLogCount = 0;
            calcLogResetAt = now + 60000;
        }
        if (calcLogCount >= 25) return;
        calcLogCount++;

        const calcType = getCalcType(data);

        // PARAMS: kompletní recipeData + doplnění z DOM co v data objektu chybí
        // Klonujeme celý data objekt — obsahuje VŠE co formulář předal
        const params = JSON.parse(JSON.stringify(data));
        // Odstranit ingredients z params (jdou do results)
        delete params.ingredients;

        // Doplnit údaje z DOM které data objekt neobsahuje
        const ft = data.formType || 'liquid';
        if (ft === 'liquid' || !ft) {
            // Liquid formulář — doplnit nikotinové parametry
            params._dom = {
                nicotineType: document.getElementById('nicotineType')?.value || null,
                targetNicotine: parseFloat(document.getElementById('targetNicotine')?.value) || 0,
                baseNicotine: parseFloat(document.getElementById('nicotineBaseStrength')?.value) || 0,
                nicotineRatio: document.getElementById('nicotineRatio')?.value || null,
                flavorRatio: document.getElementById('flavorRatio')?.value || null,
                totalAmount: parseFloat(document.getElementById('totalAmount')?.value) || 0,
                vgPgRatio: parseInt(document.getElementById('vgPgRatio')?.value) || 0,
                baseType: document.getElementById('baseType')?.value || null,
                premixedRatio: document.getElementById('premixedRatio')?.value || null,
            };
        } else if (ft === 'shakevape' || ft === 'snv') {
            params._dom = {
                nicotineType: document.getElementById('svNicotineType')?.value || null,
                targetNicotine: parseFloat(document.getElementById('svTargetNicotine')?.value) || 0,
                baseNicotine: parseFloat(document.getElementById('svNicotineBaseStrength')?.value) || 0,
                nicotineRatio: document.getElementById('svNicotineRatio')?.value || null,
                flavorVolume: parseFloat(document.getElementById('svFlavorVolume')?.value) || 0,
                flavorRatio: document.getElementById('svFlavorRatio')?.value || null,
                totalAmount: parseFloat(document.getElementById('svTotalAmount')?.value) || 0,
                vgPgRatio: parseInt(document.getElementById('svVgPgRatio')?.value) || 0,
                baseType: document.getElementById('svBaseType')?.value || null,
                premixedRatio: document.getElementById('svPremixedRatio')?.value || null,
            };
        } else if (ft === 'liquidpro' || ft === 'pro') {
            params._dom = {
                nicotineType: document.getElementById('proNicotineType')?.value || null,
                targetNicotine: parseFloat(document.getElementById('proTargetNicotine')?.value) || 0,
                baseNicotine: parseFloat(document.getElementById('proNicotineBaseStrength')?.value) || 0,
                nicotineRatioSlider: parseInt(document.getElementById('proNicotineRatioSlider')?.value) || 50,
                totalAmount: parseFloat(document.getElementById('proTotalAmount')?.value) || 0,
                vgPgRatio: parseInt(document.getElementById('proVgPgRatio')?.value) || 0,
                baseType: document.getElementById('proBaseType')?.value || null,
                premixedRatio: document.getElementById('proPremixedRatio')?.value || null,
            };
            // PRO multi-flavor detaily s kompletními daty z DB
            if (typeof getProFlavorsData === 'function') {
                params._proFlavors = getProFlavorsData().map(f => ({
                    type: f.type, percent: f.percent, vgRatio: f.vgRatio,
                    name: f.flavorName || f.name || null,
                    manufacturer: f.flavorManufacturer || f.manufacturer || null,
                    id: f.flavorId || f.id || null,
                    favoriteProductId: f.favoriteProductId || null,
                    source: f.flavorSource || f.source || null,
                    customComposition: f._explicitComposition || null
                }));
            }
            // PRO aditiva
            if (typeof getProAdditivesData === 'function') {
                params._proAdditives = getProAdditivesData().map(a => ({
                    type: a.type, percent: a.percent, name: a.name || null,
                    customComposition: a.customComposition || null
                }));
            }
        } else if (ft === 'shortfill') {
            params._dom = {
                bottleVolume: parseFloat(document.getElementById('sfBottleVolume')?.value) || 0,
                liquidVolume: parseFloat(document.getElementById('sfLiquidVolume')?.value) || 0,
                nicStrength: parseFloat(document.getElementById('sfNicStrength')?.value) || 0,
                nicShotVolume: parseFloat(document.getElementById('sfNicShotVolume')?.value) || 0,
                shotCount: parseInt(document.getElementById('sfShotCountValue')?.value) || 1,
            };
        } else if (ft === 'dilute') {
            params._dom = {
                amountType: document.querySelector('input[name="amountType"]:checked')?.value || null,
                baseStrength: parseFloat(document.getElementById('diluteBaseStrength')?.value) || 0,
                targetStrength: parseFloat(document.getElementById('diluteTargetStrength')?.value) || 0,
                sourceVg: parseInt(document.getElementById('diluteSourceRatio')?.value) || 0,
                targetVg: parseInt(document.getElementById('diluteTargetRatio')?.value) || 0,
                nicotineType: document.getElementById('diluteNicotineType')?.value || null,
                finalAmount: parseFloat(document.getElementById('diluteFinalAmount')?.value) || 0,
                sourceAmount: parseFloat(document.getElementById('diluteSourceAmount')?.value) || 0,
            };
        } else if (ft === 'shisha') {
            const mode = data.shishaMode || 'mix';
            if (mode === 'mix') {
                params._dom = {
                    bowlSize: parseInt(document.getElementById('shBowlSize')?.value) || 0,
                };
                // Tabáky z Mode 1 (1-4) s detaily
                params._tobaccoDetails = [];
                for (let i = 1; i <= 4; i++) {
                    const pctEl = document.getElementById(`shTobaccoPercent${i}`);
                    const autoEl = document.getElementById(`shTobaccoAutocomplete${i}`);
                    if (pctEl && parseFloat(pctEl.value) > 0) {
                        const entry = { position: i, percent: parseFloat(pctEl.value) };
                        if (autoEl?.dataset?.flavorData) {
                            try {
                                const fd = JSON.parse(autoEl.dataset.flavorData);
                                entry.name = fd.name || null;
                                entry.manufacturer = fd.manufacturer_code || fd.manufacturer || fd.brand || null;
                                entry.id = fd.flavor_id || fd.id || null;
                                entry.favoriteProductId = fd.favorite_product_id || null;
                                entry.source = fd.source || null;
                            } catch(e) {}
                        }
                        params._tobaccoDetails.push(entry);
                    }
                }
            } else if (mode === 'diy') {
                params._dom = {
                    tobaccoAmount: parseFloat(document.getElementById('shDiyTobaccoAmount')?.value) || 0,
                    diyRatio: document.getElementById('shDiyRatio')?.value || null,
                    nicotineType: document.getElementById('shDiyNicotineType')?.value || null,
                    targetNicotine: parseFloat(document.getElementById('shDiyTargetNicotine')?.value) || 0,
                    baseNicotine: parseFloat(document.getElementById('shDiyNicotineBaseStrength')?.value) || 0,
                    sweetenerType: document.getElementById('shDiySweetenerType')?.value || null,
                    sweetenerPercent: parseFloat(document.getElementById('shDiySweetenerPercent')?.value) || 0,
                    glycerinPercent: parseFloat(document.getElementById('shDiyGlycerinPercent')?.value) || 0,
                    waterPercent: parseFloat(document.getElementById('shDiyWaterPercent')?.value) || 0,
                    purePgPercent: parseFloat(document.getElementById('shDiyPurePgPercent')?.value) || 0,
                };
                // DIY příchutě (1-4)
                params._diyFlavors = [];
                for (let i = 1; i <= 4; i++) {
                    const typeEl = document.getElementById(`shDiyFlavorType${i}`);
                    const pctEl = document.getElementById(`shDiyFlavorStrength${i}`);
                    const autoEl = document.getElementById(`shDiyFlavorAutocomplete${i}`);
                    if (typeEl && typeEl.value !== 'none') {
                        const entry = { position: i, type: typeEl.value, percent: parseFloat(pctEl?.value) || 0 };
                        if (autoEl?.dataset?.flavorData) {
                            try {
                                const fd = JSON.parse(autoEl.dataset.flavorData);
                                entry.name = fd.name || null;
                                entry.manufacturer = fd.manufacturer_code || fd.manufacturer || fd.brand || null;
                                entry.id = fd.flavor_id || fd.id || null;
                                entry.favoriteProductId = fd.favorite_product_id || null;
                                entry.source = fd.source || null;
                            } catch(e) {}
                        }
                        params._diyFlavors.push(entry);
                    }
                }
            } else if (mode === 'molasses') {
                params._dom = {
                    totalAmount: parseFloat(document.getElementById('shMolTotalAmount')?.value) || 0,
                    sweetenerBase: document.getElementById('shMolSweetenerBase')?.value || null,
                    sweetenerPercent: parseFloat(document.getElementById('shMolSweetenerPercent')?.value) || 0,
                    glycerinPercent: parseFloat(document.getElementById('shMolGlycerinPercent')?.value) || 0,
                    nicotineType: document.getElementById('shMolNicotineType')?.value || null,
                    targetNicotine: parseFloat(document.getElementById('shMolTargetNicotine')?.value) || 0,
                    baseNicotine: parseFloat(document.getElementById('shMolNicotineBaseStrength')?.value) || 0,
                };
                // Molasses příchutě (1-4)
                params._molFlavors = [];
                for (let i = 1; i <= 4; i++) {
                    const typeEl = document.getElementById(`shMolFlavorType${i}`);
                    const pctEl = document.getElementById(`shMolFlavorStrength${i}`);
                    const autoEl = document.getElementById(`shMolFlavorAutocomplete${i}`);
                    if (typeEl && typeEl.value !== 'none') {
                        const entry = { position: i, type: typeEl.value, percent: parseFloat(pctEl?.value) || 0 };
                        if (autoEl?.dataset?.flavorData) {
                            try {
                                const fd = JSON.parse(autoEl.dataset.flavorData);
                                entry.name = fd.name || null;
                                entry.manufacturer = fd.manufacturer_code || fd.manufacturer || fd.brand || null;
                                entry.id = fd.flavor_id || fd.id || null;
                                entry.favoriteProductId = fd.favorite_product_id || null;
                                entry.source = fd.source || null;
                            } catch(e) {}
                        }
                        params._molFlavors.push(entry);
                    }
                }
            }
            // Tweak: tweakState je již kompletní v data objektu (checkboxy, %, příchutě, mixology)
        }

        // RESULTS: kompletní ingredience se VŠEMI detaily
        const results = {
            actualVg: data.actualVg !== undefined ? data.actualVg : null,
            actualPg: data.actualPg !== undefined ? data.actualPg : null,
        };
        if (data.ingredients && Array.isArray(data.ingredients)) {
            results.ingredients = data.ingredients.map(ing => ({
                key: ing.ingredientKey || null,
                volume: ing.volume || 0,
                percent: ing.percent || 0,
                grams: ing.grams || null,
                flavorType: ing.flavorType || null,
                flavorNumber: ing.flavorNumber || null,
                flavorIndex: ing.flavorIndex || null,
                flavorName: ing.flavorName || null,
                flavorManufacturer: ing.flavorManufacturer || null,
                flavorId: ing.flavorId || null,
                favoriteProductId: ing.favoriteProductId || null,
                flavorSource: ing.flavorSource || null,
                additiveType: ing.additiveType || null,
                vgRatio: ing.vgRatio || null,
                customComposition: ing.customComposition || null,
                params: ing.params || null,
                displayAmount: ing.displayAmount || null
            }));
        }

        const payload = {
            calc_type: calcType,
            params: params,
            results: results,
            anonymous_id: getAnonymousId(),
            clerk_id: window.Clerk?.user?.id || null,
            locale: navigator.language || 'en',
            device_type: getDeviceType(),
            screen_resolution: screen.width + 'x' + screen.height,
            is_pwa: getIsPwa(),
            user_agent: navigator.userAgent.substring(0, 300),
            referrer: document.referrer ? document.referrer.substring(0, 500) : null,
            session_hash: getSessionHash()
        };

        const sbUrl = getSupabaseUrl();
        fetch(sbUrl + '/functions/v1/calc-log', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + getSupabaseAnonKey()
            },
            body: JSON.stringify(payload)
        }).catch(() => {});
    } catch (e) {
        // Nesmí nikdy rozbít hlavní výpočet
    }
}

// ============================================
// AUTOMATIC DIFFICULTY LEVEL CALCULATION
// ============================================
// Pravidla:
// - beginner: 1 příchuť, bez aditiv
// - intermediate: 2 příchutě NEBO sladidlo (shisha)
// - expert: 3 příchutě NEBO aditivum
// - virtuoso: 4 příchutě
// ============================================
function calculateDifficultyLevel(recipeData) {
    if (!recipeData) return 'beginner';
    
    let flavorCount = 0;
    let hasAdditive = false;
    let hasSweetener = false;
    
    const formType = recipeData.formType || 'liquid';
    
    // Počet příchutí podle typu formuláře
    if (formType === 'liquidpro' || formType === 'shisha') {
        // Multi-flavor formuláře
        if (recipeData.flavors && Array.isArray(recipeData.flavors)) {
            flavorCount = recipeData.flavors.filter(f => f && f.type && f.type !== 'none' && f.percent > 0).length;
        }
        // Shisha Mode 1 (tobacco mix) uses tobaccos array instead of flavors
        if (formType === 'shisha' && recipeData.shishaMode === 'mix' && recipeData.tobaccos && Array.isArray(recipeData.tobaccos)) {
            flavorCount = recipeData.tobaccos.filter(tb => tb && tb.percent > 0).length;
        }
    } else {
        // Jednoduchý formulář (liquid, shakevape, shortfill)
        if (recipeData.flavorType && recipeData.flavorType !== 'none') {
            flavorCount = 1;
        }
    }
    
    // Kontrola aditiv (pouze liquidpro)
    if (formType === 'liquidpro' && recipeData.additives && Array.isArray(recipeData.additives)) {
        hasAdditive = recipeData.additives.some(a => a && a.type && a.type !== 'none' && a.percent > 0);
    }
    
    // Kontrola sladidla (pouze shisha)
    if (formType === 'shisha' && recipeData.sweetener) {
        hasSweetener = recipeData.sweetener.type && recipeData.sweetener.percent > 0;
    }
    
    // Určení obtížnosti
    // Virtuoso: 4 příchutě
    if (flavorCount >= 4) {
        return 'virtuoso';
    }
    
    // Expert: 3 příchutě NEBO aditivum
    if (flavorCount >= 3 || hasAdditive) {
        return 'expert';
    }
    
    // Intermediate: 2 příchutě NEBO sladidlo (shisha)
    if (flavorCount >= 2 || hasSweetener) {
        return 'intermediate';
    }
    
    // Beginner: 1 příchuť nebo méně
    return 'beginner';
}

// Zobrazit modal pro uložení receptu
async function showSaveRecipeModal() {
    // PRO funkce - vyžaduje přihlášení A předplatné
    if (!requireSubscription()) {
        return;
    }
    
    const modal = document.getElementById('saveRecipeModal');
    if (modal) {
        modal.classList.remove('hidden');
        initStarRating();
        
        // Resetovat nadpis a tlačítko na "nový recept" (mohl být změněn úpravou)
        const modalTitle = modal.querySelector('.menu-title');
        if (modalTitle) {
            modalTitle.textContent = t('save_recipe.title', 'Save Recipe');
        }
        const submitBtn = modal.querySelector('button[type="submit"]');
        if (submitBtn) {
            const spanElement = submitBtn.querySelector('span[data-i18n]');
            if (spanElement) {
                spanElement.textContent = t('save_recipe.save_button', 'Save Recipe');
            } else {
                submitBtn.textContent = t('save_recipe.save_button', 'Save Recipe');
            }
        }
        
        // Inicializovat připomínku jako zaškrtnutou s dnešním datem
        initReminderFieldsEnabled();
        
        // Reset blokování veřejného sdílení (mohlo být disabled ze saveSharedRecipe)
        const publicCheckbox = document.getElementById('recipeIsPublic');
        if (publicCheckbox) {
            publicCheckbox.disabled = false;
            publicCheckbox.checked = false;
            const publicToggle = publicCheckbox.closest('.public-recipe-toggle');
            if (publicToggle) {
                publicToggle.classList.remove('disabled');
                publicToggle.title = '';
            }
        }
        
        // Aplikovat překlady na modal
        if (window.i18n && typeof window.i18n.applyTranslations === 'function') {
            window.i18n.applyTranslations();
        }
        
        // Naplnit použité příchutě z receptu
        populateRecipeFlavors();
        
        // Načíst oblíbené produkty pro výběr
        await loadProductsForRecipe();
    }
}

// Vrátit se zpět do kalkulátoru (podle typu formuláře)
function goBackToCalculator() {
    const recipeData = currentRecipeData || {};
    const formType = recipeData.formType || 'liquid';
    
    // Shisha má vlastní stránku
    if (formType === 'shisha') {
        showPage('shisha-form');
        if (recipeData.shishaMode) {
            switchShishaTab(recipeData.shishaMode);
        }
        return;
    }
    
    // Mapovat formType na tab name
    let tabName = 'liquid';
    if (formType === 'snv' || formType === 'shakevape') {
        tabName = 'shakevape';
    } else if (formType === 'pro' || formType === 'liquidpro') {
        tabName = 'liquidpro';
    } else if (formType === 'dilute') {
        tabName = 'dilute';
    }
    
    // Povolit programovou změnu záložky
    window.allowTabSwitch = true;
    
    // Přepnout na správnou záložku a zobrazit formulář
    switchFormTab(tabName);
    showPage('form');
    
    // Vizuálně označit záložky jako disabled v režimu editace
    updateFormTabsState();
}

// Zobrazit modal "Uložit jako nový"
async function showSaveAsNewModal() {
    if (!requireSubscription()) return;
    
    const modal = document.getElementById('saveRecipeModal');
    if (!modal) return;
    
    // Reset editingRecipeId - ukládáme jako nový
    window.editingRecipeId = null;
    
    // Vyčistit název a popis (nový recept)
    document.getElementById('recipeName').value = '';
    document.getElementById('recipeDescription').value = '';
    document.getElementById('recipeRating').value = '0';
    selectedRating = 0;
    updateStarDisplay(0);
    initStarRating();
    
    // Načíst produkty
    await loadProductsForRecipe();
    
    // Předvyplnit produkty z editovaného receptu
    if (window.editingRecipeFromDetail) {
        try {
            const linkedProducts = await window.LiquiMixerDB.getLinkedProducts(
                window.Clerk.user.id, 
                window.editingRecipeFromDetail.id
            );
            for (const product of linkedProducts) {
                addProductRowWithValue(product.id, product.name);
            }
        } catch (error) {
            console.error('Error loading linked products:', error);
        }
    }
    
    // Nastavit nadpis a tlačítko
    const modalTitle = modal.querySelector('.menu-title');
    if (modalTitle) {
        modalTitle.textContent = t('save_recipe.save_as_new', 'Save as new');
    }
    const submitBtn = modal.querySelector('button[type="submit"]');
    if (submitBtn) {
        const spanElement = submitBtn.querySelector('span[data-i18n]');
        if (spanElement) {
            spanElement.textContent = t('save_recipe.save_as_new', 'Save as new');
        }
    }
    
    initReminderFieldsEnabled();
    if (window.i18n && typeof window.i18n.applyTranslations === 'function') {
        window.i18n.applyTranslations();
    }
    
    // Naplnit použité příchutě z receptu
    populateRecipeFlavors();
    
    modal.classList.remove('hidden');
}

// Zobrazit modal "Uložit změny"
async function showSaveChangesModal() {
    if (!requireSubscription()) return;
    
    const modal = document.getElementById('saveRecipeModal');
    if (!modal) return;
    
    let editingRecipe = window.editingRecipeFromDetail;
    
    // Diagnostika
    console.log('[showSaveChangesModal] editingRecipeFromDetail:', editingRecipe);
    console.log('[showSaveChangesModal] currentViewingRecipe:', currentViewingRecipe);
    
    // Fallback - pokud editingRecipeFromDetail není k dispozici, zkusit currentViewingRecipe
    if (!editingRecipe && currentViewingRecipe) {
        console.log('[showSaveChangesModal] Using currentViewingRecipe as fallback');
        editingRecipe = currentViewingRecipe;
        window.editingRecipeFromDetail = editingRecipe;
    }
    
    if (!editingRecipe) {
        // Pokud není editovaný recept, použít normální uložení
        console.warn('[showSaveChangesModal] No editing recipe found, falling back to showSaveRecipeModal');
        showSaveRecipeModal();
        return;
    }
    
    // Nastavit ID pro úpravu
    window.editingRecipeId = editingRecipe.id;
    
    // Předvyplnit údaje z editovaného receptu
    console.log('[showSaveChangesModal] Prefilling form with:', {
        name: editingRecipe.name,
        description: editingRecipe.description,
        rating: editingRecipe.rating
    });
    
    document.getElementById('recipeName').value = editingRecipe.name || '';
    document.getElementById('recipeDescription').value = editingRecipe.description || '';
    document.getElementById('recipeRating').value = editingRecipe.rating || '0';
    selectedRating = parseInt(editingRecipe.rating) || 0;
    updateStarDisplay(selectedRating);
    initStarRating();
    
    // Načíst produkty
    await loadProductsForRecipe();
    
    // Předvyplnit propojené produkty
    try {
        const linkedProducts = await window.LiquiMixerDB.getLinkedProducts(
            window.Clerk.user.id, 
            editingRecipe.id
        );
        for (const product of linkedProducts) {
            addProductRowWithValue(product.id, product.name);
        }
    } catch (error) {
        console.error('Error loading linked products:', error);
    }
    
    // Nastavit nadpis a tlačítko
    const modalTitle = modal.querySelector('.menu-title');
    if (modalTitle) {
        modalTitle.textContent = t('save_recipe.save_changes', 'Save changes');
    }
    const submitBtn = modal.querySelector('button[type="submit"]');
    if (submitBtn) {
        const spanElement = submitBtn.querySelector('span[data-i18n]');
        if (spanElement) {
            spanElement.textContent = t('save_recipe.save_changes', 'Save changes');
        }
    }
    
    // Skrýt pole pro připomínku při úpravě (už existuje)
    const reminderSection = document.querySelector('.reminder-checkbox-container');
    if (reminderSection) {
        reminderSection.style.display = 'none';
    }
    
    if (window.i18n && typeof window.i18n.applyTranslations === 'function') {
        window.i18n.applyTranslations();
    }
    
    // Naplnit použité příchutě z receptu
    populateRecipeFlavors();
    
    modal.classList.remove('hidden');
}

// Produkty pro výběr v receptu
let availableProductsForRecipe = [];
let selectedProductRows = 0;

// Načíst produkty pro výběr v receptu
async function loadProductsForRecipe() {
    const listContainer = document.getElementById('selectedProductsList');
    if (!listContainer) return;
    
    // Reset
    listContainer.innerHTML = '';
    selectedProductRows = 0;
    
    try {
        // Získat ID aktuálně přihlášeného uživatele
        const currentUserId = window.Clerk?.user?.id;
        console.log('[loadProductsForRecipe] Loading products for clerk_id:', currentUserId);
        
        if (!currentUserId) {
            console.warn('[loadProductsForRecipe] No user logged in!');
            availableProductsForRecipe = [];
            return;
        }
        
        const products = await window.LiquiMixerDB.getProducts(currentUserId);
        console.log('[loadProductsForRecipe] Loaded products count:', products?.length || 0);
        availableProductsForRecipe = products || [];
    } catch (error) {
        console.error('Error loading products for recipe:', error);
        availableProductsForRecipe = [];
    }
}

// Počítadlo pro řádky příchutí
let selectedFlavorRows = 0;

// Naplnit příchutě z aktuálního receptu do formuláře ukládání
function populateRecipeFlavors() {
    const listContainer = document.getElementById('selectedFlavorsList');
    if (!listContainer) return;
    
    // Vyčistit seznam
    listContainer.innerHTML = '';
    selectedFlavorRows = 0;
    
    if (!currentRecipeData) {
        listContainer.innerHTML = `<div class="no-flavors-message">${t('save_recipe.no_flavors', 'Recipe contains no flavors')}</div>`;
        return;
    }
    
    const flavors = extractRecipeFlavorsForDisplay(currentRecipeData);
    
    if (flavors.length === 0) {
        listContainer.innerHTML = `<div class="no-flavors-message">${t('save_recipe.no_flavors', 'Recipe contains no flavors')}</div>`;
        return;
    }
    
    // Přidat řádek pro každou příchuť
    flavors.forEach((flavor, index) => {
        addFlavorRowToModal(flavor, index);
    });
}

// Extrahovat příchutě z receptu pro zobrazení v modalu
// Zahrnuje konkrétní příchutě (s názvem) I generické kategorie (bez autocomplete)
function extractRecipeFlavorsForDisplay(recipeData) {
    if (!recipeData) return [];
    
    const flavors = [];
    const formType = recipeData.formType || 'liquid';
    
    // Z ingredients - primární zdroj pro příchutě a Mix tabáky
    // Tweak tabák jde přes tweakState.tobaccoData (samostatná cesta níže)
    if (recipeData.ingredients && Array.isArray(recipeData.ingredients)) {
        for (const ingredient of recipeData.ingredients) {
            if (ingredient.type === 'flavor' || ingredient.ingredientKey === 'flavor' || ingredient.ingredientKey === 'shisha_tobacco' || ingredient.ingredientKey === 'shisha_tweak_flavor' || ingredient.ingredientKey === 'shisha_flavor') {
                if (ingredient.flavorName) {
                    // Konkrétní příchuť s názvem z autocomplete
                    const flavorInfo = {
                        name: ingredient.flavorName,
                        manufacturer: ingredient.flavorManufacturer || null,
                        category: ingredient.flavorType || (ingredient.ingredientKey === 'shisha_tobacco' ? 'tobacco' : 'fruit'),
                        percent: ingredient.percent || 0,
                        flavorId: ingredient.flavorId || null,
                        favoriteProductId: ingredient.favoriteProductId || null,
                        flavorSource: ingredient.flavorSource || 'database'
                    };
                    flavors.push(flavorInfo);
                } else if (ingredient.flavorType && ingredient.flavorType !== 'none') {
                    // Generická kategorie bez konkrétní příchutě — zobrazit název kategorie
                    flavors.push({
                        name: getFlavorName(ingredient.flavorType),
                        manufacturer: null,
                        category: ingredient.flavorType,
                        percent: ingredient.percent || 0,
                        flavorId: null,
                        favoriteProductId: null,
                        flavorSource: 'category'
                    });
                }
            }
        }
    }
    
    // Pokud nebyly nalezeny příchutě v ingredients a existuje flavors array (záložní zdroj)
    if (flavors.length === 0 && (formType === 'liquidpro' || formType === 'shisha') && recipeData.flavors && Array.isArray(recipeData.flavors)) {
        for (const flavor of recipeData.flavors) {
            const flavorName = flavor.flavorName || flavor.name;
            if (flavorName) {
                // Konkrétní příchuť
                const flavorInfo = {
                    name: flavorName,
                    manufacturer: flavor.flavorManufacturer || flavor.manufacturer || null,
                    category: flavor.type,
                    percent: flavor.percent || 0,
                    flavorId: flavor.flavorId || null,
                    favoriteProductId: flavor.favoriteProductId || null,
                    flavorSource: flavor.flavorSource || flavor.source || 'database'
                };
                flavors.push(flavorInfo);
            } else if (flavor.type && flavor.type !== 'none') {
                // Generická kategorie
                flavors.push({
                    name: getFlavorName(flavor.type),
                    manufacturer: null,
                    category: flavor.type,
                    percent: flavor.percent || 0,
                    flavorId: null,
                    favoriteProductId: null,
                    flavorSource: 'category'
                });
            }
        }
    }
    
    // Shisha Tweak: tabák z tweakState.tobaccoData — samostatná položka, netahá se z ingredients
    if (formType === 'shisha' && recipeData.shishaMode === 'tweak' && recipeData.tweakState && recipeData.tweakState.tobaccoData) {
        const td = recipeData.tweakState.tobaccoData;
        if (td.name) {
            const isFavorite = td.source === 'favorites' || td.source === 'favorite';
            flavors.push({
                name: td.name,
                manufacturer: td.manufacturer_code || td.manufacturer || td.brand || null,
                category: 'tobacco',
                percent: 0,
                flavorId: isFavorite ? (td.flavor_id || null) : (td.id || null),
                favoriteProductId: isFavorite ? (td.id || td.favorite_product_id || null) : null,
                flavorSource: isFavorite ? 'favorite' : 'database'
            });
        }
    }
    
    // Pokud je jednoduchý formulář (liquid, shakevape) - pouze pokud má konkrétní příchuť
    if (flavors.length === 0 && recipeData.specificFlavorName) {
        flavors.push({
            name: recipeData.specificFlavorName,
            manufacturer: recipeData.specificFlavorManufacturer || null,
            category: recipeData.flavorType || 'fruit',
            percent: recipeData.flavorPercent || 0,
            flavorId: recipeData.specificFlavorId || null,
            favoriteProductId: recipeData.specificFavoriteProductId || null,
            flavorSource: recipeData.specificFlavorSource || 'database'
        });
    }
    
    return flavors;
}

// Přidat řádek příchutě do modalu ukládání
function addFlavorRowToModal(flavor, index) {
    const listContainer = document.getElementById('selectedFlavorsList');
    if (!listContainer) return;
    
    selectedFlavorRows++;
    const rowId = `flavor-row-${selectedFlavorRows}`;
    
    // Název příchutě - buď konkrétní nebo z číselníku
    let displayName = flavor.name || getFlavorName(flavor.category);
    let manufacturerHtml = '';
    let categoryHtml = '';
    
    if (flavor.manufacturer) {
        manufacturerHtml = `<span class="flavor-item-manufacturer">${escapeHtml(flavor.manufacturer)}</span>`;
    }
    
    // Kategorie zobrazit jen pokud je konkrétní příchuť
    if (flavor.name && flavor.category) {
        categoryHtml = `<span class="flavor-item-category">${getFlavorName(flavor.category)}</span>`;
    }
    
    const percentDisplay = flavor.percent ? `${flavor.percent.toFixed(1)}%` : '';
    
    // Uložit data příchutě do hidden inputu
    const flavorDataJson = JSON.stringify({
        name: flavor.name,
        manufacturer: flavor.manufacturer,
        category: flavor.category,
        percent: flavor.percent,
        flavorId: flavor.flavorId,
        favoriteProductId: flavor.favoriteProductId,
        flavorSource: flavor.flavorSource
    });
    
    const rowHtml = `
        <div class="flavor-item-row" id="${rowId}">
            <input type="hidden" name="recipeFlavors" value='${escapeHtml(flavorDataJson)}'>
            <div class="flavor-item-info">
                <span class="flavor-item-name">${escapeHtml(displayName)}</span>
                ${manufacturerHtml}
                ${categoryHtml}
            </div>
            ${percentDisplay ? `<span class="flavor-item-percent">${percentDisplay}</span>` : ''}
            <button type="button" class="remove-flavor-btn" onclick="removeFlavorRow('${rowId}')" title="${t('common.remove', 'Odebrat')}">✕</button>
        </div>
    `;
    
    listContainer.insertAdjacentHTML('beforeend', rowHtml);
}

// Odebrat řádek příchutě
function removeFlavorRow(rowId) {
    const row = document.getElementById(rowId);
    if (row) {
        row.remove();
        selectedFlavorRows--;
        
        // Pokud nezbyly žádné příchutě, zobrazit zprávu
        const listContainer = document.getElementById('selectedFlavorsList');
        if (listContainer && listContainer.children.length === 0) {
            listContainer.innerHTML = `<div class="no-flavors-message">${t('save_recipe.no_flavors', 'Recipe contains no flavors')}</div>`;
        }
    }
}

// Získat vybrané příchutě z formuláře pro uložení
function getSelectedRecipeFlavors() {
    const inputs = document.querySelectorAll('input[name="recipeFlavors"]');
    const flavors = [];
    
    inputs.forEach((input, index) => {
        try {
            const data = JSON.parse(input.value);
            
            // Určit flavor_id a favorite_product_id
            let flavorId = null;
            let favoriteProductId = null;
            
            // OPRAVA: Správně rozlišit flavor_id (veřejná DB) vs favorite_product_id (uživatelské oblíbené)
            // flavorId je VŽDY UUID z veřejné tabulky 'flavors'
            // favoriteProductId je VŽDY UUID z tabulky 'favorite_products' (uživatelské)
            
            // 1. Přednostně použít explicitní favoriteProductId pokud existuje
            if (data.favoriteProductId) {
                favoriteProductId = data.favoriteProductId;
            }
            
            // 2. flavorId je vždy z veřejné databáze - NIKDY ho nepoužívat jako favoriteProductId
            if (data.flavorId) {
                flavorId = data.flavorId;
            }
            
            // Poznámka: Pokud máme pouze flavorId a source je 'favorite', znamená to že
            // oblíbená příchuť byla vytvořena z veřejné DB - linkFlavorsToRecipe to vyřeší
            // vyhledáním existujícího záznamu v favorite_products podle flavor_id
            
            const isCategory = data.flavorSource === 'category';
            flavors.push({
                position: index + 1,
                percentage: data.percent || 0,
                flavor_name: data.name || null,
                flavor_manufacturer: data.manufacturer || null,
                generic_flavor_type: isCategory ? (data.category || 'fruit') : null,
                flavor_id: flavorId,
                favorite_product_id: favoriteProductId,
                is_category: isCategory
            });
        } catch (e) {
            console.error('Error parsing flavor data:', e);
        }
    });
    
    return flavors;
}

// Přidat řádek pro výběr produktu
function addProductRow() {
    if (availableProductsForRecipe.length === 0) {
        alert(t('save_recipe.no_products', 'You have no favorite products. Add them first in the Favorite Products section.'));
        return;
    }
    
    const listContainer = document.getElementById('selectedProductsList');
    if (!listContainer) return;
    
    selectedProductRows++;
    const rowId = `product-row-${selectedProductRows}`;
    
    const typeIcons = {
        'vg': '💧',
        'pg': '💧',
        'flavor': '🍓',
        'nicotine_booster': '⚗',
        'nicotine_salt': '🧪'
    };
    
    // Vytvořit options pro select
    let optionsHtml = `<option value="">${t('save_recipe.select_product', '-- Vyberte produkt --')}</option>`;
    availableProductsForRecipe.forEach(product => {
        const icon = typeIcons[product.product_type] || '📦';
        optionsHtml += `<option value="${escapeHtml(product.id)}" data-icon="${icon}">${escapeHtml(product.name)}</option>`;
    });
    
    const searchPlaceholder = t('save_recipe.search_product', 'Hledat produkt...');
    const rowHtml = `
        <div class="product-select-row" id="${rowId}">
            <div class="product-select-wrapper">
                <input type="text" class="product-search-input" placeholder="${searchPlaceholder}" oninput="filterProductOptions(this, '${rowId}')">
                <select class="product-select" name="linkedProducts" onchange="onProductSelected(this)">
                    ${optionsHtml}
                </select>
            </div>
            <button type="button" class="remove-product-btn" onclick="removeProductRow('${rowId}')" title="Odebrat">✕</button>
        </div>
    `;
    
    listContainer.insertAdjacentHTML('beforeend', rowHtml);
    
    // Focus na vyhledávací pole
    const row = document.getElementById(rowId);
    if (row) {
        const searchInput = row.querySelector('.product-search-input');
        if (searchInput) searchInput.focus();
    }
}

// Filtrovat produkty podle vyhledávání
function filterProductOptions(searchInput, rowId) {
    const row = document.getElementById(rowId);
    if (!row) return;
    
    const select = row.querySelector('.product-select');
    if (!select) return;
    
    const searchTerm = searchInput.value.toLowerCase();
    const options = select.querySelectorAll('option');
    
    options.forEach(option => {
        if (option.value === '') {
            option.style.display = '';
            return;
        }
        
        const text = option.textContent.toLowerCase();
        option.style.display = text.includes(searchTerm) ? '' : 'none';
    });
}

// Když je vybrán produkt
function onProductSelected(selectElement) {
    const row = selectElement.closest('.product-select-row');
    if (!row) return;
    
    const searchInput = row.querySelector('.product-search-input');
    if (searchInput && selectElement.value) {
        // Zobrazit vybraný název místo vyhledávání
        const selectedOption = selectElement.options[selectElement.selectedIndex];
        searchInput.value = selectedOption.textContent;
    }
}

// Odebrat řádek produktu
function removeProductRow(rowId) {
    const row = document.getElementById(rowId);
    if (row) {
        row.remove();
    }
}

// Skrýt modal pro uložení receptu
function hideSaveRecipeModal() {
    const modal = document.getElementById('saveRecipeModal');
    if (modal) {
        modal.classList.add('hidden');
        // Reset form
        document.getElementById('recipeName').value = '';
        document.getElementById('recipeDescription').value = '';
        document.getElementById('recipeRating').value = '0';
        selectedRating = 0;
        updateStarDisplay(0);
        
        // Reset produktů
        const listContainer = document.getElementById('selectedProductsList');
        if (listContainer) {
            listContainer.innerHTML = '';
        }
        selectedProductRows = 0;
        availableProductsForRecipe = [];
        
        // Reset příchutí
        const flavorListContainer = document.getElementById('selectedFlavorsList');
        if (flavorListContainer) {
            flavorListContainer.innerHTML = '';
        }
        selectedFlavorRows = 0;
        
        // Reset režimu úpravy
        window.editingRecipeId = null;
        window.editingRecipeFromDetail = null;
        
        // Obnovit původní nadpis a tlačítko
        const modalTitle = modal.querySelector('.menu-title');
        if (modalTitle) {
            modalTitle.textContent = t('save_recipe.title', 'Save Recipe');
        }
        
        const submitBtn = modal.querySelector('button[type="submit"]');
        if (submitBtn) {
            const spanElement = submitBtn.querySelector('span[data-i18n]');
            if (spanElement) {
                spanElement.textContent = t('save_recipe.save_button', 'Save Recipe');
            } else {
                submitBtn.textContent = t('save_recipe.save_button', 'Save Recipe');
            }
        }
        
        // Obnovit sekci připomínek
        const reminderSection = document.querySelector('.reminder-checkbox-container');
        if (reminderSection) {
            reminderSection.style.display = '';
        }
    }
}

// Inicializace hvězdičkového hodnocení
function initStarRating() {
    const stars = document.querySelectorAll('#starRating .star');
    stars.forEach(star => {
        star.addEventListener('click', function() {
            selectedRating = parseInt(this.dataset.rating);
            document.getElementById('recipeRating').value = selectedRating;
            updateStarDisplay(selectedRating);
        });
        
        star.addEventListener('mouseenter', function() {
            const rating = parseInt(this.dataset.rating);
            highlightStars(rating);
        });
        
        star.addEventListener('mouseleave', function() {
            highlightStars(selectedRating);
        });
    });
}

function highlightStars(rating) {
    const stars = document.querySelectorAll('#starRating .star');
    stars.forEach(star => {
        const starRating = parseInt(star.dataset.rating);
        if (starRating <= rating) {
            star.classList.add('active');
        } else {
            star.classList.remove('active');
        }
    });
}

function updateStarDisplay(rating) {
    highlightStars(rating);
}

// Extrahovat příchutě z receptu pro uložení do recipe_flavors
function extractRecipeFlavors(recipeData, formType) {
    if (!recipeData) return [];
    
    const flavors = [];
    
    // Extrahovat příchutě z ingredients
    if (recipeData.ingredients && Array.isArray(recipeData.ingredients)) {
        let position = 1;
        for (const ingredient of recipeData.ingredients) {
            if (ingredient.type === 'flavor' || ingredient.ingredientKey === 'flavor' || ingredient.ingredientKey === 'shisha_tweak_flavor' || ingredient.ingredientKey === 'shisha_flavor') {
                const flavorEntry = {
                    position: position++,
                    percentage: ingredient.percent || 0
                };
                
                // Konkrétní příchuť (z databáze nebo oblíbených)
                if (ingredient.flavorName) {
                    flavorEntry.flavor_name = ingredient.flavorName;
                    flavorEntry.flavor_manufacturer = ingredient.flavorManufacturer || null;
                    
                    // Pokud máme flavor_id nebo favorite_product_id
                    if (ingredient.favoriteProductId) {
                        flavorEntry.favorite_product_id = ingredient.favoriteProductId;
                        if (ingredient.flavorId) flavorEntry.flavor_id = ingredient.flavorId;
                    } else if (ingredient.flavorId) {
                        // Rozlišit zdroj (databáze vs oblíbené)
                        if (ingredient.flavorSource === 'favorite') {
                            flavorEntry.favorite_product_id = ingredient.flavorId;
                        } else {
                            flavorEntry.flavor_id = ingredient.flavorId;
                        }
                    }
                } else {
                    // Generická příchuť z číselníku
                    flavorEntry.generic_flavor_type = ingredient.flavorType || 'fruit';
                    flavorEntry.flavor_name = getFlavorName(ingredient.flavorType || 'fruit');
                    flavorEntry.is_category = true;
                }
                
                flavors.push(flavorEntry);
            }
        }
    }
    
    // Extrahovat shisha tabáky (Mode 1: tobacco mix) do recipe_flavors
    if (formType === 'shisha' && recipeData.shishaMode === 'mix' && recipeData.tobaccos && Array.isArray(recipeData.tobaccos)) {
        let position = flavors.length + 1;
        for (const tobacco of recipeData.tobaccos) {
            if (!tobacco || tobacco.percent <= 0) continue;
            const flavorEntry = {
                position: position++,
                percentage: tobacco.percent || 0,
                generic_flavor_type: 'shisha_tobacco'
            };
            if (tobacco.flavorName) {
                flavorEntry.flavor_name = tobacco.flavorName;
                flavorEntry.flavor_manufacturer = tobacco.flavorManufacturer || null;
                if (tobacco.favoriteProductId) {
                    flavorEntry.favorite_product_id = tobacco.favoriteProductId;
                    if (tobacco.flavorId) flavorEntry.flavor_id = tobacco.flavorId;
                } else if (tobacco.flavorId) {
                    if (tobacco.flavorSource === 'favorite') {
                        flavorEntry.favorite_product_id = tobacco.flavorId;
                    } else {
                        flavorEntry.flavor_id = tobacco.flavorId;
                    }
                }
            }
            flavors.push(flavorEntry);
        }
    }
    
    // Extrahovat Shisha Tweak tabák z tweakState.tobaccoData
    if (formType === 'shisha' && recipeData.shishaMode === 'tweak' && recipeData.tweakState && recipeData.tweakState.tobaccoData) {
        const td = recipeData.tweakState.tobaccoData;
        if (td.name) {
            let position = flavors.length + 1;
            const isFavorite = td.source === 'favorites' || td.source === 'favorite';
            const flavorEntry = {
                position: position,
                percentage: 0,
                generic_flavor_type: 'shisha_tobacco',
                flavor_name: td.name,
                flavor_manufacturer: td.manufacturer_code || td.manufacturer || td.brand || null
            };
            if (isFavorite) {
                flavorEntry.favorite_product_id = td.id || td.favorite_product_id || null;
                if (td.flavor_id) flavorEntry.flavor_id = td.flavor_id;
            } else if (td.id) {
                flavorEntry.flavor_id = td.id;
            }
            flavors.push(flavorEntry);
        }
    }
    
    // Extrahovat příchutě z formátů Liquid PRO a Shisha
    if ((formType === 'liquidpro' || formType === 'shisha') && recipeData.flavors && Array.isArray(recipeData.flavors)) {
        let position = flavors.length + 1;
        for (const flavor of recipeData.flavors) {
            if (flavor.type && flavor.type !== 'none') {
                const flavorEntry = {
                    position: position++,
                    percentage: flavor.percent || 0,
                    generic_flavor_type: flavor.type
                };
                
                // Pokud má konkrétní příchuť (podporovat oba formáty: flavorName i name)
                if (flavor.flavorName || flavor.name) {
                    flavorEntry.flavor_name = flavor.flavorName || flavor.name;
                    flavorEntry.flavor_manufacturer = flavor.flavorManufacturer || flavor.manufacturer || null;
                    
                    // Přednostně použít favorite_product_id pokud existuje
                    if (flavor.favoriteProductId) {
                        flavorEntry.favorite_product_id = flavor.favoriteProductId;
                        // Pokud má i flavor_id (veřejná DB), uložit také
                        if (flavor.flavorId) {
                            flavorEntry.flavor_id = flavor.flavorId;
                        }
                    } else if (flavor.flavorId) {
                        if (flavor.flavorSource === 'favorite') {
                            flavorEntry.favorite_product_id = flavor.flavorId;
                        } else {
                            flavorEntry.flavor_id = flavor.flavorId;
                        }
                    }
                } else {
                    // Generická kategorie — přidat přeložený název
                    flavorEntry.flavor_name = getFlavorName(flavor.type);
                    flavorEntry.is_category = true;
                }
                
                // Zamezit duplicitám - pouze pokud je STEJNÁ konkrétní příchuť (flavor_id nebo flavor_name + manufacturer)
                // Generické kategorie mohou být duplicitní (např. 2× fruit s různými příchutěmi)
                let alreadyExists = false;
                if (flavorEntry.flavor_id) {
                    alreadyExists = flavors.some(f => f.flavor_id === flavorEntry.flavor_id);
                } else if (flavorEntry.flavor_name) {
                    alreadyExists = flavors.some(f => 
                        f.flavor_name === flavorEntry.flavor_name && 
                        f.flavor_manufacturer === flavorEntry.flavor_manufacturer
                    );
                }
                
                if (!alreadyExists) {
                    flavors.push(flavorEntry);
                }
            }
        }
    }
    
    // Pokud je jednoduchý formulář s jednou příchutí (liquid, shakevape)
    if (flavors.length === 0 && recipeData.flavorType && recipeData.flavorType !== 'none') {
        const flavorEntry = {
            position: 1,
            percentage: recipeData.flavorPercent || 0,
            generic_flavor_type: recipeData.flavorType
        };
        
        // Konkrétní příchuť pokud byla vybrána
        if (recipeData.specificFlavorName) {
            flavorEntry.flavor_name = recipeData.specificFlavorName;
            flavorEntry.flavor_manufacturer = recipeData.specificFlavorManufacturer || null;
            if (recipeData.specificFlavorId) {
                if (recipeData.specificFlavorSource === 'favorite') {
                    flavorEntry.favorite_product_id = recipeData.specificFlavorId;
                } else {
                    flavorEntry.flavor_id = recipeData.specificFlavorId;
                }
            }
        } else {
            // Generická kategorie bez konkrétní příchutě
            flavorEntry.flavor_name = getFlavorName(recipeData.flavorType);
            flavorEntry.is_category = true;
        }
        
        flavors.push(flavorEntry);
    }
    
    console.log('[extractRecipeFlavors] Extracted:', flavors);
    return flavors;
}

// Uložit recept
async function saveRecipe(event) {
    event.preventDefault();
    
    if (!window.Clerk || !window.Clerk.user) {
        alert(t('alert.login_required_recipe', 'Please sign in to save the recipe.'));
        return false;
    }
    
    const name = document.getElementById('recipeName').value;
    const description = document.getElementById('recipeDescription').value;
    const rating = parseInt(document.getElementById('recipeRating').value) || 0;
    const isPublic = document.getElementById('recipeIsPublic')?.checked || false;
    
    // Kontrola, zda jde o úpravu nebo nový recept
    const isEditing = !!window.editingRecipeId;
    
    // Pro nový recept potřebujeme data receptu
    if (!isEditing && !currentRecipeData) {
        alert(t('recipes.nothing_to_save', 'Error: Nothing to save. Please create a recipe.'));
        return false;
    }
    
    // Určit form_type z currentRecipeData
    let formType = 'liquid';
    if (currentRecipeData) {
        formType = currentRecipeData.formType || currentRecipeData.form_type || 'liquid';
    }
    
    // Automaticky vypočítat difficulty_level pro veřejné recepty
    const difficultyLevel = calculateDifficultyLevel(currentRecipeData);
    
    const recipeData = {
        name: name,
        description: description,
        rating: rating,
        is_public: isPublic,
        public_status: isPublic ? 'pending' : null,
        form_type: formType,
        difficulty_level: difficultyLevel
    };
    
    // Přidat data receptu při vytváření nového i při úpravě
    // (při úpravě mohly být změněny hodnoty formuláře)
    if (currentRecipeData) {
        recipeData.data = currentRecipeData;
    }
    
    try {
        let saved;
        
        if (isEditing) {
            // Aktualizace existujícího receptu
            saved = await window.LiquiMixerDB.updateRecipe(
                window.Clerk.user.id, 
                window.editingRecipeId, 
                recipeData
            );
        } else {
            // Vytvoření nového receptu
            saved = await window.LiquiMixerDB.saveRecipe(window.Clerk.user.id, recipeData);
        }
        
        if (saved) {
            // Uložit propojené produkty
            const selectedProductIds = getSelectedProductIds();
            const recipeId = isEditing ? window.editingRecipeId : saved.id;
            
            // Pokud ukládáme sdílený recept, zkopírovat produkty
            let copiedProductIds = [];
            // Použít UUID receptu (ne share_id) pro načtení produktů
            const sharedRecipeUUID = window.pendingSharedRecipeUUID || (window.currentSharedRecipe ? window.currentSharedRecipe.id : null);
            console.log('[saveRecipe] pendingSharedRecipeUUID:', sharedRecipeUUID, 'isEditing:', isEditing);
            
            if (!isEditing && sharedRecipeUUID) {
                try {
                    // Načíst produkty které zůstaly v DOM (uživatel je neodstranil)
                    const sharedProductInputs = document.querySelectorAll('input[name="sharedProducts"]');
                    const sharedProductIdsFromDOM = Array.from(sharedProductInputs).map(input => input.value);
                    console.log('[saveRecipe] Shared products from DOM:', sharedProductIdsFromDOM);
                    
                    // Zkopírovat pouze produkty které zůstaly v DOM
                    if (sharedProductIdsFromDOM && sharedProductIdsFromDOM.length > 0) {
                        for (const productId of sharedProductIdsFromDOM) {
                            if (!productId) {
                                console.warn('[saveRecipe] Product missing ID');
                                continue;
                            }
                            
                            console.log('[saveRecipe] Copying product:', productId);
                            const copied = await window.LiquiMixerDB.copyProductToUser(productId, window.Clerk.user.id);
                            if (copied && copied.id) {
                                console.log('[saveRecipe] Copied product new ID:', copied.id);
                                copiedProductIds.push(copied.id);
                            } else {
                                console.warn('[saveRecipe] Failed to copy product:', productId);
                            }
                        }
                    }
                    
                    // Vyčistit pending ID
                    window.pendingSharedRecipeUUID = null;
                    window.pendingSharedRecipeId = null;
                } catch (err) {
                    console.error('Error copying products from shared recipe:', err);
                }
            }
            
            // Spojit zkopírované produkty s ručně vybranými
            const allProductIds = [...selectedProductIds, ...copiedProductIds];
            console.log('[saveRecipe] All product IDs to link:', allProductIds);
            
            // Aktualizovat propojené produkty (pokud jsou nějaké)
            if (allProductIds.length > 0) {
                const linkResult = await window.LiquiMixerDB.linkProductsToRecipe(
                    window.Clerk.user.id, 
                    recipeId, 
                    allProductIds
                );
                console.log('[saveRecipe] Link products result:', linkResult);
            }
            
            // Uložit propojené příchutě (z formuláře - uživatel mohl některé odebrat)
            const recipeFlavors = getSelectedRecipeFlavors();
            console.log('[saveRecipe] Flavors from form:', recipeFlavors.length);
            
            // Uložit příchutě do databáze
            const flavorLinkResult = await window.LiquiMixerDB.linkFlavorsToRecipe(
                window.Clerk.user.id,
                recipeId,
                recipeFlavors
            );
            console.log('[saveRecipe] Link flavors result:', flavorLinkResult);
            
            // Uložit připomínku zrání (pouze pro nové recepty)
            let reminderInfo = '';
            if (!isEditing) {
                const reminderData = getReminderDataFromForm();
                if (reminderData) {
                    // Vyžádat povolení notifikací pokud ještě nebylo uděleno
                    if ('Notification' in window && Notification.permission === 'default') {
                        const permissionGranted = await requestNotificationPermissionWithPrompt();
                        if (permissionGranted && window.fcm && window.fcm.getToken) {
                            await window.fcm.getToken();
                        }
                    } else if ('Notification' in window && Notification.permission === 'granted' && window.fcm && window.fcm.getToken) {
                        // Permission already granted — ensure FCM token is registered in DB
                        await window.fcm.getToken();
                    }
                    
                    // Uložit připomínku
                    reminderData.recipe_id = recipeId;
                    reminderData.recipe_name = name;
                    const reminderSaved = await window.LiquiMixerDB.saveReminder(
                        window.Clerk.user.id,
                        reminderData
                    );
                    if (reminderSaved) {
                        const remindDate = new Date(reminderData.remind_at).toLocaleDateString();
                        reminderInfo = `\n🔔 ${t('reminder.reminder_set', 'Reminder set for')} ${remindDate}`;
                    }
                }
            }
            
            // Zobrazit zprávu
            let productInfo = '';
            if (allProductIds.length > 0) {
                productInfo = `\n📦 ${t('save_recipe.products_linked', 'Linked products')}: ${allProductIds.length}`;
                if (copiedProductIds.length > 0) {
                    productInfo += ` (${t('shared_recipe.products_copied', 'copied')}: ${copiedProductIds.length})`;
                }
            }
            
            if (isEditing) {
                alert(t('save_recipe.updated', 'Recipe updated successfully!') + productInfo);
                // Obnovit detail receptu
                await viewRecipeDetail(window.editingRecipeId);
            } else {
                // Pokud ukládáme sdílený recept, přejít na detail nově uloženého
                const wasSharedRecipe = copiedProductIds.length > 0 || window.currentSharedRecipe;
                
                if (wasSharedRecipe && saved.id) {
                    // Vyčistit sdílený recept z paměti
                    window.currentSharedRecipe = null;
                    
                    // Zobrazit krátkou notifikaci a přejít na detail
                    showNotification(t('save_recipe.success', 'Recipe saved successfully!') + productInfo, 'success');
                    hideSaveRecipeModal();
                    resetReminderFields();
                    
                    // Přejít na detail nově uloženého receptu
                    await viewRecipeDetail(saved.id);
                    return false;
                }
                
                const shareUrl = saved.share_url || SHARE_DOMAIN + '/?recipe=' + saved.share_id;
                const successMessage = t('save_recipe.success', 'Recipe saved successfully!') + '\n\n' +
                    t('save_recipe.share_link', 'Share link:') + '\n' + shareUrl + productInfo + reminderInfo;
                alert(successMessage);
            }
            
            hideSaveRecipeModal();
            resetReminderFields();
        } else {
            alert(t('recipes.save_error', 'Error saving recipe.'));
        }
    } catch (error) {
        console.error('Error saving recipe:', error);
        alert(t('recipes.save_error', 'Error saving recipe.'));
    }
    
    return false;
}

// Získat vybrané produkty z select elementů
function getSelectedProductIds() {
    const selects = document.querySelectorAll('select[name="linkedProducts"]');
    const ids = [];
    selects.forEach(select => {
        if (select.value && select.value !== '') {
            ids.push(select.value);
        }
    });
    // Odstranit duplicity
    return [...new Set(ids)];
}

// Zobrazit mé recepty
async function showMyRecipes() {
    hideUserProfileModal();
    
    // PRO funkce - vyžaduje přihlášení A předplatné
    if (!requireSubscription()) {
        return;
    }
    
    const container = document.getElementById('recipesListContainer');
    container.innerHTML = `<p class="no-recipes-text">${t('recipes.loading', 'Loading recipes...')}</p>`;
    
    // Reset vyhledávacích filtrů
    resetRecipeFilters();
    
    showPage('my-recipes');
    
    try {
        const recipes = await window.LiquiMixerDB.getRecipes(window.Clerk.user.id);
        allUserRecipes = recipes || []; // Uložit pro filtrování
        
        // Načíst vyzrálé připomínky pro filtr
        await loadMaturedRecipeIds();
        
        renderRecipesList(allUserRecipes);
    } catch (error) {
        console.error('Error loading recipes:', error);
        container.innerHTML = `<p class="no-recipes-text" style="color: var(--neon-pink);">${t('recipes.load_error', 'Error loading recipes.')}</p>`;
    }
}

// Načíst ID receptů s vyzrálými připomínkami
async function loadMaturedRecipeIds() {
    maturedRecipeIds.clear();
    
    if (!window.Clerk?.user || !window.LiquiMixerDB) return;
    
    try {
        const clerkId = window.Clerk.user.id;
        const reminders = await window.LiquiMixerDB.getUserReminders(clerkId);
        
        if (!reminders || reminders.length === 0) return;
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        // Najít vyzrálé připomínky a uložit jejich recipe_id
        // Filtrovat spotřebované připomínky (consumed_at != null nebo stock_percent <= 0)
        reminders.forEach(r => {
            if ((r.status !== 'pending' && r.status !== 'matured') || !r.recipe_id) return;
            
            // Přeskočit spotřebované připomínky
            if (r.consumed_at != null) return;
            const stockPercent = r.stock_percent ?? 100;
            if (stockPercent <= 0) return;
            
            const remindDate = new Date(r.remind_at);
            remindDate.setHours(0, 0, 0, 0);
            if (remindDate <= today) {
                maturedRecipeIds.add(r.recipe_id);
            }
        });
        
    } catch (error) {
        console.error('Error loading matured recipe IDs:', error);
    }
}

// Reset filtrů vyhledávání receptů
function resetRecipeFilters() {
    const textInput = document.getElementById('recipeSearchText');
    const resultsInfo = document.getElementById('recipeSearchResultsInfo');
    const maturedCheckbox = document.getElementById('recipeShowMatured');
    
    if (textInput) textInput.value = '';
    if (maturedCheckbox) maturedCheckbox.checked = false;
    recipeSearchRatingFilter = 0;
    updateRecipeSearchStarsDisplay(0);
    if (resultsInfo) resultsInfo.textContent = '';
}

// Nastavit filtr hodnocení receptů
function setRecipeSearchRating(rating) {
    // Pokud klikneme na stejné hodnocení, zrušíme filtr
    if (recipeSearchRatingFilter === rating) {
        recipeSearchRatingFilter = 0;
    } else {
        recipeSearchRatingFilter = rating;
    }
    updateRecipeSearchStarsDisplay(recipeSearchRatingFilter);
    filterRecipes();
}

// Zrušit filtr hodnocení receptů
function clearRecipeSearchRating() {
    recipeSearchRatingFilter = 0;
    updateRecipeSearchStarsDisplay(0);
    filterRecipes();
}

// Aktualizovat zobrazení hvězdiček ve vyhledávání receptů
function updateRecipeSearchStarsDisplay(rating) {
    const stars = document.querySelectorAll('#recipeSearchStars .search-star');
    stars.forEach((star, index) => {
        if (index < rating) {
            star.textContent = '★';
            star.classList.add('active');
        } else {
            star.textContent = '☆';
            star.classList.remove('active');
        }
    });
}

// Inicializovat hover efekt pro hvězdičky vyhledávání receptů
function initRecipeSearchStarsHover() {
    const starsContainer = document.getElementById('recipeSearchStars');
    if (!starsContainer) return;
    
    const stars = starsContainer.querySelectorAll('.search-star');
    
    stars.forEach((star, index) => {
        star.addEventListener('mouseenter', () => {
            stars.forEach((s, i) => {
                if (i <= index) {
                    s.classList.add('hover');
                } else {
                    s.classList.remove('hover');
                }
            });
        });
        
        star.addEventListener('mouseleave', () => {
            stars.forEach(s => s.classList.remove('hover'));
        });
    });
}

// Filtrovat recepty
function filterRecipes() {
    const searchText = (document.getElementById('recipeSearchText')?.value || '').toLowerCase().trim();
    const showMaturedOnly = document.getElementById('recipeShowMatured')?.checked || false;
    
    let filtered = allUserRecipes.filter(recipe => {
        // Textový filtr (název a popis)
        if (searchText) {
            const name = (recipe.name || '').toLowerCase();
            const description = (recipe.description || '').toLowerCase();
            if (!name.includes(searchText) && !description.includes(searchText)) {
                return false;
            }
        }
        
        // Filtr hodnocení (min. hodnocení)
        if (recipeSearchRatingFilter > 0) {
            const recipeRating = parseInt(recipe.rating) || 0;
            if (recipeRating < recipeSearchRatingFilter) {
                return false;
            }
        }
        
        // Filtr vyzrálých - zobrazit pouze recepty s vyzrálou připomínkou
        if (showMaturedOnly) {
            if (!maturedRecipeIds.has(recipe.id)) {
                return false;
            }
        }
        
        return true;
    });
    
    // Zobrazit info o výsledcích
    const resultsInfo = document.getElementById('recipeSearchResultsInfo');
    if (resultsInfo) {
        const hasFilters = searchText || recipeSearchRatingFilter > 0 || showMaturedOnly;
        if (hasFilters) {
            if (filtered.length === 0) {
                const noResultsText = showMaturedOnly 
                    ? t('recipes.no_matured', 'No matured liquids.')
                    : t('recipes.no_filter_results', 'No recipes match the filters.');
                resultsInfo.textContent = noResultsText;
                resultsInfo.className = 'search-results-info no-results';
            } else {
                resultsInfo.textContent = `${t('recipes.found', 'Found')} ${filtered.length} ${t('recipes.of', 'of')} ${allUserRecipes.length} ${t('recipes.recipes_count', 'recipes')}.`;
                resultsInfo.className = 'search-results-info has-results';
            }
        } else {
            resultsInfo.textContent = '';
            resultsInfo.className = 'search-results-info';
        }
    }
    
    renderRecipesList(filtered);
}

// Vykreslit seznam receptů
function renderRecipesList(recipes) {
    const container = document.getElementById('recipesListContainer');

    if (!recipes || recipes.length === 0) {
        container.innerHTML = `<p class="no-recipes-text">${t('recipes.no_recipes', 'You have no saved recipes yet.')}</p>`;
        return;
    }
    
    let html = '<div class="recipes-list">';
    
    recipes.forEach(recipe => {
        // Validace ID před použitím
        if (!isValidUUID(recipe.id)) return;
        
        const rating = Math.min(Math.max(parseInt(recipe.rating) || 0, 0), 5);
        const stars = '★'.repeat(rating) + '☆'.repeat(5 - rating);
        const date = new Date(recipe.created_at).toLocaleDateString('cs-CZ');
        const data = recipe.recipe_data || {};
        
        // Zkontrolovat zda je recept vyzrálý
        const isMatured = maturedRecipeIds.has(recipe.id);
        const maturedBadge = isMatured ? `<span class="recipe-matured-badge">${t('reminder.matured', 'Matured')}</span>` : '';
        
        // SECURITY: Escapování všech uživatelských dat
        const safeName = escapeHtml(recipe.name);
        const safeDescription = escapeHtml(recipe.description);
        const rawTotal = data.totalAmount;
        const safeTotal = escapeHtml(rawTotal != null ? (Number.isInteger(+rawTotal) ? rawTotal : parseFloat(rawTotal).toFixed(2)) : '?');
        const safeVg = escapeHtml(data.vgPercent || '?');
        const safePg = escapeHtml(data.pgPercent || '?');
        
        html += `
            <div class="recipe-card rating-${rating}${isMatured ? ' matured' : ''}" onclick="viewRecipeDetail('${recipe.id}')">
                <div class="recipe-card-header">
                    <h3 class="recipe-card-title">${safeName}</h3>
                    ${maturedBadge}
                    <span class="recipe-card-rating">${stars}</span>
                </div>
                ${safeDescription ? `<p class="recipe-card-description">${safeDescription}</p>` : ''}
                <div class="recipe-card-meta">
                    <span>📅 ${date}</span>
                    <span>💧 ${safeTotal} ml</span>
                    <span>⚖️ ${safeVg}:${safePg}</span>
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    container.innerHTML = html;
}

// Zobrazit detail receptu
async function viewRecipeDetail(recipeId) {
    if (!window.Clerk || !window.Clerk.user) return;
    
    // SECURITY: Validace UUID formátu
    if (!isValidUUID(recipeId)) {
        console.error('Invalid recipe ID format');
        return;
    }
    
    try {
        const recipe = await window.LiquiMixerDB.getRecipeById(window.Clerk.user.id, recipeId);
        
        if (!recipe) {
            alert(t('recipes.not_found', 'Recept nenalezen.'));
            return;
        }
        
        currentViewingRecipe = recipe;
        window.currentViewingRecipe = recipe; // Export pro připomínky
        
        // Načíst propojené produkty
        const linkedProducts = await window.LiquiMixerDB.getLinkedProducts(window.Clerk.user.id, recipeId);
        
        // Načíst propojené příchutě
        let linkedFlavors = [];
        try {
            linkedFlavors = await window.LiquiMixerDB.getLinkedFlavors(recipeId);
        } catch (err) {
            console.error('Error loading linked flavors:', err);
        }
        
        displayRecipeDetail(recipe, 'recipeDetailTitle', 'recipeDetailContent', linkedProducts, false, linkedFlavors);
        showPage('recipe-detail');
        
    } catch (error) {
        console.error('Error loading recipe:', error);
        alert(t('recipes.load_error', 'Error loading recipe.'));
    }
}

// Zobrazit detail receptu (sdílené funkce)
// isShared = true znamená, že jde o sdílený recept jiného uživatele
function displayRecipeDetail(recipe, titleId, contentId, linkedProducts = [], isShared = false, linkedFlavors = []) {
    const titleEl = document.getElementById(titleId);
    const contentEl = document.getElementById(contentId);
    
    // SECURITY: Použít textContent místo innerHTML pro název
    titleEl.textContent = recipe.name;
    // Odstranit data-i18n aby i18n systém nepřepsal název receptu
    titleEl.removeAttribute('data-i18n');
    
    const rating = Math.min(Math.max(parseInt(recipe.rating) || 0, 0), 5);
    const stars = '★'.repeat(rating) + '☆'.repeat(5 - rating);
    // Použít aktuální locale pro formátování data
    const currentLocale = window.i18n?.currentLocale || 'cs';
    const date = new Date(recipe.created_at).toLocaleDateString(currentLocale);
    const data = recipe.recipe_data || {};
    
    // SECURITY: Escapování popisku
    const safeDescription = escapeHtml(recipe.description);
    
    let ingredientsHtml = '';
    const ingredients = data.ingredients || [];
    if (ingredients && Array.isArray(ingredients) && ingredients.length > 0) {
        ingredientsHtml = `
            <h4 class="recipe-ingredients-title">${t('recipe_detail.ingredients_title', 'Ingredients')}</h4>
            <div class="results-table-container">
                <table class="results-table">
                    <thead>
                        <tr>
                            <th>${t('recipe_detail.table_component', 'Component')}</th>
                            <th>${t('recipe_detail.table_volume', 'Volume (ml)')}</th>
                            <th>${t('recipe_detail.table_grams', 'Grams')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${(data.formType === 'shisha' && data.shishaMode === 'tweak' && data.tobaccoName) ? `
                        <tr>
                            <td class="ingredient-name">${escapeHtml(data.tobaccoName)} <span class="ingredient-percent-inline">(0.0%)</span></td>
                            <td class="ingredient-value">—</td>
                            <td class="ingredient-grams">${parseFloat(data.tobaccoAmount || 0).toFixed(1)}</td>
                        </tr>` : ''}
                        ${ingredients.map(ing => {
                            // Dynamicky přeložit název ingredience
                            const ingredientName = escapeHtml(getIngredientName(ing));
                            // Vypočítat gramy — shisha recepty mají předpočítané grams
                            const isShishaRecipe = data.formType === 'shisha';
                            const grams = (isShishaRecipe && ing.grams !== undefined) ? parseFloat(ing.grams).toFixed(1) : calculateIngredientGrams(ing);
                            const vol = parseFloat(ing.volume || 0);
                            const volText = (isShishaRecipe && vol === 0) ? '—' : vol.toFixed(2);
                            const percentInline = `<span class="ingredient-percent-inline">(${parseFloat(ing.percent || 0).toFixed(1)}%)</span>`;
                            return `
                            <tr>
                                <td class="ingredient-name">${ingredientName} ${percentInline}</td>
                                <td class="ingredient-value">${volText}</td>
                                <td class="ingredient-grams">${grams}</td>
                            </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }
    
    // Propojené produkty
    let linkedProductsHtml = '';
    if (linkedProducts && linkedProducts.length > 0) {
        const typeIcons = {
            'vg': '💧',
            'pg': '💧',
            'flavor': '🍓',
            'nicotine_booster': '⚗',
            'nicotine_salt': '🧪'
        };
        
        // Pro sdílené recepty použít viewSharedProductDetail (read-only)
        const productClickHandler = isShared ? 'viewSharedProductDetail' : 'viewProductDetail';
        
        linkedProductsHtml = `
            <div class="recipe-linked-products">
                <h4 class="recipe-ingredients-title">${t('recipe_detail.linked_products', 'Linked products')}</h4>
                <div class="linked-products-list">
                    ${linkedProducts.map(product => {
                        const icon = typeIcons[product.product_type] || '📦';
                        const productRating = Math.min(Math.max(parseInt(product.rating) || 0, 0), 5);
                        const productStars = '★'.repeat(productRating) + '☆'.repeat(5 - productRating);
                        return `
                            <div class="linked-product-item" onclick="${productClickHandler}('${escapeHtml(product.id)}')">
                                <span class="linked-product-icon">${icon}</span>
                                <span class="linked-product-name">${escapeHtml(product.name)}</span>
                                <span class="linked-product-rating">${productStars}</span>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    }
    
    // Propojené příchutě
    let linkedFlavorsHtml = '';
    if (linkedFlavors && linkedFlavors.length > 0) {
        // Uložit linkedFlavors do globální proměnné pro přístup z onclick
        window._currentLinkedFlavors = linkedFlavors;
        
        linkedFlavorsHtml = `
            <div class="recipe-linked-flavors">
                <h4 class="recipe-ingredients-title">${t('recipe_detail.used_flavors', 'Used flavors')}</h4>
                <div class="linked-flavors-list">
                    ${linkedFlavors.map((flavorLink, index) => {
                        // Získat název a výrobce
                        const flavorName = flavorLink.flavor_name || flavorLink.flavor?.name || '?';
                        const manufacturer = flavorLink.flavor?.manufacturer_name || flavorLink.flavor?.manufacturer_code || '';
                        const displayName = manufacturer ? `${flavorName} (${manufacturer})` : flavorName;
                        const percentDisplay = flavorLink.percentage ? ` - ${flavorLink.percentage}%` : '';
                        
                        // Získat flavor_id a favorite_product_id
                        const flavorId = flavorLink.flavor_id || flavorLink.flavor?.id || null;
                        const favoriteProductId = flavorLink.favorite_product_id || null;
                        
                        // Pro vlastní recepty (ne sdílené) s favorite_product_id použít viewProductDetail
                        // Pro sdílené recepty nebo příchutě z veřejné DB použít showFlavorDetailFromRecipe
                        let clickAttr;
                        if (!isShared && favoriteProductId) {
                            // Vlastní recept s uloženým produktem -> zobrazit z mých oblíbených
                            clickAttr = `onclick="viewProductDetail('${escapeHtml(favoriteProductId)}')"`;
                        } else {
                            // Sdílený recept nebo veřejná příchuť -> zobrazit detail příchutě
                            const flavorIdParam = flavorId ? `'${escapeHtml(flavorId)}'` : 'null';
                            clickAttr = `onclick="showFlavorDetailFromRecipe(${flavorIdParam}, window._currentLinkedFlavors[${index}], ${isShared})"`;
                        }
                        const cursorClass = 'clickable';
                        
                        return `
                            <div class="linked-flavor-item ${cursorClass}" ${clickAttr}>
                                <span class="linked-flavor-icon">🍓</span>
                                <span class="linked-flavor-name">${escapeHtml(displayName)}${percentDisplay}</span>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    }
    
    // SECURITY: Escapování všech hodnot z databáze
    const safeTotal = escapeHtml(data.totalAmount || '?');
    // VG/PG: po migraci používáme jednotný klíč vgPercent
    const vgVal = data.vgPercent ?? data.ratio;
    const pgVal = data.pgPercent ?? (vgVal != null ? (100 - vgVal) : undefined);
    const safeVg = escapeHtml(vgVal != null ? String(vgVal) : '?');
    const safePg = escapeHtml(pgVal != null ? String(pgVal) : '?');
    // Zaokrouhlit nikotin na 2 desetinná místa - po migraci používáme jednotný klíč nicotine
    const nicotineValue = parseFloat(data.nicotine ?? 0);
    const safeNicotine = escapeHtml(nicotineValue.toFixed(2));
    
    // Steep days z uloženého receptu
    const recipeSteepDays = typeof getMaxSteepingDaysFromRecipe === 'function' ? getMaxSteepingDaysFromRecipe(data) : (data.steepDays || 0);
    let steepDaysHtml = '';
    if (recipeSteepDays > 0) {
        const daysText = recipeSteepDays === 1 ? t('common.day', 'den') : 
            (recipeSteepDays >= 2 && recipeSteepDays <= 4) ? t('common.days_few', 'dny') : t('common.days', 'dní');
        steepDaysHtml = `
            <div class="recipe-info-item">
                <div class="recipe-info-label">${t('results.steeping', 'Doba zrání:')}</div>
                <div class="recipe-info-value">${recipeSteepDays} ${escapeHtml(daysText)}</div>
            </div>`;
    }
    
    contentEl.innerHTML = `
        <div class="recipe-detail-header">
            <div class="recipe-detail-rating">${stars}</div>
            ${safeDescription ? `<p class="recipe-detail-description">${safeDescription}</p>` : ''}
        </div>
        
        <div class="recipe-detail-info">
            <div class="recipe-info-item total-volume-highlight">
                <div class="recipe-info-label volume-label">${t('recipe_detail.total_volume', 'Total volume')}</div>
                <div class="recipe-info-value volume-value">${safeTotal} ml</div>
            </div>
            <div class="recipe-info-item">
                <div class="recipe-info-label">${t('recipe_detail.ratio', 'VG/PG Ratio')}</div>
                <div class="recipe-info-value">${safeVg}:${safePg}</div>
            </div>
            <div class="recipe-info-item">
                <div class="recipe-info-label">${t('recipe_detail.nicotine', 'Nikotin')}</div>
                <div class="recipe-info-value">${safeNicotine} mg/ml</div>
            </div>
            ${steepDaysHtml}
        </div>
        
        ${ingredientsHtml}
        ${linkedProductsHtml}
        ${linkedFlavorsHtml}
        
        <div class="recipe-meta-info">
            <p class="recipe-date">${t('recipe_detail.created', 'Created')}: ${date}</p>
        </div>
        
        <!-- Sekce připomínek zrání - pouze pro vlastní recepty -->
        ${contentId === 'recipeDetailContent' ? `
        <div class="reminders-section">
            <h4 class="reminders-title">${t('recipe_detail.reminders_title', 'Steeping reminders')}</h4>
            <div class="reminders-list" id="remindersList-${escapeHtml(recipe.id)}">
                <div class="no-reminders">${t('recipe_detail.no_reminders', 'No reminders. Click button below to add.')}</div>
            </div>
            <button type="button" class="add-reminder-btn" onclick="showAddReminderModal('${escapeHtml(recipe.id)}')">
                + ${t('recipe_detail.add_reminder', 'Add new mixing')}
            </button>
        </div>
        ` : ''}
    `;
    
    // Načíst připomínky pro vlastní recepty
    if (contentId === 'recipeDetailContent' && recipe.id) {
        setTimeout(() => loadRecipeReminders(recipe.id), 100);
    }
}

// Upravit uložený recept - otevře kalkulátor s předvyplněnými hodnotami
async function editSavedRecipe() {
    if (!currentViewingRecipe) return;
    
    if (!window.Clerk || !window.Clerk.user) {
        alert(t('alert.login_required_edit', 'Please sign in to edit the recipe.'));
        return;
    }
    
    // Uložit ID editovaného receptu pro pozdější použití
    window.editingRecipeFromDetail = currentViewingRecipe;
    
    const recipeData = currentViewingRecipe.recipe_data || {};
    
    // Načíst propojené příchutě z recipe_flavors tabulky
    let linkedFlavors = [];
    try {
        linkedFlavors = await window.LiquiMixerDB.getLinkedFlavors(currentViewingRecipe.id);
        console.log('editSavedRecipe: Loaded linked flavors:', linkedFlavors);
    } catch (error) {
        console.error('editSavedRecipe: Error loading linked flavors:', error);
    }
    
    // Určit typ formuláře
    const formType = recipeData.formType || 'liquid';
    
    // Povolit programovou změnu záložky
    window.allowTabSwitch = true;
    
    // Reset autocomplete inputů před prefill (zabránit přenesení dat z předchozího receptu)
    const autocompletesToReset = [
        'flavorAutocomplete',
        'proFlavorAutocomplete1', 'proFlavorAutocomplete2', 'proFlavorAutocomplete3', 'proFlavorAutocomplete4',
        'shTweakFlavorAutocomplete1', 'shTweakFlavorAutocomplete2', 'shTweakFlavorAutocomplete3', 'shTweakFlavorAutocomplete4',
        'shDiyFlavorAutocomplete1', 'shDiyFlavorAutocomplete2', 'shDiyFlavorAutocomplete3', 'shDiyFlavorAutocomplete4',
        'shMolFlavorAutocomplete1', 'shMolFlavorAutocomplete2', 'shMolFlavorAutocomplete3', 'shMolFlavorAutocomplete4'
    ];
    autocompletesToReset.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.value = '';
            delete el.dataset.flavorId;
            delete el.dataset.favoriteProductId;
            delete el.dataset.flavorSource;
            delete el.dataset.flavorData;
            // Odblokovat kategorie select (mohl zůstat disabled z předchozí editace)
            if (typeof updateFlavorCategoryState === 'function') {
                updateFlavorCategoryState(id, false);
            }
        }
    });
    
    // Předvyplnit formulář podle typu a přepnout záložku
    if (formType === 'shakevape' || formType === 'snv') {
        prefillSnvForm(recipeData, linkedFlavors);
        switchFormTab('shakevape');
    } else if (formType === 'liquidpro' || formType === 'pro') {
        prefillProForm(recipeData, linkedFlavors);
        switchFormTab('liquidpro');
    } else if (formType === 'shortfill') {
        prefillShortfillForm(recipeData);
        switchFormTab('shortfill');
    } else if (formType === 'shisha') {
        const shishaMode = recipeData.shishaMode || 'mix';
        if (shishaMode === 'diy') {
            prefillShishaDiyForm(recipeData, linkedFlavors);
        } else if (shishaMode === 'tweak') {
            prefillShishaTweakForm(recipeData, linkedFlavors);
        } else if (shishaMode === 'molasses') {
            prefillShishaMolassesForm(recipeData, linkedFlavors);
        } else {
            prefillShishaMixForm(recipeData, linkedFlavors);
        }
        // Shisha má vlastní stránku (shisha-form), ne záložku v #form
        showPage('shisha-form');
        updateShishaTabsState();
        return;
    } else {
        prefillLiquidForm(recipeData, linkedFlavors);
        switchFormTab('liquid');
    }
    
    // Zobrazit stránku formuláře
    showPage('form');
    
    // Označit záložky jako disabled (kromě aktuální)
    updateFormTabsState();
}

// Předvyplnit Liquid formulář
function prefillLiquidForm(data, linkedFlavors = []) {
    // Obnovit příznak ručního doladění VG/PG PŘED voláním update funkcí
    // Pokud flag existuje v datech, použít ho; pokud ne (starý recept), odvodit z premixed + vgPercent
    if (data.manuallyChangedRatio !== undefined) {
        liquidUserManuallyChangedRatio = !!data.manuallyChangedRatio;
    } else if (data.baseType === 'premixed' && data.vgPercent !== undefined) {
        liquidUserManuallyChangedRatio = true;
    }
    _prefillingSavedRecipe = true;
    if (data.totalAmount) {
        document.getElementById('totalAmount').value = data.totalAmount;
    }
    
    // Base type
    if (data.baseType) {
        updateBaseType(data.baseType);
        if (data.baseType === 'premixed' && data.premixedRatio) {
            updatePremixedRatio(data.premixedRatio);
        }
    }
    
    if (data.vgPercent !== undefined) {
        document.getElementById('vgPgRatio').value = data.vgPercent;
        updateRatioDisplay();
    }
    
    // Nikotin — typ, síla báze, VG/PG poměr báze, cílová hodnota
    const nicType = data.nicotineType || 'none';
    const nicTypeEl = document.getElementById('nicotineType');
    if (nicTypeEl) {
        nicTypeEl.value = nicType;
        updateNicotineType();
    }
    if (nicType !== 'none' && data.nicotine !== undefined && data.nicotine > 0) {
        const nicEl = document.getElementById('targetNicotine');
        if (nicEl) nicEl.value = data.nicotine;
        if (data.nicotineBaseStrength) {
            const bsEl = document.getElementById('nicotineBaseStrength');
            if (bsEl) bsEl.value = data.nicotineBaseStrength;
        }
        if (data.nicotineRatio) {
            const nrEl = document.getElementById('nicotineRatio');
            if (nrEl) nrEl.value = data.nicotineRatio;
            // Aktualizovat active class na toggle buttons
            const btn5050 = document.getElementById('ratio5050');
            const btn7030 = document.getElementById('ratio7030');
            if (btn5050 && btn7030) {
                btn5050.classList.toggle('active', data.nicotineRatio === '50/50');
                btn7030.classList.toggle('active', data.nicotineRatio === '70/30');
            }
        }
        updateNicotineDisplay();
    }
    
    // Příchuť — typ, procento, VG/PG poměr
    if (data.flavorType && data.flavorType !== 'none') {
        document.getElementById('flavorType').value = data.flavorType;
        if (data.flavorPercent !== undefined) {
            document.getElementById('flavorStrength').value = data.flavorPercent;
        }
        updateFlavorType();
    }
    if (data.flavorRatio) {
        const frEl = document.getElementById('flavorRatio');
        if (frEl) { frEl.value = data.flavorRatio; updateFlavorDisplay(); }
        // Aktualizovat active class na flavor ratio toggle buttons
        const fr0100 = document.getElementById('flavorRatio0100');
        const fr8020 = document.getElementById('flavorRatio8020');
        const fr7030 = document.getElementById('flavorRatio7030');
        if (fr0100 && fr8020 && fr7030) {
            fr0100.classList.toggle('active', data.flavorRatio === '0/100');
            fr8020.classList.toggle('active', data.flavorRatio === '80/20');
            fr7030.classList.toggle('active', data.flavorRatio === '70/30');
        }
    }
    
    // Předvyplnit konkrétní příchuť — prioritně z linkedFlavors, fallback na recipe_data
    let flavorLinkToUse = (linkedFlavors && linkedFlavors.length > 0) ? linkedFlavors[0] : null;
    
    // Fallback: pokud linkedFlavors je prázdný ale recipe_data má konkrétní příchuť
    if (!flavorLinkToUse && data.specificFlavorName) {
        flavorLinkToUse = {
            flavor_name: data.specificFlavorName,
            flavor_manufacturer: data.specificFlavorManufacturer || null,
            flavor_id: data.specificFlavorSource === 'favorite' ? null : (data.specificFlavorId || null),
            favorite_product_id: data.specificFlavorSource === 'favorite' ? (data.specificFavoriteProductId || data.specificFlavorId || null) : null,
            flavor_source: data.specificFlavorSource || 'database',
            generic_flavor_type: data.flavorType || 'fruit',
            percentage: data.flavorPercent || 0
        };
        console.log('prefillLiquidForm: Using recipe_data fallback for flavor:', flavorLinkToUse.flavor_name);
    }
    
    if (flavorLinkToUse) {
        console.log('prefillLiquidForm: flavorLinkToUse:', JSON.stringify(flavorLinkToUse, null, 2));
        
        // prefillFlavorAutocomplete vrátí null pro kategorie (přeskočí je)
        const result = prefillFlavorAutocomplete('flavorAutocomplete', flavorLinkToUse);
        
        if (!result) {
            // Kategorie — autocomplete přeskočen, nastavit procento do slideru
            // DŮLEŽITÉ: nastavit AFTER updateFlavorType (ten resetuje na 0%)
            console.log('prefillLiquidForm: Category flavor, setting percentage:', flavorLinkToUse.percentage);
            if (flavorLinkToUse.percentage) {
                const slider = document.getElementById('flavorStrength');
                const valueDisplay = document.getElementById('flavorValue');
                slider.value = flavorLinkToUse.percentage;
                if (valueDisplay) {
                    const displayValue = Number.isInteger(flavorLinkToUse.percentage) ? flavorLinkToUse.percentage : flavorLinkToUse.percentage.toFixed(1);
                    valueDisplay.textContent = displayValue;
                }
                updateFlavorDisplay();
            }
        }
    }
    
    _prefillingSavedRecipe = false;
    updateVgPgRatioLimits();
}

// Předvyplnit Shake & Vape formulář
function prefillSnvForm(data, linkedFlavors = []) {
    // Obnovit příznak ručního doladění VG/PG PŘED voláním update funkcí
    // Pokud flag existuje v datech, použít ho; pokud ne (starý recept), odvodit z premixed + vgPercent
    if (data.manuallyChangedRatio !== undefined) {
        shakevapeUserManuallyChangedRatio = !!data.manuallyChangedRatio;
    } else if (data.baseType === 'premixed' && data.vgPercent !== undefined) {
        shakevapeUserManuallyChangedRatio = true;
    }
    _prefillingSavedRecipe = true;
    if (data.totalAmount) {
        const el = document.getElementById('svTotalAmount');
        if (el) el.value = data.totalAmount;
    }
    
    // Base type
    if (data.baseType) {
        if (typeof updateSvBaseType === 'function') updateSvBaseType(data.baseType);
        if (data.baseType === 'premixed' && data.premixedRatio) {
            if (typeof updateSvPremixedRatio === 'function') updateSvPremixedRatio(data.premixedRatio);
        }
    }
    
    if (data.vgPercent !== undefined) {
        const el = document.getElementById('svVgPgRatio');
        if (el) {
            el.value = data.vgPercent;
            updateSvRatioDisplay();
        }
    }
    
    // Nikotin — typ, síla báze, VG/PG poměr báze, cílová hodnota
    const nicType = data.nicotineType || 'none';
    const typeEl = document.getElementById('svNicotineType');
    if (typeEl) {
        typeEl.value = nicType;
        updateSvNicotineType();
    }
    if (nicType !== 'none' && data.nicotine !== undefined && data.nicotine > 0) {
        const nicEl = document.getElementById('svTargetNicotine');
        if (nicEl) nicEl.value = data.nicotine;
        if (data.nicotineBaseStrength) {
            const bsEl = document.getElementById('svNicotineBaseStrength');
            if (bsEl) bsEl.value = data.nicotineBaseStrength;
        }
        if (data.nicotineRatio) {
            const nrEl = document.getElementById('svNicotineRatio');
            if (nrEl) nrEl.value = data.nicotineRatio;
            // Aktualizovat active class na toggle buttons
            const sv5050 = document.getElementById('svRatio5050');
            const sv7030 = document.getElementById('svRatio7030');
            if (sv5050 && sv7030) {
                sv5050.classList.toggle('active', data.nicotineRatio === '50/50');
                sv7030.classList.toggle('active', data.nicotineRatio === '70/30');
            }
        }
        if (typeof updateSvNicotineDisplay === 'function') updateSvNicotineDisplay();
    }
    
    // Aroma objem
    if (data.flavorVolume !== undefined) {
        const el = document.getElementById('svFlavorVolume');
        if (el) el.value = data.flavorVolume;
    }
    // Aroma VG/PG poměr
    if (data.flavorRatio) {
        const frEl = document.getElementById('svFlavorRatio');
        if (frEl) frEl.value = data.flavorRatio;
        // Aktualizovat active class na flavor ratio toggle buttons
        const svFr0100 = document.getElementById('svFlavorRatio0100');
        const svFr8020 = document.getElementById('svFlavorRatio8020');
        const svFr7030 = document.getElementById('svFlavorRatio7030');
        if (svFr0100 && svFr8020 && svFr7030) {
            svFr0100.classList.toggle('active', data.flavorRatio === '0/100');
            svFr8020.classList.toggle('active', data.flavorRatio === '80/20');
            svFr7030.classList.toggle('active', data.flavorRatio === '70/30');
        }
    }
    
    // Aktualizovat limity
    _prefillingSavedRecipe = false;
    updateSvVgPgLimits();
}

// Předvyplnit Shortfill formulář
function prefillShortfillForm(data) {
    const dom = data._dom || {};
    const bottleEl = document.getElementById('sfBottleVolume');
    const liquidEl = document.getElementById('sfLiquidVolume');
    const nicEl = document.getElementById('sfNicStrength');
    const shotVolEl = document.getElementById('sfNicShotVolume');
    const shotCountEl = document.getElementById('sfShotCountValue');
    const shotCountDisplay = document.getElementById('sfShotCount');
    
    if (bottleEl && dom.bottleVolume) bottleEl.value = dom.bottleVolume;
    if (liquidEl && dom.liquidVolume) liquidEl.value = dom.liquidVolume;
    if (nicEl && dom.nicStrength) nicEl.value = dom.nicStrength;
    if (shotVolEl && dom.nicShotVolume) shotVolEl.value = dom.nicShotVolume;
    if (shotCountEl && dom.shotCount) {
        shotCountEl.value = dom.shotCount;
        if (shotCountDisplay) shotCountDisplay.textContent = dom.shotCount;
    }
    
    // Přepočítat náhled
    if (typeof calculateShortfill === 'function') calculateShortfill();
}

// Předvyplnit Liquid PRO formulář
function prefillProForm(data, linkedFlavors = []) {
    // Obnovit příznak ručního doladění VG/PG PŘED voláním update funkcí
    // Pokud flag existuje v datech, použít ho; pokud ne (starý recept), odvodit z premixed + vgPercent
    if (data.manuallyChangedRatio !== undefined) {
        proUserManuallyChangedRatio = !!data.manuallyChangedRatio;
    } else if (data.baseType === 'premixed' && data.vgPercent !== undefined) {
        proUserManuallyChangedRatio = true;
    }
    _prefillingSavedRecipe = true;
    if (data.totalAmount) {
        const el = document.getElementById('proTotalAmount');
        if (el) el.value = data.totalAmount;
    }
    
    // Base type
    if (data.baseType) {
        updateProBaseType(data.baseType);
        if (data.baseType === 'premixed' && data.premixedRatio) {
            // Check if it's custom ratio
            const standardRatios = ['50/50', '60/40', '70/30', '80/20'];
            if (standardRatios.includes(data.premixedRatio)) {
                updateProPremixedRatio(data.premixedRatio);
            } else {
                // DŮLEŽITÉ: Nejdříve nastavit hodnotu VG, pak teprve volat updateProPremixedRatio
                const parts = data.premixedRatio.split('/');
                const vgEl = document.getElementById('proCustomPremixedVg');
                if (vgEl) vgEl.value = parseInt(parts[0]) || 65;
                updateProPremixedRatio('custom');
                updateProCustomPremixedPg();
            }
        }
    }
    
    if (data.vgPercent !== undefined) {
        const el = document.getElementById('proVgPgRatio');
        if (el) {
            el.value = data.vgPercent;
            updateProRatioDisplay();
        }
    }
    // Nikotin — typ, síla báze, VG/PG poměr báze, cílová hodnota
    const nicType = data.nicotineType || 'none';
    const nicTypeEl = document.getElementById('proNicotineType');
    if (nicTypeEl) {
        nicTypeEl.value = nicType;
        updateProNicotineType();
    }
    if (nicType !== 'none' && data.nicotine !== undefined && data.nicotine > 0) {
        const nicEl = document.getElementById('proTargetNicotine');
        if (nicEl) nicEl.value = data.nicotine;
        if (data.nicotineBaseStrength) {
            const bsEl = document.getElementById('proNicotineBaseStrength');
            if (bsEl) bsEl.value = data.nicotineBaseStrength;
        }
        if (data.nicotineRatioSlider !== undefined) {
            const nrEl = document.getElementById('proNicotineRatioSlider');
            if (nrEl) { nrEl.value = data.nicotineRatioSlider; updateProNicRatioDisplay(); }
        }
        // Typ nikotinové soli
        if (data.nicotineSaltType && nicType === 'salt') {
            const saltEl = document.getElementById('proSaltType');
            if (saltEl) saltEl.value = data.nicotineSaltType;
            const saltContainer = document.getElementById('proSaltTypeContainer');
            if (saltContainer) saltContainer.classList.remove('hidden');
        }
        if (typeof updateProNicotineDisplay === 'function') updateProNicotineDisplay();
    }
    // Příchutě - předvyplnit více příchutí
    if (data.flavors && data.flavors.length > 0) {
        resetAndPrefillProFlavors(data.flavors, linkedFlavors);
    }
    // Aditiva - předvyplnit
    if (data.additives && data.additives.length > 0) {
        resetAndPrefillProAdditives(data.additives);
    }
    // Aktualizovat limity
    _prefillingSavedRecipe = false;
    updateProVgPgLimits();
}

// Předvyplnit Shisha formulář
function prefillShishaForm(data, linkedFlavors = []) {
    // Celkové množství
    if (data.totalAmount) {
        const el = document.getElementById('shTotalAmount');
        if (el) el.value = data.totalAmount;
    }
    
    // Typ báze (separate/premixed)
    if (data.premixedRatio) {
        updateShishaBaseType('premixed');
        // Nastavit poměr předmíchané báze
        const standardRatios = ['50/50', '60/40', '70/30', '80/20', '90/10'];
        if (standardRatios.includes(data.premixedRatio)) {
            updateShishaPremixedRatio(data.premixedRatio);
        } else {
            // DŮLEŽITÉ: Nejdříve nastavit hodnotu VG, pak teprve volat updateShishaPremixedRatio
            const parts = data.premixedRatio.split('/');
            const vgEl = document.getElementById('shCustomPremixedVg');
            if (vgEl) vgEl.value = parseInt(parts[0]) || 70;
            updateShishaPremixedRatio('custom');
            updateShishaCustomPremixedPg();
        }
    } else {
        updateShishaBaseType('separate');
    }
    
    // Nikotin (po migraci používáme klíč nicotine)
    const nicValue = data.nicotine ?? 0;
    if (nicValue > 0) {
        const toggle = document.getElementById('shNicotineToggle');
        if (toggle) {
            toggle.checked = true;
            toggleShishaNicotine();
        }
        const nicEl = document.getElementById('shTargetNicotine');
        if (nicEl) {
            nicEl.value = nicValue;
            updateShishaNicotineDisplay();
        }
    }
    
    // VG/PG poměr
    if (data.vgPercent !== undefined) {
        const el = document.getElementById('shVgPgRatio');
        if (el) {
            el.value = data.vgPercent;
            updateShishaRatioDisplay();
        }
    }
    
    // Příchutě
    if (data.flavors && data.flavors.length > 0) {
        resetAndPrefillShishaFlavors(data.flavors, linkedFlavors);
    }
    
    // Sladidlo
    if (data.sweetener && data.sweetener.type !== 'none') {
        const toggle = document.getElementById('shSweetenerToggle');
        if (toggle) {
            toggle.checked = true;
            toggleShishaSweetener();
        }
        const typeEl = document.getElementById('shSweetenerType');
        if (typeEl) {
            typeEl.value = data.sweetener.type;
            updateShishaSweetenerType();
        }
        const strengthEl = document.getElementById('shSweetenerStrength');
        if (strengthEl) {
            strengthEl.value = data.sweetener.percent || 2;
            updateShishaSweetenerDisplay();
        }
    }
    
    // Voda
    if (data.water && data.water > 0) {
        const toggle = document.getElementById('shWaterToggle');
        if (toggle) {
            toggle.checked = true;
            toggleShishaWater();
        }
        const waterEl = document.getElementById('shWaterPercent');
        if (waterEl) {
            waterEl.value = data.water;
            updateShishaWaterDisplay();
        }
    }
    
    // Aktualizovat limity
    updateShishaVgPgLimits();
}

// Prefill Shisha Mix form (tabáky + bowlSize)
function prefillShishaMixForm(data, linkedFlavors = []) {
    window.allowShishaTabSwitch = true;
    switchShishaTab('mix');
    
    // Bowl size
    if (data.bowlSize) {
        const bsEl = document.getElementById('shBowlSize');
        if (bsEl) bsEl.value = data.bowlSize;
        // Aktivovat správné tlačítko
        const standardSizes = [10, 15, 20, 25];
        if (standardSizes.includes(data.bowlSize)) {
            updateShishaBowlSize(data.bowlSize);
        } else {
            updateShishaBowlSize('custom');
            const customEl = document.getElementById('shCustomBowlSize');
            if (customEl) customEl.value = data.bowlSize;
            if (bsEl) bsEl.value = data.bowlSize;
        }
    }
    
    // Tobaccos
    if (data.tobaccos && data.tobaccos.length > 0) {
        // Reset — tabáky 1 a 2 jsou statické v HTML, dynamické (3-4) jsou v shAdditionalTobaccoContainer
        shTobaccoCount = 2;
        const container = document.getElementById('shAdditionalTobaccoContainer');
        if (container) container.innerHTML = '';
        
        // Resetovat statické tabáky 1 a 2
        for (let i = 1; i <= 2; i++) {
            const input = document.getElementById(`shTobaccoAutocomplete${i}`);
            if (input) {
                input.value = '';
                delete input.dataset.flavorData;
                delete input.dataset.flavorId;
                delete input.dataset.flavorSource;
                delete input.dataset.favoriteProductId;
            }
            const slider = document.getElementById(`shTobaccoPercent${i}`);
            if (slider) { slider.value = 50; updateShishaTobaccoPercent(i); }
        }
        
        // Zobrazit tlačítko přidat tabák
        document.getElementById('shAddTobaccoGroup')?.classList.remove('hidden');
        
        // Nejdřív přidat všechny dynamické tabáky (3+), aby auto-complement nepřepisoval procenta
        for (let di = 3; di <= data.tobaccos.length; di++) {
            addShishaTobacco();
        }
        
        // Teprve potom nastavit procenta a autocomplete pro všechny tabáky
        data.tobaccos.forEach((tobacco, idx) => {
            const tobIdx = idx + 1;
            
            // Nastavit procento
            const slider = document.getElementById(`shTobaccoPercent${tobIdx}`);
            if (slider) {
                slider.value = tobacco.percent || 0;
                updateShishaTobaccoPercent(tobIdx);
            }
            
            // Nastavit autocomplete (konkrétní tabák)
            if (tobacco.flavorName) {
                const input = document.getElementById(`shTobaccoAutocomplete${tobIdx}`);
                if (input) {
                    const brand = tobacco.flavorManufacturer || '';
                    input.value = brand ? `${tobacco.flavorName} (${brand})` : tobacco.flavorName;
                    input.dataset.flavorData = JSON.stringify({
                        name: tobacco.flavorName,
                        manufacturer: tobacco.flavorManufacturer,
                        manufacturer_code: tobacco.flavorManufacturer,
                        id: tobacco.flavorId,
                        flavor_id: tobacco.flavorId,
                        favorite_product_id: tobacco.favoriteProductId,
                        source: tobacco.flavorSource === 'favorite' ? 'favorites' : 'database',
                        steep_days: tobacco.steepDays
                    });
                    input.dataset.flavorId = tobacco.flavorId || '';
                    input.dataset.flavorSource = tobacco.flavorSource || 'database';
                    if (tobacco.favoriteProductId) {
                        input.dataset.favoriteProductId = tobacco.favoriteProductId;
                    }
                }
            }
        });
        
        updateShishaTobaccoTotal();
    }
}

// Prefill DIY shisha form
function prefillShishaDiyForm(data, linkedFlavors = []) {
    // Switch to DIY tab
    window.allowShishaTabSwitch = true;
    switchShishaTab('diy');
    
    // Material (tobacco / herbs)
    if (data.diyMaterial) {
        const matEl = document.getElementById('shDiyMaterial');
        if (matEl) { matEl.value = data.diyMaterial; updateDiyMaterial(data.diyMaterial); }
    }
    
    // Tobacco amount
    if (data.tobaccoAmount) {
        const el = document.getElementById('shDiyTobaccoAmount');
        if (el) el.value = data.tobaccoAmount;
    }
    
    // Tobacco:molasses ratio
    if (data.tobaccoMolassesRatio) {
        const standardRatios = [4, 3, 2, 1];
        if (standardRatios.includes(data.tobaccoMolassesRatio)) {
            updateDiyRatio(data.tobaccoMolassesRatio);
        } else {
            updateDiyRatio('custom');
            const tR = document.getElementById('shDiyCustomRatioTobacco');
            const mR = document.getElementById('shDiyCustomRatioMolasses');
            if (tR) tR.value = Math.round(data.tobaccoMolassesRatio);
            if (mR) mR.value = 1;
        }
    }
    
    // Base: sweetener
    if (data.sweetenerType) {
        const el = document.getElementById('shDiySweetenerType');
        if (el) el.value = data.sweetenerType;
    }
    if (data.sweetenerPercent !== undefined) {
        const el = document.getElementById('shDiySweetenerPercent');
        if (el) { el.value = data.sweetenerPercent; updateDiyBaseDisplay('sweetener'); }
    }
    
    // Base: glycerin
    if (data.glycerinPercent !== undefined) {
        const el = document.getElementById('shDiyGlycerinPercent');
        if (el) { el.value = data.glycerinPercent; updateDiyBaseDisplay('glycerin'); }
    }
    
    // Base: water
    if (data.waterPercent !== undefined) {
        const el = document.getElementById('shDiyWaterPercent');
        if (el) { el.value = data.waterPercent; updateDiyBaseDisplay('water'); }
    }
    
    // Nicotine
    if (data.nicotineType && data.nicotineType !== 'none') {
        const typeEl = document.getElementById('shDiyNicotineType');
        if (typeEl) { typeEl.value = data.nicotineType; updateShishaDiyNicotineType(); }
        if (data.nicotineBaseStrength) {
            const bsEl = document.getElementById('shDiyNicotineBaseStrength');
            if (bsEl) bsEl.value = data.nicotineBaseStrength;
        }
        if (data.nicotineRatio) {
            updateShishaDiyNicotineRatio(data.nicotineRatio);
        }
        if (data.nicotineTarget) {
            const tEl = document.getElementById('shDiyTargetNicotine');
            if (tEl) { tEl.value = data.nicotineTarget; updateShishaDiyNicotineDisplay(); }
        }
    }
    
    // Flavors
    if (data.flavors && data.flavors.length > 0) {
        resetAndPrefillShishaDiyFlavors(data.flavors, linkedFlavors);
    }
    
    // Pure PG
    if (data.purePgPercent > 0) {
        const el = document.getElementById('shDiyPurePgPercent');
        if (el) { el.value = data.purePgPercent; updateDiyPurePgDisplay(); }
    }
    
    // Mixology
    if (data.mixology) {
        if (data.mixology.menthol > 0) {
            const cb = document.getElementById('shDiyMixMenthol');
            if (cb) { cb.checked = true; }
            const sl = document.getElementById('shDiyMixMentholDrops');
            if (sl) { sl.value = data.mixology.menthol; }
            updateDiyMixologyGroups();
            updateDiyMixSlider('menthol');
        }
        if (data.mixology.citricGrams > 0) {
            const cb = document.getElementById('shDiyMixCitric');
            if (cb) { cb.checked = true; }
            const sl = document.getElementById('shDiyMixCitricGrams');
            if (sl) { sl.value = data.mixology.citricGrams; }
            updateDiyMixologyGroups();
            updateDiyMixSlider('citric');
        }
    }
    
    autoRecalculateShishaDiyVgPgRatio();
}

// Prefill Tweak shisha form
function prefillShishaTweakForm(data, linkedFlavors = []) {
    // Switch to tweak tab
    window.allowShishaTabSwitch = true;
    switchShishaTab('tweak');
    
    // Tobacco amount
    if (data.tobaccoAmount) {
        const el = document.getElementById('shTweakTobaccoAmount');
        if (el) el.value = data.tobaccoAmount;
    }
    
    // Tobacco autocomplete
    const ts = data.tweakState;
    if (ts && ts.tobaccoData) {
        const input = document.getElementById('shTweakTobaccoAutocomplete');
        if (input) {
            const td = ts.tobaccoData;
            const brand = td.manufacturer_code || td.manufacturer || td.brand || '';
            input.value = brand ? `${td.name} (${brand})` : td.name;
            input.dataset.flavorData = JSON.stringify(td);
        }
    }
    
    if (!ts) return;
    
    // Problem checkboxes
    const checkMap = {
        problemVg: 'shTweakProblemVg',
        problemTaste: 'shTweakProblemTaste',
        problemFlavor: 'shTweakProblemFlavor',
        problemNicotine: 'shTweakProblemNicotine',
        problemMixology: 'shTweakProblemMixology'
    };
    Object.entries(checkMap).forEach(([key, id]) => {
        const el = document.getElementById(id);
        if (el && ts[key]) el.checked = true;
    });
    // Trigger sections update
    if (typeof updateTweakSections === 'function') updateTweakSections();
    
    // VG percent
    if (ts.vgPercent) {
        const el = document.getElementById('shTweakVgPercent');
        if (el) { el.value = ts.vgPercent; if (typeof updateTweakVgDisplay === 'function') updateTweakVgDisplay(); }
    }
    
    // Flavors (1-4) — ts.flavors je pole [{type, strength}], ts.flavorData je pole [obj0, obj1, ...]
    if (ts.flavors && Array.isArray(ts.flavors)) {
        // Reset — příchuť 1 je statická, 2+ jsou dynamické v shTweakAdditionalFlavorsContainer
        shTweakFlavorCount = 1;
        shTweakFlavorNextId = 1;
        const flavorContainer = document.getElementById('shTweakAdditionalFlavorsContainer');
        if (flavorContainer) flavorContainer.innerHTML = '';
        
        // Resetovat statickou příchuť 1
        const type1 = document.getElementById('shTweakFlavorType1');
        if (type1) { type1.value = 'none'; updateShishaTweakFlavorType(1); }
        const auto1 = document.getElementById('shTweakFlavorAutocomplete1');
        if (auto1) { auto1.value = ''; delete auto1.dataset.flavorData; }
        
        // Zobrazit tlačítko přidat příchuť
        document.getElementById('shTweakAddFlavorGroup')?.classList.remove('hidden');
        
        // Nejdřív přidat všechny dynamické příchutě (2+)
        for (let di = 2; di <= ts.flavors.length; di++) {
            addShishaTweakFlavor();
        }
        
        // Teprve potom nastavit hodnoty pro všechny příchutě
        ts.flavors.forEach((flavor, idx) => {
            const fi = idx + 1;
            
            // 1) Autocomplete data z ts.flavorData pole — nastavit PRVNÍ
            const fd = ts.flavorData && ts.flavorData[idx];
            if (fd && fd.name) {
                const input = document.getElementById(`shTweakFlavorAutocomplete${fi}`);
                if (input) {
                    const brand = fd.manufacturer_code || fd.manufacturer || fd.brand || '';
                    input.value = brand ? `${fd.name} (${brand})` : fd.name;
                    input.dataset.flavorData = JSON.stringify(fd);
                    // Rozbalit slider přes showFlavorSliderWithRange (nastaví rozsah dle příchutě)
                    if (typeof showFlavorSliderWithRange === 'function') {
                        showFlavorSliderWithRange(`shTweakFlavorAutocomplete${fi}`, fd);
                    }
                }
            }
            
            // 2) Kategorie příchutě — pokud je vybraná kategorie, nastavit a rozbalit
            if (flavor.type && flavor.type !== 'none') {
                const typeEl = document.getElementById(`shTweakFlavorType${fi}`);
                if (typeEl) { typeEl.value = flavor.type; updateShishaTweakFlavorType(fi); }
            } else if (fd && fd.name) {
                // Příchuť vybraná z autocomplete (type='none') — zajistit že slider je viditelný
                const container = document.getElementById(`shTweakFlavorStrengthContainer${fi}`);
                if (container) container.classList.remove('hidden');
            }
            
            // 3) Síla příchutě — nastavit AŽ po rozbalení slideru
            if (flavor.strength) {
                const strengthEl = document.getElementById(`shTweakFlavorStrength${fi}`);
                if (strengthEl) { strengthEl.value = flavor.strength; updateShishaTweakFlavorStrength(fi); }
            }
            
            // 4) VG/PG ratio příchutě
            if (flavor.flavorRatio !== undefined && flavor.flavorRatio > 0) {
                const ratioSlider = document.getElementById(`shTweakFlavorRatioSlider${fi}`);
                if (ratioSlider) { ratioSlider.value = flavor.flavorRatio; updateShishaTweakFlavorRatioDisplay(fi); }
            }
        });
    }
    
    // Nicotine
    if (ts.problemNicotine) {
        if (ts.nicotineType) {
            const el = document.getElementById('shTweakNicotineType');
            if (el) { el.value = ts.nicotineType; }
        }
        if (ts.nicotineBaseStrength) {
            const el = document.getElementById('shTweakNicotineBaseStrength');
            if (el) el.value = ts.nicotineBaseStrength;
        }
        if (ts.nicotineTarget) {
            const el = document.getElementById('shTweakTargetNicotine');
            if (el) { el.value = ts.nicotineTarget; if (typeof updateShishaTweakNicotineDisplay === 'function') updateShishaTweakNicotineDisplay(); }
        }
    }
    
    // Mixology sub-items
    if (ts.problemMixology) {
        const mixMap = {
            mixHoney: ['shTweakMixHoney', 'shTweakMixHoneyPercent', ts.mixHoneyPercent, 'honey'],
            mixMolasses: ['shTweakMixMolasses', 'shTweakMixMolassesPercent', ts.mixMolassesPercent, 'molasses'],
            mixMenthol: ['shTweakMixMenthol', 'shTweakMixMentholDrops', ts.mixMentholDrops, 'menthol'],
            mixCitric: ['shTweakMixCitric', 'shTweakMixCitricGrams', ts.mixCitricGrams, 'citric'],
            mixWater: ['shTweakMixWater', 'shTweakMixWaterPercent', ts.mixWaterPercent, 'water']
        };
        Object.entries(mixMap).forEach(([key, [cbId, sliderId, val, sliderType]]) => {
            if (ts[key]) {
                const cb = document.getElementById(cbId);
                if (cb) cb.checked = true;
                const sl = document.getElementById(sliderId);
                if (sl && val !== undefined) sl.value = val;
                // Aktualizovat display span pro slider
                if (typeof updateTweakMixSlider === 'function') updateTweakMixSlider(sliderType);
            }
        });
        // Zobrazit sub-groups dle zaškrtnutých checkboxů
        if (typeof updateTweakCalculation === 'function') updateTweakCalculation();
    }
}

// Prefill Molasses shisha form
function prefillShishaMolassesForm(data, linkedFlavors = []) {
    // Switch to molasses tab
    window.allowShishaTabSwitch = true;
    switchShishaTab('molasses');
    
    // Total amount
    if (data.totalAmount) {
        const el = document.getElementById('shMolTotalAmount');
        if (el) el.value = data.totalAmount;
    }
    
    // Base: sweetener
    if (data.sweetenerType) {
        const el = document.getElementById('shMolSweetenerType');
        if (el) el.value = data.sweetenerType;
    }
    if (data.sweetenerPercent !== undefined) {
        const el = document.getElementById('shMolSweetenerPercent');
        if (el) { el.value = data.sweetenerPercent; updateMolBaseDisplay('sweetener'); }
    }
    
    // Base: glycerin
    if (data.glycerinPercent !== undefined) {
        const el = document.getElementById('shMolGlycerinPercent');
        if (el) { el.value = data.glycerinPercent; updateMolBaseDisplay('glycerin'); }
    }
    
    // Base: water
    if (data.waterPercent !== undefined) {
        const el = document.getElementById('shMolWaterPercent');
        if (el) { el.value = data.waterPercent; updateMolBaseDisplay('water'); }
    }
    
    // Nicotine
    if (data.nicotineType && data.nicotineType !== 'none') {
        const typeEl = document.getElementById('shMolNicotineType');
        if (typeEl) { typeEl.value = data.nicotineType; updateShishaMolNicotineType(); }
        if (data.nicotineBaseStrength) {
            const bsEl = document.getElementById('shMolNicotineBaseStrength');
            if (bsEl) bsEl.value = data.nicotineBaseStrength;
        }
        if (data.nicotineRatio) {
            updateShishaMolNicotineRatio(data.nicotineRatio);
        }
        if (data.nicotineTarget) {
            const tEl = document.getElementById('shMolTargetNicotine');
            if (tEl) { tEl.value = data.nicotineTarget; updateShishaMolNicotineDisplay(); }
        }
    }
    
    // Flavors
    if (data.flavors && data.flavors.length > 0) {
        resetAndPrefillShishaMolFlavors(data.flavors, linkedFlavors);
    }
    
    // Pure PG
    if (data.purePgPercent > 0) {
        const el = document.getElementById('shMolPurePgPercent');
        if (el) { el.value = data.purePgPercent; updateMolPurePgDisplay(); }
    }
    
    // Mixology
    if (data.mixology) {
        if (data.mixology.menthol > 0) {
            const cb = document.getElementById('shMolMixMenthol');
            if (cb) { cb.checked = true; }
            const sl = document.getElementById('shMolMixMentholDrops');
            if (sl) { sl.value = data.mixology.menthol; }
            updateMolMixologyGroups();
            updateMolMixSlider('menthol');
        }
        if (data.mixology.citricGrams > 0) {
            const cb = document.getElementById('shMolMixCitric');
            if (cb) { cb.checked = true; }
            const sl = document.getElementById('shMolMixCitricGrams');
            if (sl) { sl.value = data.mixology.citricGrams; }
            updateMolMixologyGroups();
            updateMolMixSlider('citric');
        }
    }
    
    autoRecalculateShishaMolVgPgRatio();
}

// Resetovat a předvyplnit aditiva PRO formuláře
function resetAndPrefillProAdditives(additives) {
    if (!additives || additives.length === 0) return;
    
    // Reset
    proAdditiveCount = 0;
    const container = document.getElementById('proAdditivesContainer');
    if (container) container.innerHTML = '';
    
    const addBtn = document.getElementById('proAddAdditiveBtn');
    if (addBtn) addBtn.classList.remove('hidden');
    
    // Předvyplnit
    additives.forEach((additive) => {
        addProAdditive();
        
        const idx = proAdditiveCount;
        const typeEl = document.getElementById(`proAdditiveType${idx}`);
        const percentEl = document.getElementById(`proAdditivePercent${idx}`);
        
        if (typeEl) typeEl.value = additive.type;
        
        updateProAdditiveType(idx);
        
        if (percentEl) percentEl.value = additive.percent;
        
        // Custom composition
        if (additive.customComposition) {
            toggleAdditiveComposition(idx);
            const pgEl = document.getElementById(`proAdditiveCompPg${idx}`);
            const vgEl = document.getElementById(`proAdditiveCompVg${idx}`);
            const alcoholEl = document.getElementById(`proAdditiveCompAlcohol${idx}`);
            
            if (pgEl) pgEl.value = additive.customComposition.pg;
            if (vgEl) vgEl.value = additive.customComposition.vg;
            if (alcoholEl) alcoholEl.value = additive.customComposition.alcohol;
            updateAdditiveCompositionOther(idx);
        }
    });
}

// Předvyplnit autocomplete input s konkrétní příchutí
// Rozhodovací logika:
// 1. Kategorie? → přeskočit autocomplete, předvyplnit select + %
// 2. Uložena u uživatele (favorite)? → použít favorite_products data
// 3. V databázi (flavors)? → použít flavors data
// 4. Nic? → zobrazit 0
function prefillFlavorAutocomplete(inputId, flavorLink) {
    if (!flavorLink) return;
    
    const input = document.getElementById(inputId);
    if (!input) return;
    
    const percentage = flavorLink.percentage || 0;
    const category = flavorLink.generic_flavor_type || flavorLink.flavor?.category || 'fruit';
    
    console.log('prefillFlavorAutocomplete:', inputId, {
        flavor_source: flavorLink.flavor_source,
        generic_flavor_type: flavorLink.generic_flavor_type,
        flavor_id: flavorLink.flavor_id,
        favorite_product_id: flavorLink.favorite_product_id,
        flavor_name: flavorLink.flavor_name,
        flavor: flavorLink.flavor ? { min_percent: flavorLink.flavor.min_percent, max_percent: flavorLink.flavor.max_percent } : null
    });
    
    // ── 1. KATEGORIE? → přeskočit autocomplete ──
    // Kategorie = nemá konkrétní název příchutě, jen generickou kategorii
    // DŮLEŽITÉ: příchuť s flavor_name NIKDY není kategorie, i když nemá flavor_id (custom/favorite příchuť)
    const hasFlavorName = !!flavorLink.flavor_name;
    const hasFavoriteProduct = !!flavorLink.favorite_product_id;
    const isCategory = flavorLink.flavor_source === 'category' || 
        (!hasFlavorName && !hasFavoriteProduct && !flavorLink.flavor_id && flavorLink.generic_flavor_type);
    
    if (isCategory) {
        console.log('prefillFlavorAutocomplete: Category detected, skipping autocomplete:', category, 'source:', flavorLink.flavor_source);
        return;
    }
    
    // Získat data příchutě
    const flavorName = flavorLink.flavor_name || flavorLink.flavor?.name || null;
    if (!flavorName) return;
    
    const manufacturer = flavorLink.flavor_manufacturer || flavorLink.flavor?.manufacturer_name || flavorLink.flavor?.manufacturer_code || '';
    const flavorId = flavorLink.flavor_id || null;
    const favoriteProductId = flavorLink.favorite_product_id || null;
    
    // ── 2. ULOŽENA U UŽIVATELE (favorite)? → použít favorite_products data ──
    // ── 3. V DATABÁZI (flavors)? → použít flavors data ──
    // ── 4. NIC? → zobrazit 0 ──
    let minPercent = null;
    let maxPercent = null;
    let recommendedPercent = null;
    let steepDays = null;
    let vgRatio = null;
    let source = '';
    
    if (favoriteProductId && flavorLink.flavor) {
        // Příchuť uložena u uživatele — prioritně vzít data z favorite_products
        minPercent = flavorLink.flavor.min_percent || null;
        maxPercent = flavorLink.flavor.max_percent || null;
        recommendedPercent = flavorLink.flavor.recommended_percent || null;
        steepDays = flavorLink.flavor.steep_days || null;
        vgRatio = flavorLink.flavor.vg_ratio || null;
        source = 'favorite';
        console.log('prefillFlavorAutocomplete: Using FAVORITE data, min:', minPercent, 'max:', maxPercent);
    } else if (flavorId && flavorLink.flavor) {
        // Příchuť z veřejné databáze
        minPercent = flavorLink.flavor.min_percent || null;
        maxPercent = flavorLink.flavor.max_percent || null;
        recommendedPercent = flavorLink.flavor.recommended_percent || null;
        steepDays = flavorLink.flavor.steep_days || null;
        vgRatio = flavorLink.flavor.vg_ratio || null;
        source = 'database';
        console.log('prefillFlavorAutocomplete: Using DATABASE data, min:', minPercent, 'max:', maxPercent);
    } else {
        // Nemáme žádná data — zobrazit 0
        source = favoriteProductId ? 'favorite' : (flavorId ? 'database' : 'custom');
        console.log('prefillFlavorAutocomplete: No flavor data available, showing defaults');
    }
    
    // Nastavit text inputu
    input.value = flavorName;
    
    // Nastavit dataset
    input.dataset.flavorId = flavorId || '';
    input.dataset.favoriteProductId = favoriteProductId || '';
    input.dataset.flavorSource = source;
    
    // Uložit kompletní data příchutě
    const flavorData = {
        id: favoriteProductId || flavorId || null,
        flavor_id: flavorId,
        favorite_product_id: favoriteProductId,
        name: flavorName,
        manufacturer: manufacturer,
        manufacturer_code: manufacturer,
        category: category,
        product_type: flavorLink.flavor?.product_type || 'vape',
        min_percent: minPercent,
        max_percent: maxPercent,
        recommended_percent: recommendedPercent,
        steep_days: steepDays,
        vg_ratio: vgRatio,
        source: source,
        saved_percentage: percentage
    };
    input.dataset.flavorData = JSON.stringify(flavorData);
    
    // Deaktivovat kategorie select - příchuť má svou kategorii
    if (typeof updateFlavorCategoryState === 'function') {
        updateFlavorCategoryState(inputId, true);
    }
    
    // Zobrazit slider a nastavit rozsah dle příchutě
    if (typeof showFlavorSliderWithRange === 'function') {
        showFlavorSliderWithRange(inputId, flavorData);
    }
    
    console.log('prefillFlavorAutocomplete: Done', inputId, flavorName, percentage + '%', 'source:', source, 'min:', minPercent, 'max:', maxPercent);
    
    return { percentage, category };
}

// Resetovat a předvyplnit příchutě PRO formuláře
function resetAndPrefillProFlavors(flavors, linkedFlavors = []) {
    if (!flavors || flavors.length === 0) return;
    
    // 1. Resetovat stav - proFlavorCount je globální proměnná
    proFlavorCount = 1;
    const container = document.getElementById('proAdditionalFlavorsContainer');
    if (container) container.innerHTML = '';
    
    // 2. Zobrazit tlačítko přidat (skryje se pokud bude max)
    const addBtn = document.getElementById('proAddFlavorGroup');
    if (addBtn) addBtn.classList.remove('hidden');
    
    // 3. Předvyplnit příchutě
    flavors.forEach((flavor, idx) => {
        const flavorIndex = idx + 1; // příchutě jsou indexovány od 1
        
        if (flavorIndex > 1) {
            // Přidat nový řádek pro příchutě 2-4
            addProFlavor();
        }
        
        // Nastavit hodnoty
        const typeEl = document.getElementById(`proFlavorType${flavorIndex}`);
        const strengthEl = document.getElementById(`proFlavorStrength${flavorIndex}`);
        const ratioEl = document.getElementById(`proFlavorRatioSlider${flavorIndex}`);
        
        if (typeEl) typeEl.value = flavor.type || 'fruit';
        if (strengthEl) strengthEl.value = flavor.percent || 10;
        if (ratioEl) { ratioEl.value = flavor.vgRatio || 0; }
        
        // Aktualizovat UI (zobrazit slider, aktualizovat hodnoty)
        updateProFlavorType(flavorIndex);
        // DŮLEŽITÉ: updateProFlavorType → showCategoryFlavorWarning resetuje slider na 0%
        // Proto musíme znovu nastavit uloženou hodnotu procenta
        if (strengthEl && flavor.percent) {
            strengthEl.value = flavor.percent;
            updateProFlavorDisplay(flavorIndex);
        }
        if (typeof updateProFlavorRatioDisplay === 'function') updateProFlavorRatioDisplay(flavorIndex);
        
        // Obnovit detailní složení příchutě (pg/vg/alcohol/water/other)
        if (flavor.customComposition) {
            const cc = flavor.customComposition;
            if (typeof toggleFlavorComposition === 'function') toggleFlavorComposition(flavorIndex);
            const pgEl = document.getElementById(`proFlavorCompPg${flavorIndex}`);
            const vgEl = document.getElementById(`proFlavorCompVg${flavorIndex}`);
            const alcEl = document.getElementById(`proFlavorCompAlcohol${flavorIndex}`);
            const watEl = document.getElementById(`proFlavorCompWater${flavorIndex}`);
            if (pgEl) pgEl.value = cc.pg || 0;
            if (vgEl) vgEl.value = cc.vg || 0;
            if (alcEl) alcEl.value = cc.alcohol || 0;
            if (watEl) watEl.value = cc.water || 0;
            if (typeof updateFlavorCompositionOther === 'function') updateFlavorCompositionOther(flavorIndex);
        }
        
        // Předvyplnit konkrétní příchuť — matchovat linked flavor podle obsahu, ne pozice
        // Pozice v recipe_flavors nemusí odpovídat pozicím v recipe_data.flavors
        const fName = flavor.flavorName || flavor.name;
        const fManufacturer = flavor.flavorManufacturer || flavor.manufacturer;
        const fId = flavor.flavorId || flavor.id;
        const fSource = flavor.flavorSource || flavor.source;
        const fFavId = flavor.favoriteProductId;
        
        // Matchovat podle flavor_id, favorite_product_id nebo flavor_name
        let linkedFlavor = null;
        if (fFavId) {
            linkedFlavor = linkedFlavors.find(lf => lf.favorite_product_id === fFavId);
        }
        if (!linkedFlavor && fId) {
            linkedFlavor = linkedFlavors.find(lf => lf.flavor_id === fId);
        }
        if (!linkedFlavor && fName) {
            linkedFlavor = linkedFlavors.find(lf => lf.flavor_name === fName);
        }
        
        // Fallback: pokud linkedFlavors nemá match ale recipe_data má konkrétní příchuť
        if (!linkedFlavor && fName) {
            linkedFlavor = {
                flavor_name: fName,
                flavor_manufacturer: fManufacturer || null,
                flavor_id: fSource === 'favorite' ? null : (fId || null),
                favorite_product_id: fSource === 'favorite' ? (fFavId || fId || null) : (fFavId || null),
                flavor_source: fSource || 'database',
                generic_flavor_type: flavor.type || 'fruit',
                percentage: flavor.percent || 0
            };
            console.log('resetAndPrefillProFlavors: Using recipe_data fallback for flavor', flavorIndex, ':', fName);
        }
        
        if (linkedFlavor) {
            prefillFlavorAutocomplete(`proFlavorAutocomplete${flavorIndex}`, linkedFlavor);
            // Použít procento z linkedFlavors (uživatel ho mohl změnit) — vždy, i pro kategorie
            if (linkedFlavor.percentage && strengthEl) {
                strengthEl.value = linkedFlavor.percentage;
                updateProFlavorStrength(flavorIndex);
            }
        }
    });
    
    // 4. Aktualizovat celkové procento
    updateProTotalFlavorPercent();
}

// Resetovat a předvyplnit příchutě Shisha formuláře
function resetAndPrefillShishaFlavors(flavors, linkedFlavors = []) {
    if (!flavors || flavors.length === 0) return;
    
    // Resetovat stav
    shFlavorCount = 1;
    const container = document.getElementById('shAdditionalFlavorsContainer');
    if (container) container.innerHTML = '';
    
    // Předvyplnit příchutě
    flavors.forEach((flavor, idx) => {
        const flavorIndex = idx + 1;
        
        if (flavorIndex > 1) {
            addShishaFlavor();
        }
        
        if (flavor && flavor.type !== 'none') {
            const typeEl = document.getElementById(`shFlavorType${flavorIndex}`);
            if (typeEl) {
                typeEl.value = flavor.type;
                updateShishaFlavorType(flavorIndex);
            }
            const strengthEl = document.getElementById(`shFlavorStrength${flavorIndex}`);
            if (strengthEl) {
                strengthEl.value = flavor.percent || 15;
                updateShishaFlavorStrength(flavorIndex);
            }
            
            // Předvyplnit konkrétní příchuť — matchovat linked flavor podle obsahu, ne pozice
            const fName = flavor.flavorName || flavor.name;
            const fManufacturer = flavor.flavorManufacturer || flavor.manufacturer;
            const fId = flavor.flavorId || flavor.id;
            const fSource = flavor.flavorSource || flavor.source;
            const fFavId = flavor.favoriteProductId;
            
            let linkedFlavor = null;
            if (fFavId) linkedFlavor = linkedFlavors.find(lf => lf.favorite_product_id === fFavId);
            if (!linkedFlavor && fId) linkedFlavor = linkedFlavors.find(lf => lf.flavor_id === fId);
            if (!linkedFlavor && fName) linkedFlavor = linkedFlavors.find(lf => lf.flavor_name === fName);
            
            // Fallback: pokud linkedFlavors nemá match ale recipe_data má konkrétní příchuť
            if (!linkedFlavor && fName) {
                linkedFlavor = {
                    flavor_name: fName,
                    flavor_manufacturer: fManufacturer || null,
                    flavor_id: fSource === 'favorite' ? null : (fId || null),
                    favorite_product_id: fSource === 'favorite' ? (fFavId || fId || null) : (fFavId || null),
                    flavor_source: fSource || 'database',
                    generic_flavor_type: flavor.type || 'fruit',
                    percentage: flavor.percent || 0
                };
                console.log('resetAndPrefillShishaFlavors: Using recipe_data fallback for flavor', flavorIndex, ':', fName);
            }
            
            if (linkedFlavor) {
                prefillFlavorAutocomplete(`shFlavorAutocomplete${flavorIndex}`, linkedFlavor);
                // Použít procento z linkedFlavors (uživatel ho mohl změnit) — vždy, i pro kategorie
                if (linkedFlavor.percentage && strengthEl) {
                    strengthEl.value = linkedFlavor.percentage;
                    updateShishaFlavorStrength(flavorIndex);
                }
            }
        }
    });
}

// Resetovat a předvyplnit příchutě DIY formuláře
function resetAndPrefillShishaDiyFlavors(flavors, linkedFlavors = []) {
    if (!flavors || flavors.length === 0) return;
    
    shDiyFlavorCount = 1;
    const container = document.getElementById('shDiyAdditionalFlavorsContainer');
    if (container) container.innerHTML = '';
    
    flavors.forEach((flavor, idx) => {
        const flavorIndex = idx + 1;
        if (flavorIndex > 1) addShishaDiyFlavor();
        
        // 1) Autocomplete data — matchovat linked flavor podle obsahu, ne pozice
        const fName = flavor.flavorName || flavor.name;
        const fManufacturer = flavor.flavorManufacturer || flavor.manufacturer;
        const fId = flavor.flavorId || flavor.id;
        const fSource = flavor.flavorSource || flavor.source;
        const fFavId = flavor.favoriteProductId;
        
        let linkedFlavor = null;
        if (fFavId) linkedFlavor = linkedFlavors.find(lf => lf.favorite_product_id === fFavId);
        if (!linkedFlavor && fId) linkedFlavor = linkedFlavors.find(lf => lf.flavor_id === fId);
        if (!linkedFlavor && fName) linkedFlavor = linkedFlavors.find(lf => lf.flavor_name === fName);
        
        // Fallback: pokud linkedFlavors nemá match ale recipe_data má konkrétní příchuť
        if (!linkedFlavor && fName) {
            linkedFlavor = {
                flavor_name: fName,
                flavor_manufacturer: fManufacturer || null,
                flavor_id: fSource === 'favorite' ? null : (fId || null),
                favorite_product_id: fSource === 'favorite' ? (fFavId || fId || null) : (fFavId || null),
                flavor_source: fSource || 'database',
                generic_flavor_type: flavor.type || 'fruit',
                percentage: flavor.percent || 0
            };
            console.log('resetAndPrefillShishaDiyFlavors: Using recipe_data fallback for flavor', flavorIndex, ':', fName);
        }
        
        if (linkedFlavor) {
            prefillFlavorAutocomplete(`shDiyFlavorAutocomplete${flavorIndex}`, linkedFlavor);
            // Použít procento z linkedFlavors — vždy, i pro kategorie
            if (linkedFlavor.percentage) {
                const strengthEl = document.getElementById(`shDiyFlavorStrength${flavorIndex}`);
                if (strengthEl) { strengthEl.value = linkedFlavor.percentage; updateShishaDiyFlavorStrength(flavorIndex); }
            }
        }
        
        // 2) Kategorie příchutě — pokud je vybraná kategorie, nastavit a rozbalit
        if (flavor && flavor.type && flavor.type !== 'none') {
            const typeEl = document.getElementById(`shDiyFlavorType${flavorIndex}`);
            if (typeEl) { typeEl.value = flavor.type; updateShishaDiyFlavorType(flavorIndex); }
            const strengthEl = document.getElementById(`shDiyFlavorStrength${flavorIndex}`);
            if (strengthEl && flavor.percent) { strengthEl.value = flavor.percent; updateShishaDiyFlavorStrength(flavorIndex); }
        } else if (linkedFlavor) {
            // Příchuť vybraná z autocomplete (type='none') — zajistit že slider je viditelný
            const container = document.getElementById(`shDiyFlavorStrengthContainer${flavorIndex}`);
            if (container) container.classList.remove('hidden');
        }
        
        // 3) VG/PG ratio příchutě
        if (flavor && flavor.vgRatio !== undefined) {
            const ratioEl = document.getElementById(`shDiyFlavorRatioSlider${flavorIndex}`);
            if (ratioEl) { ratioEl.value = flavor.vgRatio; updateShishaDiyFlavorRatioDisplay(flavorIndex); }
        }
    });
}

// Resetovat a předvyplnit příchutě Molasses formuláře
function resetAndPrefillShishaMolFlavors(flavors, linkedFlavors = []) {
    if (!flavors || flavors.length === 0) return;
    
    shMolFlavorCount = 1;
    const container = document.getElementById('shMolAdditionalFlavorsContainer');
    if (container) container.innerHTML = '';
    
    flavors.forEach((flavor, idx) => {
        const flavorIndex = idx + 1;
        if (flavorIndex > 1) addShishaMolFlavor();
        
        // 1) Autocomplete data — matchovat linked flavor podle obsahu, ne pozice
        const fName = flavor.flavorName || flavor.name;
        const fManufacturer = flavor.flavorManufacturer || flavor.manufacturer;
        const fId = flavor.flavorId || flavor.id;
        const fSource = flavor.flavorSource || flavor.source;
        const fFavId = flavor.favoriteProductId;
        
        let linkedFlavor = null;
        if (fFavId) linkedFlavor = linkedFlavors.find(lf => lf.favorite_product_id === fFavId);
        if (!linkedFlavor && fId) linkedFlavor = linkedFlavors.find(lf => lf.flavor_id === fId);
        if (!linkedFlavor && fName) linkedFlavor = linkedFlavors.find(lf => lf.flavor_name === fName);
        
        // Fallback: pokud linkedFlavors nemá match ale recipe_data má konkrétní příchuť
        if (!linkedFlavor && fName) {
            linkedFlavor = {
                flavor_name: fName,
                flavor_manufacturer: fManufacturer || null,
                flavor_id: fSource === 'favorite' ? null : (fId || null),
                favorite_product_id: fSource === 'favorite' ? (fFavId || fId || null) : (fFavId || null),
                flavor_source: fSource || 'database',
                generic_flavor_type: flavor.type || 'fruit',
                percentage: flavor.percent || 0
            };
            console.log('resetAndPrefillShishaMolFlavors: Using recipe_data fallback for flavor', flavorIndex, ':', fName);
        }
        
        if (linkedFlavor) {
            prefillFlavorAutocomplete(`shMolFlavorAutocomplete${flavorIndex}`, linkedFlavor);
            // Použít procento z linkedFlavors — vždy, i pro kategorie
            if (linkedFlavor.percentage) {
                const strengthEl = document.getElementById(`shMolFlavorStrength${flavorIndex}`);
                if (strengthEl) { strengthEl.value = linkedFlavor.percentage; updateShishaMolFlavorStrength(flavorIndex); }
            }
        }
        
        // 2) Kategorie příchutě — pokud je vybraná kategorie, nastavit a rozbalit
        if (flavor && flavor.type && flavor.type !== 'none') {
            const typeEl = document.getElementById(`shMolFlavorType${flavorIndex}`);
            if (typeEl) { typeEl.value = flavor.type; updateShishaMolFlavorType(flavorIndex); }
            const strengthEl = document.getElementById(`shMolFlavorStrength${flavorIndex}`);
            if (strengthEl && flavor.percent) { strengthEl.value = flavor.percent; updateShishaMolFlavorStrength(flavorIndex); }
        } else if (linkedFlavor) {
            // Příchuť vybraná z autocomplete (type='none') — zajistit že slider je viditelný
            const container = document.getElementById(`shMolFlavorStrengthContainer${flavorIndex}`);
            if (container) container.classList.remove('hidden');
        }
        
        // 3) VG/PG ratio příchutě
        if (flavor && flavor.vgRatio !== undefined) {
            const ratioEl = document.getElementById(`shMolFlavorRatioSlider${flavorIndex}`);
            if (ratioEl) { ratioEl.value = flavor.vgRatio; updateShishaMolFlavorRatioDisplay(flavorIndex); }
        }
    });
}

// Zobrazit formulář pro úpravu receptu
async function showEditRecipeForm() {
    // Použít existující modal pro uložení, ale v režimu úpravy
    const modal = document.getElementById('saveRecipeModal');
    if (!modal) return;
    
    // Označit jako režim úpravy
    window.editingRecipeId = currentViewingRecipe.id;
    
    // Naplnit formulář existujícími daty
    document.getElementById('recipeName').value = currentViewingRecipe.name || '';
    document.getElementById('recipeDescription').value = currentViewingRecipe.description || '';
    document.getElementById('recipeRating').value = currentViewingRecipe.rating || '0';
    
    // Aktualizovat zobrazení hvězdiček
    selectedRating = parseInt(currentViewingRecipe.rating) || 0;
    updateStarDisplay(selectedRating);
    initStarRating();
    
    // Načíst produkty
    await loadProductsForRecipe();
    
    // Načíst propojené produkty a předvybrat je
    try {
        const linkedProducts = await window.LiquiMixerDB.getLinkedProducts(
            window.Clerk.user.id, 
            currentViewingRecipe.id
        );
        
        // Přidat řádky pro každý propojený produkt
        for (const product of linkedProducts) {
            addProductRowWithValue(product.id, product.name);
        }
    } catch (error) {
        console.error('Error loading linked products:', error);
    }
    
    // Změnit nadpis a tlačítko
    const modalTitle = modal.querySelector('.menu-title');
    if (modalTitle) {
        modalTitle.textContent = t('save_recipe.edit_title', 'Upravit recept');
    }
    
    const submitBtn = modal.querySelector('button[type="submit"]');
    if (submitBtn) {
        const spanElement = submitBtn.querySelector('span[data-i18n]');
        if (spanElement) {
            spanElement.textContent = t('save_recipe.save_changes', 'Save changes');
        } else {
            submitBtn.textContent = t('save_recipe.save_changes', 'Save changes');
        }
    }
    
    modal.classList.remove('hidden');
}

// Přidat řádek produktu s předvybranou hodnotou
function addProductRowWithValue(productId, productName) {
    if (availableProductsForRecipe.length === 0) return;
    
    const listContainer = document.getElementById('selectedProductsList');
    if (!listContainer) return;
    
    selectedProductRows++;
    const rowId = `product-row-${selectedProductRows}`;
    
    const typeIcons = {
        'vg': '💧',
        'pg': '💧',
        'flavor': '🍓',
        'nicotine_booster': '⚗',
        'nicotine_salt': '🧪'
    };
    
    // Vytvořit options pro select s předvybranou hodnotou
    let optionsHtml = `<option value="">${t('save_recipe.select_product', '-- Vyberte produkt --')}</option>`;
    availableProductsForRecipe.forEach(product => {
        const icon = typeIcons[product.product_type] || '📦';
        const selected = product.id === productId ? 'selected' : '';
        optionsHtml += `<option value="${escapeHtml(product.id)}" data-icon="${icon}" ${selected}>${escapeHtml(product.name)}</option>`;
    });
    
    const searchPlaceholder = t('save_recipe.search_product', 'Hledat produkt...');
    const rowHtml = `
        <div class="product-select-row" id="${rowId}">
            <div class="product-select-wrapper">
                <input type="text" class="product-search-input" placeholder="${searchPlaceholder}" value="${escapeHtml(productName || '')}" oninput="filterProductOptions(this, '${rowId}')">
                <select class="product-select" name="linkedProducts" onchange="onProductSelected(this)">
                    ${optionsHtml}
                </select>
            </div>
            <button type="button" class="remove-product-btn" onclick="removeProductRow('${rowId}')" title="Odebrat">✕</button>
        </div>
    `;
    
    listContainer.insertAdjacentHTML('beforeend', rowHtml);
}

// Oficiální doména pro sdílení receptů
const SHARE_DOMAIN = 'https://www.liquimixer.com';

// Sdílet recept
function shareRecipe() {
    if (!currentViewingRecipe || !currentViewingRecipe.share_id) {
        alert(t('share.cannot_share_recipe', 'This recipe cannot be shared.'));
        return;
    }

    // Použít share_url z databáze, nebo vytvořit novou
    // SECURITY: Vždy kontrolovat, že URL začíná oficiální doménou
    let shareUrl = currentViewingRecipe.share_url;
    
    if (!shareUrl || !shareUrl.startsWith(SHARE_DOMAIN)) {
        shareUrl = `${SHARE_DOMAIN}/?recipe=${currentViewingRecipe.share_id}`;
    }

    // Zkusit použít Web Share API
    if (navigator.share) {
        navigator.share({
            title: escapeHtml(currentViewingRecipe.name),
            text: `Podívej se na můj recept: ${escapeHtml(currentViewingRecipe.name)}`,
            url: shareUrl
        }).catch(err => {
            // Fallback na kopírování
            copyShareLink(shareUrl);
        });
    } else {
        copyShareLink(shareUrl);
    }
}

function copyShareLink(url) {
    navigator.clipboard.writeText(url).then(() => {
        alert(t('recipes.share_copied', 'Link copied to clipboard!') + '\n\n' + url);
    }).catch(() => {
        prompt('Zkopírujte tento odkaz:', url);
    });
}

// Sdílet oblíbený produkt
function shareProduct() {
    if (!currentViewingProduct || !currentViewingProduct.share_id) {
        alert(t('share.cannot_share_product', 'This product cannot be shared.'));
        return;
    }

    // Použít share_url z databáze, nebo vytvořit novou
    let shareUrl = currentViewingProduct.share_url;
    
    if (!shareUrl || !shareUrl.startsWith(SHARE_DOMAIN)) {
        shareUrl = `${SHARE_DOMAIN}/?product=${currentViewingProduct.share_id}`;
    }

    // Zkusit použít Web Share API
    if (navigator.share) {
        navigator.share({
            title: escapeHtml(currentViewingProduct.name),
            text: `Podívej se na můj oblíbený produkt: ${escapeHtml(currentViewingProduct.name)}`,
            url: shareUrl
        }).catch(err => {
            // Fallback na kopírování
            copyShareLink(shareUrl);
        });
    } else {
        copyShareLink(shareUrl);
    }
}

// Smazat recept
async function deleteRecipe() {
    if (!currentViewingRecipe) return;
    
    if (!window.Clerk || !window.Clerk.user) {
        alert(t('alert.login_required', 'Please sign in to delete the recipe.'));
        return;
    }
    
    const recipeName = currentViewingRecipe.name || 'Tento recept';
    
    if (!confirm(t('recipe_detail.delete_confirm', 'Opravdu chcete smazat tento recept?'))) {
        return;
    }
    
    try {
        const success = await window.LiquiMixerDB.deleteRecipe(
            window.Clerk.user.id, 
            currentViewingRecipe.id
        );
        
        if (success) {
            alert(t('recipe_detail.delete_success', 'Recipe deleted.'));
            currentViewingRecipe = null;
            showMyRecipes();
        } else {
            alert(t('recipe_detail.delete_error', 'Error deleting recipe.'));
        }
    } catch (error) {
        console.error('Error deleting recipe:', error);
        alert(t('recipe_detail.delete_error', 'Error deleting recipe.'));
    }
}

// Validace share_id formátu (12 znaků alfanumerických)
function isValidShareId(shareId) {
    if (!shareId || typeof shareId !== 'string') return false;
    return /^[A-Za-z0-9]{12}$/.test(shareId);
}

// Načíst sdílený recept z URL
async function loadSharedRecipe() {
    const urlParams = new URLSearchParams(window.location.search);
    const shareId = urlParams.get('recipe');
    
    // SECURITY: Validace share_id formátu
    if (!shareId || !isValidShareId(shareId)) return false;
    
    // Uložit shareId pro pozdější načtení
    window.pendingSharedRecipeId = shareId;
    
    // Počkat na inicializaci Supabase
    if (window.LiquiMixerDB) {
        window.LiquiMixerDB.init();
    }
    
    // Počkat na Clerk a Supabase
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Načíst recept z databáze pro zjištění typu
    try {
        const recipe = await window.LiquiMixerDB.getRecipeByShareId(shareId);
        
        if (!recipe) {
            showNotification(t('recipes.not_found', 'Recept nebyl nalezen.'), 'error');
            showPage('intro');
            return false;
        }
        
        // Uložit recept pro pozdější použití
        window.pendingSharedRecipe = recipe;
        window.pendingSharedRecipeUUID = recipe.id;
        
        // Zkontrolovat typ receptu
        const formType = recipe.recipe_data?.formType || 'liquid';
        
        // Liquid PRO vyžaduje přihlášení
        if (formType === 'liquidpro' && (!window.Clerk || !window.Clerk.user)) {
            showSharedRecipeLoginPrompt();
            return true;
        }
        
        // Pro všechny typy receptů zobrazit disclaimer
        showSharedRecipeDisclaimer(shareId);
        return true;
        
    } catch (error) {
        console.error('Error loading shared recipe:', error);
        showNotification(t('recipes.load_error', 'Error loading recipe.'), 'error');
        showPage('intro');
        return false;
    }
}

// Načíst příchuť z SEO stránky (?seo_flavor=slug)
async function loadSeoFlavor() {
    const urlParams = new URLSearchParams(window.location.search);
    const seoSlug = urlParams.get('seo_flavor');
    
    if (!seoSlug || typeof seoSlug !== 'string') return false;
    
    // Validace slug formátu (lowercase, alfanumerické + pomlčky)
    if (!/^[a-z0-9-]{3,80}$/.test(seoSlug)) {
        console.error('loadSeoFlavor: Invalid slug format:', seoSlug);
        return false;
    }
    
    console.log('loadSeoFlavor: Processing slug:', seoSlug);
    
    // Lookup v SEO flavor mapě
    const seoData = window.SEO_FLAVORS?.[seoSlug];
    if (!seoData) {
        console.error('loadSeoFlavor: Unknown slug:', seoSlug);
        showNotification(t('seo.flavor_not_found', 'Flavor not found.'), 'error');
        showPage('intro');
        return false;
    }
    
    // Počkat na inicializaci Supabase
    if (window.LiquiMixerDB) {
        window.LiquiMixerDB.init();
    }
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    try {
        let flavor = null;
        
        // 1. Pokusit se načíst přímo přes flavor_id (pokud je k dispozici)
        if (seoData.flavor_id) {
            flavor = await window.LiquiMixerDB.getFlavorById(seoData.flavor_id);
        }
        
        // 2. Fallback: vyhledat dle manufacturer_code + name
        if (!flavor && seoData.manufacturer_code && seoData.name) {
            const result = await window.LiquiMixerDB.searchFlavors({
                manufacturer_code: seoData.manufacturer_code,
                search: seoData.name,
                product_type: seoData.product_type || 'vape'
            }, 1, 5);
            
            if (result.data && result.data.length > 0) {
                // Najít přesnou shodu názvu
                flavor = result.data.find(f => 
                    f.name.toLowerCase() === seoData.name.toLowerCase()
                ) || result.data[0];
            }
        }
        
        if (!flavor) {
            console.error('loadSeoFlavor: Flavor not found in database:', seoSlug);
            showNotification(t('seo.flavor_not_found', 'Flavor not found in database.'), 'error');
            showPage('intro');
            return false;
        }
        
        console.log('loadSeoFlavor: Found flavor:', flavor.name, 'ID:', flavor.id);
        
        // Vytvořit flavorLink objekt kompatibilní s prefillFlavorAutocomplete
        const flavorLink = {
            flavor_id: flavor.id,
            flavor_name: flavor.name,
            flavor_manufacturer: flavor.manufacturer_code,
            percentage: flavor.recommended_percent || ((flavor.min_percent || 5) + (flavor.max_percent || 15)) / 2,
            generic_flavor_type: flavor.category || seoData.category || 'fruit',
            flavor: {
                id: flavor.id,
                name: flavor.name,
                manufacturer_name: flavor.flavor_manufacturers?.name || seoData.manufacturer_code,
                manufacturer_code: flavor.manufacturer_code,
                category: flavor.category || seoData.category || 'fruit',
                product_type: flavor.product_type || 'vape',
                min_percent: flavor.min_percent,
                max_percent: flavor.max_percent,
                recommended_percent: flavor.recommended_percent,
                steep_days: flavor.steep_days,
                vg_ratio: flavor.vg_ratio
            }
        };
        
        // Povolit programovou změnu záložky
        window.allowTabSwitch = true;
        
        // Přepnout na liquid formulář
        switchFormTab('liquid');
        
        // Předvyplnit liquid formulář s příchutí
        prefillLiquidForm({
            flavorType: 'specific'
        }, [flavorLink]);
        
        // Zobrazit formulář (přeskočit intro — uživatel souhlasil na SEO stránce)
        showPage('form');
        
        // Vyčistit URL (odebrat ?seo_flavor= parametr)
        const cleanUrl = window.location.pathname;
        window.history.replaceState({}, document.title, cleanUrl);
        
        console.log('loadSeoFlavor: Flavor prefilled successfully:', flavor.name);
        return true;
        
    } catch (error) {
        console.error('loadSeoFlavor: Error:', error);
        showNotification(t('seo.flavor_error', 'Error loading flavor data.'), 'error');
        showPage('intro');
        return false;
    }
}

// Zobrazit disclaimer pro sdílený recept
function showSharedRecipeDisclaimer(shareId) {
    // Uložit shareId pro pozdější načtení
    window.pendingSharedRecipeId = shareId;
    
    // Aplikovat překlady
    if (window.i18n && typeof window.i18n.applyTranslations === 'function') {
        window.i18n.applyTranslations();
    }
    
    showPage('shared-recipe-disclaimer');
}

// Potvrdit disclaimer a zobrazit sdílený recept
async function confirmAndShowSharedRecipe() {
    const shareId = window.pendingSharedRecipeId;
    if (!shareId) {
        showPage('intro');
        return;
    }
    
    await loadSharedRecipeContent(shareId);
}

// Zobrazit výzvu k přihlášení pro sdílený recept (pouze pro Liquid PRO)
function showSharedRecipeLoginPrompt() {
    const contentEl = document.getElementById('sharedRecipeContent');
    const titleEl = document.getElementById('sharedRecipeTitle');
    
    titleEl.textContent = t('recipe_detail.shared_title', 'Shared recipe');
    contentEl.innerHTML = `
        <div class="login-prompt">
            <div class="login-prompt-icon">🔒</div>
            <h3 class="login-prompt-title">${t('shared_recipe.pro_login_title', 'Sign in to view the recipe')}</h3>
            <p class="login-prompt-text">${t('shared_recipe.pro_login_text', 'Recipes created in Liquid PRO mode are only available for logged-in users.')}</p>
            <button class="neon-button" onclick="window.handleSharedRecipeLogin()">${t('shared_recipe.login_button', 'SIGN IN')}</button>
        </div>
    `;
    
    showPage('shared-recipe');
}

// Přihlášení pro sdílený recept - používá stejný modal jako "Uložit k sobě"
function handleSharedRecipeLogin() {
    console.log('handleSharedRecipeLogin called');
    // Použít showLoginRequiredModal - stejný jako tlačítko "Uložit k sobě" které funguje
    showLoginRequiredModal();
}

// Legacy alias pro zpětnou kompatibilitu
function showLoginForSharedRecipe() {
    handleSharedRecipeLogin();
}

// Načíst obsah sdíleného receptu (po přihlášení)
async function loadSharedRecipeContent(shareId) {
    try {
        const recipe = await window.LiquiMixerDB.getRecipeByShareId(shareId);
        
        if (recipe) {
            // Uložit sdílený recept pro pozdější použití (např. uložení k sobě)
            window.currentSharedRecipe = recipe;
            
            // Načíst propojené produkty (bez ověření vlastníka)
            let linkedProducts = [];
            let linkedFlavors = [];
            try {
                linkedProducts = await window.LiquiMixerDB.getLinkedProductsByRecipeId(recipe.id);
                linkedFlavors = await window.LiquiMixerDB.getLinkedFlavors(recipe.id);
            } catch (err) {
                console.error('Error loading linked products/flavors for shared recipe:', err);
            }
            
            // Zobrazit detail receptu s propojenými produkty a příchutěmi
            // Použít speciální režim pro sdílené recepty (isShared = true)
            displayRecipeDetail(recipe, 'sharedRecipeTitle', 'sharedRecipeContent', linkedProducts, true, linkedFlavors);
            showPage('shared-recipe');
            return true;
        } else {
            const contentEl = document.getElementById('sharedRecipeContent');
            contentEl.innerHTML = `<p class="no-recipes-text">${t('recipe_detail.not_found', 'Recipe not found or has been deleted.')}</p>`;
            showPage('shared-recipe');
            return true;
        }
    } catch (error) {
        console.error('Error loading shared recipe:', error);
    }
    
    return false;
}

// Zkontrolovat pending sdílený recept po přihlášení
async function checkPendingSharedRecipe() {
    if (window.pendingSharedRecipeId && window.Clerk && window.Clerk.user) {
        const shareId = window.pendingSharedRecipeId;
        // Nezmazat pendingSharedRecipeId - bude potřeba po disclaimeru
        // Zobrazit disclaimer stránku místo přímého načtení
        showSharedRecipeDisclaimer(shareId);
    }
}

// Uložit sdílený recept k sobě
async function saveSharedRecipe() {
    // Kontrola přihlášení A předplatného - zobrazí modál pokud chybí
    if (!requireSubscription()) {
        return; // requireSubscription() již zobrazí loginRequiredModal nebo subscriptionModal
    }
    
    // Zkontrolovat, že máme načtený sdílený recept
    const recipe = window.currentSharedRecipe;
    if (!recipe || !recipe.recipe_data) {
        showNotification(t('recipes.nothing_to_save', 'Nothing to save.'), 'error');
        return;
    }
    
    // Nastavit data pro uložení
    currentRecipeData = recipe.recipe_data;
    
    // Zobrazit modal pro uložení receptu
    const modal = document.getElementById('saveRecipeModal');
    if (modal) {
        modal.classList.remove('hidden');
        initStarRating();
        
        // Předvyplnit formulář hodnotami ze sdíleného receptu
        const nameInput = document.getElementById('recipeName');
        const descInput = document.getElementById('recipeDescription');
        const ratingInput = document.getElementById('recipeRating');
        
        if (nameInput) nameInput.value = recipe.name || '';
        if (descInput) descInput.value = recipe.description || '';
        if (ratingInput) ratingInput.value = recipe.rating || 0;
        
        // Nastavit hvězdičkové hodnocení
        selectedRating = parseInt(recipe.rating) || 0;
        updateStarDisplay(selectedRating);
        
        // Nastavit nadpis a tlačítko
        const modalTitle = modal.querySelector('.menu-title');
        if (modalTitle) {
            modalTitle.textContent = t('shared_recipe.save_to_my_recipes', 'Save to my recipes');
        }
        
        // Blokovat "Sdílet do veřejné databáze" při ukládání ze sdílené databáze (prevence duplikátů)
        const publicCheckbox = document.getElementById('recipeIsPublic');
        const publicToggle = publicCheckbox?.closest('.public-recipe-toggle');
        if (publicCheckbox) {
            publicCheckbox.checked = false;
            publicCheckbox.disabled = true;
        }
        if (publicToggle) {
            publicToggle.classList.add('disabled');
            publicToggle.title = t('save_recipe.public_disabled_shared', 'Cannot share a recipe copied from public database');
        }
        
        // Inicializovat připomínku
        initReminderFieldsEnabled();
        
        // Aplikovat překlady
        if (window.i18n && typeof window.i18n.applyTranslations === 'function') {
            window.i18n.applyTranslations();
        }
        
        // Načíst produkty uživatele pro případné přidání dalších
        await loadProductsForRecipe();
        
        // Načíst a zobrazit produkty ze sdíleného receptu
        try {
            const sharedProducts = await window.LiquiMixerDB.getLinkedProductsByRecipeId(recipe.id);
            if (sharedProducts && sharedProducts.length > 0) {
                for (const product of sharedProducts) {
                    // Přidat řádek s produktem ze sdíleného receptu (označený jako sdílený)
                    addSharedProductRow(product.id, product.name, product.product_type);
                }
            }
        } catch (err) {
            console.error('Error loading shared recipe products:', err);
        }
        
        // Načíst a zobrazit příchutě ze sdíleného receptu
        try {
            const sharedFlavors = await window.LiquiMixerDB.getLinkedFlavors(recipe.id);
            if (sharedFlavors && sharedFlavors.length > 0) {
                // Vyčistit seznam příchutí
                const flavorsList = document.getElementById('selectedFlavorsList');
                if (flavorsList) {
                    flavorsList.innerHTML = '';
                }
                
                for (const flavorLink of sharedFlavors) {
                    // Vytvořit data příchutě pro zobrazení
                    const flavorInfo = {
                        name: flavorLink.flavor_name || flavorLink.flavor?.name || null,
                        manufacturer: flavorLink.flavor_manufacturer || flavorLink.flavor?.manufacturer_name || null,
                        category: flavorLink.generic_flavor_type || flavorLink.flavor?.category || 'fruit',
                        percent: flavorLink.percentage || 0,
                        // Pro uložení do databáze
                        flavorId: flavorLink.flavor_id || flavorLink.flavor?.id || null,
                        flavorSource: flavorLink.flavor_id ? 'database' : 'generic',
                        // Parametry příchutě pro kopírování
                        min_percent: flavorLink.flavor?.min_percent || null,
                        max_percent: flavorLink.flavor?.max_percent || null,
                        steep_days: flavorLink.flavor?.steep_days || null
                    };
                    
                    // Přidat řádek pouze pokud má název (konkrétní příchuť)
                    if (flavorInfo.name) {
                        addFlavorRowToModal(flavorInfo, flavorLink.position - 1);
                    }
                }
            }
        } catch (err) {
            console.error('Error loading shared recipe flavors:', err);
        }
        
        // Uložit UUID původního receptu pro zkopírování produktů po uložení
        window.pendingSharedRecipeUUID = recipe.id;
    }
}

// Přidat řádek se sdíleným produktem (s tlačítkem pro odstranění)
function addSharedProductRow(productId, productName, productType) {
    const listContainer = document.getElementById('selectedProductsList');
    if (!listContainer) return;
    
    selectedProductRows++;
    const rowId = `shared-product-row-${selectedProductRows}`;
    
    const typeIcons = {
        'vg': '💧',
        'pg': '💧',
        'flavor': '🍓',
        'nicotine_booster': '⚗️',
        'nicotine_salt': '🧪'
    };
    const icon = typeIcons[productType] || '📦';
    
    const row = document.createElement('div');
    row.id = rowId;
    row.className = 'product-select-row shared-product-row';
    row.innerHTML = `
        <div class="shared-product-display">
            <span class="shared-product-icon">${icon}</span>
            <span class="shared-product-name">${escapeHtml(productName)}</span>
            <span class="shared-product-badge">${t('shared_recipe.from_shared', 'from shared')}</span>
        </div>
        <input type="hidden" name="sharedProducts" value="${escapeHtml(productId)}">
        <button type="button" class="reminder-btn delete" onclick="removeSharedProductRow('${rowId}')" title="${t('common.remove', 'Odstranit')}">${reminderDeleteIcon}</button>
    `;
    listContainer.appendChild(row);
}

// Odstranit sdílený produkt z řádku (nepřevzít do svého receptu)
function removeSharedProductRow(rowId) {
    const row = document.getElementById(rowId);
    if (row) {
        row.remove();
    }
}

// ============================================
// OBLÍBENÉ PRODUKTY
// ============================================

let currentViewingProduct = null;
let selectedProductRating = 0;
let allUserProducts = []; // Všechny načtené produkty pro filtrování
let searchRatingFilter = 0; // Aktuální filtr hodnocení produktů

// Stav pro filtrování receptů
let allUserRecipes = []; // Všechny načtené recepty pro filtrování
let recipeSearchRatingFilter = 0; // Aktuální filtr hodnocení receptů
let maturedRecipeIds = new Set(); // ID receptů s vyzrálými připomínkami

// Zobrazit seznam oblíbených produktů
async function showFavoriteProducts() {
    hideUserProfileModal();
    
    // PRO funkce - vyžaduje přihlášení A předplatné
    if (!requireSubscription()) {
        return;
    }
    
    const container = document.getElementById('productsListContainer');
    container.innerHTML = `<p class="no-products-text">${t('products.loading', 'Loading products...')}</p>`;
    
    // Reset vyhledávacích filtrů
    resetProductFilters();
    
    showPage('favorite-products');
    
    try {
        const products = await window.LiquiMixerDB.getProducts(window.Clerk.user.id);
        allUserProducts = products || []; // Uložit pro filtrování
        
        renderProductsList(allUserProducts);
    } catch (error) {
        console.error('Error loading products:', error);
        container.innerHTML = `<p class="no-products-text" style="color: var(--neon-pink);">${t('products.load_error', 'Chyba při načítání produktů.')}</p>`;
    }
}

// Reset filtrů vyhledávání
function resetProductFilters() {
    const textInput = document.getElementById('productSearchText');
    const typeSelect = document.getElementById('productSearchType');
    const resultsInfo = document.getElementById('searchResultsInfo');
    
    if (textInput) textInput.value = '';
    if (typeSelect) typeSelect.value = '';
    searchRatingFilter = 0;
    updateSearchStarsDisplay(0);
    if (resultsInfo) resultsInfo.textContent = '';
}

// Nastavit filtr hodnocení
function setSearchRating(rating) {
    // Pokud klikneme na stejné hodnocení, zrušíme filtr
    if (searchRatingFilter === rating) {
        searchRatingFilter = 0;
    } else {
        searchRatingFilter = rating;
    }
    updateSearchStarsDisplay(searchRatingFilter);
    filterProducts();
}

// Zrušit filtr hodnocení
function clearSearchRating() {
    searchRatingFilter = 0;
    updateSearchStarsDisplay(0);
    filterProducts();
}

// Aktualizovat zobrazení hvězdiček ve vyhledávání
function updateSearchStarsDisplay(rating) {
    const stars = document.querySelectorAll('#searchStars .search-star');
    stars.forEach((star, index) => {
        if (index < rating) {
            star.textContent = '★';
            star.classList.add('active');
        } else {
            star.textContent = '☆';
            star.classList.remove('active');
        }
    });
}

// Inicializovat hover efekt pro hvězdičky vyhledávání
function initSearchStarsHover() {
    const starsContainer = document.getElementById('searchStars');
    if (!starsContainer) return;
    
    const stars = starsContainer.querySelectorAll('.search-star');
    
    stars.forEach((star, index) => {
        star.addEventListener('mouseenter', () => {
            stars.forEach((s, i) => {
                if (i <= index) {
                    s.classList.add('hover');
                } else {
                    s.classList.remove('hover');
                }
            });
        });
        
        star.addEventListener('mouseleave', () => {
            stars.forEach(s => s.classList.remove('hover'));
        });
    });
}

// Filtrovat produkty
function filterProducts() {
    const searchText = (document.getElementById('productSearchText')?.value || '').toLowerCase().trim();
    const searchType = document.getElementById('productSearchType')?.value || '';
    const inStockOnly = document.getElementById('productSearchInStock')?.checked || false;
    
    let filtered = allUserProducts.filter(product => {
        // Textový filtr (název a popis)
        if (searchText) {
            const name = (product.name || '').toLowerCase();
            const description = (product.description || '').toLowerCase();
            if (!name.includes(searchText) && !description.includes(searchText)) {
                return false;
            }
        }
        
        // Filtr typu
        if (searchType && product.product_type !== searchType) {
            return false;
        }
        
        // Filtr hodnocení (min. hodnocení)
        if (searchRatingFilter > 0) {
            const productRating = parseInt(product.rating) || 0;
            if (productRating < searchRatingFilter) {
                return false;
            }
        }
        
        // Filtr skladem (stock_quantity > 0)
        if (inStockOnly) {
            const stockQuantity = parseFloat(product.stock_quantity) || 0;
            if (stockQuantity <= 0) {
                return false;
            }
        }
        
        return true;
    });
    
    // Zobrazit info o výsledcích
    const resultsInfo = document.getElementById('searchResultsInfo');
    if (resultsInfo) {
        if (searchText || searchType || searchRatingFilter > 0 || inStockOnly) {
            if (filtered.length === 0) {
                resultsInfo.textContent = t('products.no_filter_results', 'No products match the filters.');
                resultsInfo.className = 'search-results-info no-results';
            } else {
                resultsInfo.textContent = t('products.filter_results', 'Found {found} of {total} products.').replace('{found}', filtered.length).replace('{total}', allUserProducts.length);
                resultsInfo.className = 'search-results-info has-results';
            }
        } else {
            resultsInfo.textContent = '';
            resultsInfo.className = 'search-results-info';
        }
    }
    
    renderProductsList(filtered);
}

// Vykreslit seznam produktů
function renderProductsList(products) {
    const container = document.getElementById('productsListContainer');

    if (!products || products.length === 0) {
        container.innerHTML = `<p class="no-products-text">${t('products.no_products', 'You have no favorite products yet.')}</p>`;
        return;
    }
    
    let html = '<div class="products-list">';
    
    products.forEach(product => {
        if (!isValidUUID(product.id)) return;
        
        const rating = Math.min(Math.max(parseInt(product.rating) || 0, 0), 5);
        const stars = '★'.repeat(rating) + '☆'.repeat(5 - rating);
        const date = new Date(product.created_at).toLocaleDateString('cs-CZ');
        
        const safeName = escapeHtml(product.name);
        const safeDescription = escapeHtml(product.description);
        const typeLabel = getProductTypeLabel(product.product_type);
        const typeIcon = productTypeIcons[product.product_type] || '🍓';
        
        const stockQuantity = product.stock_quantity || 0;
        
        html += `
            <div class="product-card rating-${rating}" onclick="viewProductDetail('${product.id}')">
                ${product.image_url ? `<div class="product-card-image"><img src="${escapeHtml(product.image_url)}" alt="${safeName}"></div>` : ''}
                <div class="product-card-content">
                    <div class="product-card-header">
                        <h3 class="product-card-title">${safeName}</h3>
                        <span class="product-card-rating">${stars}</span>
                    </div>
                    <div class="product-card-type">
                        <span class="product-type-badge">${typeIcon} ${escapeHtml(typeLabel)}</span>
                    </div>
                    ${safeDescription ? `<p class="product-card-description">${safeDescription.substring(0, 100)}${safeDescription.length > 100 ? '...' : ''}</p>` : ''}
                    <div class="product-card-footer">
                        <div class="product-card-meta">
                            <span>📅 ${date}</span>
                            ${product.product_url ? '<span>🔗 Odkaz</span>' : ''}
                        </div>
                        <div class="product-stock" onclick="event.stopPropagation();">
                            <span class="stock-label">${t('reminder.stock_label', 'Sklad')}:</span>
                            <button type="button" class="stock-btn minus" onclick="updateProductStockUI('${product.id}', -0.5)">−</button>
                            <span class="stock-quantity" id="product-stock-${product.id}">${stockQuantity % 1 === 0 ? stockQuantity : stockQuantity.toFixed(1)}</span>
                            <span class="stock-unit">${t('products.stock_unit', 'ks')}</span>
                            <button type="button" class="stock-btn plus" onclick="updateProductStockUI('${product.id}', +1)">+</button>
                        </div>
                    </div>
                </div>
            </div>
            `;
    });
    
    html += '</div>';
    container.innerHTML = html;
}

// Aktualizovat počet kusů produktu na skladě (UI + DB)
async function updateProductStockUI(productId, change) {
    if (!window.Clerk?.user || !window.LiquiMixerDB) return;
    
    // Získat aktuální hodnotu z DOM - hledat všechny elementy s tímto ID (v seznamu i v detailu)
    const stockElements = document.querySelectorAll(`#product-stock-${productId}, [id="product-stock-${productId}"]`);
    
    if (stockElements.length === 0) {
        console.warn('updateProductStockUI: No stock element found for product', productId);
        return;
    }
    
    // Použít první nalezený element pro získání aktuální hodnoty
    let currentStock = parseFloat(stockElements[0].textContent) || 0;
    let newStock = Math.max(0, Math.round((currentStock + change) * 2) / 2); // Zaokrouhlit na 0.5
    const displayValue = newStock % 1 === 0 ? String(newStock) : newStock.toFixed(1);
    
    // Okamžitá aktualizace UI pro VŠECHNY nalezené elementy (seznam i detail)
    stockElements.forEach(el => {
        el.textContent = displayValue;
    });
    
    // Aktualizace v DB (non-blocking)
    try {
        await window.LiquiMixerDB.updateProductStock(window.Clerk.user.id, productId, newStock);
    } catch (err) {
        console.error('Error updating product stock:', err);
        // Vrátit původní hodnotu při chybě
        const revertValue = currentStock % 1 === 0 ? String(currentStock) : currentStock.toFixed(1);
        stockElements.forEach(el => {
            el.textContent = revertValue;
        });
    }
}

// Zobrazit detail produktu
async function viewProductDetail(productId) {
    if (!window.Clerk || !window.Clerk.user) return;
    
    if (!isValidUUID(productId)) {
        console.error('Invalid product ID format');
        return;
    }
    
    try {
        const product = await window.LiquiMixerDB.getProductById(window.Clerk.user.id, productId);
        
        if (!product) {
            alert(t('products.not_found', 'Produkt nenalezen.'));
            return;
        }
        
        currentViewingProduct = product;
        
        // Načíst recepty, ve kterých je produkt použitý
        let linkedRecipes = [];
        try {
            linkedRecipes = await window.LiquiMixerDB.getRecipesByProductId(window.Clerk.user.id, productId);
            
            // Pro příchutě načíst i recepty propojené přes recipe_flavors
            if (product.product_type === 'flavor') {
                const flavorLinkedRecipes = await window.LiquiMixerDB.getRecipesByFlavorProductId(window.Clerk.user.id, productId);
                // Sloučit a deduplikovat
                const existingIds = new Set(linkedRecipes.map(r => r.id));
                for (const recipe of flavorLinkedRecipes) {
                    if (recipe && !existingIds.has(recipe.id)) {
                        linkedRecipes.push(recipe);
                    }
                }
            }
        } catch (err) {
            console.error('Error loading linked recipes:', err);
        }
        
        displayProductDetail(product, linkedRecipes);
        
        // Skrýt tlačítko UPRAVIT pro produkty vytvořené automaticky z kategorie
        const editBtn = document.getElementById('productEditBtn');
        if (editBtn) {
            const isAutoCategory = product.description === 'auto:category';
            editBtn.style.display = isAutoCategory ? 'none' : '';
        }
        
        showPage('product-detail');
        
    } catch (error) {
        console.error('Error loading product:', error);
        alert(t('products.load_error', 'Chyba při načítání produktu.'));
    }
}

// Zobrazit detail produktu v UI
function displayProductDetail(product, linkedRecipes = []) {
    const titleEl = document.getElementById('productDetailTitle');
    const contentEl = document.getElementById('productDetailContent');
    
    titleEl.textContent = product.name;
    
    const rating = Math.min(Math.max(parseInt(product.rating) || 0, 0), 5);
    const stars = '★'.repeat(rating) + '☆'.repeat(5 - rating);
    // Použít aktuální locale pro formátování data
    const currentLocale = window.i18n?.currentLocale || 'cs';
    const date = new Date(product.created_at).toLocaleDateString(currentLocale);
    const typeLabel = getProductTypeLabel(product.product_type);
    const typeIcon = productTypeIcons[product.product_type] || '🍓';
    
    const safeDescription = escapeHtml(product.description);
    
    let imageHtml = '';
    if (product.image_url) {
        imageHtml = `<div class="product-detail-image"><img src="${escapeHtml(product.image_url)}" alt="${escapeHtml(product.name)}"></div>`;
    }
    
    let urlHtml = '';
    if (product.product_url) {
        // Použít sanitizeUrl pro bezpečnou URL
        const cleanUrl = sanitizeUrl(product.product_url);
        if (cleanUrl) {
            urlHtml = `
                <div class="product-detail-url">
                    <a href="${cleanUrl}" target="_blank" rel="noopener noreferrer" class="neon-button secondary">
                        ${t('product_detail.open_link', 'Otevřít odkaz na produkt')}
                    </a>
                </div>
            `;
        }
    }
    
    // Seznam receptů, ve kterých je produkt použitý
    let recipesHtml = '';
    if (linkedRecipes && linkedRecipes.length > 0) {
        const recipeItems = linkedRecipes.map(recipe => {
            const recipeRating = Math.min(Math.max(parseInt(recipe.rating) || 0, 0), 5);
            const recipeStars = '★'.repeat(recipeRating) + '☆'.repeat(5 - recipeRating);
            return `
                <div class="linked-recipe-item" onclick="viewRecipeDetail('${escapeHtml(recipe.id)}')">
                    <span class="linked-recipe-name">${escapeHtml(recipe.name)}</span>
                    <span class="linked-recipe-rating">${recipeStars}</span>
                </div>
            `;
        }).join('');
        
        recipesHtml = `
            <div class="product-linked-recipes">
                <h4 class="product-section-title">${t('product_detail.used_in_recipes', 'Used in recipes')}</h4>
                <div class="linked-recipes-list">
                    ${recipeItems}
                </div>
            </div>
        `;
    }
    
    const stockQuantity = product.stock_quantity || 0;
    const stockDisplay = stockQuantity % 1 === 0 ? stockQuantity : stockQuantity.toFixed(1);
    
    // Parametry příchutě - zobrazit pokud je produkt typu 'flavor'
    let flavorParamsHtml = '';
    if (product.product_type === 'flavor') {
        // Získat parametry z produktu nebo z připojených flavor dat
        // OPRAVA: Použít explicitní kontrolu pro hodnotu 0 (která je validní)
        const minPercent = (product.flavor_min_percent !== undefined && product.flavor_min_percent !== null) 
            ? product.flavor_min_percent 
            : ((product.min_percent !== undefined && product.min_percent !== null) ? product.min_percent : null);
        const maxPercent = (product.flavor_max_percent !== undefined && product.flavor_max_percent !== null) 
            ? product.flavor_max_percent 
            : ((product.max_percent !== undefined && product.max_percent !== null) ? product.max_percent : null);
        const steepDays = (product.flavor_steep_days !== undefined && product.flavor_steep_days !== null) 
            ? product.flavor_steep_days 
            : ((product.steep_days !== undefined && product.steep_days !== null) ? product.steep_days : null);
        const manufacturer = product.flavor_manufacturer || product.manufacturer || null;
        const productCode = product.product_code || null;
        
        // Sestavit HTML pouze pro parametry které existují
        const paramItems = [];
        
        // Kód produktu jako první
        if (productCode) {
            paramItems.push(`
                <div class="flavor-param-item">
                    <span class="flavor-param-label">${t('product_detail.product_code', 'Kód produktu')}:</span>
                    <span class="flavor-param-value">${escapeHtml(productCode)}</span>
                </div>
            `);
        }
        
        if (manufacturer) {
            paramItems.push(`
                <div class="flavor-param-item">
                    <span class="flavor-param-label">${t('product_detail.manufacturer', 'Výrobce')}:</span>
                    <span class="flavor-param-value">${escapeHtml(manufacturer)}</span>
                </div>
            `);
        }
        
        if (minPercent !== null && maxPercent !== null) {
            paramItems.push(`
                <div class="flavor-param-item">
                    <span class="flavor-param-label">${t('product_detail.recommended_range', 'Doporučený rozsah')}:</span>
                    <span class="flavor-param-value">${minPercent}% – ${maxPercent}%</span>
                </div>
            `);
        } else if (minPercent !== null) {
            paramItems.push(`
                <div class="flavor-param-item">
                    <span class="flavor-param-label">${t('product_detail.min_percent', 'Min. procento')}:</span>
                    <span class="flavor-param-value">${minPercent}%</span>
                </div>
            `);
        } else if (maxPercent !== null) {
            paramItems.push(`
                <div class="flavor-param-item">
                    <span class="flavor-param-label">${t('product_detail.max_percent', 'Max. procento')}:</span>
                    <span class="flavor-param-value">${maxPercent}%</span>
                </div>
            `);
        }
        
        if (steepDays !== null && steepDays > 0) {
            const daysText = steepDays === 1 ? t('common.day', 'den') : 
                (steepDays >= 2 && steepDays <= 4) ? t('common.days_few', 'dny') : t('common.days', 'dní');
            paramItems.push(`
                <div class="flavor-param-item">
                    <span class="flavor-param-label">${t('product_detail.steep_time', 'Doba zrání')}:</span>
                    <span class="flavor-param-value">${steepDays} ${daysText}</span>
                </div>
            `);
        }
        
        if (paramItems.length > 0) {
            flavorParamsHtml = `
                <div class="product-flavor-params">
                    <h4 class="product-section-title">${t('product_detail.flavor_params', 'Parametry příchutě')}</h4>
                    <div class="flavor-params-list">
                        ${paramItems.join('')}
                    </div>
                </div>
            `;
        }
    }
    
    contentEl.innerHTML = `
        ${imageHtml}
        <div class="product-detail-header">
            <div class="product-detail-type">
                <span class="product-type-badge large">${typeIcon} ${escapeHtml(typeLabel)}</span>
            </div>
            <div class="product-detail-rating">${stars}</div>
            ${safeDescription ? `<p class="product-detail-description">${safeDescription}</p>` : ''}
        </div>
        ${flavorParamsHtml}
        <div class="product-detail-stock">
            <span class="stock-label">${t('reminder.stock_label', 'Sklad')}:</span>
            <div class="product-stock-controls">
                <button type="button" class="stock-btn minus large" onclick="updateProductStockUI('${product.id}', -0.5)">−</button>
                <span class="stock-quantity large" id="product-stock-${product.id}">${stockDisplay}</span>
                <span class="stock-unit">${t('products.stock_unit', 'ks')}</span>
                <button type="button" class="stock-btn plus large" onclick="updateProductStockUI('${product.id}', +1)">+</button>
            </div>
        </div>
        ${urlHtml}
        ${recipesHtml}
        <div class="product-meta-info">
            <p class="product-date">${t('product_detail.added', 'Přidáno')}: ${date}</p>
        </div>
    `;
}

// Zobrazit detail sdíleného produktu (read-only)
async function viewSharedProductDetail(productId) {
    if (!isValidUUID(productId)) {
        console.error('Invalid product ID format');
        return;
    }
    
    try {
        // Načíst produkt bez ověření vlastníka
        const product = await window.LiquiMixerDB.getProductByIdPublic(productId);
        
        if (!product) {
            showNotification(t('products.not_found', 'Produkt nenalezen.'), 'error');
            return;
        }
        
        // Uložit produkt pro případné zkopírování
        window.currentSharedProduct = product;
        
        // Zobrazit detail
        displaySharedProductDetail(product);
        showPage('shared-product-detail');
        
    } catch (error) {
        console.error('Error loading shared product:', error);
        showNotification(t('products.load_error', 'Chyba při načítání produktu.'), 'error');
    }
}

// Zobrazit detail sdíleného produktu v UI (read-only)
function displaySharedProductDetail(product) {
    const titleEl = document.getElementById('sharedProductDetailTitle');
    const contentEl = document.getElementById('sharedProductDetailContent');
    
    titleEl.textContent = product.name;
    
    const rating = Math.min(Math.max(parseInt(product.rating) || 0, 0), 5);
    const stars = '★'.repeat(rating) + '☆'.repeat(5 - rating);
    const currentLocale = window.i18n?.currentLocale || 'cs';
    const date = new Date(product.created_at).toLocaleDateString(currentLocale);
    const typeLabel = getProductTypeLabel(product.product_type);
    const typeIcon = productTypeIcons[product.product_type] || '🍓';
    
    const safeDescription = escapeHtml(product.description);
    
    let imageHtml = '';
    if (product.image_url) {
        imageHtml = `<div class="product-detail-image"><img src="${escapeHtml(product.image_url)}" alt="${escapeHtml(product.name)}"></div>`;
    }
    
    let urlHtml = '';
    if (product.product_url) {
        const cleanUrl = sanitizeUrl(product.product_url);
        if (cleanUrl) {
            urlHtml = `
                <div class="product-detail-url">
                    <a href="${cleanUrl}" target="_blank" rel="noopener noreferrer" class="neon-button secondary">
                        ${t('product_detail.open_link', 'Otevřít odkaz na produkt')}
                    </a>
                </div>
            `;
        }
    }
    
    contentEl.innerHTML = `
        ${imageHtml}
        <div class="product-detail-header">
            <div class="product-detail-type">
                <span class="product-type-badge large">${typeIcon} ${escapeHtml(typeLabel)}</span>
            </div>
            <div class="product-detail-rating">${stars}</div>
            ${safeDescription ? `<p class="product-detail-description">${safeDescription}</p>` : ''}
        </div>
        ${urlHtml}
        <div class="product-meta-info">
            <p class="product-date">${t('product_detail.added', 'Přidáno')}: ${date}</p>
        </div>
    `;
}

// Zkopírovat sdílený produkt do účtu aktuálního uživatele
async function copySharedProductToUser() {
    // Kontrola přihlášení A předplatného
    if (!requireSubscription()) {
        return;
    }
    
    const product = window.currentSharedProduct;
    if (!product) {
        showNotification(t('products.not_found', 'Produkt nenalezen.'), 'error');
        return;
    }
    
    try {
        const copied = await window.LiquiMixerDB.copyProductToUser(product.id, window.Clerk.user.id);
        
        if (copied) {
            showNotification(t('shared_recipe.product_saved', 'Product saved to your favorites!'), 'success');
            // Přejít na detail nového produktu
            currentViewingProduct = copied;
            displayProductDetail(copied);
            showPage('product-detail');
        } else {
            showNotification(t('products.save_error', 'Chyba při ukládání produktu.'), 'error');
        }
    } catch (error) {
        console.error('Error copying product:', error);
        showNotification(t('products.save_error', 'Chyba při ukládání produktu.'), 'error');
    }
}

// Zpět ze sdíleného produktu
function goBackFromSharedProduct() {
    // Vrátit se na sdílený recept pokud existuje
    if (window.currentSharedRecipe) {
        showPage('shared-recipe');
    } else {
        showPage('intro');
    }
}

// Získat přeložený typ produktu
function getProductTypeLabel(type) {
    const typeKeys = {
        'vg': 'products.type_vg',
        'pg': 'products.type_pg',
        'flavor': 'products.type_flavor',
        'nicotine_booster': 'products.type_nicotine_booster',
        'nicotine_salt': 'products.type_nicotine_salt',
        'premixed_base': 'products.type_premixed_base'
    };
    const key = typeKeys[type] || 'products.type_flavor';
    return t(key, productTypeLabels[type] || 'Flavor');
}

// Mapování typů produktů na názvy
const productTypeLabels = {
    'vg': 'VG (Glycerin)',
    'pg': 'PG (Propylene Glycol)',
    'flavor': 'Flavor',
    'nicotine_booster': 'Nicotine Booster',
    'nicotine_salt': 'Nicotine Salt',
    'premixed_base': 'Premixed PG/VG Base'
};

// Mapování typů produktů na ikony
const productTypeIcons = {
    'vg': '💧',
    'pg': '💧',
    'flavor': '🍓',
    'nicotine_booster': '⚗',
    'nicotine_salt': '🧪',
    'premixed_base': '🧪'
};

// Zobrazit formulář pro přidání produktu
function showAddProductForm() {
    // PRO funkce - vyžaduje přihlášení A předplatné
    if (!requireSubscription()) {
        return;
    }
    
    document.getElementById('productFormTitle').textContent = t('product_form.add_title', 'Přidat produkt');
    document.getElementById('editingProductId').value = '';
    document.getElementById('productName').value = '';
    document.getElementById('productType').value = '';
    document.getElementById('productDescription').value = '';
    document.getElementById('productRating').value = '0';
    document.getElementById('productUrl').value = '';
    document.getElementById('productImageUrl').value = '';
    document.getElementById('productImagePreview').innerHTML = '<span class="image-placeholder">📷</span>';
    
    // Reset flavor-specifických polí
    const flavorSection = document.getElementById('flavorFieldsSection');
    if (flavorSection) flavorSection.classList.add('hidden');
    const flavorProductType = document.getElementById('productFlavorProductType');
    if (flavorProductType) flavorProductType.value = '';
    const flavorManufacturer = document.getElementById('productFlavorManufacturer');
    if (flavorManufacturer) { flavorManufacturer.innerHTML = '<option value="" data-i18n="product_form.type_select">-- Vyberte --</option>'; }
    const flavorCategory = document.getElementById('productFlavorCategory');
    if (flavorCategory) flavorCategory.value = '';
    const flavorMinPercent = document.getElementById('productFlavorMinPercent');
    if (flavorMinPercent) flavorMinPercent.value = '';
    const flavorMaxPercent = document.getElementById('productFlavorMaxPercent');
    if (flavorMaxPercent) flavorMaxPercent.value = '';
    const flavorSteepDays = document.getElementById('productFlavorSteepDays');
    if (flavorSteepDays) flavorSteepDays.value = '7';
    const flavorCode = document.getElementById('productFlavorCode');
    if (flavorCode) flavorCode.value = '';
    const suggestCheckbox = document.getElementById('productSuggestToDatabase');
    if (suggestCheckbox) suggestCheckbox.checked = false;
    
    // Povolit výběr typu produktu při přidávání nového
    const productTypeSelect = document.getElementById('productType');
    if (productTypeSelect) {
        productTypeSelect.disabled = false;
        productTypeSelect.title = '';
    }
    
    selectedProductRating = 0;
    updateProductStarDisplay(0);
    initProductStarRating();
    
    showPage('product-form');
}

// Upravit produkt
async function editProduct() {
    if (!currentViewingProduct) return;
    
    // Zakázat editaci produktů vytvořených automaticky z kategorie
    if (currentViewingProduct.description === 'auto:category') {
        showNotification(t('products.category_no_edit', 'Produkt vytvořený z kategorie nelze upravit.'), 'warning');
        return;
    }
    
    document.getElementById('productFormTitle').textContent = t('product_form.edit_title', 'Upravit produkt');
    document.getElementById('editingProductId').value = currentViewingProduct.id;
    document.getElementById('productName').value = currentViewingProduct.name || '';
    document.getElementById('productType').value = currentViewingProduct.product_type || 'flavor';
    document.getElementById('productDescription').value = currentViewingProduct.description || '';
    document.getElementById('productRating').value = currentViewingProduct.rating || '0';
    document.getElementById('productUrl').value = currentViewingProduct.product_url || '';
    document.getElementById('productImageUrl').value = currentViewingProduct.image_url || '';
    
    if (currentViewingProduct.image_url) {
        document.getElementById('productImagePreview').innerHTML = `<img src="${escapeHtml(currentViewingProduct.image_url)}" alt="Preview">`;
    } else {
        document.getElementById('productImagePreview').innerHTML = '<span class="image-placeholder">📷</span>';
    }
    
    // Zakázat změnu typu produktu při editaci
    // Typ produktu se nesmí měnit, aby zůstal konzistentní s product_code při sdílení
    const productTypeSelect = document.getElementById('productType');
    if (productTypeSelect) {
        productTypeSelect.disabled = true;
        productTypeSelect.title = t('product_form.type_locked', 'Typ produktu nelze změnit po vytvoření');
    }
    
    // Pro příchutě nastavit product_code a rozbalit podformulář
    const productCodeInput = document.getElementById('productFlavorCode');
    if (productCodeInput) {
        productCodeInput.value = currentViewingProduct.product_code || '';
    }
    
    // Pokud je typ produktu 'flavor', rozbalit podformulář příchutě
    if (currentViewingProduct.product_type === 'flavor') {
        toggleFlavorFields();
        
        // Počkat na načtení výrobců do dropdownu (async operace)
        await initFlavorManufacturersSelect();
        
        // Předvyplnit hodnoty podformulář příchutě
        const flavorProductType = document.getElementById('productFlavorProductType');
        if (flavorProductType) {
            flavorProductType.value = currentViewingProduct.flavor_product_type || 'vape';
        }
        
        const flavorCategory = document.getElementById('productFlavorCategory');
        if (flavorCategory) {
            flavorCategory.value = currentViewingProduct.flavor_category || 'mix';
        }
        
        const flavorMinPercent = document.getElementById('productFlavorMinPercent');
        if (flavorMinPercent) {
            flavorMinPercent.value = currentViewingProduct.flavor_min_percent || '';
        }
        
        const flavorMaxPercent = document.getElementById('productFlavorMaxPercent');
        if (flavorMaxPercent) {
            flavorMaxPercent.value = currentViewingProduct.flavor_max_percent || '';
        }
        
        const flavorSteepDays = document.getElementById('productFlavorSteepDays');
        if (flavorSteepDays) {
            flavorSteepDays.value = currentViewingProduct.steep_days || '7';
        }
        
        // Nastavit výrobce v selectu - použít manufacturer_code nebo najít podle názvu
        const flavorManufacturer = document.getElementById('productFlavorManufacturer');
        if (flavorManufacturer && currentViewingProduct.manufacturer) {
            const manufacturerValue = currentViewingProduct.manufacturer;
            let found = false;
            
            // 1. Zkusit přímou shodu s option.value (manufacturer_code)
            for (let option of flavorManufacturer.options) {
                if (option.value === manufacturerValue) {
                    flavorManufacturer.value = option.value;
                    found = true;
                    break;
                }
            }
            
            // 2. Fallback: hledat podle názvu v textContent
            if (!found) {
                for (let option of flavorManufacturer.options) {
                    if (option.textContent.toLowerCase().includes(manufacturerValue.toLowerCase())) {
                        flavorManufacturer.value = option.value;
                        break;
                    }
                }
            }
        }
    }
    
    selectedProductRating = currentViewingProduct.rating || 0;
    updateProductStarDisplay(selectedProductRating);
    initProductStarRating();
    
    showPage('product-form');
}

// Smazat produkt
async function deleteProduct() {
    if (!currentViewingProduct) return;
    
    if (!confirm(t('product_detail.delete_confirm', 'Opravdu chcete smazat tento produkt?'))) return;
    
    try {
        const success = await window.LiquiMixerDB.deleteProduct(window.Clerk.user.id, currentViewingProduct.id);
        
        if (success) {
            alert(t('products.deleted', 'Produkt byl smazán.'));
            currentViewingProduct = null;
            showFavoriteProducts();
        } else {
            alert(t('products.delete_error', 'Chyba při mazání produktu.'));
        }
    } catch (error) {
        console.error('Error deleting product:', error);
        alert(t('products.delete_error', 'Chyba při mazání produktu.'));
    }
}

// Zrušit formulář produktu
function cancelProductForm() {
    const editingId = document.getElementById('editingProductId').value;
    if (editingId && currentViewingProduct) {
        showPage('product-detail');
    } else {
        showFavoriteProducts();
    }
}

// Toggle flavor fields visibility
function toggleFlavorFields() {
    const productType = document.getElementById('productType').value;
    const flavorSection = document.getElementById('flavorFieldsSection');
    const flavorCategory = document.getElementById('productFlavorCategory');
    
    if (!flavorSection) return;
    
    if (productType === 'flavor') {
        flavorSection.classList.remove('hidden');
        if (flavorCategory) flavorCategory.required = true;
        // Načíst výrobce do selectu
        initFlavorManufacturersSelect();
        // Aktualizovat nápovědu pro rate limit
        updateFlavorSuggestionHint();
    } else {
        flavorSection.classList.add('hidden');
        if (flavorCategory) flavorCategory.required = false;
    }
}

// Inicializovat select s výrobci příchutí
async function initFlavorManufacturersSelect() {
    const select = document.getElementById('productFlavorManufacturer');
    if (!select) return;
    
    // Pokud již naplněno, přeskočit
    if (select.options.length > 1) return;
    
    try {
        // Použít cache pokud existuje
        if (!flavorManufacturersCache) {
            flavorManufacturersCache = await window.LiquiMixerDB.getFlavorManufacturers();
        }
        
        flavorManufacturersCache.forEach(m => {
            const option = document.createElement('option');
            option.value = m.code;
            option.textContent = `${m.name} (${m.country_code})`;
            select.appendChild(option);
        });
    } catch (e) {
        console.error('Error loading manufacturers for select:', e);
    }
}

// Aktualizovat nápovědu pro návrhy příchutí
async function updateFlavorSuggestionHint() {
    const hintEl = document.getElementById('flavorSuggestionHint');
    if (!hintEl) return;
    
    const clerkId = window.Clerk?.user?.id;
    if (!clerkId) {
        hintEl.textContent = '';
        return;
    }
    
    try {
        const count = await window.LiquiMixerDB.getUserSuggestionCount(clerkId);
        const remaining = Math.max(0, 5 - count);
        
        if (remaining === 0) {
            hintEl.textContent = t('flavor_suggestion.rate_limit_reached', 'Weekly suggestion limit reached');
            hintEl.classList.add('error');
            document.getElementById('productSuggestToDatabase').disabled = true;
        } else {
            hintEl.textContent = t('flavor_suggestion.rate_limit', 'You can suggest max 5 flavors per week').replace('5', remaining);
            hintEl.classList.remove('error');
            document.getElementById('productSuggestToDatabase').disabled = false;
        }
    } catch (e) {
        console.error('Error getting suggestion count:', e);
    }
}

// Uložit produkt
async function saveProduct(event) {
    event.preventDefault();
    
    // PRO funkce - vyžaduje přihlášení A předplatné
    if (!requireSubscription()) {
        return false;
    }
    
    const name = document.getElementById('productName').value.trim();
    const productType = document.getElementById('productType').value;
    const description = document.getElementById('productDescription').value.trim();
    const rating = parseInt(document.getElementById('productRating').value) || 0;
    const productUrl = document.getElementById('productUrl').value.trim();
    const imageUrl = document.getElementById('productImageUrl').value;
    const editingId = document.getElementById('editingProductId').value;
    
    if (!name) {
        alert(t('product_form.name_required', 'Název produktu je povinný.'));
        return false;
    }
    
    if (!productType) {
        alert(t('product_form.type_required', 'Vyberte typ produktu.'));
        return false;
    }
    
    // Validace pro příchutě
    if (productType === 'flavor') {
        const flavorProductType = document.getElementById('productFlavorProductType').value;
        const flavorManufacturer = document.getElementById('productFlavorManufacturer').value;
        
        if (!flavorProductType) {
            alert(t('flavor_form.product_type_required', 'Vyberte prosím typ příchutě'));
            return false;
        }
        
        if (!flavorManufacturer) {
            alert(t('flavor_form.manufacturer_required', 'Vyberte prosím výrobce'));
            return false;
        }
    }
    
    const productData = {
        name: name,
        product_type: productType,
        description: description,
        rating: rating,
        product_url: productUrl,
        image_url: imageUrl
    };
    
    // Přidat flavor-specifická data
    if (productType === 'flavor') {
        productData.flavor_product_type = document.getElementById('productFlavorProductType').value;
        productData.manufacturer = document.getElementById('productFlavorManufacturer').value;
        productData.flavor_category = document.getElementById('productFlavorCategory').value;
        productData.flavor_min_percent = parseFloat(document.getElementById('productFlavorMinPercent').value) || null;
        productData.flavor_max_percent = parseFloat(document.getElementById('productFlavorMaxPercent').value) || null;
        productData.steep_days = parseInt(document.getElementById('productFlavorSteepDays').value) || 7;
        productData.product_code = document.getElementById('productFlavorCode')?.value?.trim() || null;
        
        // Získat název výrobce pro uložení
        const manufacturerSelect = document.getElementById('productFlavorManufacturer');
        const selectedOption = manufacturerSelect.options[manufacturerSelect.selectedIndex];
        if (selectedOption) {
            const text = selectedOption.textContent;
            // Extrahovat název před závorkou
            productData.manufacturer = text.split(' (')[0] || productData.manufacturer;
        }
    }
    
    try {
        let saved;
        
        if (editingId) {
            saved = await window.LiquiMixerDB.updateProduct(window.Clerk.user.id, editingId, productData);
        } else {
            saved = await window.LiquiMixerDB.saveProduct(window.Clerk.user.id, productData);
        }
        
        if (saved) {
            // Pokud bylo zaškrtnuto "Navrhnout do databáze"
            if (productType === 'flavor' && document.getElementById('productSuggestToDatabase')?.checked) {
                await submitFlavorSuggestionFromProduct(productData);
            }
            
            alert(editingId ? t('product_form.updated', 'Product updated!') : t('product_form.success', 'Product saved!'));
            showFavoriteProducts();
        } else {
            alert(t('product_form.error', 'Chyba při ukládání produktu.'));
        }
    } catch (error) {
        console.error('Error saving product:', error);
        alert(t('product_form.error', 'Chyba při ukládání produktu.'));
    }
    
    return false;
}

// Odeslat návrh příchutě do databáze
async function submitFlavorSuggestionFromProduct(productData) {
    const clerkId = window.Clerk?.user?.id;
    if (!clerkId) return;
    
    try {
        const flavorData = {
            name: productData.name,
            manufacturer_code: document.getElementById('productFlavorManufacturer').value,
            product_type: productData.flavor_product_type,
            category: productData.flavor_category || 'mix',
            min_percent: productData.flavor_min_percent,
            max_percent: productData.flavor_max_percent,
            steep_days: productData.steep_days
        };
        
        const result = await window.LiquiMixerDB.submitFlavorSuggestion(clerkId, flavorData);
        
        if (result.error) {
            if (result.error.message?.includes('limit')) {
                showNotification(t('flavor_suggestion.rate_limit_reached', 'Weekly suggestion limit reached'), 'warning');
            } else {
                console.error('Flavor suggestion error:', result.error);
            }
        } else {
            showNotification(t('flavor_suggestion.submitted', 'Návrh odeslán ke schválení'), 'success');
        }
    } catch (e) {
        console.error('Error submitting flavor suggestion:', e);
    }
}

// Inicializace hvězdičkového hodnocení pro produkty
function initProductStarRating() {
    const stars = document.querySelectorAll('#productStarRating .star');
    
    stars.forEach(star => {
        star.addEventListener('click', function() {
            selectedProductRating = parseInt(this.dataset.rating);
            document.getElementById('productRating').value = selectedProductRating;
            updateProductStarDisplay(selectedProductRating);
        });
        
        star.addEventListener('mouseover', function() {
            highlightProductStars(parseInt(this.dataset.rating));
        });
        
        star.addEventListener('mouseout', function() {
            updateProductStarDisplay(selectedProductRating);
        });
    });
}

function highlightProductStars(rating) {
    const stars = document.querySelectorAll('#productStarRating .star');
    stars.forEach((star, index) => {
        star.textContent = index < rating ? '★' : '☆';
        star.classList.toggle('active', index < rating);
    });
}

function updateProductStarDisplay(rating) {
    highlightProductStars(rating);
}

// Náhled obrázku produktu
function previewProductImage(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    // Validace
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
        alert(t('product_form.image_format', 'Povolené formáty: JPEG, PNG, WebP, GIF'));
        return;
    }
    
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
        alert(t('product_form.image_size', 'Maximální velikost obrázku je 5MB.'));
        return;
    }
    
    // Náhled
    const reader = new FileReader();
    reader.onload = function(e) {
        document.getElementById('productImagePreview').innerHTML = `<img src="${e.target.result}" alt="Preview">`;
        // Uložit jako base64 (pro jednoduchost - v produkci použít Supabase Storage)
        document.getElementById('productImageUrl').value = e.target.result;
    };
    reader.readAsDataURL(file);
}

// Vyfotit produkt (pouze mobilní)
function captureProductPhoto() {
    // Zkontrolovat podporu kamery
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert(t('product_form.camera_error', 'Your browser does not support camera access.'));
        return;
    }
    
    // Použít input s capture atributem
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment';
    input.onchange = previewProductImage;
    input.click();
}

// Inicializace při načtení stránky
window.addEventListener('load', async function() {
    // Zkusit načíst sdílený recept
    const isSharedRecipe = await loadSharedRecipe();
    if (isSharedRecipe) return;
    
    // Zkusit načíst příchuť z SEO stránky (?seo_flavor=slug)
    const isSeoFlavor = await loadSeoFlavor();
    if (isSeoFlavor) return;
});

// Close menus when clicking outside
document.addEventListener('click', function(event) {
    const menuDropdown = document.getElementById('menuDropdown');
    const loginModal = document.getElementById('loginModal');
    const userProfileModal = document.getElementById('userProfileModal');
    const menuBtn = document.querySelector('.menu-btn');
    const loginBtn = document.querySelector('.login-btn');
    
    // Check if click is outside menu dropdown
    if (menuDropdown && !menuDropdown.classList.contains('hidden')) {
        if (!menuDropdown.contains(event.target) && !menuBtn.contains(event.target)) {
            menuDropdown.classList.add('hidden');
        }
    }
    
    // Check if click is outside login modal
    // DŮLEŽITÉ: Clerk používá portály/overlay mimo loginModal DOM (eye icon, popups)
    // Proto kontrolujeme i Clerk elementy, aby se modal nezavíral při interakci s Clerk komponentou
    if (loginModal && !loginModal.classList.contains('hidden')) {
        const isClerkElement = event.target.closest('[class*="cl-"], [data-clerk], .cl-rootBox, .cl-card, .cl-internal-');
        if (!loginModal.contains(event.target) && !loginBtn.contains(event.target) && !isClerkElement) {
            hideLoginModal();
        }
    }
    
    // Check if click is outside user profile modal
    if (userProfileModal && !userProfileModal.classList.contains('hidden')) {
        if (!userProfileModal.contains(event.target) && !loginBtn.contains(event.target)) {
            hideUserProfileModal();
        }
    }
});

// Toggle edu accordion (safety & prep section)
function toggleEduSection(button) {
    const content = button.nextElementSibling;
    const isActive = button.classList.contains('active');
    if (isActive) {
        button.classList.remove('active');
        content.classList.remove('open');
    } else {
        button.classList.add('active');
        content.classList.add('open');
    }
}

// Update hero savings text with dynamic currency based on locale
function updateHeroSavings() {
    const el = document.getElementById('heroSavingsText');
    if (!el) return;
    const prices = {
        CZK: { commercial: '120–350 Kč', diy: '25 Kč' },
        EUR: { commercial: '5–15 €', diy: '1 €' },
        USD: { commercial: '$5–15', diy: '$1' }
    };
    const langToCurrency = {
        cs: 'CZK', sk: 'CZK',
        de: 'EUR', fr: 'EUR', it: 'EUR', es: 'EUR', pt: 'EUR', nl: 'EUR',
        pl: 'EUR', ro: 'EUR', hu: 'EUR', el: 'EUR', bg: 'EUR', hr: 'EUR',
        sl: 'EUR', et: 'EUR', lv: 'EUR', lt: 'EUR', fi: 'EUR', sv: 'EUR',
        da: 'EUR', no: 'EUR', sr: 'EUR',
        en: 'USD', ja: 'USD', ko: 'USD', 'zh-CN': 'USD', 'zh-TW': 'USD',
        'ar-SA': 'USD', tr: 'USD', ru: 'USD', uk: 'USD'
    };
    const locale = window.i18n?.getLocale?.() || navigator.language?.split('-')[0] || 'en';
    const currency = langToCurrency[locale] || 'EUR';
    const p = prices[currency];
    const savingsKey = 'intro.hero_savings';
    let text = t(savingsKey);
    if (text === savingsKey) return;
    text = text.replace('{commercial}', p.commercial).replace('{diy}', p.diy);
    el.textContent = text;
    // Remove data-i18n so applyTranslations() won't overwrite interpolated text
    el.removeAttribute('data-i18n');
}

function togglePrepDetail(button) {
    const accordion = button.parentElement;
    const detail = accordion.querySelector('.prep-detail');
    const isActive = button.classList.contains('active');
    
    // Close all other accordions
    document.querySelectorAll('.prep-item-btn.active').forEach(btn => {
        if (btn !== button) {
            btn.classList.remove('active');
            btn.parentElement.querySelector('.prep-detail').classList.remove('open');
        }
    });
    
    // Toggle current accordion
    if (isActive) {
        button.classList.remove('active');
        detail.classList.remove('open');
    } else {
        button.classList.add('active');
        detail.classList.add('open');
    }
}

// Aktuální stránka pro sledování navigace
let currentPageId = 'intro';

function showPage(pageId, pushToHistory = true) {
    // Nepushovat do historie pokud jsme už na stejné stránce
    if (pageId === currentPageId && pushToHistory) {
        return;
    }
    
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    document.getElementById(pageId).classList.add('active');
    window.scrollTo(0, 0);
    
    // Přidat do browser historie (pokud není navigace zpět)
    if (pushToHistory) {
        history.pushState({ pageId: pageId }, '', '');
    }
    
    // Aktualizovat aktuální stránku
    currentPageId = pageId;

    // Initialize dilute form sliders when shown
    if (pageId === 'dilute-form') {
        updateDiluteSourceRatioDisplay();
        updateDiluteTargetRatioDisplay();
    }
    
    // Shisha form se inicializuje explicitně z mode-select navigace, ne při každém showPage
    // (stejný vzor jako liquid pro formulář na stránce 'form')
    
    // Animovat texty tlačítek na stránce mode-select
    if (pageId === 'mode-select' && typeof window.animateModeButtons === 'function') {
        setTimeout(window.animateModeButtons, 50);
    }
    
    // Při návratu na přehled receptů refreshnout vyzrálé připomínky
    if (pageId === 'my-recipes' && allUserRecipes.length > 0) {
        loadMaturedRecipeIds().then(() => filterRecipes());
    }
    
    // Zobrazit/skrýt tlačítko Domů
    updateHomeButtonVisibility(pageId);
}

// Inicializovat historii při načtení stránky
function initHistoryNavigation() {
    // Nastavit počáteční stav historie
    history.replaceState({ pageId: 'intro' }, '', '');
    
    // Listener pro tlačítko zpět v prohlížeči
    window.addEventListener('popstate', (event) => {
        if (event.state && event.state.pageId) {
            // Navigovat na předchozí stránku bez přidání do historie
            showPage(event.state.pageId, false);
        } else {
            // Fallback na intro
            showPage('intro', false);
        }
    });
}

// Aktualizovat viditelnost tlačítka Domů
function updateHomeButtonVisibility(pageId) {
    const homeBtn = document.getElementById('homeButton');
    if (!homeBtn) return;
    
    // Stránky kde se NEZOBRAZUJE tlačítko Domů (úvodní stránka a formuláře)
    const hideOnPages = ['intro', 'form', 'dilute-form', 'product-form'];
    
    if (hideOnPages.includes(pageId)) {
        homeBtn.classList.remove('visible');
    } else {
        homeBtn.classList.add('visible');
    }
}

// Přejít na úvodní stránku — reload stránky resetuje vše (formuláře, stav, JS proměnné)
function goHome() {
    window.location.href = '/';
}

// Vyčistit stav editace receptu
function clearRecipeEditingState() {
    window.editingRecipeFromDetail = null;
    window.editingRecipeId = null;
    window.allowTabSwitch = true;
    window.allowShishaTabSwitch = true;
    
    // Obnovit stav záložek formuláře
    updateFormTabsState();
    updateShishaTabsState();
    
    console.log('[clearRecipeEditingState] Editing state cleared');
}

// Aktualizovat stav záložek shisha formuláře (disabled v režimu editace)
function updateShishaTabsState() {
    const tabs = document.querySelectorAll('#shisha-form .form-tab');
    if (window.editingRecipeFromDetail) {
        tabs.forEach(tab => {
            const tabMode = (tab.dataset.tab || '').replace('shisha-', '');
            if (tabMode !== currentShishaMode) {
                tab.classList.add('tab-disabled');
            } else {
                tab.classList.remove('tab-disabled');
            }
        });
    } else {
        tabs.forEach(tab => {
            tab.classList.remove('tab-disabled');
        });
    }
}

// Navigace zpět v historii pomocí Browser History API
function goBack() {
    // Reset stavu editace receptu
    clearRecipeEditingState();
    
    // Použít nativní history.back() pro navigaci zpět
    if (history.length > 1) {
        history.back();
    } else {
        // Fallback na úvodní stránku pokud není historie
        showPage('intro');
    }
}

// =========================================
// VG/PG Ratio Functions
// =========================================

function adjustRatio(change) {
    const slider = document.getElementById('vgPgRatio');
    let currentValue = parseInt(slider.value);
    
    // Round to nearest 5
    let newValue;
    if (change > 0) {
        // Moving right (more VG) - round up to next 5
        newValue = Math.ceil((currentValue + 1) / 5) * 5;
    } else {
        // Moving left (less VG) - round down to previous 5
        newValue = Math.floor((currentValue - 1) / 5) * 5;
    }
    
    // Clamp to allowed limits
    newValue = Math.max(vgPgLimits.min, Math.min(vgPgLimits.max, newValue));
    slider.value = newValue;
    liquidUserManuallyChangedRatio = true;
    updateRatioDisplay();
}

// Získat přeložený popis poměru VG/PG
function getRatioDescriptionText(vg) {
    if (vg >= 0 && vg <= 9) return t('ratio_descriptions.vg_0_9', ratioDescriptions[0].text);
    if (vg >= 10 && vg <= 29) return t('ratio_descriptions.vg_10_29', ratioDescriptions[1].text);
    if (vg >= 30 && vg <= 34) return t('ratio_descriptions.vg_30_34', ratioDescriptions[2].text);
    if (vg >= 35 && vg <= 40) return t('ratio_descriptions.vg_35_40', ratioDescriptions[3].text);
    if (vg >= 41 && vg <= 55) return t('ratio_descriptions.vg_41_55', ratioDescriptions[4].text);
    if (vg >= 56 && vg <= 60) return t('ratio_descriptions.vg_56_60', ratioDescriptions[5].text);
    if (vg >= 61 && vg <= 70) return t('ratio_descriptions.vg_61_70', ratioDescriptions[6].text);
    if (vg >= 71 && vg <= 90) return t('ratio_descriptions.vg_71_90', ratioDescriptions[7].text);
    if (vg >= 91 && vg <= 100) return t('ratio_descriptions.vg_91_100', ratioDescriptions[8].text);
    return '';
}

function updateRatioDisplay() {
    const vg = parseInt(vgPgRatioSlider.value);
    const pg = 100 - vg;
    
    document.getElementById('vgValue').textContent = vg;
    document.getElementById('pgValue').textContent = pg;
    
    // Find matching description
    const desc = ratioDescriptions.find(d => vg >= d.vgMin && vg <= d.vgMax);
    if (desc) {
        const descEl = document.getElementById('ratioDescription');
        descEl.textContent = getRatioDescriptionText(vg);
        descEl.style.color = desc.color;
        descEl.style.borderLeftColor = desc.color;
        document.getElementById('sliderTrack').style.background = 
            `linear-gradient(90deg, ${desc.color}, ${adjustColorBrightness(desc.color, 30)})`;
    }
}

// Store current VG/PG limits
let vgPgLimits = { min: 0, max: 100 };

// Flagy pro ruční změnu VG/PG slideru uživatelem
// Když je true, automatické přenastavení slideru při změně báze se neprovede
let liquidUserManuallyChangedRatio = false;
let proUserManuallyChangedRatio = false;
let shishaUserManuallyChangedRatio = false;
let shakevapeUserManuallyChangedRatio = false;
// Příznak pro potlačení auto-přepisu VG/PG slideru během předvyplňování uloženého receptu
let _prefillingSavedRecipe = false;

// Calculate and update VG/PG slider limits based on nicotine and flavor settings
function updateVgPgRatioLimits() {
    const slider = document.getElementById('vgPgRatio');
    const warningEl = document.getElementById('ratioLimitWarning');
    const disabledLeft = document.getElementById('sliderDisabledLeft');
    const disabledRight = document.getElementById('sliderDisabledRight');
    
    // Get current settings
    const totalAmount = parseFloat(document.getElementById('totalAmount').value) || 100;
    const nicotineType = nicotineTypeSelect.value;
    const targetNicotine = parseFloat(targetNicotineSlider.value) || 0;
    const baseNicotine = parseFloat(document.getElementById('nicotineBaseStrength').value) || 0;
    
    // Získat informace o konkrétní příchuti (pokud je vybraná)
    const flavorAutocomplete = document.getElementById('flavorAutocomplete');
    const hasSpecificFlavor = (flavorAutocomplete?.dataset.flavorId || flavorAutocomplete?.dataset.favoriteProductId || flavorAutocomplete?.dataset.flavorData) && flavorAutocomplete?.dataset.flavorSource !== 'generic';
    let specificFlavorName = null;
    let specificFlavorManufacturer = null;
    let specificFlavorVgRatio = null;
    let specificFlavorId = null;
    let specificFavoriteProductId = null;
    let specificFlavorSource = 'generic';
    
    if (flavorAutocomplete && flavorAutocomplete.dataset.flavorData) {
        try {
            const flavorData = JSON.parse(flavorAutocomplete.dataset.flavorData);
            if (flavorData && flavorData.name) {
                specificFlavorName = flavorData.name;
                specificFlavorManufacturer = flavorData.manufacturer || flavorData.manufacturer_code;
                // Většina aromat je 100% PG (0% VG)
                specificFlavorVgRatio = flavorData.vg_ratio !== undefined ? flavorData.vg_ratio : 0;
                // ID a zdroj příchutě
                const isFavorite = flavorData.source === 'favorites' || flavorData.source === 'favorite';
                if (isFavorite) {
                    specificFavoriteProductId = flavorData.favorite_product_id || flavorData.id || null;
                    specificFlavorId = flavorData.flavor_id || null;
                } else {
                    specificFlavorId = flavorData.flavor_id || flavorData.id || flavorAutocomplete.dataset.flavorId || null;
                }
                specificFlavorSource = flavorAutocomplete.dataset.flavorSource || (isFavorite ? 'favorite' : 'database');
            }
        } catch (e) {
            console.log('Error parsing flavor data:', e);
        }
    }
    
    // Příchuť je aktivní pokud je vybraná konkrétní NEBO je zvolena kategorie
    const flavorType = flavorTypeSelect.value;
    const hasFlavor = hasSpecificFlavor || (flavorType !== 'none' && flavorType !== '');
    const flavorPercent = hasFlavor ? parseFloat(flavorStrengthSlider.value) : 0;
    
    // Calculate nicotine volume
    let nicotineVolume = 0;
    if (nicotineType !== 'none' && targetNicotine > 0 && baseNicotine > 0) {
        nicotineVolume = (targetNicotine * totalAmount) / baseNicotine;
    }

    // Calculate flavor volume
    const flavorVolume = (flavorPercent / 100) * totalAmount;

    // Get nicotine VG/PG ratio
    let nicVgPercent = 50;
    let nicPgPercent = 50;
    if (nicotineType !== 'none') {
        const nicotineRatio = document.getElementById('nicotineRatio').value;
        if (nicotineRatio === '50/50') {
            nicVgPercent = 50;
            nicPgPercent = 50;
        } else if (nicotineRatio === '70/30') {
            nicVgPercent = 70;
            nicPgPercent = 30;
        }
    }

    // Get flavor VG/PG ratio - dynamické parsování z formátu "VG/PG"
    let flavorVgPercent = 0;
    let flavorPgPercent = 100;
    if (hasFlavor) {
        const flavorRatio = document.getElementById('flavorRatio').value || '0/100';
        const ratioParts = flavorRatio.split('/');
        flavorVgPercent = parseInt(ratioParts[0]) || 0;
        flavorPgPercent = parseInt(ratioParts[1]) || (100 - flavorVgPercent);
    }

    // Calculate VG and PG from nicotine
    const nicotineVgVolume = nicotineVolume * (nicVgPercent / 100);
    const nicotinePgVolume = nicotineVolume * (nicPgPercent / 100);

    // Calculate VG and PG from flavor
    const flavorVgVolume = flavorVolume * (flavorVgPercent / 100);
    const flavorPgVolume = flavorVolume * (flavorPgPercent / 100);

    // Total fixed VG and PG
    const fixedPgVolume = nicotinePgVolume + flavorPgVolume;
    const fixedVgVolume = nicotineVgVolume + flavorVgVolume;
    
    // Zbývající objem pro bázi
    const remainingVolume = totalAmount - nicotineVolume - flavorVolume;
    
    // Zkontrolovat jestli je vybraný premixed režim
    const baseType = document.getElementById('baseType')?.value || 'separate';
    const premixedRatio = document.getElementById('premixedRatio')?.value || '60/40';
    
    let minVgPercent, maxVgPercent;
    
    if (baseType === 'premixed' && remainingVolume > 0) {
        // PREMIXED režim - limity jsou ovlivněny poměrem báze
        const premixedParts = premixedRatio.split('/');
        const premixedVgPercent = parseInt(premixedParts[0]) || 50;
        
        // VG/PG z premixed báze (pokud použijeme celý zbývající objem)
        const premixedVgVolume = remainingVolume * (premixedVgPercent / 100);
        const premixedPgVolume = remainingVolume * ((100 - premixedVgPercent) / 100);
        
        // Minimální a maximální VG% závisí na tom, jestli přidáme čisté VG nebo PG
        // Min VG = báze + čisté PG (vše zbývající jako PG) = fixedVg + 0 (nelze méně než fixedVg)
        // Max VG = báze + čisté VG (vše zbývající jako VG) = fixedVg + remainingVolume
        
        // S premixed bází:
        // Pokud chceme MIN VG: použijeme bázi + čisté PG místo čistého VG
        // Pokud chceme MAX VG: použijeme bázi + čisté VG místo čistého PG
        
        // Ale pozor - bez doladění je poměr fixní na poměr báze + fixní složky
        // S doladěním můžeme dosáhnout rozsahu od fixedVg do fixedVg + remainingVolume
        
        minVgPercent = Math.ceil((fixedVgVolume / totalAmount) * 100);
        maxVgPercent = Math.floor(((fixedVgVolume + remainingVolume) / totalAmount) * 100);
    } else {
        // SEPARATE režim - původní logika
        // Minimum VG% = (fixed VG / total) * 100
        // Maximum VG% = 100 - (fixed PG / total) * 100
        minVgPercent = Math.ceil((fixedVgVolume / totalAmount) * 100);
        maxVgPercent = Math.floor(100 - (fixedPgVolume / totalAmount) * 100);
    }
    
    // Ensure valid range
    const effectiveMinVg = Math.max(0, minVgPercent);
    const effectiveMaxVg = Math.min(100, maxVgPercent);
    
    // Store limits for use in other functions
    vgPgLimits.min = effectiveMinVg;
    vgPgLimits.max = effectiveMaxVg;
    
    // Slider always stays 0-100, we handle limits visually and in code
    slider.min = 0;
    slider.max = 100;
    
    // Update disabled zones visually
    // HTML slider: left = min value (0), right = max value (100)
    // Slider value = VG%, so left side = 0% VG, right side = 100% VG
    const limitValueLeft = document.getElementById('limitValueLeft');
    const limitValueRight = document.getElementById('limitValueRight');
    
    if (disabledLeft) {
        // Left disabled zone: values 0 to effectiveMinVg-1
        const leftWidth = effectiveMinVg;
        disabledLeft.style.width = leftWidth + '%';
        
        // Show limit value above the red line (min VG allowed)
        if (limitValueLeft) {
            if (leftWidth > 0) {
                limitValueLeft.textContent = effectiveMinVg + '%';
                limitValueLeft.style.display = 'block';
            } else {
                limitValueLeft.style.display = 'none';
            }
        }
    }
    if (disabledRight) {
        // Right disabled zone: values effectiveMaxVg+1 to 100
        const rightWidth = 100 - effectiveMaxVg;
        disabledRight.style.width = rightWidth + '%';
        
        // Show limit value above the red line (max VG allowed)
        if (limitValueRight) {
            if (rightWidth > 0) {
                limitValueRight.textContent = effectiveMaxVg + '%';
                limitValueRight.style.display = 'block';
            } else {
                limitValueRight.style.display = 'none';
            }
        }
    }
    
    // Adjust current value if outside new limits
    let currentValue = parseInt(slider.value);
    
    if (currentValue < effectiveMinVg) {
        slider.value = effectiveMinVg;
    } else if (currentValue > effectiveMaxVg) {
        slider.value = effectiveMaxVg;
    }
    
    // Show/hide warning
    if (warningEl) {
        if (effectiveMinVg > 0 || effectiveMaxVg < 100) {
            const reasons = [];
            if (nicotineVolume > 0) {
                const nicReason = t('ratio_warning.reason_nicotine', 'nikotinová báze ({strength} mg/ml, VG/PG {vg}/{pg})')
                    .replace('{strength}', baseNicotine)
                    .replace('{vg}', nicVgPercent)
                    .replace('{pg}', nicPgPercent);
                reasons.push(nicReason);
            }
            if (flavorVolume > 0) {
                const flavorReason = t('ratio_warning.reason_flavor_percent', 'flavor ({percent}%, VG/PG {vg}/{pg})')
                    .replace('{percent}', flavorPercent)
                    .replace('{vg}', flavorVgPercent)
                    .replace('{pg}', flavorPgPercent);
                reasons.push(flavorReason);
            }
            const warningText = t('ratio_warning.limited_to', 'Poměr omezen na {min}–{max}% VG kvůli: {reasons}.')
                .replace('{min}', effectiveMinVg)
                .replace('{max}', effectiveMaxVg)
                .replace('{reasons}', reasons.join(', '));
            warningEl.textContent = warningText;
            warningEl.classList.remove('hidden');
        } else {
            warningEl.classList.add('hidden');
        }
    }
    
    // Update display
    updateRatioDisplay();
}

// Clamp slider value to allowed range
function clampVgPgValue() {
    const slider = document.getElementById('vgPgRatio');
    let value = parseInt(slider.value);
    
    if (value < vgPgLimits.min) {
        slider.value = vgPgLimits.min;
    } else if (value > vgPgLimits.max) {
        slider.value = vgPgLimits.max;
    }
    
    // Nastavit flag že uživatel ručně změnil poměr
    liquidUserManuallyChangedRatio = true;
    
    updateRatioDisplay();
}

// =========================================
// Nicotine Functions
// =========================================

function getNicotineMaxValue() {
    const type = nicotineTypeSelect.value;
    if (type === 'freebase') return 200;
    if (type === 'salt') return 72;
    return 200;
}

function getNicotineTypeName() {
    const type = nicotineTypeSelect.value;
    if (type === 'freebase') return 'Nikotin booster';
    if (type === 'salt') return 'Nikotinová sůl';
    return '';
}

function showNicotineWarning(message) {
    const warning = document.getElementById('nicotineWarning');
    if (warning) {
        warning.textContent = message;
        warning.classList.remove('hidden');
        // Auto-hide after 3 seconds
        setTimeout(() => {
            warning.classList.add('hidden');
        }, 3000);
    }
}

function hideNicotineWarning() {
    const warning = document.getElementById('nicotineWarning');
    if (warning) {
        warning.classList.add('hidden');
    }
}

function validateNicotineStrength() {
    const baseStrengthInput = document.getElementById('nicotineBaseStrength');
    const maxValue = getNicotineMaxValue();
    const currentValue = parseInt(baseStrengthInput.value) || 0;
    
    if (currentValue > maxValue) {
        const typeName = getNicotineTypeName();
        showNicotineWarning(`Maximální hodnota pro ${typeName} je ${maxValue} mg/ml. Hodnota byla upravena.`);
        baseStrengthInput.value = maxValue;
    } else {
        hideNicotineWarning();
    }
    
    updateMaxTargetNicotine();
}

function updateNicotineType() {
    const type = nicotineTypeSelect.value;
    const strengthContainer = document.getElementById('nicotineStrengthContainer');
    const ratioContainer = document.getElementById('nicotineRatioContainer');
    const targetSubGroup = document.getElementById('targetNicotineSubGroup');
    const baseStrengthInput = document.getElementById('nicotineBaseStrength');
    
    if (type === 'none') {
        strengthContainer.classList.add('hidden');
        ratioContainer.classList.add('hidden');
        if (targetSubGroup) targetSubGroup.classList.add('hidden');
        targetNicotineSlider.value = 0;
        hideNicotineWarning();
        updateNicotineDisplay();
    } else {
        strengthContainer.classList.remove('hidden');
        ratioContainer.classList.remove('hidden');
        if (targetSubGroup) targetSubGroup.classList.remove('hidden');
        
        // Set max value based on nicotine type
        const maxValue = getNicotineMaxValue();
        baseStrengthInput.max = maxValue;
        
        // Validate current value
        validateNicotineStrength();
        
        updateMaxTargetNicotine();
    }
    
    // Update VG/PG ratio limits and auto-recalculate in premixed mode
    autoRecalculateLiquidVgPgRatio();
}

function updateMaxTargetNicotine() {
    const baseStrength = parseInt(document.getElementById('nicotineBaseStrength').value) || 0;
    const maxTarget = Math.min(45, baseStrength);
    
    targetNicotineSlider.max = maxTarget;
    if (parseInt(targetNicotineSlider.value) > maxTarget) {
        targetNicotineSlider.value = maxTarget;
    }
    updateNicotineDisplay();
}

function adjustTargetNicotine(change) {
    let newValue = parseInt(targetNicotineSlider.value) + change;
    newValue = Math.max(0, Math.min(parseInt(targetNicotineSlider.max), newValue));
    targetNicotineSlider.value = newValue;
    updateNicotineDisplay();
}

function updateNicotineDisplay() {
    const value = parseInt(targetNicotineSlider.value);
    const displayEl = document.getElementById('targetNicotineValue');
    const displayContainer = displayEl.parentElement;
    const descEl = document.getElementById('nicotineDescription');
    const trackEl = document.getElementById('nicotineTrack');
    
    displayEl.textContent = value;
    
    // Find matching description
    const desc = nicotineDescriptions.find(d => value >= d.min && value <= d.max);
    if (desc) {
        descEl.textContent = getNicotineDescriptionText(value);
        descEl.style.color = desc.color;
        descEl.style.borderLeftColor = desc.color;
        // Set color on container so unit has same color as number
        displayEl.style.color = 'inherit';
        displayContainer.style.color = desc.color;
        displayContainer.style.textShadow = `0 0 20px ${desc.color}`;
        trackEl.style.background = `linear-gradient(90deg, #00cc66, ${desc.color})`;
    }
    
    // Update VG/PG ratio limits and auto-recalculate in premixed mode
    autoRecalculateLiquidVgPgRatio();
}

// =========================================
// Flavor Functions
// =========================================

function updateFlavorType(forceReset = false) {
    const type = flavorTypeSelect.value;
    const strengthContainer = document.getElementById('flavorStrengthContainer');
    
    if (type === 'none') {
        strengthContainer.classList.add('hidden');
        hideCategoryFlavorWarning('flavorStrengthContainer');
    } else {
        strengthContainer.classList.remove('hidden');
        // Kategorie vybraná bez konkrétní příchutě — slider 0%, šedá, varování
        const autoInput = document.getElementById('flavorAutocomplete');
        const hasDbFlavor = autoInput?.dataset?.flavorData && autoInput.dataset.flavorData.length > 2;
        if (!hasDbFlavor) {
            showCategoryFlavorWarning('flavorStrengthContainer', 'flavorStrength', 'flavorValue', 'flavorTrack');
        }
        updateFlavorDisplay();
    }
    
    // Update VG/PG ratio limits and auto-recalculate in premixed mode
    autoRecalculateLiquidVgPgRatio();
}

function adjustFlavor(change) {
    // Dynamický krok podle rozsahu slideru
    const minVal = parseFloat(flavorStrengthSlider.min) || 0;
    const maxVal = parseFloat(flavorStrengthSlider.max) || 30;
    const range = maxVal - minVal;
    
    // Pokud je rozsah malý (např. 2-3%), použít menší absolutní krok
    let actualChange = change;
    if (range <= 5 && Math.abs(change) === 1) {
        actualChange = change > 0 ? 0.5 : -0.5;
    } else if (range <= 5 && Math.abs(change) === 0.1) {
        actualChange = change > 0 ? 0.1 : -0.1;
    }
    
    let newValue = parseFloat(flavorStrengthSlider.value) + actualChange;
    newValue = Math.max(minVal, Math.min(maxVal, newValue));
    // Zaokrouhlit na 1 desetinné místo
    newValue = Math.round(newValue * 10) / 10;
    flavorStrengthSlider.value = newValue;
    updateFlavorDisplay();
}

// Získat přeloženou poznámku pro typ příchutě
function getFlavorNote(type) {
    const noteKey = `flavor_descriptions.note_${type}`;
    const fallbackNotes = {
        none: 'Čistá báze PG/VG + nikotin',
        fruit: 'Optimum: 10%, zrání 3–7 dní',
        citrus: 'Silné kyseliny, méně stačí',
        berry: 'Vyvážené, dobře fungují s 50/50 PG/VG',
        tropical: 'Sladké, potřebují vyšší % pro hloubku',
        tobacco: 'Dlouhý steeping: 1–4 týdny pro rozvinutí',
        menthol: 'Intenzivní, dobře se kombinuje s ovocem',
        candy: 'Sladký profil vyžaduje přesné dávkování',
        dessert: 'Komplexní, steeping 2–3 týdny',
        bakery: 'Máslové tóny, vyzrálost za 2 týdny',
        biscuit: 'Jemné, funguje při nižším %',
        drink: 'Osvěžující, rychlé zrání',
        tobaccosweet: 'Kombinace vyžaduje 2+ týdny steepingu',
        nuts: 'Krémové, vyžaduje 1–2 týdny zrání',
        spice: 'Kořeněné, opatrně s koncentrací',
        cream: 'Krémové, steeping 1–2 týdny',
        mix: 'Kombinace příchutí, zrání dle hlavní složky'
    };
    return t(noteKey, fallbackNotes[type] || '');
}

// Získat přeložený název příchutě
function getFlavorName(type) {
    const flavorKey = `form.flavor_${type}`;
    const flavor = flavorDatabase[type];
    return t(flavorKey, flavor ? flavor.name : type);
}

// Získat přeložený název ingredience z klíče a parametrů
function getIngredientName(ingredient) {
    // Pokud ingredience má starý formát (pouze name), vrať name
    if (ingredient.name && !ingredient.ingredientKey) {
        return ingredient.name;
    }
    
    const key = ingredient.ingredientKey;
    const params = ingredient.params || {};
    
    switch (key) {
        case 'nicotine_booster':
            const boosterName = t('ingredients.nicotine_booster', 'Nikotin booster');
            return `${boosterName} (${params.strength} mg/ml, VG/PG ${params.vgpg})`;
        case 'nicotine_salt':
            const saltName = t('ingredients.nicotine_salt', 'Nikotinová sůl');
            return `${saltName} (${params.strength} mg/ml, VG/PG ${params.vgpg})`;
        case 'flavor':
            // Použít flavorName pokud existuje, jinak přeložit flavorType
            let displayFlavorName;
            if (ingredient.flavorName) {
                // Konkrétní příchuť - přidat výrobce pokud existuje
                if (ingredient.flavorManufacturer) {
                    displayFlavorName = `${ingredient.flavorName} (${ingredient.flavorManufacturer})`;
                } else {
                    displayFlavorName = ingredient.flavorName;
                }
            } else {
                displayFlavorName = getFlavorName(ingredient.flavorType || 'fruit');
            }
            // Vždy přidat prefix "Příchuť" - s číslem pokud je více příchutí
            const flavorPrefix = t('ingredients.flavor', 'Flavor');
            if (ingredient.flavorNumber && ingredient.flavorNumber > 1) {
                return `${flavorPrefix} ${ingredient.flavorNumber}: ${displayFlavorName} (VG/PG ${params.vgpg})`;
            }
            return `${flavorPrefix}: ${displayFlavorName} (VG/PG ${params.vgpg})`;
        case 'shakevape_flavor':
            // Shake & Vape - příchuť již v lahvičce
            const svFlavorLabel = t('ingredients.flavor', 'Flavor');
            const inBottleLabel = t('shakevape.in_bottle', 'already in bottle');
            return `${svFlavorLabel} (${inBottleLabel}, VG/PG ${params.vgpg})`;
        case 'vg':
            return t('ingredients.vg', 'VG (Glycerin)');
        case 'pg':
            return t('ingredients.pg', 'PG (Propylenglykol)');
        case 'vg_adjustment':
            return t('ingredients.vg_adjustment', 'VG (doladění)');
        case 'pg_adjustment':
            return t('ingredients.pg_adjustment', 'PG (doladění)');
        case 'premixedBase':
            const premixedName = t('ingredients.premixed_base', 'Předmíchaná báze');
            return `${premixedName} (VG/PG ${params.vgpg})`;
        case 'nicotine_base':
            const baseName = t('ingredients.nicotine_base', 'Nikotinová báze');
            if (params.strength && params.vgpg) {
                return `${baseName} (${params.strength} mg/ml, VG/PG ${params.vgpg})`;
            }
            return baseName;
        case 'additive':
            const additiveType = ingredient.additiveType;
            if (additiveType && additiveDatabase[additiveType]) {
                return t(additiveDatabase[additiveType].nameKey, additiveType);
            }
            return t('ingredients.additive', 'Aditivum');
        case 'shortfill_liquid':
            return t('ingredients.shortfill_liquid', 'Shortfill liquid');
        case 'shisha_flavor':
            // Shisha flavor - použít konkrétní příchuť pokud existuje, jinak přeložit
            let shishaDisplayName;
            if (ingredient.flavorName) {
                // Konkrétní příchuť z databáze/oblíbených
                if (ingredient.flavorManufacturer) {
                    shishaDisplayName = `${ingredient.flavorName} (${ingredient.flavorManufacturer})`;
                } else {
                    shishaDisplayName = ingredient.flavorName;
                }
            } else {
                // Generická příchuť z číselníku
                const shishaFlavorType = ingredient.flavorType || 'custom';
                const shishaFlavorData = shishaFlavorDatabase[shishaFlavorType] || shishaFlavorDatabase.custom;
                shishaDisplayName = t(`shisha.flavor_${shishaFlavorType}`, shishaFlavorData.name);
            }
            return `${t('ingredients.flavor', 'Flavor')} ${ingredient.flavorNumber || 1}: ${shishaDisplayName}`;
        case 'shisha_tweak_flavor':
            // Shisha Tweak flavor - příchuť/aroma koncentrát
            let tweakFlavorDisplayName;
            if (ingredient.flavorName) {
                if (ingredient.flavorManufacturer) {
                    tweakFlavorDisplayName = `${ingredient.flavorName} (${ingredient.flavorManufacturer})`;
                } else {
                    tweakFlavorDisplayName = ingredient.flavorName;
                }
            } else {
                tweakFlavorDisplayName = (ingredient.flavorType && ingredient.flavorType !== 'none')
                    ? getFlavorName(ingredient.flavorType)
                    : (ingredient.name || t('shisha.tweak_ingredient_concentrate', 'Aroma koncentrát'));
            }
            if (ingredient.flavorNumber && ingredient.flavorNumber > 1) {
                return `${t('ingredients.flavor', 'Flavor')} ${ingredient.flavorNumber}: ${tweakFlavorDisplayName}`;
            }
            return `${t('ingredients.flavor', 'Flavor')}: ${tweakFlavorDisplayName}`;
        case 'shisha_diy_material':
            // Shisha DIY tobacco/herbs (Mode 2) - dynamicky přeložit podle typu materiálu
            if (ingredient.diyMaterial === 'herbs') {
                return `${t('shisha.diy_herbs_amount_label', 'Bylinky')} (${t('shisha.diy_herbs_amount_hint', 'sušené bylinky')})`;
            }
            return `${t('shisha.tobacco_amount_label', 'Tabák')} (${t('shisha.tobacco_amount_hint', 'sušené listy')})`;
        case 'shisha_tobacco':
            // Shisha tobacco (Mode 1 mix) - use ingredient name directly (tobacco brand/flavor)
            return ingredient.name || t('shisha.tobacco_label', 'Tabák');
        case 'shisha_sweetener':
            // Shisha sweetener - přeložit název sladidla
            const sweetType = ingredient.sweetenerType || 'sucralose';
            const sweetData = sweetenerDatabase[sweetType] || sweetenerDatabase.sucralose;
            const sweetName = t(`shisha.sweetener_${sweetType}`, sweetData.name);
            return `${t('shisha.sweetener_label', 'Sweetener')}: ${sweetName}`;
        case 'water':
            return t('form.water', 'Water');
        case 'sweetener':
            // Fallback pro starší recepty kde sweetener nebyl jako additive
            const sweetenerTypeFallback = ingredient.sweetenerType || 'sucralose';
            if (sweetenerDatabase && sweetenerDatabase[sweetenerTypeFallback]) {
                const sweetenerData = sweetenerDatabase[sweetenerTypeFallback];
                return `${t('shisha.sweetener_label', 'Sladidlo')}: ${t(`shisha.sweetener_${sweetenerTypeFallback}`, sweetenerData.name)}`;
            }
            return t('additive.sweetener', 'Sladidlo (Sukralóza)');
        case 'shortfill_base':
            // Fallback pro starší recepty
            return t('ingredients.shortfill_base', 'Shortfill báze');
        default:
            return ingredient.name || key;
    }
}

function updateFlavorDisplay() {
    const value = parseFloat(flavorStrengthSlider.value);
    const type = flavorTypeSelect.value;
    const descEl = document.getElementById('flavorDescription');
    const displayEl = document.getElementById('flavorValue');
    const displayContainer = displayEl.parentElement;
    const trackEl = document.getElementById('flavorTrack');
    
    // Zobrazit s 1 desetinným místem, pokud není celé číslo
    displayEl.textContent = Number.isInteger(value) ? value : value.toFixed(1);
    
    // Zjistit rozsah - buď z konkrétní příchutě nebo z číselníku
    let minPercent, maxPercent, note;
    
    // Zkontrolovat zda je vybraná konkrétní příchuť
    const flavorAutocomplete = document.getElementById('flavorAutocomplete');
    let hasSpecificFlavor = false;
    let hasVerifiedData = false;
    let flavorDataParsed = null;
    
    if (flavorAutocomplete && flavorAutocomplete.dataset.flavorData) {
        try {
            flavorDataParsed = JSON.parse(flavorAutocomplete.dataset.flavorData);
            // Konkrétní příchuť má jméno
            hasSpecificFlavor = !!(flavorDataParsed && flavorDataParsed.name);
            // Ověřená data = má min_percent a max_percent nastavené (ne null, ne 0)
            hasVerifiedData = flavorDataParsed.min_percent && flavorDataParsed.max_percent && flavorDataParsed.min_percent > 0;
        } catch (e) {
            hasSpecificFlavor = false;
        }
    }
    
    if (hasSpecificFlavor && flavorDataParsed) {
        if (hasVerifiedData) {
            // Použít rozsah z konkrétní příchutě
            minPercent = flavorDataParsed.min_percent;
            maxPercent = flavorDataParsed.max_percent;
            note = flavorDataParsed.name || '';
        } else {
            // Konkrétní příchuť bez ověřených dat
            minPercent = 0;
            maxPercent = 100;
            note = '';
        }
    } else {
        // Použít rozsah z číselníku
        const flavor = flavorDatabase[type] || flavorDatabase.fruit;
        minPercent = flavor.min;
        maxPercent = flavor.max;
        note = getFlavorNote(type);
    }
    
    let color, text;
    
    // Pokud je konkrétní příchuť bez ověřených dat, nezobrazovat doporučení
    if (hasSpecificFlavor && !hasVerifiedData) {
        color = '#888888';
        text = ''; // Žádný text - upozornění je již zobrazeno výše
        trackEl.style.background = `linear-gradient(90deg, #666666, #888888)`;
    } else if (value < minPercent) {
        color = '#ffaa00';
        text = t('flavor_descriptions.weak', 'Weak or no flavor (recommended {min}–{max}%)')
            .replace('{min}', minPercent)
            .replace('{max}', maxPercent);
        trackEl.style.background = `linear-gradient(90deg, #ff6600, #ffaa00)`;
    } else if (value > maxPercent) {
        color = '#ff0044';
        text = t('flavor_descriptions.strong', 'Strong or too sweet flavor (recommended {min}–{max}%)')
            .replace('{min}', minPercent)
            .replace('{max}', maxPercent);
        trackEl.style.background = `linear-gradient(90deg, #00cc66, #ff0044)`;
    } else {
        color = '#00cc66';
        if (hasSpecificFlavor && note) {
            text = t('flavor_descriptions.ideal_specific', 'Ideal flavor ({min}–{max}%) - {name}')
                .replace('{min}', minPercent)
                .replace('{max}', maxPercent)
                .replace('{name}', note);
        } else {
            text = t('flavor_descriptions.ideal', 'Ideal flavor ({min}–{max}%) - {note}')
                .replace('{min}', minPercent)
                .replace('{max}', maxPercent)
                .replace('{note}', note);
        }
        trackEl.style.background = `linear-gradient(90deg, #00cc66, #00aaff)`;
    }
    
    descEl.textContent = text;
    descEl.style.color = color;
    descEl.style.borderLeftColor = color;
    // Set color on container so unit has same color as number
    displayEl.style.color = 'inherit';
    displayContainer.style.color = color;
    
    // Update VG/PG ratio limits and auto-recalculate in premixed mode
    autoRecalculateLiquidVgPgRatio();
}

function updateAllDisplays() {
    updateRatioDisplay();
    updateNicotineDisplay();
    updateFlavorDisplay();
    updateNicotineType();
    updateFlavorType(false);  // BEZ přepsání uživatelské hodnoty
    
    // Inicializovat Shake & Vape nicotine visibility
    if (typeof updateSvNicotineType === 'function') {
        updateSvNicotineType();
    }
}

// =========================================
// Calculation Functions
// Based on: http://www.todmuller.com/ejuice/ejuice.php
// =========================================

function calculateMix() {
    // Get user inputs - always read fresh from DOM
    const totalAmount = parseFloat(document.getElementById('totalAmount').value) || 100;
    const vgPercent = parseInt(document.getElementById('vgPgRatio').value);
    const pgPercent = 100 - vgPercent;
    const nicotineType = document.getElementById('nicotineType').value;
    const targetNicotine = parseFloat(document.getElementById('targetNicotine').value) || 0;
    const baseNicotine = parseFloat(document.getElementById('nicotineBaseStrength').value) || 0;
    
    // Získat informace o konkrétní příchuti (pokud je vybraná)
    const flavorAutocomplete = document.getElementById('flavorAutocomplete');
    const hasSpecificFlavor = (flavorAutocomplete?.dataset.flavorId || flavorAutocomplete?.dataset.favoriteProductId || flavorAutocomplete?.dataset.flavorData) && flavorAutocomplete?.dataset.flavorSource !== 'generic';
    let specificFlavorName = null;
    let specificFlavorManufacturer = null;
    let specificFlavorId = null;
    let specificFavoriteProductId = null;
    let specificFlavorSource = 'generic';
    let specificFlavorSteepDays = null;
    
    if (flavorAutocomplete && flavorAutocomplete.dataset.flavorData) {
        try {
            const flavorData = JSON.parse(flavorAutocomplete.dataset.flavorData);
            if (flavorData && flavorData.name) {
                specificFlavorName = flavorData.name;
                specificFlavorManufacturer = flavorData.manufacturer || flavorData.manufacturer_code;
                // Pro oblíbené příchutě použít favorite_product_id, jinak flavor_id
                const isFavorite = flavorData.source === 'favorites' || flavorData.source === 'favorite';
                if (isFavorite) {
                    specificFavoriteProductId = flavorData.favorite_product_id || flavorData.id || null;
                    specificFlavorId = flavorData.flavor_id || null;
                } else {
                    specificFlavorId = flavorData.flavor_id || flavorData.id || flavorAutocomplete.dataset.flavorId || null;
                }
                specificFlavorSource = flavorAutocomplete.dataset.flavorSource || (isFavorite ? 'favorite' : 'database');
                // Steep days z konkrétní příchutě (DB nebo oblíbené)
                if (flavorData.steep_days !== undefined && flavorData.steep_days !== null) {
                    specificFlavorSteepDays = flavorData.steep_days;
                } else if (flavorData.flavor_steep_days !== undefined && flavorData.flavor_steep_days !== null) {
                    specificFlavorSteepDays = flavorData.flavor_steep_days;
                }
            }
        } catch (e) {
            console.log('Error parsing flavor data:', e);
        }
    }
    
    // Příchuť je aktivní pokud je vybraná konkrétní NEBO je zvolena kategorie
    const flavorType = document.getElementById('flavorType').value;
    const hasFlavor = hasSpecificFlavor || (flavorType !== 'none' && flavorType !== '');
    const flavorPercent = hasFlavor ? parseFloat(document.getElementById('flavorStrength').value) : 0;
    
    // Get base type (separate or premixed)
    const baseType = document.getElementById('baseType')?.value || 'separate';
    const premixedRatio = document.getElementById('premixedRatio')?.value || '60/40';

    // =========================================
    // CALCULATION FORMULA
    // Total = Nicotine + Flavor + PG + VG (or Premixed Base)
    // All values in ml, must equal totalAmount
    // =========================================

    // 1. Calculate nicotine base volume needed
    // Formula: nicotine_ml = (target_nic * total_ml) / base_nic
    let nicotineVolume = 0;
    if (nicotineType !== 'none' && targetNicotine > 0 && baseNicotine > 0) {
        nicotineVolume = (targetNicotine * totalAmount) / baseNicotine;
    }

    // 2. Calculate flavor volume
    // Formula: flavor_ml = (flavor_percent / 100) * total_ml
    const flavorVolume = (flavorPercent / 100) * totalAmount;

    // 3. Calculate remaining volume for carrier liquids
    // This is what's left after nicotine and flavor
    const remainingVolume = totalAmount - nicotineVolume - flavorVolume;

    // 4. Nicotine base composition (affects final PG/VG ratio)
    let nicotineVgContent = 0;
    let nicotinePgContent = 0;
    let nicVgPercent = 50;
    
    if (nicotineType !== 'none' && nicotineVolume > 0) {
        const nicotineRatio = document.getElementById('nicotineRatio').value;
        
        if (nicotineRatio === '50/50') {
            nicVgPercent = 50;
        } else if (nicotineRatio === '70/30') {
            nicVgPercent = 70;
        }
        
        nicotineVgContent = nicotineVolume * (nicVgPercent / 100);
        nicotinePgContent = nicotineVolume * ((100 - nicVgPercent) / 100);
    }

    // 5. Flavor VG/PG content based on selected ratio - dynamické parsování
    let flavorVgContent = 0;
    let flavorPgContent = flavorVolume; // Default to 100% PG
    
    if (hasFlavor && flavorVolume > 0) {
        const flavorRatio = document.getElementById('flavorRatio').value || '0/100';
        // Dynamické parsování VG ratio z formátu "VG/PG"
        const flavorVgPercent = parseInt(flavorRatio.split('/')[0]) || 0;
        
        flavorVgContent = flavorVolume * (flavorVgPercent / 100);
        flavorPgContent = flavorVolume * ((100 - flavorVgPercent) / 100);
    }

    // 6. Calculate carrier liquids needed
    const targetVgTotal = (vgPercent / 100) * totalAmount;
    const targetPgTotal = (pgPercent / 100) * totalAmount;

    let pureVgNeeded = targetVgTotal - nicotineVgContent - flavorVgContent;
    let purePgNeeded = targetPgTotal - nicotinePgContent - flavorPgContent;
    let premixedBaseVolume = 0;
    let premixedVgPercent = 60;

    // Handle negative values
    if (pureVgNeeded < 0) pureVgNeeded = 0;
    if (purePgNeeded < 0) purePgNeeded = 0;

    // Build results
    const ingredients = [];

    if (baseType === 'premixed') {
        // PREMIXED BASE MODE S DOLADĚNÍM
        // Parse premixed ratio
        const premixedParts = premixedRatio.split('/');
        premixedVgPercent = parseInt(premixedParts[0]) || 50;
        const premixedPgPercent = 100 - premixedVgPercent;
        
        // Kolik VG/PG potřebujeme celkem pro cílový poměr
        const targetVgVolume = (vgPercent / 100) * totalAmount;
        const targetPgVolume = (pgPercent / 100) * totalAmount;
        
        // Kolik VG/PG již máme z nikotinu a příchutí
        const providedVg = nicotineVgContent + flavorVgContent;
        const providedPg = nicotinePgContent + flavorPgContent;
        
        // Kolik VG/PG ještě potřebujeme dodat
        const neededVg = Math.max(0, targetVgVolume - providedVg);
        const neededPg = Math.max(0, targetPgVolume - providedPg);
        
        // Vypočítat optimální množství předmíchané báze a doladění
        // Předmíchaná báze dodá VG a PG v poměru premixedVg:premixedPg
        // Potřebujeme najít takové množství báze, aby po přidání doladění dostali cílový poměr
        
        let adjustmentVg = 0;
        let adjustmentPg = 0;
        
        if (premixedVgPercent >= 100) {
            // Báze je 100% VG - použijeme ji pro VG a doladíme PG
            premixedBaseVolume = Math.min(neededVg, remainingVolume);
            adjustmentPg = Math.min(neededPg, remainingVolume - premixedBaseVolume);
        } else if (premixedVgPercent <= 0) {
            // Báze je 100% PG - použijeme ji pro PG a doladíme VG
            premixedBaseVolume = Math.min(neededPg, remainingVolume);
            adjustmentVg = Math.min(neededVg, remainingVolume - premixedBaseVolume);
        } else {
            // Smíšená báze:
            // Pokud uživatel neměnil VG/PG posuvník, použít celou bázi bez doladění
            if (!liquidUserManuallyChangedRatio) {
                premixedBaseVolume = remainingVolume;
                adjustmentVg = 0;
                adjustmentPg = 0;
            } else {
                // Uživatel ručně změnil cílový poměr VG/PG
                // Potřebujeme: neededVg z báze+doladění, neededPg z báze+doladění
                // Báze dodá VG a PG v pevném poměru, doladění je čistý VG nebo PG
                
                // Potřebujeme více VG než báze dodá? Nebo více PG?
                // S celou bází: vgFromBase = remaining * premixedVg%, pgFromBase = remaining * premixedPg%
                // Rozdíl: pokud neededVg > vgFromBase → potřebujeme VG doladění (a méně báze)
                //          pokud neededPg > pgFromBase → potřebujeme PG doladění (a méně báze)
                
                if (neededVg > 0 && neededPg > 0) {
                    // Poměr VG/PG který potřebujeme z remaining objemu
                    const neededVgRatio = neededVg / (neededVg + neededPg);
                    const baseVgRatio = premixedVgPercent / 100;
                    
                    if (neededVgRatio > baseVgRatio) {
                        // Potřebujeme víc VG než báze dodá → doladění čistým VG
                        // baseVol * premixedPg% = neededPg → baseVol = neededPg / (premixedPg%)
                        if (premixedPgPercent > 0) {
                            premixedBaseVolume = Math.min(neededPg / (premixedPgPercent / 100), remainingVolume);
                            adjustmentVg = remainingVolume - premixedBaseVolume;
                            adjustmentPg = 0;
                        } else {
                            premixedBaseVolume = remainingVolume;
                            adjustmentVg = 0;
                            adjustmentPg = 0;
                        }
                    } else {
                        // Potřebujeme víc PG než báze dodá → doladění čistým PG
                        // baseVol * premixedVg% = neededVg → baseVol = neededVg / (premixedVg%)
                        if (premixedVgPercent > 0) {
                            premixedBaseVolume = Math.min(neededVg / (premixedVgPercent / 100), remainingVolume);
                            adjustmentPg = remainingVolume - premixedBaseVolume;
                            adjustmentVg = 0;
                        } else {
                            premixedBaseVolume = remainingVolume;
                            adjustmentVg = 0;
                            adjustmentPg = 0;
                        }
                    }
                } else if (neededVg > 0) {
                    // Potřebujeme pouze VG
                    premixedBaseVolume = 0;
                    adjustmentVg = remainingVolume;
                    adjustmentPg = 0;
                } else if (neededPg > 0) {
                    // Potřebujeme pouze PG
                    premixedBaseVolume = 0;
                    adjustmentPg = remainingVolume;
                    adjustmentVg = 0;
                } else {
                    premixedBaseVolume = remainingVolume;
                    adjustmentVg = 0;
                    adjustmentPg = 0;
                }
                
                // Zajistit nezáporné hodnoty
                premixedBaseVolume = Math.max(0, premixedBaseVolume);
                adjustmentVg = Math.max(0, adjustmentVg);
                adjustmentPg = Math.max(0, adjustmentPg);
            }
        }
        
        // Vypočítat skutečný výsledný poměr
        const finalVg = providedVg + premixedBaseVolume * (premixedVgPercent / 100) + adjustmentVg;
        const finalPg = providedPg + premixedBaseVolume * (premixedPgPercent / 100) + adjustmentPg;
        const actualVgPercent = (finalVg / totalAmount) * 100;
        
        // Add nicotine to ingredients
        if (nicotineVolume > 0) {
            const nicotineRatioValue = document.getElementById('nicotineRatio').value;
            ingredients.push({
                ingredientKey: nicotineType === 'salt' ? 'nicotine_salt' : 'nicotine_booster',
                vgRatio: nicVgPercent,
                params: {
                    strength: baseNicotine,
                    vgpg: nicotineRatioValue
                },
                volume: nicotineVolume,
                percent: (nicotineVolume / totalAmount) * 100
            });
        }

        // Add flavor to ingredients
        if (flavorVolume > 0) {
            const flavorRatioValue = document.getElementById('flavorRatio').value;
            const flavorIngredient = {
                ingredientKey: 'flavor',
                flavorType: flavorType,
                params: {
                    vgpg: flavorRatioValue
                },
                volume: flavorVolume,
                percent: (flavorVolume / totalAmount) * 100
            };
            
            // Přidat info o konkrétní příchuti pokud existuje
            if (specificFlavorName) {
                flavorIngredient.flavorName = specificFlavorName;
                flavorIngredient.flavorManufacturer = specificFlavorManufacturer;
                flavorIngredient.flavorId = specificFlavorId;
                flavorIngredient.favoriteProductId = specificFavoriteProductId;
                flavorIngredient.flavorSource = specificFlavorSource;
            }
            
            ingredients.push(flavorIngredient);
        }
        
        // Add premixed base
        if (premixedBaseVolume > 0.01) {
            ingredients.push({
                ingredientKey: 'premixedBase',
                vgRatio: premixedVgPercent,
                params: {
                    vgpg: premixedRatio
                },
                volume: premixedBaseVolume,
                percent: (premixedBaseVolume / totalAmount) * 100
            });
        }
        
        // Přidat doladění VG/PG pokud je potřeba (> 0.01 ml)
        if (adjustmentVg > 0.01) {
            pureVgNeeded = adjustmentVg;
            ingredients.push({
                ingredientKey: 'vg_adjustment',
                volume: adjustmentVg,
                percent: (adjustmentVg / totalAmount) * 100
            });
        } else {
            pureVgNeeded = 0;
        }
        
        if (adjustmentPg > 0.01) {
            purePgNeeded = adjustmentPg;
            ingredients.push({
                ingredientKey: 'pg_adjustment',
                volume: adjustmentPg,
                percent: (adjustmentPg / totalAmount) * 100
            });
        } else {
            purePgNeeded = 0;
        }
        
    } else {
        // SEPARATE PG/VG MODE (original logic)
        // Adjust if needed
        const totalPureNeeded = pureVgNeeded + purePgNeeded;
        if (totalPureNeeded > remainingVolume && totalPureNeeded > 0) {
            const ratio = remainingVolume / totalPureNeeded;
            pureVgNeeded *= ratio;
            purePgNeeded *= ratio;
        } else if (totalPureNeeded < remainingVolume) {
            const extra = remainingVolume - totalPureNeeded;
            if (vgPercent + pgPercent > 0) {
                pureVgNeeded += extra * (vgPercent / 100);
                purePgNeeded += extra * (pgPercent / 100);
            }
        }

        // Add nicotine to ingredients
        if (nicotineVolume > 0) {
            const nicotineRatioValue = document.getElementById('nicotineRatio').value;
            ingredients.push({
                ingredientKey: nicotineType === 'salt' ? 'nicotine_salt' : 'nicotine_booster',
                vgRatio: nicVgPercent,
                params: {
                    strength: baseNicotine,
                    vgpg: nicotineRatioValue
                },
                volume: nicotineVolume,
                percent: (nicotineVolume / totalAmount) * 100
            });
        }

        // Add flavor to ingredients
        if (flavorVolume > 0) {
            const flavorRatioValue = document.getElementById('flavorRatio').value;
            const flavorIngredient = {
                ingredientKey: 'flavor',
                flavorType: flavorType,
                params: {
                    vgpg: flavorRatioValue
                },
                volume: flavorVolume,
                percent: (flavorVolume / totalAmount) * 100
            };
            
            // Přidat info o konkrétní příchuti pokud existuje
            if (specificFlavorName) {
                flavorIngredient.flavorName = specificFlavorName;
                flavorIngredient.flavorManufacturer = specificFlavorManufacturer;
                flavorIngredient.flavorId = specificFlavorId;
                flavorIngredient.favoriteProductId = specificFavoriteProductId;
                flavorIngredient.flavorSource = specificFlavorSource;
            }
            
            ingredients.push(flavorIngredient);
        }

        // Add carrier liquids
        if (purePgNeeded > 0.01) {
            ingredients.push({
                ingredientKey: 'pg',
                volume: purePgNeeded,
                percent: (purePgNeeded / totalAmount) * 100
            });
        }

        if (pureVgNeeded > 0.01) {
            ingredients.push({
                ingredientKey: 'vg',
                volume: pureVgNeeded,
                percent: (pureVgNeeded / totalAmount) * 100
            });
        }
    }

    // Calculate actual totals for verification
    const actualTotal = ingredients.reduce((sum, ing) => sum + ing.volume, 0);
    
    // Calculate actual VG/PG ratio in final mix
    let actualVg = pureVgNeeded + nicotineVgContent + flavorVgContent;
    let actualPg = purePgNeeded + nicotinePgContent + flavorPgContent;
    
    if (baseType === 'premixed' && premixedBaseVolume > 0) {
        actualVg += premixedBaseVolume * (premixedVgPercent / 100);
        actualPg += premixedBaseVolume * ((100 - premixedVgPercent) / 100);
    }

    // V premixed mode bez ručního posunu slideru: zobrazit skutečný poměr v hlavičce (celé číslo)
    let displayVg = vgPercent;
    let displayPg = pgPercent;
    if (baseType === 'premixed' && !liquidUserManuallyChangedRatio && totalAmount > 0) {
        displayVg = Math.round((actualVg / totalAmount) * 100);
        displayPg = 100 - displayVg;
    }

    // Display results
    displayResults(totalAmount, displayVg, displayPg, targetNicotine, ingredients, actualTotal, actualVg, actualPg, {
        flavorType: flavorType,
        baseType: baseType,
        premixedRatio: baseType === 'premixed' ? premixedRatio : null,
        nicotineType: nicotineType,
        nicotineBaseStrength: baseNicotine,
        nicotineRatio: document.getElementById('nicotineRatio')?.value || '50/50',
        flavorRatio: document.getElementById('flavorRatio')?.value || '0/100',
        manuallyChangedRatio: liquidUserManuallyChangedRatio,
        // Přidat info o konkrétní příchuti pro fallback v extractRecipeFlavorsForDisplay
        specificFlavorName: specificFlavorName,
        specificFlavorManufacturer: specificFlavorManufacturer,
        specificFlavorId: specificFlavorId,
        specificFavoriteProductId: specificFavoriteProductId,
        specificFlavorSource: specificFlavorSource,
        specificFlavorSteepDays: specificFlavorSteepDays,
        flavorPercent: flavorPercent
    });
    
    showPage('results');
}

function displayResults(total, vg, pg, nicotine, ingredients, actualTotal, actualVg, actualPg, extraData = {}) {
    // Zaokrouhlit hodnoty na 2 desetinná místa
    const roundedTotal = typeof total === 'number' ? parseFloat(total.toFixed(2)) : total;
    const roundedNicotine = typeof nicotine === 'number' ? parseFloat(nicotine.toFixed(2)) : nicotine;
    
    document.getElementById('resultTotal').textContent = `${roundedTotal} ml`;
    document.getElementById('resultRatio').textContent = `${vg}:${pg}`;
    document.getElementById('resultNicotine').textContent = `${roundedNicotine} mg/ml`;
    
    // Přepnout tlačítka podle režimu (editace vs nový recept)
    const newButtons = document.getElementById('resultsNewButtons');
    const editButtons = document.getElementById('resultsEditButtons');
    
    if (window.editingRecipeFromDetail) {
        // Režim editace existujícího receptu
        if (newButtons) newButtons.classList.add('hidden');
        if (editButtons) editButtons.classList.remove('hidden');
    } else {
        // Nový recept
        if (newButtons) newButtons.classList.remove('hidden');
        if (editButtons) editButtons.classList.add('hidden');
    }

    // Uložit data receptu pro možnost pozdějšího uložení
    // Ukládáme klíče a parametry pro dynamický překlad
    const recipeData = {
        totalAmount: total,
        vgPercent: vg,
        pgPercent: pg,
        nicotine: nicotine,
        ingredients: ingredients.map(ing => ({
            ingredientKey: ing.ingredientKey,
            flavorType: ing.flavorType,
            flavorIndex: ing.flavorIndex,
            flavorNumber: ing.flavorNumber,
            additiveType: ing.additiveType,
            customComposition: ing.customComposition,
            vgRatio: ing.vgRatio,
            params: ing.params,
            volume: ing.volume,
            percent: ing.percent,
            // Konkrétní příchuť - zachovat všechna data
            flavorName: ing.flavorName,
            flavorManufacturer: ing.flavorManufacturer,
            flavorId: ing.flavorId,
            favoriteProductId: ing.favoriteProductId,
            flavorSource: ing.flavorSource
        })),
        actualVg: actualVg,
        actualPg: actualPg
    };
    
    // Přidat extra data (flavorType pro základní recept, formType a flavors pro PRO)
    if (extraData.flavorType) {
        recipeData.flavorType = extraData.flavorType;
    }
    if (extraData.formType) {
        recipeData.formType = extraData.formType;
    }
    if (extraData.flavors) {
        recipeData.flavors = extraData.flavors;
    }
    if (extraData.additives) {
        recipeData.additives = extraData.additives;
    }
    if (extraData.baseType) {
        recipeData.baseType = extraData.baseType;
    }
    if (extraData.premixedRatio) {
        recipeData.premixedRatio = extraData.premixedRatio;
    }
    // Uložit info o konkrétní příchuti pro fallback v extractRecipeFlavorsForDisplay
    if (extraData.specificFlavorName) {
        recipeData.specificFlavorName = extraData.specificFlavorName;
        recipeData.specificFlavorManufacturer = extraData.specificFlavorManufacturer;
        recipeData.specificFlavorId = extraData.specificFlavorId;
        recipeData.specificFavoriteProductId = extraData.specificFavoriteProductId;
        recipeData.specificFlavorSource = extraData.specificFlavorSource;
    }
    if (extraData.specificFlavorSteepDays !== undefined && extraData.specificFlavorSteepDays !== null) {
        recipeData.specificFlavorSteepDays = extraData.specificFlavorSteepDays;
    }
    if (extraData.flavorPercent !== undefined) {
        recipeData.flavorPercent = extraData.flavorPercent;
    }
    // Nikotin — uložit typ, sílu báze, VG/PG poměr báze
    if (extraData.nicotineType !== undefined) {
        recipeData.nicotineType = extraData.nicotineType;
    }
    if (extraData.nicotineBaseStrength !== undefined) {
        recipeData.nicotineBaseStrength = extraData.nicotineBaseStrength;
    }
    if (extraData.nicotineRatio !== undefined) {
        recipeData.nicotineRatio = extraData.nicotineRatio;
    }
    if (extraData.nicotineRatioSlider !== undefined) {
        recipeData.nicotineRatioSlider = extraData.nicotineRatioSlider;
    }
    if (extraData.nicotineSaltType !== undefined) {
        recipeData.nicotineSaltType = extraData.nicotineSaltType;
    }
    // Příchuť — VG/PG poměr příchutě
    if (extraData.flavorRatio !== undefined) {
        recipeData.flavorRatio = extraData.flavorRatio;
    }
    // SNV — objem příchutě
    if (extraData.flavorVolume !== undefined) {
        recipeData.flavorVolume = extraData.flavorVolume;
    }
    // Příznak ručního doladění VG/PG slideru
    if (extraData.manuallyChangedRatio !== undefined) {
        recipeData.manuallyChangedRatio = extraData.manuallyChangedRatio;
    }
    
    storeCurrentRecipe(recipeData);

    // Zobrazit steep days v hlavičce výsledků
    const steepContainer = document.getElementById('resultSteepContainer');
    const steepValueEl = document.getElementById('resultSteepDays');
    if (steepContainer && steepValueEl) {
        const steepDays = getMaxSteepingDaysFromRecipe(recipeData);
        if (steepDays > 0) {
            const daysText = steepDays === 1 ? t('common.day', 'den') : 
                (steepDays >= 2 && steepDays <= 4) ? t('common.days_few', 'dny') : t('common.days', 'dní');
            steepValueEl.textContent = `${steepDays} ${daysText}`;
            steepContainer.style.display = '';
        } else {
            steepContainer.style.display = 'none';
        }
    }

    const tbody = document.getElementById('resultsBody');
    tbody.innerHTML = '';

    let runningTotal = 0;
    let totalGrams = 0;

    ingredients.forEach(ing => {
        const row = document.createElement('tr');

        // Calculate grams based on ingredient type
        const grams = calculateIngredientGrams(ing);
        totalGrams += parseFloat(grams);

        // Dynamicky přeložit název ingredience
        const ingredientName = getIngredientName(ing);

        row.innerHTML = `
            <td class="ingredient-name">${ingredientName} <span class="ingredient-percent-inline">(${ing.percent.toFixed(1)}%)</span></td>
            <td class="ingredient-value">${ing.volume.toFixed(2)}</td>
            <td class="ingredient-grams">${grams}</td>
        `;
        tbody.appendChild(row);
        runningTotal += ing.volume;
    });

    // Add total row - should match user's requested total
    const totalRow = document.createElement('tr');
    totalRow.className = 'total-row';
    totalRow.innerHTML = `
        <td class="ingredient-name">${t('ingredients.total', 'CELKEM')}</td>
        <td class="ingredient-value">${runningTotal.toFixed(2)}</td>
        <td class="ingredient-grams">${totalGrams.toFixed(2)}</td>
    `;
    tbody.appendChild(totalRow);

    // Generate dynamic mixing notes
    generateMixingNotes(recipeData);
}

// Calculate grams for an ingredient based on its type and composition
function calculateIngredientGrams(ing) {
    let density = ingredientDensities.pg; // default
    
    if (ing.ingredientKey === 'vg' || ing.ingredientKey === 'vg_adjustment') {
        density = ingredientDensities.vg;
    } else if (ing.ingredientKey === 'pg' || ing.ingredientKey === 'pg_adjustment') {
        density = ingredientDensities.pg;
    } else if (ing.ingredientKey === 'nicotine' || ing.ingredientKey === 'nicotine_base') {
        // Nicotine density depends on VG/PG ratio
        // Zkusit získat vgRatio z různých zdrojů
        let nicVgRatio = ing.vgRatio;
        if (nicVgRatio === undefined && ing.params?.vgpg) {
            // Parsovat z params.vgpg (formát "50/50")
            nicVgRatio = parseInt(ing.params.vgpg.split('/')[0]) || 50;
        }
        density = calculateNicotineDensity(nicVgRatio || 50);
    } else if (ing.ingredientKey === 'flavor' || ing.ingredientKey === 'shisha_flavor') {
        // Flavor density depends on composition
        const flavorType = ing.flavorType || 'fruit';
        // Zkusit shisha flavor database nebo standardní
        const flavorData = (typeof shishaFlavorDatabase !== 'undefined' && shishaFlavorDatabase[flavorType]) 
            || flavorDatabase[flavorType] 
            || flavorDatabase.fruit;
        if (flavorData && flavorData.composition) {
            density = calculateCompositionDensity(flavorData.composition);
        }
    } else if (ing.ingredientKey === 'premixedBase') {
        // Premixed base density
        let baseVgRatio = ing.vgRatio;
        if (baseVgRatio === undefined && ing.params?.vgpg) {
            // Parsovat z params.vgpg (formát "80/20")
            baseVgRatio = parseInt(ing.params.vgpg.split('/')[0]) || 50;
        }
        density = calculatePremixedBaseDensity(baseVgRatio || 50);
    } else if (ing.ingredientKey === 'additive') {
        // Additive density
        const additiveType = ing.additiveType;
        if (additiveType && additiveDatabase[additiveType]) {
            density = calculateCompositionDensity(additiveDatabase[additiveType].composition);
        }
    } else if (ing.ingredientKey === 'shisha_sweetener') {
        // Shisha sweetener density
        const sweetenerType = ing.sweetenerType || 'sucralose';
        const sweetener = (typeof sweetenerDatabase !== 'undefined' && sweetenerDatabase[sweetenerType]) || { density: 1.0 };
        density = sweetener.density || 1.0;
    } else if (ing.ingredientKey === 'water') {
        density = 1.0;
    }
    
    return mlToGrams(ing.volume, density);
}

// Generate dynamic mixing notes based on recipe data
function generateMixingNotes(recipeData) {
    const notesEl = document.getElementById('mixingNotesList');
    if (!notesEl) return;
    
    const notes = [];
    
    // Shisha-specific notes (3 modes)
    if (recipeData.formType === 'shisha') {
        const shMode = recipeData.shishaMode || 'mix';
        
        if (shMode === 'mix') {
            // Mode 1: Tobacco Mix — just weigh tobaccos
            notes.push(t('shisha.note_mix_weigh', 'Navažte jednotlivé tabáky podle gramáže.'));
            notes.push(t('shisha.note_mix_blend', 'Tabáky důkladně promíchejte v korunce.'));
            notes.push(t('shisha.note_mix_pack', 'Naplňte korunku a rovnoměrně utlačte.'));
        } else if (shMode === 'diy') {
            // Mode 2: DIY Tobacco / Herbs
            const isHerbs = recipeData.diyMaterial === 'herbs';
            if (isHerbs) {
                notes.push(t('shisha.note_diy_prepare_herbs', 'Připravte bylinky — nasekejte nebo nadrťte na drobné kousky.'));
            } else {
                notes.push(t('shisha.note_diy_prepare', 'Připravte tabákové listy — namočte, odstraňte stonky, nakrájejte na proužky.'));
            }
            notes.push(t('shisha.note_diy_sweetener', 'Smíchejte melasu/med se glycerinem a vodou.'));
            if (recipeData.flavors && recipeData.flavors.length > 0) {
                notes.push(t('results.notes_flavors_first', 'Přidejte příchutě do molasses směsi.'));
            }
            if (recipeData.nicotine > 0) {
                notes.push(t('results.notes_nicotine', 'Poté přidejte nikotin (pracujte v rukavicích!).'));
            }
            if (isHerbs) {
                notes.push(t('shisha.note_diy_combine_herbs', 'Zalijte bylinky molasses směsí a důkladně promíchejte.'));
            } else {
                notes.push(t('shisha.note_diy_combine', 'Zalijte tabák molasses směsí a důkladně promíchejte.'));
            }
            const steepingDays = recipeData.steepDays || getMaxSteepingDaysFromRecipe(recipeData);
            if (steepingDays > 0) {
                const steepText = t('shisha.note_steeping', 'Nechte směs zrát {{days}} dní pro lepší chuť.').replace('{{days}}', steepingDays);
                notes.push(steepText);
            }
        } else if (shMode === 'tweak') {
            // Mode 4: Úprava tabáku
            notes.push(t('shisha.note_tweak_prepare', 'Navažte tabák do misky nebo uzavíratelné nádoby.'));
            // VG
            if (recipeData.ingredients?.some(i => i.ingredientKey === 'shisha_tweak_vg')) {
                notes.push(t('shisha.note_tweak_vg', 'Přidejte glycerin a důkladně promíchejte — tabák by měl být vlhký, ne mokrý.'));
            }
            // Aroma / kapky
            if (recipeData.ingredients?.some(i => i.ingredientKey === 'shisha_tweak_drops' || i.ingredientKey === 'shisha_tweak_flavor')) {
                notes.push(t('shisha.note_tweak_flavor', 'Přidejte chuťové kapky / aroma koncentrát a promíchejte.'));
            }
            // Nikotin
            if (recipeData.nicotine > 0) {
                notes.push(t('results.notes_nicotine', 'Poté přidejte nikotin (pracujte v rukavicích!).'));
                notes.push(t('shisha.tweak_nic_tobacco_note', '💡 Tabák sám o sobě obsahuje nikotin (typicky 0,5–2 mg/g). Nikotin přidaný boosterem je navíc k tomu, co je přirozeně v tabáku.'));
            }
            // Mixologie (med, melasa, mentol, kyselina, voda)
            if (recipeData.ingredients?.some(i => i.ingredientKey?.startsWith('shisha_tweak_honey') || i.ingredientKey?.startsWith('shisha_tweak_molasses') || i.ingredientKey?.startsWith('shisha_tweak_water'))) {
                notes.push(t('shisha.note_tweak_mixology', 'Přidejte ostatní přísady (med, melasu, vodu) a vše důkladně promíchejte.'));
            }
            if (recipeData.ingredients?.some(i => i.ingredientKey === 'shisha_tweak_menthol')) {
                notes.push(t('shisha.note_tweak_menthol', 'Mentolové / cooling kapky přidejte jako poslední.'));
            }
            notes.push(t('shisha.note_tweak_rest', 'Nechte tabák odpočinout v uzavřené nádobě alespoň 30 minut, ideálně přes noc.'));
        } else if (shMode === 'molasses') {
            // Mode 3: Molasses Mix
            notes.push(t('shisha.note_mol_sweetener', 'Smíchejte melasu/med se glycerinem a vodou.'));
            if (recipeData.flavors && recipeData.flavors.length > 0) {
                notes.push(t('results.notes_flavors_first', 'Přidejte příchutě do směsi.'));
            }
            if (recipeData.nicotine > 0) {
                notes.push(t('results.notes_nicotine', 'Poté přidejte nikotin (pracujte v rukavicích!).'));
            }
            if (recipeData.waterPercent > 0 || recipeData.water > 0) {
                notes.push(t('shisha.note_add_water', 'Přidejte vodu pro zředění směsi.'));
            }
            notes.push(t('results.notes_shake', 'Důkladně protřepejte (2-3 minuty).'));
            const steepingDays = recipeData.steepDays || getMaxSteepingDaysFromRecipe(recipeData);
            if (steepingDays > 0) {
                const steepText = t('shisha.note_steeping', 'Nechte směs zrát {{days}} dní pro lepší chuť.').replace('{{days}}', steepingDays);
                notes.push(steepText);
            }
        }
    } else {
        // Standard liquid notes
        // 1. Flavors first
        notes.push(t('results.notes_flavors_first', 'Nejprve přidejte příchutě.'));
        
        // 2. Nicotine if present
        if (recipeData.nicotine > 0) {
            notes.push(t('results.notes_nicotine', 'Poté přidejte nikotin (pracujte v rukavicích!).'));
        }
        
        // 3. Base type
        if (recipeData.baseType === 'premixed') {
            notes.push(t('results.notes_premixed', 'Doplňte předmíchanou bázi.'));
            // Check if adjustment needed
            const hasAdjustment = recipeData.ingredients && recipeData.ingredients.some(
                ing => (ing.ingredientKey === 'pg' || ing.ingredientKey === 'vg') && ing.volume > 0.1
            );
            if (hasAdjustment) {
                notes.push(t('results.notes_adjustment', 'Pokud je třeba, dolaďte čistým PG nebo VG.'));
            }
        } else {
            notes.push(t('results.notes_pg_vg', 'Nakonec doplňte PG a VG.'));
        }
        
        // 4. Shake
        notes.push(t('results.notes_shake', 'Důkladně protřepejte (2-3 minuty).'));
        
        // 5. Steeping based on flavor type
        const steepingDays = getMaxSteepingDaysFromRecipe(recipeData);
        if (steepingDays > 0) {
            const steepText = t('results.notes_steep', 'Nechte zrát {days} dní.').replace('{days}', steepingDays);
            notes.push(steepText);
        }
        
        // 6. Actual ratio info
        if (recipeData.actualVg !== undefined && recipeData.totalAmount) {
            const actualVgPercent = (recipeData.actualVg / recipeData.totalAmount * 100).toFixed(1);
            const actualPgPercent = (recipeData.actualPg / recipeData.totalAmount * 100).toFixed(1);
            notes.push(`${t('results.actual_ratio', 'Skutečný poměr VG/PG')}: ${actualVgPercent}% / ${actualPgPercent}%`);
        }
    }
    
    // Render notes
    notesEl.innerHTML = notes.map(note => `<li>${note}</li>`).join('');
}

// Get max steeping days from recipe data
function getMaxSteepingDaysFromRecipe(recipeData) {
    let maxDays = 0;
    
    if (recipeData.formType === 'shisha' && recipeData.flavors) {
        // Shisha recipes - preferovat steepDays z konkrétní příchutě, fallback na kategorii
        for (const flavor of recipeData.flavors) {
            if (flavor.steepDays !== undefined && flavor.steepDays !== null && flavor.steepDays > maxDays) {
                maxDays = flavor.steepDays;
            } else if (flavor.type && flavor.type !== 'none') {
                const flavorData = shishaFlavorDatabase[flavor.type];
                if (flavorData && flavorData.steepingDays > maxDays) {
                    maxDays = flavorData.steepingDays;
                }
            }
        }
    } else if (recipeData.formType === 'liquidpro' && recipeData.flavors) {
        // Liquid PRO - preferovat steepDays z konkrétní příchutě, fallback na kategorii
        for (const flavor of recipeData.flavors) {
            if (flavor.steepDays !== undefined && flavor.steepDays !== null && flavor.steepDays > maxDays) {
                maxDays = flavor.steepDays;
            } else if (flavor.type && flavor.type !== 'none') {
                const flavorData = flavorDatabase[flavor.type];
                if (flavorData && flavorData.steepingDays > maxDays) {
                    maxDays = flavorData.steepingDays;
                }
            }
        }
    } else if (recipeData.specificFlavorSteepDays !== undefined && recipeData.specificFlavorSteepDays !== null) {
        // Liquid / Shake & Vape - konkrétní příchuť z DB má přesný steep_days
        maxDays = recipeData.specificFlavorSteepDays;
    } else if (recipeData.flavorType && recipeData.flavorType !== 'none') {
        const flavorData = flavorDatabase[recipeData.flavorType];
        if (flavorData && flavorData.steepingDays) {
            maxDays = flavorData.steepingDays;
        }
    }
    
    return maxDays;
}

// Překreslit tabulku výsledků při změně jazyka
function refreshResultsTable() {
    const tbody = document.getElementById('resultsBody');
    if (!tbody || !currentRecipeData || !currentRecipeData.ingredients) return;
    
    // Shisha recipes use custom rendering (grams, no ml for some modes)
    const isShisha = currentRecipeData.formType === 'shisha';
    const shMode = currentRecipeData.shishaMode || 'mix';
    
    tbody.innerHTML = '';
    let runningTotal = 0;
    let totalGrams = 0;
    
    currentRecipeData.ingredients.forEach(ing => {
        const row = document.createElement('tr');
        
        let grams;
        if (isShisha && ing.grams !== undefined) {
            grams = parseFloat(ing.grams) || 0;
        } else {
            grams = parseFloat(calculateIngredientGrams(ing)) || 0;
        }
        totalGrams += grams;
        
        const ingredientName = getIngredientName(ing);
        const vol = parseFloat(ing.volume || 0);
        runningTotal += vol;
        
        // For shisha tobacco items (volume=0), show '—' instead of 0.00
        const volText = (isShisha && vol === 0) ? '—' : vol.toFixed(2);
        const gramsText = isShisha ? grams.toFixed(1) : grams;
        
        row.innerHTML = `
            <td class="ingredient-name">${ingredientName} <span class="ingredient-percent-inline">(${parseFloat(ing.percent || 0).toFixed(1)}%)</span></td>
            <td class="ingredient-value">${volText}</td>
            <td class="ingredient-grams">${gramsText}</td>
        `;
        tbody.appendChild(row);
    });
    
    // Přidat řádek celkem
    const totalRow = document.createElement('tr');
    totalRow.className = 'total-row';
    const totalVolText = (isShisha && (shMode === 'mix' || runningTotal === 0)) ? '—' : runningTotal.toFixed(2);
    const totalGramsText = isShisha ? totalGrams.toFixed(1) : totalGrams.toFixed(2);
    totalRow.innerHTML = `
        <td class="ingredient-name">${t('ingredients.total', 'CELKEM')}</td>
        <td class="ingredient-value">${totalVolText}</td>
        <td class="ingredient-grams">${totalGramsText}</td>
    `;
    tbody.appendChild(totalRow);
    
    // Aktualizovat steep days text v hlavičce
    const steepContainer = document.getElementById('resultSteepContainer');
    const steepValueEl = document.getElementById('resultSteepDays');
    if (steepContainer && steepValueEl) {
        const sd = getMaxSteepingDaysFromRecipe(currentRecipeData);
        if (sd > 0) {
            const daysText = sd === 1 ? t('common.day', 'den') : 
                (sd >= 2 && sd <= 4) ? t('common.days_few', 'dny') : t('common.days', 'dní');
            steepValueEl.textContent = `${sd} ${daysText}`;
        }
    }
    
    // Regenerovat dynamické poznámky
    generateMixingNotes(currentRecipeData);
}

// Překreslit detail receptu při změně jazyka
async function refreshRecipeDetail() {
    if (!window.currentViewingRecipe) return;
    
    const contentEl = document.getElementById('recipeDetailContent');
    if (!contentEl) return;
    
    // Znovu načíst propojené produkty a příchutě a zobrazit detail
    if (window.Clerk && window.Clerk.user && window.LiquiMixerDB) {
        try {
            const linkedProducts = await window.LiquiMixerDB.getLinkedProducts(window.Clerk.user.id, window.currentViewingRecipe.id);
            const linkedFlavors = await window.LiquiMixerDB.getLinkedFlavors(window.currentViewingRecipe.id);
            displayRecipeDetail(window.currentViewingRecipe, 'recipeDetailTitle', 'recipeDetailContent', linkedProducts || [], false, linkedFlavors || []);
        } catch (err) {
            console.error('Error refreshing recipe detail:', err);
            displayRecipeDetail(window.currentViewingRecipe, 'recipeDetailTitle', 'recipeDetailContent', [], false, []);
        }
    }
}

// Překreslit detail produktu při změně jazyka (pro sekci "Použito v receptech")
async function refreshProductDetail() {
    if (!currentViewingProduct) return;
    
    const productDetailPage = document.getElementById('product-detail');
    if (!productDetailPage || !productDetailPage.classList.contains('active')) return;
    
    // Znovu načíst recepty a překreslit detail
    if (window.Clerk && window.Clerk.user && window.LiquiMixerDB) {
        try {
            let linkedRecipes = await window.LiquiMixerDB.getRecipesByProductId(
                window.Clerk.user.id, 
                currentViewingProduct.id
            );
            
            // Pro příchutě načíst i recepty propojené přes recipe_flavors
            if (currentViewingProduct.product_type === 'flavor') {
                const flavorLinkedRecipes = await window.LiquiMixerDB.getRecipesByFlavorProductId(
                    window.Clerk.user.id, 
                    currentViewingProduct.id
                );
                // Sloučit a deduplikovat
                const existingIds = new Set(linkedRecipes.map(r => r.id));
                for (const recipe of flavorLinkedRecipes) {
                    if (recipe && !existingIds.has(recipe.id)) {
                        linkedRecipes.push(recipe);
                    }
                }
            }
            
            displayProductDetail(currentViewingProduct, linkedRecipes || []);
        } catch (err) {
            console.error('Error refreshing product detail:', err);
            displayProductDetail(currentViewingProduct, []);
        }
    }
}

// =========================================
// Utility Functions
// =========================================

function adjustColorBrightness(color, percent) {
    const num = parseInt(color.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = Math.min(255, (num >> 16) + amt);
    const G = Math.min(255, ((num >> 8) & 0x00FF) + amt);
    const B = Math.min(255, (num & 0x0000FF) + amt);
    return `#${(0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1)}`;
}

// =========================================
// PWA Install Prompt
// =========================================

let deferredPrompt;

// Detect mobile device
function isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
           (window.innerWidth <= 768);
}

// Detect iOS device
function isIOSDevice() {
    return /iPhone|iPad|iPod/i.test(navigator.userAgent) && !window.MSStream;
}

// Check if app is already installed (standalone mode)
function isStandalone() {
    return window.matchMedia('(display-mode: standalone)').matches ||
           window.navigator.standalone === true;
}

window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent Chrome 67+ from automatically showing the prompt
    e.preventDefault();
    // Stash the event so it can be triggered later
    deferredPrompt = e;
    // Show the install prompt ONLY on mobile devices
    if (isMobileDevice()) {
        showInstallPrompt();
    }
});

// Show iOS install prompt on page load (iOS doesn't fire beforeinstallprompt)
window.addEventListener('load', () => {
    if (isIOSDevice() && !isStandalone() && !sessionStorage.getItem('iosInstallDismissed')) {
        // Small delay to not interrupt user immediately
        setTimeout(() => {
            showIOSInstallPrompt();
        }, 2000);
    }
});

function showInstallPrompt() {
    const prompt = document.getElementById('installPrompt');
    if (prompt) {
        prompt.classList.remove('hidden');
    }
}

function hideInstallPrompt() {
    const prompt = document.getElementById('installPrompt');
    if (prompt) {
        prompt.classList.add('hidden');
    }
}

function showIOSInstallPrompt() {
    const prompt = document.getElementById('iosInstallPrompt');
    if (prompt) {
        prompt.classList.remove('hidden');
    }
}

function hideIOSInstallPrompt() {
    const prompt = document.getElementById('iosInstallPrompt');
    if (prompt) {
        prompt.classList.add('hidden');
    }
}

// Setup install button listeners when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const installBtn = document.getElementById('installBtn');
    const dismissBtn = document.getElementById('dismissBtn');
    const iosDismissBtn = document.getElementById('iosDismissBtn');
    
    if (installBtn) {
        installBtn.addEventListener('click', async () => {
            if (deferredPrompt) {
                // Show the install prompt
                deferredPrompt.prompt();
                // Wait for the user to respond to the prompt
                const { outcome } = await deferredPrompt.userChoice;
                console.log(`User response: ${outcome}`);
                // Clear the deferred prompt
                deferredPrompt = null;
                hideInstallPrompt();
            }
        });
    }
    
    if (dismissBtn) {
        dismissBtn.addEventListener('click', () => {
            hideInstallPrompt();
            // Remember dismissal for this session
            sessionStorage.setItem('installDismissed', 'true');
        });
    }
    
    // iOS dismiss button
    if (iosDismissBtn) {
        iosDismissBtn.addEventListener('click', () => {
            hideIOSInstallPrompt();
            // Remember dismissal for this session
            sessionStorage.setItem('iosInstallDismissed', 'true');
        });
    }
    
    // Check if already dismissed this session
    if (sessionStorage.getItem('installDismissed')) {
        hideInstallPrompt();
    }
});

// Handle successful install
window.addEventListener('appinstalled', () => {
    console.log('LiquiMixer installed successfully');
    hideInstallPrompt();
    deferredPrompt = null;
});

// =========================================
// Nicotine Dilution Calculator
// =========================================

let diluteLimits = { min: 0, max: 100 };

function updateDiluteAmountType() {
    const finalInput = document.getElementById('diluteFinalAmount');
    const sourceInput = document.getElementById('diluteSourceAmount');
    const amountType = document.querySelector('input[name="amountType"]:checked').value;
    
    if (amountType === 'final') {
        finalInput.disabled = false;
        sourceInput.disabled = true;
    } else {
        finalInput.disabled = true;
        sourceInput.disabled = false;
    }
    
    updateDiluteCalculation();
}

function updateDiluteNicotineType() {
    const type = document.getElementById('diluteNicotineType').value;
    const strengthInput = document.getElementById('diluteBaseStrength');
    
    if (type === 'freebase') {
        strengthInput.max = 200;
        if (parseInt(strengthInput.value) > 200) {
            strengthInput.value = 200;
        }
    } else {
        strengthInput.max = 72;
        if (parseInt(strengthInput.value) > 72) {
            strengthInput.value = 72;
        }
    }
    
    updateDiluteCalculation();
}

function adjustDiluteSourceRatio(change) {
    const slider = document.getElementById('diluteSourceRatio');
    let newValue = parseInt(slider.value) + change;
    newValue = Math.max(0, Math.min(100, newValue));
    slider.value = newValue;
    updateDiluteSourceRatioDisplay();
}

function updateDiluteSourceRatioDisplay() {
    const slider = document.getElementById('diluteSourceRatio');
    const vg = parseInt(slider.value);
    const pg = 100 - vg;
    
    const vgEl = document.getElementById('diluteSourceVg');
    const pgEl = document.getElementById('diluteSourcePg');
    
    vgEl.textContent = vg;
    pgEl.textContent = pg;
    
    // Update color description
    const desc = ratioDescriptions.find(d => vg >= d.vgMin && vg <= d.vgMax);
    if (desc) {
        const descEl = document.getElementById('diluteSourceDescription');
        const trackEl = document.getElementById('diluteSourceTrack');
        if (descEl) {
            descEl.textContent = getRatioDescriptionText(vg);
            descEl.style.color = desc.color;
            descEl.style.borderLeftColor = desc.color;
        }
        if (trackEl) {
            trackEl.style.background = `linear-gradient(90deg, ${desc.color}, ${adjustColorBrightness(desc.color, 30)})`;
        }
        // Update ratio display color
        vgEl.style.color = desc.color;
        pgEl.style.color = desc.color;
        vgEl.style.textShadow = `0 0 20px ${desc.color}`;
        pgEl.style.textShadow = `0 0 20px ${desc.color}`;
    }
    
    updateDiluteRatioLimits();
}

function adjustDiluteTargetRatio(change) {
    const slider = document.getElementById('diluteTargetRatio');
    let currentValue = parseInt(slider.value);
    
    let newValue;
    if (change > 0) {
        newValue = Math.ceil((currentValue + 1) / 5) * 5;
    } else {
        newValue = Math.floor((currentValue - 1) / 5) * 5;
    }
    
    newValue = Math.max(diluteLimits.min, Math.min(diluteLimits.max, newValue));
    slider.value = newValue;
    updateDiluteTargetRatioDisplay();
}

function updateDiluteTargetRatioDisplay() {
    const slider = document.getElementById('diluteTargetRatio');
    let vg = parseInt(slider.value);
    
    // Clamp to limits
    if (vg < diluteLimits.min) vg = diluteLimits.min;
    if (vg > diluteLimits.max) vg = diluteLimits.max;
    slider.value = vg;
    
    const pg = 100 - vg;
    
    const vgEl = document.getElementById('diluteTargetVg');
    const pgEl = document.getElementById('diluteTargetPg');
    
    vgEl.textContent = vg;
    pgEl.textContent = pg;
    
    // Update color description
    const desc = ratioDescriptions.find(d => vg >= d.vgMin && vg <= d.vgMax);
    if (desc) {
        const descEl = document.getElementById('diluteTargetDescription');
        const trackEl = document.getElementById('diluteTargetTrack');
        if (descEl) {
            descEl.textContent = getRatioDescriptionText(vg);
            descEl.style.color = desc.color;
            descEl.style.borderLeftColor = desc.color;
        }
        if (trackEl) {
            trackEl.style.background = `linear-gradient(90deg, ${desc.color}, ${adjustColorBrightness(desc.color, 30)})`;
        }
        // Update ratio display color
        vgEl.style.color = desc.color;
        pgEl.style.color = desc.color;
        vgEl.style.textShadow = `0 0 20px ${desc.color}`;
        pgEl.style.textShadow = `0 0 20px ${desc.color}`;
    }
}

function updateDiluteRatioLimits() {
    const baseStrength = parseFloat(document.getElementById('diluteBaseStrength').value) || 0;
    const targetStrength = parseFloat(document.getElementById('diluteTargetStrength').value) || 0;
    const sourceVg = parseInt(document.getElementById('diluteSourceRatio').value);
    const sourcePg = 100 - sourceVg;
    
    const disabledLeft = document.getElementById('diluteDisabledLeft');
    const disabledRight = document.getElementById('diluteDisabledRight');
    const warningEl = document.getElementById('diluteRatioWarning');
    
    // Calculate dilution ratio
    let dilutionRatio = 0;
    if (baseStrength > 0 && targetStrength > 0 && targetStrength <= baseStrength) {
        dilutionRatio = targetStrength / baseStrength; // fraction of nicotine base in final mix
    }
    
    // Calculate VG/PG contribution from nicotine base
    const nicVgPercent = dilutionRatio * sourceVg;
    const nicPgPercent = dilutionRatio * sourcePg;
    
    // Min VG = VG from nicotine only (no extra VG added)
    // Max VG = 100 - PG from nicotine (all remaining is VG)
    const minVg = Math.ceil(nicVgPercent);
    const maxVg = Math.floor(100 - nicPgPercent);
    
    diluteLimits.min = Math.max(0, minVg);
    diluteLimits.max = Math.min(100, maxVg);
    
    // Update disabled zones
    if (disabledLeft) {
        disabledLeft.style.width = diluteLimits.min + '%';
    }
    if (disabledRight) {
        disabledRight.style.width = (100 - diluteLimits.max) + '%';
    }
    
    // Show warning if limited
    if (warningEl) {
        if (diluteLimits.min > 0 || diluteLimits.max < 100) {
            const warningText = t('ratio_warning.limited_nicotine', 'Poměr omezen na {min}–{max}% VG kvůli poměru v nikotinové bázi.')
                .replace('{min}', diluteLimits.min)
                .replace('{max}', diluteLimits.max);
            warningEl.textContent = warningText;
            warningEl.classList.remove('hidden');
        } else {
            warningEl.classList.add('hidden');
        }
    }
    
    // Clamp current value
    const slider = document.getElementById('diluteTargetRatio');
    let currentValue = parseInt(slider.value);
    if (currentValue < diluteLimits.min) {
        slider.value = diluteLimits.min;
    } else if (currentValue > diluteLimits.max) {
        slider.value = diluteLimits.max;
    }
    
    updateDiluteTargetRatioDisplay();
}

function updateDiluteCalculation() {
    // Validate target strength
    const baseStrength = parseFloat(document.getElementById('diluteBaseStrength').value) || 0;
    const targetStrength = parseFloat(document.getElementById('diluteTargetStrength').value) || 0;
    const warningEl = document.getElementById('diluteTargetWarning');
    
    if (targetStrength > baseStrength && baseStrength > 0) {
        if (warningEl) {
            const warningText = t('dilute.target_too_high', 'Target strength cannot be higher than source ({strength} mg/ml).')
                .replace('{strength}', baseStrength);
            warningEl.textContent = warningText;
            warningEl.classList.remove('hidden');
        }
        document.getElementById('diluteTargetStrength').value = baseStrength;
    } else if (warningEl) {
        warningEl.classList.add('hidden');
    }
    
    updateDiluteRatioLimits();
}

function calculateDilution() {
    // Get inputs
    const amountType = document.querySelector('input[name="amountType"]:checked').value;
    const baseStrength = parseFloat(document.getElementById('diluteBaseStrength').value) || 0;
    const targetStrength = parseFloat(document.getElementById('diluteTargetStrength').value) || 0;
    const sourceVg = parseInt(document.getElementById('diluteSourceRatio').value);
    const sourcePg = 100 - sourceVg;
    const targetVg = parseInt(document.getElementById('diluteTargetRatio').value);
    const targetPg = 100 - targetVg;
    const nicotineType = document.getElementById('diluteNicotineType').value;
    
    let totalAmount, nicotineVolume;
    
    if (amountType === 'final') {
        // User specified final amount
        totalAmount = parseFloat(document.getElementById('diluteFinalAmount').value) || 100;
        // Calculate how much nicotine base needed
        if (baseStrength > 0 && targetStrength > 0) {
            nicotineVolume = (targetStrength * totalAmount) / baseStrength;
        } else {
            nicotineVolume = 0;
        }
    } else {
        // User specified source nicotine amount
        nicotineVolume = parseFloat(document.getElementById('diluteSourceAmount').value) || 30;
        // Calculate final total amount
        if (baseStrength > 0 && targetStrength > 0) {
            totalAmount = (nicotineVolume * baseStrength) / targetStrength;
        } else {
            totalAmount = nicotineVolume;
        }
    }
    
    // Calculate VG and PG from nicotine
    const nicVgVolume = nicotineVolume * (sourceVg / 100);
    const nicPgVolume = nicotineVolume * (sourcePg / 100);
    
    // Calculate target VG and PG volumes
    const targetVgVolume = (targetVg / 100) * totalAmount;
    const targetPgVolume = (targetPg / 100) * totalAmount;
    
    // Calculate pure VG and PG needed
    let pureVgNeeded = targetVgVolume - nicVgVolume;
    let purePgNeeded = targetPgVolume - nicPgVolume;
    
    if (pureVgNeeded < 0) pureVgNeeded = 0;
    if (purePgNeeded < 0) purePgNeeded = 0;
    
    // Build results - ukládáme klíče pro dynamický překlad
    const ingredients = [];

    ingredients.push({
        ingredientKey: nicotineType === 'salt' ? 'nicotine_salt' : 'nicotine_booster',
        params: {
            strength: baseStrength,
            vgpg: `${sourceVg}/${sourcePg}`
        },
        volume: nicotineVolume,
        percent: (nicotineVolume / totalAmount) * 100
    });

    if (purePgNeeded > 0.01) {
        ingredients.push({
            ingredientKey: 'pg',
            volume: purePgNeeded,
            percent: (purePgNeeded / totalAmount) * 100
        });
    }

    if (pureVgNeeded > 0.01) {
        ingredients.push({
            ingredientKey: 'vg',
            volume: pureVgNeeded,
            percent: (pureVgNeeded / totalAmount) * 100
        });
    }

    // Kontrola přihlášení před zobrazením výsledků - Ředění nikotinové báze vyžaduje přihlášení
    if (!isUserLoggedIn()) {
        showLoginRequiredModal();
        return;
    }
    
    // Display results
    displayDiluteResults(totalAmount, targetVg, targetPg, targetStrength, ingredients);
    
    // Logovat výpočet do analytics
    storeCurrentRecipe({
        formType: 'dilute',
        totalAmount: +totalAmount.toFixed(1),
        vgPercent: targetVg,
        pgPercent: targetPg,
        nicotine: targetStrength,
        baseStrength: baseStrength,
        targetNicotine: targetStrength,
        diluteAmount: amountType,
        ingredients: ingredients
    });
    
    showPage('dilute-results');
}

function displayDiluteResults(total, vg, pg, nicotine, ingredients) {
    document.getElementById('diluteResultTotal').textContent = `${total.toFixed(1)} ml`;
    document.getElementById('diluteResultRatio').textContent = `${vg}:${pg}`;
    document.getElementById('diluteResultNicotine').textContent = `${nicotine} mg/ml`;

    const tbody = document.getElementById('diluteResultsBody');
    tbody.innerHTML = '';

    let runningTotal = 0;
    let runningTotalGrams = 0;

    ingredients.forEach(ing => {
        const row = document.createElement('tr');
        // Dynamicky přeložit název ingredience
        const ingredientName = getIngredientName(ing);
        
        // Vypočítat gramy podle typu ingredience
        let density = ingredientDensities.pg; // default
        if (ing.ingredientKey === 'vg') {
            density = ingredientDensities.vg;
        } else if (ing.ingredientKey === 'pg') {
            density = ingredientDensities.pg;
        } else if (ing.ingredientKey === 'nicotine') {
            // Hustota nikotinu závisí na VG/PG poměru
            const nicVgRatio = ing.vgRatio || 50;
            density = calculateNicotineDensity(nicVgRatio);
        }
        
        const grams = ing.volume * density;
        runningTotalGrams += grams;
        
        row.innerHTML = `
            <td class="ingredient-name">${ingredientName}</td>
            <td class="ingredient-value">${ing.volume.toFixed(2)} ml</td>
            <td class="ingredient-grams">${grams.toFixed(2)} g</td>
        `;
        tbody.appendChild(row);
        runningTotal += ing.volume;
    });

    // Add total row
    const totalRow = document.createElement('tr');
    totalRow.className = 'total-row';
    totalRow.innerHTML = `
        <td class="ingredient-name">${t('ingredients.total', 'CELKEM')}</td>
        <td class="ingredient-value">${runningTotal.toFixed(2)} ml</td>
        <td class="ingredient-grams">${runningTotalGrams.toFixed(2)} g</td>
    `;
    tbody.appendChild(totalRow);
}

// =========================================
// Form Tab Switching
// =========================================

let currentFormTab = 'liquid';

function switchFormTab(tabName) {
    // V režimu editace zamezit změně záložky (kromě programového volání z goBackToCalculator)
    if (window.editingRecipeFromDetail && currentFormTab !== tabName) {
        // Pokud je volání z onclick (uživatel klikl na záložku), ignorovat
        // Povolíme pouze pokud je explicitně nastaveno window.allowTabSwitch
        if (!window.allowTabSwitch) {
            console.log('Tab switch blocked - editing mode active');
            return;
        }
    }
    window.allowTabSwitch = false; // Reset flagu
    
    currentFormTab = tabName;
    
    // Update tab buttons (only within eLiquid form section)
    document.querySelectorAll('#form .form-tab').forEach(tab => {
        tab.classList.remove('active');
        if (tab.dataset.tab === tabName) {
            tab.classList.add('active');
        }
    });
    
    // Update form content visibility (only within eLiquid form section)
    document.querySelectorAll('#form .form-content').forEach(content => {
        content.classList.remove('active');
    });
    
    const targetForm = document.getElementById(`form-${tabName}`);
    if (targetForm) {
        targetForm.classList.add('active');
    }
    
    // Initialize displays for the active form
    if (tabName === 'shakevape') {
        initShakeVapeForm();
    } else if (tabName === 'liquidpro') {
        initLiquidProForm();
    } else if (tabName === 'shortfill') {
        calculateShortfill();
    }
}

// Aktualizovat stav záložek formuláře (disabled v režimu editace)
function updateFormTabsState() {
    const tabs = document.querySelectorAll('#form .form-tab');
    if (window.editingRecipeFromDetail) {
        // V režimu editace označit neaktivní záložky jako disabled
        tabs.forEach(tab => {
            if (tab.dataset.tab !== currentFormTab) {
                tab.classList.add('tab-disabled');
            } else {
                tab.classList.remove('tab-disabled');
            }
        });
    } else {
        // Normální režim - všechny záložky aktivní
        tabs.forEach(tab => {
            tab.classList.remove('tab-disabled');
        });
    }
}

// =========================================
// Shake & Vape Functions
// =========================================

let svVgPgLimits = { min: 0, max: 100 };

function initShakeVapeForm() {
    // Neresetovat flag pokud je true (nastaven z prefill uloženého receptu)
    if (!shakevapeUserManuallyChangedRatio) {
        shakevapeUserManuallyChangedRatio = false;
    }
    
    setupSvNicotineRatioToggle();
    updateSvRatioDisplay();
    updateSvNicotineDisplay();
}

function setupSvNicotineRatioToggle() {
    const ratio5050Btn = document.getElementById('svRatio5050');
    const ratio7030Btn = document.getElementById('svRatio7030');
    const nicotineRatioInput = document.getElementById('svNicotineRatio');
    
    if (ratio5050Btn && ratio7030Btn && nicotineRatioInput) {
        ratio5050Btn.onclick = () => {
            ratio5050Btn.classList.add('active');
            ratio7030Btn.classList.remove('active');
            nicotineRatioInput.value = '50/50';
            autoRecalculateSvVgPgRatio();
        };
        
        ratio7030Btn.onclick = () => {
            ratio7030Btn.classList.add('active');
            ratio5050Btn.classList.remove('active');
            nicotineRatioInput.value = '70/30';
            autoRecalculateSvVgPgRatio();
        };
    }
}

// =========================================
// Shake & Vape Premixed Base Functions
// =========================================

// Update SV base type (separate or premixed)
function updateSvBaseType(type) {
    const baseTypeInput = document.getElementById('svBaseType');
    const premixedContainer = document.getElementById('svPremixedRatioContainer');
    const separateBtn = document.getElementById('svBaseSeparate');
    const premixedBtn = document.getElementById('svBasePremixed');
    
    if (baseTypeInput) baseTypeInput.value = type;
    
    if (!_prefillingSavedRecipe) {
        shakevapeUserManuallyChangedRatio = false;
    }
    
    if (type === 'premixed') {
        separateBtn.classList.remove('active');
        premixedBtn.classList.add('active');
        if (premixedContainer) premixedContainer.classList.remove('hidden');
        
        if (!_prefillingSavedRecipe) {
            const actualVg = calculateActualVgPgRatio('shakevape');
            const slider = document.getElementById('svVgPgRatio');
            if (slider) {
                slider.value = actualVg;
                updateSvRatioDisplay();
            }
        }
    } else {
        separateBtn.classList.add('active');
        premixedBtn.classList.remove('active');
        if (premixedContainer) premixedContainer.classList.add('hidden');
    }
    
    if (!_prefillingSavedRecipe) {
        updateSvVgPgLimits();
    }
}

// Update SV premixed ratio
function updateSvPremixedRatio(ratio) {
    const premixedRatioInput = document.getElementById('svPremixedRatio');
    if (premixedRatioInput) premixedRatioInput.value = ratio;
    
    // Update button states
    const buttons = document.querySelectorAll('.sv-premixed-ratio-btn');
    buttons.forEach(btn => {
        if (btn.dataset.value === ratio) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    
    // Automaticky nastavit VG/PG slider na skutečný výsledný poměr
    // POUZE pokud uživatel ručně neměnil poměr a neprobíhá prefill
    const _wasPrefilling = _prefillingSavedRecipe;
    setTimeout(() => {
        if (!shakevapeUserManuallyChangedRatio && !_wasPrefilling) {
            const actualVg = calculateActualVgPgRatio('shakevape');
            const slider = document.getElementById('svVgPgRatio');
            if (slider) {
                slider.value = actualVg;
                updateSvRatioDisplay();
            }
        }
    }, 0);
    
    if (!_prefillingSavedRecipe) {
        updateSvVgPgLimits();
    }
}

// Get SV premixed base VG percent
function getSvPremixedVgPercent() {
    const premixedRatio = document.getElementById('svPremixedRatio')?.value || '60/40';
    const parts = premixedRatio.split('/');
    return parseInt(parts[0]) || 60;
}

// Automaticky přepočítat VG/PG slider při změně jakéhokoliv parametru (pouze v premixed mode) - SHAKE & VAPE form
function autoRecalculateSvVgPgRatio() {
    if (_prefillingSavedRecipe) return;
    const baseType = document.getElementById('svBaseType')?.value || 'separate';
    // Přepočítat POUZE pokud uživatel ručně neměnil poměr
    if (baseType === 'premixed' && !shakevapeUserManuallyChangedRatio) {
        const actualVg = calculateActualVgPgRatio('shakevape');
        const slider = document.getElementById('svVgPgRatio');
        if (slider) {
            slider.value = actualVg;
            updateSvRatioDisplay();
        }
    }
    updateSvVgPgLimits();
}

// Export SV premixed base functions
window.updateSvBaseType = updateSvBaseType;
window.updateSvPremixedRatio = updateSvPremixedRatio;
window.autoRecalculateSvVgPgRatio = autoRecalculateSvVgPgRatio;

function updateSvNicotineType() {
    const type = document.getElementById('svNicotineType').value;
    const strengthContainer = document.getElementById('svNicotineStrengthContainer');
    const ratioContainer = document.getElementById('svNicotineRatioContainer');
    const targetSubGroup = document.getElementById('svTargetNicotineSubGroup');
    
    if (type === 'none') {
        strengthContainer.classList.add('hidden');
        ratioContainer.classList.add('hidden');
        if (targetSubGroup) targetSubGroup.classList.add('hidden');
        document.getElementById('svTargetNicotine').value = 0;
        updateSvNicotineDisplay();
    } else {
        strengthContainer.classList.remove('hidden');
        ratioContainer.classList.remove('hidden');
        if (targetSubGroup) targetSubGroup.classList.remove('hidden');
    }
    
    autoRecalculateSvVgPgRatio();
}

function adjustSvTargetNicotine(change) {
    const slider = document.getElementById('svTargetNicotine');
    let newValue = parseInt(slider.value) + change;
    newValue = Math.max(0, Math.min(parseInt(slider.max), newValue));
    slider.value = newValue;
    updateSvNicotineDisplay();
}

function updateSvNicotineDisplay() {
    const slider = document.getElementById('svTargetNicotine');
    const value = parseInt(slider.value);
    const displayEl = document.getElementById('svTargetNicotineValue');
    const displayContainer = displayEl.parentElement;
    const descEl = document.getElementById('svNicotineDescription');
    const trackEl = document.getElementById('svNicotineTrack');
    
    displayEl.textContent = value;
    
    const desc = nicotineDescriptions.find(d => value >= d.min && value <= d.max);
    if (desc) {
        descEl.textContent = getNicotineDescriptionText(value);
        descEl.style.color = desc.color;
        descEl.style.borderLeftColor = desc.color;
        // Set color on container so unit has same color as number
        displayEl.style.color = 'inherit';
        displayContainer.style.color = desc.color;
        displayContainer.style.textShadow = `0 0 20px ${desc.color}`;
        trackEl.style.background = `linear-gradient(90deg, #00cc66, ${desc.color})`;
    }
    
    autoRecalculateSvVgPgRatio();
}

function adjustSvRatio(change) {
    const slider = document.getElementById('svVgPgRatio');
    let currentValue = parseInt(slider.value);
    
    let newValue;
    if (change > 0) {
        newValue = Math.ceil((currentValue + 1) / 5) * 5;
    } else {
        newValue = Math.floor((currentValue - 1) / 5) * 5;
    }
    
    newValue = Math.max(svVgPgLimits.min, Math.min(svVgPgLimits.max, newValue));
    slider.value = newValue;
    shakevapeUserManuallyChangedRatio = true;
    updateSvRatioDisplay();
}

function updateSvRatioDisplay() {
    const slider = document.getElementById('svVgPgRatio');
    const vg = parseInt(slider.value);
    const pg = 100 - vg;

    document.getElementById('svVgValue').textContent = vg;
    document.getElementById('svPgValue').textContent = pg;

    const desc = ratioDescriptions.find(d => vg >= d.vgMin && vg <= d.vgMax);
    if (desc) {
        const descEl = document.getElementById('svRatioDescription');
        descEl.textContent = getRatioDescriptionText(vg);
        descEl.style.color = desc.color;
        descEl.style.borderLeftColor = desc.color;
        document.getElementById('svSliderTrack').style.background =
            `linear-gradient(90deg, ${desc.color}, ${adjustColorBrightness(desc.color, 30)})`;
    }
}

function updateSvVgPgLimits() {
    const slider = document.getElementById('svVgPgRatio');
    const warningEl = document.getElementById('svRatioLimitWarning');
    const disabledLeft = document.getElementById('svSliderDisabledLeft');
    const disabledRight = document.getElementById('svSliderDisabledRight');
    
    const totalAmount = parseFloat(document.getElementById('svTotalAmount').value) || 60;
    const nicotineType = document.getElementById('svNicotineType').value;
    const targetNicotine = parseFloat(document.getElementById('svTargetNicotine').value) || 0;
    const baseNicotine = parseFloat(document.getElementById('svNicotineBaseStrength').value) || 0;
    const flavorVolume = parseFloat(document.getElementById('svFlavorVolume').value) || 0;
    
    let nicotineVolume = 0;
    if (nicotineType !== 'none' && targetNicotine > 0 && baseNicotine > 0) {
        nicotineVolume = (targetNicotine * totalAmount) / baseNicotine;
    }
    
    let nicVgPercent = 50;
    let nicPgPercent = 50;
    if (nicotineType !== 'none') {
        const nicotineRatio = document.getElementById('svNicotineRatio').value;
        if (nicotineRatio === '50/50') {
            nicVgPercent = 50;
            nicPgPercent = 50;
        } else if (nicotineRatio === '70/30') {
            nicVgPercent = 70;
            nicPgPercent = 30;
        }
    }
    
    const nicotineVgVolume = nicotineVolume * (nicVgPercent / 100);
    const nicotinePgVolume = nicotineVolume * (nicPgPercent / 100);

    // Get flavor VG/PG ratio - dynamické parsování z formátu "VG/PG"
    const svFlavorRatio = document.getElementById('svFlavorRatio').value || '0/100';
    const svRatioParts = svFlavorRatio.split('/');
    const flavorVgPercent = parseInt(svRatioParts[0]) || 0;
    const flavorPgPercent = parseInt(svRatioParts[1]) || (100 - flavorVgPercent);

    const flavorVgVolume = flavorVolume * (flavorVgPercent / 100);
    const flavorPgVolume = flavorVolume * (flavorPgPercent / 100);

    const fixedPgVolume = nicotinePgVolume + flavorPgVolume;
    const fixedVgVolume = nicotineVgVolume + flavorVgVolume;
    
    // Zbývající objem pro bázi
    const remainingVolume = totalAmount - nicotineVolume - flavorVolume;
    
    // Zkontrolovat jestli je vybraný premixed režim
    const baseType = document.getElementById('svBaseType')?.value || 'separate';
    const premixedRatio = document.getElementById('svPremixedRatio')?.value || '50/50';
    
    let minVgPercent, maxVgPercent;
    
    if (baseType === 'premixed' && remainingVolume > 0) {
        // PREMIXED režim - limity jsou ovlivněny poměrem báze + možnost doladění
        // S doladěním můžeme dosáhnout rozsahu od fixedVg do fixedVg + remainingVolume
        minVgPercent = Math.ceil((fixedVgVolume / totalAmount) * 100);
        maxVgPercent = Math.floor(((fixedVgVolume + remainingVolume) / totalAmount) * 100);
    } else {
        // SEPARATE režim - původní logika
        minVgPercent = Math.ceil((fixedVgVolume / totalAmount) * 100);
        maxVgPercent = Math.floor(100 - (fixedPgVolume / totalAmount) * 100);
    }

    svVgPgLimits.min = Math.max(0, minVgPercent);
    svVgPgLimits.max = Math.min(100, maxVgPercent);
    
    if (disabledLeft) {
        disabledLeft.style.width = svVgPgLimits.min + '%';
    }
    if (disabledRight) {
        disabledRight.style.width = (100 - svVgPgLimits.max) + '%';
    }
    
    let currentValue = parseInt(slider.value);
    if (currentValue < svVgPgLimits.min) {
        slider.value = svVgPgLimits.min;
    } else if (currentValue > svVgPgLimits.max) {
        slider.value = svVgPgLimits.max;
    }
    
    if (warningEl) {
        if (svVgPgLimits.min > 0 || svVgPgLimits.max < 100) {
            const reasons = [];
            if (nicotineVolume > 0) {
                const nicReason = t('ratio_warning.reason_nicotine', 'nikotinová báze ({strength} mg/ml, VG/PG {vg}/{pg})')
                    .replace('{strength}', baseNicotine)
                    .replace('{vg}', nicVgPercent)
                    .replace('{pg}', nicPgPercent);
                reasons.push(nicReason);
            }
            if (flavorVolume > 0) {
                const flavorReason = t('ratio_warning.reason_flavor_volume', 'flavor ({volume} ml, VG/PG {vg}/{pg})')
                    .replace('{volume}', flavorVolume)
                    .replace('{vg}', flavorVgPercent)
                    .replace('{pg}', flavorPgPercent);
                reasons.push(flavorReason);
            }
            const warningText = t('ratio_warning.limited_to', 'Poměr omezen na {min}–{max}% VG kvůli: {reasons}.')
                .replace('{min}', svVgPgLimits.min)
                .replace('{max}', svVgPgLimits.max)
                .replace('{reasons}', reasons.join(', '));
            warningEl.textContent = warningText;
            warningEl.classList.remove('hidden');
        } else {
            warningEl.classList.add('hidden');
        }
    }
    
    updateSvRatioDisplay();
}

function updateSvCalculation() {
    updateSvVgPgLimits();
}

function calculateShakeVape() {
    const totalAmount = parseFloat(document.getElementById('svTotalAmount').value) || 60;
    const vgPercent = parseInt(document.getElementById('svVgPgRatio').value);
    const pgPercent = 100 - vgPercent;
    const nicotineType = document.getElementById('svNicotineType').value;
    const targetNicotine = parseFloat(document.getElementById('svTargetNicotine').value) || 0;
    const baseNicotine = parseFloat(document.getElementById('svNicotineBaseStrength').value) || 0;
    const flavorVolume = parseFloat(document.getElementById('svFlavorVolume').value) || 0;
    
    // Get base type (separate or premixed)
    const baseType = document.getElementById('svBaseType')?.value || 'separate';
    const premixedRatio = document.getElementById('svPremixedRatio')?.value || '50/50';
    
    let nicotineVolume = 0;
    if (nicotineType !== 'none' && targetNicotine > 0 && baseNicotine > 0) {
        nicotineVolume = (targetNicotine * totalAmount) / baseNicotine;
    }
    
    let nicVgPercent = 50;
    let nicPgPercent = 50;
    if (nicotineType !== 'none') {
        const nicotineRatio = document.getElementById('svNicotineRatio').value;
        if (nicotineRatio === '50/50') {
            nicVgPercent = 50;
            nicPgPercent = 50;
        } else if (nicotineRatio === '70/30') {
            nicVgPercent = 70;
            nicPgPercent = 30;
        }
    }
    
    const nicotineVgContent = nicotineVolume * (nicVgPercent / 100);
    const nicotinePgContent = nicotineVolume * (nicPgPercent / 100);
    
    // Get flavor VG/PG ratio - dynamické parsování z formátu "VG/PG"
    const svFlavorRatio = document.getElementById('svFlavorRatio').value || '0/100';
    const svRatioParts = svFlavorRatio.split('/');
    const flavorVgPercent = parseInt(svRatioParts[0]) || 0;
    const flavorPgPercent = parseInt(svRatioParts[1]) || (100 - flavorVgPercent);
    
    const flavorVgContent = flavorVolume * (flavorVgPercent / 100);
    const flavorPgContent = flavorVolume * (flavorPgPercent / 100);

    const remainingVolume = totalAmount - nicotineVolume - flavorVolume;

    const targetVgTotal = (vgPercent / 100) * totalAmount;
    const targetPgTotal = (pgPercent / 100) * totalAmount;

    let pureVgNeeded = 0;
    let purePgNeeded = 0;
    let premixedBaseVolume = 0;
    let premixedVgPercent = 50;
    
    const DROPS_PER_ML = 20;
    const ingredients = [];

    // Flavor first (already in bottle)
    if (flavorVolume > 0) {
        ingredients.push({
            ingredientKey: 'shakevape_flavor',
            params: {
                vgpg: svFlavorRatio
            },
            volume: flavorVolume,
            percent: (flavorVolume / totalAmount) * 100,
            drops: Math.round(flavorVolume * DROPS_PER_ML),
            showDrops: true
        });
    }

    if (nicotineVolume > 0) {
        const nicotineRatioValue = document.getElementById('svNicotineRatio').value;
        ingredients.push({
            ingredientKey: nicotineType === 'salt' ? 'nicotine_salt' : 'nicotine_booster',
            vgRatio: nicVgPercent,
            params: {
                strength: baseNicotine,
                vgpg: nicotineRatioValue
            },
            volume: nicotineVolume,
            percent: (nicotineVolume / totalAmount) * 100,
            drops: Math.round(nicotineVolume * DROPS_PER_ML),
            showDrops: true
        });
    }

    if (baseType === 'premixed') {
        // PREMIXED BASE MODE s podporou doladění
        const premixedParts = premixedRatio.split('/');
        premixedVgPercent = parseInt(premixedParts[0]) || 50;
        const premixedPgPercent = 100 - premixedVgPercent;
        
        // Kolik VG/PG již máme z nikotinu a příchutí
        const providedVg = nicotineVgContent + flavorVgContent;
        const providedPg = nicotinePgContent + flavorPgContent;
        
        // Kolik VG/PG ještě potřebujeme dodat pro cílový poměr
        const neededVg = Math.max(0, targetVgTotal - providedVg);
        const neededPg = Math.max(0, targetPgTotal - providedPg);
        
        // Vypočítat optimální množství předmíchané báze a doladění
        let adjustmentVg = 0;
        let adjustmentPg = 0;
        
        if (premixedVgPercent >= 100) {
            // Báze je 100% VG - použijeme ji pro VG a doladíme PG
            premixedBaseVolume = Math.min(neededVg, remainingVolume);
            adjustmentPg = Math.min(neededPg, remainingVolume - premixedBaseVolume);
        } else if (premixedVgPercent <= 0) {
            // Báze je 100% PG - použijeme ji pro PG a doladíme VG
            premixedBaseVolume = Math.min(neededPg, remainingVolume);
            adjustmentVg = Math.min(neededVg, remainingVolume - premixedBaseVolume);
        } else {
            // Smíšená báze:
            // Pokud uživatel neměnil VG/PG posuvník, použít celou bázi bez doladění
            if (!shakevapeUserManuallyChangedRatio) {
                premixedBaseVolume = remainingVolume;
                adjustmentVg = 0;
                adjustmentPg = 0;
            } else {
                // Uživatel ručně změnil cílový poměr VG/PG
                if (neededVg > 0 && neededPg > 0) {
                    const neededVgRatio = neededVg / (neededVg + neededPg);
                    const baseVgRatio = premixedVgPercent / 100;
                    
                    if (neededVgRatio > baseVgRatio) {
                        if (premixedPgPercent > 0) {
                            premixedBaseVolume = Math.min(neededPg / (premixedPgPercent / 100), remainingVolume);
                            adjustmentVg = remainingVolume - premixedBaseVolume;
                            adjustmentPg = 0;
                        } else {
                            premixedBaseVolume = remainingVolume;
                        }
                    } else {
                        if (premixedVgPercent > 0) {
                            premixedBaseVolume = Math.min(neededVg / (premixedVgPercent / 100), remainingVolume);
                            adjustmentPg = remainingVolume - premixedBaseVolume;
                            adjustmentVg = 0;
                        } else {
                            premixedBaseVolume = remainingVolume;
                        }
                    }
                } else if (neededVg > 0) {
                    premixedBaseVolume = 0;
                    adjustmentVg = remainingVolume;
                } else if (neededPg > 0) {
                    premixedBaseVolume = 0;
                    adjustmentPg = remainingVolume;
                } else {
                    premixedBaseVolume = remainingVolume;
                }
                
                premixedBaseVolume = Math.max(0, premixedBaseVolume);
                adjustmentVg = Math.max(0, adjustmentVg);
                adjustmentPg = Math.max(0, adjustmentPg);
            }
        }
        
        // Add premixed base
        if (premixedBaseVolume > 0.01) {
            ingredients.push({
                ingredientKey: 'premixedBase',
                vgRatio: premixedVgPercent,
                params: {
                    vgpg: premixedRatio
                },
                volume: premixedBaseVolume,
                percent: (premixedBaseVolume / totalAmount) * 100
            });
        }
        
        // Přidat doladění VG/PG pokud je potřeba (> 0.01 ml)
        if (adjustmentVg > 0.01) {
            pureVgNeeded = adjustmentVg;
            ingredients.push({
                ingredientKey: 'vg_adjustment',
                volume: adjustmentVg,
                percent: (adjustmentVg / totalAmount) * 100,
                drops: null,
                showDrops: false
            });
        } else {
            pureVgNeeded = 0;
        }
        
        if (adjustmentPg > 0.01) {
            purePgNeeded = adjustmentPg;
            ingredients.push({
                ingredientKey: 'pg_adjustment',
                volume: adjustmentPg,
                percent: (adjustmentPg / totalAmount) * 100,
                drops: null,
                showDrops: false
            });
        } else {
            purePgNeeded = 0;
        }
    } else {
        // SEPARATE PG/VG MODE (original logic)
        pureVgNeeded = targetVgTotal - nicotineVgContent - flavorVgContent;
        purePgNeeded = targetPgTotal - nicotinePgContent - flavorPgContent;
        
        if (pureVgNeeded < 0) pureVgNeeded = 0;
        if (purePgNeeded < 0) purePgNeeded = 0;
        
        const totalPureNeeded = pureVgNeeded + purePgNeeded;
        if (totalPureNeeded > remainingVolume && totalPureNeeded > 0) {
            const ratio = remainingVolume / totalPureNeeded;
            pureVgNeeded *= ratio;
            purePgNeeded *= ratio;
        } else if (totalPureNeeded < remainingVolume) {
            const extra = remainingVolume - totalPureNeeded;
            if (vgPercent + pgPercent > 0) {
                pureVgNeeded += extra * (vgPercent / 100);
                purePgNeeded += extra * (pgPercent / 100);
            }
        }
        
        if (purePgNeeded > 0.01) {
            ingredients.push({
                ingredientKey: 'pg',
                volume: purePgNeeded,
                percent: (purePgNeeded / totalAmount) * 100,
                drops: null,
                showDrops: false
            });
        }
        
        if (pureVgNeeded > 0.01) {
            ingredients.push({
                ingredientKey: 'vg',
                volume: pureVgNeeded,
                percent: (pureVgNeeded / totalAmount) * 100,
                drops: null,
                showDrops: false
            });
        }
    }
    
    const actualVg = pureVgNeeded + nicotineVgContent + flavorVgContent + (baseType === 'premixed' ? premixedBaseVolume * (premixedVgPercent / 100) : 0);
    const actualPg = purePgNeeded + nicotinePgContent + flavorPgContent + (baseType === 'premixed' ? premixedBaseVolume * ((100 - premixedVgPercent) / 100) : 0);
    
    // V premixed mode bez ručního posunu slideru: zobrazit skutečný poměr v hlavičce (celé číslo)
    let displayVg = vgPercent;
    let displayPg = pgPercent;
    if (baseType === 'premixed' && !shakevapeUserManuallyChangedRatio && totalAmount > 0) {
        displayVg = Math.round((actualVg / totalAmount) * 100);
        displayPg = 100 - displayVg;
    }

    // Display results
    displayResults(totalAmount, displayVg, displayPg, targetNicotine, ingredients, totalAmount, actualVg, actualPg, {
        formType: 'shakevape',
        flavorType: 'fruit',
        baseType: baseType,
        premixedRatio: baseType === 'premixed' ? premixedRatio : null,
        nicotineType: nicotineType,
        nicotineBaseStrength: baseNicotine,
        nicotineRatio: document.getElementById('svNicotineRatio')?.value || '50/50',
        flavorRatio: document.getElementById('svFlavorRatio')?.value || '0/100',
        flavorVolume: flavorVolume,
        manuallyChangedRatio: shakevapeUserManuallyChangedRatio
    });
    
    showPage('results');
}

// =========================================
// Shortfill Calculator Functions
// =========================================

// Calculate shortfill results in real-time (preview)
function calculateShortfill() {
    const bottleVolume = parseFloat(document.getElementById('sfBottleVolume')?.value) || 60;
    const liquidVolume = parseFloat(document.getElementById('sfLiquidVolume')?.value) || 50;
    const nicStrength = parseFloat(document.getElementById('sfNicStrength')?.value) || 20;
    const nicShotVolume = parseFloat(document.getElementById('sfNicShotVolume')?.value) || 10;
    const shotCount = parseInt(document.getElementById('sfShotCountValue')?.value) || 1;
    
    // Calculate results
    const totalNicVolume = nicShotVolume * shotCount;
    const totalVolume = liquidVolume + totalNicVolume;
    const resultNic = (nicStrength * totalNicVolume) / totalVolume;
    const freeSpace = bottleVolume - totalVolume;
    
    // Update display
    const totalEl = document.getElementById('sfResultTotal');
    const nicEl = document.getElementById('sfResultNic');
    const spaceEl = document.getElementById('sfResultSpace');
    
    if (totalEl) totalEl.textContent = `${totalVolume.toFixed(1)} ml`;
    if (nicEl) nicEl.textContent = `${resultNic.toFixed(2)} mg/ml`;
    if (spaceEl) spaceEl.textContent = `${freeSpace.toFixed(1)} ml`;
    
    // Show/hide warning
    const warningEl = document.getElementById('sfWarning');
    if (warningEl) {
        if (freeSpace < 0) {
            warningEl.classList.remove('hidden');
        } else {
            warningEl.classList.add('hidden');
        }
    }
}

// Adjust shot count
function adjustSfShotCount(change) {
    const valueEl = document.getElementById('sfShotCountValue');
    const displayEl = document.getElementById('sfShotCount');
    
    let current = parseInt(valueEl?.value) || 1;
    current += change;
    
    if (current < 1) current = 1;
    if (current > 10) current = 10;
    
    if (valueEl) valueEl.value = current;
    if (displayEl) displayEl.textContent = current;
    
    calculateShortfill();
}

// Calculate shortfill and show in results (Tvůj recept)
function calculateShortfillMix() {
    const bottleVolume = parseFloat(document.getElementById('sfBottleVolume')?.value) || 60;
    const liquidVolume = parseFloat(document.getElementById('sfLiquidVolume')?.value) || 50;
    const nicStrength = parseFloat(document.getElementById('sfNicStrength')?.value) || 20;
    const nicShotVolume = parseFloat(document.getElementById('sfNicShotVolume')?.value) || 10;
    const shotCount = parseInt(document.getElementById('sfShotCountValue')?.value) || 1;
    
    // Calculate results
    const totalNicVolume = nicShotVolume * shotCount;
    const totalVolume = liquidVolume + totalNicVolume;
    const resultNic = (nicStrength * totalNicVolume) / totalVolume;
    const freeSpace = bottleVolume - totalVolume;
    
    // Build ingredients for results display
    const ingredients = [];
    
    // Shortfill liquid
    ingredients.push({
        ingredientKey: 'shortfill_liquid',
        volume: liquidVolume,
        percent: (liquidVolume / totalVolume) * 100
    });
    
    // Nicotine shots (show total volume)
    ingredients.push({
        ingredientKey: 'nicotine_booster',
        vgRatio: 50,
        params: {
            strength: nicStrength,
            vgpg: '50/50',
            count: shotCount
        },
        volume: totalNicVolume,
        percent: (totalNicVolume / totalVolume) * 100
    });
    
    // Determine VG/PG ratio (typically shortfills are 70/30 VG/PG)
    // Assume shortfill is 70/30, nic shot is 50/50
    const shortfillVgPercent = 70;
    const nicShotVgPercent = 50;
    
    const vgFromShortfill = liquidVolume * (shortfillVgPercent / 100);
    const vgFromNic = totalNicVolume * (nicShotVgPercent / 100);
    const totalVg = vgFromShortfill + vgFromNic;
    const actualVgPercent = Math.round((totalVg / totalVolume) * 100);
    const actualPgPercent = 100 - actualVgPercent;
    
    // Display results
    displayResults(totalVolume, actualVgPercent, actualPgPercent, resultNic, ingredients, totalVolume, totalVg, totalVolume - totalVg, {
        formType: 'shortfill',
        flavorType: 'none',
        bottleVolume: bottleVolume,
        freeSpace: freeSpace,
        shotCount: shotCount
    });
    
    // Show warning if overflow
    if (freeSpace < 0) {
        showNotification(t('shortfill.overflow_warning', 'Pozor: Obsah přesáhne kapacitu lahvičky!'), 'warning');
    }
    
    showPage('results');
}

// Export shortfill functions
window.calculateShortfill = calculateShortfill;
window.adjustSfShotCount = adjustSfShotCount;
window.calculateShortfillMix = calculateShortfillMix;

// =========================================
// Liquid PRO Functions
// =========================================

let proVgPgLimits = { min: 0, max: 100 };

// Automaticky přepočítat VG/PG slider při změně jakéhokoliv parametru (pouze v premixed mode)
function autoRecalculateProVgPgRatio() {
    if (_prefillingSavedRecipe) return;
    const baseType = document.getElementById('proBaseType')?.value || 'separate';
    // Přepočítat POUZE pokud uživatel ručně neměnil poměr
    if (baseType === 'premixed' && !proUserManuallyChangedRatio) {
        const actualVg = calculateActualVgPgRatio('pro');
        const slider = document.getElementById('proVgPgRatio');
        if (slider) {
            slider.value = actualVg;
            updateProRatioDisplay();
        }
    }
    updateProVgPgLimits();
}

function initLiquidProForm() {
    // Neresetovat flag pokud je true (nastaven z prefill uloženého receptu)
    if (!proUserManuallyChangedRatio) {
        proUserManuallyChangedRatio = false;
    }
    
    updateProVgPgLimits();
    updateProNicotineDisplay();
    updateProRatioDisplay();
    updateProNicRatioDisplay();
    updateProFlavorRatioDisplay();
}

function updateProNicotineType() {
    const type = document.getElementById('proNicotineType').value;
    const strengthContainer = document.getElementById('proNicotineStrengthContainer');
    const ratioContainer = document.getElementById('proNicotineRatioContainer');
    const targetSubGroup = document.getElementById('proTargetNicotineSubGroup');
    const saltTypeContainer = document.getElementById('proSaltTypeContainer');
    
    if (type === 'none') {
        strengthContainer.classList.add('hidden');
        ratioContainer.classList.add('hidden');
        if (targetSubGroup) targetSubGroup.classList.add('hidden');
        if (saltTypeContainer) saltTypeContainer.classList.add('hidden');
        document.getElementById('proTargetNicotine').value = 0;
        updateProNicotineDisplay();
    } else {
        strengthContainer.classList.remove('hidden');
        ratioContainer.classList.remove('hidden');
        if (targetSubGroup) targetSubGroup.classList.remove('hidden');
        
        // Show salt type selector only for salt type
        if (saltTypeContainer) {
            if (type === 'salt') {
                saltTypeContainer.classList.remove('hidden');
                // Aplikovat překlady na nově zobrazený kontejner
                if (window.i18n && window.i18n.applyTranslations) {
                    window.i18n.applyTranslations();
                }
            } else {
                saltTypeContainer.classList.add('hidden');
            }
        }
    }
    
    autoRecalculateProVgPgRatio();
}

function adjustProNicRatio(change) {
    const slider = document.getElementById('proNicotineRatioSlider');
    let currentValue = parseInt(slider.value);
    
    let newValue;
    if (change > 0) {
        newValue = Math.ceil((currentValue + 1) / 5) * 5;
    } else {
        newValue = Math.floor((currentValue - 1) / 5) * 5;
    }
    
    newValue = Math.max(0, Math.min(100, newValue));
    slider.value = newValue;
    updateProNicRatioDisplay();
}

function updateProNicRatioDisplay() {
    const slider = document.getElementById('proNicotineRatioSlider');
    const vg = parseInt(slider.value);
    const pg = 100 - vg;
    
    document.getElementById('proNicVgValue').textContent = vg;
    document.getElementById('proNicPgValue').textContent = pg;
    
    const desc = ratioDescriptions.find(d => vg >= d.vgMin && vg <= d.vgMax);
    if (desc) {
        const trackEl = document.getElementById('proNicotineTrackRatio');
        if (trackEl) {
            trackEl.style.background = `linear-gradient(90deg, ${desc.color}, ${adjustColorBrightness(desc.color, 30)})`;
        }
    }
    
    autoRecalculateProVgPgRatio();
}

function adjustProTargetNicotine(change) {
    const slider = document.getElementById('proTargetNicotine');
    let newValue = parseInt(slider.value) + change;
    newValue = Math.max(0, Math.min(parseInt(slider.max), newValue));
    slider.value = newValue;
    updateProNicotineDisplay();
}

function updateProNicotineDisplay() {
    const slider = document.getElementById('proTargetNicotine');
    const value = parseInt(slider.value);
    const displayEl = document.getElementById('proTargetNicotineValue');
    const displayContainer = displayEl.parentElement;
    const trackEl = document.getElementById('proNicotineTrack');

    displayEl.textContent = value;

    const desc = nicotineDescriptions.find(d => value >= d.min && value <= d.max);
    if (desc) {
        // Set color on container so unit has same color as number
        displayEl.style.color = 'inherit';
        displayContainer.style.color = desc.color;
        displayContainer.style.textShadow = `0 0 20px ${desc.color}`;
        trackEl.style.background = `linear-gradient(90deg, #00cc66, ${desc.color})`;
    }

    autoRecalculateProVgPgRatio();
}

// ============================================
// MULTI-FLAVOR PRO SYSTEM (až 4 příchutě)
// ============================================

// Stav pro multi-flavor
let proFlavorCount = 1;
const MAX_PRO_FLAVORS = 4;

// Aktualizovat typ příchutě pro daný index
function updateProFlavorType(flavorIndex = 1) {
    const type = document.getElementById(`proFlavorType${flavorIndex}`).value;
    const strengthContainer = document.getElementById(`proFlavorStrengthContainer${flavorIndex}`);
    
    if (type === 'none') {
        strengthContainer.classList.add('hidden');
        hideCategoryFlavorWarning(`proFlavorStrengthContainer${flavorIndex}`);
    } else {
        strengthContainer.classList.remove('hidden');
        const autoInput = document.getElementById(`proFlavorAutocomplete${flavorIndex}`);
        const hasDbFlavor = autoInput?.dataset?.flavorData && autoInput.dataset.flavorData.length > 2;
        if (!hasDbFlavor) {
            showCategoryFlavorWarning(`proFlavorStrengthContainer${flavorIndex}`, `proFlavorStrength${flavorIndex}`, `proFlavorValue${flavorIndex}`, `proFlavorTrack${flavorIndex}`);
        } else {
            const flavor = flavorDatabase[type];
            document.getElementById(`proFlavorStrength${flavorIndex}`).value = flavor.ideal;
        }
        updateProFlavorDisplay(flavorIndex);
    }
    
    updateProTotalFlavorPercent();
    autoRecalculateProVgPgRatio();
}

// Upravit sílu příchutě
function adjustProFlavor(flavorIndex, change) {
    const slider = document.getElementById(`proFlavorStrength${flavorIndex}`);
    
    // Dynamický krok podle rozsahu slideru
    const minVal = parseFloat(slider.min) || 0;
    const maxVal = parseFloat(slider.max) || 30;
    const range = maxVal - minVal;
    
    // Pokud je rozsah malý (např. 2-3%), použít menší absolutní krok
    let actualChange = change;
    if (range <= 5 && Math.abs(change) === 1) {
        actualChange = change > 0 ? 0.5 : -0.5;
    } else if (range <= 5 && Math.abs(change) === 0.1) {
        actualChange = change > 0 ? 0.1 : -0.1;
    }
    
    let newValue = parseFloat(slider.value) + actualChange;
    newValue = Math.max(minVal, Math.min(maxVal, newValue));
    // Zaokrouhlit na 1 desetinné místo
    newValue = Math.round(newValue * 10) / 10;
    slider.value = newValue;
    updateProFlavorDisplay(flavorIndex);
    updateProTotalFlavorPercent();
}

// Aktualizovat sílu příchutě při změně slideru
function updateProFlavorStrength(flavorIndex) {
    updateProFlavorDisplay(flavorIndex);
    updateProTotalFlavorPercent();
    autoRecalculateProVgPgRatio();
}

// Zobrazení hodnoty příchutě
function updateProFlavorDisplay(flavorIndex = 1) {
    const slider = document.getElementById(`proFlavorStrength${flavorIndex}`);
    const typeSelect = document.getElementById(`proFlavorType${flavorIndex}`);
    const type = typeSelect?.value || 'none';
    
    if (!slider) return;
    
    const value = parseFloat(slider.value);
    
    // Zkontrolovat zda máme konkrétní příchuť z autocomplete
    const autocomplete = document.getElementById(`proFlavorAutocomplete${flavorIndex}`);
    let flavor = flavorDatabase[type];
    let minPercent = 5, maxPercent = 15;
    let hasSpecificFlavor = false;
    let hasVerifiedData = false;
    
    if (autocomplete?.dataset.flavorData) {
        try {
            const flavorData = JSON.parse(autocomplete.dataset.flavorData);
            hasSpecificFlavor = flavorData && flavorData.name;
            // Ověřená data = má min_percent a max_percent nastavené (ne null, ne 0)
            hasVerifiedData = flavorData.min_percent && flavorData.max_percent && flavorData.min_percent > 0;
            if (hasVerifiedData) {
                minPercent = flavorData.min_percent;
                maxPercent = flavorData.max_percent;
            } else if (hasSpecificFlavor) {
                // Konkrétní příchuť bez ověřených dat
                minPercent = 0;
                maxPercent = 100;
            }
        } catch (e) {}
    } else if (flavor) {
        minPercent = flavor.min || 5;
        maxPercent = flavor.max || 15;
    } else if (type === 'none') {
        return; // Žádná příchuť vybraná
    }
    
    const displayEl = document.getElementById(`proFlavorValue${flavorIndex}`);
    const displayContainer = displayEl?.parentElement;
    const trackEl = document.getElementById(`proFlavorTrack${flavorIndex}`);

    if (!displayEl) return;
    
    // Zobrazit s 1 desetinným místem, pokud není celé číslo
    displayEl.textContent = Number.isInteger(value) ? value : value.toFixed(1);

    let color;
    // Kategorie bez konkrétní příchutě → šedá
    const isCategoryOnly = type !== 'none' && !hasSpecificFlavor;
    // Pokud je konkrétní příchuť bez ověřených dat nebo jen kategorie, použít neutrální barvu
    if (isCategoryOnly || (hasSpecificFlavor && !hasVerifiedData)) {
        color = '#888888';
        if (trackEl) trackEl.style.background = `linear-gradient(90deg, #666666, #888888)`;
    } else if (value < minPercent) {
        color = '#ffaa00';
        if (trackEl) trackEl.style.background = `linear-gradient(90deg, #ff6600, #ffaa00)`;
    } else if (value > maxPercent) {
        color = '#ff0044';
        if (trackEl) trackEl.style.background = `linear-gradient(90deg, #00cc66, #ff0044)`;
    } else {
        color = '#00cc66';
        if (trackEl) trackEl.style.background = `linear-gradient(90deg, #00cc66, #00aaff)`;
    }

    displayEl.style.color = 'inherit';
    if (displayContainer) displayContainer.style.color = color;

    autoRecalculateProVgPgRatio();
}

// Upravit VG/PG poměr příchutě
function adjustProFlavorRatio(flavorIndex, change) {
    const slider = document.getElementById(`proFlavorRatioSlider${flavorIndex}`);
    if (!slider) return;
    
    let currentValue = parseInt(slider.value);
    
    let newValue;
    if (change > 0) {
        newValue = Math.ceil((currentValue + 1) / 5) * 5;
    } else {
        newValue = Math.floor((currentValue - 1) / 5) * 5;
    }
    
    newValue = Math.max(0, Math.min(100, newValue));
    slider.value = newValue;
    updateProFlavorRatioDisplay(flavorIndex);
}

// Zobrazit VG/PG poměr příchutě
function updateProFlavorRatioDisplay(flavorIndex = 1) {
    const slider = document.getElementById(`proFlavorRatioSlider${flavorIndex}`);
    if (!slider) return;
    
    const vg = parseInt(slider.value);
    const pg = 100 - vg;
    
    const vgEl = document.getElementById(`proFlavorVgValue${flavorIndex}`);
    const pgEl = document.getElementById(`proFlavorPgValue${flavorIndex}`);
    
    if (vgEl) vgEl.textContent = vg;
    if (pgEl) pgEl.textContent = pg;
    
    const desc = ratioDescriptions.find(d => vg >= d.vgMin && vg <= d.vgMax);
    if (desc) {
        const trackEl = document.getElementById(`proFlavorTrackRatio${flavorIndex}`);
        if (trackEl) {
            trackEl.style.background = `linear-gradient(90deg, ${desc.color}, ${adjustColorBrightness(desc.color, 30)})`;
        }
    }
    
    autoRecalculateProVgPgRatio();
}

// Přidat další příchuť (max 4)
function addProFlavor() {
    if (proFlavorCount >= MAX_PRO_FLAVORS) {
        return;
    }
    
    proFlavorCount++;
    const container = document.getElementById('proAdditionalFlavorsContainer');
    
    const flavorHtml = `
        <div class="form-group pro-flavor-group" id="proFlavorGroup${proFlavorCount}">
            <button type="button" class="remove-flavor-btn" onclick="removeProFlavor(${proFlavorCount})" title="${window.i18n?.t('form.remove_flavor') || 'Odebrat příchuť'}">×</button>
            <label class="form-label">
                <span data-i18n="form.flavor_label">${window.i18n?.t('form.flavor_label') || 'Příchuť'}</span>
                <span class="flavor-number"> ${proFlavorCount}</span>
            </label>
            <div class="flavor-container">
                <!-- Autocomplete pro konkrétní příchuť - PRVNÍ -->
                <div class="flavor-autocomplete-wrapper">
                    <input type="text" id="proFlavorAutocomplete${proFlavorCount}" class="login-input flavor-search-input" data-i18n-placeholder="flavor_autocomplete.search_placeholder" placeholder="${window.i18n?.t('flavor_autocomplete.search_placeholder') || 'Hledat konkrétní příchuť...'}" autocomplete="off">
                </div>
                <!-- Kategorie příchutě - DRUHÁ -->
                <label class="form-label-small flavor-category-label" data-i18n="form.flavor_category_label">
                    ${window.i18n?.t('form.flavor_category_label') || 'Nebo vyberte kategorii (bez konkrétní příchutě):'}
                </label>
                <select id="proFlavorType${proFlavorCount}" class="neon-select pro-flavor-select" data-flavor-index="${proFlavorCount}" onchange="updateProFlavorType(${proFlavorCount})">
                    <option value="none" data-i18n="form.flavor_none">${window.i18n?.t('form.flavor_none') || 'Žádná (bez příchutě)'}</option>
                    <option value="fruit" data-i18n="form.flavor_fruit">${window.i18n?.t('form.flavor_fruit') || 'Ovoce'}</option>
                    <option value="citrus" data-i18n="form.flavor_citrus">${window.i18n?.t('form.flavor_citrus') || 'Citrónové'}</option>
                    <option value="berry" data-i18n="form.flavor_berry">${window.i18n?.t('form.flavor_berry') || 'Bobulové'}</option>
                    <option value="tropical" data-i18n="form.flavor_tropical">${window.i18n?.t('form.flavor_tropical') || 'Tropické'}</option>
                    <option value="tobacco" data-i18n="form.flavor_tobacco">${window.i18n?.t('form.flavor_tobacco') || 'Tabákové'}</option>
                    <option value="menthol" data-i18n="form.flavor_menthol">${window.i18n?.t('form.flavor_menthol') || 'Mentol'}</option>
                    <option value="candy" data-i18n="form.flavor_candy">${window.i18n?.t('form.flavor_candy') || 'Sladkosti'}</option>
                    <option value="dessert" data-i18n="form.flavor_dessert">${window.i18n?.t('form.flavor_dessert') || 'Dezerty'}</option>
                    <option value="bakery" data-i18n="form.flavor_bakery">${window.i18n?.t('form.flavor_bakery') || 'Zákusky'}</option>
                    <option value="biscuit" data-i18n="form.flavor_biscuit">${window.i18n?.t('form.flavor_biscuit') || 'Piškotové'}</option>
                    <option value="drink" data-i18n="form.flavor_drink">${window.i18n?.t('form.flavor_drink') || 'Nápojové'}</option>
                    <option value="tobaccosweet" data-i18n="form.flavor_tobaccosweet">${window.i18n?.t('form.flavor_tobaccosweet') || 'Tabák + sladké'}</option>
                    <option value="nuts" data-i18n="form.flavor_nuts">${window.i18n?.t('form.flavor_nuts') || 'Oříškové'}</option>
                    <option value="spice" data-i18n="form.flavor_spice">${window.i18n?.t('form.flavor_spice') || 'Kořeněné'}</option>
                </select>
                <div id="proFlavorStrengthContainer${proFlavorCount}" class="hidden">
                    <div class="slider-container small">
                        <button class="slider-btn small double" onclick="adjustProFlavor(${proFlavorCount}, -1)" title="-1%">◀◀</button>
                        <button class="slider-btn small" onclick="adjustProFlavor(${proFlavorCount}, -0.1)" title="-0.1%">◀</button>
                        <div class="slider-wrapper">
                            <input type="range" id="proFlavorStrength${proFlavorCount}" min="0" max="35" value="10" step="0.1" class="flavor-slider pro-flavor-slider" data-flavor-index="${proFlavorCount}" oninput="updateProFlavorStrength(${proFlavorCount})">
                            <div class="slider-track flavor-track" id="proFlavorTrack${proFlavorCount}"></div>
                        </div>
                        <button class="slider-btn small" onclick="adjustProFlavor(${proFlavorCount}, 0.1)" title="+0.1%">▶</button>
                        <button class="slider-btn small double" onclick="adjustProFlavor(${proFlavorCount}, 1)" title="+1%">▶▶</button>
                    </div>
                    <div class="flavor-display">
                        <span id="proFlavorValue${proFlavorCount}">10</span>%
                    </div>
                    <div class="form-group-sub">
                        <label class="form-label-small" data-i18n="form.flavor_ratio_label">${window.i18n?.t('form.flavor_ratio_label') || 'Poměr VG/PG v koncentrátu příchutě'}</label>
                        <div class="ratio-container compact">
                            <div class="ratio-labels">
                                <span class="ratio-label left" data-i18n="form.vg_label">${window.i18n?.t('form.vg_label') || 'Dým (VG)'}</span>
                                <span class="ratio-label right" data-i18n="form.pg_label">${window.i18n?.t('form.pg_label') || 'Chuť (PG)'}</span>
                            </div>
                            <div class="slider-container">
                                <button class="slider-btn small" onclick="adjustProFlavorRatio(${proFlavorCount}, -5)">◀</button>
                                <div class="slider-wrapper">
                                    <input type="range" id="proFlavorRatioSlider${proFlavorCount}" min="0" max="100" value="0" class="ratio-slider pro-flavor-ratio" data-flavor-index="${proFlavorCount}" oninput="updateProFlavorRatioDisplay(${proFlavorCount})">
                                    <div class="slider-track" id="proFlavorTrackRatio${proFlavorCount}"></div>
                                </div>
                                <button class="slider-btn small" onclick="adjustProFlavorRatio(${proFlavorCount}, 5)">▶</button>
                            </div>
                            <div class="ratio-display small">
                                <span id="proFlavorVgValue${proFlavorCount}">0</span>:<span id="proFlavorPgValue${proFlavorCount}">100</span>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Volitelné složení příchutě (PRO) -->
                    <div class="form-group-sub flavor-composition-section">
                        <button type="button" class="prep-item-btn composition-toggle-btn" onclick="toggleFlavorComposition(${proFlavorCount})">
                            <span data-i18n="form.flavor_composition">${window.i18n?.t('form.flavor_composition') || 'Složení příchutě'}</span>
                            <span class="prep-arrow">▼</span>
                        </button>
                        <div class="prep-detail flavor-composition-detail hidden" id="flavorComposition${proFlavorCount}">
                            <p class="composition-hint" data-i18n="form.flavor_composition_hint">${window.i18n?.t('form.flavor_composition_hint') || 'Údaje najdete na webu výrobce'}</p>
                            <div class="composition-grid">
                                <div class="composition-item">
                                    <label>PG</label>
                                    <input type="number" id="proFlavorCompPg${proFlavorCount}" min="0" max="100" value="60" class="neon-input tiny" oninput="updateFlavorCompositionOther(${proFlavorCount})">
                                    <span>%</span>
                                </div>
                                <div class="composition-item">
                                    <label>VG</label>
                                    <input type="number" id="proFlavorCompVg${proFlavorCount}" min="0" max="100" value="5" class="neon-input tiny" oninput="updateFlavorCompositionOther(${proFlavorCount})">
                                    <span>%</span>
                                </div>
                                <div class="composition-item">
                                    <label data-i18n="form.alcohol">${window.i18n?.t('form.alcohol') || 'Alkohol'}</label>
                                    <input type="number" id="proFlavorCompAlcohol${proFlavorCount}" min="0" max="100" value="25" class="neon-input tiny" oninput="updateFlavorCompositionOther(${proFlavorCount})">
                                    <span>%</span>
                                </div>
                                <div class="composition-item">
                                    <label data-i18n="form.water">${window.i18n?.t('form.water') || 'Voda'}</label>
                                    <input type="number" id="proFlavorCompWater${proFlavorCount}" min="0" max="100" value="5" class="neon-input tiny" oninput="updateFlavorCompositionOther(${proFlavorCount})">
                                    <span>%</span>
                                </div>
                                <div class="composition-item">
                                    <label data-i18n="form.other">${window.i18n?.t('form.other') || 'Ostatní'}</label>
                                    <span id="proFlavorCompOther${proFlavorCount}" class="composition-calculated">5</span>
                                    <span>%</span>
                                </div>
                            </div>
                            <button type="button" class="neon-button small secondary" onclick="resetFlavorComposition(${proFlavorCount})" data-i18n="form.use_average">${window.i18n?.t('form.use_average') || 'Použít průměr'}</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    container.insertAdjacentHTML('beforeend', flavorHtml);
    
    // Inicializovat barvu posuvníku VG/PG pro novou příchuť
    updateProFlavorRatioDisplay(proFlavorCount);
    
    // Skrýt tlačítko "Přidat" pokud je max příchutí
    if (proFlavorCount >= MAX_PRO_FLAVORS) {
        document.getElementById('proAddFlavorGroup').classList.add('hidden');
    }
    
    // Inicializovat autocomplete pro novou příchuť
    const newAutocompleteId = `proFlavorAutocomplete${proFlavorCount}`;
    if (document.getElementById(newAutocompleteId)) {
        initFlavorAutocomplete(newAutocompleteId, 'liquid_pro', (flavorData) => {
            console.log('Selected PRO flavor:', flavorData);
        });
    }
    
    // Aktualizovat hint
    updateProFlavorCountHint();
}

// Odebrat příchuť
function removeProFlavor(flavorIndex) {
    const flavorGroup = document.getElementById(`proFlavorGroup${flavorIndex}`);
    if (flavorGroup) {
        flavorGroup.remove();
    }
    
    proFlavorCount--;
    
    // Renumber remaining flavors
    renumberProFlavors();
    
    // Zobrazit tlačítko "Přidat" pokud je méně než max
    if (proFlavorCount < MAX_PRO_FLAVORS) {
        document.getElementById('proAddFlavorGroup').classList.remove('hidden');
    }
    
    updateProFlavorCountHint();
    updateProTotalFlavorPercent();
    updateProVgPgLimits();
}

// Přečíslovat příchutě po odebrání
function renumberProFlavors() {
    const container = document.getElementById('proAdditionalFlavorsContainer');
    const groups = container.querySelectorAll('.pro-flavor-group');
    
    groups.forEach((group, index) => {
        const newIndex = index + 2; // Začínáme od 2 (1 je vždy první příchuť)
        const oldId = group.id;
        const oldIndex = parseInt(oldId.replace('proFlavorGroup', ''));
        
        if (oldIndex !== newIndex) {
            // Aktualizovat ID skupiny
            group.id = `proFlavorGroup${newIndex}`;
            
            // Aktualizovat číslo příchutě v labelu
            const flavorNumber = group.querySelector('.flavor-number');
            if (flavorNumber) flavorNumber.textContent = ` ${newIndex}`;
            
            // Aktualizovat všechny ID a reference uvnitř
            updateFlavorElementIds(group, oldIndex, newIndex);
        }
    });
}

// Pomocná funkce pro aktualizaci ID elementů
function updateFlavorElementIds(container, oldIndex, newIndex) {
    const elementsToUpdate = [
        'proFlavorType', 'proFlavorStrengthContainer', 'proFlavorStrength',
        'proFlavorTrack', 'proFlavorValue', 'proFlavorRatioSlider',
        'proFlavorTrackRatio', 'proFlavorVgValue', 'proFlavorPgValue',
        'flavorComposition', 'proFlavorCompPg', 'proFlavorCompVg',
        'proFlavorCompAlcohol', 'proFlavorCompWater', 'proFlavorCompOther'
    ];
    
    elementsToUpdate.forEach(prefix => {
        const el = container.querySelector(`#${prefix}${oldIndex}`);
        if (el) {
            el.id = `${prefix}${newIndex}`;
            
            // Aktualizovat data-flavor-index
            if (el.dataset.flavorIndex) {
                el.dataset.flavorIndex = newIndex;
            }
            
            // Aktualizovat onchange/oninput
            if (el.hasAttribute('onchange')) {
                el.setAttribute('onchange', el.getAttribute('onchange').replace(oldIndex, newIndex));
            }
            if (el.hasAttribute('oninput')) {
                el.setAttribute('oninput', el.getAttribute('oninput').replace(oldIndex, newIndex));
            }
        }
    });
    
    // Aktualizovat onclick na tlačítkách
    container.querySelectorAll('button').forEach(btn => {
        const onclick = btn.getAttribute('onclick');
        if (onclick && onclick.includes(oldIndex.toString())) {
            btn.setAttribute('onclick', onclick.replace(new RegExp(oldIndex, 'g'), newIndex));
        }
    });
}

// Aktualizovat hint o počtu příchutí
function updateProFlavorCountHint() {
    const hint = document.getElementById('proFlavorCountHint');
    if (hint) {
        const remaining = MAX_PRO_FLAVORS - proFlavorCount;
        if (remaining > 0) {
            hint.textContent = `(${window.i18n?.t('form.flavor_remaining', { count: remaining }) || `zbývá ${remaining}`})`;
        } else {
            hint.textContent = `(${window.i18n?.t('form.flavor_max_reached') || 'maximum dosaženo'})`;
        }
    }
}

// ============================================
// FLAVOR COMPOSITION FUNCTIONS (PRO)
// ============================================

// Toggle flavor composition panel
function toggleFlavorComposition(flavorIndex) {
    const panel = document.getElementById(`flavorComposition${flavorIndex}`);
    const btn = document.querySelector(`button[onclick="toggleFlavorComposition(${flavorIndex})"]`);
    const arrow = btn?.querySelector('.prep-arrow');
    
    if (panel) {
        // Remove hidden class if present (initial state)
        panel.classList.remove('hidden');
        // Toggle open class for animation
        panel.classList.toggle('open');
        
        if (arrow) {
            arrow.textContent = panel.classList.contains('open') ? '▲' : '▼';
        }
        if (btn) {
            btn.classList.toggle('active', panel.classList.contains('open'));
        }
        
        // Pre-fill with average values for selected flavor type if opening
        if (panel.classList.contains('open')) {
            const flavorType = document.getElementById(`proFlavorType${flavorIndex}`)?.value || 'fruit';
            prefillFlavorComposition(flavorIndex, flavorType);
        }
    }
}

// Pre-fill flavor composition with average values from database
function prefillFlavorComposition(flavorIndex, flavorType) {
    const flavorData = flavorDatabase[flavorType];
    if (!flavorData || !flavorData.composition) return;
    
    const comp = flavorData.composition;
    const pgEl = document.getElementById(`proFlavorCompPg${flavorIndex}`);
    const vgEl = document.getElementById(`proFlavorCompVg${flavorIndex}`);
    const alcoholEl = document.getElementById(`proFlavorCompAlcohol${flavorIndex}`);
    const waterEl = document.getElementById(`proFlavorCompWater${flavorIndex}`);
    const otherEl = document.getElementById(`proFlavorCompOther${flavorIndex}`);
    
    if (pgEl) pgEl.value = comp.pg;
    if (vgEl) vgEl.value = comp.vg;
    if (alcoholEl) alcoholEl.value = comp.alcohol;
    if (waterEl) waterEl.value = comp.water;
    if (otherEl) otherEl.textContent = comp.other;
}

// Update "Other" value in composition (auto-calculate to 100%)
function updateFlavorCompositionOther(flavorIndex) {
    const pgEl = document.getElementById(`proFlavorCompPg${flavorIndex}`);
    const vgEl = document.getElementById(`proFlavorCompVg${flavorIndex}`);
    const alcoholEl = document.getElementById(`proFlavorCompAlcohol${flavorIndex}`);
    const waterEl = document.getElementById(`proFlavorCompWater${flavorIndex}`);
    const otherEl = document.getElementById(`proFlavorCompOther${flavorIndex}`);
    
    let pg = parseFloat(pgEl?.value) || 0;
    let vg = parseFloat(vgEl?.value) || 0;
    let alcohol = parseFloat(alcoholEl?.value) || 0;
    let water = parseFloat(waterEl?.value) || 0;
    
    // Validace: součet nesmí překročit 100%
    const total = pg + vg + alcohol + water;
    
    if (total > 100) {
        // Snížit právě editovanou hodnotu tak, aby součet byl max 100
        // Zjistit, která hodnota byla naposledy změněna (má focus)
        const activeElement = document.activeElement;
        
        if (activeElement === pgEl && pgEl) {
            pg = Math.max(0, 100 - vg - alcohol - water);
            pgEl.value = pg;
        } else if (activeElement === vgEl && vgEl) {
            vg = Math.max(0, 100 - pg - alcohol - water);
            vgEl.value = vg;
        } else if (activeElement === alcoholEl && alcoholEl) {
            alcohol = Math.max(0, 100 - pg - vg - water);
            alcoholEl.value = alcohol;
        } else if (activeElement === waterEl && waterEl) {
            water = Math.max(0, 100 - pg - vg - alcohol);
            waterEl.value = water;
        } else {
            // Pokud nevíme, která byla změněna, ořežeme postupně od konce
            const excess = total - 100;
            if (water >= excess) {
                water -= excess;
                if (waterEl) waterEl.value = water;
            } else if (alcohol >= excess - water) {
                alcohol -= (excess - water);
                water = 0;
                if (alcoholEl) alcoholEl.value = alcohol;
                if (waterEl) waterEl.value = 0;
            }
        }
    }
    
    const other = Math.max(0, 100 - pg - vg - alcohol - water);
    if (otherEl) otherEl.textContent = other.toFixed(0);
}

// Reset flavor composition to average
function resetFlavorComposition(flavorIndex) {
    const flavorType = document.getElementById(`proFlavorType${flavorIndex}`)?.value || 'fruit';
    prefillFlavorComposition(flavorIndex, flavorType);
}

// Get custom composition for a flavor (if set)
function getFlavorCustomComposition(flavorIndex) {
    const panel = document.getElementById(`flavorComposition${flavorIndex}`);
    if (!panel || !panel.classList.contains('open')) {
        return null; // Not customized — panel musí být otevřený (open)
    }
    
    const pg = parseFloat(document.getElementById(`proFlavorCompPg${flavorIndex}`)?.value) || 0;
    const vg = parseFloat(document.getElementById(`proFlavorCompVg${flavorIndex}`)?.value) || 0;
    const alcohol = parseFloat(document.getElementById(`proFlavorCompAlcohol${flavorIndex}`)?.value) || 0;
    const water = parseFloat(document.getElementById(`proFlavorCompWater${flavorIndex}`)?.value) || 0;
    const other = Math.max(0, 100 - pg - vg - alcohol - water);
    
    return { pg, vg, alcohol, water, other };
}

// Export flavor composition functions
window.toggleFlavorComposition = toggleFlavorComposition;
window.prefillFlavorComposition = prefillFlavorComposition;
window.updateFlavorCompositionOther = updateFlavorCompositionOther;
window.resetFlavorComposition = resetFlavorComposition;
window.getFlavorCustomComposition = getFlavorCustomComposition;

// ============================================
// ADDITIVES FUNCTIONS (PRO only)
// ============================================

let proAdditiveCount = 0;
const MAX_PRO_ADDITIVES = 4;

// Add a new additive row
function addProAdditive() {
    if (proAdditiveCount >= MAX_PRO_ADDITIVES) {
        return;
    }
    
    proAdditiveCount++;
    const container = document.getElementById('proAdditivesContainer');
    
    const additiveHtml = `
        <div class="additive-row form-group-sub" id="proAdditiveRow${proAdditiveCount}">
            <div class="additive-header">
                <select id="proAdditiveType${proAdditiveCount}" class="neon-select" onchange="updateProAdditiveType(${proAdditiveCount})">
                    <option value="" data-i18n="form.additive_select">${window.i18n?.t('form.additive_select') || 'Vyberte typ...'}</option>
                    <option value="coolant" data-i18n="additive.coolant">${window.i18n?.t('additive.coolant') || 'Chladivo (WS-23, Koolada)'}</option>
                    <option value="sweetener" data-i18n="additive.sweetener">${window.i18n?.t('additive.sweetener') || 'Sladidlo (Sukralóza)'}</option>
                    <option value="enhancer" data-i18n="additive.enhancer">${window.i18n?.t('additive.enhancer') || 'Zesilovač (Smooth, TH)'}</option>
                    <option value="terpene" data-i18n="additive.terpene">${window.i18n?.t('additive.terpene') || 'Terpeny'}</option>
                </select>
                <button type="button" class="remove-btn" onclick="removeProAdditive(${proAdditiveCount})">×</button>
            </div>
            
            <div id="proAdditiveDetails${proAdditiveCount}" class="additive-details hidden">
                <div class="additive-description" id="proAdditiveDesc${proAdditiveCount}"></div>
                
                <div class="additive-percent-row">
                    <label data-i18n="form.percent">${window.i18n?.t('form.percent') || 'Procento'}:</label>
                    <div class="input-wrapper small">
                        <input type="number" id="proAdditivePercent${proAdditiveCount}" min="0.1" max="10" step="0.1" value="1" class="neon-input small" oninput="updateProAdditiveCalculation()">
                        <span class="input-unit">%</span>
                    </div>
                </div>
                
                <button type="button" class="prep-item-btn composition-toggle-btn small" onclick="toggleAdditiveComposition(${proAdditiveCount})">
                    <span data-i18n="form.custom_composition">${window.i18n?.t('form.custom_composition') || 'Vlastní složení'}</span>
                    <span class="prep-arrow">▼</span>
                </button>
                <div class="prep-detail additive-composition-detail hidden" id="additiveComposition${proAdditiveCount}">
                    <div class="composition-grid">
                        <div class="composition-item">
                            <label>PG</label>
                            <input type="number" id="proAdditiveCompPg${proAdditiveCount}" min="0" max="100" value="100" class="neon-input tiny" oninput="updateAdditiveCompositionOther(${proAdditiveCount})">
                            <span>%</span>
                        </div>
                        <div class="composition-item">
                            <label>VG</label>
                            <input type="number" id="proAdditiveCompVg${proAdditiveCount}" min="0" max="100" value="0" class="neon-input tiny" oninput="updateAdditiveCompositionOther(${proAdditiveCount})">
                            <span>%</span>
                        </div>
                        <div class="composition-item">
                            <label data-i18n="form.alcohol">${window.i18n?.t('form.alcohol') || 'Alkohol'}</label>
                            <input type="number" id="proAdditiveCompAlcohol${proAdditiveCount}" min="0" max="100" value="0" class="neon-input tiny" oninput="updateAdditiveCompositionOther(${proAdditiveCount})">
                            <span>%</span>
                        </div>
                        <div class="composition-item">
                            <label data-i18n="form.other">${window.i18n?.t('form.other') || 'Ostatní'}</label>
                            <span id="proAdditiveCompOther${proAdditiveCount}" class="composition-calculated">0</span>
                            <span>%</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    container.insertAdjacentHTML('beforeend', additiveHtml);
    
    // Hide add button if max reached
    if (proAdditiveCount >= MAX_PRO_ADDITIVES) {
        document.getElementById('proAddAdditiveBtn').classList.add('hidden');
    }
}

// Remove an additive
function removeProAdditive(additiveIndex) {
    const row = document.getElementById(`proAdditiveRow${additiveIndex}`);
    if (row) {
        row.remove();
    }
    
    proAdditiveCount--;
    
    // Show add button if below max
    if (proAdditiveCount < MAX_PRO_ADDITIVES) {
        document.getElementById('proAddAdditiveBtn').classList.remove('hidden');
    }
    
    autoRecalculateProVgPgRatio();
}

// Update additive type selection
function updateProAdditiveType(additiveIndex) {
    const typeSelect = document.getElementById(`proAdditiveType${additiveIndex}`);
    const detailsContainer = document.getElementById(`proAdditiveDetails${additiveIndex}`);
    const descEl = document.getElementById(`proAdditiveDesc${additiveIndex}`);
    const percentEl = document.getElementById(`proAdditivePercent${additiveIndex}`);
    
    const type = typeSelect?.value;
    
    if (type && additiveDatabase[type]) {
        const additive = additiveDatabase[type];
        
        // Show details
        if (detailsContainer) detailsContainer.classList.remove('hidden');
        
        // Set description
        if (descEl) {
            descEl.textContent = t(additive.descriptionKey, '');
        }
        
        // Set default percent
        if (percentEl) {
            percentEl.value = additive.defaultPercent;
            percentEl.min = additive.minPercent;
            percentEl.max = additive.maxPercent;
        }
        
        // Pre-fill composition
        prefillAdditiveComposition(additiveIndex, type);
        
    } else {
        if (detailsContainer) detailsContainer.classList.add('hidden');
    }
    
    autoRecalculateProVgPgRatio();
}

// Toggle additive composition panel
function toggleAdditiveComposition(additiveIndex) {
    const panel = document.getElementById(`additiveComposition${additiveIndex}`);
    const btn = document.querySelector(`button[onclick="toggleAdditiveComposition(${additiveIndex})"]`);
    const arrow = btn?.querySelector('.prep-arrow');
    
    if (panel) {
        // Remove hidden class if present (initial state)
        panel.classList.remove('hidden');
        // Toggle open class for animation
        panel.classList.toggle('open');
        
        if (arrow) {
            arrow.textContent = panel.classList.contains('open') ? '▲' : '▼';
        }
        if (btn) {
            btn.classList.toggle('active', panel.classList.contains('open'));
        }
    }
}

// Pre-fill additive composition with default values
function prefillAdditiveComposition(additiveIndex, type) {
    const additive = additiveDatabase[type];
    if (!additive || !additive.composition) return;
    
    const comp = additive.composition;
    const pgEl = document.getElementById(`proAdditiveCompPg${additiveIndex}`);
    const vgEl = document.getElementById(`proAdditiveCompVg${additiveIndex}`);
    const alcoholEl = document.getElementById(`proAdditiveCompAlcohol${additiveIndex}`);
    const otherEl = document.getElementById(`proAdditiveCompOther${additiveIndex}`);
    
    if (pgEl) pgEl.value = comp.pg;
    if (vgEl) vgEl.value = comp.vg;
    if (alcoholEl) alcoholEl.value = comp.alcohol;
    if (otherEl) otherEl.textContent = comp.other;
}

// Update "Other" value in additive composition (auto-adjust to 100%)
function updateAdditiveCompositionOther(additiveIndex) {
    const pgEl = document.getElementById(`proAdditiveCompPg${additiveIndex}`);
    const vgEl = document.getElementById(`proAdditiveCompVg${additiveIndex}`);
    const alcoholEl = document.getElementById(`proAdditiveCompAlcohol${additiveIndex}`);
    const otherEl = document.getElementById(`proAdditiveCompOther${additiveIndex}`);
    
    let pg = parseFloat(pgEl?.value) || 0;
    let vg = parseFloat(vgEl?.value) || 0;
    let alcohol = parseFloat(alcoholEl?.value) || 0;
    
    // Zajistit aby hodnoty nepřekročily 100%
    const total = pg + vg + alcohol;
    if (total > 100) {
        // Proporcionálně snížit hodnoty
        const ratio = 100 / total;
        pg = Math.round(pg * ratio);
        vg = Math.round(vg * ratio);
        alcohol = Math.round(alcohol * ratio);
        
        // Aktualizovat vstupní pole
        if (pgEl) pgEl.value = pg;
        if (vgEl) vgEl.value = vg;
        if (alcoholEl) alcoholEl.value = alcohol;
    }
    
    const other = Math.max(0, 100 - pg - vg - alcohol);
    if (otherEl) otherEl.textContent = other.toFixed(0);
    
    // Přepočítat VG/PG poměr
    autoRecalculateProVgPgRatio();
}

// Update calculation when additive percent changes
function updateProAdditiveCalculation() {
    autoRecalculateProVgPgRatio();
}

// Get all additives data
function getProAdditivesData() {
    const additives = [];
    
    for (let i = 1; i <= MAX_PRO_ADDITIVES; i++) {
        const typeEl = document.getElementById(`proAdditiveType${i}`);
        const percentEl = document.getElementById(`proAdditivePercent${i}`);
        
        if (typeEl && typeEl.value && percentEl) {
            const type = typeEl.value;
            const percent = parseFloat(percentEl.value) || 0;
            
            // Check for custom composition
            const panel = document.getElementById(`additiveComposition${i}`);
            let customComposition = null;
            
            if (panel && panel.classList.contains('open')) {
                const pg = parseFloat(document.getElementById(`proAdditiveCompPg${i}`)?.value) || 0;
                const vg = parseFloat(document.getElementById(`proAdditiveCompVg${i}`)?.value) || 0;
                const alcohol = parseFloat(document.getElementById(`proAdditiveCompAlcohol${i}`)?.value) || 0;
                const other = Math.max(0, 100 - pg - vg - alcohol);
                customComposition = { pg, vg, alcohol, water: 0, other };
            }
            
            additives.push({
                index: i,
                type: type,
                percent: percent,
                customComposition: customComposition
            });
        }
    }
    
    return additives;
}

// Export additive functions
window.addProAdditive = addProAdditive;
window.removeProAdditive = removeProAdditive;
window.updateProAdditiveType = updateProAdditiveType;
window.toggleAdditiveComposition = toggleAdditiveComposition;
window.updateAdditiveCompositionOther = updateAdditiveCompositionOther;
window.updateProAdditiveCalculation = updateProAdditiveCalculation;
window.getProAdditivesData = getProAdditivesData;

// Vypočítat celkové procento příchutí
function updateProTotalFlavorPercent() {
    let total = 0;
    
    for (let i = 1; i <= MAX_PRO_FLAVORS; i++) {
        const typeEl = document.getElementById(`proFlavorType${i}`);
        const strengthEl = document.getElementById(`proFlavorStrength${i}`);
        
        if (typeEl && strengthEl && typeEl.value !== 'none') {
            total += parseFloat(strengthEl.value) || 0;
        }
    }
    
    // OPRAVA: Zaokrouhlit na 2 desetinná místa
    total = Math.round(total * 100) / 100;
    
    const totalEl = document.getElementById('proTotalFlavorPercent');
    const warningEl = document.getElementById('proFlavorTotalWarning');
    
    if (totalEl) {
        totalEl.textContent = total;
    }
    
    if (warningEl) {
        if (total > 30) {
            warningEl.classList.remove('hidden');
            warningEl.classList.add('error');
            warningEl.textContent = window.i18n?.t('form.flavor_total_error') || '(příliš mnoho příchutí!)';
        } else if (total > 25) {
            warningEl.classList.remove('hidden', 'error');
            warningEl.textContent = window.i18n?.t('form.flavor_total_warning') || '(doporučeno max 25%)';
        } else {
            warningEl.classList.add('hidden');
        }
    }
    
    return total;
}

// Získat všechny příchutě pro výpočet
function getProFlavorsData() {
    const flavors = [];
    
    for (let i = 1; i <= MAX_PRO_FLAVORS; i++) {
        const typeEl = document.getElementById(`proFlavorType${i}`);
        const strengthEl = document.getElementById(`proFlavorStrength${i}`);
        const ratioEl = document.getElementById(`proFlavorRatioSlider${i}`);
        const autocomplete = document.getElementById(`proFlavorAutocomplete${i}`);
        
        // Zkontrolovat zda je vybraná konkrétní příchuť z autocomplete
        let specificFlavorName = null;
        let specificFlavorManufacturer = null;
        let specificFlavorId = null;
        let specificFlavorSource = 'generic';
        let specificFlavorSteepDays = null;
        
        // Získat favorite_product_id přímo z datasetu (důležité pro správné párování)
        let specificFavoriteProductId = autocomplete?.dataset.favoriteProductId || null;
        
        if (autocomplete && autocomplete.dataset.flavorData) {
            try {
                const flavorData = JSON.parse(autocomplete.dataset.flavorData);
                if (flavorData && flavorData.name) {
                    specificFlavorName = flavorData.name;
                    specificFlavorManufacturer = flavorData.manufacturer || flavorData.manufacturer_code;
                    // Pro oblíbené příchutě použít favorite_product_id, jinak flavor_id
                    const isFavorite = flavorData.source === 'favorites' || flavorData.source === 'favorite';
                    if (isFavorite) {
                        // Oblíbená příchuť - přednostně favorite_product_id
                        specificFavoriteProductId = flavorData.favorite_product_id || flavorData.id || specificFavoriteProductId;
                        specificFlavorId = flavorData.flavor_id || null;  // flavor_id může být null pro vlastní příchutě
                    } else {
                        // Příchuť z veřejné databáze
                        specificFlavorId = flavorData.id || autocomplete.dataset.flavorId || null;
                    }
                    specificFlavorSource = autocomplete.dataset.flavorSource || (isFavorite ? 'favorite' : 'database');
                    // Steep days z konkrétní příchutě (DB nebo oblíbené)
                    if (flavorData.steep_days !== undefined && flavorData.steep_days !== null) {
                        specificFlavorSteepDays = flavorData.steep_days;
                    } else if (flavorData.flavor_steep_days !== undefined && flavorData.flavor_steep_days !== null) {
                        specificFlavorSteepDays = flavorData.flavor_steep_days;
                    }
                }
            } catch (e) {
                console.log('Error parsing PRO flavor data:', e);
            }
        }
        
        // Příchuť je aktivní buď když je vybraná kategorie NEBO konkrétní příchuť
        const hasCategory = typeEl && typeEl.value !== 'none';
        const hasSpecific = specificFlavorName !== null;
        
        if (hasCategory || hasSpecific) {
            const vgRatioValue = parseInt(ratioEl?.value) || 0;
            
            // Načíst detailní kompozici příchutě pokud je panel otevřený
            const explicitComposition = typeof getFlavorCustomComposition === 'function' 
                ? getFlavorCustomComposition(i) 
                : null;
            
            const flavorEntry = {
                index: i,
                type: typeEl?.value || 'fruit',
                percent: parseFloat(strengthEl?.value) || 10,
                vgRatio: vgRatioValue,
                // Pro výpočet: vždy kompletní kompozice
                customComposition: explicitComposition || { 
                    pg: 100 - vgRatioValue, 
                    vg: vgRatioValue, 
                    alcohol: 0, 
                    water: 0, 
                    other: 0 
                },
                // Pro uložení: jen pokud uživatel explicitně otevřel panel složení
                _explicitComposition: explicitComposition
            };
            
            // Přidat info o konkrétní příchuti
            if (specificFlavorName) {
                flavorEntry.flavorName = specificFlavorName;
                flavorEntry.flavorManufacturer = specificFlavorManufacturer;
                flavorEntry.flavorId = specificFlavorId;
                flavorEntry.flavorSource = specificFlavorSource;
                // Přidat favorite_product_id pro správné párování při ukládání
                if (specificFavoriteProductId) {
                    flavorEntry.favoriteProductId = specificFavoriteProductId;
                }
                // Steep days z konkrétní příchutě (DB)
                if (specificFlavorSteepDays !== null) {
                    flavorEntry.steepDays = specificFlavorSteepDays;
                }
            }
            
            flavors.push(flavorEntry);
        }
    }
    
    return flavors;
}

function adjustProRatio(change) {
    const slider = document.getElementById('proVgPgRatio');
    let currentValue = parseInt(slider.value);
    
    let newValue;
    if (change > 0) {
        newValue = Math.ceil((currentValue + 1) / 5) * 5;
    } else {
        newValue = Math.floor((currentValue - 1) / 5) * 5;
    }
    
    newValue = Math.max(proVgPgLimits.min, Math.min(proVgPgLimits.max, newValue));
    slider.value = newValue;
    proUserManuallyChangedRatio = true;
    updateProRatioDisplay();
}

function updateProRatioDisplay() {
    const slider = document.getElementById('proVgPgRatio');
    let vg = parseInt(slider.value);
    
    // Clamp to limits
    if (vg < proVgPgLimits.min) {
        vg = proVgPgLimits.min;
        slider.value = vg;
    } else if (vg > proVgPgLimits.max) {
        vg = proVgPgLimits.max;
        slider.value = vg;
    }
    
    const pg = 100 - vg;

    document.getElementById('proVgValue').textContent = vg;
    document.getElementById('proPgValue').textContent = pg;

    const desc = ratioDescriptions.find(d => vg >= d.vgMin && vg <= d.vgMax);
    if (desc) {
        document.getElementById('proSliderTrack').style.background =
            `linear-gradient(90deg, ${desc.color}, ${adjustColorBrightness(desc.color, 30)})`;
    }
}

function updateProVgPgLimits() {
    const slider = document.getElementById('proVgPgRatio');
    const warningEl = document.getElementById('proRatioLimitWarning');
    const disabledLeft = document.getElementById('proSliderDisabledLeft');
    const disabledRight = document.getElementById('proSliderDisabledRight');
    
    const totalAmount = parseFloat(document.getElementById('proTotalAmount').value) || 100;
    const nicotineType = document.getElementById('proNicotineType').value;
    const targetNicotine = parseFloat(document.getElementById('proTargetNicotine').value) || 0;
    const baseNicotine = parseFloat(document.getElementById('proNicotineBaseStrength').value) || 0;
    
    // Získat data všech příchutí (multi-flavor support)
    const flavorsData = typeof getProFlavorsData === 'function' ? getProFlavorsData() : [];
    const totalFlavorPercent = flavorsData.reduce((sum, f) => sum + f.percent, 0);
    
    let nicotineVolume = 0;
    if (nicotineType !== 'none' && targetNicotine > 0 && baseNicotine > 0) {
        nicotineVolume = (targetNicotine * totalAmount) / baseNicotine;
    }
    
    // Get VG/PG from nicotine slider
    const nicSliderValue = document.getElementById('proNicotineRatioSlider').value;
    const nicVgPercent = nicSliderValue !== '' ? Number(nicSliderValue) : 50;
    const nicPgPercent = 100 - nicVgPercent;
    
    const nicotineVgVolume = nicotineVolume * (nicVgPercent / 100);
    const nicotinePgVolume = nicotineVolume * (nicPgPercent / 100);
    
    // Spočítat VG/PG ze všech příchutí - použít detailní kompozici
    let totalFlavorVgVolume = 0;
    let totalFlavorPgVolume = 0;
    
    flavorsData.forEach(flavor => {
        const flavorVolume = (flavor.percent / 100) * totalAmount;
        // OPRAVA: Použít detailní kompozici místo zjednodušeného vgRatio
        const comp = flavor.customComposition || { vg: flavor.vgRatio, pg: 100 - flavor.vgRatio };
        totalFlavorVgVolume += flavorVolume * (comp.vg / 100);
        totalFlavorPgVolume += flavorVolume * (comp.pg / 100);
        // Poznámka: alkohol, voda, ostatní jdou do objemu ale ne do VG/PG fixních složek
    });
    
    const fixedPgVolume = nicotinePgVolume + totalFlavorPgVolume;
    const fixedVgVolume = nicotineVgVolume + totalFlavorVgVolume;
    
    // Získat data aditiv pro výpočet zbývajícího objemu
    const additivesData = typeof getProAdditivesData === 'function' ? getProAdditivesData() : [];
    const totalAdditivePercent = additivesData.reduce((sum, a) => sum + a.percent, 0);
    const totalFlavorVolume = (totalFlavorPercent / 100) * totalAmount;
    const totalAdditiveVolume = (totalAdditivePercent / 100) * totalAmount;
    
    // Zbývající objem pro bázi
    const remainingVolume = totalAmount - nicotineVolume - totalFlavorVolume - totalAdditiveVolume;
    
    // Zkontrolovat jestli je vybraný premixed režim
    const baseType = document.getElementById('proBaseType')?.value || 'separate';
    const premixedRatio = document.getElementById('proPremixedRatio')?.value || '60/40';
    
    let minVgPercent, maxVgPercent;
    
    if (baseType === 'premixed' && remainingVolume > 0) {
        // PREMIXED režim - limity jsou ovlivněny poměrem báze
        const premixedParts = premixedRatio.split('/');
        const premixedVgPercent = parseInt(premixedParts[0]) || 50;
        
        // S doladěním můžeme dosáhnout rozsahu od fixedVg do fixedVg + remainingVolume
        minVgPercent = Math.ceil((fixedVgVolume / totalAmount) * 100);
        maxVgPercent = Math.floor(((fixedVgVolume + remainingVolume) / totalAmount) * 100);
    } else {
        // SEPARATE režim - původní logika
        minVgPercent = Math.ceil((fixedVgVolume / totalAmount) * 100);
        maxVgPercent = Math.floor(100 - (fixedPgVolume / totalAmount) * 100);
    }
    
    proVgPgLimits.min = Math.max(0, minVgPercent);
    proVgPgLimits.max = Math.min(100, maxVgPercent);
    
    const limitValueLeft = document.getElementById('proLimitValueLeft');
    const limitValueRight = document.getElementById('proLimitValueRight');
    
    if (disabledLeft) {
        disabledLeft.style.width = proVgPgLimits.min + '%';
    }
    if (disabledRight) {
        disabledRight.style.width = (100 - proVgPgLimits.max) + '%';
    }
    
    // Zobrazit hodnoty limitů
    if (limitValueLeft) {
        if (proVgPgLimits.min > 0) {
            limitValueLeft.textContent = proVgPgLimits.min + '%';
            limitValueLeft.style.display = 'block';
        } else {
            limitValueLeft.style.display = 'none';
        }
    }
    if (limitValueRight) {
        if (proVgPgLimits.max < 100) {
            limitValueRight.textContent = proVgPgLimits.max + '%';
            limitValueRight.style.display = 'block';
        } else {
            limitValueRight.style.display = 'none';
        }
    }
    
    let currentValue = parseInt(slider.value);
    if (currentValue < proVgPgLimits.min) {
        slider.value = proVgPgLimits.min;
    } else if (currentValue > proVgPgLimits.max) {
        slider.value = proVgPgLimits.max;
    }
    
    if (warningEl) {
        if (proVgPgLimits.min > 0 || proVgPgLimits.max < 100) {
            const reasons = [];
            if (nicotineVolume > 0) {
                const nicReason = t('ratio_warning.reason_nicotine', 'nikotinová báze ({strength} mg/ml, VG/PG {vg}/{pg})')
                    .replace('{strength}', baseNicotine)
                    .replace('{vg}', nicVgPercent)
                    .replace('{pg}', nicPgPercent);
                reasons.push(nicReason);
            }
            if (totalFlavorPercent > 0) {
                const flavorReason = t('ratio_warning.reason_flavor_multi', 'příchutě (celkem {percent}%)')
                    .replace('{percent}', totalFlavorPercent);
                reasons.push(flavorReason);
            }
            const warningText = t('ratio_warning.limited_to', 'Poměr omezen na {min}–{max}% VG kvůli: {reasons}.')
                .replace('{min}', proVgPgLimits.min)
                .replace('{max}', proVgPgLimits.max)
                .replace('{reasons}', reasons.join(', '));
            warningEl.textContent = warningText;
            warningEl.classList.remove('hidden');
        } else {
            warningEl.classList.add('hidden');
        }
    }
    
    updateProRatioDisplay();
}

function calculateProMix() {
    // PRO funkce vyžaduje přihlášení a předplatné
    if (!requireSubscription()) {
        return;
    }
    
    const totalAmount = parseFloat(document.getElementById('proTotalAmount').value) || 100;
    const vgPercent = parseInt(document.getElementById('proVgPgRatio').value);
    const pgPercent = 100 - vgPercent;
    const nicotineType = document.getElementById('proNicotineType').value;
    const targetNicotine = parseFloat(document.getElementById('proTargetNicotine').value) || 0;
    const baseNicotine = parseFloat(document.getElementById('proNicotineBaseStrength').value) || 0;
    
    // Get base type (separate or premixed) - PRO version
    const baseType = document.getElementById('proBaseType')?.value || 'separate';
    const premixedRatio = document.getElementById('proPremixedRatio')?.value || '60/40';
    
    // Získat data všech příchutí (multi-flavor support)
    const flavorsData = typeof getProFlavorsData === 'function' ? getProFlavorsData() : [];
    const totalFlavorPercent = flavorsData.reduce((sum, f) => sum + f.percent, 0);
    const totalFlavorVolume = (totalFlavorPercent / 100) * totalAmount;
    
    // Získat data aditiv
    const additivesData = typeof getProAdditivesData === 'function' ? getProAdditivesData() : [];
    const totalAdditivePercent = additivesData.reduce((sum, a) => sum + a.percent, 0);
    const totalAdditiveVolume = (totalAdditivePercent / 100) * totalAmount;
    
    let nicotineVolume = 0;
    if (nicotineType !== 'none' && targetNicotine > 0 && baseNicotine > 0) {
        nicotineVolume = (targetNicotine * totalAmount) / baseNicotine;
    }
    
    const remainingVolume = totalAmount - nicotineVolume - totalFlavorVolume - totalAdditiveVolume;
    
    // Get VG/PG ratios from nicotine slider
    const nicSliderValue = document.getElementById('proNicotineRatioSlider').value;
    const nicVgPercent = nicSliderValue !== '' ? Number(nicSliderValue) : 50;
    const nicPgPercent = 100 - nicVgPercent;
    
    let nicotineVgContent = 0;
    let nicotinePgContent = 0;
    
    if (nicotineType !== 'none' && nicotineVolume > 0) {
        nicotineVgContent = nicotineVolume * (nicVgPercent / 100);
        nicotinePgContent = nicotineVolume * (nicPgPercent / 100);
    }
    
    // Spočítat VG/PG obsah ze všech příchutí - použít detailní kompozici
    let totalFlavorVgContent = 0;
    let totalFlavorPgContent = 0;
    
    flavorsData.forEach(flavor => {
        const flavorVolume = (flavor.percent / 100) * totalAmount;
        // OPRAVA: Použít detailní kompozici místo zjednodušeného vgRatio
        const comp = flavor.customComposition || { vg: flavor.vgRatio, pg: 100 - flavor.vgRatio };
        totalFlavorVgContent += flavorVolume * (comp.vg / 100);
        totalFlavorPgContent += flavorVolume * (comp.pg / 100);
        // Poznámka: alkohol, voda, ostatní jdou do objemu ale ne do VG/PG obsahu
    });
    
    // Spočítat VG/PG obsah z aditiv
    let totalAdditiveVgContent = 0;
    let totalAdditivePgContent = 0;
    
    additivesData.forEach(additive => {
        const additiveVolume = (additive.percent / 100) * totalAmount;
        const composition = additive.customComposition || (additiveDatabase[additive.type]?.composition) || { pg: 100, vg: 0 };
        totalAdditiveVgContent += additiveVolume * (composition.vg / 100);
        totalAdditivePgContent += additiveVolume * (composition.pg / 100);
    });
    
    const targetVgTotal = (vgPercent / 100) * totalAmount;
    const targetPgTotal = (pgPercent / 100) * totalAmount;
    
    let pureVgNeeded = targetVgTotal - nicotineVgContent - totalFlavorVgContent - totalAdditiveVgContent;
    let purePgNeeded = targetPgTotal - nicotinePgContent - totalFlavorPgContent - totalAdditivePgContent;
    let premixedBaseVolume = 0;
    let premixedVgPercent = 60;
    
    if (pureVgNeeded < 0) pureVgNeeded = 0;
    if (purePgNeeded < 0) purePgNeeded = 0;
    
    const ingredients = [];
    
    if (baseType === 'premixed') {
        // PREMIXED BASE MODE s podporou doladění
        const premixedParts = premixedRatio.split('/');
        premixedVgPercent = parseInt(premixedParts[0]) || 60;
        const premixedPgPercent = 100 - premixedVgPercent;
        
        // Kolik VG/PG již máme z nikotinu, příchutí a aditiv
        const providedVg = nicotineVgContent + totalFlavorVgContent + totalAdditiveVgContent;
        const providedPg = nicotinePgContent + totalFlavorPgContent + totalAdditivePgContent;
        
        // Kolik VG/PG ještě potřebujeme dodat pro cílový poměr
        const neededVg = Math.max(0, targetVgTotal - providedVg);
        const neededPg = Math.max(0, targetPgTotal - providedPg);
        
        // Vypočítat optimální množství předmíchané báze a doladění
        let adjustmentVg = 0;
        let adjustmentPg = 0;
        
        if (premixedVgPercent >= 100) {
            // Báze je 100% VG - použijeme ji pro VG a doladíme PG
            premixedBaseVolume = Math.min(neededVg, remainingVolume);
            adjustmentPg = Math.min(neededPg, remainingVolume - premixedBaseVolume);
        } else if (premixedVgPercent <= 0) {
            // Báze je 100% PG - použijeme ji pro PG a doladíme VG
            premixedBaseVolume = Math.min(neededPg, remainingVolume);
            adjustmentVg = Math.min(neededVg, remainingVolume - premixedBaseVolume);
        } else {
            // Smíšená báze:
            // Pokud uživatel neměnil VG/PG posuvník, použít celou bázi bez doladění
            // Doladění se přidává POUZE když uživatel ručně změní cílový poměr
            if (!proUserManuallyChangedRatio) {
                // Uživatel neměnil posuvník — celá báze, žádné doladění
                premixedBaseVolume = remainingVolume;
                adjustmentVg = 0;
                adjustmentPg = 0;
            } else {
                // Uživatel ručně změnil cílový poměr VG/PG
                if (neededVg > 0 && neededPg > 0) {
                    const neededVgRatio = neededVg / (neededVg + neededPg);
                    const baseVgRatio = premixedVgPercent / 100;
                    
                    if (neededVgRatio > baseVgRatio) {
                        if (premixedPgPercent > 0) {
                            premixedBaseVolume = Math.min(neededPg / (premixedPgPercent / 100), remainingVolume);
                            adjustmentVg = remainingVolume - premixedBaseVolume;
                            adjustmentPg = 0;
                        } else {
                            premixedBaseVolume = remainingVolume;
                        }
                    } else {
                        if (premixedVgPercent > 0) {
                            premixedBaseVolume = Math.min(neededVg / (premixedVgPercent / 100), remainingVolume);
                            adjustmentPg = remainingVolume - premixedBaseVolume;
                            adjustmentVg = 0;
                        } else {
                            premixedBaseVolume = remainingVolume;
                        }
                    }
                } else if (neededVg > 0) {
                    premixedBaseVolume = 0;
                    adjustmentVg = remainingVolume;
                } else if (neededPg > 0) {
                    premixedBaseVolume = 0;
                    adjustmentPg = remainingVolume;
                } else {
                    premixedBaseVolume = remainingVolume;
                }
                
                premixedBaseVolume = Math.max(0, premixedBaseVolume);
                adjustmentVg = Math.max(0, adjustmentVg);
                adjustmentPg = Math.max(0, adjustmentPg);
            }
        }
        
        // Doladění VG/PG — zobrazit vždy když je > 0.01 ml
        pureVgNeeded = adjustmentVg > 0.01 ? adjustmentVg : 0;
        purePgNeeded = adjustmentPg > 0.01 ? adjustmentPg : 0;
        
        // Add nicotine
        if (nicotineVolume > 0) {
            ingredients.push({
                ingredientKey: nicotineType === 'salt' ? 'nicotine_salt' : 'nicotine_booster',
                vgRatio: nicVgPercent,
                params: {
                    strength: baseNicotine,
                    vgpg: `${nicVgPercent}/${nicPgPercent}`
                },
                volume: nicotineVolume,
                percent: (nicotineVolume / totalAmount) * 100
            });
        }
        
        // Add all flavors
        flavorsData.forEach((flavor, index) => {
            const flavorVolume = (flavor.percent / 100) * totalAmount;
            // Použít customComposition pro přesné VG/PG zobrazení
            const comp = flavor.customComposition || { vg: flavor.vgRatio, pg: 100 - flavor.vgRatio };
            const displayVg = Math.round(comp.vg);
            const displayPg = Math.round(comp.pg);
            
            const flavorIngredient = {
                ingredientKey: 'flavor',
                flavorType: flavor.type,
                flavorIndex: flavor.index,
                flavorNumber: index + 1,
                vgRatio: flavor.vgRatio,
                customComposition: flavor.customComposition || null,
                params: {
                    vgpg: `${displayVg}/${displayPg}`
                },
                volume: flavorVolume,
                percent: (flavorVolume / totalAmount) * 100
            };
            
            // Přidat info o konkrétní příchuti pokud existuje
            if (flavor.flavorName) {
                flavorIngredient.flavorName = flavor.flavorName;
                flavorIngredient.flavorManufacturer = flavor.flavorManufacturer;
                flavorIngredient.flavorId = flavor.flavorId;
                flavorIngredient.favoriteProductId = flavor.favoriteProductId;
                flavorIngredient.flavorSource = flavor.flavorSource;
            }
            
            ingredients.push(flavorIngredient);
        });
        
        // Add all additives
        additivesData.forEach((additive) => {
            const additiveVolume = (additive.percent / 100) * totalAmount;
            
            ingredients.push({
                ingredientKey: 'additive',
                additiveType: additive.type,
                customComposition: additive.customComposition,
                volume: additiveVolume,
                percent: (additiveVolume / totalAmount) * 100
            });
        });
        
        // Add premixed base (FIRST BRANCH)
        if (premixedBaseVolume > 0.01) {
            ingredients.push({
                ingredientKey: 'premixedBase',
                vgRatio: premixedVgPercent,
                params: {
                    vgpg: premixedRatio
                },
                volume: premixedBaseVolume,
                percent: (premixedBaseVolume / totalAmount) * 100
            });
        }
        
        // Add adjustment VG/PG if needed
        if (pureVgNeeded > 0.01) {
            ingredients.push({
                ingredientKey: 'vg_adjustment',
                volume: pureVgNeeded,
                percent: (pureVgNeeded / totalAmount) * 100
            });
        }
        
        if (purePgNeeded > 0.01) {
            ingredients.push({
                ingredientKey: 'pg_adjustment',
                volume: purePgNeeded,
                percent: (purePgNeeded / totalAmount) * 100
            });
        }
        
    } else {
        // SEPARATE PG/VG MODE (original logic)
        const totalPureNeeded = pureVgNeeded + purePgNeeded;
        if (totalPureNeeded > remainingVolume && totalPureNeeded > 0) {
            const ratio = remainingVolume / totalPureNeeded;
            pureVgNeeded *= ratio;
            purePgNeeded *= ratio;
        } else if (totalPureNeeded < remainingVolume) {
            const extra = remainingVolume - totalPureNeeded;
            if (vgPercent + pgPercent > 0) {
                pureVgNeeded += extra * (vgPercent / 100);
                purePgNeeded += extra * (pgPercent / 100);
            }
        }
        
        // Add nicotine
        if (nicotineVolume > 0) {
            ingredients.push({
                ingredientKey: nicotineType === 'salt' ? 'nicotine_salt' : 'nicotine_booster',
                vgRatio: nicVgPercent,
                params: {
                    strength: baseNicotine,
                    vgpg: `${nicVgPercent}/${nicPgPercent}`
                },
                volume: nicotineVolume,
                percent: (nicotineVolume / totalAmount) * 100
            });
        }
        
        // Add all flavors (SECOND BRANCH - no premixed base)
        flavorsData.forEach((flavor, index) => {
            const flavorVolume = (flavor.percent / 100) * totalAmount;
            // Použít customComposition pro přesné VG/PG zobrazení
            const comp = flavor.customComposition || { vg: flavor.vgRatio, pg: 100 - flavor.vgRatio };
            const displayVg = Math.round(comp.vg);
            const displayPg = Math.round(comp.pg);
            
            const flavorIngredient = {
                ingredientKey: 'flavor',
                flavorType: flavor.type,
                flavorIndex: flavor.index,
                flavorNumber: index + 1,
                vgRatio: flavor.vgRatio,
                customComposition: flavor.customComposition || null,
                params: {
                    vgpg: `${displayVg}/${displayPg}`
                },
                volume: flavorVolume,
                percent: (flavorVolume / totalAmount) * 100
            };
            
            // Přidat info o konkrétní příchuti pokud existuje
            if (flavor.flavorName) {
                flavorIngredient.flavorName = flavor.flavorName;
                flavorIngredient.flavorManufacturer = flavor.flavorManufacturer;
                flavorIngredient.flavorId = flavor.flavorId;
                flavorIngredient.favoriteProductId = flavor.favoriteProductId;
                flavorIngredient.flavorSource = flavor.flavorSource;
            }
            
            ingredients.push(flavorIngredient);
        });
        
        // Add all additives (SECOND BRANCH)
        additivesData.forEach((additive) => {
            const additiveVolume = (additive.percent / 100) * totalAmount;
            
            ingredients.push({
                ingredientKey: 'additive',
                additiveType: additive.type,
                customComposition: additive.customComposition,
                volume: additiveVolume,
                percent: (additiveVolume / totalAmount) * 100
            });
        });
        
        if (purePgNeeded > 0.01) {
            ingredients.push({
                ingredientKey: 'pg',
                volume: purePgNeeded,
                percent: (purePgNeeded / totalAmount) * 100
            });
        }
        
        if (pureVgNeeded > 0.01) {
            ingredients.push({
                ingredientKey: 'vg',
                volume: pureVgNeeded,
                percent: (pureVgNeeded / totalAmount) * 100
            });
        }
    }
    
    // Calculate actual VG/PG
    let actualVg = pureVgNeeded + nicotineVgContent + totalFlavorVgContent + totalAdditiveVgContent;
    let actualPg = purePgNeeded + nicotinePgContent + totalFlavorPgContent + totalAdditivePgContent;
    
    if (baseType === 'premixed' && premixedBaseVolume > 0) {
        actualVg += premixedBaseVolume * (premixedVgPercent / 100);
        actualPg += premixedBaseVolume * ((100 - premixedVgPercent) / 100);
    }
    
    // Uložit data příchutí pro recept
    window.lastProFlavorsData = flavorsData;
    
    // Kontrola přihlášení před zobrazením výsledků - Liquid PRO vyžaduje přihlášení
    if (!isUserLoggedIn()) {
        showLoginRequiredModal();
        return;
    }
    
    // V premixed mode bez ručního posunu slideru: zobrazit skutečný poměr v hlavičce (celé číslo)
    let displayVg = vgPercent;
    let displayPg = pgPercent;
    if (baseType === 'premixed' && !proUserManuallyChangedRatio && totalAmount > 0) {
        displayVg = Math.round((actualVg / totalAmount) * 100);
        displayPg = 100 - displayVg;
    }

    displayResults(totalAmount, displayVg, displayPg, targetNicotine, ingredients, totalAmount, actualVg, actualPg, {
        formType: 'liquidpro',
        flavors: flavorsData,
        additives: additivesData,
        baseType: baseType,
        premixedRatio: baseType === 'premixed' ? premixedRatio : null,
        nicotineType: nicotineType,
        nicotineBaseStrength: baseNicotine,
        nicotineRatioSlider: nicVgPercent,
        nicotineSaltType: nicotineType === 'salt' ? (document.getElementById('proSaltType')?.value || 'unknown') : undefined,
        manuallyChangedRatio: proUserManuallyChangedRatio
    });
    
    showPage('results');
}

// =========================================
// SUBSCRIPTION / PŘEDPLATNÉ
// =========================================

// Globální stav předplatného
let subscriptionData = null;
let userLocation = null;

// Cache klíč pro subscription stav v localStorage
const SUBSCRIPTION_CACHE_KEY = 'liquimixer_subscription_cache';
const SUBSCRIPTION_CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hodin

// Načíst subscription stav z cache (optimistické načtení)
function loadSubscriptionCache(clerkId) {
    try {
        const cached = localStorage.getItem(SUBSCRIPTION_CACHE_KEY);
        if (!cached) return null;
        const data = JSON.parse(cached);
        // Kontrola: cache patří stejnému uživateli a není expirovaná
        if (data.clerkId !== clerkId) return null;
        if (Date.now() - data.cachedAt > SUBSCRIPTION_CACHE_TTL) return null;
        // Kontrola: pokud je valid_to v minulosti, cache je neplatná
        if (data.result?.expiresAt && new Date(data.result.expiresAt) < new Date()) return null;
        return data.result;
    } catch (e) {
        return null;
    }
}

// Uložit subscription stav do cache
function saveSubscriptionCache(clerkId, result) {
    try {
        localStorage.setItem(SUBSCRIPTION_CACHE_KEY, JSON.stringify({
            clerkId: clerkId,
            result: result,
            cachedAt: Date.now()
        }));
    } catch (e) {
        // localStorage může být plný nebo nedostupný
    }
}

// Smazat subscription cache (při odhlášení)
function clearSubscriptionCache() {
    try {
        localStorage.removeItem(SUBSCRIPTION_CACHE_KEY);
    } catch (e) {}
}

// Zkontrolovat stav předplatného
// Vrací: true = má platné předplatné, false = nemá nebo chyba
async function checkSubscriptionStatus() {
    // KLÍČOVÁ KONTROLA: Pouze pro přihlášené uživatele
    if (!window.Clerk?.user) {
        console.log('checkSubscriptionStatus: No user signed in, skipping');
        return false;
    }

    const clerkId = window.Clerk.user.id;

    // OPTIMISTICKÉ NAČTENÍ z cache — okamžitě nastavit stav
    const cached = loadSubscriptionCache(clerkId);
    if (cached && cached.valid) {
        console.log('checkSubscriptionStatus: Using cached subscription (valid until', cached.expiresAt, ')');
        subscriptionData = cached;
        updateSubscriptionStatusUI(cached);
        // Na pozadí ověřit aktuální stav (bez blokování UI)
        _verifySubscriptionInBackground(clerkId);
        return true;
    }

    // Žádná platná cache — musíme ověřit online
    return await _fetchSubscriptionStatus(clerkId, true);
}

// Ověřit subscription na pozadí (neblokuje UI, neotevírá modály)
async function _verifySubscriptionInBackground(clerkId) {
    try {
        const result = await _fetchSubscriptionFromServer();
        if (!result) return; // network error, ignorovat
        
        subscriptionData = result;
        saveSubscriptionCache(clerkId, result);
        
        if (!result.valid) {
            // Cache byla platná ale server říká ne — aktualizovat
            console.log('Background check: subscription no longer valid');
            showSubscriptionModal();
        } else {
            updateSubscriptionStatusUI(result);
        }
    } catch (e) {
        console.log('Background subscription check failed:', e);
    }
}

// Načíst subscription stav ze serveru
async function _fetchSubscriptionFromServer() {
    let token = null;
    let attempts = 0;
    while (!token && attempts < 3) {
        token = await getClerkToken();
        if (!token) {
            attempts++;
            console.log('Waiting for token, attempt:', attempts);
            await new Promise(r => setTimeout(r, 500));
        }
    }
    
    if (!token) {
        console.error('No auth token available after retries');
        return null;
    }
    
    const response = await fetch(`${getSupabaseUrl()}/functions/v1/subscription`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getSupabaseAnonKey()}`,
            'x-clerk-token': token,
        },
        body: JSON.stringify({ action: 'check' })
    });

    if (!response.ok) {
        console.error('Subscription check failed:', response.status);
        return null;
    }

    return await response.json();
}

// Plný fetch + UI akce (modály, UI update)
async function _fetchSubscriptionStatus(clerkId, showModalOnFail) {
    try {
        console.log('Checking subscription status for user:', clerkId);
        
        const result = await _fetchSubscriptionFromServer();
        
        if (!result) {
            // Network/token error — NEPOKAZOVAT modal
            return false;
        }

        console.log('Subscription status:', result);
        subscriptionData = result;
        saveSubscriptionCache(clerkId, result);

        if (!result.valid) {
            if (showModalOnFail) {
                console.log('No valid subscription, showing payment modal');
                showSubscriptionModal();
            }
            return false;
        } else {
            updateSubscriptionStatusUI(result);
            return true;
        }
    } catch (error) {
        console.error('Error checking subscription:', error);
        return false;
    }
}

// Získat Supabase URL
function getSupabaseUrl() {
    return 'https://krwdfxnvhnxtkhtkbadi.supabase.co';
}

// Získat Supabase Anon Key (potřebný pro volání Edge Functions)
function getSupabaseAnonKey() {
    return 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtyd2RmeG52aG54dGtodGtiYWRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU0NzA1NDcsImV4cCI6MjA4MTA0NjU0N30.IKpOTRfPaOwyBSnIpqOK2utwIDnllLM3XcV9NH-tXrA';
}

// Získat Clerk JWT token pro Supabase
// DŮLEŽITÉ: Používá template 'supabase' pro kompatibilitu se Supabase Edge Functions
async function getClerkToken(maxRetries = 1, retryDelay = 500) {
    for (let attempt = 0; attempt < maxRetries; attempt++) {
        if (!window.Clerk?.session) {
            if (attempt < maxRetries - 1) {
                console.log(`No Clerk session yet, retry ${attempt + 1}/${maxRetries}...`);
                await new Promise(r => setTimeout(r, retryDelay));
                continue;
            }
            return null;
        }
        try {
            // Nejdříve zkusit template pro Supabase (pokud existuje v Clerk dashboard)
            let token = null;
            try {
                token = await window.Clerk.session.getToken({ template: 'supabase' });
            } catch (templateError) {
                console.log('Supabase template not found, trying default token...');
            }
            
            // Fallback na standardní token pokud template není nakonfigurován
            if (!token) {
                token = await window.Clerk.session.getToken();
            }
            
            if (token) {
                return token;
            }
            if (attempt < maxRetries - 1) {
                console.log(`No token from session, retry ${attempt + 1}/${maxRetries}...`);
                await new Promise(r => setTimeout(r, retryDelay));
            }
        } catch (error) {
            console.error('Error getting Clerk token:', error);
            if (attempt < maxRetries - 1) {
                await new Promise(r => setTimeout(r, retryDelay));
            } else {
                return null;
            }
        }
    }
    return null;
}

// Zobrazit modal předplatného
async function showSubscriptionModal(skipTermsCheck = false) {
    console.log('showSubscriptionModal: Starting...', skipTermsCheck ? '(skipTermsCheck)' : '');
    
    const modal = document.getElementById('subscriptionModal');
    if (!modal) {
        console.error('showSubscriptionModal: Modal not found!');
        return;
    }

    // KRITICKÉ: Unmount Clerk komponenty PŘED skrytím loginModal
    // Toto zabrání tomu, aby Clerk iframe zůstával viditelný
    const signInDiv = document.getElementById('clerk-sign-in');
    if (signInDiv && window.Clerk) {
        try {
            // Zkusit unmount obou variant (signUp i signIn)
            if (signInDiv._clerkMode === 'signUp') {
                window.Clerk.unmountSignUp(signInDiv);
            } else {
                window.Clerk.unmountSignIn(signInDiv);
            }
            signInDiv._clerkMode = null;
            console.log('showSubscriptionModal: Clerk component unmounted');
        } catch(e) {
            console.warn('showSubscriptionModal: Clerk unmount warning:', e.message);
        }
    }

    // NEJPRVE skrýt VŠECHNY ostatní modaly - zabránit překrývání
    const loginModal = document.getElementById('loginModal');
    const loginRequiredModal = document.getElementById('loginRequiredModal');
    const menuDropdown = document.getElementById('menuDropdown');
    
    if (loginModal) {
        loginModal.classList.add('hidden');
        loginModal.style.display = 'none'; // Force hide
    }
    if (loginRequiredModal) {
        loginRequiredModal.classList.add('hidden');
        loginRequiredModal.style.display = 'none';
    }
    if (menuDropdown) {
        menuDropdown.classList.add('hidden');
    }
    
    // ZABLOKOVAT INTERAKCI S APLIKACÍ - přidat třídu na body
    document.body.classList.add('subscription-required');
    
    // Zobrazit modal a ZAJISTIT černé neprůhledné pozadí (inline styl pro jistotu)
    modal.classList.remove('hidden');
    modal.style.background = '#000000';
    modal.style.backdropFilter = 'none';
    modal.style.webkitBackdropFilter = 'none';
    
    // Zajistit správné scroll pozice - modal nahoře
    modal.scrollTop = 0;
    window.scrollTo(0, 0);

    // Skrýt chybovou zprávu
    document.getElementById('subscriptionError')?.classList.add('hidden');
    
    // Získat elementy - s kontrolou existence
    let guestState = document.getElementById('guestState');
    let loggedInState = document.getElementById('loggedInState');
    let locationDetection = document.getElementById('locationDetection');
    
    // Kontrola: pokud elementy neexistují, počkat 100ms a zkusit znovu
    if (!guestState || !loggedInState) {
        console.warn('showSubscriptionModal: Elements not found, waiting for DOM...');
        await new Promise(r => setTimeout(r, 100));
        guestState = document.getElementById('guestState');
        loggedInState = document.getElementById('loggedInState');
        locationDetection = document.getElementById('locationDetection');
    }
    
    // Stále neexistují? Kritická chyba
    if (!guestState && !loggedInState) {
        console.error('showSubscriptionModal: Critical - neither guestState nor loggedInState found!');
        return;
    }
    
    // Zobrazit loader, skrýt oba stavy
    if (locationDetection) locationDetection.classList.remove('hidden');
    if (guestState) guestState.classList.add('hidden');
    if (loggedInState) loggedInState.classList.add('hidden');
    
    // Detekovat lokaci (s timeout pro případ selhání)
    try {
        const locationPromise = detectUserLocation();
        const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Location detection timeout')), 5000)
        );
        await Promise.race([locationPromise, timeoutPromise]);
    } catch (error) {
        console.warn('showSubscriptionModal: Location detection failed:', error.message);
        // Nastavit fallback cenu
        userLocation = { grossAmount: 59, currency: 'CZK', vatRate: 21 };
    }
    
    // Skrýt loader
    if (locationDetection) locationDetection.classList.add('hidden');
    
    // Zkontrolovat stav přihlášení
    const isLoggedIn = !!window.Clerk?.user;
    console.log('showSubscriptionModal: isLoggedIn =', isLoggedIn, 'email =', window.Clerk?.user?.primaryEmailAddress?.emailAddress);
    
    // Zkontrolovat zda uživatel již souhlasil s OP (terms_accepted_at v DB)
    let hasAcceptedTerms = skipTermsCheck; // Pokud přišel ze subscription flow po registraci, přeskočit
    if (!hasAcceptedTerms && isLoggedIn && window.LiquiMixerDB) {
        try {
            const userData = await window.LiquiMixerDB.getUser(window.Clerk.user.id);
            hasAcceptedTerms = !!userData?.terms_accepted_at;
            console.log('showSubscriptionModal: hasAcceptedTerms =', hasAcceptedTerms, 'terms_accepted_at =', userData?.terms_accepted_at);
        } catch (e) {
            console.warn('showSubscriptionModal: Failed to check terms acceptance:', e);
        }
    }
    
    // Zobrazit správný stav podle přihlášení A souhlasu s OP
    // Přihlášený uživatel bez souhlasu s OP musí nejprve souhlasit (Stav A)
    if (isLoggedIn && hasAcceptedTerms && loggedInState) {
        // STAV B: Uživatel je přihlášen A již souhlasil s OP → zobrazit potvrzení a tlačítko Zaplatit
        loggedInState.classList.remove('hidden');
        if (guestState) guestState.classList.add('hidden');
        
        // Zobrazit email uživatele
        const emailEl = document.getElementById('loggedInUserEmail');
        if (emailEl) {
            const email = window.Clerk?.user?.primaryEmailAddress?.emailAddress || 
                          window.Clerk?.user?.emailAddresses?.[0]?.emailAddress || 
                          'uživatel';
            emailEl.textContent = email;
        }
        
        // Aktualizovat cenu pro přihlášeného uživatele
        if (userLocation) {
            const currencySymbols = { 'CZK': 'Kč', 'EUR': '€', 'USD': '$' };
            const priceAmountLoggedIn = document.getElementById('priceAmountLoggedIn');
            const priceCurrencyLoggedIn = document.getElementById('priceCurrencyLoggedIn');
            if (priceAmountLoggedIn) priceAmountLoggedIn.textContent = userLocation.grossAmount;
            if (priceCurrencyLoggedIn) priceCurrencyLoggedIn.textContent = currencySymbols[userLocation.currency] || userLocation.currency;
        }
        
        console.log('showSubscriptionModal: Showing State B (logged in)');
    } else if (guestState) {
        // STAV A: Uživatel není přihlášen → zobrazit cenu, features, OP a tlačítko Registrovat
        guestState.classList.remove('hidden');
        if (loggedInState) loggedInState.classList.add('hidden');
        
        // Reset checkbox a tlačítka
        const termsCheckbox = document.getElementById('termsCheckboxGuest');
        if (termsCheckbox) termsCheckbox.checked = false;
        updateGuestPayButton();
        
        console.log('showSubscriptionModal: Showing State A (guest)');
    } else if (loggedInState) {
        // FALLBACK: guestState neexistuje, ale loggedInState ano - použít loggedInState
        console.warn('showSubscriptionModal: guestState not found, using loggedInState as fallback');
        loggedInState.classList.remove('hidden');
    } else {
        // KRITICKÝ FALLBACK: Žádný stav neexistuje - zkusit najít znovu
        console.error('showSubscriptionModal: CRITICAL FALLBACK - trying to force visibility');
        const gs = document.getElementById('guestState');
        const ls = document.getElementById('loggedInState');
        if (gs) gs.classList.remove('hidden');
        else if (ls) ls.classList.remove('hidden');
    }
    
    // Aplikovat překlady na modal
    if (window.i18n && window.i18n.applyTranslations) {
        window.i18n.applyTranslations();
    }
    
    console.log('showSubscriptionModal: Complete');
}

// Aktualizovat stav tlačítka "Registrovat a zaplatit" podle checkboxu OP
function updateGuestPayButton() {
    const termsCheckbox = document.getElementById('termsCheckboxGuest');
    const registerAndPayBtn = document.getElementById('registerAndPayBtn');
    if (registerAndPayBtn && termsCheckbox) {
        registerAndPayBtn.disabled = !termsCheckbox.checked;
    }
}

// Spustit registraci a pak platbu (pro nepřihlášené)
async function startRegistrationAndPayment() {
    const termsCheckbox = document.getElementById('termsCheckboxGuest');
    if (!termsCheckbox?.checked) {
        return;
    }
    
    // Zkontrolovat zda je uživatel přihlášen (OAuth uživatel bez souhlasu s OP)
    if (window.Clerk?.user) {
        // Přihlášený uživatel - uložit souhlas s OP do DB a rovnou přejít na platbu
        console.log('startRegistrationAndPayment: User is logged in, saving terms acceptance and proceeding to payment...');
        
        if (window.LiquiMixerDB) {
            await window.LiquiMixerDB.saveTermsAcceptance(window.Clerk.user.id);
        }
        
        // Přejít na stav B (výběr platební metody)
        showSubscriptionModal(true);
        return;
    }
    
    // Nepřihlášený uživatel - standardní flow: uložit flag a přejít na registraci
    // Uložit flag, že uživatel přišel ze subscription modalu a souhlasil s OP
    localStorage.setItem('liquimixer_from_subscription', 'true');
    localStorage.setItem('liquimixer_terms_accepted', 'true');
    localStorage.setItem('liquimixer_terms_accepted_at', new Date().toISOString());
    
    // Černé pozadí během celého registračního flow (uživatel nikdy neuvidí hlavní stránku)
    document.body.classList.add('subscription-flow-pending');
    
    // Zavřít subscription modal a otevřít Clerk registraci
    hideSubscriptionModal();
    setTimeout(() => {
        showLoginModal('signUp');
    }, 100);
}

// Přejít na přihlášení ze subscription modalu (pro uživatele, kteří už mají účet)
function goToLoginFromSubscription() {
    // Uložit flag, že uživatel přišel ze subscription modalu
    localStorage.setItem('liquimixer_from_subscription', 'true');
    
    // Černé pozadí během celého login flow (uživatel nikdy neuvidí hlavní stránku)
    document.body.classList.add('subscription-flow-pending');
    
    hideSubscriptionModal();
    setTimeout(() => {
        showLoginModal('signIn');
    }, 100);
}

// Skrýt modal předplatného (pouze po úspěšné platbě!)
function hideSubscriptionModal() {
    const modal = document.getElementById('subscriptionModal');
    if (modal) {
        modal.classList.add('hidden');
    }
    // Odblokovat interakci s aplikací
    document.body.classList.remove('subscription-required');
    
    // Resetovat inline styly na loginModal a loginRequiredModal
    const loginModal = document.getElementById('loginModal');
    const loginRequiredModal = document.getElementById('loginRequiredModal');
    if (loginModal) loginModal.style.display = '';
    if (loginRequiredModal) loginRequiredModal.style.display = '';
}

// Handler pro zavření subscription modalu křížkem
function handleSubscriptionModalClose() {
    // Vyčistit flagy
    localStorage.removeItem('liquimixer_from_subscription');
    hideSubscriptionModal();
}

// Handler pro backdrop click
function handleSubscriptionModalBackdropClick(event) {
    // Povolit zavření kliknutím na pozadí
    if (event.target === event.currentTarget) { 
        handleSubscriptionModalClose();
    }
}

// Detekovat lokaci uživatele - VŽDY použít IP geolokaci, pak fallback
async function detectUserLocation() {
    // Získat aktuální jazyk z i18n (pouze pro fallback)
    const currentLocale = window.i18n?.getLocale() || 'cs';
    
    // Cenové mapy - pouze CZK, EUR, USD
    const priceMap = {
        'CZK': { grossAmount: 59, currency: 'CZK', vatRate: 21 },
        'EUR': { grossAmount: 2.4, currency: 'EUR', vatRate: 20 },
        'USD': { grossAmount: 2.9, currency: 'USD', vatRate: 0 }
    };
    
    // Mapování jazyků na měny (pouze CZK, EUR, USD) - pouze pro fallback
    // CZK: cs
    // USD: en, ko, ja, zh-CN, zh-TW, ar-SA
    // EUR: všechny ostatní
    const currencyByLocale = {
        'cs': 'CZK',
        'en': 'USD',
        'ko': 'USD',
        'ja': 'USD',
        'zh-CN': 'USD',
        'zh-TW': 'USD',
        'ar-SA': 'USD'
        // Všechny ostatní → EUR (default)
    };
    
    try {
        // VŽDY zkusit IP geolokaci - i pro nepřihlášené uživatele
        // Pro přihlášené použít Clerk token, pro nepřihlášené bez tokenu
        const clerkToken = window.Clerk?.user ? await getClerkToken() : null;
        
        const response = await fetch(`${getSupabaseUrl()}/functions/v1/geolocation`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getSupabaseAnonKey()}`,
                ...(clerkToken ? { 'x-clerk-token': clerkToken } : {}),
            },
            body: JSON.stringify({ 
                action: 'detect',
                data: { clerkId: window.Clerk?.user?.id || null }
            })
        });

        if (response.ok) {
            const result = await response.json();
            console.log('Geolocation API success:', result.location?.countryCode, result.location);
            userLocation = result.location;
            updatePricingUI(userLocation);
            return;
        } else {
            console.warn('Geolocation API failed:', response.status, await response.text().catch(() => ''));
        }
        
        // Fallback: Použít měnu podle aktuálního jazyka
        const currency = currencyByLocale[currentLocale] || 'EUR';
        // DŮLEŽITÉ: Fallback vždy na CZ - místo plnění je ČR (OSS režim)
        // Jazyk uživatele != země pro DPH. IP geolokace se použije až bude dostupná.
        console.log('Geolocation fallback: using CZ as default country (OSS regime)');
        userLocation = {
            countryCode: 'CZ', // VŽDY CZ - jazyk není indikátor země pro DPH
            ...priceMap[currency]
        };
        
        updatePricingUI(userLocation);

    } catch (error) {
        console.error('Error detecting location:', error);
        // Fallback vždy na CZ - místo plnění je ČR (OSS režim)
        const currency = currencyByLocale[currentLocale] || 'EUR';
        console.log('Geolocation error fallback: using CZ as default country (OSS regime)');
        userLocation = {
            countryCode: 'CZ', // VŽDY CZ - jazyk není indikátor země pro DPH
            ...priceMap[currency]
        };
        updatePricingUI(userLocation);
    }
}

// Aktualizovat UI s cenami (nový layout - guestState/loggedInState)
function updatePricingUI(location) {
    const currencySymbols = {
        'CZK': 'Kč',
        'EUR': '€',
        'USD': '$'
    };
    const currencySymbol = currencySymbols[location.currency] || location.currency;

    // Aktualizovat cenu v guestState
    const priceAmount = document.getElementById('priceAmount');
    const priceCurrency = document.getElementById('priceCurrency');
    if (priceAmount) priceAmount.textContent = location.grossAmount;
    if (priceCurrency) priceCurrency.textContent = currencySymbol;

    // Aktualizovat cenu v loggedInState
    const priceAmountLoggedIn = document.getElementById('priceAmountLoggedIn');
    const priceCurrencyLoggedIn = document.getElementById('priceCurrencyLoggedIn');
    if (priceAmountLoggedIn) priceAmountLoggedIn.textContent = location.grossAmount;
    if (priceCurrencyLoggedIn) priceCurrencyLoggedIn.textContent = currencySymbol;

    // Aktualizovat DPH info
    const vatInfo = document.getElementById('pricingVatInfo');
    if (vatInfo) {
        if (location.vatRate > 0) {
            vatInfo.textContent = t('subscription.price_includes_vat', 'Cena je včetně DPH');
        } else {
            vatInfo.textContent = '';
        }
    }
}

// Spustit platbu (voláno z Stavu B - uživatel je přihlášen)
// payMethod: 'GAP' = Google Pay, 'APL' = Apple Pay, 'CRD' = kartou, undefined = bez předvolby
async function startPayment(payMethod) {
    // Ověřit, že uživatel je přihlášen
    if (!window.Clerk || !window.Clerk.user) {
        console.error('User not logged in - cannot start payment');
        showSubscriptionError(t('subscription.error_not_logged_in', 'Pro dokončení platby se nejprve přihlaste.'));
        return;
    }

    // Disable všechna platební tlačítka
    const allPayBtns = document.querySelectorAll('.payment-method-btn');
    allPayBtns.forEach(btn => { btn.disabled = true; });

    try {
        // Pokračovat s platbou
        await processPayment(payMethod);

    } catch (error) {
        console.error('Payment error:', error);
        showSubscriptionError(t('subscription.error_generic', 'An error occurred while processing payment. Please try again.'));
        allPayBtns.forEach(btn => { btn.disabled = false; });
    }
}

// Zpracovat platbu (voláno když je uživatel již přihlášen)
// payMethod: 'GAP' = Google Pay, 'APL' = Apple Pay, 'CRD' = kartou
async function processPayment(payMethod) {
    
    try {
        // DŮLEŽITÉ: Aktualizovat geolokaci před platbou (uživatel se mohl přestěhovat)
        console.log('Refreshing user location before payment...');
        try {
            await detectUserLocation();
            console.log('User location updated:', userLocation?.countryCode);
        } catch (locError) {
            console.warn('Location refresh failed, using cached location:', userLocation?.countryCode);
        }
        
        // Uživatel je již přihlášen (ověřeno v startPayment), získat token
        console.log('Getting Clerk session token...');
        
        // Krátké čekání pro jistotu (session by měla být již stabilní)
        let token = await getClerkToken(3, 500); // 3 pokusy × 500ms = max 1.5 sekundy
        
        if (!token) {
            throw new Error('Could not get authentication token. Please try again.');
        }
        
        console.log('Got Clerk token, creating subscription...');
        
        // 1. Vytvořit předplatné
        const subscriptionResponse = await fetch(`${getSupabaseUrl()}/functions/v1/subscription`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getSupabaseAnonKey()}`,
                'x-clerk-token': token,
            },
            body: JSON.stringify({ 
                action: 'create',
                data: {
                    planType: 'yearly',
                    // Jazyk uživatele pro fakturu - použít getLocale() funkci z i18n modulu
                    locale: window.i18n?.getLocale?.() || 'en',
                    // Země pro DPH účely (aktualizováno z geolokace výše)
                    country: userLocation?.countryCode || 'CZ'
                }
            })
        });

        if (!subscriptionResponse.ok) {
            const errorText = await subscriptionResponse.text();
            console.error('Subscription creation failed:', subscriptionResponse.status, errorText);
            throw new Error('Failed to create subscription');
        }

        const subResult = await subscriptionResponse.json();
        console.log('Subscription created:', subResult.subscription?.id);

        // 2. Vytvořit platbu v GP WebPay (použít stejný token)
        const paymentResponse = await fetch(`${getSupabaseUrl()}/functions/v1/gpwebpay`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getSupabaseAnonKey()}`,
                'x-clerk-token': token,
            },
            body: JSON.stringify({ 
                action: 'create',
                data: {
                    subscriptionId: subResult.subscription.id,
                    payMethod: payMethod || undefined
                }
            })
        });

        if (!paymentResponse.ok) {
            const paymentErrorData = await paymentResponse.json().catch(() => ({}));
            console.error('Payment creation failed:', paymentResponse.status, JSON.stringify(paymentErrorData));
            throw new Error(`Failed to create payment: ${paymentErrorData.details || paymentErrorData.error || 'Unknown error'}`);
        }

        const payResult = await paymentResponse.json();
        console.log('Payment created, redirect URL:', payResult.redirectUrl);

        // 3. Přesměrovat na platební bránu
        if (payResult.redirectUrl) {
            // Uložit clerk_id před redirectem - pro případ, že session vyprší
            if (window.Clerk?.user?.id) {
                localStorage.setItem('liquimixer_pending_payment_clerk_id', window.Clerk.user.id);
            }
            window.location.href = payResult.redirectUrl;
        } else {
            throw new Error('No redirect URL');
        }

    } catch (error) {
        console.error('Payment processing error:', error);
        showSubscriptionError(t('subscription.error_generic', 'An error occurred while processing payment. Please try again.'));
        const allPayBtns = document.querySelectorAll('.payment-method-btn');
        allPayBtns.forEach(btn => { btn.disabled = false; });
    }
}


// Uložit souhlas s obchodními podmínkami
async function saveTermsAcceptance() {
    try {
        // Uložit do DB přes Edge Function nebo přímo
        console.log('Terms acceptance saved');
    } catch (error) {
        console.error('Error saving terms acceptance:', error);
    }
}

// Zobrazit chybu předplatného
function showSubscriptionError(message) {
    const errorDiv = document.getElementById('subscriptionError');
    if (errorDiv) {
        errorDiv.textContent = message;
        errorDiv.classList.remove('hidden');
    }
}

// Aktualizovat UI stavu předplatného v profilu
function updateSubscriptionStatusUI(data) {
    const container = document.getElementById('subscriptionStatus');
    if (!container) return;

    if (data.valid) {
        const expiresDate = new Date(data.expiresAt).toLocaleDateString(
            window.i18n?.currentLocale === 'cs' ? 'cs-CZ' : 
            window.i18n?.currentLocale === 'sk' ? 'sk-SK' : 'en-GB'
        );

        container.className = 'subscription-status-section subscription-status-active';
        container.innerHTML = `
            <div class="subscription-status-title">${t('subscription.status_active', 'Aktivní předplatné')}</div>
            <div class="subscription-expires">
                ${t('subscription.expires_at', 'Platné do:')} ${expiresDate}<br>
                ${t('subscription.days_left', 'Zbývá dní:')} ${data.daysLeft}
            </div>
            ${data.needsRenewal ? `
                <button class="neon-button subscription-renew-btn" onclick="renewSubscription()">
                    <span>${t('subscription.renew_button', 'Obnovit předplatné')}</span>
                    <div class="button-glow"></div>
                </button>
            ` : ''}
        `;
    } else {
        container.className = 'subscription-status-section subscription-status-none';
        container.innerHTML = `
            <div class="subscription-status-title">${t('subscription.status_none', 'Nemáte aktivní předplatné')}</div>
            <button class="neon-button subscription-renew-btn" onclick="showSubscriptionModal()">
                <span>${t('subscription.activate_button', 'Aktivovat předplatné')}</span>
                <div class="button-glow"></div>
            </button>
        `;
    }
}

// Obnovit předplatné
async function renewSubscription() {
    showSubscriptionModal();
}

// Zobrazit modal manuálu
function showManualModal() {
    const modal = document.getElementById('manualModal');
    if (modal) {
        modal.classList.remove('hidden');
    }
}

// Skrýt modal manuálu
function hideManualModal() {
    const modal = document.getElementById('manualModal');
    if (modal) {
        modal.classList.add('hidden');
    }
}

// Handler pro backdrop click - manual modal
function handleManualModalBackdropClick(event) {
    if (event.target === event.currentTarget) {
        hideManualModal();
    }
}

// Zobrazit modal obchodních podmínek
function showTermsModal() {
    const modal = document.getElementById('termsModal');
    if (modal) {
        modal.classList.remove('hidden');
    }
}

// Skrýt modal obchodních podmínek
function hideTermsModal() {
    const modal = document.getElementById('termsModal');
    if (modal) {
        modal.classList.add('hidden');
    }
}

// Handler pro backdrop click - terms modal
function handleTermsModalBackdropClick(event) {
    if (event.target === event.currentTarget) {
        hideTermsModal();
    }
}

// ============================================
// PŘIPOMÍNKY ZRÁNÍ - UI FUNKCE
// ============================================

// Toggle zobrazení polí pro připomínku
function toggleReminderFields() {
    const checkbox = document.getElementById('enableReminder');
    const fields = document.getElementById('reminderFields');
    if (checkbox && fields) {
        if (checkbox.checked) {
            fields.classList.remove('hidden');
            initReminderDates();
        } else {
            fields.classList.add('hidden');
        }
    }
}

// Inicializace datumů pro připomínku
function initReminderDates() {
    const mixDateInput = document.getElementById('mixDate');
    const reminderDateInput = document.getElementById('reminderDate');
    if (!mixDateInput || !reminderDateInput) return;
    const today = new Date();
    const todayStr = formatDateForInput(today);
    mixDateInput.value = todayStr;
    updateReminderDate();
}

// Formátovat datum pro input type="date"
function formatDateForInput(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// Inicializovat date picker pro všechny date inputy
function initDatePickers() {
    const dateInputs = document.querySelectorAll('input[type="date"].date-picker-input');
    dateInputs.forEach(input => {
        input.removeAttribute('readonly');
        input.addEventListener('click', function(e) {
            if (typeof this.showPicker === 'function') {
                try { this.showPicker(); } catch (err) { this.focus(); }
            }
        });
    });
}

// Inicializovat date pickery při načtení stránky
document.addEventListener('DOMContentLoaded', initDatePickers);

// Aktualizovat datum připomínky na základě data míchání a typu příchutě
function updateReminderDate() {
    const mixDateInput = document.getElementById('mixDate');
    const reminderDateInput = document.getElementById('reminderDate');
    const infoText = document.getElementById('reminderInfoText');
    if (!mixDateInput || !reminderDateInput || !mixDateInput.value) return;

    const mixDate = new Date(mixDateInput.value);
    let maxSteepingDays = 7;

    if (currentRecipeData) {
        const steepFromRecipe = getMaxSteepingDaysFromRecipe(currentRecipeData);
        if (steepFromRecipe > 0) {
            maxSteepingDays = steepFromRecipe;
        }
    }

    const maturityDate = new Date(mixDate);
    maturityDate.setDate(maturityDate.getDate() + maxSteepingDays);
    reminderDateInput.value = formatDateForInput(maturityDate);

    if (infoText) {
        if (maxSteepingDays === 0) {
            infoText.textContent = t('save_recipe.reminder_no_steeping', 'This flavor does not require steeping.');
        } else {
            const daysText = maxSteepingDays === 1 ? t('common.day', 'den') : 
                (maxSteepingDays >= 2 && maxSteepingDays <= 4) ? t('common.days_few', 'dny') : t('common.days', 'dní');
            let text = t('save_recipe.reminder_calculated', `Doporučená doba zrání: ${maxSteepingDays} ${daysText}. Datum můžete upravit.`);
            text = text.replace('{days}', maxSteepingDays.toString()).replace('{daysUnit}', daysText);
            infoText.textContent = text;
        }
    }
}

// Reset polí pro připomínku
function resetReminderFields() {
    const checkbox = document.getElementById('enableReminder');
    const fields = document.getElementById('reminderFields');
    const mixDateInput = document.getElementById('mixDate');
    const reminderDateInput = document.getElementById('reminderDate');
    const noteInput = document.getElementById('saveRecipeReminderNote');
    if (checkbox) checkbox.checked = false;
    if (fields) fields.classList.add('hidden');
    if (mixDateInput) mixDateInput.value = '';
    if (reminderDateInput) reminderDateInput.value = '';
    if (noteInput) noteInput.value = '';
}

// Inicializovat připomínku jako zapnutou s dnešním datem
function initReminderFieldsEnabled() {
    const checkbox = document.getElementById('enableReminder');
    const fields = document.getElementById('reminderFields');
    const mixDateInput = document.getElementById('mixDate');
    if (checkbox) checkbox.checked = true;
    if (fields) fields.classList.remove('hidden');
    if (mixDateInput) {
        mixDateInput.value = formatDateForInput(new Date());
        initDatePickerElement(mixDateInput);
    }
    const reminderDateInput = document.getElementById('reminderDate');
    if (reminderDateInput) initDatePickerElement(reminderDateInput);
    updateReminderDate();
}

// Inicializovat jeden date picker element
function initDatePickerElement(input) {
    if (!input) return input;
    input.removeAttribute('readonly');
    if (input.dataset.datePickerInit) return input;
    input.dataset.datePickerInit = 'true';
    input.addEventListener('click', function(e) {
        if (typeof this.showPicker === 'function') {
            try { this.showPicker(); } catch (err) { this.focus(); }
        }
    });
    return input;
}

// Získat data připomínky z formuláře
function getReminderDataFromForm() {
    const checkbox = document.getElementById('enableReminder');
    if (!checkbox || !checkbox.checked) return null;
    const mixDateInput = document.getElementById('mixDate');
    const reminderDateInput = document.getElementById('reminderDate');
    if (!mixDateInput || !reminderDateInput || !mixDateInput.value || !reminderDateInput.value) return null;

    let flavorType = 'fruit';
    let flavorName = '';
    let maxSteepingDays = 7; // Default steeping days
    
    if (currentRecipeData) {
        // Použít centrální funkci pro steep days (respektuje konkrétní příchutě z DB)
        const steepFromRecipe = getMaxSteepingDaysFromRecipe(currentRecipeData);
        if (steepFromRecipe > 0) {
            maxSteepingDays = steepFromRecipe;
        }
        
        if (currentRecipeData.formType === 'liquidpro' && currentRecipeData.flavors) {
            // Najít flavor type s nejdelším zráním pro název
            let maxSteeping = 0;
            for (const flavor of currentRecipeData.flavors) {
                const days = (flavor.steepDays !== undefined && flavor.steepDays !== null) ? flavor.steepDays : 
                    (flavor.type && flavorDatabase[flavor.type] ? flavorDatabase[flavor.type].steepingDays : 0);
                if (days > maxSteeping) {
                    maxSteeping = days;
                    flavorType = flavor.type || 'fruit';
                }
            }
            flavorName = currentRecipeData.flavors
                .filter(f => f.type && f.type !== 'none')
                .map(f => f.flavorName || getFlavorName(f.type))
                .join(', ');
        } else if (currentRecipeData.flavorType && currentRecipeData.flavorType !== 'none') {
            flavorType = currentRecipeData.flavorType;
            flavorName = currentRecipeData.specificFlavorName || getFlavorName(flavorType);
        } else if (currentRecipeData.formType === 'shisha' && currentRecipeData.flavors) {
            // Shisha recepty
            let maxSteeping = 0;
            for (const flavor of currentRecipeData.flavors) {
                const days = (flavor.steepDays !== undefined && flavor.steepDays !== null) ? flavor.steepDays :
                    (flavor.type && shishaFlavorDatabase[flavor.type] ? shishaFlavorDatabase[flavor.type].steepingDays : 0);
                if (days > maxSteeping) {
                    maxSteeping = days;
                    flavorType = flavor.type || 'fruit';
                }
            }
            flavorName = currentRecipeData.flavors
                .filter(f => f.type && f.type !== 'none')
                .map(f => {
                    if (f.flavorName) return f.flavorName;
                    const fd = shishaFlavorDatabase[f.type];
                    return fd ? t(`shisha.flavor_${f.type}`, fd.name) : f.type;
                })
                .join(', ');
        }
    }

    const noteInput = document.getElementById('saveRecipeReminderNote');
    let note = noteInput ? noteInput.value.trim() : '';
    
    // Pokud uživatel nezadal vlastní poznámku, automaticky přidat informaci o počtu dní zrání
    if (!note && maxSteepingDays > 0) {
        const daysText = maxSteepingDays === 1 ? t('common.day', 'den') : 
            (maxSteepingDays >= 2 && maxSteepingDays <= 4) ? t('common.days_few', 'dny') : t('common.days', 'dní');
        note = t('reminder.auto_note_steeping', 'Zrání {days} {daysUnit}')
            .replace('{days}', maxSteepingDays.toString())
            .replace('{daysUnit}', daysText);
    }

    return {
        mixed_at: mixDateInput.value,
        remind_at: reminderDateInput.value,
        remind_time: '16:30',
        flavor_type: flavorType,
        flavor_name: flavorName,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Europe/Prague',
        note: note || null
    };
}

// SVG ikony pro připomínky (neonově růžová)
const reminderEditIcon = '<svg class="reminder-icon" viewBox="0 0 24 24" fill="none" stroke="#ff00ff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>';
const reminderDeleteIcon = '<svg class="reminder-icon" viewBox="0 0 24 24" fill="none" stroke="#ff00ff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>';

// Vyžádat povolení notifikací s přeloženým promptem
async function requestNotificationPermissionWithPrompt() {
    if (!('Notification' in window)) {
        console.warn('Notifications not supported');
        return false;
    }
    
    if (Notification.permission === 'granted') {
        return true;
    }
    
    if (Notification.permission === 'denied') {
        alert(t('notification.denied', 'Notifications blocked. Enable them in browser settings.'));
        return false;
    }
    
    // Zobrazit přeložený confirm dialog
    const message = t('notification.permission_prompt', 
        'Chcete dostávat upozornění, když bude váš liquid vyzrálý?\n\nPo povolení vám pošleme připomínku v den, kdy bude liquid připraven.');
    
    const userWants = confirm(message);
    if (!userWants) {
        return false;
    }
    
    try {
        const permission = await Notification.requestPermission();
        return permission === 'granted';
    } catch (error) {
        console.error('Error requesting notification permission:', error);
        return false;
    }
}

// Uložit všechny připomínky pro aktuální recept
let allRecipeReminders = [];

// Načíst a zobrazit připomínky pro recept
async function loadRecipeReminders(recipeId, showAll = false) {
    if (!window.Clerk || !window.Clerk.user) {
        console.log('loadRecipeReminders: Clerk not ready');
        return;
    }
    
    // Normalize recipeId - remove any HTML escaping if present
    const normalizedId = recipeId.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#x27;/g, "'");
    
    const listContainer = document.getElementById(`remindersList-${normalizedId}`);
    if (!listContainer) {
        console.log('loadRecipeReminders: Container not found for ID:', normalizedId);
        return;
    }

    try {
        const reminders = await window.LiquiMixerDB.getRecipeReminders(window.Clerk.user.id, recipeId);
        if (!reminders || reminders.length === 0) {
            listContainer.innerHTML = `<div class="no-reminders">${t('recipe_detail.no_reminders', 'No reminders. Click button below to add.')}</div>`;
            return;
        }

        // Seřadit podle data připomínky (od nejnovější po nejstarší - nejvyšší datum nahoře)
        reminders.sort((a, b) => new Date(b.remind_at) - new Date(a.remind_at));
        allRecipeReminders = reminders;
        
        // Filtrovat aktivní připomínky (nezobrazovat spotřebované)
        const activeReminders = reminders.filter(r => r.consumed_at == null);

        const displayCount = showAll ? activeReminders.length : Math.min(3, activeReminders.length);
        const displayReminders = activeReminders.slice(0, displayCount);
        let html = displayReminders.map(reminder => renderReminderItem(reminder, recipeId)).join('');

        if (!showAll && activeReminders.length > 3) {
            const safeRecipeId = escapeHtml(recipeId);
            html += `<button type="button" class="show-all-reminders-btn" data-recipe-id="${safeRecipeId}" data-show-all="true" onclick="loadRecipeReminders(this.dataset.recipeId, true)">${t('recipe_detail.show_all_reminders', 'Show all')} (${activeReminders.length})</button>`;
        } else if (showAll && activeReminders.length > 3) {
            const safeRecipeId = escapeHtml(recipeId);
            html += `<button type="button" class="show-all-reminders-btn" data-recipe-id="${safeRecipeId}" data-show-all="false" onclick="loadRecipeReminders(this.dataset.recipeId, false)">${t('recipe_detail.show_less', 'Zobrazit méně')}</button>`;
        }
        
        // Pokud nejsou žádné aktivní připomínky, zobrazit zprávu
        if (activeReminders.length === 0) {
            listContainer.innerHTML = `<div class="no-reminders">${t('recipe_detail.no_reminders', 'No reminders. Click button below to add.')}</div>`;
            return;
        }

        listContainer.innerHTML = html;
    } catch (error) {
        console.error('Error loading reminders:', error);
        listContainer.innerHTML = `<div class="no-reminders">${t('recipe_detail.reminders_error', 'Chyba při načítání připomínek.')}</div>`;
    }
}

// Renderovat jednu položku připomínky
function renderReminderItem(reminder, recipeId) {
    const mixedDate = new Date(reminder.mixed_at).toLocaleDateString();
    const remindDate = new Date(reminder.remind_at).toLocaleDateString();
    
    // Kontrola vyzrálosti - remind_at <= dnes a status je pending nebo matured
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const reminderDate = new Date(reminder.remind_at);
    reminderDate.setHours(0, 0, 0, 0);
    const isMatured = (reminder.status === 'pending' || reminder.status === 'matured') && reminderDate <= today;
    
    // Stock tracking
    const stockPercent = reminder.stock_percent ?? 100;
    const isConsumed = reminder.consumed_at != null;
    
    // Skrýt spotřebované připomínky
    if (isConsumed) return '';
    
    // Barva podle stavu zásoby
    const stockColor = stockPercent >= 50 ? 'var(--neon-green)' : 
                       stockPercent > 20 ? '#ffcc00' : '#ff4444';
    const lowClass = stockPercent <= 20 ? 'low' : '';
    // Barva textu procent: černá při >=50%, bílá při <50%
    const percentTextClass = stockPercent >= 50 ? '' : 'low-text';
    
    // Sestavit CSS třídy
    let statusClass = '';
    if (reminder.status === 'cancelled') {
        statusClass = 'cancelled';
    } else if (isMatured) {
        statusClass = 'matured';
    }

    let statusBadge = '';
    if (reminder.status === 'cancelled') {
        statusBadge = `<span class="reminder-status-badge cancelled">✕ ${t('reminder.cancelled', 'Cancelled')}</span>`;
    } else if (isMatured) {
        statusBadge = `<span class="reminder-status-badge matured">✓ ${t('reminder.matured', 'Matured')}</span>`;
    }

    return `
        <div class="reminder-item ${statusClass}" data-reminder-id="${reminder.id}">
            <div class="reminder-dates clickable" onclick="showViewReminderModal('${reminder.id}')">
                <div class="reminder-mixed-date">${t('reminder.mixed_on', 'Namícháno')}: ${mixedDate}</div>
                <div class="reminder-remind-date">${t('reminder.reminder_on', 'Připomínka')}: ${remindDate} ${statusBadge}</div>
            </div>
            
            <!-- Wrapper pro stock bar + akční tlačítka (mobilní 2-řádkový layout) -->
            <div class="reminder-controls">
                <!-- Stock bar - bateriový styl s pořadím: mínus-baterie-plus -->
                <div class="reminder-stock">
                    <button type="button" class="stock-btn minus" onclick="event.stopPropagation(); updateReminderStockUI('${reminder.id}', '${recipeId}', -10)" title="-10%">−</button>
                    <div class="stock-battery">
                        <div class="battery-body">
                            <div class="battery-level ${lowClass}" 
                                 id="stock-bar-${reminder.id}"
                                 style="width: ${stockPercent}%; background: ${stockColor};">
                            </div>
                            <span class="battery-percent ${percentTextClass}">${stockPercent}%</span>
                        </div>
                        <div class="battery-tip"></div>
                    </div>
                    <button type="button" class="stock-btn plus" onclick="event.stopPropagation(); updateReminderStockUI('${reminder.id}', '${recipeId}', +10)" title="+10%">+</button>
                </div>
                
                ${(reminder.status === 'pending' || reminder.status === 'matured') ? `
                    <div class="reminder-actions">
                        <button type="button" class="reminder-btn edit" onclick="event.stopPropagation(); showEditReminderModal('${reminder.id}', '${recipeId}')">${reminderEditIcon}</button>
                        <button type="button" class="reminder-btn delete" onclick="event.stopPropagation(); deleteReminderConfirm('${reminder.id}', '${recipeId}')">${reminderDeleteIcon}</button>
                    </div>
                ` : ''}
            </div>
        </div>
    `;
}

// =============================================
// KONTROLA VYZRÁLÝCH LIQUIDŮ (IN-APP NOTIFIKACE)
// =============================================

// Konstanty pro localStorage klíče
const MATURED_DISMISS_COUNT_PREFIX = 'liquimixer_matured_dismiss_count_';
const MATURED_DISMISSED_TODAY_PREFIX = 'liquimixer_matured_dismissed_today_';

// Zkontrolovat zda byla konkrétní připomínka dnes již zavřena
function wasReminderDismissedToday(reminderId) {
    const dismissedDate = localStorage.getItem(MATURED_DISMISSED_TODAY_PREFIX + reminderId);
    if (!dismissedDate) return false;
    
    const today = new Date().toISOString().split('T')[0];
    return dismissedDate === today;
}

// Označit připomínku jako zavřenou dnes
function setReminderDismissedToday(reminderId) {
    const today = new Date().toISOString().split('T')[0];
    localStorage.setItem(MATURED_DISMISSED_TODAY_PREFIX + reminderId, today);
}

// Získat počet zavření pro konkrétní připomínku (celkový - pro permanentní skrytí po 3x)
function getMaturedDismissCount(reminderId) {
    const count = localStorage.getItem(MATURED_DISMISS_COUNT_PREFIX + reminderId);
    return count ? parseInt(count, 10) : 0;
}

// Inkrementovat počet zavření pro připomínku
function incrementMaturedDismissCount(reminderId) {
    const count = getMaturedDismissCount(reminderId);
    localStorage.setItem(MATURED_DISMISS_COUNT_PREFIX + reminderId, (count + 1).toString());
}

// Zavřít notifikaci a uložit stav do localStorage
function dismissMaturedNotification(reminderIds) {
    // Pro každou připomínku:
    // 1. Označit jako zavřenou dnes (nezobrazí se znovu dnes)
    // 2. Inkrementovat celkové počítadlo (po 3x se nezobrazí vůbec)
    if (reminderIds && Array.isArray(reminderIds)) {
        reminderIds.forEach(id => {
            setReminderDismissedToday(id);
            incrementMaturedDismissCount(id);
        });
    }
    
    // Odstranit notifikaci z DOM
    const notification = document.querySelector('.matured-notification');
    if (notification) {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }
}

// Zkontrolovat vyzrálé liquidy a zobrazit in-app notifikaci
async function checkMaturedReminders() {
    if (!window.Clerk?.user || !window.LiquiMixerDB) return;
    
    try {
        const clerkId = window.Clerk.user.id;
        const reminders = await window.LiquiMixerDB.getUserReminders(clerkId);
        
        if (!reminders || reminders.length === 0) return;
        
        // Ensure FCM token is registered if user has any active reminders
        const activeReminders = reminders.filter(r => 
            (r.status === 'pending' || r.status === 'matured') && r.consumed_at == null && (r.stock_percent ?? 100) > 0
        );
        if (activeReminders.length > 0 && window.fcm) {
            const currentToken = window.fcm.getCurrentToken();
            if (!currentToken && 'Notification' in window) {
                console.log('[FCM] User has', activeReminders.length, 'active reminders but no FCM token. Permission:', Notification.permission);
                if (Notification.permission === 'granted') {
                    // Permission granted but token missing — register now
                    try {
                        await window.fcm.getToken();
                        console.log('[FCM] Token registered for push notifications');
                    } catch (e) {
                        console.warn('[FCM] Failed to register token:', e);
                    }
                } else if (Notification.permission === 'default') {
                    // Never asked — prompt user
                    const granted = await requestNotificationPermissionWithPrompt();
                    if (granted) {
                        try {
                            await window.fcm.getToken();
                            console.log('[FCM] Token registered after permission prompt');
                        } catch (e) {
                            console.warn('[FCM] Failed to register token after prompt:', e);
                        }
                    }
                }
            }
        }
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        // Najít vyzrálé liquidy (pending a remind_at <= dnes)
        // Filtrovat ty, které:
        // 1. Jsou spotřebované (consumed_at != null nebo stock_percent <= 0)
        // 2. Byly dnes již zavřeny (nezobrazí se znovu dnes)
        // 3. Byly zavřeny 3x nebo více (nezobrazí se vůbec)
        const maturedReminders = reminders.filter(r => {
            if (r.status !== 'pending' && r.status !== 'matured') return false;
            
            // Přeskočit spotřebované připomínky
            if (r.consumed_at != null) return false;
            const stockPercent = r.stock_percent ?? 100;
            if (stockPercent <= 0) return false;
            
            const remindDate = new Date(r.remind_at);
            remindDate.setHours(0, 0, 0, 0);
            if (remindDate > today) return false;
            
            // Přeskočit pokud byla připomínka dnes již zavřena
            if (wasReminderDismissedToday(r.id)) {
                console.log(`Reminder ${r.id} was dismissed today, skipping`);
                return false;
            }
            
            // Přeskočit pokud má připomínka 3+ celkových zavření
            const dismissCount = getMaturedDismissCount(r.id);
            if (dismissCount >= 3) {
                console.log(`Reminder ${r.id} dismissed ${dismissCount} times total, skipping permanently`);
                return false;
            }
            
            return true;
        });
        
        if (maturedReminders.length > 0) {
            console.log('Found matured reminders:', maturedReminders.length);
            showMaturedLiquidsNotification(maturedReminders);
        }
    } catch (error) {
        console.error('Error checking matured reminders:', error);
    }
}

// Zobrazit notifikaci o vyzrálých liquidech
function showMaturedLiquidsNotification(maturedReminders) {
    if (!maturedReminders || maturedReminders.length === 0) return;
    
    // Získat překlady
    const title = t('reminder.matured_title', 'Your liquids are ready!');
    const singleLiquid = t('reminder.matured_single', 'Your liquid "{name}" is matured and ready to use.');
    const multipleLiquids = t('reminder.matured_multiple', '{count} liquids are matured and ready to use.');
    const viewButton = t('reminder.view_recipes', 'Zobrazit recepty');
    const dismissButton = t('common.dismiss', 'Zavřít');
    
    // Sestavit zprávu
    let message;
    if (maturedReminders.length === 1) {
        const name = maturedReminders[0].recipe_name || maturedReminders[0].flavor_name || 'Liquid';
        message = singleLiquid.replace('{name}', name);
    } else {
        message = multipleLiquids.replace('{count}', maturedReminders.length.toString());
    }
    
    // Uložit ID připomínek pro dismiss handler
    const reminderIds = maturedReminders.map(r => r.id);
    window._currentMaturedReminderIds = reminderIds;
    
    // Vytvořit toast notifikaci s akcemi
    const existing = document.querySelector('.matured-notification');
    if (existing) existing.remove();
    
    const notification = document.createElement('div');
    notification.className = 'toast-notification toast-success matured-notification';
    notification.innerHTML = `
        <div class="matured-notification-content">
            <div class="matured-notification-icon">🧪</div>
            <div class="matured-notification-text">
                <strong>${title}</strong>
                <p>${message}</p>
            </div>
        </div>
        <div class="matured-notification-actions">
            <button class="matured-btn-view" onclick="goToSavedRecipes(); this.closest('.matured-notification').remove();">${viewButton}</button>
            <button class="matured-btn-dismiss" onclick="dismissMaturedNotification(window._currentMaturedReminderIds);">${dismissButton}</button>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Animace
    setTimeout(() => notification.classList.add('show'), 10);
    
    // Auto-dismiss po 30 sekundách (bez inkrementace počítadla - pouze skrytí)
    setTimeout(() => {
        if (notification.parentNode) {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }
    }, 30000);
}

// Přejít na uložené recepty (z notifikace o vyzrálých liquidech)
function goToSavedRecipes() {
    // Volat showMyRecipes() pro správné načtení receptů
    showMyRecipes();
}

// Aktuální recept pro přidání připomínky
let currentReminderRecipeId = null;
let currentReminderFlavorType = 'fruit';
let currentReminderFlavorName = '';
let currentReminderSteepingDays = 7;
let editingReminderId = null;

function showAddReminderModal(recipeId) {
    if (!window.currentViewingRecipe) return;
    currentReminderRecipeId = recipeId;
    editingReminderId = null;

    const recipe = window.currentViewingRecipe;
    const data = recipe.recipe_data || {};
    currentReminderSteepingDays = 7;
    currentReminderFlavorType = 'fruit';
    currentReminderFlavorName = '';

    // Použít centrální funkci pro steep days (respektuje konkrétní příchutě z DB)
    const steepFromRecipe = getMaxSteepingDaysFromRecipe(data);
    if (steepFromRecipe > 0) {
        currentReminderSteepingDays = steepFromRecipe;
    }

    if (data.formType === 'liquidpro' && data.flavors) {
        // Liquid PRO - více příchutí — najít flavor type pro název
        let maxSteeping = 0;
        for (const flavor of data.flavors) {
            const days = (flavor.steepDays !== undefined && flavor.steepDays !== null) ? flavor.steepDays :
                (flavor.type && flavorDatabase[flavor.type] ? flavorDatabase[flavor.type].steepingDays : 0);
            if (days > maxSteeping) {
                maxSteeping = days;
                currentReminderFlavorType = flavor.type || 'fruit';
            }
        }
        currentReminderFlavorName = data.flavors.filter(f => f.type && f.type !== 'none').map(f => f.flavorName || getFlavorName(f.type)).join(', ');
    } else if (data.flavorType && data.flavorType !== 'none') {
        currentReminderFlavorType = data.flavorType;
        currentReminderFlavorName = data.specificFlavorName || getFlavorName(currentReminderFlavorType);
    } else if (data.formType === 'shisha' && data.flavors) {
        let maxSteeping = 0;
        for (const flavor of data.flavors) {
            const days = (flavor.steepDays !== undefined && flavor.steepDays !== null) ? flavor.steepDays :
                (flavor.type && shishaFlavorDatabase[flavor.type] ? shishaFlavorDatabase[flavor.type].steepingDays : 0);
            if (days > maxSteeping) {
                maxSteeping = days;
                currentReminderFlavorType = flavor.type || 'fruit';
            }
        }
        currentReminderFlavorName = data.flavors.filter(f => f.type && f.type !== 'none').map(f => {
            if (f.flavorName) return f.flavorName;
            const fd = shishaFlavorDatabase[f.type];
            return fd ? t(`shisha.flavor_${f.type}`, fd.name) : f.type;
        }).join(', ');
    } else if (data.ingredients && Array.isArray(data.ingredients)) {
        // Starší formát - hledáme flavorType v ingredients
        for (const ing of data.ingredients) {
            if (ing.flavorType && ing.flavorType !== 'none') {
                const flavorData = flavorDatabase[ing.flavorType];
                if (flavorData && flavorData.steepingDays > currentReminderSteepingDays) {
                    currentReminderSteepingDays = flavorData.steepingDays;
                    currentReminderFlavorType = ing.flavorType;
                    currentReminderFlavorName = getFlavorName(ing.flavorType);
                }
            }
        }
    }

    const modal = document.getElementById('addReminderModal');
    if (!modal) { console.error('Add reminder modal not found'); return; }

    const titleEl = modal.querySelector('.menu-title');
    if (titleEl) titleEl.textContent = t('reminder.add_title', 'Přidat míchání');

    const mixDateInput = document.getElementById('reminderMixDate');
    if (mixDateInput) { mixDateInput.value = formatDateForInput(new Date()); initDatePickerElement(mixDateInput); }

    const remindDateInput = document.getElementById('reminderRemindDate');
    if (remindDateInput) initDatePickerElement(remindDateInput);

    // Vyčistit poznámku pro novou připomínku
    const noteInput = document.getElementById('reminderNote');
    if (noteInput) noteInput.value = '';

    updateReminderModalDate();
    modal.classList.remove('hidden');
}

function showEditReminderModal(reminderId, recipeId) {
    const reminder = allRecipeReminders.find(r => r.id === reminderId);
    if (!reminder) { console.error('Reminder not found:', reminderId); return; }

    currentReminderRecipeId = recipeId;
    editingReminderId = reminderId;

    const modal = document.getElementById('addReminderModal');
    if (!modal) return;

    const titleEl = modal.querySelector('.menu-title');
    if (titleEl) titleEl.textContent = t('reminder.edit_title', 'Upravit připomínku');

    const mixDateInput = document.getElementById('reminderMixDate');
    const remindDateInput = document.getElementById('reminderRemindDate');
    const noteInput = document.getElementById('reminderNote');
    if (mixDateInput) { mixDateInput.value = reminder.mixed_at; initDatePickerElement(mixDateInput); }
    if (remindDateInput) { remindDateInput.value = reminder.remind_at; initDatePickerElement(remindDateInput); }
    if (noteInput) noteInput.value = reminder.note || '';

    modal.classList.remove('hidden');
}

function hideAddReminderModal() {
    const modal = document.getElementById('addReminderModal');
    if (modal) modal.classList.add('hidden');
    currentReminderRecipeId = null;
    editingReminderId = null;
}

function updateReminderModalDate() {
    const mixDateInput = document.getElementById('reminderMixDate');
    const remindDateInput = document.getElementById('reminderRemindDate');
    const infoText = document.getElementById('reminderModalInfo');
    if (!mixDateInput || !remindDateInput || !mixDateInput.value) return;

    const mixDate = new Date(mixDateInput.value);
    const maturityDate = new Date(mixDate);
    maturityDate.setDate(maturityDate.getDate() + currentReminderSteepingDays);
    remindDateInput.value = formatDateForInput(maturityDate);

    if (infoText) {
        const daysText = currentReminderSteepingDays === 1 ? t('common.day', 'den') : 
            (currentReminderSteepingDays >= 2 && currentReminderSteepingDays <= 4) ? t('common.days_few', 'dny') : t('common.days', 'dní');
        let text = t('save_recipe.reminder_calculated', `Doporučená doba zrání: ${currentReminderSteepingDays} ${daysText}. Datum můžete upravit.`);
        text = text.replace('{days}', currentReminderSteepingDays.toString()).replace('{daysUnit}', daysText);
        infoText.textContent = text;
    }
}

async function saveReminderFromModal(event) {
    if (event) event.preventDefault();
    if (!window.Clerk || !window.Clerk.user) return false;

    const mixDateInput = document.getElementById('reminderMixDate');
    const remindDateInput = document.getElementById('reminderRemindDate');
    if (!mixDateInput || !remindDateInput || !mixDateInput.value || !remindDateInput.value) {
        alert(t('reminder.fill_dates', 'Vyplňte prosím obě data.'));
        return false;
    }

    const mixDate = mixDateInput.value;
    const remindDate = remindDateInput.value;
    const noteInput = document.getElementById('reminderNote');
    const note = noteInput ? noteInput.value.trim() : '';

    if (isNaN(new Date(mixDate).getTime()) || isNaN(new Date(remindDate).getTime())) {
        alert(t('reminder.invalid_date', 'Neplatný formát data.'));
        return false;
    }

    try {
        if (editingReminderId) {
            const updated = await window.LiquiMixerDB.updateReminder(window.Clerk.user.id, editingReminderId, { mixed_at: mixDate, remind_at: remindDate, note: note });
            if (updated) { alert(t('reminder.updated', 'Připomínka byla upravena!')); }
            else { alert(t('reminder.update_error', 'Chyba při úpravě připomínky.')); return false; }
        } else {
            const recipe = window.currentViewingRecipe;
            await saveNewReminder(currentReminderRecipeId, mixDate, remindDate, currentReminderFlavorType, currentReminderFlavorName, recipe?.name || '', note);
        }
        // Uložit recipeId před zavřením modálu (hideAddReminderModal nastaví currentReminderRecipeId na null)
        const recipeIdToRefresh = currentReminderRecipeId;
        
        hideAddReminderModal();
        
        // Obnovit seznam připomínek
        if (recipeIdToRefresh) loadRecipeReminders(recipeIdToRefresh);
        
        // Po uložení připomínky aktualizovat maturedRecipeIds a zkontrolovat notifikace
        await loadMaturedRecipeIds();
        if (currentPageId === 'my-recipes') filterRecipes();
        // Zkontrolovat zda nová připomínka je vyzrálá a zobrazit notifikaci
        checkMaturedReminders();
    } catch (error) {
        console.error('Error saving reminder:', error);
        alert(t('reminder.save_error', 'Chyba při ukládání připomínky.'));
    }

    return false;
}

async function saveNewReminder(recipeId, mixDate, remindDate, flavorType, flavorName, recipeName, note = '') {
    if (!window.Clerk || !window.Clerk.user) return false;
    const reminderData = {
        recipe_id: recipeId,
        mixed_at: mixDate,
        remind_at: remindDate,
        remind_time: '16:30',
        flavor_type: flavorType,
        flavor_name: flavorName,
        recipe_name: recipeName,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Europe/Prague',
        note: note || null
    };
    try {
        const saved = await window.LiquiMixerDB.saveReminder(window.Clerk.user.id, reminderData);
        if (saved) { alert(t('reminder.saved', 'Reminder saved!')); return true; }
        return false;
    } catch (error) {
        console.error('Error saving reminder:', error);
        return false;
    }
}

async function deleteReminderConfirm(reminderId, recipeId) {
    if (!window.Clerk || !window.Clerk.user) return;
    if (!confirm(t('reminder.delete_confirm', 'Opravdu chcete smazat tuto připomínku?'))) return;
    try {
        const deleted = await window.LiquiMixerDB.deleteReminder(window.Clerk.user.id, reminderId);
        if (deleted) {
            loadRecipeReminders(recipeId);
            await loadMaturedRecipeIds();
            if (currentPageId === 'my-recipes') filterRecipes();
        }
        else { alert(t('reminder.delete_error', 'Chyba při mazání připomínky.')); }
    } catch (error) {
        console.error('Error deleting reminder:', error);
        alert(t('reminder.delete_error', 'Chyba při mazání připomínky.'));
    }
}

// Aktuální zobrazená připomínka v modalu (pro stock aktualizace)
let currentViewReminderId = null;
let currentViewReminderRecipeId = null;

// Zobrazit detail připomínky (read-only)
async function showViewReminderModal(reminderId) {
    // Načíst aktuální data přímo z databáze (ne z cache)
    const clerkId = window.Clerk?.user?.id;
    let reminder = allRecipeReminders.find(r => r.id === reminderId);
    
    // Pokud je uživatel přihlášen, načíst čerstvá data z databáze
    if (clerkId && window.database?.getReminderById) {
        try {
            const freshReminder = await window.database.getReminderById(clerkId, reminderId);
            if (freshReminder) {
                reminder = freshReminder;
                // Aktualizovat také cache
                const idx = allRecipeReminders.findIndex(r => r.id === reminderId);
                if (idx >= 0) {
                    allRecipeReminders[idx] = freshReminder;
                }
            }
        } catch (e) {
            console.warn('Could not refresh reminder from DB:', e);
        }
    }
    
    if (!reminder) { console.error('Reminder not found:', reminderId); return; }

    const modal = document.getElementById('viewReminderModal');
    if (!modal) return;

    // Uložit ID pro aktualizace stock baru
    currentViewReminderId = reminderId;
    currentViewReminderRecipeId = reminder.recipe_id;

    // Formátovat datumy pro zobrazení
    const formatDate = (dateStr) => {
        if (!dateStr) return '-';
        const date = new Date(dateStr);
        return date.toLocaleDateString();
    };

    const mixDateEl = document.getElementById('viewReminderMixDate');
    const remindDateEl = document.getElementById('viewReminderRemindDate');
    const noteEl = document.getElementById('viewReminderNote');
    const stockContainer = document.getElementById('viewReminderStockContainer');

    if (mixDateEl) mixDateEl.textContent = formatDate(reminder.mixed_at);
    if (remindDateEl) remindDateEl.textContent = formatDate(reminder.remind_at);
    if (noteEl) noteEl.textContent = reminder.note || t('reminder.no_note', 'Bez poznámky');

    // Vykreslit stock bar
    if (stockContainer) {
        const stockPercent = reminder.stock_percent ?? 100;
        const stockColor = stockPercent >= 50 ? 'var(--neon-green)' : 
                           stockPercent > 20 ? '#ffcc00' : '#ff4444';
        const lowClass = stockPercent <= 20 ? 'low' : '';
        const percentTextClass = stockPercent >= 50 ? '' : 'low-text';

        stockContainer.innerHTML = `
            <button type="button" class="stock-btn minus" onclick="updateViewReminderStock(-10)" title="-10%">−</button>
            <div class="stock-battery">
                <div class="battery-body">
                    <div class="battery-level ${lowClass}" 
                         id="view-stock-bar"
                         style="width: ${stockPercent}%; background: ${stockColor};">
                    </div>
                    <span class="battery-percent ${percentTextClass}" id="view-stock-percent">${stockPercent}%</span>
                </div>
                <div class="battery-tip"></div>
            </div>
            <button type="button" class="stock-btn plus" onclick="updateViewReminderStock(+10)" title="+10%">+</button>
        `;
    }

    modal.classList.remove('hidden');
    
    // Populate recipe label for sticker
    populateRecipeLabel(reminder);
}

// Aktualizovat stock z viewReminderModal
async function updateViewReminderStock(delta) {
    if (!currentViewReminderId || !currentViewReminderRecipeId) return;
    
    const clerkId = window.Clerk?.user?.id;
    if (!clerkId) return;
    
    try {
        // Načíst aktuální stav přímo z databáze
        const reminder = await window.database.getReminderById(clerkId, currentViewReminderId);
        if (!reminder) return;
        
        const currentStock = reminder.stock_percent ?? 100;
        let newStock = Math.max(0, Math.min(100, currentStock + delta));
        
        // Aktualizovat UI v modalu
        const stockBar = document.getElementById('view-stock-bar');
        const percentLabel = document.getElementById('view-stock-percent');
        
        if (stockBar) {
            stockBar.style.transition = 'width 0.5s ease-out, background 0.5s ease';
            const stockColor = newStock >= 50 ? 'var(--neon-green)' : 
                               newStock > 20 ? '#ffcc00' : '#ff4444';
            stockBar.style.width = `${newStock}%`;
            stockBar.style.background = stockColor;
            
            if (newStock <= 20) {
                stockBar.classList.add('low');
            } else {
                stockBar.classList.remove('low');
            }
        }
        
        if (percentLabel) {
            percentLabel.textContent = `${newStock}%`;
            if (newStock >= 50) {
                percentLabel.classList.remove('low-text');
            } else {
                percentLabel.classList.add('low-text');
            }
        }
        
        // Aktualizovat databázi
        if (newStock === 0) {
            const confirmed = await showConsumedConfirmDialog();
            if (confirmed) {
                await window.database.markReminderConsumed(clerkId, currentViewReminderId);
                showNotification(t('reminder.consumed_success', 'Liquid označen jako spotřebovaný!'), 'success');
                hideViewReminderModal();
                loadRecipeReminders(currentViewReminderRecipeId);
                await loadMaturedRecipeIds();
                if (currentPageId === 'my-recipes') filterRecipes();
            } else {
                // Vrátit na 10%
                newStock = 10;
                if (stockBar) {
                    stockBar.style.width = '10%';
                    stockBar.style.background = '#ff4444';
                }
                if (percentLabel) percentLabel.textContent = '10%';
                await window.database.updateReminderStock(clerkId, currentViewReminderId, 10);
            }
        } else {
            await window.database.updateReminderStock(clerkId, currentViewReminderId, newStock);
        }
        
        // Aktualizovat také seznam připomínek pokud je viditelný
        const listStockBar = document.getElementById(`stock-bar-${currentViewReminderId}`);
        if (listStockBar) {
            const stockColor = newStock >= 50 ? 'var(--neon-green)' : 
                               newStock > 20 ? '#ffcc00' : '#ff4444';
            listStockBar.style.width = `${newStock}%`;
            listStockBar.style.background = stockColor;
            const listPercentLabel = listStockBar.parentElement?.querySelector('.battery-percent');
            if (listPercentLabel) {
                listPercentLabel.textContent = `${newStock}%`;
                if (newStock >= 50) {
                    listPercentLabel.classList.remove('low-text');
                } else {
                    listPercentLabel.classList.add('low-text');
                }
            }
        }
        
    } catch (error) {
        console.error('Error updating view reminder stock:', error);
        showNotification(t('common.error', 'Chyba při aktualizaci'), 'error');
    }
}

function hideViewReminderModal() {
    const modal = document.getElementById('viewReminderModal');
    if (modal) modal.classList.add('hidden');
}

// Export funkcí pro připomínky
window.toggleReminderFields = toggleReminderFields;
window.updateReminderDate = updateReminderDate;
window.initReminderFieldsEnabled = initReminderFieldsEnabled;
window.loadRecipeReminders = loadRecipeReminders;
window.showAddReminderModal = showAddReminderModal;
window.showEditReminderModal = showEditReminderModal;
window.hideAddReminderModal = hideAddReminderModal;
window.showViewReminderModal = showViewReminderModal;
window.hideViewReminderModal = hideViewReminderModal;
window.updateViewReminderStock = updateViewReminderStock;
window.updateReminderModalDate = updateReminderModalDate;
window.saveReminderFromModal = saveReminderFromModal;
window.deleteReminderConfirm = deleteReminderConfirm;
window.saveLabelAsImage = saveLabelAsImage;
window.printLabel = printLabel;

// =============================================
// ŠTÍTEK K RECEPTU (Label with QR code)
// =============================================

// Populate recipe label when viewing reminder detail
function populateRecipeLabel(reminder) {
    if (!reminder || !currentViewingRecipe) return;
    
    const recipe = currentViewingRecipe;
    const data = recipe.recipe_data || {};
    const currentLocale = window.i18n?.currentLocale || 'cs';
    
    // Recipe name
    const nameEl = document.getElementById('recipeLabelName');
    if (nameEl) nameEl.textContent = recipe.name || '?';
    
    // Volume
    const volEl = document.getElementById('recipeLabelVolume');
    if (volEl) volEl.textContent = `${t('recipe_detail.total_volume', 'Volume')}: ${data.totalAmount || '?'} ml`;
    
    // VG/PG ratio
    const ratioEl = document.getElementById('recipeLabelRatio');
    const vg = data.vgPercent ?? data.ratio ?? '?';
    const pg = vg !== '?' ? (100 - vg) : '?';
    if (ratioEl) ratioEl.textContent = `VG/PG: ${vg}:${pg}`;
    
    // Nicotine
    const nicEl = document.getElementById('recipeLabelNicotine');
    const nic = parseFloat(data.nicotine ?? 0).toFixed(1);
    if (nicEl) nicEl.textContent = `${t('recipe_detail.nicotine', 'Nicotine')}: ${nic} mg/ml`;
    
    // Mix date
    const mixDateEl = document.getElementById('recipeLabelMixDate');
    if (mixDateEl && reminder.mixed_at) {
        const mixDate = new Date(reminder.mixed_at).toLocaleDateString(currentLocale);
        mixDateEl.textContent = `${t('label.mixed', 'Namícháno')}: ${mixDate}`;
    }
    
    // Steep date (remind_at = maturation date)
    const steepEl = document.getElementById('recipeLabelSteepDate');
    if (steepEl && reminder.remind_at) {
        const steepDate = new Date(reminder.remind_at).toLocaleDateString(currentLocale);
        steepEl.textContent = `${t('label.matured', 'Vyzrání')}: ${steepDate}`;
    }
    
    // Generate QR code (same URL as share link)
    const qrContainer = document.getElementById('recipeLabelQr');
    if (qrContainer && recipe.share_id) {
        qrContainer.innerHTML = '';
        try {
            const shareUrl = `${SHARE_DOMAIN}/?recipe=${recipe.share_id}`;
            const qr = qrcode(0, 'M');
            qr.addData(shareUrl);
            qr.make();
            qrContainer.innerHTML = qr.createImgTag(3, 0);
        } catch (e) {
            console.error('QR generation error:', e);
            qrContainer.innerHTML = '<div style="width:100px;height:100px;background:#f0f0f0;display:flex;align-items:center;justify-content:center;font-size:10px;color:#999;">QR</div>';
        }
    } else if (qrContainer) {
        qrContainer.innerHTML = '<div style="width:100px;height:100px;background:#f0f0f0;display:flex;align-items:center;justify-content:center;font-size:10px;color:#999;">QR</div>';
    }
}

// Save label as image using canvas
function saveLabelAsImage() {
    const card = document.getElementById('recipeLabelCard');
    if (!card) return;
    
    // Use html2canvas-like approach with native canvas
    const canvas = document.createElement('canvas');
    const scale = 3; // High DPI
    const rect = card.getBoundingClientRect();
    canvas.width = rect.width * scale;
    canvas.height = rect.height * scale;
    const ctx = canvas.getContext('2d');
    ctx.scale(scale, scale);
    
    // White background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, rect.width, rect.height);
    
    // Draw QR code
    const qrImg = card.querySelector('.recipe-label-qr img');
    if (qrImg) {
        ctx.drawImage(qrImg, 16, 16, 100, 100);
    }
    
    // Draw text info
    ctx.fillStyle = '#1a1a2e';
    ctx.font = 'bold 14px sans-serif';
    const nameEl = document.getElementById('recipeLabelName');
    ctx.fillText(nameEl?.textContent || '', 130, 30);
    
    ctx.font = '11px sans-serif';
    ctx.fillStyle = '#475569';
    const fields = ['recipeLabelVolume', 'recipeLabelRatio', 'recipeLabelNicotine', 'recipeLabelMixDate', 'recipeLabelSteepDate'];
    let y = 50;
    fields.forEach(id => {
        const el = document.getElementById(id);
        if (el?.textContent) {
            ctx.fillText(el.textContent, 130, y);
            y += 16;
        }
    });
    
    // Branding
    ctx.font = 'italic 9px sans-serif';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('www.liquimixer.com', 130, y + 5);
    
    // Dashed border
    ctx.setLineDash([5, 3]);
    ctx.strokeStyle = '#ccc';
    ctx.lineWidth = 1;
    ctx.strokeRect(1, 1, rect.width - 2, rect.height - 2);
    
    // Download
    const link = document.createElement('a');
    const recipeName = nameEl?.textContent?.replace(/[^a-zA-Z0-9]/g, '_') || 'recipe';
    link.download = `LiquiMixer_${recipeName}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
}

// Print label
function printLabel() {
    const card = document.getElementById('recipeLabelCard');
    if (!card) return;
    
    const printWindow = window.open('', '_blank', 'width=400,height=300');
    if (!printWindow) {
        alert(t('label.popup_blocked', 'Povolte vyskakovací okna pro tisk.'));
        return;
    }
    
    printWindow.document.write(`
        <!DOCTYPE html>
        <html><head><title>LiquiMixer Label</title>
        <style>
            body { margin: 10mm; font-family: sans-serif; }
            .label { display: flex; gap: 14px; padding: 16px; border: 2px dashed #ccc; border-radius: 8px; max-width: 80mm; }
            .qr { flex-shrink: 0; }
            .qr img { width: 25mm; height: 25mm; }
            .info { flex: 1; }
            .name { font-size: 12pt; font-weight: bold; margin-bottom: 4px; }
            .detail { font-size: 9pt; color: #475569; line-height: 1.5; }
            .brand { font-size: 7pt; color: #94a3b8; font-style: italic; margin-top: 6px; padding-top: 4px; border-top: 1px solid #e2e8f0; }
        </style></head><body>
        <div class="label">${card.innerHTML}</div>
        <script>window.onload=function(){window.print();window.close();}<\/script>
        </body></html>
    `);
    printWindow.document.close();
}

// =============================================
// VEŘEJNÁ DATABÁZE RECEPTŮ
// =============================================

let currentDbPage = 1;
let dbSearchTimeout = null;

// Zobrazit stránku databáze receptů
function showRecipeDatabase() {
    // Kontrola přihlášení
    if (!window.Clerk?.user) {
        showLoginRequiredModal();
        return;
    }
    
    showPage('recipe-database');
    initFlavorFilterOptions();
    loadPublicRecipes();
}

// Inicializovat/regenerovat select s typy příchutí z flavorDatabase
function initFlavorFilterOptions(forceRegenerate = false) {
    const select = document.getElementById('dbFilterFlavorType');
    if (!select) return;
    
    // Pokud již inicializováno a není forceRegenerate, přeskočit
    if (!forceRegenerate && select.options.length > 1) return;
    
    // Uložit aktuální hodnotu
    const currentValue = select.value;
    
    // Vymazat existující options (kromě první "Všechny")
    while (select.options.length > 1) {
        select.remove(1);
    }
    
    // Aktualizovat překlad první option
    if (select.options[0]) {
        select.options[0].textContent = t('recipe_database.all', 'All');
    }
    
    // Přidat typy z flavorDatabase
    if (window.flavorDatabase) {
        Object.keys(window.flavorDatabase).forEach(key => {
            if (key === 'none') return; // Přeskočit "Žádná"
            const option = document.createElement('option');
            option.value = key;
            const flavorData = window.flavorDatabase[key];
            
            // Zkusit nejprve form.flavor_*, pak shisha.flavor_*
            const formKey = `form.flavor_${key}`;
            const shishaKey = `shisha.flavor_${key}`;
            
            let translation = t(formKey);
            let usedKey = formKey;
            
            // Pokud form překlad neexistuje nebo vrací klíč, zkusit shisha
            if (!translation || translation === formKey) {
                const shishaTranslation = t(shishaKey);
                if (shishaTranslation && shishaTranslation !== shishaKey) {
                    translation = shishaTranslation;
                    usedKey = shishaKey;
                }
            }
            
            // Pokud stále není překlad, použít název z databáze
            option.textContent = (translation && translation !== formKey && translation !== shishaKey) 
                ? translation 
                : (flavorData.name || key);
            option.setAttribute('data-i18n', usedKey);
            select.appendChild(option);
        });
    }
    
    // Obnovit vybranou hodnotu
    if (currentValue) {
        select.value = currentValue;
    }
}

// Toggle rozbalovacích filtrů
function toggleDatabaseFilters() {
    const panel = document.getElementById('dbFiltersPanel');
    const icon = document.querySelector('.filter-toggle-icon');
    if (!panel || !icon) return;
    
    if (panel.classList.contains('hidden')) {
        panel.classList.remove('hidden');
        panel.classList.add('open');
        icon.textContent = '▲';
        
        // Regenerovat překlady filtrů při otevření
        initFlavorFilterOptions(true);
        if (window.i18n?.applyTranslations) {
            window.i18n.applyTranslations();
        }
    } else {
        panel.classList.remove('open');
        panel.classList.add('hidden');
        icon.textContent = '▼';
    }
}

// Reset všech filtrů
function resetDatabaseFilters() {
    document.getElementById('dbFilterFormType').value = '';
    document.getElementById('dbFilterFlavorType').value = '';
    document.getElementById('dbFilterVgMin').value = '';
    document.getElementById('dbFilterVgMax').value = '';
    document.getElementById('dbFilterNicMin').value = '';
    document.getElementById('dbFilterNicMax').value = '';
    document.getElementById('dbFilterMinRating').value = '';
    document.getElementById('dbFilterHasAdditive').checked = false;
    document.getElementById('dbFilterDifficulty').value = '';
    document.getElementById('dbSearchInput').value = '';
    currentDbPage = 1;
    loadPublicRecipes();
}

// Debounce pro vyhledávání
function debounceSearch() {
    if (dbSearchTimeout) clearTimeout(dbSearchTimeout);
    dbSearchTimeout = setTimeout(() => {
        currentDbPage = 1;
        loadPublicRecipes();
    }, 300);
}

// Načíst veřejné recepty
async function loadPublicRecipes() {
    const listEl = document.getElementById('publicRecipesList');
    const paginationEl = document.getElementById('dbPagination');
    if (!listEl) return;
    
    // Zobrazit loading
    listEl.innerHTML = `<div class="loading-message">${t('recipe_database.loading', 'Načítání receptů...')}</div>`;
    
    // Sestavit filtry
    const filters = {
        search: document.getElementById('dbSearchInput')?.value || '',
        formType: document.getElementById('dbFilterFormType')?.value || '',
        flavorType: document.getElementById('dbFilterFlavorType')?.value || '',
        vgMin: document.getElementById('dbFilterVgMin')?.value || '',
        vgMax: document.getElementById('dbFilterVgMax')?.value || '',
        nicMin: document.getElementById('dbFilterNicMin')?.value || '',
        nicMax: document.getElementById('dbFilterNicMax')?.value || '',
        minRating: document.getElementById('dbFilterMinRating')?.value || '',
        hasAdditive: document.getElementById('dbFilterHasAdditive')?.checked || false,
        difficulty: document.getElementById('dbFilterDifficulty')?.value || '',
        sortBy: document.getElementById('dbSortBy')?.value || 'rating_desc'
    };
    
    console.log('loadPublicRecipes: filters =', filters);
    
    try {
        const result = await window.LiquiMixerDB.getPublicRecipes(filters, currentDbPage, 50);
        console.log('loadPublicRecipes: result =', result);
        
        // VG/PG a nikotin filtry jsou nyní aplikovány v database.js (getPublicRecipes)
        // Po migraci databáze používáme jednotné klíče vgPercent a nicotine
        const filteredRecipes = result.recipes || [];
        
        if (filteredRecipes.length === 0) {
            listEl.innerHTML = `<div class="no-recipes-message">${t('recipe_database.no_recipes', 'No recipes found')}</div>`;
            if (paginationEl) paginationEl.innerHTML = '';
            return;
        }
        
        // Render karty receptů
        listEl.innerHTML = filteredRecipes.map(recipe => renderPublicRecipeCard(recipe)).join('');
        
        // Render paginace
        if (paginationEl) {
            renderDbPagination(paginationEl, result.total, result.page, result.limit);
        }
        
        // Aplikovat překlady
        if (window.i18n?.applyTranslations) {
            window.i18n.applyTranslations();
        }
    } catch (error) {
        console.error('Error loading public recipes:', error);
        listEl.innerHTML = `<div class="error-message">${t('common.error', 'Chyba při načítání')}</div>`;
    }
}

// Render karty veřejného receptu
function renderPublicRecipeCard(recipe) {
    const avgRating = recipe.public_rating_avg || 0;
    const ratingCount = recipe.public_rating_count || 0;
    const formType = recipe.form_type || 'liquid';
    const recipeData = recipe.recipe_data || {};
    
    // VG/PG a nikotin z recipe_data (po migraci používáme vgPercent a nicotine)
    const vgRatio = recipeData.vgPercent ?? 70;
    const nicStrength = recipeData.nicotine ?? 0;
    const flavorType = recipeData.flavorType || '';
    
    // Render hvězdiček
    const stars = renderStars(avgRating);
    
    return `
        <div class="public-recipe-card" data-recipe-id="${recipe.id}" onclick="loadPublicRecipeDetail('${recipe.id}')">
            <div class="recipe-card-header">
                <h4 class="recipe-card-name">${escapeHtml(recipe.name)}</h4>
                <div class="recipe-card-rating">
                    <span class="rating-avg">${avgRating.toFixed(1)}</span>
                    <span class="rating-stars">${stars}</span>
                    <span class="rating-count">(${ratingCount})</span>
                </div>
            </div>
            <div class="recipe-card-type">${t(`form.tab_${formType}`, formType.toUpperCase())}</div>
            <div class="recipe-card-meta">
                <span class="recipe-card-badge vg-pg">${vgRatio}/${100 - vgRatio} VG/PG</span>
                ${nicStrength > 0 ? `<span class="recipe-card-badge nicotine">${nicStrength} mg</span>` : ''}
                ${flavorType ? `<span class="recipe-card-badge flavor">${t(`form.flavor_type_${flavorType}`, flavorType)}</span>` : ''}
            </div>
        </div>
    `;
}

// Render hvězdiček
function renderStars(rating) {
    let stars = '';
    for (let i = 1; i <= 5; i++) {
        if (i <= rating) {
            stars += '★';
        } else if (i - 0.5 <= rating) {
            stars += '☆';
        } else {
            stars += '☆';
        }
    }
    return stars;
}

// Render paginace
function renderDbPagination(container, total, currentPage, limit) {
    const totalPages = Math.ceil(total / limit);
    if (totalPages <= 1) {
        container.innerHTML = '';
        return;
    }
    
    let html = '';
    
    // Tlačítko Předchozí
    html += `<button class="pagination-btn" ${currentPage <= 1 ? 'disabled' : ''} 
             onclick="goToDbPage(${currentPage - 1})">◀</button>`;
    
    // Čísla stránek
    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= currentPage - 2 && i <= currentPage + 2)) {
            html += `<button class="pagination-btn ${i === currentPage ? 'active' : ''}" 
                     onclick="goToDbPage(${i})">${i}</button>`;
        } else if (i === currentPage - 3 || i === currentPage + 3) {
            html += '<span class="pagination-ellipsis">...</span>';
        }
    }
    
    // Tlačítko Další
    html += `<button class="pagination-btn" ${currentPage >= totalPages ? 'disabled' : ''} 
             onclick="goToDbPage(${currentPage + 1})">▶</button>`;
    
    // Info o počtu
    html += `<span class="pagination-info">${t('recipe_database.results_count', 'Nalezeno {count} receptů').replace('{count}', total)}</span>`;
    
    container.innerHTML = html;
}

// Přejít na stránku
function goToDbPage(page) {
    currentDbPage = page;
    loadPublicRecipes();
    // Scroll nahoru
    document.getElementById('recipe-database')?.scrollIntoView({ behavior: 'smooth' });
}

// Načíst detail veřejného receptu
async function loadPublicRecipeDetail(recipeId) {
    try {
        const recipe = await window.LiquiMixerDB.getPublicRecipeById(recipeId);
        if (!recipe) {
            showNotification(t('common.error', 'Recept nenalezen'), 'error');
            return;
        }
        
        window.currentSharedRecipe = recipe;
        
        // Načíst hodnocení uživatele
        let userRating = 0;
        if (window.Clerk?.user) {
            userRating = await window.LiquiMixerDB.getUserRatingForRecipe(window.Clerk.user.id, recipeId);
        }
        
        // Načíst příchutě pro veřejný recept
        let linkedFlavors = [];
        try {
            linkedFlavors = await window.LiquiMixerDB.getLinkedFlavors(recipeId);
        } catch (err) {
            console.error('Error loading linked flavors for public recipe:', err);
        }
        
        // Zobrazit detail
        displayRecipeDetail(recipe, 'sharedRecipeTitle', 'sharedRecipeContent', [], true, linkedFlavors);
        
        // Přidat sekci hodnocení
        appendRatingSection(recipeId, recipe.public_rating_avg || 0, recipe.public_rating_count || 0, userRating);
        
        // Přidat tlačítko zpět do databáze
        appendBackToDatabaseButton();
        
        // Označit, že recept je z veřejné databáze (pro blokování public checkboxu)
        window.isFromPublicDatabase = true;
        
        showPage('shared-recipe');
        
        if (window.i18n?.applyTranslations) {
            window.i18n.applyTranslations();
        }
    } catch (error) {
        console.error('Error loading public recipe detail:', error);
        showNotification(t('common.error', 'Chyba při načítání receptu'), 'error');
    }
}

// Přidat sekci hodnocení do detailu receptu
function appendRatingSection(recipeId, avgRating, ratingCount, userRating) {
    const container = document.getElementById('sharedRecipeContent');
    if (!container) return;
    
    const ratingHtml = `
        <div class="recipe-rating-section">
            <h3 data-i18n="rating.title">Hodnocení</h3>
            <div class="rating-summary">
                <span class="rating-avg">${avgRating.toFixed(1)}</span>
                <span class="rating-stars">${renderStars(avgRating)}</span>
                <span class="rating-count">(${ratingCount} ${t('rating.votes', 'hlasů')})</span>
            </div>
            <div class="rating-user">
                <label data-i18n="rating.your_rating">Vaše hodnocení:</label>
                <div class="star-rating-input" data-recipe-id="${recipeId}">
                    ${[1,2,3,4,5].map(i => `
                        <span class="star-input ${i <= userRating ? 'active' : ''}" 
                              data-value="${i}" 
                              onclick="submitRating('${recipeId}', ${i})"
                              ontouchend="event.preventDefault(); submitRating('${recipeId}', ${i})">★</span>
                    `).join('')}
                </div>
            </div>
        </div>
    `;
    container.insertAdjacentHTML('beforeend', ratingHtml);
}

// Odeslat hodnocení
async function submitRating(recipeId, rating) {
    if (!window.Clerk?.user) {
        showLoginRequiredModal();
        return;
    }
    
    try {
        await window.LiquiMixerDB.addRecipeRating(window.Clerk.user.id, recipeId, rating);
        
        // Aktualizovat UI hvězdiček v detailu
        const stars = document.querySelectorAll(`.star-rating-input[data-recipe-id="${recipeId}"] .star-input`);
        stars.forEach((star, index) => {
            star.classList.toggle('active', index < rating);
        });
        
        // Aktualizovat průměrné hodnocení v seznamu receptů (po přepočtu v databázi)
        // Počkat krátce na přepočet průměru v databázi
        setTimeout(async () => {
            try {
                const updatedRecipe = await window.LiquiMixerDB.getPublicRecipeById(recipeId);
                if (updatedRecipe) {
                    // Aktualizovat kartu v seznamu (použít data-recipe-id atribut)
                    const card = document.querySelector(`.public-recipe-card[data-recipe-id="${recipeId}"]`);
                    if (card) {
                        const starsEl = card.querySelector('.recipe-card-rating');
                        if (starsEl) {
                            const avgRating = updatedRecipe.public_rating_avg || 0;
                            const ratingCount = updatedRecipe.public_rating_count || 0;
                            // Aktualizovat všechny části rating elementu
                            const avgEl = starsEl.querySelector('.rating-avg');
                            const starsSpan = starsEl.querySelector('.rating-stars');
                            const countSpan = starsEl.querySelector('.rating-count');
                            if (avgEl) avgEl.textContent = avgRating.toFixed(1);
                            if (starsSpan) starsSpan.innerHTML = renderStars(avgRating);
                            if (countSpan) countSpan.textContent = `(${ratingCount})`;
                        }
                    }
                    
                    // Aktualizovat průměr v sekci hodnocení v detailu
                    const ratingSummary = document.querySelector('.rating-summary');
                    if (ratingSummary) {
                        const avgEl = ratingSummary.querySelector('.rating-avg');
                        const starsEl = ratingSummary.querySelector('.rating-stars');
                        const countEl = ratingSummary.querySelector('.rating-count');
                        if (avgEl) avgEl.textContent = (updatedRecipe.public_rating_avg || 0).toFixed(1);
                        if (starsEl) starsEl.innerHTML = renderStars(updatedRecipe.public_rating_avg || 0);
                        if (countEl) countEl.textContent = `(${updatedRecipe.public_rating_count || 0} ${t('rating.votes', 'hlasů')})`;
                    }
                }
            } catch (err) {
                console.error('Error updating rating display:', err);
            }
        }, 500);
        
        showNotification(t('rating.thank_you', 'Děkujeme za hodnocení!'), 'success');
    } catch (error) {
        console.error('Error submitting rating:', error);
        showNotification(t('common.error', 'Chyba při ukládání hodnocení'), 'error');
    }
}

// Přidat tlačítko zpět do databáze receptů - na konec k ostatním tlačítkům
function appendBackToDatabaseButton() {
    // Najít button-group na stránce shared-recipe
    const sharedRecipePage = document.getElementById('shared-recipe');
    if (!sharedRecipePage) return;
    
    const buttonGroup = sharedRecipePage.querySelector('.button-group');
    if (!buttonGroup) return;
    
    // Zkontrolovat, zda tlačítko již neexistuje
    if (buttonGroup.querySelector('.back-to-database-btn')) return;
    
    // Přidat tlačítko zpět - použít goBack() pro správnou navigaci v historii
    const backBtnHtml = `
        <button class="neon-button secondary back-to-database-btn" onclick="goBack()">
            <span data-i18n="recipe_detail.back">Zpět</span>
        </button>
    `;
    buttonGroup.insertAdjacentHTML('afterbegin', backBtnHtml);
    
    // Aplikovat překlady
    if (window.i18n?.applyTranslations) {
        window.i18n.applyTranslations();
    }
}

// Odstranit tlačítko zpět do databáze (při opuštění stránky)
function removeBackToDatabaseButton() {
    const btn = document.querySelector('.back-to-database-btn');
    if (btn) btn.remove();
}

// Překreslit detail veřejného receptu při změně jazyka
async function refreshPublicRecipeDetail() {
    // Zkontrolovat, zda je stránka shared-recipe zobrazená a máme data receptu
    const sharedRecipePage = document.getElementById('shared-recipe');
    if (!sharedRecipePage || !sharedRecipePage.classList.contains('active')) return;
    if (!window.currentSharedRecipe) return;
    
    const recipe = window.currentSharedRecipe;
    
    // Načíst příchutě
    let linkedFlavors = [];
    try {
        if (recipe.id) {
            linkedFlavors = await window.LiquiMixerDB.getLinkedFlavors(recipe.id);
        }
    } catch (err) {
        console.error('Error loading linked flavors for refresh:', err);
    }
    
    // Znovu vykreslit detail
    displayRecipeDetail(recipe, 'sharedRecipeTitle', 'sharedRecipeContent', [], true, linkedFlavors);
    
    // Znovu přidat sekci hodnocení
    if (recipe.id) {
        appendRatingSection(recipe.id, recipe.public_rating_avg || 0, recipe.public_rating_count || 0, 0);
    }
    
    // Aplikovat překlady
    if (window.i18n?.applyTranslations) {
        window.i18n.applyTranslations();
    }
}

// =============================================
// DATABÁZE PŘÍCHUTÍ (FLAVOR DATABASE)
// =============================================

let currentFlavorPage = 1;
let flavorSearchTimeout = null;
let currentFlavorDetail = null;
let flavorManufacturersCache = null;
let flavorCategoriesCache = null;

// Zobrazit stránku databáze příchutí
function showFlavorDatabase() {
    // Kontrola přihlášení
    if (!window.Clerk?.user) {
        showLoginRequiredModal();
        return;
    }
    
    showPage('flavor-database');
    // Aplikovat překlady ihned po zobrazení stránky
    if (window.i18n?.applyTranslations) {
        window.i18n.applyTranslations();
    }
    initFlavorDatabaseFilters();
    loadFlavors();
}

// Inicializovat filtry pro databázi příchutí
async function initFlavorDatabaseFilters() {
    // Načíst výrobce (cache)
    if (!flavorManufacturersCache) {
        try {
            flavorManufacturersCache = await window.LiquiMixerDB.getFlavorManufacturers();
        } catch (e) {
            console.error('Error loading manufacturers:', e);
            flavorManufacturersCache = [];
        }
    }
    
    // Naplnit dropdown výrobců
    const manufacturerSelect = document.getElementById('flavorFilterManufacturer');
    if (manufacturerSelect && flavorManufacturersCache.length > 0) {
        // Uložit aktuální hodnotu
        const currentValue = manufacturerSelect.value;
        
        // Ponechat první option (Všichni výrobci)
        while (manufacturerSelect.options.length > 1) {
            manufacturerSelect.remove(1);
        }
        
        // Přidat výrobce
        flavorManufacturersCache.forEach(m => {
            const option = document.createElement('option');
            option.value = m.code;
            option.textContent = `${m.name} (${m.country_code})`;
            manufacturerSelect.appendChild(option);
        });
        
        // Obnovit hodnotu
        if (currentValue) manufacturerSelect.value = currentValue;
    }
    
    // Kategorie jsou nyní staticky definované v HTML (stejný číselník jako formuláře)
    // Nepotřebujeme dynamické načítání z databáze
    
    // Naplnit dropdown hodnocení dynamicky
    const ratingSelect = document.getElementById('flavorFilterRating');
    if (ratingSelect) {
        const currentRatingValue = ratingSelect.value;
        ratingSelect.innerHTML = '';
        
        // První option "Všechny"
        const allOption = document.createElement('option');
        allOption.value = 'all';
        allOption.textContent = t('flavor_database.filter_rating_all', 'All');
        ratingSelect.appendChild(allOption);
        
        // Hvězdičky 1-5
        for (let i = 1; i <= 5; i++) {
            const option = document.createElement('option');
            option.value = i.toString();
            option.textContent = '★'.repeat(i) + ' (' + i + '+)';
            ratingSelect.appendChild(option);
        }
        
        // Obnovit hodnotu
        if (currentRatingValue) ratingSelect.value = currentRatingValue;
    }
    
    // Aplikovat překlady
    if (window.i18n?.applyTranslations) {
        window.i18n.applyTranslations();
    }
}

// Toggle filtrů databáze příchutí
function toggleFlavorDatabaseFilters() {
    const panel = document.getElementById('flavorFiltersPanel');
    const btn = document.querySelector('#flavor-database .filter-toggle-btn .filter-toggle-icon');
    if (!panel) return;
    
    if (panel.classList.contains('hidden')) {
        panel.classList.remove('hidden');
        panel.classList.add('open');
        if (btn) btn.textContent = '▲';
    } else {
        panel.classList.remove('open');
        panel.classList.add('hidden');
        if (btn) btn.textContent = '▼';
    }
}

// Reset filtrů databáze příchutí
function resetFlavorDatabaseFilters() {
    document.getElementById('flavorSearchInput').value = '';
    document.getElementById('flavorSortBy').value = 'popularity';
    document.getElementById('flavorFilterType').value = 'all';
    document.getElementById('flavorFilterManufacturer').value = 'all';
    document.getElementById('flavorFilterCategory').value = 'all';
    document.getElementById('flavorFilterRating').value = 'all';
    currentFlavorPage = 1;
    loadFlavors();
}

// Debounce pro vyhledávání příchutí
function debounceFlavorSearch() {
    clearTimeout(flavorSearchTimeout);
    flavorSearchTimeout = setTimeout(() => {
        currentFlavorPage = 1;
        loadFlavors();
    }, 300);
}

// Načíst příchutě
async function loadFlavors() {
    const listContainer = document.getElementById('flavorsList');
    const countContainer = document.getElementById('flavorResultsCount');
    const paginationContainer = document.getElementById('flavorPagination');
    
    if (!listContainer) return;
    
    // Zobrazit loading
    listContainer.innerHTML = `<div class="loading-message"><span data-i18n="flavor_database.loading">${t('flavor_database.loading', 'Načítání příchutí...')}</span></div>`;
    
    // Sestavit filtry
    const filters = {
        search: document.getElementById('flavorSearchInput')?.value || '',
        sort: document.getElementById('flavorSortBy')?.value || 'popularity',
        product_type: document.getElementById('flavorFilterType')?.value || 'all',
        manufacturer_code: document.getElementById('flavorFilterManufacturer')?.value || 'all',
        category: document.getElementById('flavorFilterCategory')?.value || 'all',
        min_rating: parseFloat(document.getElementById('flavorFilterRating')?.value) || 0
    };
    
    try {
        const result = await window.LiquiMixerDB.searchFlavors(filters, currentFlavorPage, 20);
        
        if (!result.data || result.data.length === 0) {
            listContainer.innerHTML = `<div class="empty-message"><span data-i18n="flavor_database.no_results">${t('flavor_database.no_results', 'No flavors found')}</span></div>`;
            if (countContainer) countContainer.innerHTML = '';
            if (paginationContainer) paginationContainer.innerHTML = '';
            return;
        }
        
        // Zobrazit počet výsledků
        if (countContainer) {
            countContainer.innerHTML = `<span data-i18n="flavor_database.results_count">${t('flavor_database.results_count', 'Nalezeno {count} příchutí').replace('{count}', result.total)}</span>`;
        }
        
        // Vykreslit karty příchutí
        listContainer.innerHTML = result.data.map(flavor => renderFlavorCard(flavor)).join('');
        
        // Vykreslit paginaci
        if (paginationContainer) {
            const totalPages = Math.ceil(result.total / 20);
            renderFlavorPagination(paginationContainer, currentFlavorPage, totalPages);
        }
        
        // Aplikovat překlady
        if (window.i18n?.applyTranslations) {
            window.i18n.applyTranslations();
        }
    } catch (error) {
        console.error('Error loading flavors:', error);
        listContainer.innerHTML = `<div class="error-message">${t('common.error', 'Chyba při načítání')}</div>`;
    }
}

// Vykreslit kartu příchutě
function renderFlavorCard(flavor) {
    const manufacturerName = flavor.flavor_manufacturers?.name || flavor.manufacturer_code;
    const categoryTranslation = t(`form.flavor_${flavor.category}`, flavor.category);
    const typeLabel = flavor.product_type === 'vape' 
        ? t('flavor_database.filter_type_vape', 'Vape') 
        : t('flavor_database.filter_type_shisha', 'Shisha');
    const typeClass = flavor.product_type === 'vape' ? 'type-vape' : 'type-shisha';
    
    // Procento - zobrazit přesné hodnoty z DB
    // Pokud chybí, zobrazit fallback s upozorněním
    const hasExactPercent = flavor.min_percent && flavor.max_percent && flavor.min_percent > 0 && flavor.max_percent > 0;
    let percentRange;
    
    if (hasExactPercent) {
        percentRange = `${flavor.min_percent}-${flavor.max_percent}%`;
    } else {
        // Fallback s upozorněním
        const category = flavor.category || 'fruit';
        const isShisha = flavor.product_type === 'shisha';
        const defaultFlavorData = flavorDatabase[category] || flavorDatabase.fruit;
        const fallbackMin = isShisha ? (defaultFlavorData.shishaMin || 15) : (defaultFlavorData.min || 5);
        const fallbackMax = isShisha ? (defaultFlavorData.shishaMax || 25) : (defaultFlavorData.max || 15);
        percentRange = `${fallbackMin}-${fallbackMax}% <span class="card-note">*</span>`;
    }
    
    // Hodnocení a rating class (stejná logika jako recepty)
    const rating = flavor.avg_rating ? parseFloat(flavor.avg_rating).toFixed(1) : '-';
    const ratingStars = flavor.avg_rating ? '★'.repeat(Math.round(flavor.avg_rating)) + '☆'.repeat(5 - Math.round(flavor.avg_rating)) : '☆☆☆☆☆';
    const ratingClass = flavor.avg_rating ? `rating-${Math.round(flavor.avg_rating)}` : 'rating-0';
    
    return `
        <div class="public-recipe-card flavor-card" onclick="showFlavorDetail('${flavor.id}')">
            <div class="recipe-card-header">
                <h3 class="recipe-card-name">${escapeHtml(flavor.name)}</h3>
                <span class="flavor-type-badge ${typeClass}">${typeLabel}</span>
            </div>
            <div class="recipe-card-meta">
                <div class="meta-row">
                    <span class="meta-label" data-i18n="flavor_database.detail_manufacturer">Výrobce:</span>
                    <span class="meta-value">${escapeHtml(manufacturerName)}</span>
                </div>
                <div class="meta-row">
                    <span class="meta-label" data-i18n="flavor_database.detail_category">Kategorie:</span>
                    <span class="meta-value">${escapeHtml(categoryTranslation)}</span>
                </div>
                <div class="meta-row">
                    <span class="meta-label" data-i18n="flavor_database.detail_recommended_percent">Doporučené %:</span>
                    <span class="meta-value">${percentRange}</span>
                </div>
            </div>
            <div class="recipe-card-footer">
                <div class="rating-display">
                    <span class="rating-stars">${ratingStars}</span>
                    <span class="rating-value">${rating}</span>
                </div>
            </div>
        </div>
    `;
}

// Vykreslit paginaci pro příchutě
function renderFlavorPagination(container, currentPage, totalPages) {
    if (totalPages <= 1) {
        container.innerHTML = '';
        return;
    }
    
    let html = '<div class="pagination">';
    
    // Předchozí
    if (currentPage > 1) {
        html += `<button class="pagination-btn" onclick="goToFlavorPage(${currentPage - 1})">◀</button>`;
    }
    
    // Stránky
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, currentPage + 2);
    
    if (startPage > 1) {
        html += `<button class="pagination-btn" onclick="goToFlavorPage(1)">1</button>`;
        if (startPage > 2) html += '<span class="pagination-dots">...</span>';
    }
    
    for (let i = startPage; i <= endPage; i++) {
        const activeClass = i === currentPage ? 'active' : '';
        html += `<button class="pagination-btn ${activeClass}" onclick="goToFlavorPage(${i})">${i}</button>`;
    }
    
    if (endPage < totalPages) {
        if (endPage < totalPages - 1) html += '<span class="pagination-dots">...</span>';
        html += `<button class="pagination-btn" onclick="goToFlavorPage(${totalPages})">${totalPages}</button>`;
    }
    
    // Další
    if (currentPage < totalPages) {
        html += `<button class="pagination-btn" onclick="goToFlavorPage(${currentPage + 1})">▶</button>`;
    }
    
    html += '</div>';
    container.innerHTML = html;
}

// Přejít na stránku příchutí
function goToFlavorPage(page) {
    currentFlavorPage = page;
    loadFlavors();
    // Scroll nahoru
    document.getElementById('flavor-database')?.scrollIntoView({ behavior: 'smooth' });
}

// Zobrazit detail příchutě
async function showFlavorDetail(flavorId) {
    try {
        const flavor = await window.LiquiMixerDB.getFlavorById(flavorId);
        if (!flavor) {
            showNotification(t('common.error', 'Flavor not found'), 'error');
            return;
        }
        
        currentFlavorDetail = flavor;
        
        // Nastavit titulek
        document.getElementById('flavorDetailTitle').textContent = flavor.name;
        
        // Vykreslit detail
        const contentContainer = document.getElementById('flavorDetailContent');
        contentContainer.innerHTML = renderFlavorDetailContent(flavor);
        
        // Načíst uživatelovo hodnocení
        const clerkId = window.Clerk?.user?.id;
        if (clerkId) {
            const userRating = await window.LiquiMixerDB.getUserFlavorRating(clerkId, flavorId);
            if (userRating) {
                highlightFlavorRatingStars(userRating);
            }
        }
        
        // Zobrazit stránku
        showPage('flavor-detail');
        
        // Aplikovat překlady
        if (window.i18n?.applyTranslations) {
            window.i18n.applyTranslations();
        }
    } catch (error) {
        console.error('Error loading flavor detail:', error);
        showNotification(t('common.error', 'Chyba při načítání detailu'), 'error');
    }
}

// Vykreslit obsah detailu příchutě
function renderFlavorDetailContent(flavor) {
    const manufacturerName = flavor.flavor_manufacturers?.name || flavor.manufacturer_code;
    const categoryTranslation = t(`form.flavor_${flavor.category}`, flavor.category);
    const typeLabel = flavor.product_type === 'vape' 
        ? t('flavor_database.filter_type_vape', 'Vape') 
        : t('flavor_database.filter_type_shisha', 'Shisha');
    
    // Procento
    // Zkontrolovat zda má příchuť přesné hodnoty od výrobce
    const hasExactPercent = flavor.min_percent && flavor.max_percent && flavor.min_percent > 0 && flavor.max_percent > 0;
    const hasExactSteepDays = flavor.steep_days !== null && flavor.steep_days !== undefined && flavor.steep_days > 0;
    
    // Získat výchozí hodnoty z flavorDatabase podle kategorie (pro fallback)
    const category = flavor.category || 'fruit';
    const isShisha = flavor.product_type === 'shisha';
    const defaultFlavorData = flavorDatabase[category] || flavorDatabase.fruit;
    
    // Procenta - buď přesné od výrobce nebo fallback s upozorněním
    let percentRange, percentNote = '';
    if (hasExactPercent) {
        percentRange = `${flavor.min_percent} - ${flavor.max_percent}%`;
    } else {
        const fallbackMin = isShisha ? (defaultFlavorData.shishaMin || 15) : (defaultFlavorData.min || 5);
        const fallbackMax = isShisha ? (defaultFlavorData.shishaMax || 25) : (defaultFlavorData.max || 15);
        percentRange = `${fallbackMin} - ${fallbackMax}%`;
        percentNote = `<span class="detail-note">(${t('flavor_database.values_from_category', 'dle kategorie - výrobce neuvedl')})</span>`;
    }
    
    // Steep days - buď přesné od výrobce nebo fallback s upozorněním
    let steepDays, steepNote = '';
    if (hasExactSteepDays) {
        steepDays = t('flavor_database.detail_steep_days', '{days} dní').replace('{days}', flavor.steep_days);
    } else {
        const fallbackSteep = isShisha ? (defaultFlavorData.shishaSteepingDays || 3) : (defaultFlavorData.steepingDays || 7);
        steepDays = t('flavor_database.detail_steep_days', '{days} dní').replace('{days}', fallbackSteep);
        steepNote = `<span class="detail-note">(${t('flavor_database.values_from_category', 'dle kategorie - výrobce neuvedl')})</span>`;
    }
    
    // Hodnocení
    const avgRating = flavor.avg_rating ? parseFloat(flavor.avg_rating).toFixed(1) : '0.0';
    const ratingCount = flavor.rating_count || 0;
    
    return `
        <div class="flavor-detail-grid">
            <div class="detail-section">
                <h3 class="detail-section-title" data-i18n="flavor_database.detail_manufacturer">Výrobce</h3>
                <p class="detail-value">${escapeHtml(manufacturerName)}</p>
            </div>
            
            <div class="detail-section">
                <h3 class="detail-section-title" data-i18n="flavor_database.filter_type">Typ</h3>
                <p class="detail-value">${typeLabel}</p>
            </div>
            
            <div class="detail-section">
                <h3 class="detail-section-title" data-i18n="flavor_database.detail_category">Kategorie</h3>
                <p class="detail-value">${escapeHtml(categoryTranslation)}</p>
            </div>
            
            <div class="detail-section">
                <h3 class="detail-section-title" data-i18n="flavor_database.detail_recommended_percent">Doporučené %</h3>
                <p class="detail-value">${percentRange} ${percentNote}</p>
            </div>
            
            <div class="detail-section">
                <h3 class="detail-section-title" data-i18n="flavor_database.detail_steep_time">Doba zrání</h3>
                <p class="detail-value">${steepDays} ${steepNote}</p>
            </div>
            
            <div class="detail-section">
                <h3 class="detail-section-title" data-i18n="rating.title">Hodnocení</h3>
                <div class="rating-display-large">
                    <span class="rating-value-large">${avgRating}</span>
                    <span class="rating-stars-large">${'★'.repeat(Math.round(flavor.avg_rating || 0))}${'☆'.repeat(5 - Math.round(flavor.avg_rating || 0))}</span>
                    <span class="rating-count">(${ratingCount} ${t('rating.votes', 'hlasů')})</span>
                </div>
            </div>
        </div>
        
        <div class="user-rating-section">
            <h3 class="detail-section-title" data-i18n="flavor_database.your_rating">Vaše hodnocení</h3>
            <div class="rating-input flavor-rating-input">
                <span class="rating-star" data-rating="1" onclick="rateFlavorStar(1)">☆</span>
                <span class="rating-star" data-rating="2" onclick="rateFlavorStar(2)">☆</span>
                <span class="rating-star" data-rating="3" onclick="rateFlavorStar(3)">☆</span>
                <span class="rating-star" data-rating="4" onclick="rateFlavorStar(4)">☆</span>
                <span class="rating-star" data-rating="5" onclick="rateFlavorStar(5)">☆</span>
            </div>
        </div>
    `;
}

// Hodnotit příchuť hvězdičkou
async function rateFlavorStar(rating) {
    const clerkId = window.Clerk?.user?.id;
    if (!clerkId) {
        showLoginRequiredModal();
        return;
    }
    
    if (!currentFlavorDetail) return;
    
    try {
        const result = await window.LiquiMixerDB.addFlavorRating(clerkId, currentFlavorDetail.id, rating);
        
        if (result.error) {
            showNotification(t('common.error', 'Chyba při hodnocení'), 'error');
            return;
        }
        
        highlightFlavorRatingStars(rating);
        showNotification(t('rating.thank_you', 'Děkujeme za hodnocení!'), 'success');
        
        // Aktualizovat zobrazení průměru (znovu načíst příchuť)
        const updatedFlavor = await window.LiquiMixerDB.getFlavorById(currentFlavorDetail.id);
        if (updatedFlavor) {
            currentFlavorDetail = updatedFlavor;
            // Aktualizovat pouze rating display
            const avgRating = updatedFlavor.avg_rating ? parseFloat(updatedFlavor.avg_rating).toFixed(1) : '0.0';
            const ratingValueEl = document.querySelector('.rating-value-large');
            const ratingStarsEl = document.querySelector('.rating-stars-large');
            const ratingCountEl = document.querySelector('.rating-count');
            if (ratingValueEl) ratingValueEl.textContent = avgRating;
            if (ratingStarsEl) ratingStarsEl.textContent = '★'.repeat(Math.round(updatedFlavor.avg_rating || 0)) + '☆'.repeat(5 - Math.round(updatedFlavor.avg_rating || 0));
            if (ratingCountEl) ratingCountEl.textContent = `(${updatedFlavor.rating_count || 0} ${t('rating.votes', 'hlasů')})`;
        }
    } catch (error) {
        console.error('Error rating flavor:', error);
        showNotification(t('common.error', 'Chyba při hodnocení'), 'error');
    }
}

// Zvýraznit hvězdičky hodnocení příchutě
function highlightFlavorRatingStars(rating) {
    const stars = document.querySelectorAll('.flavor-rating-input .rating-star');
    stars.forEach((star, index) => {
        if (index < rating) {
            star.textContent = '★';
            star.classList.add('active');
        } else {
            star.textContent = '☆';
            star.classList.remove('active');
        }
    });
}

// Uložit aktuální příchuť do oblíbených
async function saveCurrentFlavorToFavorites() {
    const clerkId = window.Clerk?.user?.id;
    if (!clerkId) {
        showLoginRequiredModal();
        return;
    }
    
    if (!currentFlavorDetail) return;
    
    try {
        const result = await window.LiquiMixerDB.saveFlavorToFavorites(clerkId, currentFlavorDetail.id);
        
        if (result.error) {
            if (result.error.message?.includes('duplicate')) {
                showNotification(t('products.already_saved', 'Product already saved'), 'info');
            } else {
                showNotification(t('common.error', 'Chyba při ukládání'), 'error');
            }
            return;
        }
        
        showNotification(t('flavor_database.saved_to_favorites', 'Saved to favorites!'), 'success');
    } catch (error) {
        console.error('Error saving flavor to favorites:', error);
        showNotification(t('common.error', 'Chyba při ukládání'), 'error');
    }
}

// =============================================
// ZOBRAZENÍ DETAILU PŘÍCHUTĚ Z RECEPTU
// =============================================

// Proměnná pro uložení kontextu, odkud byl detail příchutě otevřen
let flavorDetailContext = null;

// Zobrazit detail příchutě z receptu - s tlačítky "Uložit k sobě" a "Zpět"
// Pokud má flavor_id, zobrazí plný detail jako v databázi příchutí
// Pokud nemá flavor_id (vlastní příchuť), zobrazí základní informace
async function showFlavorDetailFromRecipe(flavorId, flavorLink, isSharedRecipe = false) {
    try {
        // Uložit kontext pro navigaci zpět
        flavorDetailContext = {
            isSharedRecipe: isSharedRecipe,
            flavorLink: flavorLink
        };
        
        // Pokud máme flavor_id, načíst plná data z veřejné databáze
        if (flavorId && isValidUUID(flavorId)) {
            const flavor = await window.LiquiMixerDB.getFlavorById(flavorId);
            
            if (flavor) {
                // Uložit pro případné uložení do oblíbených
                currentFlavorDetail = flavor;
                
                // Nastavit titulek
                document.getElementById('flavorDetailFromRecipeTitle').textContent = flavor.name;
                
                // Vykreslit detail jako v databázi příchutí
                const contentContainer = document.getElementById('flavorDetailFromRecipeContent');
                contentContainer.innerHTML = renderFlavorDetailContent(flavor);
                
                // Načíst uživatelovo hodnocení
                const clerkId = window.Clerk?.user?.id;
                if (clerkId) {
                    const userRating = await window.LiquiMixerDB.getUserFlavorRating(clerkId, flavorId);
                    if (userRating) {
                        highlightFlavorRatingStarsInRecipeDetail(userRating);
                    }
                }
                
                // Zobrazit stránku
                showPage('flavor-detail-from-recipe');
                
                // Aplikovat překlady
                if (window.i18n?.applyTranslations) {
                    window.i18n.applyTranslations();
                }
                return;
            }
        }
        
        // Fallback - nemáme flavor_id nebo příchuť nebyla nalezena
        // Zobrazit základní informace z flavorLink
        const flavorName = flavorLink?.flavor_name || flavorLink?.flavor?.name || t('common.unknown', 'Neznámá');
        const manufacturer = flavorLink?.flavor_manufacturer || flavorLink?.flavor?.manufacturer_name || '';
        const percentage = flavorLink?.percentage || 0;
        const category = flavorLink?.generic_flavor_type || flavorLink?.flavor?.category || '';
        
        document.getElementById('flavorDetailFromRecipeTitle').textContent = flavorName;
        
        const contentContainer = document.getElementById('flavorDetailFromRecipeContent');
        contentContainer.innerHTML = renderBasicFlavorDetailContent(flavorName, manufacturer, percentage, category);
        
        currentFlavorDetail = null; // Není z veřejné DB, nelze uložit
        
        showPage('flavor-detail-from-recipe');
        
        if (window.i18n?.applyTranslations) {
            window.i18n.applyTranslations();
        }
        
    } catch (error) {
        console.error('Error loading flavor detail from recipe:', error);
        showNotification(t('common.error', 'Chyba při načítání detailu'), 'error');
    }
}

// Vykreslit základní detail příchutě (bez dat z veřejné DB)
function renderBasicFlavorDetailContent(name, manufacturer, percentage, category) {
    const categoryTranslation = category ? t(`form.flavor_${category}`, category) : '-';
    const manufacturerDisplay = manufacturer || t('common.unknown', 'Neznámý');
    
    return `
        <div class="flavor-detail-grid">
            <div class="detail-section">
                <h3 class="detail-section-title" data-i18n="flavor_database.detail_manufacturer">Výrobce</h3>
                <p class="detail-value">${escapeHtml(manufacturerDisplay)}</p>
            </div>
            
            <div class="detail-section">
                <h3 class="detail-section-title" data-i18n="flavor_database.detail_category">Kategorie</h3>
                <p class="detail-value">${escapeHtml(categoryTranslation)}</p>
            </div>
            
            <div class="detail-section">
                <h3 class="detail-section-title" data-i18n="flavor_database.detail_used_percent">Použité %</h3>
                <p class="detail-value">${percentage}%</p>
            </div>
        </div>
        
        <div class="flavor-not-in-database-notice">
            <p data-i18n="flavor_database.not_in_public_db">Tato příchuť není ve veřejné databázi.</p>
        </div>
    `;
}

// Zvýraznit hvězdičky hodnocení v detailu příchutě z receptu
function highlightFlavorRatingStarsInRecipeDetail(rating) {
    const container = document.getElementById('flavorDetailFromRecipeContent');
    if (!container) return;
    
    const stars = container.querySelectorAll('.rating-star');
    stars.forEach((star, index) => {
        if (index < rating) {
            star.textContent = '★';
            star.classList.add('active');
        } else {
            star.textContent = '☆';
            star.classList.remove('active');
        }
    });
}

// Uložit příchuť z detailu receptu do oblíbených
async function saveFlavorFromRecipeToFavorites() {
    const clerkId = window.Clerk?.user?.id;
    if (!clerkId) {
        showLoginRequiredModal();
        return;
    }
    
    if (!currentFlavorDetail) {
        showNotification(t('flavor_database.not_in_public_db', 'Tato příchuť není ve veřejné databázi.'), 'info');
        return;
    }
    
    try {
        const result = await window.LiquiMixerDB.saveFlavorToFavorites(clerkId, currentFlavorDetail.id);
        
        if (result.error) {
            if (result.error.message?.includes('duplicate')) {
                showNotification(t('products.already_saved', 'Product already saved'), 'info');
            } else {
                showNotification(t('common.error', 'Chyba při ukládání'), 'error');
            }
            return;
        }
        
        showNotification(t('flavor_database.saved_to_favorites', 'Saved to favorites!'), 'success');
    } catch (error) {
        console.error('Error saving flavor to favorites:', error);
        showNotification(t('common.error', 'Chyba při ukládání'), 'error');
    }
}

// Zpět z detailu příchutě receptu
function goBackFromFlavorDetailFromRecipe() {
    if (flavorDetailContext?.isSharedRecipe) {
        showPage('shared-recipe');
    } else {
        showPage('recipe-detail');
    }
    flavorDetailContext = null;
}

// =============================================
// FLAVOR AUTOCOMPLETE PRO RECEPTY
// =============================================

let flavorAutocompleteTimeout = null;
let activeAutocompleteInput = null;

// Inicializace flavor autocomplete pro input element
function initFlavorAutocomplete(inputId, recipeType, onSelectCallback) {
    const input = document.getElementById(inputId);
    if (!input) return;
    
    // Vytvořit dropdown kontejner
    const dropdownId = `${inputId}-autocomplete`;
    let dropdown = document.getElementById(dropdownId);
    if (!dropdown) {
        dropdown = document.createElement('div');
        dropdown.id = dropdownId;
        dropdown.className = 'flavor-autocomplete-dropdown hidden';
        input.parentNode.appendChild(dropdown);
    }
    
    // Event listenery
    input.addEventListener('focus', () => {
        activeAutocompleteInput = inputId;
        searchFlavorsForInput(inputId, recipeType, onSelectCallback);
    });
    
    input.addEventListener('input', () => {
        // Pokud uživatel ručně mění text a byla vybraná konkrétní příchuť, zrušit výběr a odblokovat kategorii
        if (input.dataset.flavorData) {
            delete input.dataset.flavorData;
            delete input.dataset.flavorId;
            delete input.dataset.favoriteProductId;
            input.dataset.flavorSource = '';
            updateFlavorCategoryState(inputId, false);
            unlockFlavorVgPgRatio(inputId);
        }
        clearTimeout(flavorAutocompleteTimeout);
        flavorAutocompleteTimeout = setTimeout(() => {
            searchFlavorsForInput(inputId, recipeType, onSelectCallback);
        }, 250);
    });
    
    input.addEventListener('blur', () => {
        // Delay pro umožnění kliknutí na položku
        setTimeout(() => {
            if (activeAutocompleteInput === inputId) {
                dropdown.classList.add('hidden');
            }
        }, 200);
    });
}

// Vyhledat příchutě pro autocomplete
async function searchFlavorsForInput(inputId, recipeType, onSelectCallback) {
    const input = document.getElementById(inputId);
    const dropdown = document.getElementById(`${inputId}-autocomplete`);
    if (!input || !dropdown) return;
    
    const searchTerm = input.value.trim();
    const clerkId = window.Clerk?.user?.id;
    
    try {
        const results = await window.LiquiMixerDB.searchFlavorsForAutocomplete(
            clerkId, 
            searchTerm, 
            recipeType, 
            10
        );
        
        renderAutocompleteDropdown(dropdown, results, inputId, recipeType, onSelectCallback);
    } catch (e) {
        console.error('Flavor autocomplete error:', e);
    }
}

// Vykreslit dropdown s výsledky
function renderAutocompleteDropdown(dropdown, results, inputId, recipeType, onSelectCallback) {
    const { favorites, database } = results;
    
    let html = '';
    html += `<div class="autocomplete-section">`;
    
    // "Nezadat konkrétní příchuť" VŽDY JAKO PRVNÍ A PŘEDNASTAVENÁ VOLBA
    html += `
        <div class="autocomplete-item no-specific highlighted" onclick="selectNoSpecificFlavor('${inputId}')">
            <span>${t('flavor_autocomplete.no_specific', 'No specific flavor')}</span>
        </div>
    `;
    
    // Oblíbené příchutě uživatele
    if (favorites.length > 0) {
        html += `<div class="autocomplete-header">${t('flavor_autocomplete.from_favorites', 'Z mých příchutí')}</div>`;
        favorites.forEach(f => {
            const typeClass = f.product_type === 'vape' ? 'type-vape' : 'type-shisha';
            const percentInfo = f.min_percent && f.max_percent ? `${f.min_percent}-${f.max_percent}%` : '';
            const manufacturerDisplay = f.manufacturer || f.manufacturer_code || '';
            html += `
                <div class="autocomplete-item" onclick="selectFlavorFromAutocomplete('${inputId}', ${JSON.stringify(f).replace(/"/g, '&quot;')}, '${recipeType}')">
                    <div class="flavor-info">
                        <span class="flavor-name">${escapeHtml(f.name)}</span>
                        ${manufacturerDisplay ? `<span class="flavor-manufacturer">${escapeHtml(manufacturerDisplay)}</span>` : ''}
                    </div>
                    <div class="flavor-meta">
                        ${percentInfo ? `<span class="flavor-percent">${percentInfo}</span>` : ''}
                        <span class="flavor-type-badge small ${typeClass}">${f.product_type === 'vape' ? 'V' : 'S'}</span>
                    </div>
                </div>
            `;
        });
    }
    
    // Veřejná databáze
    if (database.length > 0) {
        html += `<div class="autocomplete-header">${t('flavor_autocomplete.from_database', 'Veřejná databáze')}</div>`;
        database.forEach(f => {
            const typeClass = f.product_type === 'vape' ? 'type-vape' : 'type-shisha';
            const percentInfo = f.min_percent && f.max_percent ? `${f.min_percent}-${f.max_percent}%` : '';
            const manufacturerDisplay = f.manufacturer || f.manufacturer_code || '';
            html += `
                <div class="autocomplete-item" onclick="selectFlavorFromAutocomplete('${inputId}', ${JSON.stringify(f).replace(/"/g, '&quot;')}, '${recipeType}')">
                    <div class="flavor-info">
                        <span class="flavor-name">${escapeHtml(f.name)}</span>
                        ${manufacturerDisplay ? `<span class="flavor-manufacturer">${escapeHtml(manufacturerDisplay)}</span>` : ''}
                    </div>
                    <div class="flavor-meta">
                        ${percentInfo ? `<span class="flavor-percent">${percentInfo}</span>` : ''}
                        <span class="flavor-type-badge small ${typeClass}">${f.product_type === 'vape' ? 'V' : 'S'}</span>
                    </div>
                </div>
            `;
        });
    }
    
    // Prázdný výsledek (jen pokud žádné oblíbené ani z databáze)
    if (favorites.length === 0 && database.length === 0) {
        html += `<div class="autocomplete-empty">${t('flavor_autocomplete.no_results', 'No matching flavors')}</div>`;
    }
    
    html += '</div>';
    
    dropdown.innerHTML = html;
    dropdown.classList.remove('hidden');
}

// Vybrat příchuť z autocomplete
function selectFlavorFromAutocomplete(inputId, flavorData, recipeType) {
    const input = document.getElementById(inputId);
    const dropdown = document.getElementById(`${inputId}-autocomplete`);
    
    if (!input) return;
    
    // Zkontrolovat konflikt typu - nyní by neměl nastat díky filtrování
    const isVapeRecipe = ['liquid', 'liquid_pro', 'shakevape', 'shortfill'].includes(recipeType);
    const isShishaRecipe = recipeType === 'shisha';
    
    if ((isVapeRecipe && flavorData.product_type === 'shisha') || 
        (isShishaRecipe && flavorData.product_type === 'vape')) {
        const typeLabel = flavorData.product_type === 'vape' ? 'vape' : 'shisha';
        const warningMsg = t('flavor_form.type_conflict_warning', 'This flavor is for {type}. Are you sure you want to use it in this recipe?')
            .replace('{type}', typeLabel);
        
        if (!confirm(warningMsg)) {
            return;
        }
    }
    
    // Nastavit hodnotu do inputu
    input.value = flavorData.name;
    // Pro oblíbené příchutě použít flavor_id (ID v tabulce flavors), pro databázové použít id
    const isFavorite = flavorData.source === 'favorites' || flavorData.source === 'favorite';
    // flavorId = ID příchutě v tabulce flavors (pro ukládání do oblíbených)
    input.dataset.flavorId = isFavorite ? (flavorData.flavor_id || flavorData.id || '') : (flavorData.id || '');
    // favoriteProductId = ID v tabulce favorite_products (pouze pro oblíbené)
    input.dataset.favoriteProductId = isFavorite ? (flavorData.id || '') : '';
    // Zdroj příchutě: 'favorite' pro oblíbené, 'database' pro veřejnou DB
    input.dataset.flavorSource = isFavorite ? 'favorite' : 'database';
    input.dataset.flavorData = JSON.stringify(flavorData);
    
    // Skrýt dropdown
    if (dropdown) {
        dropdown.classList.add('hidden');
    }
    
    // Deaktivovat kategorie select - příchuť má svou kategorii
    updateFlavorCategoryState(inputId, true);
    
    // Zobrazit slider a nastavit rozsah dle příchutě
    showFlavorSliderWithRange(inputId, flavorData);
    
    // Aktualizovat steep time pokud existuje
    if (flavorData.steep_days) {
        updateRecipeSteepTime(flavorData.steep_days);
    }
    
    // Tweak tobacco — zobrazit vybraný tabák jako chip
    if (inputId === 'shTweakTobaccoAutocomplete') {
        displayTweakSelectedTobacco(flavorData);
    }
}

// Vybrat "Nezadat konkrétní příchuť"
function selectNoSpecificFlavor(inputId) {
    const input = document.getElementById(inputId);
    const dropdown = document.getElementById(`${inputId}-autocomplete`);
    
    if (input) {
        input.value = t('flavor_autocomplete.no_specific', 'No specific flavor');
        input.dataset.flavorId = '';
        input.dataset.flavorSource = 'generic';
        input.dataset.flavorData = '';
    }
    
    if (dropdown) {
        dropdown.classList.add('hidden');
    }
    
    // Aktivovat kategorie select - uživatel MUSÍ vybrat kategorii
    updateFlavorCategoryState(inputId, false);
    
    // Odemknout VG/PG poměr - uživatel může měnit
    unlockFlavorVgPgRatio(inputId);
    
    // Slider se zobrazí/skryje automaticky dle výběru kategorie
    // Pro Liquid formulář ponechat stávající logiku v updateFlavorType()
}

// Inicializovat flavor autocomplete pro všechny formuláře receptů
function initRecipeFlavorAutocomplete() {
    // Liquid formulář
    if (document.getElementById('flavorAutocomplete')) {
        initFlavorAutocomplete('flavorAutocomplete', 'liquid', (flavorData) => {
            console.log('Selected flavor:', flavorData);
        });
    }
    
    // Liquid PRO - příchutě 1-4
    for (let i = 1; i <= 4; i++) {
        const inputId = `proFlavorAutocomplete${i}`;
        if (document.getElementById(inputId)) {
            initFlavorAutocomplete(inputId, 'liquid_pro', (flavorData) => {
                console.log('Selected PRO flavor', i, flavorData);
            });
        }
    }
    
    // Shisha Mode 1: Tobacco autocomplete (search shisha tobacco products)
    for (let i = 1; i <= 4; i++) {
        const inputId = `shTobaccoAutocomplete${i}`;
        if (document.getElementById(inputId)) {
            initFlavorAutocomplete(inputId, 'shisha', (flavorData) => {
                console.log('Selected Shisha tobacco', i, flavorData);
            });
        }
    }
    
    // Shisha Tweak: tobacco autocomplete (select from favorites)
    {
        const inputId = 'shTweakTobaccoAutocomplete';
        if (document.getElementById(inputId)) {
            initFlavorAutocomplete(inputId, 'shisha', (flavorData) => {
                displayTweakSelectedTobacco(flavorData);
            });
        }
    }
    
    // Shisha Tweak: flavor autocomplete (vape concentrates)
    {
        const inputId = 'shTweakFlavorAutocomplete1';
        if (document.getElementById(inputId)) {
            initFlavorAutocomplete(inputId, 'liquid', (flavorData) => {
                console.log('Selected Tweak flavor', flavorData);
            });
        }
    }
    
    // Shisha Mode 2: DIY flavor autocomplete (vape concentrates)
    for (let i = 1; i <= 4; i++) {
        const inputId = `shDiyFlavorAutocomplete${i}`;
        if (document.getElementById(inputId)) {
            initFlavorAutocomplete(inputId, 'liquid', (flavorData) => {
                console.log('Selected DIY flavor', i, flavorData);
                autoRecalculateShishaDiyVgPgRatio();
            });
        }
    }
    
    // Shisha Mode 3: Molasses flavor autocomplete (vape concentrates)
    for (let i = 1; i <= 4; i++) {
        const inputId = `shMolFlavorAutocomplete${i}`;
        if (document.getElementById(inputId)) {
            initFlavorAutocomplete(inputId, 'liquid', (flavorData) => {
                console.log('Selected Mol flavor', i, flavorData);
                autoRecalculateShishaMolVgPgRatio();
            });
        }
    }
}

// Zobrazit slider pro konkrétní příchuť a nastavit rozsah
function showFlavorSliderWithRange(inputId, flavorData) {
    // Mapování autocomplete inputu na slider container a slider
    const sliderMapping = {
        'flavorAutocomplete': {
            containerId: 'flavorStrengthContainer',
            sliderId: 'flavorStrength',
            valueId: 'flavorValue',
            descriptionId: 'flavorDescription'
        },
        'proFlavorAutocomplete1': {
            containerId: 'proFlavorStrengthContainer1',
            sliderId: 'proFlavorStrength1',
            valueId: 'proFlavorValue1',
            descriptionId: null
        },
        'proFlavorAutocomplete2': {
            containerId: 'proFlavorStrengthContainer2',
            sliderId: 'proFlavorStrength2',
            valueId: 'proFlavorValue2',
            descriptionId: null
        },
        'proFlavorAutocomplete3': {
            containerId: 'proFlavorStrengthContainer3',
            sliderId: 'proFlavorStrength3',
            valueId: 'proFlavorValue3',
            descriptionId: null
        },
        'proFlavorAutocomplete4': {
            containerId: 'proFlavorStrengthContainer4',
            sliderId: 'proFlavorStrength4',
            valueId: 'proFlavorValue4',
            descriptionId: null
        },
        // Shisha Tweak: flavor autocomplete
        'shTweakFlavorAutocomplete1': {
            containerId: 'shTweakFlavorStrengthContainer1',
            sliderId: 'shTweakFlavorStrength1',
            valueId: 'shTweakFlavorValue1',
            descriptionId: 'shTweakFlavorStrengthDisplay1'
        },
        'shTweakFlavorAutocomplete2': {
            containerId: 'shTweakFlavorStrengthContainer2',
            sliderId: 'shTweakFlavorStrength2',
            valueId: 'shTweakFlavorValue2',
            descriptionId: 'shTweakFlavorStrengthDisplay2'
        },
        'shTweakFlavorAutocomplete3': {
            containerId: 'shTweakFlavorStrengthContainer3',
            sliderId: 'shTweakFlavorStrength3',
            valueId: 'shTweakFlavorValue3',
            descriptionId: 'shTweakFlavorStrengthDisplay3'
        },
        'shTweakFlavorAutocomplete4': {
            containerId: 'shTweakFlavorStrengthContainer4',
            sliderId: 'shTweakFlavorStrength4',
            valueId: 'shTweakFlavorValue4',
            descriptionId: 'shTweakFlavorStrengthDisplay4'
        },
        // Shisha Mode 2: DIY flavor autocomplete
        'shDiyFlavorAutocomplete1': {
            containerId: 'shDiyFlavorStrengthContainer1',
            sliderId: 'shDiyFlavorStrength1',
            valueId: 'shDiyFlavorValue1',
            descriptionId: 'shDiyFlavorStrengthDisplay1'
        },
        'shDiyFlavorAutocomplete2': {
            containerId: 'shDiyFlavorStrengthContainer2',
            sliderId: 'shDiyFlavorStrength2',
            valueId: 'shDiyFlavorValue2',
            descriptionId: 'shDiyFlavorStrengthDisplay2'
        },
        'shDiyFlavorAutocomplete3': {
            containerId: 'shDiyFlavorStrengthContainer3',
            sliderId: 'shDiyFlavorStrength3',
            valueId: 'shDiyFlavorValue3',
            descriptionId: 'shDiyFlavorStrengthDisplay3'
        },
        'shDiyFlavorAutocomplete4': {
            containerId: 'shDiyFlavorStrengthContainer4',
            sliderId: 'shDiyFlavorStrength4',
            valueId: 'shDiyFlavorValue4',
            descriptionId: 'shDiyFlavorStrengthDisplay4'
        },
        // Shisha Mode 3: Molasses flavor autocomplete
        'shMolFlavorAutocomplete1': {
            containerId: 'shMolFlavorStrengthContainer1',
            sliderId: 'shMolFlavorStrength1',
            valueId: 'shMolFlavorValue1',
            descriptionId: 'shMolFlavorStrengthDisplay1'
        },
        'shMolFlavorAutocomplete2': {
            containerId: 'shMolFlavorStrengthContainer2',
            sliderId: 'shMolFlavorStrength2',
            valueId: 'shMolFlavorValue2',
            descriptionId: 'shMolFlavorStrengthDisplay2'
        },
        'shMolFlavorAutocomplete3': {
            containerId: 'shMolFlavorStrengthContainer3',
            sliderId: 'shMolFlavorStrength3',
            valueId: 'shMolFlavorValue3',
            descriptionId: 'shMolFlavorStrengthDisplay3'
        },
        'shMolFlavorAutocomplete4': {
            containerId: 'shMolFlavorStrengthContainer4',
            sliderId: 'shMolFlavorStrength4',
            valueId: 'shMolFlavorValue4',
            descriptionId: 'shMolFlavorStrengthDisplay4'
        }
    };
    
    let mapping = sliderMapping[inputId];
    // Dynamický fallback pro dynamicky generované indexy (shTweak, shDiy, shMol)
    if (!mapping) {
        const dynMatch = inputId.match(/^(shTweakFlavor|shDiyFlavor|shMolFlavor)Autocomplete(\d+)$/);
        if (dynMatch) {
            const prefix = dynMatch[1];
            const idx = dynMatch[2];
            mapping = {
                containerId: `${prefix}StrengthContainer${idx}`,
                sliderId: `${prefix}Strength${idx}`,
                valueId: `${prefix}Value${idx}`,
                descriptionId: `${prefix}StrengthDisplay${idx}`
            };
        }
    }
    if (!mapping) return;
    
    const container = document.getElementById(mapping.containerId);
    const slider = document.getElementById(mapping.sliderId);
    const valueDisplay = document.getElementById(mapping.valueId);
    const descriptionDisplay = mapping.descriptionId ? document.getElementById(mapping.descriptionId) : null;
    
    if (!container || !slider) return;
    
    // Zobrazit container
    container.classList.remove('hidden');
    
    // Zkontrolovat zda má příchuť přesné hodnoty od výrobce
    const hasExactPercent = flavorData.min_percent && flavorData.max_percent && 
                            flavorData.min_percent > 0 && flavorData.max_percent > 0;
    
    // Nastavit rozsah slideru dle příchutě nebo fallback dle kategorie
    let minPercent, maxPercent, recommendedPercent;
    
    if (hasExactPercent) {
        minPercent = flavorData.min_percent;
        maxPercent = flavorData.max_percent;
        recommendedPercent = flavorData.recommended_percent || ((minPercent + maxPercent) / 2);
    } else {
        // Chybí ověřená data - nastavit na 0% a nechat uživatele zvolit
        minPercent = 0;
        maxPercent = 100;
        recommendedPercent = 0;
    }
    
    // Uložit původní min/max do data atributů
    slider.dataset.flavorMin = minPercent;
    slider.dataset.flavorMax = maxPercent;
    slider.dataset.flavorRecommended = recommendedPercent;
    slider.dataset.hasExactPercent = hasExactPercent ? 'true' : 'false';
    
    // Použít uloženou percentage hodnotu z receptu (pokud existuje), jinak doporučenou
    const savedPercent = flavorData.saved_percentage;
    const sliderValue = (savedPercent !== undefined && savedPercent !== null && savedPercent > 0) 
        ? savedPercent 
        : recommendedPercent;
    
    // Nastavit hodnotu slideru
    slider.value = sliderValue;
    
    // Aktualizovat zobrazení hodnoty (bez zaokrouhlení pro přesnost)
    if (valueDisplay) {
        // Zobrazit s 1 desetinným místem pokud není celé číslo
        const displayValue = Number.isInteger(sliderValue) ? sliderValue : sliderValue.toFixed(1);
        valueDisplay.textContent = displayValue;
    }
    
    // Najít track element a nastavit počáteční barvu
    const trackIdMap = {
        'flavorAutocomplete': 'flavorTrack',
        'proFlavorAutocomplete1': 'proFlavorTrack1',
        'proFlavorAutocomplete2': 'proFlavorTrack2',
        'proFlavorAutocomplete3': 'proFlavorTrack3',
        'proFlavorAutocomplete4': 'proFlavorTrack4',
        'shFlavorAutocomplete1': 'shFlavorTrack1',
        'shFlavorAutocomplete2': 'shFlavorTrack2',
        'shFlavorAutocomplete3': 'shFlavorTrack3',
        'shFlavorAutocomplete4': 'shFlavorTrack4',
        'shTweakFlavorAutocomplete1': 'shTweakFlavorTrack1',
        'shTweakFlavorAutocomplete2': 'shTweakFlavorTrack2',
        'shTweakFlavorAutocomplete3': 'shTweakFlavorTrack3',
        'shTweakFlavorAutocomplete4': 'shTweakFlavorTrack4',
        'shDiyFlavorAutocomplete1': 'shDiyFlavorTrack1',
        'shDiyFlavorAutocomplete2': 'shDiyFlavorTrack2',
        'shDiyFlavorAutocomplete3': 'shDiyFlavorTrack3',
        'shDiyFlavorAutocomplete4': 'shDiyFlavorTrack4',
        'shMolFlavorAutocomplete1': 'shMolFlavorTrack1',
        'shMolFlavorAutocomplete2': 'shMolFlavorTrack2',
        'shMolFlavorAutocomplete3': 'shMolFlavorTrack3',
        'shMolFlavorAutocomplete4': 'shMolFlavorTrack4'
    };
    
    let trackId = trackIdMap[inputId];
    if (!trackId) {
        const dynMatch = inputId.match(/^(shTweakFlavor|shDiyFlavor|shMolFlavor)Autocomplete(\d+)$/);
        if (dynMatch) trackId = `${dynMatch[1]}Track${dynMatch[2]}`;
    }
    const trackEl = trackId ? document.getElementById(trackId) : null;
    
    // Nastavit barvu tracku dle aktuální hodnoty a rozsahu
    if (trackEl) {
        if (!hasExactPercent) {
            // Chybí ověřená data → šedá
            trackEl.style.background = 'linear-gradient(90deg, #666666, #888888)';
        } else {
            const currentValue = parseFloat(sliderValue);
            if (currentValue < minPercent) {
                trackEl.style.background = 'linear-gradient(90deg, #ff6600, #ffaa00)';
            } else if (currentValue > maxPercent) {
                trackEl.style.background = 'linear-gradient(90deg, #00cc66, #ff0044)';
            } else {
                // Ideální rozsah - zelená/modrá
                trackEl.style.background = 'linear-gradient(90deg, #00cc66, #00aaff)';
            }
        }
    }
    
    // Nastavit barvu hodnoty pod sliderem
    if (valueDisplay && valueDisplay.parentElement) {
        let color;
        if (!hasExactPercent) {
            color = '#888888';
        } else {
            const currentValue = parseFloat(sliderValue);
            if (currentValue < minPercent) {
                color = '#ffaa00';
            } else if (currentValue > maxPercent) {
                color = '#ff0044';
            } else {
                color = '#00cc66';
            }
        }
        valueDisplay.parentElement.style.color = color;
    }
    
    // Aktualizovat popis - přidat upozornění pokud hodnoty nejsou od výrobce
    if (descriptionDisplay) {
        updateFlavorSliderDescription(slider.value, minPercent, maxPercent, descriptionDisplay, hasExactPercent);
    } else if (inputId === 'flavorAutocomplete') {
        // Pro Liquid formulář aktualizovat přes updateFlavorDisplay
        updateFlavorDisplay();
    }
    
    // Zobrazit/skrýt upozornění o fallback hodnotách
    showPercentFallbackWarning(inputId, hasExactPercent);
    
    // Zakázat VG/PG ratio slider - konkrétní příchuť má nastavený poměr od výrobce
    lockFlavorVgPgRatio(inputId, flavorData, hasExactPercent);
    
    // Přepočítat recept
    if (inputId === 'flavorAutocomplete') {
        autoRecalculateLiquidVgPgRatio();
    } else if (inputId.startsWith('proFlavor')) {
        const index = inputId.match(/\d+/)?.[0];
        if (index) updateProFlavorStrength(parseInt(index));
    } else if (inputId.startsWith('shDiyFlavor')) {
        const index = inputId.match(/\d+/)?.[0];
        if (index) updateShishaDiyFlavorStrength(parseInt(index));
        autoRecalculateShishaDiyVgPgRatio();
    } else if (inputId.startsWith('shMolFlavor')) {
        const index = inputId.match(/\d+/)?.[0];
        if (index) updateShishaMolFlavorStrength(parseInt(index));
        autoRecalculateShishaMolVgPgRatio();
    } else if (inputId.startsWith('shTweakFlavor')) {
        const index = inputId.match(/\d+/)?.[0];
        if (index) updateShishaTweakFlavorStrength(parseInt(index));
    } else if (inputId.startsWith('shFlavor')) {
        const index = inputId.match(/\d+/)?.[0];
        if (index) updateShishaFlavorStrength(parseInt(index));
    }
}

// Zobrazit upozornění když příchuť nemá přesné hodnoty procent
function showPercentFallbackWarning(inputId, hasExactPercent) {
    // Najít kontejner pro upozornění
    const mapping = {
        'flavorAutocomplete': 'flavorStrengthContainer',
        'proFlavorAutocomplete1': 'proFlavorStrengthContainer1',
        'proFlavorAutocomplete2': 'proFlavorStrengthContainer2',
        'proFlavorAutocomplete3': 'proFlavorStrengthContainer3',
        'proFlavorAutocomplete4': 'proFlavorStrengthContainer4',
        'shFlavorAutocomplete1': 'shFlavorStrengthContainer1',
        'shFlavorAutocomplete2': 'shFlavorStrengthContainer2',
        'shFlavorAutocomplete3': 'shFlavorStrengthContainer3',
        'shFlavorAutocomplete4': 'shFlavorStrengthContainer4',
        'shTweakFlavorAutocomplete1': 'shTweakFlavorStrengthContainer1',
        'shTweakFlavorAutocomplete2': 'shTweakFlavorStrengthContainer2',
        'shTweakFlavorAutocomplete3': 'shTweakFlavorStrengthContainer3',
        'shTweakFlavorAutocomplete4': 'shTweakFlavorStrengthContainer4',
        'shDiyFlavorAutocomplete1': 'shDiyFlavorStrengthContainer1',
        'shDiyFlavorAutocomplete2': 'shDiyFlavorStrengthContainer2',
        'shDiyFlavorAutocomplete3': 'shDiyFlavorStrengthContainer3',
        'shDiyFlavorAutocomplete4': 'shDiyFlavorStrengthContainer4',
        'shMolFlavorAutocomplete1': 'shMolFlavorStrengthContainer1',
        'shMolFlavorAutocomplete2': 'shMolFlavorStrengthContainer2',
        'shMolFlavorAutocomplete3': 'shMolFlavorStrengthContainer3',
        'shMolFlavorAutocomplete4': 'shMolFlavorStrengthContainer4'
    };
    
    let containerId = mapping[inputId];
    if (!containerId) {
        const dynMatch = inputId.match(/^(shTweakFlavor|shDiyFlavor|shMolFlavor)Autocomplete(\d+)$/);
        if (dynMatch) containerId = `${dynMatch[1]}StrengthContainer${dynMatch[2]}`;
    }
    if (!containerId) return;
    
    const container = document.getElementById(containerId);
    if (!container) return;
    
    // Najít nebo vytvořit element pro upozornění
    let warningEl = container.querySelector('.percent-fallback-warning');
    
    if (!hasExactPercent) {
        // Zobrazit upozornění
        if (!warningEl) {
            warningEl = document.createElement('div');
            warningEl.className = 'percent-fallback-warning';
            // Vložit na začátek kontejneru
            container.insertBefore(warningEl, container.firstChild);
        }
        warningEl.innerHTML = `<span class="warning-icon">⚠</span> ${t('flavor_form.percent_not_set', 'Doporučené % není nastaveno, chybí ověřená data. Nastavte dle doporučení výrobce.')}`;
        warningEl.classList.remove('hidden');
    } else {
        // Skrýt upozornění
        if (warningEl) {
            warningEl.classList.add('hidden');
        }
    }
}

// Zobrazit varování a nastavit slider na 0% při výběru kategorie příchutě (bez konkrétní příchutě z DB)
// Volá se z updateFlavorType, updateProFlavorType, updateShishaDiyFlavorType, updateShishaMolFlavorType, updateShishaTweakFlavorType
function showCategoryFlavorWarning(containerId, sliderId, valueId, trackId) {
    const container = document.getElementById(containerId);
    const slider = document.getElementById(sliderId);
    const valueDisplay = document.getElementById(valueId);
    const track = trackId ? document.getElementById(trackId) : null;
    if (!container || !slider) return;
    
    // Nastavit slider na 0%
    slider.value = 0;
    if (valueDisplay) valueDisplay.textContent = '0';
    
    // Šedá barva tracku
    if (track) {
        track.style.background = 'linear-gradient(90deg, #555, #777)';
        track.style.width = '100%';
    }
    
    // Šedá barva hodnoty
    if (valueDisplay && valueDisplay.parentElement) {
        valueDisplay.parentElement.style.color = '#999';
    }
    
    // Zobrazit varování
    let warningEl = container.querySelector('.percent-fallback-warning');
    if (!warningEl) {
        warningEl = document.createElement('div');
        warningEl.className = 'percent-fallback-warning';
        container.insertBefore(warningEl, container.firstChild);
    }
    warningEl.innerHTML = `<span class="warning-icon">⚠</span> ${t('flavor_form.percent_not_set', 'Doporučené % není nastaveno, chybí ověřená data. Nastavte dle doporučení výrobce.')}`;
    warningEl.classList.remove('hidden');
}

// Skrýt varování kategorie příchutě (volá se při výběru 'none' nebo při výběru konkrétní příchutě z autocomplete)
function hideCategoryFlavorWarning(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    const warningEl = container.querySelector('.percent-fallback-warning');
    if (warningEl) warningEl.classList.add('hidden');
}

// Zakázat změnu VG/PG poměru když je vybraná konkrétní příchuť z databáze
function lockFlavorVgPgRatio(inputId, flavorData, hasExactPercent = true) {
    // Mapování autocomplete inputu na VG/PG elementy
    const ratioMapping = {
        'flavorAutocomplete': {
            buttonsSelector: '.form-group-sub:has(#flavorRatio) .ratio-toggle-buttons button, #flavorRatio0100, #flavorRatio8020, #flavorRatio7030',
            ratioContainerId: 'flavorStrengthContainer'
        },
        'proFlavorAutocomplete1': {
            sliderId: 'proFlavorRatioSlider1',
            buttonsSelector: '[onclick*="adjustProFlavorRatio(1"]'
        },
        'proFlavorAutocomplete2': {
            sliderId: 'proFlavorRatioSlider2',
            buttonsSelector: '[onclick*="adjustProFlavorRatio(2"]'
        },
        'proFlavorAutocomplete3': {
            sliderId: 'proFlavorRatioSlider3',
            buttonsSelector: '[onclick*="adjustProFlavorRatio(3"]'
        },
        'proFlavorAutocomplete4': {
            sliderId: 'proFlavorRatioSlider4',
            buttonsSelector: '[onclick*="adjustProFlavorRatio(4"]'
        },
        'shFlavorAutocomplete1': {
            sliderId: 'shFlavorRatioSlider1',
            buttonsSelector: '[onclick*="adjustShishaFlavorRatio(1"]'
        },
        'shFlavorAutocomplete2': {
            sliderId: 'shFlavorRatioSlider2',
            buttonsSelector: '[onclick*="adjustShishaFlavorRatio(2"]'
        },
        'shFlavorAutocomplete3': {
            sliderId: 'shFlavorRatioSlider3',
            buttonsSelector: '[onclick*="adjustShishaFlavorRatio(3"]'
        },
        'shFlavorAutocomplete4': {
            sliderId: 'shFlavorRatioSlider4',
            buttonsSelector: '[onclick*="adjustShishaFlavorRatio(4"]'
        },
        'shDiyFlavorAutocomplete1': {
            sliderId: 'shDiyFlavorRatioSlider1',
            buttonsSelector: '[onclick*="adjustShishaDiyFlavorRatio(1"]'
        },
        'shDiyFlavorAutocomplete2': {
            sliderId: 'shDiyFlavorRatioSlider2',
            buttonsSelector: '[onclick*="adjustShishaDiyFlavorRatio(2"]'
        },
        'shDiyFlavorAutocomplete3': {
            sliderId: 'shDiyFlavorRatioSlider3',
            buttonsSelector: '[onclick*="adjustShishaDiyFlavorRatio(3"]'
        },
        'shDiyFlavorAutocomplete4': {
            sliderId: 'shDiyFlavorRatioSlider4',
            buttonsSelector: '[onclick*="adjustShishaDiyFlavorRatio(4"]'
        },
        'shMolFlavorAutocomplete1': {
            sliderId: 'shMolFlavorRatioSlider1',
            buttonsSelector: '[onclick*="adjustShishaMolFlavorRatio(1"]'
        },
        'shMolFlavorAutocomplete2': {
            sliderId: 'shMolFlavorRatioSlider2',
            buttonsSelector: '[onclick*="adjustShishaMolFlavorRatio(2"]'
        },
        'shMolFlavorAutocomplete3': {
            sliderId: 'shMolFlavorRatioSlider3',
            buttonsSelector: '[onclick*="adjustShishaMolFlavorRatio(3"]'
        },
        'shMolFlavorAutocomplete4': {
            sliderId: 'shMolFlavorRatioSlider4',
            buttonsSelector: '[onclick*="adjustShishaMolFlavorRatio(4"]'
        }
    };
    
    const mapping = ratioMapping[inputId];
    if (!mapping) return;
    
    // Pro Liquid formulář - toggle buttons
    if (inputId === 'flavorAutocomplete') {
        const buttons = document.querySelectorAll('#flavorRatio0100, #flavorRatio8020, #flavorRatio7030');
        const vgRatio = flavorData.vg_ratio !== undefined ? flavorData.vg_ratio : 0;
        
        buttons.forEach(btn => {
            btn.disabled = true;
            btn.classList.add('locked');
            btn.classList.remove('active');
        });
        
        // Nastavit správný poměr a označit jako aktivní
        const pgRatio = 100 - vgRatio;
        const ratioValue = `${vgRatio}/${pgRatio}`;
        const ratioInput = document.getElementById('flavorRatio');
        if (ratioInput) ratioInput.value = ratioValue;
        
        // Najít a aktivovat správné tlačítko
        const matchingBtn = Array.from(buttons).find(b => b.dataset.value === ratioValue);
        if (matchingBtn) {
            matchingBtn.classList.add('active');
        } else if (buttons[0]) {
            // Pokud není přesná shoda, nastavit první (0/100)
            buttons[0].classList.add('active');
        }
        
        // Přidat informaci že je zamčeno
        const ratioContainer = document.querySelector('.form-group-sub:has(#flavorRatio0100)');
        if (ratioContainer) {
            let lockNote = ratioContainer.querySelector('.ratio-lock-note');
            if (!lockNote) {
                lockNote = document.createElement('div');
                lockNote.className = 'ratio-lock-note';
                lockNote.setAttribute('data-i18n', 'flavor_form.ratio_locked');
                ratioContainer.appendChild(lockNote);
            }
            lockNote.textContent = t('flavor_form.ratio_locked', 'Poměr je nastaven dle výrobce');
            lockNote.classList.remove('hidden');
        }
    } else {
        // Pro PRO a Shisha formuláře - slider
        const slider = document.getElementById(mapping.sliderId);
        if (slider) {
            slider.disabled = true;
            slider.classList.add('locked');
            
            // Nastavit hodnotu dle příchutě
            const vgRatio = flavorData.vg_ratio !== undefined ? flavorData.vg_ratio : 0;
            slider.value = vgRatio;
            
            // Aktualizovat zobrazení
            if (inputId.startsWith('proFlavor')) {
                const index = inputId.match(/\d+/)?.[0];
                if (index) {
                    const vgDisplay = document.getElementById(`proFlavorVgValue${index}`);
                    const pgDisplay = document.getElementById(`proFlavorPgValue${index}`);
                    if (vgDisplay) vgDisplay.textContent = vgRatio;
                    if (pgDisplay) pgDisplay.textContent = 100 - vgRatio;
                }
            } else if (inputId.startsWith('shDiyFlavor')) {
                const index = inputId.match(/\d+$/)?.[0];
                if (index) {
                    const vgDisplay = document.getElementById(`shDiyFlavorVgValue${index}`);
                    const pgDisplay = document.getElementById(`shDiyFlavorPgValue${index}`);
                    if (vgDisplay) vgDisplay.textContent = vgRatio;
                    if (pgDisplay) pgDisplay.textContent = 100 - vgRatio;
                }
            } else if (inputId.startsWith('shMolFlavor')) {
                const index = inputId.match(/\d+$/)?.[0];
                if (index) {
                    const vgDisplay = document.getElementById(`shMolFlavorVgValue${index}`);
                    const pgDisplay = document.getElementById(`shMolFlavorPgValue${index}`);
                    if (vgDisplay) vgDisplay.textContent = vgRatio;
                    if (pgDisplay) pgDisplay.textContent = 100 - vgRatio;
                }
            } else if (inputId.startsWith('shFlavor')) {
                const index = inputId.match(/\d+/)?.[0];
                if (index) {
                    const vgDisplay = document.getElementById(`shFlavorVgValue${index}`);
                    const pgDisplay = document.getElementById(`shFlavorPgValue${index}`);
                    if (vgDisplay) vgDisplay.textContent = vgRatio;
                    if (pgDisplay) pgDisplay.textContent = 100 - vgRatio;
                }
            }
        }
        
        // Zakázat tlačítka pro úpravu
        const adjustButtons = document.querySelectorAll(mapping.buttonsSelector);
        adjustButtons.forEach(btn => {
            btn.disabled = true;
            btn.classList.add('locked');
        });
    }
}

// Odemknout VG/PG poměr když se odstraní konkrétní příchuť
function unlockFlavorVgPgRatio(inputId) {
    if (inputId === 'flavorAutocomplete') {
        const buttons = document.querySelectorAll('#flavorRatio0100, #flavorRatio8020, #flavorRatio7030');
        buttons.forEach(btn => {
            btn.disabled = false;
            btn.classList.remove('locked');
        });
        
        const lockNote = document.querySelector('.form-group-sub:has(#flavorRatio0100) .ratio-lock-note');
        if (lockNote) lockNote.classList.add('hidden');
    } else {
        const ratioMapping = {
            'proFlavorAutocomplete1': { sliderId: 'proFlavorRatioSlider1', buttonsSelector: '[onclick*="adjustProFlavorRatio(1"]' },
            'proFlavorAutocomplete2': { sliderId: 'proFlavorRatioSlider2', buttonsSelector: '[onclick*="adjustProFlavorRatio(2"]' },
            'proFlavorAutocomplete3': { sliderId: 'proFlavorRatioSlider3', buttonsSelector: '[onclick*="adjustProFlavorRatio(3"]' },
            'proFlavorAutocomplete4': { sliderId: 'proFlavorRatioSlider4', buttonsSelector: '[onclick*="adjustProFlavorRatio(4"]' },
            'shFlavorAutocomplete1': { sliderId: 'shFlavorRatioSlider1', buttonsSelector: '[onclick*="adjustShishaFlavorRatio(1"]' },
            'shFlavorAutocomplete2': { sliderId: 'shFlavorRatioSlider2', buttonsSelector: '[onclick*="adjustShishaFlavorRatio(2"]' },
            'shFlavorAutocomplete3': { sliderId: 'shFlavorRatioSlider3', buttonsSelector: '[onclick*="adjustShishaFlavorRatio(3"]' },
            'shFlavorAutocomplete4': { sliderId: 'shFlavorRatioSlider4', buttonsSelector: '[onclick*="adjustShishaFlavorRatio(4"]' },
            'shDiyFlavorAutocomplete1': { sliderId: 'shDiyFlavorRatioSlider1', buttonsSelector: '[onclick*="adjustShishaDiyFlavorRatio(1"]' },
            'shDiyFlavorAutocomplete2': { sliderId: 'shDiyFlavorRatioSlider2', buttonsSelector: '[onclick*="adjustShishaDiyFlavorRatio(2"]' },
            'shDiyFlavorAutocomplete3': { sliderId: 'shDiyFlavorRatioSlider3', buttonsSelector: '[onclick*="adjustShishaDiyFlavorRatio(3"]' },
            'shDiyFlavorAutocomplete4': { sliderId: 'shDiyFlavorRatioSlider4', buttonsSelector: '[onclick*="adjustShishaDiyFlavorRatio(4"]' },
            'shMolFlavorAutocomplete1': { sliderId: 'shMolFlavorRatioSlider1', buttonsSelector: '[onclick*="adjustShishaMolFlavorRatio(1"]' },
            'shMolFlavorAutocomplete2': { sliderId: 'shMolFlavorRatioSlider2', buttonsSelector: '[onclick*="adjustShishaMolFlavorRatio(2"]' },
            'shMolFlavorAutocomplete3': { sliderId: 'shMolFlavorRatioSlider3', buttonsSelector: '[onclick*="adjustShishaMolFlavorRatio(3"]' },
            'shMolFlavorAutocomplete4': { sliderId: 'shMolFlavorRatioSlider4', buttonsSelector: '[onclick*="adjustShishaMolFlavorRatio(4"]' }
        };
        
        const mapping = ratioMapping[inputId];
        if (!mapping) return;
        
        const slider = document.getElementById(mapping.sliderId);
        if (slider) {
            slider.disabled = false;
            slider.classList.remove('locked');
        }
        
        const adjustButtons = document.querySelectorAll(mapping.buttonsSelector);
        adjustButtons.forEach(btn => {
            btn.disabled = false;
            btn.classList.remove('locked');
        });
    }
}

// Aktualizovat popis slideru dle rozsahu konkrétní příchutě
function updateFlavorSliderDescription(value, minPercent, maxPercent, descriptionElement, hasExactPercent = true) {
    const percent = parseFloat(value);
    let description = '';
    let color = '#00cc66'; // default green
    
    // Pokud chybí ověřená data, nezobrazovat žádný popis rozsahu
    if (!hasExactPercent || (minPercent === 0 && maxPercent === 100)) {
        if (descriptionElement) {
            descriptionElement.textContent = '';
            descriptionElement.style.color = '';
            descriptionElement.style.borderLeftColor = '';
            descriptionElement.style.textShadow = '';
        }
        return;
    }
    
    if (percent < minPercent) {
        description = t('flavor_description.too_low', 'Pod doporučeným rozsahem ({min}-{max}%)')
            .replace('{min}', minPercent)
            .replace('{max}', maxPercent);
        color = '#ffaa00'; // orange
    } else if (percent > maxPercent) {
        description = t('flavor_description.too_high', 'Nad doporučeným rozsahem ({min}-{max}%)')
            .replace('{min}', minPercent)
            .replace('{max}', maxPercent);
        color = '#ff0044'; // red
    } else {
        description = t('flavor_description.ideal_range', 'Ideální rozsah ({min}-{max}%)')
            .replace('{min}', minPercent)
            .replace('{max}', maxPercent);
        color = '#00cc66'; // green
    }
    
    if (descriptionElement) {
        descriptionElement.textContent = description;
        descriptionElement.style.color = color;
        descriptionElement.style.borderLeftColor = color;
        descriptionElement.style.textShadow = `0 0 10px ${color}`;
    }
}

// Aktualizovat stav kategorie selectu při výběru příchutě
// disabled = true: konkrétní příchuť vybrána -> kategorie zašedlá a prázdná
// disabled = false: "nezadat" vybrána -> kategorie aktivní a povinná
function updateFlavorCategoryState(inputId, disabled) {
    // Mapování autocomplete inputu na kategorie select
    const categorySelectMap = {
        'flavorAutocomplete': 'flavorType',           // Liquid form
        'proFlavorAutocomplete1': 'proFlavorType1',   // Liquid PRO
        'proFlavorAutocomplete2': 'proFlavorType2',
        'proFlavorAutocomplete3': 'proFlavorType3',
        'proFlavorAutocomplete4': 'proFlavorType4',
        'shFlavorAutocomplete1': 'shFlavorType1',     // Shisha Mode 1
        'shFlavorAutocomplete2': 'shFlavorType2',
        'shFlavorAutocomplete3': 'shFlavorType3',
        'shFlavorAutocomplete4': 'shFlavorType4',
        'shTweakFlavorAutocomplete1': 'shTweakFlavorType1', // Shisha Tweak
        'shTweakFlavorAutocomplete2': 'shTweakFlavorType2',
        'shTweakFlavorAutocomplete3': 'shTweakFlavorType3',
        'shTweakFlavorAutocomplete4': 'shTweakFlavorType4',
        'shDiyFlavorAutocomplete1': 'shDiyFlavorType1',   // Shisha Mode 2: DIY
        'shDiyFlavorAutocomplete2': 'shDiyFlavorType2',
        'shDiyFlavorAutocomplete3': 'shDiyFlavorType3',
        'shDiyFlavorAutocomplete4': 'shDiyFlavorType4',
        'shMolFlavorAutocomplete1': 'shMolFlavorType1',   // Shisha Mode 3: Molasses
        'shMolFlavorAutocomplete2': 'shMolFlavorType2',
        'shMolFlavorAutocomplete3': 'shMolFlavorType3',
        'shMolFlavorAutocomplete4': 'shMolFlavorType4'
    };
    
    let categorySelectId = categorySelectMap[inputId];
    if (!categorySelectId) {
        const dynMatch = inputId.match(/^(shTweakFlavor|shDiyFlavor|shMolFlavor)Autocomplete(\d+)$/);
        if (dynMatch) categorySelectId = `${dynMatch[1]}Type${dynMatch[2]}`;
    }
    if (!categorySelectId) return;
    
    const categorySelect = document.getElementById(categorySelectId);
    if (!categorySelect) return;
    
    if (disabled) {
        // Konkrétní příchuť vybrána - zašednout a vymazat kategorii
        categorySelect.disabled = true;
        categorySelect.value = '';
        categorySelect.classList.add('disabled-by-flavor');
    } else {
        // "Nezadat" vybrána - aktivovat kategorii (je povinná)
        categorySelect.disabled = false;
        categorySelect.classList.remove('disabled-by-flavor');
    }
}

// Aktualizovat doporučené procento příchutě
function updateRecommendedFlavorPercent(inputId, flavorData) {
    // Najít související slider/input pro procento
    const percentMatch = inputId.match(/Flavor(\d+)/);
    if (!percentMatch) return;
    
    const flavorIndex = percentMatch[1];
    
    // Zkusit najít slider (PRO liquid nebo liquid)
    const possibleSliders = [
        `proFlavorStrength${flavorIndex}`,
        `flavorStrength${flavorIndex}`,
        `shFlavorStrength${flavorIndex}`
    ];
    
    for (const sliderId of possibleSliders) {
        const slider = document.getElementById(sliderId);
        if (slider) {
            // Použít doporučené procento nebo střed rozsahu
            const recommendedPercent = flavorData.recommended_percent || 
                ((flavorData.min_percent + flavorData.max_percent) / 2);
            slider.value = recommendedPercent;
            slider.dispatchEvent(new Event('input'));
            break;
        }
    }
}

// Aktualizovat steep time receptu
function updateRecipeSteepTime(steepDays) {
    // Najít aktuální stránku a příslušný steep time input
    const currentPage = document.querySelector('.page:not(.hidden)');
    if (!currentPage) return;
    
    const steepInput = currentPage.querySelector('input[id*="steep"], input[id*="Steep"]');
    if (steepInput) {
        const currentSteep = parseInt(steepInput.value) || 0;
        // Aktualizovat pouze pokud nový steep je delší
        if (steepDays > currentSteep) {
            steepInput.value = steepDays;
            steepInput.dispatchEvent(new Event('input'));
        }
    }
}

// =============================================
// STOCK TRACKING (SKLADOVÁ ZÁSOBA)
// =============================================

// Aktualizovat zásobu připomínky (volá se z tlačítek +/-)
async function updateReminderStockUI(reminderId, recipeId, delta) {
    const clerkId = window.Clerk?.user?.id;
    if (!clerkId) return;
    
    try {
        // Načíst aktuální stav
        const reminder = await window.database.getReminderById(clerkId, reminderId);
        if (!reminder) return;
        
        const currentStock = reminder.stock_percent ?? 100;
        let newStock = Math.max(0, Math.min(100, currentStock + delta));
        
        // Animace změny
        const stockBar = document.getElementById(`stock-bar-${reminderId}`);
        if (stockBar) {
            stockBar.style.transition = 'width 0.5s ease-out, background 0.5s ease';
            stockBar.style.width = `${newStock}%`;
            
            // Změna barvy podle stavu
            const stockColor = newStock >= 50 ? 'var(--neon-green)' : 
                               newStock > 20 ? '#ffcc00' : '#ff4444';
            stockBar.style.background = stockColor;
            
            // Aktualizovat procenta
            const percentLabel = stockBar.parentElement?.querySelector('.battery-percent');
            if (percentLabel) {
                percentLabel.textContent = `${newStock}%`;
                // Barva textu: černá >=50%, bílá <50%
                if (newStock >= 50) {
                    percentLabel.classList.remove('low-text');
                } else {
                    percentLabel.classList.add('low-text');
                }
            }
            
            // Toggle low class pro animaci
            if (newStock <= 20) {
                stockBar.classList.add('low');
            } else {
                stockBar.classList.remove('low');
            }
        }
        
        // Při dosažení 0% - zobrazit dialog
        if (newStock === 0) {
            const confirmed = await showConsumedConfirmDialog();
            if (confirmed) {
                await window.database.markReminderConsumed(clerkId, reminderId);
                showNotification(t('reminder.consumed_success', 'Liquid označen jako spotřebovaný!'), 'success');
                // Refresh seznamu - připomínka zmizí
                loadRecipeReminders(recipeId);
                await loadMaturedRecipeIds();
                if (currentPageId === 'my-recipes') filterRecipes();
            } else {
                // Vrátit na 10%
                newStock = 10;
                if (stockBar) {
                    stockBar.style.width = '10%';
                    stockBar.style.background = '#ff4444';
                    const percentLabel = stockBar.parentElement?.querySelector('.battery-percent');
                    if (percentLabel) percentLabel.textContent = '10%';
                }
                await window.database.updateReminderStock(clerkId, reminderId, 10);
            }
        } else {
            await window.database.updateReminderStock(clerkId, reminderId, newStock);
        }
    } catch (error) {
        console.error('Error updating stock:', error);
        showNotification(t('common.error', 'Chyba při aktualizaci'), 'error');
    }
}

// Dialog pro potvrzení spotřebování
function showConsumedConfirmDialog() {
    return new Promise((resolve) => {
        const dialog = document.createElement('div');
        dialog.className = 'confirm-dialog-overlay';
        dialog.innerHTML = `
            <div class="confirm-dialog">
                <div class="confirm-dialog-icon">🧪</div>
                <h3 data-i18n="reminder.consumed_title">Liquid spotřebován?</h3>
                <p data-i18n="reminder.consumed_text">
                    Chcete označit tento liquid jako spotřebovaný? 
                    Připomínka bude odstraněna ze seznamu.
                </p>
                <div class="confirm-dialog-buttons">
                    <button class="neon-button secondary" onclick="this.closest('.confirm-dialog-overlay').remove(); window._consumedResolve(false);">
                        <span data-i18n="common.cancel">Zrušit</span>
                    </button>
                    <button class="neon-button" onclick="this.closest('.confirm-dialog-overlay').remove(); window._consumedResolve(true);">
                        <span data-i18n="reminder.mark_consumed">Ano, spotřebován</span>
                    </button>
                </div>
            </div>
        `;
        
        window._consumedResolve = resolve;
        document.body.appendChild(dialog);
        
        if (window.i18n?.applyTranslations) {
            window.i18n.applyTranslations();
        }
        
        // Animace vstupu
        requestAnimationFrame(() => dialog.classList.add('visible'));
    });
}

// Export funkcí pro veřejnou databázi a stock
window.showRecipeDatabase = showRecipeDatabase;
window.loadPublicRecipes = loadPublicRecipes;
window.toggleDatabaseFilters = toggleDatabaseFilters;
window.resetDatabaseFilters = resetDatabaseFilters;
window.debounceSearch = debounceSearch;
window.goToDbPage = goToDbPage;
window.loadPublicRecipeDetail = loadPublicRecipeDetail;
window.submitRating = submitRating;
window.updateReminderStockUI = updateReminderStockUI;
window.appendBackToDatabaseButton = appendBackToDatabaseButton;
window.removeBackToDatabaseButton = removeBackToDatabaseButton;

// =========================================
// EXPORT: Funkce pro globalni pristup z onclick
// =========================================
window.toggleMenu = toggleMenu;
window.handleLoginFromRequired = handleLoginFromRequired;
window.handleRegisterFromRequired = handleRegisterFromRequired;
// Auth Choice Modal
window.showAuthChoiceModal = showAuthChoiceModal;
window.hideAuthChoiceModal = hideAuthChoiceModal;
window.handleAuthChoiceModalBackdropClick = handleAuthChoiceModalBackdropClick;
window.handleHaveAccount = handleHaveAccount;
window.handleWantRegister = handleWantRegister;
window.showLoginModal = showLoginModal;
window.hideLoginModal = hideLoginModal;
window.handleLoginModalClose = handleLoginModalClose;
window.handleLoginModalBackdropClick = handleLoginModalBackdropClick;
window.handleProfileModalBackdropClick = handleProfileModalBackdropClick;
window.showUserProfileModal = showUserProfileModal;
window.hideUserProfileModal = hideUserProfileModal;
window.handleSignOut = handleSignOut;
// handleLanguageChange is handled by i18n.js via window.i18n.setLocale()
window.showPage = showPage;
window.goHome = goHome;
window.goBack = goBack;
window.clearRecipeEditingState = clearRecipeEditingState;
window.calculateMixture = calculateMix;
window.storeCurrentRecipe = storeCurrentRecipe;
window.showSaveRecipeModal = showSaveRecipeModal;
window.showSaveAsNewModal = showSaveAsNewModal;
window.showSaveChangesModal = showSaveChangesModal;
window.goBackToCalculator = goBackToCalculator;
window.hideSaveRecipeModal = hideSaveRecipeModal;
window.saveRecipe = saveRecipe;
window.saveSharedRecipe = saveSharedRecipe;
window.confirmAndShowSharedRecipe = confirmAndShowSharedRecipe;
window.showMyRecipes = showMyRecipes;
window.signOut = signOut;
window.viewRecipeDetail = viewRecipeDetail;
window.editSavedRecipe = editSavedRecipe;
window.deleteRecipe = deleteRecipe;
window.shareRecipe = shareRecipe;
window.shareProduct = shareProduct;
window.showLoginForSharedRecipe = showLoginForSharedRecipe;
window.handleSharedRecipeLogin = handleSharedRecipeLogin;
window.removeSharedProductRow = removeSharedProductRow;
window.addProductRow = addProductRow;
window.removeProductRow = removeProductRow;
window.filterProductOptions = filterProductOptions;
window.onProductSelected = onProductSelected;
window.showFavoriteProducts = showFavoriteProducts;
window.showAddProductForm = showAddProductForm;
window.cancelProductForm = cancelProductForm;
window.saveProduct = saveProduct;
window.viewProductDetail = viewProductDetail;
window.updateProductStockUI = updateProductStockUI;
window.viewSharedProductDetail = viewSharedProductDetail;
window.showFlavorDetail = showFlavorDetail;
window.showFlavorDetailFromRecipe = showFlavorDetailFromRecipe;
window.saveFlavorFromRecipeToFavorites = saveFlavorFromRecipeToFavorites;
window.goBackFromFlavorDetailFromRecipe = goBackFromFlavorDetailFromRecipe;
window.copySharedProductToUser = copySharedProductToUser;
window.goBackFromSharedProduct = goBackFromSharedProduct;
window.editProduct = editProduct;
window.deleteProduct = deleteProduct;
window.filterProducts = filterProducts;
window.filterRecipes = filterRecipes;
window.resetProductFilters = resetProductFilters;
window.resetRecipeFilters = resetRecipeFilters;
window.setSearchRating = setSearchRating;
window.clearSearchRating = clearSearchRating;
window.setRecipeSearchRating = setRecipeSearchRating;
window.clearRecipeSearchRating = clearRecipeSearchRating;
// Subscription
window.checkSubscriptionStatus = checkSubscriptionStatus;
window.showSubscriptionModal = showSubscriptionModal;
window.hideSubscriptionModal = hideSubscriptionModal;
window.handleSubscriptionModalClose = handleSubscriptionModalClose;
window.handleSubscriptionModalBackdropClick = handleSubscriptionModalBackdropClick;
window.startPayment = startPayment;
window.processPayment = processPayment;
window.goToLoginFromSubscription = goToLoginFromSubscription;
window.startRegistrationAndPayment = startRegistrationAndPayment;
window.updateGuestPayButton = updateGuestPayButton;
window.renewSubscription = renewSubscription;
window.showManualModal = showManualModal;
window.hideManualModal = hideManualModal;
window.handleManualModalBackdropClick = handleManualModalBackdropClick;
window.showTermsModal = showTermsModal;
window.hideTermsModal = hideTermsModal;
window.handleTermsModalBackdropClick = handleTermsModalBackdropClick;
// Login Required
window.showLoginRequiredModal = showLoginRequiredModal;
window.hideLoginRequiredModal = hideLoginRequiredModal;
window.handleLoginRequiredModalBackdropClick = handleLoginRequiredModalBackdropClick;
window.requireLogin = requireLogin;
window.requireSubscription = requireSubscription;
window.isUserLoggedIn = isUserLoggedIn;
// Form tabs
window.switchFormTab = switchFormTab;
window.updateFormTabsState = updateFormTabsState;
// Multi-flavor PRO
window.addProFlavor = addProFlavor;
window.removeProFlavor = removeProFlavor;
window.updateProFlavorType = updateProFlavorType;
window.adjustProFlavor = adjustProFlavor;
window.updateProFlavorStrength = updateProFlavorStrength;
window.adjustProFlavorRatio = adjustProFlavorRatio;
window.updateProFlavorRatioDisplay = updateProFlavorRatioDisplay;
window.autoRecalculateProVgPgRatio = autoRecalculateProVgPgRatio;

// =========================================
// SHISHA (Hookah) Functions — 3 Modes
// =========================================

let shVgPgLimits = { min: 0, max: 100 };
let shFlavorCount = 1;        // legacy (Mode 1 uses shTobaccoCount)
let shTobaccoCount = 2;       // Mode 1: tobacco mix count (min 2)
let shDiyFlavorCount = 1;     // Mode 2: DIY flavor count
let shMolFlavorCount = 1;     // Mode 3: Molasses flavor count
let shTweakFlavorCount = 1;   // Tweak: flavor count
let shTweakFlavorNextId = 1;  // Tweak: monotónně rostoucí ID pro unikátní elementy

// Current shisha mode: 'mix' | 'tweak' | 'diy' | 'molasses'
let currentShishaMode = 'mix';

// ---- Shisha Tab Switcher (new top-level tabs) ----
function switchShishaTab(mode) {
    // V režimu editace zamezit změně módu (kromě programového volání)
    if (window.editingRecipeFromDetail && currentShishaMode !== mode && !window.allowShishaTabSwitch) {
        console.log('Shisha tab switch blocked - editing mode active');
        return;
    }
    window.allowShishaTabSwitch = false;
    currentShishaMode = mode;
    document.getElementById('shMode').value = mode;
    
    // Update tab buttons
    document.querySelectorAll('#shisha-form .form-tab').forEach(tab => {
        tab.classList.remove('active');
        if (tab.dataset.tab === 'shisha-' + mode) {
            tab.classList.add('active');
        }
    });
    
    // Show/hide mode content
    document.getElementById('shModeContentMix')?.classList.toggle('hidden', mode !== 'mix');
    document.getElementById('shModeContentTweak')?.classList.toggle('hidden', mode !== 'tweak');
    document.getElementById('shModeContentDiy')?.classList.toggle('hidden', mode !== 'diy');
    document.getElementById('shModeContentMolasses')?.classList.toggle('hidden', mode !== 'molasses');
    
    // Inicializovat base description při přepnutí
    if (mode === 'diy') {
        updateDiyBaseDisplay();
    } else if (mode === 'molasses') {
        updateMolBaseDisplay();
    } else if (mode === 'tweak') {
        updateTweakCalculation();
    }
}

// Legacy alias
function switchShishaMode(mode) { switchShishaTab(mode); }

// ---- Shared VG/PG helpers for DIY + Molasses ----
function getShishaModeInputs(mode) {
    const prefix = mode === 'diy' ? 'shDiy' : 'shMol';
    const totalAmount = mode === 'diy'
        ? (() => {
            const tobaccoAmount = parseFloat(document.getElementById('shDiyTobaccoAmount')?.value) || 250;
            const ratioVal = document.getElementById('shDiyRatio')?.value || '3';
            let ratio;
            if (ratioVal === 'custom') {
                const t = parseFloat(document.getElementById('shDiyCustomRatioTobacco')?.value) || 3;
                const m = parseFloat(document.getElementById('shDiyCustomRatioMolasses')?.value) || 1;
                ratio = t / m;
            } else { ratio = parseFloat(ratioVal) || 3; }
            return Math.round(tobaccoAmount / ratio);
        })()
        : parseFloat(document.getElementById('shMolTotalAmount')?.value) || 100;
    
    const nicType = document.getElementById(`${prefix}NicotineType`)?.value || 'none';
    const nicTarget = parseFloat(document.getElementById(`${prefix}TargetNicotine`)?.value) || 0;
    const nicBase = parseFloat(document.getElementById(`${prefix}NicotineBaseStrength`)?.value) || 20;
    const nicRatioVal = document.getElementById(`${prefix}NicotineRatio`)?.value || '50/50';
    const nicVg = parseInt(nicRatioVal.split('/')[0]) || 50;
    
    // Sweetener + glycerin + water = non-VG/PG volume
    const sweetenerPct = parseFloat(document.getElementById(`${prefix}SweetenerPercent`)?.value ?? 55);
    const glycerinPct = parseFloat(document.getElementById(`${prefix}GlycerinPercent`)?.value ?? 30);
    const waterPct = parseFloat(document.getElementById(`${prefix}WaterPercent`)?.value ?? 0);
    
    // Flavors
    let flavorVolume = 0, flavorVgVolume = 0, flavorPgVolume = 0;
    for (let i = 1; i <= 4; i++) {
        const typeEl = document.getElementById(`${prefix}FlavorType${i}`);
        const strengthEl = document.getElementById(`${prefix}FlavorStrength${i}`);
        const ratioEl = document.getElementById(`${prefix}FlavorRatioSlider${i}`);
        const autoEl = document.getElementById(`${prefix}FlavorAutocomplete${i}`);
        const hasDbFlavor = autoEl && autoEl.dataset.flavorData;
        if (!typeEl || (typeEl.value === 'none' && !hasDbFlavor)) continue;
        const pct = parseFloat(strengthEl?.value) || 0;
        if (pct <= 0) continue;
        const vol = (pct / 100) * totalAmount;
        const vgR = parseInt(ratioEl?.value) || 0;
        flavorVolume += vol;
        flavorVgVolume += vol * (vgR / 100);
        flavorPgVolume += vol * ((100 - vgR) / 100);
    }
    
    // Pure PG
    const purePgPct = parseFloat(document.getElementById(`${prefix}PurePgPercent`)?.value) || 0;
    
    // Base type
    const baseType = document.getElementById(`${prefix}BaseType`)?.value || 'separate';
    const premixedRatioVal = document.getElementById(`${prefix}PremixedRatio`)?.value || '50/50';
    const premixedVg = parseInt(premixedRatioVal.split('/')[0]) || 50;
    
    return { totalAmount, nicType, nicTarget, nicBase, nicVg, sweetenerPct, glycerinPct, waterPct, purePgPct, flavorVolume, flavorVgVolume, flavorPgVolume, baseType, premixedVg };
}

function calculateShishaVgPgLimits(mode) {
    const inp = getShishaModeInputs(mode);
    const totalAmount = inp.totalAmount;
    
    // Nicotine volume
    let nicVol = 0;
    if (inp.nicType !== 'none' && inp.nicTarget > 0 && inp.nicBase > 0) {
        nicVol = (inp.nicTarget * totalAmount) / inp.nicBase;
    }
    const nicVgVol = nicVol * (inp.nicVg / 100);
    const nicPgVol = nicVol * ((100 - inp.nicVg) / 100);
    
    // Non-VG/PG volume (sweetener, water — glycerin IS VG so it contributes to VG)
    const sweetenerVol = (inp.sweetenerPct / 100) * totalAmount;
    const waterVol = (inp.waterPct / 100) * totalAmount;
    const glycerinVol = (inp.glycerinPct / 100) * totalAmount;
    const nonVgPgVol = sweetenerVol + waterVol;
    
    // Fixed VG and PG from known components
    const fixedVg = nicVgVol + inp.flavorVgVolume + glycerinVol;
    const fixedPg = nicPgVol + inp.flavorPgVolume;
    
    // Remaining volume for carrier base (VG/PG)
    const remainingVol = totalAmount - nicVol - inp.flavorVolume - nonVgPgVol - glycerinVol;
    
    if (remainingVol <= 0) {
        const minVg = Math.round((fixedVg / (totalAmount - nonVgPgVol)) * 100);
        return { min: Math.max(0, minVg), max: Math.min(100, minVg) };
    }
    
    const vgPgTotal = totalAmount - nonVgPgVol;
    const minVg = Math.ceil((fixedVg / vgPgTotal) * 100);
    const maxVg = Math.floor(((fixedVg + remainingVol) / vgPgTotal) * 100);
    
    return { min: Math.max(0, minVg), max: Math.min(100, maxVg) };
}

function calculateShishaActualVgPg(mode) {
    const inp = getShishaModeInputs(mode);
    const totalAmount = inp.totalAmount;
    
    let nicVol = 0;
    if (inp.nicType !== 'none' && inp.nicTarget > 0 && inp.nicBase > 0) {
        nicVol = (inp.nicTarget * totalAmount) / inp.nicBase;
    }
    
    const sweetenerVol = (inp.sweetenerPct / 100) * totalAmount;
    const waterVol = (inp.waterPct / 100) * totalAmount;
    const glycerinVol = (inp.glycerinPct / 100) * totalAmount;
    const nonVgPgVol = sweetenerVol + waterVol;
    
    const remainingVol = totalAmount - nicVol - inp.flavorVolume - nonVgPgVol - glycerinVol;
    
    const vgFromNic = nicVol * (inp.nicVg / 100);
    const vgFromBase = Math.max(0, remainingVol) * (inp.premixedVg / 100);
    const totalVg = vgFromNic + inp.flavorVgVolume + glycerinVol + vgFromBase;
    
    const vgPgTotal = totalAmount - nonVgPgVol;
    return vgPgTotal > 0 ? Math.max(0, Math.min(100, Math.round((totalVg / vgPgTotal) * 100))) : 50;
}

// ---- Initialize ----
function initShishaForm() {
    shishaUserManuallyChangedRatio = false;
    currentShishaMode = 'mix';
    switchShishaTab('mix');
    
    // Mode 1 init
    updateShishaTobaccoPercent(1);
    updateShishaTobaccoPercent(2);
    updateShishaTobaccoTotal();
    
    // Mode 2 init
    updateDiyMolassesCalc();
    updateDiyBaseDisplay(null);
    autoRecalculateShishaDiyVgPgRatio();
    
    // Mode 3 init
    updateMolBaseDisplay(null);
    autoRecalculateShishaMolVgPgRatio();
    
    updateShishaPremiumElements();
    
    if (window.i18n && window.i18n.applyTranslations) {
        window.i18n.applyTranslations();
    }
}

// Premium elements management
function updateShishaPremiumElements() {
    const isPremium = window.checkSubscriptionStatus && window.checkSubscriptionStatus();
    
    // Mode 1: Add tobacco button
    const addTobaccoGroup = document.getElementById('shAddTobaccoGroup');
    const addTobaccoBadge = document.getElementById('shAddTobaccoPremiumBadge');
    if (addTobaccoGroup) {
        if (isPremium) {
            addTobaccoGroup.classList.remove('locked');
            if (addTobaccoBadge) addTobaccoBadge.classList.add('hidden');
        } else {
            addTobaccoGroup.classList.add('locked');
            if (addTobaccoBadge) addTobaccoBadge.classList.remove('hidden');
        }
    }
    
    // Mode 2: Add DIY flavor button
    const addDiyFlavorGroup = document.getElementById('shDiyAddFlavorGroup');
    const addDiyFlavorBadge = document.getElementById('shDiyAddFlavorPremiumBadge');
    if (addDiyFlavorGroup) {
        if (isPremium) {
            addDiyFlavorGroup.classList.remove('locked');
            if (addDiyFlavorBadge) addDiyFlavorBadge.classList.add('hidden');
        } else {
            addDiyFlavorGroup.classList.add('locked');
            if (addDiyFlavorBadge) addDiyFlavorBadge.classList.remove('hidden');
        }
    }
    
    // Mode 3: Add Mol flavor button
    const addMolFlavorGroup = document.getElementById('shMolAddFlavorGroup');
    const addMolFlavorBadge = document.getElementById('shMolAddFlavorPremiumBadge');
    if (addMolFlavorGroup) {
        if (isPremium) {
            addMolFlavorGroup.classList.remove('locked');
            if (addMolFlavorBadge) addMolFlavorBadge.classList.add('hidden');
        } else {
            addMolFlavorGroup.classList.add('locked');
            if (addMolFlavorBadge) addMolFlavorBadge.classList.remove('hidden');
        }
    }
    
    // Tweak: Add flavor button
    const addTweakFlavorGroup = document.getElementById('shTweakAddFlavorGroup');
    const addTweakFlavorBadge = document.getElementById('shTweakAddFlavorPremiumBadge');
    if (addTweakFlavorGroup) {
        if (isPremium) {
            addTweakFlavorGroup.classList.remove('locked');
            if (addTweakFlavorBadge) addTweakFlavorBadge.classList.add('hidden');
        } else {
            addTweakFlavorGroup.classList.add('locked');
            if (addTweakFlavorBadge) addTweakFlavorBadge.classList.remove('hidden');
        }
    }
}

// =========================================
// MODE 1: MIX HOTOVÝCH TABÁKŮ
// =========================================

function updateShishaBowlSize(size) {
    // Update active button
    document.querySelectorAll('.sh-bowl-btn').forEach(btn => {
        btn.classList.remove('active');
        if (String(btn.dataset.value) === String(size)) btn.classList.add('active');
    });
    
    const customContainer = document.getElementById('shCustomBowlContainer');
    if (size === 'custom') {
        if (customContainer) customContainer.classList.remove('hidden');
        document.getElementById('shBowlSize').value = document.getElementById('shCustomBowlSize')?.value || 15;
    } else {
        if (customContainer) customContainer.classList.add('hidden');
        document.getElementById('shBowlSize').value = size;
    }
}

function updateShishaCustomBowlSize() {
    const val = parseInt(document.getElementById('shCustomBowlSize')?.value) || 15;
    document.getElementById('shBowlSize').value = Math.max(5, Math.min(50, val));
}

function updateShishaTobaccoPercent(index) {
    const slider = document.getElementById(`shTobaccoPercent${index}`);
    const display = document.getElementById(`shTobaccoValue${index}`);
    const track = document.getElementById(`shTobaccoTrack${index}`);
    if (!slider) return;
    const val = parseInt(slider.value);
    if (display) display.textContent = val;
    if (track) {
        const pct = val;
        track.style.width = '100%';
        track.style.background = `linear-gradient(90deg, var(--neon-gold) ${pct}%, #333 ${pct}%)`;
    }
    
    // Auto-complement: when exactly 2 tobaccos exist, auto-set the other to 100 - val
    const activeTobaccos = [];
    for (let i = 1; i <= 4; i++) {
        if (document.getElementById(`shTobaccoPercent${i}`)) activeTobaccos.push(i);
    }
    if (activeTobaccos.length === 2) {
        const otherIndex = activeTobaccos.find(i => i !== index);
        if (otherIndex) {
            const otherSlider = document.getElementById(`shTobaccoPercent${otherIndex}`);
            const otherDisplay = document.getElementById(`shTobaccoValue${otherIndex}`);
            const otherTrack = document.getElementById(`shTobaccoTrack${otherIndex}`);
            const otherVal = Math.max(0, 100 - val);
            if (otherSlider) otherSlider.value = otherVal;
            if (otherDisplay) otherDisplay.textContent = otherVal;
            if (otherTrack) {
                otherTrack.style.width = '100%';
                otherTrack.style.background = `linear-gradient(90deg, var(--neon-gold) ${otherVal}%, #333 ${otherVal}%)`;
            }
        }
    }
    
    updateShishaTobaccoTotal();
}

function adjustShishaTobacco(index, change) {
    const slider = document.getElementById(`shTobaccoPercent${index}`);
    if (!slider) return;
    let v = parseInt(slider.value) + change;
    v = Math.max(0, Math.min(100, v));
    slider.value = v;
    updateShishaTobaccoPercent(index);
}

function updateShishaTobaccoTotal() {
    let total = 0;
    for (let i = 1; i <= 4; i++) {
        const s = document.getElementById(`shTobaccoPercent${i}`);
        if (s) total += parseInt(s.value) || 0;
    }
    const display = document.getElementById('shTotalTobaccoPercent');
    const warning = document.getElementById('shTobaccoTotalWarning');
    if (display) display.textContent = total;
    if (warning) warning.classList.toggle('hidden', total === 100);
}

function addShishaTobacco() {
    if (!isUserLoggedIn()) { showLoginRequiredModal(); return; }
    if (shTobaccoCount >= 4) return;
    shTobaccoCount++;
    const container = document.getElementById('shAdditionalTobaccoContainer');
    const html = `
        <div class="form-group sh-tobacco-group" id="shTobaccoGroup${shTobaccoCount}">
            <label class="form-label">
                <span data-i18n="shisha.tobacco_label">${window.i18n?.t('shisha.tobacco_label') || 'Tabák'}</span>
                <span class="flavor-number"> ${shTobaccoCount}</span>
                <button type="button" class="remove-flavor-btn" onclick="removeShishaTobacco(${shTobaccoCount})" title="✕">✕</button>
            </label>
            <div class="flavor-container">
                <div class="flavor-autocomplete-wrapper">
                    <input type="text" id="shTobaccoAutocomplete${shTobaccoCount}" class="login-input flavor-search-input" data-product-type="shisha" placeholder="${window.i18n?.t('shisha.search_tobacco_placeholder') || 'Hledat tabák...'}" autocomplete="off">
                </div>
                <div class="slider-container small" style="margin-top:10px;">
                    <button class="slider-btn small" onclick="adjustShishaTobacco(${shTobaccoCount},-5)">◀</button>
                    <div class="slider-wrapper">
                        <input type="range" id="shTobaccoPercent${shTobaccoCount}" min="0" max="100" value="0" step="5" class="flavor-slider sh-tobacco-slider" data-tobacco-index="${shTobaccoCount}" oninput="updateShishaTobaccoPercent(${shTobaccoCount})">
                        <div class="slider-track flavor-track" id="shTobaccoTrack${shTobaccoCount}"></div>
                    </div>
                    <button class="slider-btn small" onclick="adjustShishaTobacco(${shTobaccoCount},5)">▶</button>
                </div>
                <div class="flavor-display"><span id="shTobaccoValue${shTobaccoCount}">0</span>%</div>
            </div>
        </div>`;
    container.insertAdjacentHTML('beforeend', html);
    
    // Init autocomplete for new tobacco
    const acId = `shTobaccoAutocomplete${shTobaccoCount}`;
    if (document.getElementById(acId) && typeof initFlavorAutocomplete === 'function') {
        initFlavorAutocomplete(acId, 'shisha', () => {});
    }
    
    if (shTobaccoCount >= 4) document.getElementById('shAddTobaccoGroup')?.classList.add('hidden');
    const hint = document.getElementById('shTobaccoCountHint');
    if (hint) hint.textContent = `(${shTobaccoCount}/4)`;
    if (window.i18n?.applyTranslations) window.i18n.applyTranslations();
}

function removeShishaTobacco(index) {
    document.getElementById(`shTobaccoGroup${index}`)?.remove();
    shTobaccoCount--;
    document.getElementById('shAddTobaccoGroup')?.classList.remove('hidden');
    const hint = document.getElementById('shTobaccoCountHint');
    if (hint) hint.textContent = `(${shTobaccoCount}/4)`;
    updateShishaTobaccoTotal();
}

// =========================================
// MODE 2: DIY TABÁK OD NULY
// =========================================

function updateDiyRatio(ratio) {
    document.querySelectorAll('.sh-ratio-btn').forEach(btn => {
        btn.classList.remove('active');
        if (String(btn.dataset.value) === String(ratio)) btn.classList.add('active');
    });
    const customContainer = document.getElementById('shDiyCustomRatioContainer');
    if (ratio === 'custom') {
        if (customContainer) customContainer.classList.remove('hidden');
        document.getElementById('shDiyRatio').value = 'custom';
    } else {
        if (customContainer) customContainer.classList.add('hidden');
        document.getElementById('shDiyRatio').value = ratio;
    }
    updateDiyMolassesCalc();
}

function updateDiyMolassesCalc() {
    const tobaccoAmount = parseFloat(document.getElementById('shDiyTobaccoAmount')?.value) || 250;
    const ratioVal = document.getElementById('shDiyRatio')?.value;
    let ratio;
    if (ratioVal === 'custom') {
        const t = parseFloat(document.getElementById('shDiyCustomRatioTobacco')?.value) || 3;
        const m = parseFloat(document.getElementById('shDiyCustomRatioMolasses')?.value) || 1;
        ratio = t / m;
    } else {
        ratio = parseFloat(ratioVal) || 3;
    }
    const molasses = Math.round(tobaccoAmount / ratio);
    const display = document.getElementById('shDiyMolassesCalc');
    if (display) display.textContent = molasses;
    autoRecalculateShishaDiyVgPgRatio();
}

// DIY Base unified (sweetener + glycerin + water = 100%)
function updateDiyBaseDisplay(changed) {
    const sweetSlider = document.getElementById('shDiySweetenerPercent');
    const glycSlider = document.getElementById('shDiyGlycerinPercent');
    const waterSlider = document.getElementById('shDiyWaterPercent');
    if (!sweetSlider || !glycSlider || !waterSlider) return;
    
    let sweet = parseInt(sweetSlider.value) || 0;
    let glyc = parseInt(glycSlider.value) || 0;
    let water = parseInt(waterSlider.value) || 0;
    const total = sweet + glyc + water;
    
    // Auto-adjust: dorovnat sladidlo do 100%
    if (total !== 100 && changed) {
        if (changed === 'sweetener') {
            // Při změně sladidla dorovnat glycerin
            glyc = Math.max(0, 100 - sweet - water);
            glycSlider.value = glyc;
        } else {
            // Při změně glycerinu nebo vody dorovnat sladidlo
            sweet = Math.max(0, 100 - glyc - water);
            sweetSlider.value = sweet;
        }
    }
    
    // Update displays
    const sweetDisplay = document.getElementById('shDiySweetenerValue');
    const glycDisplay = document.getElementById('shDiyGlycerinValue');
    const waterDisplay = document.getElementById('shDiyWaterValue');
    if (sweetDisplay) sweetDisplay.textContent = sweet;
    if (glycDisplay) glycDisplay.textContent = glyc;
    if (waterDisplay) waterDisplay.textContent = water;
    
    // Update tracks
    const sweetTrack = document.getElementById('shDiySweetenerTrack');
    const glycTrack = document.getElementById('shDiyGlycerinTrack');
    const waterTrack = document.getElementById('shDiyWaterTrack');
    if (sweetTrack) { sweetTrack.style.width = '100%'; sweetTrack.style.background = 'linear-gradient(90deg, var(--neon-gold), #b8860b)'; }
    if (glycTrack) { glycTrack.style.width = '100%'; glycTrack.style.background = 'linear-gradient(90deg, #00cc66, #00aaff)'; }
    if (waterTrack) { waterTrack.style.width = '100%'; waterTrack.style.background = 'linear-gradient(90deg, #00aaff, #0066cc)'; }
    
    // Update total display
    const totalEl = document.getElementById('shDiyBaseTotal');
    const warnEl = document.getElementById('shDiyBaseTotalWarning');
    const finalTotal = sweet + glyc + water;
    if (totalEl) totalEl.textContent = finalTotal;
    if (warnEl) warnEl.classList.toggle('hidden', finalTotal === 100);
    
    // Update base description
    const baseDescEl = document.getElementById('shDiyBaseDescription');
    if (baseDescEl) {
        const baseDesc = getShishaBaseDescription(sweet, glyc, water);
        baseDescEl.textContent = baseDesc.text;
        baseDescEl.style.color = baseDesc.color;
        baseDescEl.style.borderLeftColor = baseDesc.color;
    }
    
    autoRecalculateShishaDiyVgPgRatio();
}

function adjustDiyBase(component, change) {
    const ids = { sweetener: 'shDiySweetenerPercent', glycerin: 'shDiyGlycerinPercent', water: 'shDiyWaterPercent' };
    const slider = document.getElementById(ids[component]);
    if (!slider) return;
    slider.value = Math.max(0, Math.min(100, parseInt(slider.value) + change));
    updateDiyBaseDisplay(component);
}

// Legacy compat wrappers
function updateDiySweetenerDisplay() { updateDiyBaseDisplay(null); }
function updateDiyGlycerinDisplay() { updateDiyBaseDisplay(null); }
function updateDiyWaterDisplay() { updateDiyBaseDisplay(null); }
function adjustDiySweetener(c) { adjustDiyBase('sweetener', c); }
function adjustDiyGlycerin(c) { adjustDiyBase('glycerin', c); }
function adjustDiyWater(c) { adjustDiyBase('water', c); }

// DIY Flavor functions (vape concentrates)
function updateShishaDiyFlavorType(index) {
    const select = document.getElementById(`shDiyFlavorType${index}`);
    const container = document.getElementById(`shDiyFlavorStrengthContainer${index}`);
    if (!select) return;
    if (select.value === 'none') {
        if (container) container.classList.add('hidden');
        hideCategoryFlavorWarning(`shDiyFlavorStrengthContainer${index}`);
    } else {
        if (container) container.classList.remove('hidden');
        const autoInput = document.getElementById(`shDiyFlavorAutocomplete${index}`);
        const hasDbFlavor = autoInput?.dataset?.flavorData && autoInput.dataset.flavorData.length > 2;
        if (!hasDbFlavor) {
            showCategoryFlavorWarning(`shDiyFlavorStrengthContainer${index}`, `shDiyFlavorStrength${index}`, `shDiyFlavorValue${index}`, `shDiyFlavorTrack${index}`);
        } else {
            const flavor = flavorDatabase[select.value];
            if (flavor) {
                const slider = document.getElementById(`shDiyFlavorStrength${index}`);
                if (slider) { slider.value = flavor.ideal; updateShishaDiyFlavorStrength(index); }
            }
        }
    }
    updateDiyPurePgVisibility();
    autoRecalculateShishaDiyVgPgRatio();
}

function adjustShishaDiyFlavor(index, change) {
    const slider = document.getElementById(`shDiyFlavorStrength${index}`);
    if (!slider) return;
    let v = parseFloat(slider.value) + change;
    v = Math.max(0, Math.min(15, Math.round(v * 10) / 10));
    slider.value = v;
    updateShishaDiyFlavorStrength(index);
}

function updateShishaDiyFlavorStrength(index) {
    const slider = document.getElementById(`shDiyFlavorStrength${index}`);
    const display = document.getElementById(`shDiyFlavorValue${index}`);
    const track = document.getElementById(`shDiyFlavorTrack${index}`);
    if (!slider) return;
    const val = parseFloat(slider.value);
    if (display) display.textContent = Number.isInteger(val) ? val : val.toFixed(1);
    // Min/max-aware barvy
    const autocomplete = document.getElementById(`shDiyFlavorAutocomplete${index}`);
    let minP = 0, maxP = 100, hasSpecific = false, hasVerified = false;
    if (autocomplete?.dataset.flavorData) {
        try {
            const fd = JSON.parse(autocomplete.dataset.flavorData);
            hasSpecific = fd && fd.name;
            hasVerified = fd.min_percent && fd.max_percent && fd.min_percent > 0;
            if (hasVerified) { minP = fd.min_percent; maxP = fd.max_percent; }
        } catch (e) {}
    }
    // Kategorie bez konkrétní příchutě → šedá
    const typeSelect = document.getElementById(`shDiyFlavorType${index}`);
    const isCategoryOnly = typeSelect && typeSelect.value !== 'none' && !hasSpecific;
    let color = '#00cc66';
    if (isCategoryOnly || (hasSpecific && !hasVerified)) {
        color = '#888888';
        if (track) track.style.background = 'linear-gradient(90deg, #666666, #888888)';
    } else if (val < minP && hasVerified) {
        color = '#ffaa00';
        if (track) track.style.background = 'linear-gradient(90deg, #ff6600, #ffaa00)';
    } else if (val > maxP && hasVerified) {
        color = '#ff0044';
        if (track) track.style.background = 'linear-gradient(90deg, #00cc66, #ff0044)';
    } else {
        if (track) track.style.background = 'linear-gradient(90deg, #00cc66, #00aaff)';
    }
    if (track) track.style.width = '100%';
    if (display?.parentElement) display.parentElement.style.color = color;
    updateDiyPurePgVisibility();
    autoRecalculateShishaDiyVgPgRatio();
}

function adjustShishaDiyFlavorRatio(index, change) {
    const slider = document.getElementById(`shDiyFlavorRatioSlider${index}`);
    if (!slider) return;
    let v = parseInt(slider.value);
    v = change > 0 ? Math.ceil((v + 1) / 5) * 5 : Math.floor((v - 1) / 5) * 5;
    slider.value = Math.max(0, Math.min(100, v));
    updateShishaDiyFlavorRatioDisplay(index);
}

function updateShishaDiyFlavorRatioDisplay(index) {
    const slider = document.getElementById(`shDiyFlavorRatioSlider${index}`);
    const vgEl = document.getElementById(`shDiyFlavorVgValue${index}`);
    const pgEl = document.getElementById(`shDiyFlavorPgValue${index}`);
    const track = document.getElementById(`shDiyFlavorTrackRatio${index}`);
    if (!slider) return;
    const vg = parseInt(slider.value);
    if (vgEl) vgEl.textContent = vg;
    if (pgEl) pgEl.textContent = 100 - vg;
    if (track) { track.style.width = '100%'; track.style.background = 'linear-gradient(90deg, #00cc66, #00aaff)'; }
    autoRecalculateShishaDiyVgPgRatio();
}

function addShishaDiyFlavor() {
    if (!isUserLoggedIn()) { showLoginRequiredModal(); return; }
    if (shDiyFlavorCount >= 4) return;
    shDiyFlavorCount++;
    const container = document.getElementById('shDiyAdditionalFlavorsContainer');
    const i = shDiyFlavorCount;
    const html = `
        <div class="form-group sh-flavor-group" id="shDiyFlavorGroup${i}">
            <label class="form-label">
                <span data-i18n="shisha.flavor_label">${window.i18n?.t('shisha.flavor_label') || 'Příchuť'}</span>
                <span class="flavor-number"> ${i}</span>
                <button type="button" class="remove-flavor-btn" onclick="removeShishaDiyFlavor(${i})" title="✕">✕</button>
            </label>
            <div class="flavor-container">
                <div class="flavor-autocomplete-wrapper">
                    <input type="text" id="shDiyFlavorAutocomplete${i}" class="login-input flavor-search-input" data-product-type="vape" placeholder="${window.i18n?.t('flavor_autocomplete.search_placeholder') || 'Hledat konkrétní příchuť...'}" autocomplete="off">
                </div>
                <select id="shDiyFlavorType${i}" class="neon-select sh-diy-flavor-select" data-flavor-index="${i}" onchange="updateShishaDiyFlavorType(${i})">
                    <option value="none">${window.i18n?.t('form.flavor_none') || 'Žádná'}</option>
                    <option value="fruit">${window.i18n?.t('form.flavor_fruit') || 'Ovoce'}</option>
                    <option value="citrus">${window.i18n?.t('form.flavor_citrus') || 'Citrónové'}</option>
                    <option value="berry">${window.i18n?.t('form.flavor_berry') || 'Bobulové'}</option>
                    <option value="tropical">${window.i18n?.t('form.flavor_tropical') || 'Tropické'}</option>
                    <option value="menthol">${window.i18n?.t('form.flavor_menthol') || 'Mentol'}</option>
                    <option value="cream">${window.i18n?.t('form.flavor_cream') || 'Krémové'}</option>
                    <option value="candy">${window.i18n?.t('form.flavor_candy') || 'Sladkosti'}</option>
                    <option value="drink">${window.i18n?.t('form.flavor_drink') || 'Nápojové'}</option>
                    <option value="mix">${window.i18n?.t('form.flavor_mix') || 'Mix'}</option>
                </select>
                <div id="shDiyFlavorStrengthContainer${i}" class="hidden">
                    <div class="slider-container small">
                        <button class="slider-btn small double" onclick="adjustShishaDiyFlavor(${i},-1)">◀◀</button>
                        <button class="slider-btn small" onclick="adjustShishaDiyFlavor(${i},-0.1)">◀</button>
                        <div class="slider-wrapper">
                            <input type="range" id="shDiyFlavorStrength${i}" min="0" max="15" value="5" step="0.1" class="flavor-slider" oninput="updateShishaDiyFlavorStrength(${i})">
                            <div class="slider-track flavor-track" id="shDiyFlavorTrack${i}"></div>
                        </div>
                        <button class="slider-btn small" onclick="adjustShishaDiyFlavor(${i},0.1)">▶</button>
                        <button class="slider-btn small double" onclick="adjustShishaDiyFlavor(${i},1)">▶▶</button>
                    </div>
                    <div class="flavor-display"><span id="shDiyFlavorValue${i}">5</span>%</div>
                    <div id="shDiyFlavorStrengthDisplay${i}" class="flavor-strength-display"></div>
                </div>
            </div>
        </div>`;
    container.insertAdjacentHTML('beforeend', html);
    
    // Init autocomplete for new flavor
    const acId = `shDiyFlavorAutocomplete${i}`;
    if (document.getElementById(acId) && typeof initFlavorAutocomplete === 'function') {
        initFlavorAutocomplete(acId, 'liquid', (flavorData) => {
            autoRecalculateShishaDiyVgPgRatio();
        });
    }
    
    if (shDiyFlavorCount >= 4) document.getElementById('shDiyAddFlavorGroup')?.classList.add('hidden');
    const hint = document.getElementById('shDiyFlavorCountHint');
    if (hint) hint.textContent = `(${shDiyFlavorCount}/4)`;
    if (window.i18n?.applyTranslations) window.i18n.applyTranslations();
}

function removeShishaDiyFlavor(index) {
    document.getElementById(`shDiyFlavorGroup${index}`)?.remove();
    shDiyFlavorCount--;
    document.getElementById('shDiyAddFlavorGroup')?.classList.remove('hidden');
    updateDiyPurePgVisibility();
}

// Pure PG description helper
function getShishaPurePgDescription(purePgPct, flavorPgPct, glycerinPct) {
    const totalPgPct = purePgPct + flavorPgPct;
    let text = '';
    let color = '#cc44ff';
    
    if (purePgPct === 0) {
        text = t('shisha.pure_pg_desc_0', 'PG zvýrazní chuť příchutě a rozředí hustou směs. Doporučeno 2-5 % pro jemné zvýraznění.');
        color = '#888888';
    } else if (totalPgPct <= 5) {
        text = t('shisha.pure_pg_desc_low', 'Minimální PG — jemné zvýraznění chuti příchutě, směs zůstane hustá.');
        color = '#00cc66';
    } else if (totalPgPct <= 10) {
        text = t('shisha.pure_pg_desc_medium', 'Střední PG — dobrá chuťová intenzita, směs je tekutější a lépe se vstřebá do tabáku.');
        color = '#00aaff';
    } else {
        text = t('shisha.pure_pg_desc_high', 'Vyšší PG — výrazná chuť, ale pozor na škrábání v krku. Nepřekračujte 15 % celkového PG.');
        color = '#ffaa00';
    }
    
    if (glycerinPct === 0 && purePgPct > 0) {
        text += ' ' + t('shisha.pure_pg_no_vg_warning', '⚠ Bez glycerinu (VG) bude směs škrábat v krku! Doporučujeme přidat alespoň 15-20 % glycerinu.');
        color = '#ff0044';
    }
    
    return { text, color };
}

// DIY Pure PG
function updateDiyPurePgVisibility() {
    const group = document.getElementById('shDiyPurePgGroup');
    if (!group) return;
    const hasAnyFlavor = hasShishaFlavors('diy');
    if (hasAnyFlavor) {
        group.classList.remove('hidden');
        updateDiyPurePgMax();
        updateDiyPurePgDisplay();
    } else {
        group.classList.add('hidden');
        const slider = document.getElementById('shDiyPurePgPercent');
        if (slider) slider.value = 0;
    }
}

function hasShishaFlavors(mode) {
    const prefix = mode === 'diy' ? 'shDiy' : 'shMol';
    for (let i = 1; i <= 4; i++) {
        const typeEl = document.getElementById(`${prefix}FlavorType${i}`);
        const autoEl = document.getElementById(`${prefix}FlavorAutocomplete${i}`);
        const strengthEl = document.getElementById(`${prefix}FlavorStrength${i}`);
        const hasDbFlavor = autoEl && autoEl.dataset.flavorData;
        if (!typeEl && !hasDbFlavor) continue;
        if ((typeEl && typeEl.value !== 'none') || hasDbFlavor) {
            const pct = parseFloat(strengthEl?.value) || 0;
            if (pct > 0) return true;
        }
    }
    return false;
}

function getFlavorPgPercent(mode) {
    const prefix = mode === 'diy' ? 'shDiy' : 'shMol';
    let totalFlavorPg = 0;
    for (let i = 1; i <= 4; i++) {
        const strengthEl = document.getElementById(`${prefix}FlavorStrength${i}`);
        const ratioEl = document.getElementById(`${prefix}FlavorRatioSlider${i}`);
        const pct = parseFloat(strengthEl?.value) || 0;
        if (pct <= 0) continue;
        const vgR = parseInt(ratioEl?.value) || 0;
        totalFlavorPg += pct * ((100 - vgR) / 100);
    }
    return totalFlavorPg;
}

function getNicotinePgPercent(mode) {
    const prefix = mode === 'diy' ? 'shDiy' : 'shMol';
    const nicType = document.getElementById(`${prefix}NicotineType`)?.value || 'none';
    if (nicType === 'none') return 0;
    const nicTarget = parseFloat(document.getElementById(`${prefix}TargetNicotine`)?.value) || 0;
    const nicBase = parseFloat(document.getElementById(`${prefix}NicotineBaseStrength`)?.value) || 20;
    const nicRatioVal = document.getElementById(`${prefix}NicotineRatio`)?.value || '50/50';
    const nicVg = parseInt(nicRatioVal.split('/')[0]) || 50;
    if (nicTarget <= 0 || nicBase <= 0) return 0;
    const nicVolPercent = (nicTarget / nicBase) * 100;
    return nicVolPercent * ((100 - nicVg) / 100);
}

function updateDiyPurePgMax() {
    const slider = document.getElementById('shDiyPurePgPercent');
    if (!slider) return;
    const flavorPg = getFlavorPgPercent('diy');
    const nicPg = getNicotinePgPercent('diy');
    const maxPurePg = Math.max(0, Math.round(15 - flavorPg - nicPg));
    slider.max = maxPurePg;
    if (parseInt(slider.value) > maxPurePg) slider.value = maxPurePg;
}

function updateDiyPurePgDisplay() {
    const slider = document.getElementById('shDiyPurePgPercent');
    const display = document.getElementById('shDiyPurePgValue');
    const track = document.getElementById('shDiyPurePgTrack');
    const descEl = document.getElementById('shDiyPurePgDescription');
    if (!slider) return;
    const val = parseInt(slider.value);
    if (display) display.textContent = val;
    if (track) track.style.width = '100%';
    
    const flavorPg = getFlavorPgPercent('diy');
    const glycerinPct = parseFloat(document.getElementById('shDiyGlycerinPercent')?.value) || 0;
    const desc = getShishaPurePgDescription(val, flavorPg, glycerinPct);
    if (descEl) {
        descEl.textContent = desc.text;
        descEl.style.color = desc.color;
        descEl.style.borderLeftColor = desc.color;
    }
    
    autoRecalculateShishaDiyVgPgRatio();
}

function adjustDiyPurePg(change) {
    const slider = document.getElementById('shDiyPurePgPercent');
    if (!slider) return;
    const max = parseInt(slider.max) || 15;
    slider.value = Math.max(0, Math.min(max, parseInt(slider.value) + change));
    updateDiyPurePgDisplay();
}

// Mol Pure PG
function updateMolPurePgVisibility() {
    const group = document.getElementById('shMolPurePgGroup');
    if (!group) return;
    const hasAnyFlavor = hasShishaFlavors('molasses');
    if (hasAnyFlavor) {
        group.classList.remove('hidden');
        updateMolPurePgMax();
        updateMolPurePgDisplay();
    } else {
        group.classList.add('hidden');
        const slider = document.getElementById('shMolPurePgPercent');
        if (slider) slider.value = 0;
    }
}

function updateMolPurePgMax() {
    const slider = document.getElementById('shMolPurePgPercent');
    if (!slider) return;
    const flavorPg = getFlavorPgPercent('molasses');
    const nicPg = getNicotinePgPercent('molasses');
    const maxPurePg = Math.max(0, Math.round(15 - flavorPg - nicPg));
    slider.max = maxPurePg;
    if (parseInt(slider.value) > maxPurePg) slider.value = maxPurePg;
}

function updateMolPurePgDisplay() {
    const slider = document.getElementById('shMolPurePgPercent');
    const display = document.getElementById('shMolPurePgValue');
    const track = document.getElementById('shMolPurePgTrack');
    const descEl = document.getElementById('shMolPurePgDescription');
    if (!slider) return;
    const val = parseInt(slider.value);
    if (display) display.textContent = val;
    if (track) track.style.width = '100%';
    
    const flavorPg = getFlavorPgPercent('molasses');
    const glycerinPct = parseFloat(document.getElementById('shMolGlycerinPercent')?.value) || 0;
    const desc = getShishaPurePgDescription(val, flavorPg, glycerinPct);
    if (descEl) {
        descEl.textContent = desc.text;
        descEl.style.color = desc.color;
        descEl.style.borderLeftColor = desc.color;
    }
    
    autoRecalculateShishaMolVgPgRatio();
}

function adjustMolPurePg(change) {
    const slider = document.getElementById('shMolPurePgPercent');
    if (!slider) return;
    const max = parseInt(slider.max) || 15;
    slider.value = Math.max(0, Math.min(max, parseInt(slider.value) + change));
    updateMolPurePgDisplay();
}

// DIY Nicotine
function updateShishaDiyNicotineType() {
    const typeSelect = document.getElementById('shDiyNicotineType');
    const strengthContainer = document.getElementById('shDiyNicotineStrengthContainer');
    const ratioContainer = document.getElementById('shDiyNicotineRatioContainer');
    const targetSubGroup = document.getElementById('shDiyTargetNicotineSubGroup');
    if (!typeSelect) return;
    const type = typeSelect.value;
    if (type === 'none') {
        strengthContainer?.classList.add('hidden');
        ratioContainer?.classList.add('hidden');
        targetSubGroup?.classList.add('hidden');
    } else {
        strengthContainer?.classList.remove('hidden');
        ratioContainer?.classList.remove('hidden');
        targetSubGroup?.classList.remove('hidden');
    }
    autoRecalculateShishaDiyVgPgRatio();
    updateDiyNicotineNote();
}

function updateShishaDiyNicotineRatio(ratio) {
    document.querySelectorAll('.sh-diy-nic-ratio-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.value === ratio);
    });
    const input = document.getElementById('shDiyNicotineRatio');
    if (input) input.value = ratio;
    autoRecalculateShishaDiyVgPgRatio();
}

function adjustShishaDiyTargetNicotine(change) {
    const slider = document.getElementById('shDiyTargetNicotine');
    if (!slider) return;
    slider.value = Math.max(0, Math.min(parseInt(slider.max) || 10, parseInt(slider.value) + change));
    updateShishaDiyNicotineDisplay();
}

function updateShishaDiyNicotineDisplay() {
    const slider = document.getElementById('shDiyTargetNicotine');
    const display = document.getElementById('shDiyTargetNicotineValue');
    const track = document.getElementById('shDiyNicotineTrack');
    const descEl = document.getElementById('shDiyNicotineDescription');
    const displayContainer = display ? display.parentElement : null;
    if (!slider) return;
    const val = parseInt(slider.value);
    if (display) display.textContent = val;
    const desc = shishaNicotineDescriptions.find(d => val >= d.min && val <= d.max);
    if (desc) {
        if (track) track.style.background = `linear-gradient(90deg, #00cc66, ${desc.color})`;
        if (descEl) { descEl.textContent = getShishaNicotineDescriptionText(val); descEl.style.color = desc.color; descEl.style.borderLeftColor = desc.color; }
        if (displayContainer) { displayContainer.style.color = desc.color; displayContainer.style.textShadow = `0 0 20px ${desc.color}`; }
    }
    if (track) track.style.width = '100%';
    updateDiyPurePgVisibility();
    autoRecalculateShishaDiyVgPgRatio();
    updateDiyNicotineNote();
}

// DIY VG/PG — read-only calculation (glycerin=VG, PG from flavors/nicotine)
function autoRecalculateShishaDiyVgPgRatio() {
    const inp = getShishaModeInputs('diy');
    const totalAmount = inp.totalAmount;
    if (totalAmount <= 0) return;
    
    // Nicotine volume
    let nicVol = 0;
    if (inp.nicType !== 'none' && inp.nicTarget > 0 && inp.nicBase > 0) {
        nicVol = (inp.nicTarget * totalAmount) / inp.nicBase;
    }
    
    // VG sources: glycerin + nicotine VG part + flavor VG part
    const glycerinVol = (inp.glycerinPct / 100) * totalAmount;
    const vgFromNic = nicVol * (inp.nicVg / 100);
    const totalVg = glycerinVol + vgFromNic + inp.flavorVgVolume;
    
    // PG sources: nicotine PG part + flavor PG part + pure PG
    const pgFromNic = nicVol * ((100 - inp.nicVg) / 100);
    const purePgVol = (inp.purePgPct / 100) * totalAmount;
    const totalPg = pgFromNic + inp.flavorPgVolume + purePgVol;
    
    // Non-VG/PG volume (sweetener, water)
    const sweetenerVol = (inp.sweetenerPct / 100) * totalAmount;
    const waterVol = (inp.waterPct / 100) * totalAmount;
    
    // VG/PG ratio from VG+PG total (excluding sweetener, water)
    const vgPgTotal = totalVg + totalPg;
    const vgPercent = vgPgTotal > 0 ? Math.round((totalVg / vgPgTotal) * 100) : 100;
    const vgPgSharePercent = totalAmount > 0 ? (vgPgTotal / totalAmount) * 100 : 0;
    
    const vgEl = document.getElementById('shDiyVgValue');
    const pgEl = document.getElementById('shDiyPgValue');
    if (vgEl) vgEl.textContent = vgPercent;
    if (pgEl) pgEl.textContent = 100 - vgPercent;
    
    const desc = getShishaRatioDescription(vgPercent, vgPgSharePercent);
    const descEl = document.getElementById('shDiyRatioDescription');
    if (descEl) {
        descEl.textContent = desc.text;
        descEl.style.color = desc.color;
        descEl.style.borderLeftColor = desc.color;
    }
}

// DIY Material toggle (Tobacco / Herbs)
function updateDiyMaterial(value) {
    document.querySelectorAll('.sh-diy-material-btn').forEach(b => b.classList.toggle('active', b.dataset.value === value));
    const hidden = document.getElementById('shDiyMaterial');
    if (hidden) hidden.value = value;
    const hintEl = document.getElementById('shDiyMaterialHint');
    if (hintEl) {
        if (value === 'herbs') {
            hintEl.textContent = t('shisha.diy_material_herbs_hint', 'Sušené bylinky — máta, heřmánek, levandule, šalvěj apod.');
            hintEl.setAttribute('data-i18n', 'shisha.diy_material_herbs_hint');
        } else {
            hintEl.textContent = t('shisha.diy_material_tobacco_hint', 'Sušené tabákové listy — namočte, odstraňte stonky, nakrájejte');
            hintEl.setAttribute('data-i18n', 'shisha.diy_material_tobacco_hint');
        }
    }
    // Aktualizovat label "Množství tabáku / bylinek"
    const amountLabel = document.getElementById('shDiyAmountLabel');
    if (amountLabel) {
        if (value === 'herbs') {
            amountLabel.textContent = t('shisha.diy_herbs_amount_label', 'Množství bylinek (g)');
            amountLabel.setAttribute('data-i18n', 'shisha.diy_herbs_amount_label');
        } else {
            amountLabel.textContent = t('shisha.tobacco_amount_label', 'Množství tabáku (g)');
            amountLabel.setAttribute('data-i18n', 'shisha.tobacco_amount_label');
        }
    }
    // Aktualizovat hint pod množstvím
    const amountHint = document.getElementById('shDiyAmountHint');
    if (amountHint) {
        if (value === 'herbs') {
            amountHint.textContent = t('shisha.diy_herbs_amount_hint', 'Sušené bylinky — nasekejte nebo nadrťte');
            amountHint.setAttribute('data-i18n', 'shisha.diy_herbs_amount_hint');
        } else {
            amountHint.textContent = t('shisha.tobacco_amount_hint', 'Sušené listy — namočte, odstraňte stonky, nakrájejte');
            amountHint.setAttribute('data-i18n', 'shisha.tobacco_amount_hint');
        }
    }
    // Aktualizovat label "Poměr tabák:molasses" / "Poměr bylinky:molasses"
    const ratioLabel = document.getElementById('shDiyRatioLabel');
    if (ratioLabel) {
        if (value === 'herbs') {
            ratioLabel.textContent = t('shisha.diy_herbs_molasses_ratio_label', 'Poměr bylinky:molasses');
            ratioLabel.setAttribute('data-i18n', 'shisha.diy_herbs_molasses_ratio_label');
        } else {
            ratioLabel.textContent = t('shisha.tobacco_molasses_ratio_label', 'Poměr tabák:molasses');
            ratioLabel.setAttribute('data-i18n', 'shisha.tobacco_molasses_ratio_label');
        }
    }
    // Aktualizovat poznámku o nikotinu
    updateDiyNicotineNote();
}

// DIY — poznámka o nikotinu v tabáku (zobrazí se jen při materiálu "tabák" a nikotinu > 0)
function updateDiyNicotineNote() {
    const noteEl = document.getElementById('shDiyNicotineNote');
    if (!noteEl) return;
    const material = document.getElementById('shDiyMaterial')?.value || 'tobacco';
    const nicVal = parseInt(document.getElementById('shDiyTargetNicotine')?.value) || 0;
    const nicType = document.getElementById('shDiyNicotineType')?.value || 'none';
    if (material === 'tobacco' && nicType !== 'none' && nicVal > 0) {
        noteEl.classList.remove('hidden');
    } else {
        noteEl.classList.add('hidden');
    }
}

// DIY Mixology checkbox groups
function updateDiyMixologyGroups() {
    const items = ['Menthol', 'Citric', 'Juice'];
    items.forEach(item => {
        const checked = document.getElementById(`shDiyMix${item}`)?.checked || false;
        document.getElementById(`shDiyMix${item}Group`)?.classList.toggle('hidden', !checked);
    });
    autoRecalculateShishaDiyVgPgRatio();
}

function adjustDiyMixSlider(type, change) {
    const idMap = { menthol: 'shDiyMixMentholDrops', citric: 'shDiyMixCitricGrams', juice: 'shDiyMixJuicePercent' };
    const slider = document.getElementById(idMap[type]);
    if (!slider) return;
    const step = parseFloat(slider.step) || 1;
    slider.value = Math.max(parseFloat(slider.min) || 0, Math.min(parseFloat(slider.max), parseFloat(slider.value) + change));
    updateDiyMixSlider(type);
}

function updateDiyMixSlider(type) {
    const idMap = { menthol: 'shDiyMixMentholDrops', citric: 'shDiyMixCitricGrams', juice: 'shDiyMixJuicePercent' };
    const displayMap = { menthol: 'shDiyMixMentholValue', citric: 'shDiyMixCitricValue', juice: 'shDiyMixJuiceValue' };
    const trackMap = { menthol: 'shDiyMixMentholTrack', citric: 'shDiyMixCitricTrack', juice: 'shDiyMixJuiceTrack' };
    const slider = document.getElementById(idMap[type]);
    const display = document.getElementById(displayMap[type]);
    const track = document.getElementById(trackMap[type]);
    if (!slider) return;
    if (display) display.textContent = slider.value;
    if (track) track.style.width = '100%';
    autoRecalculateShishaDiyVgPgRatio();
}

// Molasses Mixology checkbox groups
function updateMolMixologyGroups() {
    const items = ['Menthol', 'Citric', 'Juice'];
    items.forEach(item => {
        const checked = document.getElementById(`shMolMix${item}`)?.checked || false;
        document.getElementById(`shMolMix${item}Group`)?.classList.toggle('hidden', !checked);
    });
}

function adjustMolMixSlider(type, change) {
    const idMap = { menthol: 'shMolMixMentholDrops', citric: 'shMolMixCitricGrams', juice: 'shMolMixJuicePercent' };
    const slider = document.getElementById(idMap[type]);
    if (!slider) return;
    slider.value = Math.max(parseFloat(slider.min) || 0, Math.min(parseFloat(slider.max), parseFloat(slider.value) + change));
    updateMolMixSlider(type);
}

function updateMolMixSlider(type) {
    const idMap = { menthol: 'shMolMixMentholDrops', citric: 'shMolMixCitricGrams', juice: 'shMolMixJuicePercent' };
    const displayMap = { menthol: 'shMolMixMentholValue', citric: 'shMolMixCitricValue', juice: 'shMolMixJuiceValue' };
    const trackMap = { menthol: 'shMolMixMentholTrack', citric: 'shMolMixCitricTrack', juice: 'shMolMixJuiceTrack' };
    const slider = document.getElementById(idMap[type]);
    const display = document.getElementById(displayMap[type]);
    const track = document.getElementById(trackMap[type]);
    if (!slider) return;
    if (display) display.textContent = slider.value;
    if (track) track.style.width = '100%';
}

// =========================================
// MODE 3: MOLASSES MIX
// =========================================

// Mol Base unified (sweetener + glycerin + water = 100%)
function updateMolBaseDisplay(changed) {
    const sweetSlider = document.getElementById('shMolSweetenerPercent');
    const glycSlider = document.getElementById('shMolGlycerinPercent');
    const waterSlider = document.getElementById('shMolWaterPercent');
    if (!sweetSlider || !glycSlider || !waterSlider) return;
    
    let sweet = parseInt(sweetSlider.value) || 0;
    let glyc = parseInt(glycSlider.value) || 0;
    let water = parseInt(waterSlider.value) || 0;
    const total = sweet + glyc + water;
    
    // Auto-adjust: dorovnat sladidlo do 100%
    if (total !== 100 && changed) {
        if (changed === 'sweetener') {
            // Při změně sladidla dorovnat glycerin
            glyc = Math.max(0, 100 - sweet - water);
            glycSlider.value = glyc;
        } else {
            // Při změně glycerinu nebo vody dorovnat sladidlo
            sweet = Math.max(0, 100 - glyc - water);
            sweetSlider.value = sweet;
        }
    }
    
    const sweetDisplay = document.getElementById('shMolSweetenerValue');
    const glycDisplay = document.getElementById('shMolGlycerinValue');
    const waterDisplay = document.getElementById('shMolWaterValue');
    if (sweetDisplay) sweetDisplay.textContent = sweet;
    if (glycDisplay) glycDisplay.textContent = glyc;
    if (waterDisplay) waterDisplay.textContent = water;
    
    const sweetTrack = document.getElementById('shMolSweetenerTrack');
    const glycTrack = document.getElementById('shMolGlycerinTrack');
    const waterTrack = document.getElementById('shMolWaterTrack');
    if (sweetTrack) { sweetTrack.style.width = '100%'; sweetTrack.style.background = 'linear-gradient(90deg, var(--neon-gold), #b8860b)'; }
    if (glycTrack) { glycTrack.style.width = '100%'; glycTrack.style.background = 'linear-gradient(90deg, #00cc66, #00aaff)'; }
    if (waterTrack) { waterTrack.style.width = '100%'; waterTrack.style.background = 'linear-gradient(90deg, #00aaff, #0066cc)'; }
    
    const totalEl = document.getElementById('shMolBaseTotal');
    const warnEl = document.getElementById('shMolBaseTotalWarning');
    const finalTotal = sweet + glyc + water;
    if (totalEl) totalEl.textContent = finalTotal;
    if (warnEl) warnEl.classList.toggle('hidden', finalTotal === 100);
    
    // Update base description
    const baseDescEl = document.getElementById('shMolBaseDescription');
    if (baseDescEl) {
        const baseDesc = getShishaBaseDescription(sweet, glyc, water);
        baseDescEl.textContent = baseDesc.text;
        baseDescEl.style.color = baseDesc.color;
        baseDescEl.style.borderLeftColor = baseDesc.color;
    }
    
    autoRecalculateShishaMolVgPgRatio();
}

function adjustMolBase(component, change) {
    const ids = { sweetener: 'shMolSweetenerPercent', glycerin: 'shMolGlycerinPercent', water: 'shMolWaterPercent' };
    const slider = document.getElementById(ids[component]);
    if (!slider) return;
    slider.value = Math.max(0, Math.min(100, parseInt(slider.value) + change));
    updateMolBaseDisplay(component);
}

// Legacy compat wrappers
function updateMolSweetenerDisplay() { updateMolBaseDisplay(null); }
function updateMolGlycerinDisplay() { updateMolBaseDisplay(null); }
function updateMolWaterDisplay() { updateMolBaseDisplay(null); }
function adjustMolSweetener(c) { adjustMolBase('sweetener', c); }
function adjustMolGlycerin(c) { adjustMolBase('glycerin', c); }
function adjustMolWater(c) { adjustMolBase('water', c); }

// Molasses Flavor functions (vape concentrates — identical pattern to DIY)
function updateShishaMolFlavorType(index) {
    const select = document.getElementById(`shMolFlavorType${index}`);
    const container = document.getElementById(`shMolFlavorStrengthContainer${index}`);
    if (!select) return;
    if (select.value === 'none') {
        if (container) container.classList.add('hidden');
        hideCategoryFlavorWarning(`shMolFlavorStrengthContainer${index}`);
    } else {
        if (container) container.classList.remove('hidden');
        const autoInput = document.getElementById(`shMolFlavorAutocomplete${index}`);
        const hasDbFlavor = autoInput?.dataset?.flavorData && autoInput.dataset.flavorData.length > 2;
        if (!hasDbFlavor) {
            showCategoryFlavorWarning(`shMolFlavorStrengthContainer${index}`, `shMolFlavorStrength${index}`, `shMolFlavorValue${index}`, `shMolFlavorTrack${index}`);
        } else {
            const flavor = flavorDatabase[select.value];
            if (flavor) {
                const slider = document.getElementById(`shMolFlavorStrength${index}`);
                if (slider) { slider.value = flavor.ideal; updateShishaMolFlavorStrength(index); }
            }
        }
    }
    updateMolPurePgVisibility();
}

function adjustShishaMolFlavor(index, change) {
    const slider = document.getElementById(`shMolFlavorStrength${index}`);
    if (!slider) return;
    let v = parseFloat(slider.value) + change;
    v = Math.max(0, Math.min(15, Math.round(v * 10) / 10));
    slider.value = v;
    updateShishaMolFlavorStrength(index);
}

function updateShishaMolFlavorStrength(index) {
    const slider = document.getElementById(`shMolFlavorStrength${index}`);
    const display = document.getElementById(`shMolFlavorValue${index}`);
    const track = document.getElementById(`shMolFlavorTrack${index}`);
    if (!slider) return;
    const val = parseFloat(slider.value);
    if (display) display.textContent = Number.isInteger(val) ? val : val.toFixed(1);
    // Min/max-aware barvy
    const autocomplete = document.getElementById(`shMolFlavorAutocomplete${index}`);
    let minP = 0, maxP = 100, hasSpecific = false, hasVerified = false;
    if (autocomplete?.dataset.flavorData) {
        try {
            const fd = JSON.parse(autocomplete.dataset.flavorData);
            hasSpecific = fd && fd.name;
            hasVerified = fd.min_percent && fd.max_percent && fd.min_percent > 0;
            if (hasVerified) { minP = fd.min_percent; maxP = fd.max_percent; }
        } catch (e) {}
    }
    // Kategorie bez konkrétní příchutě → šedá
    const typeSelect = document.getElementById(`shMolFlavorType${index}`);
    const isCategoryOnly = typeSelect && typeSelect.value !== 'none' && !hasSpecific;
    let color = '#00cc66';
    if (isCategoryOnly || (hasSpecific && !hasVerified)) {
        color = '#888888';
        if (track) track.style.background = 'linear-gradient(90deg, #666666, #888888)';
    } else if (val < minP && hasVerified) {
        color = '#ffaa00';
        if (track) track.style.background = 'linear-gradient(90deg, #ff6600, #ffaa00)';
    } else if (val > maxP && hasVerified) {
        color = '#ff0044';
        if (track) track.style.background = 'linear-gradient(90deg, #00cc66, #ff0044)';
    } else {
        if (track) track.style.background = 'linear-gradient(90deg, #00cc66, #00aaff)';
    }
    if (track) track.style.width = '100%';
    if (display?.parentElement) display.parentElement.style.color = color;
    updateMolPurePgVisibility();
}

function adjustShishaMolFlavorRatio(index, change) {
    const slider = document.getElementById(`shMolFlavorRatioSlider${index}`);
    if (!slider) return;
    let v = parseInt(slider.value);
    v = change > 0 ? Math.ceil((v + 1) / 5) * 5 : Math.floor((v - 1) / 5) * 5;
    slider.value = Math.max(0, Math.min(100, v));
    updateShishaMolFlavorRatioDisplay(index);
}

function updateShishaMolFlavorRatioDisplay(index) {
    const slider = document.getElementById(`shMolFlavorRatioSlider${index}`);
    const vgEl = document.getElementById(`shMolFlavorVgValue${index}`);
    const pgEl = document.getElementById(`shMolFlavorPgValue${index}`);
    const track = document.getElementById(`shMolFlavorTrackRatio${index}`);
    if (!slider) return;
    const vg = parseInt(slider.value);
    if (vgEl) vgEl.textContent = vg;
    if (pgEl) pgEl.textContent = 100 - vg;
    if (track) { track.style.width = '100%'; track.style.background = 'linear-gradient(90deg, #00cc66, #00aaff)'; }
}

function addShishaMolFlavor() {
    if (!isUserLoggedIn()) { showLoginRequiredModal(); return; }
    if (shMolFlavorCount >= 4) return;
    shMolFlavorCount++;
    const container = document.getElementById('shMolAdditionalFlavorsContainer');
    const i = shMolFlavorCount;
    const html = `
        <div class="form-group sh-flavor-group" id="shMolFlavorGroup${i}">
            <label class="form-label">
                <span data-i18n="shisha.flavor_label">${window.i18n?.t('shisha.flavor_label') || 'Příchuť'}</span>
                <span class="flavor-number"> ${i}</span>
                <button type="button" class="remove-flavor-btn" onclick="removeShishaMolFlavor(${i})" title="✕">✕</button>
            </label>
            <div class="flavor-container">
                <div class="flavor-autocomplete-wrapper">
                    <input type="text" id="shMolFlavorAutocomplete${i}" class="login-input flavor-search-input" data-product-type="vape" placeholder="${window.i18n?.t('flavor_autocomplete.search_placeholder') || 'Hledat konkrétní příchuť...'}" autocomplete="off">
                </div>
                <select id="shMolFlavorType${i}" class="neon-select sh-mol-flavor-select" data-flavor-index="${i}" onchange="updateShishaMolFlavorType(${i})">
                    <option value="none">${window.i18n?.t('form.flavor_none') || 'Žádná'}</option>
                    <option value="fruit">${window.i18n?.t('form.flavor_fruit') || 'Ovoce'}</option>
                    <option value="citrus">${window.i18n?.t('form.flavor_citrus') || 'Citrónové'}</option>
                    <option value="berry">${window.i18n?.t('form.flavor_berry') || 'Bobulové'}</option>
                    <option value="tropical">${window.i18n?.t('form.flavor_tropical') || 'Tropické'}</option>
                    <option value="menthol">${window.i18n?.t('form.flavor_menthol') || 'Mentol'}</option>
                    <option value="cream">${window.i18n?.t('form.flavor_cream') || 'Krémové'}</option>
                    <option value="candy">${window.i18n?.t('form.flavor_candy') || 'Sladkosti'}</option>
                    <option value="drink">${window.i18n?.t('form.flavor_drink') || 'Nápojové'}</option>
                    <option value="mix">${window.i18n?.t('form.flavor_mix') || 'Mix'}</option>
                </select>
                <div id="shMolFlavorStrengthContainer${i}" class="hidden">
                    <div class="slider-container small">
                        <button class="slider-btn small double" onclick="adjustShishaMolFlavor(${i},-1)">◀◀</button>
                        <button class="slider-btn small" onclick="adjustShishaMolFlavor(${i},-0.1)">◀</button>
                        <div class="slider-wrapper">
                            <input type="range" id="shMolFlavorStrength${i}" min="0" max="15" value="5" step="0.1" class="flavor-slider" oninput="updateShishaMolFlavorStrength(${i})">
                            <div class="slider-track flavor-track" id="shMolFlavorTrack${i}"></div>
                        </div>
                        <button class="slider-btn small" onclick="adjustShishaMolFlavor(${i},0.1)">▶</button>
                        <button class="slider-btn small double" onclick="adjustShishaMolFlavor(${i},1)">▶▶</button>
                    </div>
                    <div class="flavor-display"><span id="shMolFlavorValue${i}">5</span>%</div>
                    <div id="shMolFlavorStrengthDisplay${i}" class="flavor-strength-display"></div>
                </div>
            </div>
        </div>`;
    container.insertAdjacentHTML('beforeend', html);
    
    // Init autocomplete for new flavor
    const acId = `shMolFlavorAutocomplete${i}`;
    if (document.getElementById(acId) && typeof initFlavorAutocomplete === 'function') {
        initFlavorAutocomplete(acId, 'liquid', (flavorData) => {
            autoRecalculateShishaMolVgPgRatio();
        });
    }
    
    if (shMolFlavorCount >= 4) document.getElementById('shMolAddFlavorGroup')?.classList.add('hidden');
    const hint = document.getElementById('shMolFlavorCountHint');
    if (hint) hint.textContent = `(${shMolFlavorCount}/4)`;
    if (window.i18n?.applyTranslations) window.i18n.applyTranslations();
}

function removeShishaMolFlavor(index) {
    document.getElementById(`shMolFlavorGroup${index}`)?.remove();
    shMolFlavorCount--;
    document.getElementById('shMolAddFlavorGroup')?.classList.remove('hidden');
}

// Molasses Nicotine
function updateShishaMolNicotineType() {
    const typeSelect = document.getElementById('shMolNicotineType');
    const strengthContainer = document.getElementById('shMolNicotineStrengthContainer');
    const ratioContainer = document.getElementById('shMolNicotineRatioContainer');
    const targetSubGroup = document.getElementById('shMolTargetNicotineSubGroup');
    if (!typeSelect) return;
    const type = typeSelect.value;
    if (type === 'none') {
        strengthContainer?.classList.add('hidden');
        ratioContainer?.classList.add('hidden');
        targetSubGroup?.classList.add('hidden');
    } else {
        strengthContainer?.classList.remove('hidden');
        ratioContainer?.classList.remove('hidden');
        targetSubGroup?.classList.remove('hidden');
    }
}

function updateShishaMolNicotineRatio(ratio) {
    document.querySelectorAll('.sh-mol-nic-ratio-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.value === ratio);
    });
    const input = document.getElementById('shMolNicotineRatio');
    if (input) input.value = ratio;
}

function adjustShishaMolTargetNicotine(change) {
    const slider = document.getElementById('shMolTargetNicotine');
    if (!slider) return;
    slider.value = Math.max(0, Math.min(parseInt(slider.max) || 10, parseInt(slider.value) + change));
    updateShishaMolNicotineDisplay();
}

function updateShishaMolNicotineDisplay() {
    const slider = document.getElementById('shMolTargetNicotine');
    const display = document.getElementById('shMolTargetNicotineValue');
    const track = document.getElementById('shMolNicotineTrack');
    const descEl = document.getElementById('shMolNicotineDescription');
    const displayContainer = display ? display.parentElement : null;
    if (!slider) return;
    const val = parseInt(slider.value);
    if (display) display.textContent = val;
    const desc = shishaNicotineDescriptions.find(d => val >= d.min && val <= d.max);
    if (desc) {
        if (track) track.style.background = `linear-gradient(90deg, #00cc66, ${desc.color})`;
        if (descEl) { descEl.textContent = getShishaNicotineDescriptionText(val); descEl.style.color = desc.color; descEl.style.borderLeftColor = desc.color; }
        if (displayContainer) { displayContainer.style.color = desc.color; displayContainer.style.textShadow = `0 0 20px ${desc.color}`; }
    }
    if (track) track.style.width = '100%';
    updateMolPurePgVisibility();
    autoRecalculateShishaMolVgPgRatio();
}

// Molasses VG/PG — read-only calculation (glycerin=VG, PG from flavors/nicotine)
function autoRecalculateShishaMolVgPgRatio() {
    const inp = getShishaModeInputs('molasses');
    const totalAmount = inp.totalAmount;
    if (totalAmount <= 0) return;
    
    // Nicotine volume
    let nicVol = 0;
    if (inp.nicType !== 'none' && inp.nicTarget > 0 && inp.nicBase > 0) {
        nicVol = (inp.nicTarget * totalAmount) / inp.nicBase;
    }
    
    // VG sources: glycerin + nicotine VG part + flavor VG part
    const glycerinVol = (inp.glycerinPct / 100) * totalAmount;
    const vgFromNic = nicVol * (inp.nicVg / 100);
    const totalVg = glycerinVol + vgFromNic + inp.flavorVgVolume;
    
    // PG sources: nicotine PG part + flavor PG part + pure PG
    const pgFromNic = nicVol * ((100 - inp.nicVg) / 100);
    const purePgVol = (inp.purePgPct / 100) * totalAmount;
    const totalPg = pgFromNic + inp.flavorPgVolume + purePgVol;
    
    // VG/PG ratio from VG+PG total (excluding sweetener, water)
    const vgPgTotal = totalVg + totalPg;
    const vgPercent = vgPgTotal > 0 ? Math.round((totalVg / vgPgTotal) * 100) : 100;
    const vgPgSharePercent = totalAmount > 0 ? (vgPgTotal / totalAmount) * 100 : 0;
    
    const vgEl = document.getElementById('shMolVgValue');
    const pgEl = document.getElementById('shMolPgValue');
    if (vgEl) vgEl.textContent = vgPercent;
    if (pgEl) pgEl.textContent = 100 - vgPercent;
    
    const desc = getShishaRatioDescription(vgPercent, vgPgSharePercent);
    const descEl = document.getElementById('shMolRatioDescription');
    if (descEl) {
        descEl.textContent = desc.text;
        descEl.style.color = desc.color;
        descEl.style.borderLeftColor = desc.color;
    }
}

// =========================================
// TWEAK MODE Functions
// =========================================

// Show/hide sections based on checked problems
function updateTweakSections() {
    const map = {
        'shTweakProblemVg': 'shTweakSectionVg',
        'shTweakProblemTaste': 'shTweakSectionTaste',
        'shTweakProblemFlavor': 'shTweakSectionFlavor',
        'shTweakProblemNicotine': 'shTweakSectionNicotine',
        'shTweakProblemMixology': 'shTweakSectionMixology'
    };
    for (const [checkId, sectionId] of Object.entries(map)) {
        const checked = document.getElementById(checkId)?.checked || false;
        document.getElementById(sectionId)?.classList.toggle('hidden', !checked);
    }
    // Hide recipe when selections change
    document.getElementById('shTweakRecipe')?.classList.add('hidden');
    // Init nicotine description when section becomes visible
    if (document.getElementById('shTweakProblemNicotine')?.checked) {
        updateShishaTweakNicotineDisplay();
    }
    updateTweakCalculation();
}

// Zobrazit vybraný tabák z oblíbených v tweak režimu
function displayTweakSelectedTobacco(flavorData) {
    const container = document.getElementById('shTweakTobaccoSelected');
    if (!container) return;
    if (!flavorData) {
        container.classList.add('hidden');
        container.innerHTML = '';
        return;
    }
    const name = flavorData.name || '';
    const brand = flavorData.manufacturer_code || flavorData.manufacturer || flavorData.brand || '';
    const displayName = brand ? `${name} (${brand})` : name;
    container.classList.remove('hidden');
    container.innerHTML = `
        <div class="tweak-tobacco-chip">
            <span class="tweak-tobacco-name">${displayName}</span>
            <button type="button" class="tweak-tobacco-remove" onclick="clearTweakSelectedTobacco()" title="×">×</button>
        </div>
    `;
}

function clearTweakSelectedTobacco() {
    const container = document.getElementById('shTweakTobaccoSelected');
    if (container) { container.classList.add('hidden'); container.innerHTML = ''; }
    const input = document.getElementById('shTweakTobaccoAutocomplete');
    if (input) { input.value = ''; delete input.dataset.flavorData; input.dataset.flavorSource = 'generic'; }
}

// Internal calculation (no inline display — recipe shown after MIXUJ)
function updateTweakCalculation() {
    // Toggle mixology sub-groups
    const mixItems = ['Honey', 'Molasses', 'Menthol', 'Citric', 'Water'];
    mixItems.forEach(item => {
        const checked = document.getElementById(`shTweakMix${item}`)?.checked || false;
        document.getElementById(`shTweakMix${item}Group`)?.classList.toggle('hidden', !checked);
    });
}

// Build and show tweak recipe on results page (called from MIXUJ button)
function calculateShishaTweak() {
    const tobaccoG = parseFloat(document.getElementById('shTweakTobaccoAmount')?.value) || 50;
    const ingredients = [];
    let nicotineTarget = 0;
    let totalAdditives = 0;
    
    // Vybraný tabák z oblíbených
    const tobaccoInput = document.getElementById('shTweakTobaccoAutocomplete');
    let selectedTobaccoName = null;
    if (tobaccoInput?.dataset?.flavorData) {
        try {
            const td = JSON.parse(tobaccoInput.dataset.flavorData);
            const brand = td.manufacturer_code || td.manufacturer || td.brand || '';
            selectedTobaccoName = brand ? `${td.name} (${brand})` : td.name;
        } catch(e) {}
    }
    
    // VG section
    if (document.getElementById('shTweakProblemVg')?.checked) {
        const vgPct = parseFloat(document.getElementById('shTweakVgPercent')?.value ?? 10);
        const vgMl = (vgPct / 100) * tobaccoG;
        if (vgMl > 0) {
            ingredients.push({ name: t('shisha.tweak_ingredient_vg', 'Glycerin (VG)'), ingredientKey: 'shisha_tweak_vg', volume: vgMl, percent: vgPct, grams: Math.round(vgMl * 1.26 * 10) / 10 });
            totalAdditives += vgMl;
        }
    }
    
    // Taste (flavor drops)
    if (document.getElementById('shTweakProblemTaste')?.checked) {
        const drops = Math.max(2, Math.round(tobaccoG / 10));
        const dropMl = drops * 0.05;
        ingredients.push({ name: t('shisha.tweak_ingredient_drops', 'Chuťové kapky'), ingredientKey: 'shisha_tweak_drops', volume: dropMl, percent: 0, grams: Math.round(dropMl * 10) / 10, displayAmount: `${drops} ${t('shisha.tweak_drops', 'kapek')}` });
        totalAdditives += dropMl;
    }
    
    // Flavor concentrate (1-4) — iterace přes reálné DOM elementy
    if (document.getElementById('shTweakProblemFlavor')?.checked) {
        const tweakFlavorIndices = getShishaTweakFlavorIndices();
        for (const fi of tweakFlavorIndices) {
            const flavorType = document.getElementById(`shTweakFlavorType${fi}`)?.value || 'none';
            const flavorPct = parseFloat(document.getElementById(`shTweakFlavorStrength${fi}`)?.value ?? 5);
            const flavorAuto = document.getElementById(`shTweakFlavorAutocomplete${fi}`);
            const hasDbFlavor = flavorAuto && flavorAuto.dataset.flavorData;
            if ((flavorType !== 'none' || hasDbFlavor) && flavorPct > 0) {
                const flavorMl = (flavorPct / 100) * tobaccoG;
                let flavorDisplayName = flavorType !== 'none' ? getFlavorName(flavorType) : t('shisha.tweak_ingredient_concentrate', 'Aroma koncentrát');
                const flavorIngredient = { name: flavorDisplayName, ingredientKey: 'shisha_tweak_flavor', flavorType: flavorType, volume: flavorMl, percent: flavorPct, grams: Math.round(flavorMl * 1.04 * 10) / 10, flavorNumber: fi };
                if (hasDbFlavor) {
                    try {
                        const fd = JSON.parse(flavorAuto.dataset.flavorData);
                        const brand = fd.manufacturer_code || fd.manufacturer || fd.brand || '';
                        flavorDisplayName = brand ? `${fd.name} (${brand})` : fd.name;
                        flavorIngredient.name = flavorDisplayName;
                        flavorIngredient.flavorName = fd.name;
                        flavorIngredient.flavorManufacturer = fd.manufacturer_code || fd.manufacturer || fd.brand || null;
                        const isFavorite = fd.source === 'favorites' || fd.source === 'favorite';
                        if (isFavorite) {
                            flavorIngredient.favoriteProductId = fd.favorite_product_id || fd.id || flavorAuto.dataset.favoriteProductId || null;
                            flavorIngredient.flavorId = fd.flavor_id || null;
                            flavorIngredient.flavorSource = 'favorite';
                        } else {
                            flavorIngredient.flavorId = fd.id || flavorAuto.dataset.flavorId || null;
                            flavorIngredient.flavorSource = 'database';
                        }
                    } catch(e) {}
                }
                ingredients.push(flavorIngredient);
                totalAdditives += flavorMl;
            }
        }
    }
    
    // Nicotine
    if (document.getElementById('shTweakProblemNicotine')?.checked) {
        nicotineTarget = parseFloat(document.getElementById('shTweakTargetNicotine')?.value ?? 1);
        const nicBase = parseFloat(document.getElementById('shTweakNicotineBaseStrength')?.value) || 20;
        if (nicotineTarget > 0 && nicBase > 0) {
            const nicMl = (nicotineTarget * tobaccoG) / nicBase;
            ingredients.push({ name: t('shisha.tweak_ingredient_nicotine', 'Nikotinový booster'), ingredientKey: 'shisha_tweak_nicotine', volume: nicMl, percent: 0, grams: Math.round(nicMl * 1.04 * 10) / 10 });
            totalAdditives += nicMl;
        }
    }
    
    // Mixology
    if (document.getElementById('shTweakProblemMixology')?.checked) {
        if (document.getElementById('shTweakMixHoney')?.checked) {
            const pct = parseFloat(document.getElementById('shTweakMixHoneyPercent')?.value ?? 5);
            if (pct > 0) { const ml = pct / 100 * tobaccoG; ingredients.push({ name: t('shisha.tweak_ingredient_honey', 'Med'), ingredientKey: 'shisha_tweak_honey', volume: ml, percent: pct, grams: Math.round(ml * 1.42 * 10) / 10 }); totalAdditives += ml; }
        }
        if (document.getElementById('shTweakMixMolasses')?.checked) {
            const pct = parseFloat(document.getElementById('shTweakMixMolassesPercent')?.value ?? 10);
            if (pct > 0) { const ml = pct / 100 * tobaccoG; ingredients.push({ name: t('shisha.tweak_ingredient_molasses', 'Melasa'), ingredientKey: 'shisha_tweak_molasses', volume: ml, percent: pct, grams: Math.round(ml * 1.4 * 10) / 10 }); totalAdditives += ml; }
        }
        if (document.getElementById('shTweakMixMenthol')?.checked) {
            const drops = parseInt(document.getElementById('shTweakMixMentholDrops')?.value ?? 3);
            const scaled = Math.round(drops * tobaccoG / 20);
            if (scaled > 0) { const ml = scaled * 0.05; ingredients.push({ name: t('shisha.tweak_ingredient_menthol', 'Mentol / Cooling'), ingredientKey: 'shisha_tweak_menthol', volume: ml, percent: 0, grams: Math.round(ml * 10) / 10, displayAmount: `${scaled} ${t('shisha.tweak_drops', 'kapek')}` }); totalAdditives += ml; }
        }
        if (document.getElementById('shTweakMixCitric')?.checked) {
            const gPer20 = parseFloat(document.getElementById('shTweakMixCitricGrams')?.value ?? 0.5);
            const totalG = Math.round(gPer20 * tobaccoG / 20 * 10) / 10;
            if (totalG > 0) { ingredients.push({ name: t('shisha.tweak_ingredient_citric', 'Kyselina citrónová'), ingredientKey: 'shisha_tweak_citric', volume: 0, percent: 0, grams: totalG }); }
        }
        if (document.getElementById('shTweakMixWater')?.checked) {
            const pct = parseFloat(document.getElementById('shTweakMixWaterPercent')?.value ?? 5);
            if (pct > 0) { const ml = pct / 100 * tobaccoG; ingredients.push({ name: t('shisha.tweak_ingredient_water', 'Voda / šťáva'), ingredientKey: 'shisha_tweak_water', volume: ml, percent: pct, grams: Math.round(ml * 10) / 10 }); totalAdditives += ml; }
        }
    }
    
    if (ingredients.length === 0) {
        showNotification(t('shisha.tweak_recipe_empty', 'Vyberte alespoň jednu úpravu a nastavte hodnoty.'), 'warning');
        return;
    }
    
    const totalAmount = totalAdditives;
    // Capture form state for prefill on edit
    const tweakState = {
        problemVg: document.getElementById('shTweakProblemVg')?.checked || false,
        problemTaste: document.getElementById('shTweakProblemTaste')?.checked || false,
        problemFlavor: document.getElementById('shTweakProblemFlavor')?.checked || false,
        problemNicotine: document.getElementById('shTweakProblemNicotine')?.checked || false,
        problemMixology: document.getElementById('shTweakProblemMixology')?.checked || false,
        vgPercent: parseFloat(document.getElementById('shTweakVgPercent')?.value ?? 10),
        flavors: getShishaTweakFlavorIndices().map(fi => ({
            type: document.getElementById(`shTweakFlavorType${fi}`)?.value || 'none',
            strength: parseFloat(document.getElementById(`shTweakFlavorStrength${fi}`)?.value ?? 5),
            flavorRatio: parseInt(document.getElementById(`shTweakFlavorRatioSlider${fi}`)?.value ?? 0)
        })),
        nicotineType: document.getElementById('shTweakNicotineType')?.value || 'freebase',
        nicotineBaseStrength: parseFloat(document.getElementById('shTweakNicotineBaseStrength')?.value) || 20,
        nicotineTarget: nicotineTarget,
        mixHoney: document.getElementById('shTweakMixHoney')?.checked || false,
        mixHoneyPercent: parseFloat(document.getElementById('shTweakMixHoneyPercent')?.value ?? 5),
        mixMolasses: document.getElementById('shTweakMixMolasses')?.checked || false,
        mixMolassesPercent: parseFloat(document.getElementById('shTweakMixMolassesPercent')?.value ?? 10),
        mixMenthol: document.getElementById('shTweakMixMenthol')?.checked || false,
        mixMentholDrops: parseInt(document.getElementById('shTweakMixMentholDrops')?.value ?? 3),
        mixCitric: document.getElementById('shTweakMixCitric')?.checked || false,
        mixCitricGrams: parseFloat(document.getElementById('shTweakMixCitricGrams')?.value ?? 0.5),
        mixWater: document.getElementById('shTweakMixWater')?.checked || false,
        mixWaterPercent: parseFloat(document.getElementById('shTweakMixWaterPercent')?.value ?? 5)
    };
    
    // Flavor autocomplete data — iterace přes reálné DOM elementy
    tweakState.flavorData = [];
    getShishaTweakFlavorIndices().forEach((fi, arrIdx) => {
        const tweakFlavorAuto = document.getElementById(`shTweakFlavorAutocomplete${fi}`);
        if (tweakFlavorAuto?.dataset?.flavorData) {
            try { tweakState.flavorData[arrIdx] = JSON.parse(tweakFlavorAuto.dataset.flavorData); } catch(e) {}
        }
    });
    
    // Tobacco autocomplete data
    if (tobaccoInput?.dataset?.flavorData) {
        try { tweakState.tobaccoData = JSON.parse(tobaccoInput.dataset.flavorData); } catch(e) {}
    }
    
    const recipeData = {
        formType: 'shisha',
        shishaMode: 'tweak',
        totalAmount: Math.round(totalAmount * 10) / 10,
        totalGrams: tobaccoG,
        tobaccoAmount: tobaccoG,
        tobaccoName: selectedTobaccoName,
        tweakState,
        steepDays: 0,
        nicotine: nicotineTarget,
        vgPercent: 0,
        pgPercent: 0,
        ingredients
    };
    
    storeCurrentRecipe(recipeData);
    
    // Fill results page
    document.getElementById('resultTotal').textContent = `${tobaccoG} g + ${totalAmount.toFixed(1)} ml`;
    document.getElementById('resultRatio').textContent = '—';
    document.getElementById('resultNicotine').textContent = nicotineTarget > 0 ? `+${nicotineTarget} mg/ml` : '—';
    
    const tbody = document.getElementById('resultsBody');
    tbody.innerHTML = '';
    
    // Tobacco base row
    const tobLabel = selectedTobaccoName
        ? `${selectedTobaccoName}`
        : t('shisha.tweak_recipe_tobacco_base', 'Tabák (základ)');
    const tobRow = document.createElement('tr');
    tobRow.innerHTML = `
        <td class="ingredient-name">${tobLabel}</td>
        <td class="ingredient-value">—</td>
        <td class="ingredient-grams">${tobaccoG.toFixed(1)}</td>
    `;
    tbody.appendChild(tobRow);
    
    let totalMl = 0, totalGrams = tobaccoG;
    ingredients.forEach(ing => {
        const row = document.createElement('tr');
        const volText = ing.displayAmount ? ing.displayAmount : (ing.volume > 0 ? ing.volume.toFixed(1) : '—');
        totalMl += ing.volume;
        totalGrams += ing.grams;
        row.innerHTML = `
            <td class="ingredient-name">${getIngredientName(ing)}${ing.percent > 0 ? ` <span class="ingredient-percent-inline">(${ing.percent}%)</span>` : ''}</td>
            <td class="ingredient-value">${volText}</td>
            <td class="ingredient-grams">${ing.grams.toFixed(1)}</td>
        `;
        tbody.appendChild(row);
    });
    
    const totalRow = document.createElement('tr');
    totalRow.className = 'total-row';
    totalRow.innerHTML = `
        <td class="ingredient-name">${t('ingredients.total', 'CELKEM')}</td>
        <td class="ingredient-value">${totalMl > 0 ? totalMl.toFixed(1) : '—'}</td>
        <td class="ingredient-grams">${totalGrams.toFixed(1)}</td>
    `;
    tbody.appendChild(totalRow);
    
    generateMixingNotes(recipeData);
    
    // Show results page
    const newButtons = document.getElementById('resultsNewButtons');
    const editButtons = document.getElementById('resultsEditButtons');
    if (window.editingRecipeFromDetail) {
        if (newButtons) newButtons.classList.add('hidden');
        if (editButtons) editButtons.classList.remove('hidden');
    } else {
        if (newButtons) newButtons.classList.remove('hidden');
        if (editButtons) editButtons.classList.add('hidden');
    }
    showPage('results');
}

function adjustTweakAddon(type, change) {
    const idMap = { vg: 'Vg' };
    const slider = document.getElementById(`shTweak${idMap[type] || 'Vg'}Percent`);
    if (!slider) return;
    slider.value = Math.max(parseInt(slider.min) || 0, Math.min(parseInt(slider.max), parseInt(slider.value) + change));
    updateTweakAddonDisplay(type);
}

function updateTweakAddonDisplay(type) {
    const idMap = { vg: 'Vg' };
    const id = idMap[type] || 'Vg';
    const slider = document.getElementById(`shTweak${id}Percent`);
    const display = document.getElementById(`shTweak${id}Value`);
    const track = document.getElementById(`shTweak${id}Track`);
    if (!slider) return;
    if (display) display.textContent = slider.value;
    if (track) track.style.width = '100%';
}

// Mixology slider helpers
function adjustTweakMixSlider(type, change) {
    const idMap = { honey: 'shTweakMixHoneyPercent', molasses: 'shTweakMixMolassesPercent', menthol: 'shTweakMixMentholDrops', citric: 'shTweakMixCitricGrams', water: 'shTweakMixWaterPercent' };
    const slider = document.getElementById(idMap[type]);
    if (!slider) return;
    const step = parseFloat(slider.step) || 1;
    slider.value = Math.max(parseFloat(slider.min) || 0, Math.min(parseFloat(slider.max), parseFloat(slider.value) + change));
    updateTweakMixSlider(type);
}

function updateTweakMixSlider(type) {
    const idMap = { honey: 'shTweakMixHoneyPercent', molasses: 'shTweakMixMolassesPercent', menthol: 'shTweakMixMentholDrops', citric: 'shTweakMixCitricGrams', water: 'shTweakMixWaterPercent' };
    const displayMap = { honey: 'shTweakMixHoneyValue', molasses: 'shTweakMixMolassesValue', menthol: 'shTweakMixMentholValue', citric: 'shTweakMixCitricValue', water: 'shTweakMixWaterValue' };
    const trackMap = { honey: 'shTweakMixHoneyTrack', molasses: 'shTweakMixMolassesTrack', menthol: 'shTweakMixMentholTrack', citric: 'shTweakMixCitricTrack', water: 'shTweakMixWaterTrack' };
    const slider = document.getElementById(idMap[type]);
    const display = document.getElementById(displayMap[type]);
    const track = document.getElementById(trackMap[type]);
    if (!slider) return;
    if (display) display.textContent = slider.value;
    if (track) track.style.width = '100%';
}

function updateShishaTweakNicotineType() {
    updateTweakCalculation();
}

function updateShishaTweakNicotineRatio(ratio) {
    document.querySelectorAll('.sh-tweak-nic-ratio-btn').forEach(b => b.classList.toggle('active', b.dataset.value === ratio));
    const hidden = document.getElementById('shTweakNicotineRatio');
    if (hidden) hidden.value = ratio;
}

function adjustShishaTweakTargetNicotine(change) {
    const slider = document.getElementById('shTweakTargetNicotine');
    if (!slider) return;
    slider.value = Math.max(0, Math.min(10, parseInt(slider.value) + change));
    updateShishaTweakNicotineDisplay();
}

function updateShishaTweakNicotineDisplay() {
    const slider = document.getElementById('shTweakTargetNicotine');
    const display = document.getElementById('shTweakTargetNicotineValue');
    const track = document.getElementById('shTweakNicotineTrack');
    const descEl = document.getElementById('shTweakNicotineDescription');
    const displayContainer = display ? display.parentElement : null;
    if (!slider) return;
    const val = parseInt(slider.value);
    if (display) display.textContent = val;
    const desc = shishaNicotineDescriptions.find(d => val >= d.min && val <= d.max);
    if (desc) {
        if (track) track.style.background = `linear-gradient(90deg, #00cc66, ${desc.color})`;
        if (descEl) { descEl.textContent = getShishaNicotineDescriptionText(val); descEl.style.color = desc.color; descEl.style.borderLeftColor = desc.color; }
        if (displayContainer) { displayContainer.style.color = desc.color; displayContainer.style.textShadow = `0 0 20px ${desc.color}`; }
    }
    if (track) track.style.width = '100%';
}

function updateShishaTweakFlavorType(index) {
    const select = document.getElementById(`shTweakFlavorType${index}`);
    const container = document.getElementById(`shTweakFlavorStrengthContainer${index}`);
    if (!select || !container) return;
    if (select.value === 'none') {
        container.classList.add('hidden');
        hideCategoryFlavorWarning(`shTweakFlavorStrengthContainer${index}`);
    } else {
        container.classList.remove('hidden');
        const autoInput = document.getElementById(`shTweakFlavorAutocomplete${index}`);
        const hasDbFlavor = autoInput?.dataset?.flavorData && autoInput.dataset.flavorData.length > 2;
        if (!hasDbFlavor) {
            showCategoryFlavorWarning(`shTweakFlavorStrengthContainer${index}`, `shTweakFlavorStrength${index}`, `shTweakFlavorValue${index}`, `shTweakFlavorTrack${index}`);
        } else {
            const flavor = flavorDatabase[select.value];
            if (flavor) {
                const slider = document.getElementById(`shTweakFlavorStrength${index}`);
                if (slider) { slider.value = flavor.ideal; updateShishaTweakFlavorStrength(index); }
            }
        }
    }
}

function updateShishaTweakFlavorStrength(index) {
    const slider = document.getElementById(`shTweakFlavorStrength${index}`);
    const display = document.getElementById(`shTweakFlavorValue${index}`);
    const track = document.getElementById(`shTweakFlavorTrack${index}`);
    if (!slider) return;
    const val = parseFloat(slider.value);
    if (display) display.textContent = Number.isInteger(val) ? val : val.toFixed(1);
    // Min/max-aware barvy (stejná logika jako DIY)
    const autocomplete = document.getElementById(`shTweakFlavorAutocomplete${index}`);
    let minP = 0, maxP = 100, hasSpecific = false, hasVerified = false;
    if (autocomplete?.dataset.flavorData) {
        try {
            const fd = JSON.parse(autocomplete.dataset.flavorData);
            hasSpecific = fd && fd.name;
            hasVerified = fd.min_percent && fd.max_percent && fd.min_percent > 0;
            if (hasVerified) { minP = fd.min_percent; maxP = fd.max_percent; }
        } catch (e) {}
    }
    // Kategorie bez konkrétní příchutě → šedá
    const typeSelect = document.getElementById(`shTweakFlavorType${index}`);
    const isCategoryOnly = typeSelect && typeSelect.value !== 'none' && !hasSpecific;
    let color = '#00cc66';
    if (isCategoryOnly || (hasSpecific && !hasVerified)) {
        color = '#888888';
        if (track) track.style.background = 'linear-gradient(90deg, #666666, #888888)';
    } else if (val < minP && hasVerified) {
        color = '#ffaa00';
        if (track) track.style.background = 'linear-gradient(90deg, #ff6600, #ffaa00)';
    } else if (val > maxP && hasVerified) {
        color = '#ff0044';
        if (track) track.style.background = 'linear-gradient(90deg, #00cc66, #ff0044)';
    } else {
        if (track) track.style.background = 'linear-gradient(90deg, #00cc66, #00aaff)';
    }
    if (track) track.style.width = '100%';
    if (display?.parentElement) display.parentElement.style.color = color;
}

function adjustShishaTweakFlavor(index, change) {
    const slider = document.getElementById(`shTweakFlavorStrength${index}`);
    if (!slider) return;
    const newVal = Math.max(0, Math.min(15, parseFloat(slider.value) + change));
    slider.value = newVal;
    updateShishaTweakFlavorStrength(index);
}

function autoRecalculateShishaTweakVgPgRatio() { }

function adjustShishaTweakFlavorRatio(index, change) {
    const slider = document.getElementById(`shTweakFlavorRatioSlider${index}`);
    if (!slider) return;
    let v = parseInt(slider.value);
    v = change > 0 ? Math.ceil((v + 1) / 5) * 5 : Math.floor((v - 1) / 5) * 5;
    slider.value = Math.max(0, Math.min(100, v));
    updateShishaTweakFlavorRatioDisplay(index);
}

function updateShishaTweakFlavorRatioDisplay(index) {
    const slider = document.getElementById(`shTweakFlavorRatioSlider${index}`);
    const vgEl = document.getElementById(`shTweakFlavorVgValue${index}`);
    const pgEl = document.getElementById(`shTweakFlavorPgValue${index}`);
    const track = document.getElementById(`shTweakFlavorTrackRatio${index}`);
    if (!slider) return;
    const vg = parseInt(slider.value);
    if (vgEl) vgEl.textContent = vg;
    if (pgEl) pgEl.textContent = 100 - vg;
    if (track) { track.style.width = '100%'; track.style.background = 'linear-gradient(90deg, #00cc66, #00aaff)'; }
}

function getShishaTweakFlavorIndices() {
    const indices = [1]; // Příchuť 1 je vždy statická v HTML
    const container = document.getElementById('shTweakAdditionalFlavorsContainer');
    if (container) {
        container.querySelectorAll('.sh-flavor-group').forEach(group => {
            const match = group.id.match(/shTweakFlavorGroup(\d+)/);
            if (match) indices.push(parseInt(match[1]));
        });
    }
    return indices;
}

function addShishaTweakFlavor() {
    if (!isUserLoggedIn()) { showLoginRequiredModal(); return; }
    if (shTweakFlavorCount >= 4) return;
    shTweakFlavorNextId++;
    shTweakFlavorCount++;
    const container = document.getElementById('shTweakAdditionalFlavorsContainer');
    const i = shTweakFlavorNextId;
    const html = `
        <div class="form-group sh-flavor-group" id="shTweakFlavorGroup${i}">
            <label class="form-label">
                <span data-i18n="shisha.flavor_label">${window.i18n?.t('shisha.flavor_label') || 'Příchuť'}</span>
                <span class="flavor-number"> ${i}</span>
                <button type="button" class="remove-flavor-btn" onclick="removeShishaTweakFlavor(${i})" title="✕">✕</button>
            </label>
            <div class="flavor-container">
                <div class="flavor-autocomplete-wrapper">
                    <input type="text" id="shTweakFlavorAutocomplete${i}" class="login-input flavor-search-input" data-product-type="vape" placeholder="${window.i18n?.t('flavor_autocomplete.search_placeholder') || 'Hledat konkrétní příchuť...'}" autocomplete="off">
                </div>
                <select id="shTweakFlavorType${i}" class="neon-select sh-tweak-flavor-select" data-flavor-index="${i}" onchange="updateShishaTweakFlavorType(${i})">
                    <option value="none">${window.i18n?.t('form.flavor_none') || 'Žádná'}</option>
                    <option value="fruit">${window.i18n?.t('form.flavor_fruit') || 'Ovoce'}</option>
                    <option value="citrus">${window.i18n?.t('form.flavor_citrus') || 'Citrónové'}</option>
                    <option value="berry">${window.i18n?.t('form.flavor_berry') || 'Bobulové'}</option>
                    <option value="tropical">${window.i18n?.t('form.flavor_tropical') || 'Tropické'}</option>
                    <option value="menthol">${window.i18n?.t('form.flavor_menthol') || 'Mentol'}</option>
                    <option value="cream">${window.i18n?.t('form.flavor_cream') || 'Krémové'}</option>
                    <option value="candy">${window.i18n?.t('form.flavor_candy') || 'Sladkosti'}</option>
                    <option value="drink">${window.i18n?.t('form.flavor_drink') || 'Nápojové'}</option>
                    <option value="mix">${window.i18n?.t('form.flavor_mix') || 'Mix'}</option>
                </select>
                <div id="shTweakFlavorStrengthContainer${i}" class="hidden">
                    <div class="slider-container small">
                        <button class="slider-btn small double" onclick="adjustShishaTweakFlavor(${i},-1)">◀◀</button>
                        <button class="slider-btn small" onclick="adjustShishaTweakFlavor(${i},-0.1)">◀</button>
                        <div class="slider-wrapper">
                            <input type="range" id="shTweakFlavorStrength${i}" min="0" max="15" value="5" step="0.1" class="flavor-slider" oninput="updateShishaTweakFlavorStrength(${i})">
                            <div class="slider-track flavor-track" id="shTweakFlavorTrack${i}"></div>
                        </div>
                        <button class="slider-btn small" onclick="adjustShishaTweakFlavor(${i},0.1)">▶</button>
                        <button class="slider-btn small double" onclick="adjustShishaTweakFlavor(${i},1)">▶▶</button>
                    </div>
                    <div class="flavor-display"><span id="shTweakFlavorValue${i}">5</span>%</div>
                    <div id="shTweakFlavorStrengthDisplay${i}" class="flavor-strength-display"></div>
                </div>
            </div>
        </div>`;
    container.insertAdjacentHTML('beforeend', html);
    
    // Init autocomplete for new flavor
    const acId = `shTweakFlavorAutocomplete${i}`;
    if (document.getElementById(acId) && typeof initFlavorAutocomplete === 'function') {
        initFlavorAutocomplete(acId, 'liquid', () => {});
    }
    
    if (shTweakFlavorCount >= 4) document.getElementById('shTweakAddFlavorGroup')?.classList.add('hidden');
    const hint = document.getElementById('shTweakFlavorCountHint');
    if (hint) hint.textContent = `(${shTweakFlavorCount}/4)`;
    renumberShishaTweakFlavors();
    if (window.i18n?.applyTranslations) window.i18n.applyTranslations();
}

function removeShishaTweakFlavor(index) {
    document.getElementById(`shTweakFlavorGroup${index}`)?.remove();
    shTweakFlavorCount--;
    document.getElementById('shTweakAddFlavorGroup')?.classList.remove('hidden');
    const hint = document.getElementById('shTweakFlavorCountHint');
    if (hint) hint.textContent = `(${shTweakFlavorCount}/4)`;
    renumberShishaTweakFlavors();
}

function renumberShishaTweakFlavors() {
    const container = document.getElementById('shTweakAdditionalFlavorsContainer');
    if (!container) return;
    const groups = container.querySelectorAll('.sh-flavor-group');
    groups.forEach((group, idx) => {
        const numEl = group.querySelector('.flavor-number');
        if (numEl) numEl.textContent = ` ${idx + 2}`;
    });
}

// Legacy compat stubs (old form functions that may be referenced elsewhere)
function handleShishaNicotineSelect() {}
function toggleShishaNicotine() {}
function updateShishaFlavorType() {}
function adjustShishaFlavor() {}
function updateShishaFlavorStrength() {}
function adjustShishaFlavorRatio() {}
function updateShishaFlavorRatioDisplay() {}
function updateShishaTotalFlavorPercent() {}
function addShishaFlavor() {}
function removeShishaFlavor() {}
function getShishaFlavorsData() { return []; }
function handleShishaSweetenerSelect() {}
function toggleShishaSweetener() {}
function updateShishaSweetenerType() {}
function adjustShishaSweetener() {}
function updateShishaSweetenerDisplay() {}
function toggleShishaWater() {}
function adjustShishaWater() {}
function updateShishaWaterDisplay() {}
function adjustShishaRatio() {}
function updateShishaRatioDisplay() {}
function autoRecalculateShishaVgPgRatio() {}
function updateShishaVgPgLimits() {}
function updateShishaBaseType() {}
function updateShishaPremixedRatio() {}
function updateShishaCustomPremixedPg() {}
function updateShishaNicotineType() {}
function updateShishaNicotineRatio() {}
function adjustShishaNicRatio() {}
function updateShishaNicRatioDisplay() {}
function adjustShishaTargetNicotine() {}
function updateShishaNicotineDisplay() {}

// =========================================
// CALCULATE SHISHA MIX (dispatcher)
// =========================================
function calculateShishaMix() {
    const mode = currentShishaMode || 'mix';
    
    if (mode === 'mix') {
        calculateShishaMixMode1();
    } else if (mode === 'tweak') {
        calculateShishaTweak();
    } else if (mode === 'diy') {
        calculateShishaMixMode2();
    } else if (mode === 'molasses') {
        calculateShishaMixMode3();
    }
}

// MODE 1: Mix hotových tabáků
function calculateShishaMixMode1() {
    const bowlSize = parseInt(document.getElementById('shBowlSize')?.value) || 15;
    
    // Collect tobaccos
    const tobaccos = [];
    for (let i = 1; i <= 4; i++) {
        const slider = document.getElementById(`shTobaccoPercent${i}`);
        const autocomplete = document.getElementById(`shTobaccoAutocomplete${i}`);
        if (!slider) continue;
        const percent = parseInt(slider.value) || 0;
        if (percent <= 0) continue;
        
        let name = '';
        let flavorName = null, flavorManufacturer = null, flavorId = null, flavorSource = null, favoriteProductId = null;
        let steepDays = null;
        if (autocomplete && autocomplete.dataset.flavorData) {
            try {
                const data = JSON.parse(autocomplete.dataset.flavorData);
                name = data.name || '';
                flavorName = data.name || null;
                flavorManufacturer = data.manufacturer || data.manufacturer_code || null;
                if (name && flavorManufacturer) name += ` (${flavorManufacturer})`;
                const isFavorite = data.source === 'favorites' || data.source === 'favorite';
                if (isFavorite) {
                    favoriteProductId = data.favorite_product_id || data.id || autocomplete.dataset.favoriteProductId || null;
                    flavorId = data.flavor_id || null;
                    flavorSource = 'favorite';
                } else {
                    flavorId = data.id || autocomplete.dataset.flavorId || null;
                    flavorSource = 'database';
                }
                if (data.steep_days !== undefined && data.steep_days !== null) {
                    steepDays = data.steep_days;
                } else if (data.flavor_steep_days !== undefined && data.flavor_steep_days !== null) {
                    steepDays = data.flavor_steep_days;
                }
            } catch(e) {}
        }
        if (!name) name = `${t('shisha.tobacco_label', 'Tabák')} ${i}`;
        
        const grams = Math.round((percent / 100) * bowlSize * 10) / 10;
        const tobaccoEntry = { name, percent, grams, flavorName, flavorManufacturer, flavorId, flavorSource, favoriteProductId };
        if (steepDays !== null) tobaccoEntry.steepDays = steepDays;
        tobaccos.push(tobaccoEntry);
    }
    
    // Validate total = 100%
    const total = tobaccos.reduce((s, tb) => s + tb.percent, 0);
    if (total !== 100) {
        showNotification(t('shisha.tobacco_total_warning', 'Celkový podíl tabáků musí být 100%'), 'warning');
        return;
    }
    
    // Build ingredients in displayResults-compatible format (volume=0 for gram-only items)
    const ingredients = tobaccos.map((tb, idx) => ({
        name: tb.name,
        ingredientKey: 'shisha_tobacco',
        volume: 0,
        percent: tb.percent,
        grams: tb.grams,
        flavorName: tb.flavorName,
        flavorManufacturer: tb.flavorManufacturer,
        flavorId: tb.flavorId,
        flavorSource: tb.flavorSource,
        favoriteProductId: tb.favoriteProductId
    }));
    
    const recipeData = {
        formType: 'shisha',
        shishaMode: 'mix',
        bowlSize,
        totalAmount: bowlSize,
        totalGrams: bowlSize,
        tobaccos,
        steepDays: 0,
        nicotine: 0,
        vgPercent: 0,
        pgPercent: 0,
        ingredients
    };
    
    storeCurrentRecipe(recipeData);
    
    // Custom rendering for tobacco mix (grams, no ml)
    document.getElementById('resultTotal').textContent = `${bowlSize} g`;
    document.getElementById('resultRatio').textContent = '—';
    document.getElementById('resultNicotine').textContent = '0 mg/ml';
    
    const tbody = document.getElementById('resultsBody');
    tbody.innerHTML = '';
    let totalGrams = 0;
    
    ingredients.forEach(ing => {
        const row = document.createElement('tr');
        totalGrams += ing.grams;
        row.innerHTML = `
            <td class="ingredient-name">${ing.name} <span class="ingredient-percent-inline">(${ing.percent.toFixed(1)}%)</span></td>
            <td class="ingredient-value">—</td>
            <td class="ingredient-grams">${ing.grams.toFixed(1)}</td>
        `;
        tbody.appendChild(row);
    });
    
    const totalRow = document.createElement('tr');
    totalRow.className = 'total-row';
    totalRow.innerHTML = `
        <td class="ingredient-name">${t('ingredients.total', 'CELKEM')}</td>
        <td class="ingredient-value">—</td>
        <td class="ingredient-grams">${totalGrams.toFixed(1)}</td>
    `;
    tbody.appendChild(totalRow);
    
    generateMixingNotes(recipeData);
    
    // Show results page with correct buttons
    const newButtons = document.getElementById('resultsNewButtons');
    const editButtons = document.getElementById('resultsEditButtons');
    if (window.editingRecipeFromDetail) {
        if (newButtons) newButtons.classList.add('hidden');
        if (editButtons) editButtons.classList.remove('hidden');
    } else {
        if (newButtons) newButtons.classList.remove('hidden');
        if (editButtons) editButtons.classList.add('hidden');
    }
    showPage('results');
}

// MODE 2: DIY tabák od nuly
function calculateShishaMixMode2() {
    const tobaccoAmount = parseFloat(document.getElementById('shDiyTobaccoAmount')?.value) || 250;
    const ratioVal = document.getElementById('shDiyRatio')?.value;
    let tobaccoMolassesRatio;
    if (ratioVal === 'custom') {
        const tR = parseFloat(document.getElementById('shDiyCustomRatioTobacco')?.value) || 3;
        const mR = parseFloat(document.getElementById('shDiyCustomRatioMolasses')?.value) || 1;
        tobaccoMolassesRatio = tR / mR;
    } else {
        tobaccoMolassesRatio = parseFloat(ratioVal) || 3;
    }
    const totalMolasses = tobaccoAmount / tobaccoMolassesRatio;
    
    // Sweetener base
    const sweetenerType = document.getElementById('shDiySweetenerType')?.value || 'molasses';
    const sweetenerPercent = parseInt(document.getElementById('shDiySweetenerPercent')?.value) || 55;
    const glycerinPercent = parseInt(document.getElementById('shDiyGlycerinPercent')?.value) || 30;
    const waterPercent = parseFloat(document.getElementById('shDiyWaterPercent')?.value) || 0;
    
    // Flavors with full metadata for save pipeline
    const flavors = [];
    let totalFlavorPercent = 0;
    for (let i = 1; i <= 4; i++) {
        const select = document.getElementById(`shDiyFlavorType${i}`);
        const slider = document.getElementById(`shDiyFlavorStrength${i}`);
        const ratioSlider = document.getElementById(`shDiyFlavorRatioSlider${i}`);
        const autocomplete = document.getElementById(`shDiyFlavorAutocomplete${i}`);
        const hasDbFlavor = autocomplete && autocomplete.dataset.flavorData;
        if (!select || !slider || (select.value === 'none' && !hasDbFlavor)) continue;
        const pct = parseFloat(slider.value) || 0;
        if (pct <= 0) continue;
        totalFlavorPercent += pct;
        
        let displayName = select.options[select.selectedIndex]?.text || select.value;
        let flavorName = null, flavorManufacturer = null, flavorId = null, flavorSource = null, favoriteProductId = null;
        let flavorSteepDays = null;
        if (autocomplete && autocomplete.dataset.flavorData) {
            try {
                const data = JSON.parse(autocomplete.dataset.flavorData);
                if (data.name) {
                    flavorName = data.name;
                    flavorManufacturer = data.manufacturer || data.manufacturer_code || null;
                    displayName = data.name + (flavorManufacturer ? ` (${flavorManufacturer})` : '');
                    const isFavorite = data.source === 'favorites' || data.source === 'favorite';
                    if (isFavorite) {
                        favoriteProductId = data.favorite_product_id || data.id || autocomplete.dataset.favoriteProductId || null;
                        flavorId = data.flavor_id || null;
                        flavorSource = 'favorite';
                    } else {
                        flavorId = data.id || autocomplete.dataset.flavorId || null;
                        flavorSource = 'database';
                    }
                    if (data.steep_days !== undefined && data.steep_days !== null) {
                        flavorSteepDays = data.steep_days;
                    } else if (data.flavor_steep_days !== undefined && data.flavor_steep_days !== null) {
                        flavorSteepDays = data.flavor_steep_days;
                    }
                }
            } catch(e) {}
        }
        const diyFlavorEntry = {
            type: select.value,
            name: displayName,
            percent: pct,
            vgRatio: parseInt(ratioSlider?.value) || 0,
            flavorName, flavorManufacturer, flavorId, flavorSource, favoriteProductId
        };
        if (flavorSteepDays !== null) diyFlavorEntry.steepDays = flavorSteepDays;
        flavors.push(diyFlavorEntry);
    }
    
    // Nicotine
    const nicType = document.getElementById('shDiyNicotineType')?.value || 'none';
    const nicBaseStrength = parseFloat(document.getElementById('shDiyNicotineBaseStrength')?.value) || 20;
    const nicTarget = parseInt(document.getElementById('shDiyTargetNicotine')?.value) || 0;
    const nicRatioVal = document.getElementById('shDiyNicotineRatio')?.value || '50/50';
    
    // Calculate amounts (in grams from totalMolasses)
    const sweetenerAmount = Math.round(totalMolasses * (sweetenerPercent / 100) * 10) / 10;
    const glycerinAmount = Math.round(totalMolasses * (glycerinPercent / 100) * 10) / 10;
    const waterAmount = Math.round(totalMolasses * (waterPercent / 100) * 10) / 10;
    
    let nicotineAmount = 0;
    if (nicType !== 'none' && nicTarget > 0 && nicBaseStrength > 0) {
        nicotineAmount = Math.round((nicTarget / nicBaseStrength) * totalMolasses * 10) / 10;
    }
    
    // Pure PG
    const purePgPercent = parseInt(document.getElementById('shDiyPurePgPercent')?.value) || 0;
    const purePgAmount = Math.round(totalMolasses * (purePgPercent / 100) * 10) / 10;
    
    const totalWeight = Math.round(tobaccoAmount + totalMolasses);
    
    // Calculate VG/PG ratio (glycerin=VG, PG from flavors/nicotine/purePG)
    const glycerinVol = glycerinAmount;
    let nicVgVol = 0, nicPgVol = 0;
    if (nicotineAmount > 0) {
        const nicVgPct = parseInt((nicRatioVal || '50/50').split('/')[0]) || 50;
        nicVgVol = nicotineAmount * (nicVgPct / 100);
        nicPgVol = nicotineAmount * ((100 - nicVgPct) / 100);
    }
    let flavorVgVol = 0, flavorPgVol = 0;
    flavors.forEach(f => {
        const vol = (f.percent / 100) * totalMolasses;
        flavorVgVol += vol * (f.vgRatio / 100);
        flavorPgVol += vol * ((100 - f.vgRatio) / 100);
    });
    const totalVg = glycerinVol + nicVgVol + flavorVgVol;
    const totalPg = nicPgVol + flavorPgVol + purePgAmount;
    const vgPgTotal = totalVg + totalPg;
    const vgPgRatio = vgPgTotal > 0 ? Math.round((totalVg / vgPgTotal) * 100) : 100;
    
    // Build ingredients array for display
    const ingredients = [];
    
    // Tobacco / Herbs (dry leaves)
    const diyMaterial = document.getElementById('shDiyMaterial')?.value || 'tobacco';
    const materialName = diyMaterial === 'herbs'
        ? `${t('shisha.diy_herbs_amount_label', 'Bylinky')} (${t('shisha.diy_herbs_amount_hint', 'sušené bylinky')})`
        : `${t('shisha.tobacco_amount_label', 'Tabák')} (${t('shisha.tobacco_amount_hint', 'sušené listy')})`;
    ingredients.push({
        name: materialName,
        ingredientKey: 'shisha_diy_material',
        diyMaterial: diyMaterial,
        volume: 0,
        percent: Math.round(tobaccoAmount / totalWeight * 100 * 10) / 10,
        grams: tobaccoAmount
    });
    
    // Sweetener base (molasses/honey/agave) — only if > 0%
    const sweetenerNames = { molasses: t('shisha.sweetener_molasses', 'Melasa'), honey: t('shisha.sweetener_honey', 'Med'), agave: t('shisha.sweetener_agave', 'Agáve') };
    if (sweetenerPercent > 0 && sweetenerAmount > 0) {
        ingredients.push({
            name: sweetenerNames[sweetenerType] || sweetenerType,
            ingredientKey: 'shisha_sweetener',
            sweetenerType,
            volume: sweetenerAmount,
            percent: sweetenerPercent,
            grams: sweetenerAmount
        });
    }
    
    // Glycerin
    ingredients.push({
        name: t('shisha.glycerin_label', 'Glycerin (VG)'),
        ingredientKey: 'vg',
        volume: glycerinAmount,
        percent: glycerinPercent,
        grams: Math.round(glycerinAmount * 1.261 * 10) / 10
    });
    
    // Water (hned za glycerinem — melasa, glycerin, voda pod sebou)
    if (waterAmount > 0) {
        ingredients.push({
            name: t('ingredients.water', 'Voda'),
            ingredientKey: 'water',
            volume: waterAmount,
            percent: waterPercent,
            grams: waterAmount
        });
    }
    
    // Flavors
    flavors.forEach((f, idx) => {
        const flavorGrams = Math.round(totalMolasses * (f.percent / 100) * 10) / 10;
        ingredients.push({
            name: `${t('ingredients.flavor', 'Příchuť')}: ${f.name}`,
            ingredientKey: 'flavor',
            flavorType: f.type,
            flavorNumber: idx + 1,
            flavorName: f.flavorName,
            flavorManufacturer: f.flavorManufacturer,
            flavorId: f.flavorId,
            flavorSource: f.flavorSource,
            favoriteProductId: f.favoriteProductId,
            volume: flavorGrams,
            percent: f.percent,
            grams: flavorGrams,
            params: { vgpg: `${f.vgRatio}/${100 - f.vgRatio}` }
        });
    });
    
    // Pure PG
    if (purePgAmount > 0) {
        ingredients.push({
            name: t('shisha.pure_pg_label', 'Čisté PG (propylenglykol)'),
            ingredientKey: 'pg',
            volume: purePgAmount,
            percent: purePgPercent,
            grams: Math.round(purePgAmount * 1.036 * 10) / 10
        });
    }
    
    // Nicotine
    if (nicotineAmount > 0) {
        const nicIngredientKey = nicType === 'salt' ? 'nicotine_salt' : 'nicotine_booster';
        ingredients.push({
            name: `${t('ingredients.' + nicIngredientKey, 'Nikotin')} (${nicBaseStrength} mg/ml, VG/PG ${nicRatioVal})`,
            ingredientKey: nicIngredientKey,
            volume: nicotineAmount,
            percent: Math.round(nicotineAmount / totalMolasses * 100 * 10) / 10,
            grams: Math.round(nicotineAmount * 10) / 10,
            params: { strength: nicBaseStrength, vgpg: nicRatioVal }
        });
    }
    
    // Mixology — Menthol
    const diyMixMenthol = document.getElementById('shDiyMixMenthol')?.checked || false;
    const diyMixMentholDrops = diyMixMenthol ? (parseInt(document.getElementById('shDiyMixMentholDrops')?.value) || 0) : 0;
    if (diyMixMentholDrops > 0) {
        const mentholMl = Math.round(diyMixMentholDrops * 0.05 * 10) / 10;
        ingredients.push({
            name: `${t('shisha.tweak_mix_menthol', 'Mentol / Cooling')} (${diyMixMentholDrops} ${t('shisha.tweak_drops', 'kapek')})`,
            ingredientKey: 'shisha_diy_menthol',
            volume: mentholMl,
            percent: 0,
            grams: mentholMl
        });
    }
    
    // Mixology — Citric acid
    const diyMixCitric = document.getElementById('shDiyMixCitric')?.checked || false;
    const diyMixCitricGrams = diyMixCitric ? (parseFloat(document.getElementById('shDiyMixCitricGrams')?.value) || 0) : 0;
    if (diyMixCitricGrams > 0) {
        const scaledCitric = Math.round(diyMixCitricGrams * (totalMolasses / 20) * 10) / 10;
        ingredients.push({
            name: `${t('shisha.tweak_mix_citric', 'Kyselina citrónová')} (${scaledCitric} g)`,
            ingredientKey: 'shisha_diy_citric',
            volume: 0,
            percent: 0,
            grams: scaledCitric
        });
    }
    
    // Mixology — Fruit juice
    const diyMixJuice = document.getElementById('shDiyMixJuice')?.checked || false;
    const diyMixJuicePercent = diyMixJuice ? (parseInt(document.getElementById('shDiyMixJuicePercent')?.value) || 0) : 0;
    if (diyMixJuicePercent > 0) {
        const juiceGrams = Math.round(totalMolasses * (diyMixJuicePercent / 100) * 10) / 10;
        ingredients.push({
            name: t('shisha.mix_juice_label', 'Ovocná šťáva'),
            ingredientKey: 'shisha_diy_juice',
            volume: juiceGrams,
            percent: diyMixJuicePercent,
            grams: juiceGrams
        });
    }
    
    const recipeData = {
        formType: 'shisha',
        shishaMode: 'diy',
        diyMaterial,
        tobaccoAmount,
        tobaccoMolassesRatio,
        totalMolasses: Math.round(totalMolasses),
        totalAmount: Math.round(totalMolasses * 100) / 100,
        sweetenerType,
        sweetenerPercent,
        sweetenerAmount,
        glycerinPercent,
        glycerinAmount,
        waterPercent,
        waterAmount,
        flavors,
        nicotine: nicTarget,
        nicotineType: nicType,
        nicotineBaseStrength: nicBaseStrength,
        nicotineTarget: nicTarget,
        nicotineRatio: nicRatioVal,
        nicotineAmount,
        purePgPercent,
        mixology: {
            menthol: diyMixMentholDrops,
            citricGrams: diyMixCitricGrams,
            juicePercent: diyMixJuicePercent
        },
        totalWeight,
        steepDays: Math.max(0, ...flavors.map(f => {
            if (f.steepDays !== undefined && f.steepDays !== null) return f.steepDays;
            if (f.type && f.type !== 'none') {
                const fd = shishaFlavorDatabase[f.type];
                return fd ? fd.steepingDays : 0;
            }
            return 0;
        })),
        vgPercent: vgPgRatio,
        pgPercent: 100 - vgPgRatio,
        ingredients
    };
    
    storeCurrentRecipe(recipeData);
    
    // Custom rendering for DIY (grams-based, tobacco row has no ml)
    document.getElementById('resultTotal').textContent = `${totalWeight}g`;
    document.getElementById('resultRatio').textContent = `${vgPgRatio}:${100 - vgPgRatio}`;
    document.getElementById('resultNicotine').textContent = `${nicTarget} mg/ml`;
    
    // Steep days v hlavičce
    const steepContainer = document.getElementById('resultSteepContainer');
    const steepValueEl = document.getElementById('resultSteepDays');
    if (steepContainer && steepValueEl) {
        if (recipeData.steepDays > 0) {
            const daysText = recipeData.steepDays === 1 ? t('common.day', 'den') : 
                (recipeData.steepDays >= 2 && recipeData.steepDays <= 4) ? t('common.days_few', 'dny') : t('common.days', 'dní');
            steepValueEl.textContent = `${recipeData.steepDays} ${daysText}`;
            steepContainer.style.display = '';
        } else {
            steepContainer.style.display = 'none';
        }
    }
    
    const tbody = document.getElementById('resultsBody');
    tbody.innerHTML = '';
    let runTotalGrams = 0;
    
    ingredients.forEach(ing => {
        const row = document.createElement('tr');
        const g = typeof ing.grams === 'number' ? ing.grams : parseFloat(ing.grams) || 0;
        runTotalGrams += g;
        const volText = ing.volume > 0 ? ing.volume.toFixed(1) : '—';
        row.innerHTML = `
            <td class="ingredient-name">${ing.name} <span class="ingredient-percent-inline">(${(ing.percent || 0).toFixed(1)}%)</span></td>
            <td class="ingredient-value">${volText}</td>
            <td class="ingredient-grams">${g.toFixed(1)}</td>
        `;
        tbody.appendChild(row);
    });
    
    const totalRow = document.createElement('tr');
    totalRow.className = 'total-row';
    totalRow.innerHTML = `
        <td class="ingredient-name">${t('ingredients.total', 'CELKEM')}</td>
        <td class="ingredient-value">—</td>
        <td class="ingredient-grams">${runTotalGrams.toFixed(1)}</td>
    `;
    tbody.appendChild(totalRow);
    
    generateMixingNotes(recipeData);
    
    const newButtons = document.getElementById('resultsNewButtons');
    const editButtons = document.getElementById('resultsEditButtons');
    if (window.editingRecipeFromDetail) {
        if (newButtons) newButtons.classList.add('hidden');
        if (editButtons) editButtons.classList.remove('hidden');
    } else {
        if (newButtons) newButtons.classList.remove('hidden');
        if (editButtons) editButtons.classList.add('hidden');
    }
    showPage('results');
}

// MODE 3: Molasses mix
function calculateShishaMixMode3() {
    const totalAmount = parseFloat(document.getElementById('shMolTotalAmount')?.value) || 100;
    
    // Sweetener base
    const sweetenerType = document.getElementById('shMolSweetenerType')?.value || 'molasses';
    const sweetenerPercent = parseInt(document.getElementById('shMolSweetenerPercent')?.value) || 55;
    const glycerinPercent = parseInt(document.getElementById('shMolGlycerinPercent')?.value) || 30;
    const waterPercent = parseFloat(document.getElementById('shMolWaterPercent')?.value) || 0;
    
    // Flavors with full metadata for save pipeline
    const flavors = [];
    let totalFlavorPercent = 0;
    for (let i = 1; i <= 4; i++) {
        const select = document.getElementById(`shMolFlavorType${i}`);
        const slider = document.getElementById(`shMolFlavorStrength${i}`);
        const ratioSlider = document.getElementById(`shMolFlavorRatioSlider${i}`);
        const autocomplete = document.getElementById(`shMolFlavorAutocomplete${i}`);
        const hasDbFlavor = autocomplete && autocomplete.dataset.flavorData;
        if (!select || !slider || (select.value === 'none' && !hasDbFlavor)) continue;
        const pct = parseFloat(slider.value) || 0;
        if (pct <= 0) continue;
        totalFlavorPercent += pct;
        
        let displayName = select.options[select.selectedIndex]?.text || select.value;
        let flavorName = null, flavorManufacturer = null, flavorId = null, flavorSource = null, favoriteProductId = null;
        let molFlavorSteepDays = null;
        if (autocomplete && autocomplete.dataset.flavorData) {
            try {
                const data = JSON.parse(autocomplete.dataset.flavorData);
                if (data.name) {
                    flavorName = data.name;
                    flavorManufacturer = data.manufacturer || data.manufacturer_code || null;
                    displayName = data.name + (flavorManufacturer ? ` (${flavorManufacturer})` : '');
                    const isFavorite = data.source === 'favorites' || data.source === 'favorite';
                    if (isFavorite) {
                        favoriteProductId = data.favorite_product_id || data.id || autocomplete.dataset.favoriteProductId || null;
                        flavorId = data.flavor_id || null;
                        flavorSource = 'favorite';
                    } else {
                        flavorId = data.id || autocomplete.dataset.flavorId || null;
                        flavorSource = 'database';
                    }
                    if (data.steep_days !== undefined && data.steep_days !== null) {
                        molFlavorSteepDays = data.steep_days;
                    } else if (data.flavor_steep_days !== undefined && data.flavor_steep_days !== null) {
                        molFlavorSteepDays = data.flavor_steep_days;
                    }
                }
            } catch(e) {}
        }
        const molFlavorEntry = {
            type: select.value,
            name: displayName,
            percent: pct,
            vgRatio: parseInt(ratioSlider?.value) || 0,
            flavorName, flavorManufacturer, flavorId, flavorSource, favoriteProductId
        };
        if (molFlavorSteepDays !== null) molFlavorEntry.steepDays = molFlavorSteepDays;
        flavors.push(molFlavorEntry);
    }
    
    // Nicotine
    const nicType = document.getElementById('shMolNicotineType')?.value || 'none';
    const nicBaseStrength = parseFloat(document.getElementById('shMolNicotineBaseStrength')?.value) || 20;
    const nicTarget = parseInt(document.getElementById('shMolTargetNicotine')?.value) || 0;
    const nicRatioVal = document.getElementById('shMolNicotineRatio')?.value || '50/50';
    
    // Calculate amounts (ml)
    const sweetenerAmount = Math.round(totalAmount * (sweetenerPercent / 100) * 10) / 10;
    const glycerinAmount = Math.round(totalAmount * (glycerinPercent / 100) * 10) / 10;
    const waterAmount = Math.round(totalAmount * (waterPercent / 100) * 10) / 10;
    
    let nicotineAmount = 0;
    if (nicType !== 'none' && nicTarget > 0 && nicBaseStrength > 0) {
        nicotineAmount = Math.round((nicTarget / nicBaseStrength) * totalAmount * 10) / 10;
    }
    
    // Pure PG
    const purePgPercent = parseInt(document.getElementById('shMolPurePgPercent')?.value) || 0;
    const purePgAmount = Math.round(totalAmount * (purePgPercent / 100) * 10) / 10;
    
    // Calculate VG/PG ratio (glycerin=VG, PG from flavors/nicotine/purePG)
    const glycerinVol = glycerinAmount;
    let nicVgVol = 0, nicPgVol = 0;
    if (nicotineAmount > 0) {
        const nicVgPct = parseInt((nicRatioVal || '50/50').split('/')[0]) || 50;
        nicVgVol = nicotineAmount * (nicVgPct / 100);
        nicPgVol = nicotineAmount * ((100 - nicVgPct) / 100);
    }
    let flavorVgVol = 0, flavorPgVol = 0;
    flavors.forEach(f => {
        const vol = (f.percent / 100) * totalAmount;
        flavorVgVol += vol * (f.vgRatio / 100);
        flavorPgVol += vol * ((100 - f.vgRatio) / 100);
    });
    const totalVg = glycerinVol + nicVgVol + flavorVgVol;
    const totalPg = nicPgVol + flavorPgVol + purePgAmount;
    const vgPgCalcTotal = totalVg + totalPg;
    const vgPgRatio = vgPgCalcTotal > 0 ? Math.round((totalVg / vgPgCalcTotal) * 100) : 100;
    
    // Build ingredients array for display & save pipeline
    const ingredients = [];
    
    // Sweetener base (molasses/honey/agave)
    const sweetenerNames = { molasses: t('shisha.sweetener_molasses', 'Melasa'), honey: t('shisha.sweetener_honey', 'Med'), agave: t('shisha.sweetener_agave', 'Agáve') };
    ingredients.push({
        name: sweetenerNames[sweetenerType] || sweetenerType,
        ingredientKey: 'shisha_sweetener',
        sweetenerType,
        volume: sweetenerAmount,
        percent: sweetenerPercent,
        grams: sweetenerAmount
    });
    
    // Glycerin
    ingredients.push({
        name: t('shisha.glycerin_label', 'Glycerin (VG)'),
        ingredientKey: 'vg',
        volume: glycerinAmount,
        percent: glycerinPercent,
        grams: Math.round(glycerinAmount * 1.261 * 10) / 10
    });
    
    // Water (hned za glycerinem — melasa, glycerin, voda pod sebou)
    if (waterAmount > 0) {
        ingredients.push({
            name: t('shisha.water_label', 'Voda'),
            ingredientKey: 'water',
            volume: waterAmount,
            percent: waterPercent,
            grams: waterAmount
        });
    }
    
    // Flavors
    flavors.forEach((f, idx) => {
        const flavorMl = Math.round(totalAmount * (f.percent / 100) * 10) / 10;
        ingredients.push({
            name: `${t('ingredients.flavor', 'Příchuť')}: ${f.name}`,
            ingredientKey: 'flavor',
            flavorType: f.type,
            flavorNumber: idx + 1,
            flavorName: f.flavorName,
            flavorManufacturer: f.flavorManufacturer,
            flavorId: f.flavorId,
            flavorSource: f.flavorSource,
            favoriteProductId: f.favoriteProductId,
            volume: flavorMl,
            percent: f.percent,
            grams: flavorMl,
            params: { vgpg: `${f.vgRatio}/${100 - f.vgRatio}` }
        });
    });
    
    // Pure PG
    if (purePgAmount > 0) {
        ingredients.push({
            name: t('shisha.pure_pg_label', 'Čisté PG (propylenglykol)'),
            ingredientKey: 'pg',
            volume: purePgAmount,
            percent: purePgPercent,
            grams: Math.round(purePgAmount * 1.036 * 10) / 10
        });
    }
    
    // Nicotine
    if (nicotineAmount > 0) {
        const nicIngredientKey = nicType === 'salt' ? 'nicotine_salt' : 'nicotine_booster';
        ingredients.push({
            name: `${t('ingredients.' + nicIngredientKey, 'Nikotin')} (${nicBaseStrength} mg/ml, VG/PG ${nicRatioVal})`,
            ingredientKey: nicIngredientKey,
            volume: nicotineAmount,
            percent: Math.round(nicotineAmount / totalAmount * 100 * 10) / 10,
            grams: Math.round(nicotineAmount * 10) / 10,
            params: { strength: nicBaseStrength, vgpg: nicRatioVal }
        });
    }
    
    // Mixology — Menthol
    const molMixMenthol = document.getElementById('shMolMixMenthol')?.checked || false;
    const molMixMentholDrops = molMixMenthol ? (parseInt(document.getElementById('shMolMixMentholDrops')?.value) || 0) : 0;
    if (molMixMentholDrops > 0) {
        const mentholMl = Math.round(molMixMentholDrops * 0.05 * 10) / 10;
        ingredients.push({
            name: `${t('shisha.tweak_mix_menthol', 'Mentol / Cooling')} (${molMixMentholDrops} ${t('shisha.tweak_drops', 'kapek')})`,
            ingredientKey: 'shisha_mol_menthol',
            volume: mentholMl,
            percent: 0,
            grams: mentholMl
        });
    }
    
    // Mixology — Citric acid
    const molMixCitric = document.getElementById('shMolMixCitric')?.checked || false;
    const molMixCitricGrams = molMixCitric ? (parseFloat(document.getElementById('shMolMixCitricGrams')?.value) || 0) : 0;
    if (molMixCitricGrams > 0) {
        const scaledCitric = Math.round(molMixCitricGrams * (totalAmount / 20) * 10) / 10;
        ingredients.push({
            name: `${t('shisha.tweak_mix_citric', 'Kyselina citrónová')} (${scaledCitric} g)`,
            ingredientKey: 'shisha_mol_citric',
            volume: 0,
            percent: 0,
            grams: scaledCitric
        });
    }
    
    // Mixology — Fruit juice
    const molMixJuice = document.getElementById('shMolMixJuice')?.checked || false;
    const molMixJuicePercent = molMixJuice ? (parseInt(document.getElementById('shMolMixJuicePercent')?.value) || 0) : 0;
    if (molMixJuicePercent > 0) {
        const juiceMl = Math.round(totalAmount * (molMixJuicePercent / 100) * 10) / 10;
        ingredients.push({
            name: t('shisha.mix_juice_label', 'Ovocná šťáva'),
            ingredientKey: 'shisha_mol_juice',
            volume: juiceMl,
            percent: molMixJuicePercent,
            grams: juiceMl
        });
    }
    
    const recipeData = {
        formType: 'shisha',
        shishaMode: 'molasses',
        totalAmount,
        sweetenerType,
        sweetenerPercent,
        sweetenerAmount,
        glycerinPercent,
        glycerinAmount,
        waterPercent,
        waterAmount,
        water: waterPercent,
        sweetener: { type: sweetenerType, percent: sweetenerPercent },
        flavors,
        nicotine: nicTarget,
        nicotineType: nicType,
        nicotineBaseStrength: nicBaseStrength,
        nicotineTarget: nicTarget,
        nicotineRatio: nicRatioVal,
        nicotineAmount,
        purePgPercent,
        mixology: {
            menthol: molMixMentholDrops,
            citricGrams: molMixCitricGrams,
            juicePercent: molMixJuicePercent
        },
        steepDays: Math.max(0, ...flavors.map(f => {
            if (f.steepDays !== undefined && f.steepDays !== null) return f.steepDays;
            if (f.type && f.type !== 'none') {
                const fd = shishaFlavorDatabase[f.type];
                return fd ? fd.steepingDays : 0;
            }
            return 0;
        })),
        vgPercent: vgPgRatio,
        pgPercent: 100 - vgPgRatio,
        ingredients
    };
    
    storeCurrentRecipe(recipeData);
    
    // Render results
    document.getElementById('resultTotal').textContent = `${totalAmount} ml`;
    document.getElementById('resultRatio').textContent = `${vgPgRatio}:${100 - vgPgRatio}`;
    document.getElementById('resultNicotine').textContent = `${nicTarget} mg/ml`;
    
    // Steep days v hlavičce
    const steepContainer = document.getElementById('resultSteepContainer');
    const steepValueEl = document.getElementById('resultSteepDays');
    if (steepContainer && steepValueEl) {
        if (recipeData.steepDays > 0) {
            const daysText = recipeData.steepDays === 1 ? t('common.day', 'den') : 
                (recipeData.steepDays >= 2 && recipeData.steepDays <= 4) ? t('common.days_few', 'dny') : t('common.days', 'dní');
            steepValueEl.textContent = `${recipeData.steepDays} ${daysText}`;
            steepContainer.style.display = '';
        } else {
            steepContainer.style.display = 'none';
        }
    }
    
    const tbody = document.getElementById('resultsBody');
    tbody.innerHTML = '';
    let runningTotal = 0;
    let runTotalGrams = 0;
    
    ingredients.forEach(ing => {
        const row = document.createElement('tr');
        const vol = parseFloat(ing.volume) || 0;
        const g = typeof ing.grams === 'number' ? ing.grams : parseFloat(ing.grams) || 0;
        runningTotal += vol;
        runTotalGrams += g;
        row.innerHTML = `
            <td class="ingredient-name">${ing.name} <span class="ingredient-percent-inline">(${(ing.percent || 0).toFixed(1)}%)</span></td>
            <td class="ingredient-value">${vol.toFixed(2)}</td>
            <td class="ingredient-grams">${g.toFixed(1)}</td>
        `;
        tbody.appendChild(row);
    });
    
    const totalRow = document.createElement('tr');
    totalRow.className = 'total-row';
    totalRow.innerHTML = `
        <td class="ingredient-name">${t('ingredients.total', 'CELKEM')}</td>
        <td class="ingredient-value">${runningTotal.toFixed(2)}</td>
        <td class="ingredient-grams">${runTotalGrams.toFixed(1)}</td>
    `;
    tbody.appendChild(totalRow);
    
    generateMixingNotes(recipeData);
    
    const newButtons = document.getElementById('resultsNewButtons');
    const editButtons = document.getElementById('resultsEditButtons');
    if (window.editingRecipeFromDetail) {
        if (newButtons) newButtons.classList.add('hidden');
        if (editButtons) editButtons.classList.remove('hidden');
    } else {
        if (newButtons) newButtons.classList.remove('hidden');
        if (editButtons) editButtons.classList.add('hidden');
    }
    showPage('results');
}

// --- All old duplicate shisha functions removed ---
// --- New exports below ---

// =========================================
// Export Shisha functions (3-mode)
// =========================================

// Core
window.initShishaForm = initShishaForm;
window.switchShishaMode = switchShishaMode;
window.updateShishaPremiumElements = updateShishaPremiumElements;
window.calculateShishaMix = calculateShishaMix;

// Mode 1: Tobacco Mix
window.updateShishaBowlSize = updateShishaBowlSize;
window.updateShishaCustomBowlSize = updateShishaCustomBowlSize;
window.updateShishaTobaccoPercent = updateShishaTobaccoPercent;
window.adjustShishaTobacco = adjustShishaTobacco;
window.updateShishaTobaccoTotal = updateShishaTobaccoTotal;
window.addShishaTobacco = addShishaTobacco;
window.removeShishaTobacco = removeShishaTobacco;

// Tweak
window.switchShishaTab = switchShishaTab;
window.updateTweakSections = updateTweakSections;
window.updateTweakCalculation = updateTweakCalculation;
window.calculateShishaTweak = calculateShishaTweak;
window.adjustTweakAddon = adjustTweakAddon;
window.updateTweakAddonDisplay = updateTweakAddonDisplay;
window.adjustTweakMixSlider = adjustTweakMixSlider;
window.updateTweakMixSlider = updateTweakMixSlider;
window.updateShishaTweakFlavorType = updateShishaTweakFlavorType;
window.updateShishaTweakFlavorStrength = updateShishaTweakFlavorStrength;
window.adjustShishaTweakFlavor = adjustShishaTweakFlavor;
window.addShishaTweakFlavor = addShishaTweakFlavor;
window.removeShishaTweakFlavor = removeShishaTweakFlavor;
window.updateShishaTweakNicotineType = updateShishaTweakNicotineType;
window.updateShishaTweakNicotineRatio = updateShishaTweakNicotineRatio;
window.adjustShishaTweakTargetNicotine = adjustShishaTweakTargetNicotine;
window.updateShishaTweakNicotineDisplay = updateShishaTweakNicotineDisplay;
window.displayTweakSelectedTobacco = displayTweakSelectedTobacco;
window.clearTweakSelectedTobacco = clearTweakSelectedTobacco;
window.autoRecalculateShishaTweakVgPgRatio = autoRecalculateShishaTweakVgPgRatio;
window.adjustShishaTweakFlavorRatio = adjustShishaTweakFlavorRatio;
window.updateShishaTweakFlavorRatioDisplay = updateShishaTweakFlavorRatioDisplay;

// Mode 2: DIY Tobacco
window.updateDiyRatio = updateDiyRatio;
window.updateDiyMolassesCalc = updateDiyMolassesCalc;
window.updateDiyBaseDisplay = updateDiyBaseDisplay;
window.adjustDiyBase = adjustDiyBase;
window.updateDiySweetenerDisplay = updateDiySweetenerDisplay;
window.adjustDiySweetener = adjustDiySweetener;
window.updateDiyGlycerinDisplay = updateDiyGlycerinDisplay;
window.adjustDiyGlycerin = adjustDiyGlycerin;
window.updateDiyWaterDisplay = updateDiyWaterDisplay;
window.adjustDiyWater = adjustDiyWater;
window.updateShishaDiyFlavorType = updateShishaDiyFlavorType;
window.adjustShishaDiyFlavor = adjustShishaDiyFlavor;
window.updateShishaDiyFlavorStrength = updateShishaDiyFlavorStrength;
window.adjustShishaDiyFlavorRatio = adjustShishaDiyFlavorRatio;
window.updateShishaDiyFlavorRatioDisplay = updateShishaDiyFlavorRatioDisplay;
window.addShishaDiyFlavor = addShishaDiyFlavor;
window.removeShishaDiyFlavor = removeShishaDiyFlavor;
window.updateShishaDiyNicotineType = updateShishaDiyNicotineType;
window.updateShishaDiyNicotineRatio = updateShishaDiyNicotineRatio;
window.adjustShishaDiyTargetNicotine = adjustShishaDiyTargetNicotine;
window.updateShishaDiyNicotineDisplay = updateShishaDiyNicotineDisplay;
window.updateDiyMaterial = updateDiyMaterial;
window.adjustDiyPurePg = adjustDiyPurePg;
window.updateDiyPurePgDisplay = updateDiyPurePgDisplay;
window.updateDiyMixologyGroups = updateDiyMixologyGroups;
window.adjustDiyMixSlider = adjustDiyMixSlider;
window.updateDiyMixSlider = updateDiyMixSlider;
window.autoRecalculateShishaDiyVgPgRatio = autoRecalculateShishaDiyVgPgRatio;

// Mode 3: Molasses Mix
window.updateMolBaseDisplay = updateMolBaseDisplay;
window.adjustMolBase = adjustMolBase;
window.updateMolSweetenerDisplay = updateMolSweetenerDisplay;
window.adjustMolSweetener = adjustMolSweetener;
window.updateMolGlycerinDisplay = updateMolGlycerinDisplay;
window.adjustMolGlycerin = adjustMolGlycerin;
window.updateMolWaterDisplay = updateMolWaterDisplay;
window.adjustMolWater = adjustMolWater;
window.updateShishaMolFlavorType = updateShishaMolFlavorType;
window.adjustShishaMolFlavor = adjustShishaMolFlavor;
window.updateShishaMolFlavorStrength = updateShishaMolFlavorStrength;
window.adjustShishaMolFlavorRatio = adjustShishaMolFlavorRatio;
window.updateShishaMolFlavorRatioDisplay = updateShishaMolFlavorRatioDisplay;
window.addShishaMolFlavor = addShishaMolFlavor;
window.removeShishaMolFlavor = removeShishaMolFlavor;
window.updateShishaMolNicotineType = updateShishaMolNicotineType;
window.updateShishaMolNicotineRatio = updateShishaMolNicotineRatio;
window.adjustShishaMolTargetNicotine = adjustShishaMolTargetNicotine;
window.updateShishaMolNicotineDisplay = updateShishaMolNicotineDisplay;
window.adjustMolPurePg = adjustMolPurePg;
window.updateMolPurePgDisplay = updateMolPurePgDisplay;
window.updateMolMixologyGroups = updateMolMixologyGroups;
window.adjustMolMixSlider = adjustMolMixSlider;
window.updateMolMixSlider = updateMolMixSlider;
window.autoRecalculateShishaMolVgPgRatio = autoRecalculateShishaMolVgPgRatio;

// Legacy compat stubs (exported for old references)
window.updateShishaBaseType = updateShishaBaseType;
window.updateShishaPremixedRatio = updateShishaPremixedRatio;
window.updateShishaCustomPremixedPg = updateShishaCustomPremixedPg;
window.toggleShishaNicotine = toggleShishaNicotine;
window.handleShishaNicotineSelect = handleShishaNicotineSelect;
window.updateShishaNicotineType = updateShishaNicotineType;
window.updateShishaNicotineRatio = updateShishaNicotineRatio;
window.adjustShishaNicRatio = adjustShishaNicRatio;
window.updateShishaNicRatioDisplay = updateShishaNicRatioDisplay;
window.adjustShishaTargetNicotine = adjustShishaTargetNicotine;
window.updateShishaNicotineDisplay = updateShishaNicotineDisplay;
window.updateShishaFlavorType = updateShishaFlavorType;
window.adjustShishaFlavor = adjustShishaFlavor;
window.updateShishaFlavorStrength = updateShishaFlavorStrength;
window.adjustShishaFlavorRatio = adjustShishaFlavorRatio;
window.updateShishaFlavorRatioDisplay = updateShishaFlavorRatioDisplay;
window.updateShishaTotalFlavorPercent = updateShishaTotalFlavorPercent;
window.addShishaFlavor = addShishaFlavor;
window.removeShishaFlavor = removeShishaFlavor;
window.getShishaFlavorsData = getShishaFlavorsData;
window.toggleShishaSweetener = toggleShishaSweetener;
window.handleShishaSweetenerSelect = handleShishaSweetenerSelect;
window.updateShishaSweetenerType = updateShishaSweetenerType;
window.adjustShishaSweetener = adjustShishaSweetener;
window.updateShishaSweetenerDisplay = updateShishaSweetenerDisplay;
window.toggleShishaWater = toggleShishaWater;
window.adjustShishaWater = adjustShishaWater;
window.updateShishaWaterDisplay = updateShishaWaterDisplay;
window.adjustShishaRatio = adjustShishaRatio;
window.updateShishaRatioDisplay = updateShishaRatioDisplay;
window.autoRecalculateShishaVgPgRatio = autoRecalculateShishaVgPgRatio;
window.updateShishaVgPgLimits = updateShishaVgPgLimits;
