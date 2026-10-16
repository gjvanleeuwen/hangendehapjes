"""Everything a run is tuned by: market, seeds, vocabulary, limits, scoring.

Adapted from the BandWeb pipeline for Hangende Hapjes (live walking catering,
Hilversum). The vocabulary maps Dutch search phrases onto our products,
occasions and places so every keyword lands on one of our pages, a new post,
a new service/location page, or "skip".
"""

from __future__ import annotations

from pathlib import Path

ROOT = Path(__file__).resolve().parent
REPO = ROOT.parent.parent
OUTPUT = REPO / "data" / "seo-research"  # gitignored (/data)
ENV_FILE = REPO / ".env"
GSC_DIR = REPO / "data" / "gsc"

# --- Market -----------------------------------------------------------------
LOCATION_CODE = 2528  # Netherlands
LANGUAGE_CODE = "nl"
OUR_DOMAIN = "hangendehapjes.nl"
SITE_URL = "https://hangendehapjes.nl"
USER_AGENT = "Mozilla/5.0 (compatible; HangendeHapjesSeoResearch/0.1; +https://hangendehapjes.nl)"
# Hilversum centre, for Maps SERPs and localised organic SERPs ("lat,lng,zoom").
HILVERSUM_COORD = "52.2240,5.1760,13z"

# --- Vocabulary -------------------------------------------------------------
# product key → aliases. Order matters only for display; matching is longest alias first.
PRODUCTS: dict[str, list[str]] = {
    "tiramisu": ["tiramisu", "tiramisu taart", "tiramisu toren", "tiramisu bar", "tiramisutaart",
                 "tiramisu bruidstaart", "tiramisu taart bruiloft", "tiramisu trouwtaart"],
    "millefoglie": ["millefoglie", "mille foglie", "millefeuille", "mille feuille", "millefoglie taart",
                    "italiaanse bruidstaart", "italiaanse taart", "millefoglie bruidstaart", "millefeuille bruidstaart"],
    "bruidstaart": ["bruidstaart", "bruidstaarten", "trouwtaart", "weddingcake", "wedding cake",
                    "bruidstaart klassiek", "klassieke bruidstaart", "taart bruiloft", "aansnijtaart"],
    "dessert": ["dessert", "desserts", "dessertbuffet", "toetjes", "toetje", "nagerecht", "zoete tafel",
                "sweet table", "dessert catering"],
    "burrata": ["burrata", "burrata bar", "burratabar", "mozzarella bar"],
    "live": ["live cooking", "live catering", "walking dinner", "walking diner", "food entertainment",
             "foodentertainment", "walking act", "eetbare act", "culinaire act", "live koken",
             "show cooking", "chef aan huis", "kok aan huis", "rondloop", "rondlopend", "bediening rondlopend"],
    "hapjes": ["hapjes", "hapje", "borrelhapjes", "hartige hapjes", "italiaanse hapjes", "fingerfood",
               "finger food", "amuse", "amuses", "bites", "borrelhapje", "luxe hapjes", "warme hapjes",
               "koude hapjes", "hapjes catering", "receptiehapjes", "bittergarnituur", "tapas", "antipasti"],
    "catering": ["catering", "cateraar", "cateringbedrijf", "traiteur", "partyservice", "foodtruck",
                 "food truck", "eventcatering"],
}
# Products we already own at #1-3 (Gijs, 2026-10-16): protect, don't push.
PROTECT_PRODUCTS = {"tiramisu", "millefoglie"}
# Where Gijs wants growth (2026-10-16): weighted up in scoring.
FOCUS_PRODUCTS = {"hapjes", "live", "bruidstaart", "catering", "burrata"}

OCCASIONS: dict[str, list[str]] = {
    "bruiloft": ["bruiloft", "bruiloften", "trouwen", "trouwfeest", "trouwerij", "huwelijk", "wedding",
                 "trouwdag", "bruids"],
    "receptie": ["receptie", "borrel", "aperitief", "netwerkborrel", "openingsborrel"],
    "bedrijfsfeest": ["bedrijfsfeest", "personeelsfeest", "zakelijk", "zakelijke", "bedrijfsevenement",
                      "bedrijfsuitje", "kerstborrel", "kerstfeest", "personeelsuitje", "evenement", "event",
                      "events", "congres", "bedrijfsbijeenkomst"],
    "feest": ["feest", "feestje", "verjaardag", "verjaardagsfeest", "jubileum", "party", "tuinfeest",
              "abraham", "sarah", "communie", "babyshower"],
}

