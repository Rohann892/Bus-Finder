const stopTranslations = {
    // Bengali -> English Exact Stop Names
    "হাওড়া": "Howrah Station",
    "এসপ্ল্যানেড": "Esplanade",
    "শিয়ালদহ": "Sealdah",
    "পার্ক স্ট্রিট": "Park Street",
    "গড়িয়াহাট": "Gariahat",
    "সল্টলেক": "Saltlake",

    // Hindi -> English Exact Stop Names
    "हावड़ा": "Howrah Station",
    "एस्प्लेनेड": "Esplanade",
    "सियालदह": "Sealdah",
    "पार्क स्ट्रीट": "Park Street",

    // Normalizations for English Inputs
    "Howrah": "Howrah Station",
    "Salt Lake": "Saltlake"
};

function translateStop(stopName) {
    if (!stopName) return stopName;
    // Normalize casing and spaces
    const trimmed = stopName.trim();
    if (stopTranslations[trimmed]) {
        return stopTranslations[trimmed];
    }
    // Check with titlecase / alternate spelling mapping
    const lowercase = trimmed.toLowerCase();
    if (lowercase === "howrah") return "Howrah Station";
    if (lowercase === "salt lake" || lowercase === "saltlake") return "Saltlake";

    return trimmed;
}

function detectLanguage(text) {
    // Bengali unicode range
    if (/[\u0980-\u09FF]/.test(text)) return 'bengali';
    // Hindi unicode range
    if (/[\u0900-\u097F]/.test(text)) return 'hindi';
    return 'english';
}

export { translateStop, detectLanguage };