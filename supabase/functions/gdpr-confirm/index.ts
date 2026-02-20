// ============================================
// EDGE FUNCTION: GDPR Confirm / Cancel
// Zpracování potvrzení nebo zrušení GDPR smazání účtu
// GET ?token=XXX&action=delete|cancel
// ============================================

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Clerk Backend API
const CLERK_SECRET_KEY = Deno.env.get('CLERK_SECRET_KEY') || ''
const CLERK_API_URL = 'https://api.clerk.com/v1'

// GDPR HTML page translations — all 31 supported languages
type GdprT = {
  deleted_title: string; deleted_heading: string; deleted_message: string; deleted_detail: string
  cancelled_title: string; cancelled_heading: string; cancelled_message: string; cancelled_detail: string
  error_title: string; error_heading: string
  expired_heading: string; expired_message: string
  invalid_heading: string; invalid_message: string
  already_used_heading: string; already_used_message: string
  back_link: string; footer: string
}
const F = '© 2026 LiquiMixer — WOOs, s. r. o.'
const GDPR_TRANSLATIONS: Record<string, GdprT> = {
  cs: {
    deleted_title: 'Účet smazán — LiquiMixer', deleted_heading: 'Váš účet byl smazán',
    deleted_message: 'Všechna vaše data byla nenávratně odstraněna v souladu s GDPR.',
    deleted_detail: 'Smazáno: recepty, produkty, připomínky, předplatné a osobní údaje.',
    cancelled_title: 'Účet zachován — LiquiMixer', cancelled_heading: 'Váš účet zůstává aktivní',
    cancelled_message: 'Požadavek na smazání byl zrušen. Váš účet a všechna data zůstávají beze změny.',
    cancelled_detail: 'Děkujeme, že zůstáváte s LiquiMixer!',
    error_title: 'Chyba — LiquiMixer', error_heading: 'Nastala chyba',
    expired_heading: 'Odkaz vypršel', expired_message: 'Platnost tohoto odkazu vypršela (24 hodin). Pokud si stále přejete smazat účet, podejte nový požadavek.',
    invalid_heading: 'Neplatný odkaz', invalid_message: 'Tento odkaz je neplatný nebo byl již použit.',
    already_used_heading: 'Odkaz již byl použit', already_used_message: 'Tento požadavek již byl zpracován.',
    back_link: 'Zpět na LiquiMixer', footer: F
  },
  sk: {
    deleted_title: 'Účet zmazaný — LiquiMixer', deleted_heading: 'Váš účet bol zmazaný',
    deleted_message: 'Všetky vaše dáta boli nenávratne odstránené v súlade s GDPR.',
    deleted_detail: 'Zmazané: recepty, produkty, pripomienky, predplatné a osobné údaje.',
    cancelled_title: 'Účet zachovaný — LiquiMixer', cancelled_heading: 'Váš účet zostáva aktívny',
    cancelled_message: 'Požiadavka na zmazanie bola zrušená. Váš účet a všetky dáta zostávajú bez zmeny.',
    cancelled_detail: 'Ďakujeme, že zostávate s LiquiMixer!',
    error_title: 'Chyba — LiquiMixer', error_heading: 'Nastala chyba',
    expired_heading: 'Odkaz vypršal', expired_message: 'Platnosť tohto odkazu vypršala (24 hodín). Ak si stále prajete zmazať účet, podajte novú požiadavku.',
    invalid_heading: 'Neplatný odkaz', invalid_message: 'Tento odkaz je neplatný alebo bol už použitý.',
    already_used_heading: 'Odkaz už bol použitý', already_used_message: 'Táto požiadavka už bola spracovaná.',
    back_link: 'Späť na LiquiMixer', footer: F
  },
  en: {
    deleted_title: 'Account Deleted — LiquiMixer', deleted_heading: 'Your account has been deleted',
    deleted_message: 'All your data has been permanently removed in compliance with GDPR.',
    deleted_detail: 'Deleted: recipes, products, reminders, subscriptions and personal data.',
    cancelled_title: 'Account Kept — LiquiMixer', cancelled_heading: 'Your account remains active',
    cancelled_message: 'The deletion request has been cancelled. Your account and all data remain unchanged.',
    cancelled_detail: 'Thank you for staying with LiquiMixer!',
    error_title: 'Error — LiquiMixer', error_heading: 'An error occurred',
    expired_heading: 'Link expired', expired_message: 'This link has expired (24 hours). If you still wish to delete your account, please submit a new request.',
    invalid_heading: 'Invalid link', invalid_message: 'This link is invalid or has already been used.',
    already_used_heading: 'Link already used', already_used_message: 'This request has already been processed.',
    back_link: 'Back to LiquiMixer', footer: F
  },
  de: {
    deleted_title: 'Konto gelöscht — LiquiMixer', deleted_heading: 'Ihr Konto wurde gelöscht',
    deleted_message: 'Alle Ihre Daten wurden gemäß DSGVO dauerhaft entfernt.',
    deleted_detail: 'Gelöscht: Rezepte, Produkte, Erinnerungen, Abonnements und persönliche Daten.',
    cancelled_title: 'Konto beibehalten — LiquiMixer', cancelled_heading: 'Ihr Konto bleibt aktiv',
    cancelled_message: 'Der Löschantrag wurde storniert. Ihr Konto und alle Daten bleiben unverändert.',
    cancelled_detail: 'Danke, dass Sie bei LiquiMixer bleiben!',
    error_title: 'Fehler — LiquiMixer', error_heading: 'Ein Fehler ist aufgetreten',
    expired_heading: 'Link abgelaufen', expired_message: 'Dieser Link ist abgelaufen (24 Stunden). Wenn Sie Ihr Konto weiterhin löschen möchten, stellen Sie bitte einen neuen Antrag.',
    invalid_heading: 'Ungültiger Link', invalid_message: 'Dieser Link ist ungültig oder wurde bereits verwendet.',
    already_used_heading: 'Link bereits verwendet', already_used_message: 'Dieser Antrag wurde bereits bearbeitet.',
    back_link: 'Zurück zu LiquiMixer', footer: F
  },
  fr: {
    deleted_title: 'Compte supprimé — LiquiMixer', deleted_heading: 'Votre compte a été supprimé',
    deleted_message: 'Toutes vos données ont été définitivement supprimées conformément au RGPD.',
    deleted_detail: 'Supprimé : recettes, produits, rappels, abonnements et données personnelles.',
    cancelled_title: 'Compte conservé — LiquiMixer', cancelled_heading: 'Votre compte reste actif',
    cancelled_message: 'La demande de suppression a été annulée. Votre compte et toutes vos données restent inchangés.',
    cancelled_detail: 'Merci de rester avec LiquiMixer !',
    error_title: 'Erreur — LiquiMixer', error_heading: 'Une erreur est survenue',
    expired_heading: 'Lien expiré', expired_message: 'Ce lien a expiré (24 heures). Si vous souhaitez toujours supprimer votre compte, veuillez soumettre une nouvelle demande.',
    invalid_heading: 'Lien invalide', invalid_message: 'Ce lien est invalide ou a déjà été utilisé.',
    already_used_heading: 'Lien déjà utilisé', already_used_message: 'Cette demande a déjà été traitée.',
    back_link: 'Retour à LiquiMixer', footer: F
  },
  es: {
    deleted_title: 'Cuenta eliminada — LiquiMixer', deleted_heading: 'Tu cuenta ha sido eliminada',
    deleted_message: 'Todos tus datos han sido eliminados permanentemente de acuerdo con el RGPD.',
    deleted_detail: 'Eliminado: recetas, productos, recordatorios, suscripciones y datos personales.',
    cancelled_title: 'Cuenta conservada — LiquiMixer', cancelled_heading: 'Tu cuenta sigue activa',
    cancelled_message: 'La solicitud de eliminación ha sido cancelada. Tu cuenta y todos tus datos permanecen sin cambios.',
    cancelled_detail: '¡Gracias por quedarte con LiquiMixer!',
    error_title: 'Error — LiquiMixer', error_heading: 'Se produjo un error',
    expired_heading: 'Enlace caducado', expired_message: 'Este enlace ha caducado (24 horas). Si aún deseas eliminar tu cuenta, envía una nueva solicitud.',
    invalid_heading: 'Enlace inválido', invalid_message: 'Este enlace es inválido o ya ha sido utilizado.',
    already_used_heading: 'Enlace ya utilizado', already_used_message: 'Esta solicitud ya ha sido procesada.',
    back_link: 'Volver a LiquiMixer', footer: F
  },
  it: {
    deleted_title: 'Account eliminato — LiquiMixer', deleted_heading: 'Il tuo account è stato eliminato',
    deleted_message: 'Tutti i tuoi dati sono stati rimossi permanentemente in conformità con il GDPR.',
    deleted_detail: 'Eliminati: ricette, prodotti, promemoria, abbonamenti e dati personali.',
    cancelled_title: 'Account mantenuto — LiquiMixer', cancelled_heading: 'Il tuo account rimane attivo',
    cancelled_message: 'La richiesta di eliminazione è stata annullata. Il tuo account e tutti i dati rimangono invariati.',
    cancelled_detail: 'Grazie per restare con LiquiMixer!',
    error_title: 'Errore — LiquiMixer', error_heading: 'Si è verificato un errore',
    expired_heading: 'Link scaduto', expired_message: 'Questo link è scaduto (24 ore). Se desideri ancora eliminare il tuo account, invia una nuova richiesta.',
    invalid_heading: 'Link non valido', invalid_message: 'Questo link non è valido o è già stato utilizzato.',
    already_used_heading: 'Link già utilizzato', already_used_message: 'Questa richiesta è già stata elaborata.',
    back_link: 'Torna a LiquiMixer', footer: F
  },
  pt: {
    deleted_title: 'Conta eliminada — LiquiMixer', deleted_heading: 'A sua conta foi eliminada',
    deleted_message: 'Todos os seus dados foram permanentemente removidos em conformidade com o RGPD.',
    deleted_detail: 'Eliminados: receitas, produtos, lembretes, subscrições e dados pessoais.',
    cancelled_title: 'Conta mantida — LiquiMixer', cancelled_heading: 'A sua conta permanece ativa',
    cancelled_message: 'O pedido de eliminação foi cancelado. A sua conta e todos os dados permanecem inalterados.',
    cancelled_detail: 'Obrigado por ficar com o LiquiMixer!',
    error_title: 'Erro — LiquiMixer', error_heading: 'Ocorreu um erro',
    expired_heading: 'Link expirado', expired_message: 'Este link expirou (24 horas). Se ainda deseja eliminar a sua conta, envie um novo pedido.',
    invalid_heading: 'Link inválido', invalid_message: 'Este link é inválido ou já foi utilizado.',
    already_used_heading: 'Link já utilizado', already_used_message: 'Este pedido já foi processado.',
    back_link: 'Voltar ao LiquiMixer', footer: F
  },
  pl: {
    deleted_title: 'Konto usunięte — LiquiMixer', deleted_heading: 'Twoje konto zostało usunięte',
    deleted_message: 'Wszystkie Twoje dane zostały trwale usunięte zgodnie z RODO.',
    deleted_detail: 'Usunięto: przepisy, produkty, przypomnienia, subskrypcje i dane osobowe.',
    cancelled_title: 'Konto zachowane — LiquiMixer', cancelled_heading: 'Twoje konto pozostaje aktywne',
    cancelled_message: 'Żądanie usunięcia zostało anulowane. Twoje konto i wszystkie dane pozostają bez zmian.',
    cancelled_detail: 'Dziękujemy, że zostajesz z LiquiMixer!',
    error_title: 'Błąd — LiquiMixer', error_heading: 'Wystąpił błąd',
    expired_heading: 'Link wygasł', expired_message: 'Ten link wygasł (24 godziny). Jeśli nadal chcesz usunąć konto, złóż nowe żądanie.',
    invalid_heading: 'Nieprawidłowy link', invalid_message: 'Ten link jest nieprawidłowy lub został już użyty.',
    already_used_heading: 'Link już użyty', already_used_message: 'To żądanie zostało już przetworzone.',
    back_link: 'Powrót do LiquiMixer', footer: F
  },
  ru: {
    deleted_title: 'Аккаунт удалён — LiquiMixer', deleted_heading: 'Ваш аккаунт был удалён',
    deleted_message: 'Все ваши данные были безвозвратно удалены в соответствии с GDPR.',
    deleted_detail: 'Удалено: рецепты, продукты, напоминания, подписки и личные данные.',
    cancelled_title: 'Аккаунт сохранён — LiquiMixer', cancelled_heading: 'Ваш аккаунт остаётся активным',
    cancelled_message: 'Запрос на удаление был отменён. Ваш аккаунт и все данные остаются без изменений.',
    cancelled_detail: 'Спасибо, что остаётесь с LiquiMixer!',
    error_title: 'Ошибка — LiquiMixer', error_heading: 'Произошла ошибка',
    expired_heading: 'Ссылка истекла', expired_message: 'Срок действия этой ссылки истёк (24 часа). Если вы всё ещё хотите удалить аккаунт, отправьте новый запрос.',
    invalid_heading: 'Недействительная ссылка', invalid_message: 'Эта ссылка недействительна или уже была использована.',
    already_used_heading: 'Ссылка уже использована', already_used_message: 'Этот запрос уже был обработан.',
    back_link: 'Вернуться на LiquiMixer', footer: F
  },
  nl: {
    deleted_title: 'Account verwijderd — LiquiMixer', deleted_heading: 'Uw account is verwijderd',
    deleted_message: 'Al uw gegevens zijn permanent verwijderd in overeenstemming met de AVG.',
    deleted_detail: 'Verwijderd: recepten, producten, herinneringen, abonnementen en persoonlijke gegevens.',
    cancelled_title: 'Account behouden — LiquiMixer', cancelled_heading: 'Uw account blijft actief',
    cancelled_message: 'Het verwijderingsverzoek is geannuleerd. Uw account en alle gegevens blijven ongewijzigd.',
    cancelled_detail: 'Bedankt dat u bij LiquiMixer blijft!',
    error_title: 'Fout — LiquiMixer', error_heading: 'Er is een fout opgetreden',
    expired_heading: 'Link verlopen', expired_message: 'Deze link is verlopen (24 uur). Als u uw account nog steeds wilt verwijderen, dien dan een nieuw verzoek in.',
    invalid_heading: 'Ongeldige link', invalid_message: 'Deze link is ongeldig of is al gebruikt.',
    already_used_heading: 'Link al gebruikt', already_used_message: 'Dit verzoek is al verwerkt.',
    back_link: 'Terug naar LiquiMixer', footer: F
  },
  ja: {
    deleted_title: 'アカウント削除済み — LiquiMixer', deleted_heading: 'アカウントが削除されました',
    deleted_message: 'GDPRに準拠して、すべてのデータが完全に削除されました。',
    deleted_detail: '削除済み：レシピ、製品、リマインダー、サブスクリプション、個人データ。',
    cancelled_title: 'アカウント維持 — LiquiMixer', cancelled_heading: 'アカウントは有効のままです',
    cancelled_message: '削除リクエストはキャンセルされました。アカウントとすべてのデータは変更されていません。',
    cancelled_detail: 'LiquiMixerをご利用いただきありがとうございます！',
    error_title: 'エラー — LiquiMixer', error_heading: 'エラーが発生しました',
    expired_heading: 'リンク期限切れ', expired_message: 'このリンクは期限切れです（24時間）。アカウントを削除したい場合は、新しいリクエストを送信してください。',
    invalid_heading: '無効なリンク', invalid_message: 'このリンクは無効か、すでに使用されています。',
    already_used_heading: 'リンクは使用済み', already_used_message: 'このリクエストはすでに処理されています。',
    back_link: 'LiquiMixerに戻る', footer: F
  },
  ko: {
    deleted_title: '계정 삭제됨 — LiquiMixer', deleted_heading: '계정이 삭제되었습니다',
    deleted_message: 'GDPR에 따라 모든 데이터가 영구적으로 삭제되었습니다.',
    deleted_detail: '삭제됨: 레시피, 제품, 알림, 구독 및 개인 데이터.',
    cancelled_title: '계정 유지됨 — LiquiMixer', cancelled_heading: '계정이 활성 상태로 유지됩니다',
    cancelled_message: '삭제 요청이 취소되었습니다. 계정과 모든 데이터는 변경되지 않았습니다.',
    cancelled_detail: 'LiquiMixer를 이용해 주셔서 감사합니다!',
    error_title: '오류 — LiquiMixer', error_heading: '오류가 발생했습니다',
    expired_heading: '링크 만료', expired_message: '이 링크는 만료되었습니다 (24시간). 계정을 삭제하려면 새 요청을 제출하세요.',
    invalid_heading: '잘못된 링크', invalid_message: '이 링크는 유효하지 않거나 이미 사용되었습니다.',
    already_used_heading: '이미 사용된 링크', already_used_message: '이 요청은 이미 처리되었습니다.',
    back_link: 'LiquiMixer로 돌아가기', footer: F
  },
  'zh-CN': {
    deleted_title: '账户已删除 — LiquiMixer', deleted_heading: '您的账户已被删除',
    deleted_message: '根据GDPR，您的所有数据已被永久删除。',
    deleted_detail: '已删除：配方、产品、提醒、订阅和个人数据。',
    cancelled_title: '账户已保留 — LiquiMixer', cancelled_heading: '您的账户仍然有效',
    cancelled_message: '删除请求已取消。您的账户和所有数据保持不变。',
    cancelled_detail: '感谢您继续使用LiquiMixer！',
    error_title: '错误 — LiquiMixer', error_heading: '发生错误',
    expired_heading: '链接已过期', expired_message: '此链接已过期（24小时）。如果您仍想删除账户，请提交新请求。',
    invalid_heading: '无效链接', invalid_message: '此链接无效或已被使用。',
    already_used_heading: '链接已使用', already_used_message: '此请求已被处理。',
    back_link: '返回LiquiMixer', footer: F
  },
  'zh-TW': {
    deleted_title: '帳戶已刪除 — LiquiMixer', deleted_heading: '您的帳戶已被刪除',
    deleted_message: '根據GDPR，您的所有資料已被永久刪除。',
    deleted_detail: '已刪除：配方、產品、提醒、訂閱和個人資料。',
    cancelled_title: '帳戶已保留 — LiquiMixer', cancelled_heading: '您的帳戶仍然有效',
    cancelled_message: '刪除請求已取消。您的帳戶和所有資料保持不變。',
    cancelled_detail: '感謝您繼續使用LiquiMixer！',
    error_title: '錯誤 — LiquiMixer', error_heading: '發生錯誤',
    expired_heading: '連結已過期', expired_message: '此連結已過期（24小時）。如果您仍想刪除帳戶，請提交新請求。',
    invalid_heading: '無效連結', invalid_message: '此連結無效或已被使用。',
    already_used_heading: '連結已使用', already_used_message: '此請求已被處理。',
    back_link: '返回LiquiMixer', footer: F
  },
  'ar-SA': {
    deleted_title: 'تم حذف الحساب — LiquiMixer', deleted_heading: 'تم حذف حسابك',
    deleted_message: 'تم حذف جميع بياناتك نهائيًا وفقًا للائحة العامة لحماية البيانات.',
    deleted_detail: 'تم الحذف: الوصفات، المنتجات، التذكيرات، الاشتراكات والبيانات الشخصية.',
    cancelled_title: 'تم الاحتفاظ بالحساب — LiquiMixer', cancelled_heading: 'حسابك لا يزال نشطًا',
    cancelled_message: 'تم إلغاء طلب الحذف. حسابك وجميع بياناتك تبقى دون تغيير.',
    cancelled_detail: 'شكرًا لبقائك مع LiquiMixer!',
    error_title: 'خطأ — LiquiMixer', error_heading: 'حدث خطأ',
    expired_heading: 'انتهت صلاحية الرابط', expired_message: 'انتهت صلاحية هذا الرابط (24 ساعة). إذا كنت لا تزال ترغب في حذف حسابك، يرجى تقديم طلب جديد.',
    invalid_heading: 'رابط غير صالح', invalid_message: 'هذا الرابط غير صالح أو تم استخدامه بالفعل.',
    already_used_heading: 'تم استخدام الرابط', already_used_message: 'تمت معالجة هذا الطلب بالفعل.',
    back_link: 'العودة إلى LiquiMixer', footer: F
  },
  sv: {
    deleted_title: 'Konto raderat — LiquiMixer', deleted_heading: 'Ditt konto har raderats',
    deleted_message: 'All din data har permanent tagits bort i enlighet med GDPR.',
    deleted_detail: 'Raderat: recept, produkter, påminnelser, prenumerationer och personuppgifter.',
    cancelled_title: 'Konto behållet — LiquiMixer', cancelled_heading: 'Ditt konto förblir aktivt',
    cancelled_message: 'Begäran om radering har avbrutits. Ditt konto och all data förblir oförändrade.',
    cancelled_detail: 'Tack för att du stannar hos LiquiMixer!',
    error_title: 'Fel — LiquiMixer', error_heading: 'Ett fel uppstod',
    expired_heading: 'Länken har gått ut', expired_message: 'Denna länk har gått ut (24 timmar). Om du fortfarande vill radera ditt konto, skicka en ny begäran.',
    invalid_heading: 'Ogiltig länk', invalid_message: 'Denna länk är ogiltig eller har redan använts.',
    already_used_heading: 'Länken redan använd', already_used_message: 'Denna begäran har redan behandlats.',
    back_link: 'Tillbaka till LiquiMixer', footer: F
  },
  da: {
    deleted_title: 'Konto slettet — LiquiMixer', deleted_heading: 'Din konto er blevet slettet',
    deleted_message: 'Alle dine data er permanent fjernet i overensstemmelse med GDPR.',
    deleted_detail: 'Slettet: opskrifter, produkter, påmindelser, abonnementer og personlige data.',
    cancelled_title: 'Konto bevaret — LiquiMixer', cancelled_heading: 'Din konto forbliver aktiv',
    cancelled_message: 'Anmodningen om sletning er annulleret. Din konto og alle data forbliver uændrede.',
    cancelled_detail: 'Tak fordi du bliver hos LiquiMixer!',
    error_title: 'Fejl — LiquiMixer', error_heading: 'Der opstod en fejl',
    expired_heading: 'Link udløbet', expired_message: 'Dette link er udløbet (24 timer). Hvis du stadig ønsker at slette din konto, indsend en ny anmodning.',
    invalid_heading: 'Ugyldigt link', invalid_message: 'Dette link er ugyldigt eller er allerede blevet brugt.',
    already_used_heading: 'Link allerede brugt', already_used_message: 'Denne anmodning er allerede blevet behandlet.',
    back_link: 'Tilbage til LiquiMixer', footer: F
  },
  fi: {
    deleted_title: 'Tili poistettu — LiquiMixer', deleted_heading: 'Tilisi on poistettu',
    deleted_message: 'Kaikki tietosi on poistettu pysyvästi GDPR:n mukaisesti.',
    deleted_detail: 'Poistettu: reseptit, tuotteet, muistutukset, tilaukset ja henkilötiedot.',
    cancelled_title: 'Tili säilytetty — LiquiMixer', cancelled_heading: 'Tilisi pysyy aktiivisena',
    cancelled_message: 'Poistopyyntö on peruutettu. Tilisi ja kaikki tiedot pysyvät muuttumattomina.',
    cancelled_detail: 'Kiitos kun pysyt LiquiMixerin käyttäjänä!',
    error_title: 'Virhe — LiquiMixer', error_heading: 'Tapahtui virhe',
    expired_heading: 'Linkki vanhentunut', expired_message: 'Tämä linkki on vanhentunut (24 tuntia). Jos haluat edelleen poistaa tilisi, lähetä uusi pyyntö.',
    invalid_heading: 'Virheellinen linkki', invalid_message: 'Tämä linkki on virheellinen tai sitä on jo käytetty.',
    already_used_heading: 'Linkki jo käytetty', already_used_message: 'Tämä pyyntö on jo käsitelty.',
    back_link: 'Takaisin LiquiMixeriin', footer: F
  },
  no: {
    deleted_title: 'Konto slettet — LiquiMixer', deleted_heading: 'Kontoen din er slettet',
    deleted_message: 'Alle dine data er permanent fjernet i samsvar med GDPR.',
    deleted_detail: 'Slettet: oppskrifter, produkter, påminnelser, abonnementer og personlige data.',
    cancelled_title: 'Konto beholdt — LiquiMixer', cancelled_heading: 'Kontoen din forblir aktiv',
    cancelled_message: 'Slettingsforespørselen er kansellert. Kontoen din og alle data forblir uendret.',
    cancelled_detail: 'Takk for at du blir hos LiquiMixer!',
    error_title: 'Feil — LiquiMixer', error_heading: 'Det oppstod en feil',
    expired_heading: 'Lenken er utløpt', expired_message: 'Denne lenken er utløpt (24 timer). Hvis du fortsatt ønsker å slette kontoen din, send en ny forespørsel.',
    invalid_heading: 'Ugyldig lenke', invalid_message: 'Denne lenken er ugyldig eller har allerede blitt brukt.',
    already_used_heading: 'Lenke allerede brukt', already_used_message: 'Denne forespørselen er allerede behandlet.',
    back_link: 'Tilbake til LiquiMixer', footer: F
  },
  hr: {
    deleted_title: 'Račun izbrisan — LiquiMixer', deleted_heading: 'Vaš račun je izbrisan',
    deleted_message: 'Svi vaši podaci trajno su uklonjeni u skladu s GDPR-om.',
    deleted_detail: 'Izbrisano: recepti, proizvodi, podsjetnici, pretplate i osobni podaci.',
    cancelled_title: 'Račun zadržan — LiquiMixer', cancelled_heading: 'Vaš račun ostaje aktivan',
    cancelled_message: 'Zahtjev za brisanje je otkazan. Vaš račun i svi podaci ostaju nepromijenjeni.',
    cancelled_detail: 'Hvala što ostajete s LiquiMixerom!',
    error_title: 'Greška — LiquiMixer', error_heading: 'Došlo je do greške',
    expired_heading: 'Poveznica je istekla', expired_message: 'Ova poveznica je istekla (24 sata). Ako još uvijek želite izbrisati račun, pošaljite novi zahtjev.',
    invalid_heading: 'Nevažeća poveznica', invalid_message: 'Ova poveznica nije važeća ili je već korištena.',
    already_used_heading: 'Poveznica već korištena', already_used_message: 'Ovaj zahtjev je već obrađen.',
    back_link: 'Natrag na LiquiMixer', footer: F
  },
  sr: {
    deleted_title: 'Налог обрисан — LiquiMixer', deleted_heading: 'Ваш налог је обрисан',
    deleted_message: 'Сви ваши подаци су трајно уклоњени у складу са ГДПР-ом.',
    deleted_detail: 'Обрисано: рецепти, производи, подсетници, претплате и лични подаци.',
    cancelled_title: 'Налог задржан — LiquiMixer', cancelled_heading: 'Ваш налог остаје активан',
    cancelled_message: 'Захтев за брисање је отказан. Ваш налог и сви подаци остају непромењени.',
    cancelled_detail: 'Хвала што остајете са LiquiMixer-ом!',
    error_title: 'Грешка — LiquiMixer', error_heading: 'Дошло је до грешке',
    expired_heading: 'Линк је истекао', expired_message: 'Овај линк је истекао (24 сата). Ако и даље желите да обришете налог, пошаљите нови захтев.',
    invalid_heading: 'Неважећи линк', invalid_message: 'Овај линк није важећи или је већ коришћен.',
    already_used_heading: 'Линк већ коришћен', already_used_message: 'Овај захтев је већ обрађен.',
    back_link: 'Назад на LiquiMixer', footer: F
  },
  bg: {
    deleted_title: 'Акаунтът е изтрит — LiquiMixer', deleted_heading: 'Вашият акаунт беше изтрит',
    deleted_message: 'Всички ваши данни бяха окончателно премахнати в съответствие с GDPR.',
    deleted_detail: 'Изтрити: рецепти, продукти, напомняния, абонаменти и лични данни.',
    cancelled_title: 'Акаунтът е запазен — LiquiMixer', cancelled_heading: 'Вашият акаунт остава активен',
    cancelled_message: 'Заявката за изтриване беше отменена. Вашият акаунт и всички данни остават непроменени.',
    cancelled_detail: 'Благодарим ви, че оставате с LiquiMixer!',
    error_title: 'Грешка — LiquiMixer', error_heading: 'Възникна грешка',
    expired_heading: 'Линкът е изтекъл', expired_message: 'Този линк е изтекъл (24 часа). Ако все още искате да изтриете акаунта си, изпратете нова заявка.',
    invalid_heading: 'Невалиден линк', invalid_message: 'Този линк е невалиден или вече е бил използван.',
    already_used_heading: 'Линкът вече е използван', already_used_message: 'Тази заявка вече е била обработена.',
    back_link: 'Обратно към LiquiMixer', footer: F
  },
  ro: {
    deleted_title: 'Cont șters — LiquiMixer', deleted_heading: 'Contul dvs. a fost șters',
    deleted_message: 'Toate datele dvs. au fost șterse permanent în conformitate cu GDPR.',
    deleted_detail: 'Șters: rețete, produse, memento-uri, abonamente și date personale.',
    cancelled_title: 'Cont păstrat — LiquiMixer', cancelled_heading: 'Contul dvs. rămâne activ',
    cancelled_message: 'Cererea de ștergere a fost anulată. Contul dvs. și toate datele rămân neschimbate.',
    cancelled_detail: 'Vă mulțumim că rămâneți cu LiquiMixer!',
    error_title: 'Eroare — LiquiMixer', error_heading: 'A apărut o eroare',
    expired_heading: 'Link expirat', expired_message: 'Acest link a expirat (24 ore). Dacă doriți în continuare să vă ștergeți contul, trimiteți o nouă cerere.',
    invalid_heading: 'Link invalid', invalid_message: 'Acest link este invalid sau a fost deja utilizat.',
    already_used_heading: 'Link deja utilizat', already_used_message: 'Această cerere a fost deja procesată.',
    back_link: 'Înapoi la LiquiMixer', footer: F
  },
  lt: {
    deleted_title: 'Paskyra ištrinta — LiquiMixer', deleted_heading: 'Jūsų paskyra buvo ištrinta',
    deleted_message: 'Visi jūsų duomenys buvo visam laikui pašalinti pagal BDAR.',
    deleted_detail: 'Ištrinta: receptai, produktai, priminimai, prenumeratos ir asmeniniai duomenys.',
    cancelled_title: 'Paskyra išsaugota — LiquiMixer', cancelled_heading: 'Jūsų paskyra lieka aktyvi',
    cancelled_message: 'Ištrynimo užklausa buvo atšaukta. Jūsų paskyra ir visi duomenys lieka nepakitę.',
    cancelled_detail: 'Ačiū, kad liekate su LiquiMixer!',
    error_title: 'Klaida — LiquiMixer', error_heading: 'Įvyko klaida',
    expired_heading: 'Nuoroda nebegalioja', expired_message: 'Ši nuoroda nebegalioja (24 valandos). Jei vis dar norite ištrinti paskyrą, pateikite naują užklausą.',
    invalid_heading: 'Netinkama nuoroda', invalid_message: 'Ši nuoroda netinkama arba jau buvo panaudota.',
    already_used_heading: 'Nuoroda jau panaudota', already_used_message: 'Ši užklausa jau buvo apdorota.',
    back_link: 'Grįžti į LiquiMixer', footer: F
  },
  lv: {
    deleted_title: 'Konts dzēsts — LiquiMixer', deleted_heading: 'Jūsu konts ir dzēsts',
    deleted_message: 'Visi jūsu dati ir neatgriezeniski dzēsti saskaņā ar VDAR.',
    deleted_detail: 'Dzēsts: receptes, produkti, atgādinājumi, abonementi un personas dati.',
    cancelled_title: 'Konts saglabāts — LiquiMixer', cancelled_heading: 'Jūsu konts paliek aktīvs',
    cancelled_message: 'Dzēšanas pieprasījums ir atcelts. Jūsu konts un visi dati paliek nemainīti.',
    cancelled_detail: 'Paldies, ka paliekat ar LiquiMixer!',
    error_title: 'Kļūda — LiquiMixer', error_heading: 'Radās kļūda',
    expired_heading: 'Saite ir beigusies', expired_message: 'Šī saite ir beigusies (24 stundas). Ja joprojām vēlaties dzēst kontu, iesniedziet jaunu pieprasījumu.',
    invalid_heading: 'Nederīga saite', invalid_message: 'Šī saite ir nederīga vai jau ir izmantota.',
    already_used_heading: 'Saite jau izmantota', already_used_message: 'Šis pieprasījums jau ir apstrādāts.',
    back_link: 'Atpakaļ uz LiquiMixer', footer: F
  },
  et: {
    deleted_title: 'Konto kustutatud — LiquiMixer', deleted_heading: 'Teie konto on kustutatud',
    deleted_message: 'Kõik teie andmed on GDPR-i kohaselt jäädavalt eemaldatud.',
    deleted_detail: 'Kustutatud: retseptid, tooted, meeldetuletused, tellimused ja isikuandmed.',
    cancelled_title: 'Konto säilitatud — LiquiMixer', cancelled_heading: 'Teie konto jääb aktiivseks',
    cancelled_message: 'Kustutamistaotlus on tühistatud. Teie konto ja kõik andmed jäävad muutumatuks.',
    cancelled_detail: 'Täname, et jääte LiquiMixeriga!',
    error_title: 'Viga — LiquiMixer', error_heading: 'Tekkis viga',
    expired_heading: 'Link aegunud', expired_message: 'See link on aegunud (24 tundi). Kui soovite endiselt oma kontot kustutada, esitage uus taotlus.',
    invalid_heading: 'Kehtetu link', invalid_message: 'See link on kehtetu või on juba kasutatud.',
    already_used_heading: 'Link juba kasutatud', already_used_message: 'See taotlus on juba töödeldud.',
    back_link: 'Tagasi LiquiMixerisse', footer: F
  },
  hu: {
    deleted_title: 'Fiók törölve — LiquiMixer', deleted_heading: 'Fiókja törölve lett',
    deleted_message: 'Minden adata véglegesen eltávolításra került a GDPR-nek megfelelően.',
    deleted_detail: 'Törölve: receptek, termékek, emlékeztetők, előfizetések és személyes adatok.',
    cancelled_title: 'Fiók megtartva — LiquiMixer', cancelled_heading: 'Fiókja aktív marad',
    cancelled_message: 'A törlési kérelem visszavonásra került. Fiókja és minden adata változatlan marad.',
    cancelled_detail: 'Köszönjük, hogy a LiquiMixernél marad!',
    error_title: 'Hiba — LiquiMixer', error_heading: 'Hiba történt',
    expired_heading: 'A link lejárt', expired_message: 'Ez a link lejárt (24 óra). Ha továbbra is törölni szeretné fiókját, küldjön új kérelmet.',
    invalid_heading: 'Érvénytelen link', invalid_message: 'Ez a link érvénytelen vagy már felhasználták.',
    already_used_heading: 'Link már felhasználva', already_used_message: 'Ez a kérelem már feldolgozásra került.',
    back_link: 'Vissza a LiquiMixerhez', footer: F
  },
  el: {
    deleted_title: 'Λογαριασμός διαγράφηκε — LiquiMixer', deleted_heading: 'Ο λογαριασμός σας διαγράφηκε',
    deleted_message: 'Όλα τα δεδομένα σας αφαιρέθηκαν μόνιμα σύμφωνα με τον GDPR.',
    deleted_detail: 'Διαγράφηκαν: συνταγές, προϊόντα, υπενθυμίσεις, συνδρομές και προσωπικά δεδομένα.',
    cancelled_title: 'Λογαριασμός διατηρήθηκε — LiquiMixer', cancelled_heading: 'Ο λογαριασμός σας παραμένει ενεργός',
    cancelled_message: 'Το αίτημα διαγραφής ακυρώθηκε. Ο λογαριασμός σας και όλα τα δεδομένα παραμένουν αμετάβλητα.',
    cancelled_detail: 'Ευχαριστούμε που μένετε με το LiquiMixer!',
    error_title: 'Σφάλμα — LiquiMixer', error_heading: 'Παρουσιάστηκε σφάλμα',
    expired_heading: 'Ο σύνδεσμος έληξε', expired_message: 'Αυτός ο σύνδεσμος έληξε (24 ώρες). Αν θέλετε ακόμα να διαγράψετε τον λογαριασμό σας, υποβάλετε νέο αίτημα.',
    invalid_heading: 'Μη έγκυρος σύνδεσμος', invalid_message: 'Αυτός ο σύνδεσμος δεν είναι έγκυρος ή έχει ήδη χρησιμοποιηθεί.',
    already_used_heading: 'Σύνδεσμος ήδη χρησιμοποιημένος', already_used_message: 'Αυτό το αίτημα έχει ήδη επεξεργαστεί.',
    back_link: 'Πίσω στο LiquiMixer', footer: F
  },
  uk: {
    deleted_title: 'Акаунт видалено — LiquiMixer', deleted_heading: 'Ваш акаунт було видалено',
    deleted_message: 'Усі ваші дані були безповоротно видалені відповідно до GDPR.',
    deleted_detail: 'Видалено: рецепти, продукти, нагадування, підписки та особисті дані.',
    cancelled_title: 'Акаунт збережено — LiquiMixer', cancelled_heading: 'Ваш акаунт залишається активним',
    cancelled_message: 'Запит на видалення було скасовано. Ваш акаунт та всі дані залишаються без змін.',
    cancelled_detail: 'Дякуємо, що залишаєтесь з LiquiMixer!',
    error_title: 'Помилка — LiquiMixer', error_heading: 'Сталася помилка',
    expired_heading: 'Посилання закінчилось', expired_message: 'Термін дії цього посилання закінчився (24 години). Якщо ви все ще хочете видалити акаунт, надішліть новий запит.',
    invalid_heading: 'Недійсне посилання', invalid_message: 'Це посилання недійсне або вже було використане.',
    already_used_heading: 'Посилання вже використане', already_used_message: 'Цей запит вже було оброблено.',
    back_link: 'Повернутися до LiquiMixer', footer: F
  },
  tr: {
    deleted_title: 'Hesap silindi — LiquiMixer', deleted_heading: 'Hesabınız silindi',
    deleted_message: 'Tüm verileriniz KVKK/GDPR uyarınca kalıcı olarak kaldırıldı.',
    deleted_detail: 'Silindi: tarifler, ürünler, hatırlatıcılar, abonelikler ve kişisel veriler.',
    cancelled_title: 'Hesap korundu — LiquiMixer', cancelled_heading: 'Hesabınız aktif kalmaya devam ediyor',
    cancelled_message: 'Silme talebi iptal edildi. Hesabınız ve tüm verileriniz değişmeden kalıyor.',
    cancelled_detail: 'LiquiMixer ile kaldığınız için teşekkürler!',
    error_title: 'Hata — LiquiMixer', error_heading: 'Bir hata oluştu',
    expired_heading: 'Bağlantı süresi doldu', expired_message: 'Bu bağlantının süresi doldu (24 saat). Hesabınızı hâlâ silmek istiyorsanız, yeni bir talep gönderin.',
    invalid_heading: 'Geçersiz bağlantı', invalid_message: 'Bu bağlantı geçersiz veya zaten kullanılmış.',
    already_used_heading: 'Bağlantı zaten kullanıldı', already_used_message: 'Bu talep zaten işlendi.',
    back_link: 'LiquiMixer\'e dön', footer: F
  }
}