PLACES: list[str] = ["hilversum", "het gooi", "gooi", "bussum", "laren", "blaricum", "huizen", "naarden",
                     "baarn", "soest", "amersfoort", "utrecht", "amsterdam", "weesp", "loosdrecht",
                     "maarssen", "eemnes", "nederhorst den berg", "kortenhoef", "ankeveen", "muiden",
                     "gooise meren", "wijdemeren", "de bilt", "zeist", "almere", "nieuwegein"]
PROVINCES = ["noord-holland", "utrecht provincie", "flevoland", "randstad"]
# Places within an honest service area for a location page today.
NEAR_PLACES = {"hilversum", "het gooi", "gooi", "bussum", "laren", "blaricum", "huizen", "naarden",
               "baarn", "soest", "loosdrecht", "weesp", "eemnes", "kortenhoef", "ankeveen",
               "gooise meren", "wijdemeren", "nederhorst den berg", "muiden"}

COMMERCIAL = ["bestellen", "huren", "inhuren", "boeken", "kosten", "prijs", "prijzen", "tarief",
              "op locatie", "aan huis", "per persoon", "offerte", "laten maken"]
QUESTION_WORDS = ["wat", "hoe", "hoeveel", "wanneer", "waar", "welke", "wie", "waarom", "kan", "moet"]
PRICE_WORDS = ["kosten", "kost", "prijs", "prijzen", "tarief", "tarieven", "goedkoop", "budget", "per persoon"]

# A keyword is only kept when it is about food/catering for an event.
RELEVANT_PATTERN = (
    r"\b(hapjes?|borrelhapjes?|fingerfood|finger food|amuses?|bites|catering\w*|cateraar\w*|traiteur|"
    r"partyservice|tiramisu\w*|millefog\w*|mille ?fog\w*|mille ?feuille\w*|millefeuille\w*|bruidstaart\w*|"
    r"trouwtaart\w*|wedding ?cake|taart\w*|dessert\w*|toetjes?|nagerecht\w*|burrata\w*|walking din\w*|"
    r"live cooking|live koken|food ?entertainment|walking act|foodtruck\w*|food truck|bittergarnituur|"
    r"tapas|antipasti|sweet table|zoete tafel|show ?cooking|chef aan huis|kok aan huis|buffet)\b"
)
# The intent filter: supermarket, delivery, DIY, nutrition. Always skip.
DIY_PATTERN = (
    r"\b(recepte?n?|recipe|zelf maken|zelf|maken|bakken|makkelijke?|simpele?|snelle?|supermarkt|ah|"
    r"albert heijn|jumbo|lidl|aldi|hema|thuisbezorgd|bezorgen|bezorgd|bezorging|afhalen|"
    r"kcal|calorie\w*|gezonde?|airfryer|oven|kerstpakket|kopen|online|goedkope?|goedkoop|hapjespan\w*|"
    r"combipan|box|pakket|schotel|hapjesschaal|hapjesschalen|kinderfeestje|kinderen|kids|wikipedia|"
    r"betekenis|uitspraak|engels|in english|vertaling|kruiswoord\w*|calorieen|voedingswaarde|"
    r"bewaren|houdbaar\w*|invriezen|ontdooien|zonder ei|vegan recept|mascarpone|lange vingers)\b"
)
# Not catering at all (jobs, courses, unrelated "taart" senses, venues, shops).
NEGATIVE_PATTERN = (
    r"\b(vacatures?|cursus\w*|opleiding\w*|workshop\w*|baan|banen|stage|horeca opleiding|"
    r"verjaardagstaart|kindertaart|taartenwinkel|bakker\w*|banketbakker\w*|taartjes|"
    r"gebak|schilderij|kleurplaat|tekening|emoji|spel|game)\b"
)

