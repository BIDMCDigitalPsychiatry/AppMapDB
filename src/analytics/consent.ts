/*
 * Analytics consent for visitors in Europe (EEA, UK, Switzerland).
 *
 * index.html loads Google Analytics with Consent Mode: analytics cookies are denied by default for those
 * regions (Google decides the region server-side from the visitor's IP) and allowed everywhere else. It also
 * re-applies a stored "granted" choice on page load, before the first page view is sent, so the
 * STORAGE_KEY value here must stay in sync with the inline script there.
 *
 * We can't see the visitor's IP in a static site, so the banner uses the browser's time zone as a
 * stand-in. The two can disagree (a traveller, a VPN); either way the result stays on the safe side:
 *  - Europe time zone outside Europe → they're asked; declining only means they aren't counted.
 *  - Non-European time zone inside Europe → no banner, and Google's regional default keeps cookies off.
 */

const STORAGE_KEY = 'mindapps-analytics-consent';
export const OPEN_CONSENT_EVENT = 'mindapps:open-analytics-consent';

export type ConsentChoice = 'granted' | 'denied';

// Atlantic zones cover Iceland, the Faroes, the Canaries, Madeira and the Azores.
const EUROPEAN_ATLANTIC = ['Atlantic/Reykjavik', 'Atlantic/Faroe', 'Atlantic/Canary', 'Atlantic/Madeira', 'Atlantic/Azores'];

export const isEuropeanVisitor = (): boolean => {
  try {
    const zone = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
    return zone.startsWith('Europe/') || EUROPEAN_ATLANTIC.includes(zone);
  } catch {
    return false;
  }
};

// Analytics only loads on the production hostnames (see index.html), so there's nothing to consent to elsewhere.
export const isAnalyticsActive = (): boolean => typeof (window as any).gtag === 'function';

export const getConsent = (): ConsentChoice | null => {
  try {
    const value = window.localStorage.getItem(STORAGE_KEY);
    return value === 'granted' || value === 'denied' ? value : null;
  } catch {
    return null; // storage blocked → ask again each visit rather than assume consent
  }
};

export const setConsent = (choice: ConsentChoice) => {
  try {
    window.localStorage.setItem(STORAGE_KEY, choice);
  } catch {
    /* storage blocked — the choice still applies for this page view */
  }
  (window as any).gtag?.('consent', 'update', { analytics_storage: choice });
};

export const openConsentSettings = () => window.dispatchEvent(new Event(OPEN_CONSENT_EVENT));
