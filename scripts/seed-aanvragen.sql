-- One-time backfill of aanvragen received before the pipeline existed.
-- Parsed from the inbox emails (May–June 2026).
--
-- HOW TO RUN (once!) — re-running will create duplicates.
-- On the VPS, pipe it into the Postgres container:
--   docker exec -i <postgres-container> psql -U <user> -d <db> < scripts/seed-aanvragen.sql
-- (find the container name with `docker ps`; user/db are what you set in Dokploy)
--
-- created_at is set to the email date so the funnel metrics land in the right
-- month. All rows start as 'nieuw' — advance them in /admin/aanvragen.

-- Safety: ensure the table exists (mirrors src/lib/server/db.ts). No-op if the
-- app already created it.
CREATE TABLE IF NOT EXISTS deals (
	id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	created_at           timestamptz NOT NULL DEFAULT now(),
	updated_at           timestamptz NOT NULL DEFAULT now(),
	name                 text NOT NULL DEFAULT '',
	email                text NOT NULL DEFAULT '',
	phone                text NOT NULL DEFAULT '',
	source               text NOT NULL DEFAULT '',
	attribution          text NOT NULL DEFAULT '',
	event_date           date,
	event_date_text      text NOT NULL DEFAULT '',
	location             text NOT NULL DEFAULT '',
	guests               text NOT NULL DEFAULT '',
	service_type         text NOT NULL DEFAULT '',
	choice               text NOT NULL DEFAULT '',
	dagdeel              text NOT NULL DEFAULT '',
	serving_time         text NOT NULL DEFAULT '',
	status               text NOT NULL DEFAULT 'nieuw'
		CHECK (status IN ('nieuw','offerte_verstuurd','in_optie','geaccepteerd','afgewezen','afgerond')),
	offerte_amount       numeric(10,2),
	btw_amount           numeric(10,2),
	costs                numeric(10,2),
	offerte_verstuurd_op date,
	geldig_tot           date,
	geaccepteerd_op      date,
	time_spent           text NOT NULL DEFAULT '{}',
	message              text NOT NULL DEFAULT '',
	notes                text NOT NULL DEFAULT '',
	origin               text NOT NULL DEFAULT 'manual'
);

BEGIN;

INSERT INTO deals
	(created_at, updated_at, name, email, phone, source, event_date, event_date_text,
	 location, guests, service_type, choice, dagdeel, serving_time, status, origin, message)
VALUES
	('2026-05-05 12:00:00+00','2026-05-05 12:00:00+00','Myrthe Blauw','myrtheblauw@live.nl','+31 6 48 53 97 54','',
	 '2026-09-05','2026-09-05','Tiel','50','','Tiramisu (De Toetjes Vrouw), Burrata (De Borrel Baas)','','',
	 'nieuw','manual',
	 'Wij willen een tuinfeest geven omdat we 10 jaar samen zijn en Myrthe 30 jaar wordt. We zijn dol op originele en lekkere dingen, Hangende Hapjes lijkt ons waanzinnig! Ik hoor graag of jullie beschikbaar zijn en zo ja, dan zou ik graag een offerte willen voor de tarieven van de Toetjesvrouw en/of de Borrelbaas.'),

	('2026-05-27 12:00:00+00','2026-05-27 12:00:00+00','Lauren','laurenliebe@hotmail.com','','Google',
	 '2027-04-17','2027-04-17','Leiden','55','','Tiramisu (De Toetjes Vrouw)','','',
	 'nieuw','manual',
	 'Beste, Ik zou graag meer willen weten over de optie van een Tiramisu taart of eventuele losse kleine tiramisu. Dank! Groet, Lauren'),

	('2026-05-29 12:00:00+00','2026-05-29 12:00:00+00','Lisanne Hoogendoorn','lisannejessica@gmail.com','0630807748','',
	 '2026-09-11','2026-09-11','Buitenplaats Sparrendaal','65','','Tiramisu (De Toetjes Vrouw)','','',
	 'nieuw','manual',
	 'Hii! Op 11 september 2026 geven wij elkaar het ja-woord en zouden graag willen toosten met een heerlijk stuk tiramisu! Graag ontvangen wij of dit mogelijk is. Met vriendelijke groetjes, Lisanne & Rick'),

	('2026-05-30 12:00:00+00','2026-05-30 12:00:00+00','Ellen','ellenvantklooster@hotmail.com','0630586825','',
	 '2027-08-14','2027-08-14','Havixhorst in Schiphorst','65','','Tiramisu (De Toetjes Vrouw)','','',
	 'nieuw','manual',
	 'Tijdens onze bruiloft zouden we graag tiramisua als toetje willen reserveren. We horen graag wat de kosten hiervan bedragen.'),

	('2026-06-02 12:00:00+00','2026-06-02 12:00:00+00','Anouk van den Brink','anouk.van.den.brink@cast.nl','0628663760','Google',
	 '2026-06-15','2026-06-15','Nieuwegein','400','hapjes','Burrata','','13:30',
	 'nieuw','manual',
	 'Wij organiseren in de maand juni 3 events. Het betreffen B2B inkoop events gericht op de fashion industrie. Middels het stukje horeca proberen wij een goede ''vibe'' te creëren, waardoor zowel deelnemers als bezoekers in een ontspannen sfeer zaken kunnen doen. Wij lopen altijd al hapjes uit. Nu willen wij nog iets specialers, dat er ook iets op locatie word gemaakt. Ik ben jullie tegen gekomen en dit lijkt mij erg leuk en geschikt voor op de beurs. Graag hoor ik jullie opties.'),

	('2026-06-05 12:00:00+00','2026-06-05 12:00:00+00','Jacqueline en Cheunon','jacqueline_lu1999@hotmail.com','','Eigen idee',
	 '2027-07-22','2027-07-22','Slot Zeist','80','taart','Tiramisu Taart','Receptie/borrel','15:00',
	 'nieuw','manual',
	 'Ik zou eigenlijk graag opties met foto willen zien van de tiramisu taart en de Italiaanse mille feuille taart. Graag vraag ik een vrijblijvende offerte aan.'),

	('2026-06-07 12:00:00+00','2026-06-07 12:00:00+00','Ylona Hottentot','y.hottentot@gmail.com','+31623944369','Google',
	 '2026-10-17','2026-10-17','Blooming Hotel, Bergen','66','hapjes','Tiramisu','Taartmoment','15:30',
	 'nieuw','manual',
	 'Hallo, Ik ben opzoek naar een tiramisu toren voor na onze ceremonie. Dan doen wij een borrel/cocktail party en willen dit graag af trappen met een tiramisu toren. Ik hoor ook graag of deze ook alcoholvrij te maken is, en of er ook een glutenvrije optie is. Ik hoor het graag en alvast bedank'),

	('2026-06-11 12:00:00+00','2026-06-11 12:00:00+00','Simon','simonburema@gmail.com','0634223554','Google',
	 '2026-08-22','2026-08-22','Ermelo','50','taart','Tiramisu Taart','Taartmoment','15:30',
	 'nieuw','manual',
	 'Hoi! Wij zijn gek op tiramisu en niet zo van de normale taart dus het lijkt ons superleuk om ipv een bruidstaart een tiramisu taart/toren te hebben. Wat zou dit ongeveer kosten voor 50 man en hebben jullie toevallig ook plaatjes hoe dat eruit ziet? Horen het graag! Groetjes Simon en Femke');

COMMIT;

-- Verify:
SELECT created_at::date AS binnen, name, event_date, status FROM deals ORDER BY created_at;