// Get translations with fallback to English
function getTranslations(lang: string) {
  return GDPR_TRANSLATIONS[lang] || GDPR_TRANSLATIONS['en']
}

// Generate HTML response page
function generateHtmlPage(
  title: string,
  heading: string,
  message: string,
  detail: string,
  isSuccess: boolean,
  isError: boolean,
  backLink: string,
  footer: string,
  lang: string = 'en'
): string {
  const iconColor = isError ? '#ff4444' : (isSuccess ? '#00ff88' : '#ffaa00')
  const icon = isError ? '✕' : (isSuccess ? '✓' : '⚠')
  const bgGradient = isError 
    ? 'linear-gradient(135deg, #1a0000, #0a0a15)' 
    : (isSuccess 
      ? 'linear-gradient(135deg, #001a0a, #0a0a15)' 
      : 'linear-gradient(135deg, #1a1a00, #0a0a15)')

  return `<!DOCTYPE html>
<html lang="${lang}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background: ${bgGradient};
      color: #ffffff;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    .container {
      max-width: 500px;
      width: 100%;
      text-align: center;
      background: rgba(255,255,255,0.05);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 16px;
      padding: 40px 30px;
      backdrop-filter: blur(10px);
    }
    .icon {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      border: 3px solid ${iconColor};
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 24px;
      font-size: 36px;
      color: ${iconColor};
    }
    h1 {
      font-size: 24px;
      margin-bottom: 16px;
      color: ${iconColor};
    }
    .message {
      font-size: 16px;
      line-height: 1.6;
      color: #cccccc;
      margin-bottom: 12px;
    }
    .detail {
      font-size: 14px;
      color: #999999;
      margin-bottom: 30px;
    }
    .back-link {
      display: inline-block;
      background: linear-gradient(135deg, #ff00ff, #aa00ff);
      color: white;
      padding: 12px 28px;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 600;
      transition: opacity 0.2s;
    }
    .back-link:hover { opacity: 0.85; }
    .footer {
      margin-top: 30px;
      font-size: 12px;
      color: #666666;
    }
    .logo {
      font-size: 28px;
      font-weight: 900;
      background: linear-gradient(135deg, #ff00ff, #00ffff);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      margin-bottom: 24px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="logo">LiquiMixer</div>
    <div class="icon">${icon}</div>
    <h1>${heading}</h1>
    <p class="message">${message}</p>
    <p class="detail">${detail}</p>
    <a href="https://www.liquimixer.com" class="back-link">${backLink}</a>
    <p class="footer">${footer}</p>
  </div>
</body>
</html>`
}