# --- Seeds (phase 1) ----------------------------------------------------------
# product → occasions it is seeded with (bruidstaart × bedrijfsfeest is not a search).
SEED_PAIRS: dict[str, list[str]] = {
    "hapjes": ["bruiloft", "receptie", "bedrijfsfeest", "feest"],
    "borrelhapjes": ["bruiloft", "bedrijfsfeest"],
    "fingerfood": ["bruiloft", "receptie"],
    "catering": ["bruiloft", "receptie", "bedrijfsfeest", "feest"],
    "live cooking": ["bruiloft", "bedrijfsfeest", "feest"],
    "walking dinner": ["bruiloft", "bedrijfsfeest"],
    "dessert": ["bruiloft"],
    "burrata": ["bruiloft"],
}
# GSC queries that are navigational / brand noise, never seeds.
GSC_SEED_SKIP = r"\b(hangende|2 hapjes|twee hapjes|the tiramisu bar|hapjes nl)\b"
SEED_EXTRA = [
    # product × modifier
    "klassieke bruidstaart", "bruidstaart prijs", "bruidstaart bestellen", "bruidstaart op maat",
    "bruidstaart 50 personen", "bruidstaart 100 personen", "wat kost een bruidstaart",
    "tiramisu taart bestellen", "tiramisu bruidstaart", "millefoglie bruidstaart", "italiaanse bruidstaart",
    "italiaanse hapjes", "hartige hapjes", "luxe hapjes", "hapjes op locatie", "catering op locatie",
    "live catering", "food entertainment", "walking act", "foodtruck bruiloft", "dessertbuffet",
    "hapjes catering", "event catering", "burrata bar",
    # catering × place
    "catering hilversum", "catering het gooi", "bedrijfsfeest hilversum", "catering bussum",
    "catering laren", "catering huizen", "catering baarn", "catering soest", "catering utrecht",
    "catering amsterdam", "bruidstaart hilversum", "cateraar hilversum",
    # questions
    "hoeveel hapjes per persoon", "wat kost catering per persoon", "wat kost catering bruiloft",
    "live cooking bruiloft", "catering bruiloft kosten", "hapjes receptie bruiloft",
]
SUGGESTION_LIMIT = 100  # items per seed (billed per item returned)
RELATED_SEEDS = ["hapjes bruiloft", "catering bruiloft", "klassieke bruidstaart", "live cooking bruiloft",
                 "hapjes receptie", "catering bedrijfsfeest", "walking dinner bruiloft", "catering hilversum"]
RELATED_LIMIT = 150
GSC_SEED_MIN_IMPRESSIONS = 20

# Terms from docs/_TASKS/seo-keyword-targets.md tiers that need a SERP + volume even when
# keyword discovery doesn't surface them.
EXTRA_SERP_KEYWORDS = [
    "italiaanse hapjes", "event catering", "catering events", "wedding bites", "catering hapjes",
    "party catering", "partyservice", "catering aan huis", "catering thuis", "foodtruck aan huis",
    "italiaans buffet", "catering fingerfood", "amuse bruiloft", "amuse receptie", "catering service",
    "catering bedrijf", "catering het gooi", "catering hilversum", "bedrijfsfeest hilversum",
    "catering rotterdam", "catering den haag", "originele catering bedrijfsfeest", "live catering",
    "walking dinner bruiloft", "live cooking bruiloft", "live cooking catering", "dessert catering",
    "bruidstaart klassiek", "bruidstaart 25 personen", "bruidstaart 100 personen", "kleine bruidstaart",
    "bruidstaart op maat", "bruidstaart proeverij", "catering bedrijfsfeest", "catering feest",
    "hapjes receptie", "catering receptie", "receptie hapjes bruiloft",
]

# --- Phase limits ---------------------------------------------------------------
SERP_TOP_N = 220  # keywords by volume
SERP_DEPTH = 20  # top 20, so we see ourselves on page 2
COMPETITOR_DOMAINS = 10
RANKED_LIMIT = 500
CONTENT_TOP_N = 5  # ranking URLs fetched per page-target keyword
CONTENT_MAX_PAGES = 200
CONTENT_TARGETS_PER_PAGE = 5
BACKLINK_SUMMARY_DOMAINS = 10
BACKLINK_REFERRING_DOMAINS = 10
REFERRING_LIMIT = 300
MAPS_QUERIES = ["catering hilversum", "catering het gooi", "bedrijfsfeest catering hilversum",
                "bruidstaart hilversum", "hapjes catering hilversum", "cateraar hilversum",
                "catering bussum", "catering laren"]
