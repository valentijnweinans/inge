# TODO — Inge, Pianoles Gorssel

Openstaande taken voor deze website. Lees eerst `CLAUDE.md`. Vink een taak af (`[x]`) zodra hij
klaar en gecontroleerd is.

Legenda: **[agent]** kan een agent zelf doen · **[mens]** vraagt actie of informatie van Viti/Inge.

Live: https://valentijnweinans.github.io/inge/ (GitHub Pages, branch `main`, repo `valentijnweinans/inge`)

---

## 1. Contactformulier aansluiten op de mail-API — de site kan nu nog GEEN mail versturen

De site post naar de gedeelde Rails-app `vitis-mail-api` (Fly.io). Broncode staat in
`../anne_weinans/mail_api` (repo `valentijnweinans/act_therapy`). Een push naar `main` met
wijzigingen in `mail_api/**` deployt automatisch via `.github/workflows/fly.yml`.
De API-sleutel van deze site staat al in `main.js` (`MAIL_API_KEY`):
`167f32ce62f760611642670f90ea95776cab0379818126bb75634bdca51be76f`

- [ ] **[mens]** E-mailadres van Inge opvragen waarop berichten binnen moeten komen.
- [ ] **[agent]** Client toevoegen aan `../anne_weinans/mail_api/config/clients.yml`:
  ```yaml
  inge:
    name: "Inge"
    header_name: "Pianoles Gorssel"
    api_key_env: "CLIENT_INGE_KEY"
    recipient_env: "CLIENT_INGE_RECIPIENT"
    confirmation_message: "Hartelijk dank voor je bericht. Ik heb het goed ontvangen en neem zo spoedig mogelijk contact met je op, doorgaans binnen twee werkdagen."
    locale:
      greeting: "Beste"
      your_message: "Jouw bericht"
      sign_off: "Met vriendelijke groet,"
      confirmation_subject_prefix: "Bedankt voor je bericht —"
      submission_subject_prefix: "Nieuw bericht van:"
      submission_intro: "Er is een nieuw contactbericht binnengekomen via"
      submission_reply_hint: "Je kunt direct antwoorden op deze e-mail — de reply-to is ingesteld op het adres van de afzender."
  ```
- [ ] **[agent, na akkoord]** Secrets zetten (raakt de productie-API, dus eerst bevestigen):
  `fly secrets set -a vitis-mail-api CLIENT_INGE_KEY=<sleutel hierboven> CLIENT_INGE_RECIPIENT=<mail van Inge>`
  Zet dezelfde twee ook in `../anne_weinans/mail_api/.env` voor lokaal testen.
- [ ] **[agent, na akkoord]** `ALLOWED_ORIGINS` (Fly-secret, komma-gescheiden) uitbreiden met
  `https://valentijnweinans.github.io` (en later het eigen domein). De bestaande origins van Anne en
  Silvia moeten erin blijven — `fly secrets list` toont alleen namen, dus de huidige waarde navragen
  of via `fly ssh console -a vitis-mail-api -C 'printenv ALLOWED_ORIGINS'` ophalen. Niet zomaar overschrijven.
- [ ] **[mens, optioneel]** Eigen afzender: zonder `from_env` + `smtp_env_prefix` mailt Inge zichtbaar
  vanaf het globale `MAIL_FROM`-adres (dat van Anne). Wil Inge een eigen afzender, dan een mailbox
  regelen (bijv. Gmail + app-wachtwoord) en `from_env: "CLIENT_INGE_FROM"` +
  `smtp_env_prefix: "CLIENT_INGE_SMTP"` toevoegen, zoals bij `silvia` in `clients.yml`.
- [ ] **[agent]** Committen en pushen in `../anne_weinans` (triggert deploy), daarna testen:
  formulier op de live site invullen (wacht >3 sec, anders negeert de API het als bot) en
  controleren dat zowel Inge als de afzender een mail krijgen.
- [ ] **[agent]** In `../anne_weinans/CLAUDE.md` de clients-notitie bijwerken.

## 2. Inhoud — placeholders vervangen door echte gegevens (alles in `content.json`)

- [ ] **[mens]** Echte reviews aanleveren. De drie huidige (Marieke, Joris, Daan) zijn VERZONNEN
  voorbeelden en moeten zo snel mogelijk vervangen of weggehaald worden.
- [ ] **[mens]** Feiten controleren: "15+ jaar leservaring", "6–86 jaar", "30 / 45 minuten per les".
- [ ] **[mens]** Bevestigen dat de eerste proefles echt gratis is (staat in `oproep.tekst` en in de
  meta-description).
- [ ] **[mens]** Over-mij-tekst laten nalezen door Inge; eventueel achternaam toevoegen.
- [ ] **[agent]** Na wijzigingen in titel/beschrijving: ook de vaste `<head>` van `index.html` en
  `contact.html` bijwerken (zie CLAUDE.md → SEO).

## 3. Domein en vindbaarheid (SEO)

- [ ] **[mens]** Eigen domein kiezen/registreren (bijv. iets met "pianoles-gorssel").
- [ ] **[agent]** Domein koppelen: `CNAME`-bestand in de root, DNS volgens de GitHub Pages-docs,
  en `https://valentijnweinans.github.io/inge` overal vervangen (`grep -rn "github.io/inge" .`):
  index.html, contact.html, robots.txt, sitemap.xml, TODO.md. `robots.txt` werkt pas echt op een
  eigen domein (crawlers lezen alleen `/robots.txt` in de root).
- [ ] **[mens]** Google Bedrijfsprofiel aanmaken voor "Pianoles Inge" in Gorssel — belangrijkste
  factor voor lokale zoekresultaten; echte Google-reviews komen daar.
- [ ] **[mens]** Site toevoegen aan Google Search Console en `sitemap.xml` indienen.
- [ ] **[agent]** `lastmod` in `sitemap.xml` bijwerken bij inhoudelijke wijzigingen.

## 4. Overig

- [ ] **[mens]** De originele telefoonfoto's (`img/IMG2026*.jpg`) staan alleen lokaal (in
  `.gitignore`); elders bewaren. De site gebruikt alleen de web-versies.
- [ ] **[agent]** Privacyverklaring toevoegen (het formulier verwerkt naam/e-mail/telefoon — AVG).
  Zie `../silvia/privacy.html` als voorbeeld.