// Delete Clerk user via Backend API
async function deleteClerkUser(clerkId: string): Promise<boolean> {
  if (!CLERK_SECRET_KEY) {
    console.error('CLERK_SECRET_KEY not configured')
    return false
  }
  
  try {
    const response = await fetch(`${CLERK_API_URL}/users/${clerkId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${CLERK_SECRET_KEY}`,
        'Content-Type': 'application/json'
      }
    })
    
    if (response.ok || response.status === 404) {
      // 404 = user already deleted, that's fine
      console.log(`Clerk user ${clerkId} deleted (status: ${response.status})`)
      return true
    } else {
      const error = await response.text()
      console.error(`Failed to delete Clerk user ${clerkId}:`, error)
      return false
    }
  } catch (error) {
    console.error(`Error deleting Clerk user ${clerkId}:`, error)
    return false
  }
}

// Helper: redirect to liquimixer.com with GDPR result parameters
// Supabase Edge Functions cannot serve HTML (Content-Type forced to text/plain)
function gdprRedirect(result: string, lang: string): Response {
  const url = `https://www.liquimixer.com?gdpr=${result}&lang=${lang}`
  return new Response(null, {
    status: 302,
    headers: { 'Location': url, 'Cache-Control': 'no-store' }
  })
}

// ============================================
// HLAVNÍ HANDLER
// ============================================

