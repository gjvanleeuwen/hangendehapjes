-- Demo aanvragen for local testing.
-- Safe to rerun: deletes only rows with origin = 'demo_seed'.

BEGIN;

DELETE FROM deals WHERE origin = 'demo_seed';

INSERT INTO deals
	(created_at, updated_at, name, email, phone, source, attribution, event_date, event_date_text,
	 location, guests, service_type, choice, dagdeel, serving_time, status, offerte_amount,
	 btw_amount, costs, offerte_verstuurd_op, geldig_tot, geaccepteerd_op, acceptance_token,
	 acceptance_enabled, acceptance_expires_at, accepted_terms_at, accepted_terms_version,
	 prepayment_amount, prepayment_link, prepayment_status, ops_json, ops_completed_at,
	 time_spent, message, notes, origin)
VALUES
	(
		now() - interval '10 days', now() - interval '10 days',
		'Noor & Bram', 'noor.demo@example.com', '+31 6 11 22 33 44', 'Instagram', 'Instagram',
		'2026-09-12', '2026-09-12', 'Landgoed Zonnestraal, Hilversum', '75', 'hapjes',
		'Tiramisu + burrata', 'Borrel', '16:00', 'nieuw', null, null, null, null, null, null,
		'', false, null, null, '', null, '', 'not_sent', '{}', null, '{}',
		'Bruiloft in de tuin. Ze willen iets luchtigs na de ceremonie.',
		'Demo: nieuwe aanvraag, nog geen offerte.', 'demo_seed'
	),
	(
		now() - interval '7 days', now() - interval '5 days',
		'Mila Jansen', 'mila.demo@example.com', '+31 6 55 66 77 88', 'Google', 'Google',
		'2026-10-03', '2026-10-03', 'Buitenplaats Sparrendaal, Driebergen', '60', 'taart',
		'Millefoglie bruidstaart', 'Taartmoment', '15:30', 'offerte_verstuurd', 895.00,
		73.90, 240.00, current_date - 5, current_date + 9, null,
		'', false, null, null, '', 447.50, 'https://example.com/betaal/demo-mila', 'sent',
		'{}', null, '{"offerte":1.25}',
		'Vraag naar Italiaanse millefoglie met rood fruit.',
		'Demo: offerte verstuurd, betaallink klaar, klantlink nog niet gegenereerd.', 'demo_seed'
	),
	(
		now() - interval '4 days', now() - interval '3 days',
		'Studio Veld', 'events.demo@example.com', '+31 20 123 45 67', 'LinkedIn', 'LinkedIn',
		'2026-08-28', '2026-08-28', 'Amsterdam Noord', '120', 'hapjes',
		'Burrata bowls', 'Middag event', '14:00', 'in_optie', 1325.00,
		109.40, 410.00, current_date - 3, current_date + 11, null,
		'demo-studio-veld-token-20260702', true, now() + interval '30 days', null, '',
		662.50, 'https://example.com/betaal/demo-studio-veld', 'sent',
		'{}', null, '{"offerte":1.5}',
		'Zakelijk event met live hapjes tussen presentaties door.',
		'Demo: klantlink actief. Open /klantportaal/demo-studio-veld-token-20260702.', 'demo_seed'
	),
	(
		now() - interval '18 days', now() - interval '1 day',
		'Lotte & Sam', 'lotte.demo@example.com', '+31 6 98 76 54 32', 'Mond-tot-mond', 'Mond-tot-mond',
		'2026-11-21', '2026-11-21', 'Kasteel de Hooge Vuursche, Baarn', '90', 'taart',
		'Tiramisu taart', 'Dessert', '20:30', 'geaccepteerd', 1175.00,
		97.02, 330.00, current_date - 14, current_date, current_date - 1,
		'demo-lotte-sam-token-20260702', true, now() + interval '14 days',
		now() - interval '1 day', '2026-07-02-v1', 587.50,
		'https://example.com/betaal/demo-lotte-sam', 'paid',
		'{"dayContact":"Sam, +31 6 98 76 54 32","ceremonyContact":"Eva ceremoniemeester, eva.demo@example.com","venueContact":"Locatiemanager: Karin","venueAddress":"Hilversumsestraatweg 14, Baarn","arrivalTime":"Vanaf 18:00","loadingParking":"Laden bij leveranciersingang, daarna parkeren P2","accessNotes":"Geen trap, wel 80 meter lopen over grind","setupSpot":"Achter de zaal, tafel aanwezig","powerWaterCooling":"Stroom en water aanwezig, koele ruimte beschikbaar","timeline":"Diner 18:30, dessertmoment 20:30","servingTimeslot":"20:30-21:00","startSignal":"Ceremoniemeester Eva","finalGuests":"90, definitief 14 dagen vooraf","dietary":"2 glutenvrij, 1 zwanger","serviceMaterials":"Wij nemen servetten en eetgerij mee","weatherPlan":"Binnenlocatie","venueRules":"Externe leveranciers vooraf aanmelden"}',
		now() - interval '1 day', '{"offerte":1,"inkoop":0.5}',
		'Bruiloft met dessertmoment na diner.',
		'Demo: geaccepteerd, aanbetaling betaald, gegevens ingevuld.', 'demo_seed'
	),
	(
		now() - interval '35 days', now() - interval '20 days',
		'Ruben Vermeer', 'ruben.demo@example.com', '', 'Google', 'Google',
		'2026-07-25', '2026-07-25', 'Utrecht', '45', 'hapjes',
		'Tiramisu', 'Avond', '21:00', 'afgewezen', 525.00,
		43.35, 180.00, current_date - 30, current_date - 16, null,
		'', false, null, null, '', null, '', 'not_sent', '{}', null, '{}',
		'Klein feest, budget paste niet.',
		'Demo: afgewezen door klant.', 'demo_seed'
	);

COMMIT;

SELECT created_at::date AS binnen, name, event_date, status, origin
FROM deals
WHERE origin = 'demo_seed'
ORDER BY created_at DESC;