MAPS_DEPTH = 20
# Organic SERPs re-run from Hilversum coordinates (local pack differs from the NL-wide SERP).
LOCAL_ORGANIC = ["catering hilversum", "catering het gooi", "bedrijfsfeest hilversum", "cateraar hilversum",
                 "hapjes catering hilversum", "bruidstaart hilversum"]

# Domains that rank for everything and are never a peer.
GENERIC_DOMAINS = {
    "youtube.com", "www.youtube.com", "facebook.com", "www.facebook.com", "instagram.com",
    "www.instagram.com", "nl.wikipedia.org", "en.wikipedia.org", "www.tiktok.com", "www.pinterest.com",
    "nl.pinterest.com", "www.marktplaats.nl", "www.linkedin.com", "nl.linkedin.com", "www.reddit.com",
    "www.google.com", "maps.google.com", "www.ah.nl", "www.jumbo.com", "www.thuisbezorgd.nl",
    "www.lidl.nl", "www.allerhande.nl", "www.leukerecepten.nl", "www.24kitchen.nl", "www.smulweb.nl",
    "www.voedingscentrum.nl", "www.plus.nl", "www.dirk.nl", "www.hema.nl", "www.bol.com",
    "www.ubereats.com", "forum.fok.nl", "www.zwangerschapspagina.nl", "food52.com",
    "www.libelle-lekker.be", "njam.tv", "deliciousmagazine.nl", "jaimyskitchen.nl",
}
GENERIC_PATTERN = r"(^|\.)(pinterest\.[a-z.]+|tripadvisor\.[a-z.]+)$"
# Recipe / food-media sites. Never peers; a SERP where >= RECIPE_SERP_MIN of the top 10
# are recipe results is DIY intent, whatever the keyword looks like.
RECIPE_DOMAINS = {
    "www.laurasbakery.nl", "uitpaulineskeuken.nl", "sterkindekeuken.nl", "www.lekkerensimpel.com",
    "www.projectgezond.nl", "chickslovefood.com", "www.tantefanny.com", "www.kokerellen.be",
    "www.heelhollandbakt.nl", "www.foodiesmagazine.nl", "miljuschka.nl", "www.mindyourfeed.nl",
    "www.hightea.nl", "elienscuisine.be", "toddlecake.nl", "ohmyfoodness.nl", "www.eefkooktzo.nl",
    "www.koopmans.com", "www.sligro.nl", "haust.nl", "familieoverdekook.nl", "www.francescakookt.nl",
    "bettyskitchen.nl", "www.libelle-lekker.be", "deliciousmagazine.nl", "www.leukerecepten.nl",
    "www.allerhande.nl", "www.24kitchen.nl", "www.smulweb.nl", "www.culy.nl", "njam.tv",
    "jaimyskitchen.nl", "anjasfoodblog.nl", "bakken.nl", "www.bakverhalen.nl", "www.keukenliefde.nl",
    "www.baktotaal.nl", "uitpaulineskeuken.nl", "www.thuisbijvera.nl", "www.okokorecepten.nl",
    "www.dekerst.nl", "lekkerensimpel.com", "www.ah.nl", "www.jumbo.com", "hotelvillaflora.nl",
}
RECIPE_URL = r"/(recept|recepten|recipe|recipes)(/|-|$)"
RECIPE_SERP_MIN = 4
# Hand-picked peers for the competitor + backlink steps (the visibility ranking is
# dominated by recipe sites on the big "hapjes" volumes). Concept/live caterers,
# local Hilversum/Gooi caterers, and wedding-cake makers ranking for our focus terms.
PEER_DOMAINS = [
    "eatertainment.nl", "dutchfoodentertainment.nl", "hapjesaanhuis.nl", "fajecatering.nl",
    "www.debuffettenboer.nl", "cateringfabriek.nl", "tiramisuhilversum.nl", "lacasina.nl",
    "droomtaart.nl", "www.sillybakery.nl",
]

