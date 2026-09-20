// mobile/alertTemplates.js
// Multilingual alert message templates and builder for BhuRakshak / NER-SHIELD

export const ALERT_LEVELS = {
  LOW: 'LOW',
  MODERATE: 'MODERATE',
  HIGH: 'HIGH',
  CRITICAL: 'CRITICAL',
};

export const MULTILINGUAL_TEMPLATES = {
  [ALERT_LEVELS.HIGH]: {
    en: (location) =>
      `[BHURAKSHAK ALERT] High landslide risk detected near ${location}. Avoid steep slopes and unstable roads. Stay tuned for official updates.`,
    hi: (location) =>
      `[भू-रक्षक चेतावनी] ${location} के पास भूस्खलन का उच्च जोखिम। ढलानों और असुरक्षित सड़कों से बचें। स्थानीय निर्देशों का पालन करें।`,
    as: (location) =>
      `[ভূ-ৰক্ষক সতৰ্কবাৰ্তা] ${location}ৰ কাষত খহি পৰাৰ স্থান বৃদ্ধি পাইছে। পাহাৰীয়া ৰাস্তা পৰিহাৰ কৰক। সাৱধানে থাকক।`,
  },
  [ALERT_LEVELS.CRITICAL]: {
    en: (location) =>
      `[EMERGENCY WARNING - BHURAKSHAK] Critical landslide threat in ${location}! Move to safer ground immediately and clear major transit corridors.`,
    hi: (location) =>
      `[आपातकालीन चेतावनी - भू-रक्षक] ${location} में गंभीर भूस्खलन का खतरा! तुरंत सुरक्षित स्थान पर जाएं और मुख्य रास्तों को खाली रखें।`,
    as: (location) =>
      `[জৰুৰীকালীন সতৰ্কবাৰ্তা - ভূ-ৰক্ষক] ${location}ত জৰুৰী ভূমিস্খলনৰ আশঙ্কা! লগে লগে সুৰক্ষিত স্থানলৈ যাওঁক।`,
  },
};

/**
 * Generates formatted alert notifications based on risk level and target channel.
 * @param {string} level - Risk level ('HIGH' | 'CRITICAL')
 * @param {string} locationName - Name of affected district/zone
 * @param {string} lang - Selected language code ('en' | 'hi' | 'as')
 */
export const buildCitizenAlert = (level, locationName, lang = 'en') => {
  const levelTemplates = MULTILINGUAL_TEMPLATES[level];
  if (!levelTemplates) {
    return `[BHURAKSHAK NOTICE] Advisory issued for ${locationName}. Drive carefully in hilly terrain.`;
  }
  const formatter = levelTemplates[lang] || levelTemplates['en'];
  return formatter(locationName);
};

/**
 * Builds payload structure for Field Officer App Push notifications.
 */
export const buildFieldOfficerAlert = (reportData) => {
  return {
    title: `[FIELD DISPATCH] ${reportData.severity || 'HIGH'} Hazard Reported`,
    body: `New hazard reported at Lat: ${reportData.latitude}, Lon: ${reportData.longitude}. Type: ${reportData.observation_type}. Inspection required.`,
    data: {
      reportId: reportData.id,
      coordinates: [reportData.longitude, reportData.latitude],
      type: reportData.observation_type,
    },
  };
};