serve(async (req) => {
  // Only GET requests
  if (req.method !== 'GET') {
    return new Response('Method Not Allowed', { status: 405 })
  }

  const url = new URL(req.url)
  const token = url.searchParams.get('token')
  const action = url.searchParams.get('action')
  const lang = url.searchParams.get('lang') || 'en'
  const t = getTranslations(lang)

  // Validate parameters
  if (!token || !action || !['delete', 'cancel'].includes(action)) {
    return gdprRedirect('invalid', lang)
  }

  // Validate token format (UUID)
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  if (!uuidRegex.test(token)) {
    return gdprRedirect('invalid', lang)
  }

  // Initialize Supabase with service role (bypasses RLS)
  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  try {
    // 1. Find GDPR request by token
    const { data: gdprRequest, error: fetchError } = await supabaseAdmin
      .from('gdpr_deletion_requests')
      .select('*')
      .eq('token', token)
      .single()

    if (fetchError || !gdprRequest) {
      console.error('GDPR request not found for token:', token)
      return gdprRedirect('invalid', lang)
    }

    // 2. Check if already processed
    if (gdprRequest.status !== 'pending') {
      return gdprRedirect('used', lang)
    }

    // 3. Check expiration (24 hours)
    const expiresAt = new Date(gdprRequest.expires_at)
    if (expiresAt < new Date()) {
      // Mark as expired
      await supabaseAdmin
        .from('gdpr_deletion_requests')
        .update({ status: 'expired' })
        .eq('id', gdprRequest.id)

      return gdprRedirect('expired', lang)
    }

    const clerkId = gdprRequest.clerk_id
    const userEmail = gdprRequest.email

    // ============================================
    // ACTION: CANCEL — Keep account
    // ============================================
    if (action === 'cancel') {
      // Update GDPR request status
      await supabaseAdmin
        .from('gdpr_deletion_requests')
        .update({ 
          status: 'cancelled',
          cancelled_at: new Date().toISOString()
        })
        .eq('id', gdprRequest.id)

      // Update contact message status if linked
      if (gdprRequest.contact_message_id) {
        await supabaseAdmin
          .from('contact_messages')
          .update({ 
            status: 'auto_resolved',
            resolved_at: new Date().toISOString(),
            ai_notes: (gdprRequest.ai_notes || '') + '\n[GDPR] Uživatel zrušil požadavek na smazání účtu.'
          })
          .eq('id', gdprRequest.contact_message_id)
      }

      // Audit log
      await supabaseAdmin
        .from('audit_logs')
        .insert({
          clerk_id: clerkId,
          action: 'gdpr_deletion_cancelled',
          resource_type: 'gdpr_deletion_requests',
          resource_id: gdprRequest.id,
          ip_address: req.headers.get('x-forwarded-for') || req.headers.get('cf-connecting-ip') || 'unknown',
          user_agent: req.headers.get('user-agent') || 'unknown',
          details: { email: userEmail, token: token },
          success: true
        })

      console.log(`GDPR deletion CANCELLED for ${clerkId} (${userEmail})`)

      return gdprRedirect('cancelled', lang)
    }

    // ============================================
    // ACTION: DELETE — Delete account and all data
    // ============================================
    const deletionLog: Record<string, number> = {}

    // 4a. Delete recipes
    const { data: deletedRecipes } = await supabaseAdmin
      .from('recipes')
      .delete()
      .eq('clerk_id', clerkId)
      .select('id')
    deletionLog.recipes = deletedRecipes?.length || 0

    // 4b. Delete favorite products
    const { data: deletedProducts } = await supabaseAdmin
      .from('favorite_products')
      .delete()
      .eq('clerk_id', clerkId)
      .select('id')
    deletionLog.favorite_products = deletedProducts?.length || 0

    // 4c. Delete reminders
    const { data: deletedReminders } = await supabaseAdmin
      .from('reminders')
      .delete()
      .eq('clerk_id', clerkId)
      .select('id')
    deletionLog.reminders = deletedReminders?.length || 0

    // 4d. Delete FCM tokens
    const { data: deletedFcmTokens } = await supabaseAdmin
      .from('fcm_tokens')
      .delete()
      .eq('clerk_id', clerkId)
      .select('id')
    deletionLog.fcm_tokens = deletedFcmTokens?.length || 0

    // 4e. Delete subscriptions
    const { data: deletedSubscriptions } = await supabaseAdmin
      .from('subscriptions')
      .delete()
      .eq('clerk_id', clerkId)
      .select('id')
    deletionLog.subscriptions = deletedSubscriptions?.length || 0

    // 4f. Delete payments
    const { data: deletedPayments } = await supabaseAdmin
      .from('payments')
      .delete()
      .eq('clerk_id', clerkId)
      .select('id')
    deletionLog.payments = deletedPayments?.length || 0

    // 4g. Anonymize contact messages (keep for audit, remove PII)
    const { data: anonymizedMessages } = await supabaseAdmin
      .from('contact_messages')
      .update({
        clerk_id: null,
        email: `deleted_${gdprRequest.id.substring(0, 8)}@anonymized.local`,
        status: 'closed',
        resolved_at: new Date().toISOString(),
        ai_notes: '[GDPR] Účet smazán na žádost uživatele. Osobní údaje anonymizovány.'
      })
      .eq('clerk_id', clerkId)
      .select('id')
    deletionLog.contact_messages_anonymized = anonymizedMessages?.length || 0

    // 4h. Delete user record
    const { data: deletedUser } = await supabaseAdmin
      .from('users')
      .delete()
      .eq('clerk_id', clerkId)
      .select('id')
    deletionLog.users = deletedUser?.length || 0

    // 5. Delete Clerk account
    const clerkDeleted = await deleteClerkUser(clerkId)
    deletionLog.clerk_deleted = clerkDeleted ? 1 : 0

    // 6. Update GDPR request
    await supabaseAdmin
      .from('gdpr_deletion_requests')
      .update({
        status: 'confirmed',
        confirmed_at: new Date().toISOString(),
        deleted_data: deletionLog
      })
      .eq('id', gdprRequest.id)

    // 7. Audit log
    await supabaseAdmin
      .from('audit_logs')
      .insert({
        clerk_id: clerkId,
        action: 'gdpr_account_deleted',
        resource_type: 'gdpr_deletion_requests',
        resource_id: gdprRequest.id,
        ip_address: req.headers.get('x-forwarded-for') || req.headers.get('cf-connecting-ip') || 'unknown',
        user_agent: req.headers.get('user-agent') || 'unknown',
        details: {
          email: userEmail,
          token: token,
          deletion_log: deletionLog,
          clerk_deleted: clerkDeleted
        },
        success: true
      })

    console.log(`GDPR account DELETED for ${clerkId} (${userEmail}):`, deletionLog)

    return gdprRedirect('deleted', lang)

  } catch (error) {
    console.error('GDPR confirm error:', error)

    // Audit log for error
    try {
      const supabaseAdmin2 = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
        { auth: { autoRefreshToken: false, persistSession: false } }
      )
      await supabaseAdmin2
        .from('audit_logs')
        .insert({
          action: 'gdpr_confirm_error',
          resource_type: 'gdpr_deletion_requests',
          ip_address: req.headers.get('x-forwarded-for') || 'unknown',
          details: { token, action, error: error.message },
          success: false,
          error_message: error.message
        })
    } catch (_) {
      // Ignore audit log errors
    }

    return gdprRedirect('error', lang)
  }
})