# `--sample`: a few cents, to check a real run end to end before the full one.
SAMPLE = {
    "seeds": 3, "suggestion_limit": 30, "related_seeds": 1, "related_limit": 20,
    "serp_top_n": 6, "competitor_domains": 1, "ranked_limit": 30,
    "content_max_pages": 6, "backlink_summary_domains": 2,
    "backlink_referring_domains": 1, "referring_limit": 30, "maps_queries": 1, "local_organic": 1,
}

# --- Hand-picked targets per indexable page (phase 4) ----------------------------
# page key = URL path without leading slash ("" = homepage). NL only.
# Focus pages first: the content step fetches competitor pages in this order (budget-capped).
PAGE_TARGETS: dict[str, list[str]] = {
    "blog/bruidstaart": ["klassieke bruidstaart", "bruidstaart", "bruidstaart bestellen", "wat kost een bruidstaart",
                         "bruidstaart 50 personen", "bruidstaart proeven", "prijs bruidstaart"],
    "": ["hapjes catering", "luxe hapjes", "walking dinner", "live cooking", "catering bruiloft",
         "hapjes bruiloft", "catering op locatie", "food entertainment"],
    "catering/hilversum": ["catering hilversum", "cateraar hilversum", "catering het gooi",
                           "bedrijfsfeest hilversum", "hapjes catering hilversum"],
    "blog/hoeveel-hapjes-per-persoon": ["hoeveel hapjes per persoon", "hoeveel hapjes per persoon receptie",
                                        "hoeveel hapjes per persoon bruiloft", "wat kost catering per persoon"],
    "blog/burrata-catering": ["burrata bar", "burrata catering", "burrata bruiloft"],
    "blog/tiramisu-bruiloft": ["tiramisu bruiloft", "tiramisu bruidstaart", "tiramisu taart bestellen",
                               "tiramisu toren"],
    "blog/italiaanse-bruidstaart": ["italiaanse bruidstaart", "millefoglie bruidstaart", "millefoglie taart"],
}

# --- Scoring -----------------------------------------------------------------------
# Bare national head terms owned by delivery platforms / aggregators (seo-keyword-targets.md Tier 4).
HEAD_TERMS = {"catering", "hapjes", "borrelhapjes", "snacks", "borrel", "buffet", "dessert", "taart"}
# Reviewed by hand (2026-10-16 SERP): the result type doesn't match a walking live act.
INTENT_MISMATCH = {
    "walking dinner": "SERP = culinary walking tours past restaurants (Rotterdam, Amsterdam), not event catering",
    "live cooking": "SERP = Van der Valk live-cooking buffets (restaurant visit), not event catering",
    "hapjes catering": "SERP = delivered hapjes trays / buffets (hapjesaanhuis, dsrfood)",
    "hapjes receptie": "SERP = recipes for hosts making their own",
}
MIN_VOLUME = 10  # small niche: Google's lowest bucket is 10
INTENT_WEIGHT = {"transactional": 1.0, "commercial": 1.0, "informational": 0.6,
                 "navigational": 0.1, None: 0.7}
FOCUS_WEIGHT = 1.5
PROTECT_POSITION = 3.5  # GSC average position at or better than this = protect
# Rough organic CTR by position (1-10), for volume-weighted visibility.
CTR = [0.28, 0.15, 0.10, 0.07, 0.05, 0.04, 0.03, 0.025, 0.02, 0.018]
STRONG_DOMAIN_REFERRING = 150  # referring domains at which a site counts as strong
QUESTION_MATCH = 0.55  # fuzzy match threshold for "already answered"
QUESTION_NEAR_MISS = 0.40
# Domain-rank thresholds (DataForSEO backlinks rank, 0-1000) for "reachable".
RANK_NOW = 120  # we can beat sites below this with strong content + first links
RANK_LATER = 220  # ...and these with ~50-100 good referring domains

# --- Cost estimates for --dry-run / the budget cap (USD, conservative) ------------
COST = {
    "labs_task": 0.012, "labs_item": 0.00012,
    "serp_task": 0.0006, "serp_task_depth20": 0.0012, "maps_task": 0.0012,
    "intent_task": 0.001, "intent_item": 0.0001,
    "backlinks_task": 0.024, "backlinks_row": 0.000036,
}
DEFAULT_MAX_SPEND = 5.0
