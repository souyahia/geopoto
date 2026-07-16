import type { LocalizedAliases } from "../../src/geo-language.ts";

export interface CountryAliasesConfig {
  capital?: LocalizedAliases;
  name?: LocalizedAliases;
}

/**
 * Developer-authored accepted answers for text questions, in addition to the
 * canonical localized name/capital generated from the data sources.
 *
 * The canonical answer is always accepted, so it does not need to be repeated
 * here. Only list extra spellings, abbreviations, or alternative names.
 *
 * Every accepted answer (canonical and aliases) is matched case, accent, space
 * and punctuation insensitively (see `normalizeQuizzTextAnswer` in the mobile
 * app), so there is no need to add variants that only differ by those.
 *
 * Aliases must not collide across countries once normalized. The generation
 * invariants enforce this (see `validateAnswerAliasUniqueness`).
 */
export const COUNTRY_ALIASES_CONFIGS: Readonly<
  Record<string, CountryAliasesConfig>
> = {
  AD: {
    name: {
      es: ["Principado de Andorra"],
    },
    capital: {
      es: ["Andorra la Vella"],
    },
  },
  AE: {
    name: {
      de: ["VAE"],
      en: ["UAE", "Emirates"],
      es: ["EAU", "Emiratos Arabes"],
      fr: ["EAU"],
      it: ["EAU"],
      pt: ["EAU"],
    },
    capital: {
      es: ["Abu Dabi"],
      fr: ["Abu Dhabi", "Abou Dhabi"],
      pt: ["Abu Dabi"],
    },
  },
  AF: {
    capital: {
      fr: ["Kabul"],
    },
  },
  AG: {
    capital: {
      de: ["St. John's"],
      en: ["St. John's"],
      es: ["Saint John's", "San Juan"],
      pt: ["Saint John's"],
    },
  },
  AL: {
    capital: {
      en: ["Tiranë"],
    },
  },
  AM: {
    capital: {
      de: ["Eriwan", "Yerevan"],
      en: ["Erevan"],
      es: ["Yereván"],
      fr: ["Yerevan"],
      it: ["Yerevan"],
      pt: ["Erevan", "Yerevan"],
    },
  },
  AT: {
    name: {
      de: ["Oesterreich"],
    },
    capital: {
      en: ["Wien"],
      es: ["Vienna"],
      fr: ["Vienna"],
      it: ["Wien"],
    },
  },
  AU: {
    capital: {
      pt: ["Canberra"],
    },
  },
  AZ: {
    name: {
      de: ["Azerbaidschan"],
      es: ["Azerbaijan"],
      it: ["Azerbaigian"],
      pt: ["Azerbaijão"],
    },
    capital: {
      fr: ["Baku"],
      pt: ["Bacu"],
    },
  },
  BA: {
    name: {
      de: ["Bosnien", "Bosnien-Herzegowina"],
      en: ["Bosnia", "Bosnia-Herzegovina"],
      es: ["Bosnia"],
      fr: ["Bosnie"],
      it: ["Bosnia"],
      pt: ["Bosnia"],
    },
  },
  BD: {
    name: {
      pt: ["Bangladeche"],
    },
    capital: {
      de: ["Dacca"],
      en: ["Dacca"],
      es: ["Dhaka", "Dacca"],
      fr: ["Dhaka"],
      it: ["Dhaka"],
      pt: ["Dhaka", "Dacca"],
    },
  },
  BE: {
    capital: {
      de: ["Bruessel"],
      en: ["Bruxelles"],
      it: ["Brussels"],
    },
  },
  BF: {
    name: {
      de: ["Obervolta"],
      en: ["Upper Volta"],
      es: ["Alto Volta"],
      fr: ["Burkina", "Haute-Volta"],
      it: ["Alto Volta"],
      pt: ["Burquina Faso"],
    },
    capital: {
      es: ["Ouagadougou"],
      pt: ["Ouagadougou"],
    },
  },
  BH: {
    name: {
      es: ["Baréin"],
      it: ["Bahrain"],
      pt: ["Barém", "Bahrain"],
    },
  },
  BI: {
    capital: {
      es: ["Gitega"],
      pt: ["Gitega"],
    },
  },
  BJ: {
    name: {
      de: ["Dahomey"],
      en: ["Dahomey"],
      es: ["Dahomey"],
      fr: ["Dahomey"],
      it: ["Dahomey"],
      pt: ["Benim"],
    },
  },
  BN: {
    name: {
      de: ["Brunei Darussalam"],
      en: ["Brunei Darussalam"],
      es: ["Brunéi Darussalam"],
      fr: ["Brunei Darussalam"],
      it: ["Brunei Darussalam"],
    },
  },
  BO: {
    name: {
      es: ["Estado Plurinacional de Bolivia"],
    },
    capital: {
      de: ["La Paz"],
      en: ["La Paz"],
      es: ["La Paz"],
      fr: ["La Paz"],
    },
  },
  BR: {
    name: {
      es: ["Brazil"],
    },
  },
  BS: {
    name: {
      en: ["The Bahamas"],
    },
    capital: {
      es: ["Nassau"],
    },
  },
  BT: {
    capital: {
      de: ["Thimbu"],
      es: ["Thimphu"],
      fr: ["Thimphu"],
      pt: ["Thimphu"],
    },
  },
  BW: {
    name: {
      de: ["Botsuana"],
      es: ["Botsuana"],
      pt: ["Botsuana"],
    },
  },
  BY: {
    name: {
      de: ["Belarus", "Weissrussland"],
      en: ["Belorussia", "Byelorussia"],
      es: ["Belarús"],
      fr: ["Bélarus"],
      it: ["Belarus"],
      pt: ["Belarus"],
    },
  },
  BZ: {
    name: {
      en: ["British Honduras"],
    },
  },
  CA: {
    capital: {
      pt: ["Otava"],
    },
  },
  CD: {
    name: {
      de: [
        "DR Kongo",
        "Demokratische Republik Kongo",
        "Kongo-Kinshasa",
        "Zaire",
      ],
      en: [
        "DRC",
        "Democratic Republic of the Congo",
        "Congo Kinshasa",
        "Democratic Republic of Congo",
        "Zaire",
      ],
      es: [
        "RDC",
        "RD Congo",
        "Congo Kinsasa",
        "Republica Democratica del Congo",
        "Zaire",
      ],
      fr: [
        "République Démocratique du Congo",
        "RD Congo",
        "RDC",
        "Congo Kinshasa",
        "Zaïre",
      ],
      it: [
        "RDC",
        "RD Congo",
        "Repubblica Democratica del Congo",
        "Congo Kinshasa",
        "Zaire",
      ],
      pt: ["RDC", "RD Congo", "Congo Kinshasa", "Zaire"],
    },
    capital: {
      es: ["Kinshasa"],
      pt: ["Kinshasa"],
    },
  },
  CF: {
    name: {
      en: ["CAR"],
      fr: ["Centrafrique", "République d'Afrique Centrale"],
      it: ["Centrafrica"],
    },
  },
  CG: {
    name: {
      de: ["Republik Kongo", "Kongo-Brazzaville"],
      en: ["Congo Brazzaville", "Congo Republic", "Republic of Congo"],
      es: ["Congo Brazzaville", "Republica del Congo"],
      fr: ["République du Congo", "Congo Brazzaville"],
      it: ["Repubblica del Congo", "Congo Brazzaville"],
      pt: ["Congo Brazzaville", "Republica do Congo"],
    },
    capital: {
      pt: ["Brazzaville"],
    },
  },
  CH: {
    name: {
      fr: ["Confédération Suisse"],
    },
    capital: {
      en: ["Berne"],
      fr: ["Bern"],
    },
  },
  CI: {
    name: {
      de: ["Côte d'Ivoire", "Elfenbeinkueste"],
      en: ["Cote d'Ivoire"],
      es: ["Côte d'Ivoire"],
      it: ["Côte d'Ivoire"],
      pt: ["Cote d'Ivoire"],
    },
    capital: {
      es: ["Yamoussoukro", "Abiyán", "Abidjan"],
      pt: ["Iamussucro"],
    },
  },
  CL: {
    capital: {
      de: ["Santiago"],
      en: ["Santiago de Chile"],
      es: ["Santiago"],
      it: ["Santiago"],
      pt: ["Santiago do Chile"],
    },
  },
  CM: {
    name: {
      en: ["Cameroun"],
    },
    capital: {
      es: ["Yaoundé"],
      pt: ["Yaoundé"],
    },
  },
  CN: {
    name: {
      de: ["Volksrepublik China", "VR China"],
      en: ["People's Republic of China", "PRC"],
      es: ["República Popular China"],
      fr: ["République Populaire de Chine"],
      pt: ["República Popular da China"],
    },
    capital: {
      de: ["Beijing"],
      en: ["Peking"],
      es: ["Beijing"],
      fr: ["Beijing"],
      it: ["Beijing"],
      pt: ["Beijing"],
    },
  },
  CR: {
    capital: {
      pt: ["São José"],
    },
  },
  CU: {
    name: {
      de: ["Cuba"],
    },
    capital: {
      de: ["Havana"],
      en: ["La Habana"],
      fr: ["Havane", "Havana"],
      it: ["Avana", "Havana"],
    },
  },
  CV: {
    name: {
      de: ["Cabo Verde", "Kapverden"],
      en: ["Cabo Verde"],
      es: ["Cape Verde"],
      fr: ["Cap Vert", "Cabo Verde"],
      it: ["Cabo Verde"],
    },
  },
  CY: {
    capital: {
      de: ["Nicosia"],
      en: ["Lefkosia"],
    },
  },
  CZ: {
    name: {
      de: ["Tschechische Republik", "Tschechei"],
      en: ["Czech Republic"],
      es: ["Republica Checa"],
      fr: ["République Tchèque"],
      it: ["Repubblica Ceca"],
      pt: ["Republica Checa", "Tchequia", "Republica Tcheca"],
    },
    capital: {
      en: ["Praha"],
    },
  },
  DE: {
    name: {
      de: ["Bundesrepublik Deutschland", "BRD"],
      en: ["Deutschland", "Federal Republic of Germany"],
      es: ["RFA", "República Federal de Alemania"],
      fr: ["RFA", "Deutschland"],
    },
  },
  DJ: {
    name: {
      de: ["Djibouti"],
      es: ["Yibuti"],
      it: ["Djibouti"],
      pt: ["Jibuti"],
    },
    capital: {
      de: ["Djibouti"],
      es: ["Yibuti", "Djibouti"],
      it: ["Djibouti"],
      pt: ["Jibuti"],
    },
  },
  DK: {
    name: {
      de: ["Daenemark"],
    },
    capital: {
      en: ["Kobenhavn"],
      es: ["Copenhagen"],
      fr: ["Copenhagen"],
      it: ["Copenhagen"],
      pt: ["Copenhague"],
    },
  },
  DO: {
    capital: {
      fr: ["Santo Domingo"],
      pt: ["Santo Domingo"],
    },
  },
  EE: {
    capital: {
      es: ["Tallinn"],
    },
  },
  EG: {
    name: {
      de: ["Aegypten"],
      pt: ["Egipto"],
    },
    capital: {
      es: ["Cairo"],
      fr: ["Caire", "Cairo"],
      it: ["Cairo"],
      pt: ["O Cairo"],
    },
  },
  EH: {
    name: {
      en: ["Sahrawi Arab Democratic Republic"],
    },
    capital: {
      en: ["Laayoune"],
      es: ["Laayoune", "Aaiún"],
      fr: ["Laâyoune"],
      it: ["Laayoune"],
    },
  },
  ER: {
    capital: {
      en: ["Asmera"],
      es: ["Asmera"],
    },
  },
  ES: {
    name: {
      en: ["España"],
    },
    capital: {
      pt: ["Madri"],
    },
  },
  ET: {
    name: {
      de: ["Aethiopien"],
      en: ["Abyssinia"],
      fr: ["Abyssinie"],
    },
    capital: {
      de: ["Addis Ababa"],
      en: ["Addis Abeba"],
      es: ["Addis Abeba", "Addis Ababa"],
      fr: ["Addis Ababa"],
      pt: ["Addis Abeba"],
    },
  },
  FI: {
    capital: {
      pt: ["Helsinque", "Helsinki"],
    },
  },
  FJ: {
    name: {
      de: ["Fiji"],
      es: ["Fiji"],
      fr: ["Îles Fidji"],
      it: ["Fiji"],
      pt: ["Ilhas Fiji"],
    },
  },
  FM: {
    name: {
      de: ["Föderierte Staaten von Mikronesien"],
      en: ["Federated States of Micronesia", "FSM"],
      es: ["Estados Federados de Micronesia"],
      fr: ["États fédérés de Micronésie"],
      pt: ["Estados Federados da Micronésia"],
    },
    capital: {
      pt: ["Palikir"],
    },
  },
  GA: {
    name: {
      de: ["Gabon"],
    },
  },
  GB: {
    name: {
      de: ["Großbritannien", "UK", "Grossbritannien"],
      en: [
        "UK",
        "Britain",
        "Great Britain",
        "United Kingdom of Great Britain and Northern Ireland",
      ],
      es: ["RU", "UK", "Gran Bretana", "Inglaterra"],
      fr: ["UK", "Grande-Bretagne"],
      it: ["Gran Bretagna", "UK"],
      pt: ["RU", "Grã-Bretanha", "UK"],
    },
    capital: {
      es: ["London"],
    },
  },
  GD: {
    name: {
      es: ["Granada"],
    },
    capital: {
      de: ["Saint George's"],
      en: ["Saint George's"],
      es: ["Saint George's", "San Jorge"],
      pt: ["Saint George's"],
    },
  },
  GE: {
    capital: {
      de: ["Tbilissi", "Tbilisi"],
      en: ["Tiflis"],
      es: ["Tbilisi"],
      fr: ["Tbilisi"],
      pt: ["Tbilisi", "Tiflis"],
    },
  },
  GH: {
    name: {
      en: ["Gold Coast"],
    },
    capital: {
      es: ["Accra"],
      pt: ["Accra"],
    },
  },
  GM: {
    name: {
      en: ["The Gambia"],
    },
  },
  GN: {
    name: {
      fr: ["Guinée-Conakry"],
      pt: ["Guiné-Conacri"],
    },
    capital: {
      es: ["Conakry"],
      pt: ["Conakry"],
    },
  },
  GQ: {
    name: {
      de: ["Aequatorialguinea"],
    },
    capital: {
      de: ["Malabo"],
      en: ["Malabo", "Oyala"],
      es: ["Malabo"],
      fr: ["Malabo"],
      it: ["Malabo"],
      pt: ["Malabo", "Oyala"],
    },
  },
  GR: {
    name: {
      en: ["Hellas"],
    },
  },
  GT: {
    capital: {
      en: ["Ciudad de Guatemala"],
      es: ["Guatemala"],
      fr: ["Ciudad de Guatemala", "Guatemala City"],
      it: ["Guatemala City"],
    },
  },
  GW: {
    name: {
      es: ["Guinea-Bissau"],
    },
    capital: {
      es: ["Bissau"],
    },
  },
  GY: {
    name: {
      en: ["British Guiana"],
      pt: ["Guyana"],
    },
  },
  HR: {
    capital: {
      it: ["Zagreb"],
      pt: ["Zagrebe"],
    },
  },
  HT: {
    capital: {
      es: ["Port-au-Prince"],
      pt: ["Port-au-Prince"],
    },
  },
  HU: {
    capital: {
      pt: ["Budapest"],
    },
  },
  ID: {
    capital: {
      de: ["Djakarta"],
      en: ["Djakarta"],
      es: ["Jakarta"],
      it: ["Jakarta"],
      pt: ["Jakarta"],
    },
  },
  IE: {
    name: {
      en: ["Republic of Ireland", "Eire"],
      es: ["Eire"],
      fr: ["République d'Irlande", "Éire"],
    },
    capital: {
      it: ["Dublin"],
      pt: ["Dublim"],
    },
  },
  IL: {
    capital: {
      es: ["Jerusalem"],
    },
  },
  IN: {
    name: {
      en: ["Bharat"],
    },
    capital: {
      de: ["New Delhi", "Delhi"],
      en: ["Delhi"],
      es: ["Nueva Deli", "New Delhi"],
      fr: ["Delhi"],
      it: ["New Delhi", "Delhi"],
      pt: ["Nova Delhi"],
    },
  },
  IQ: {
    name: {
      de: ["Iraq"],
      es: ["Iraq"],
      fr: ["Iraq"],
    },
    capital: {
      de: ["Baghdad"],
      es: ["Baghdad"],
      fr: ["Baghdad"],
      pt: ["Bagdad", "Bagdade"],
    },
  },
  IR: {
    name: {
      de: ["Persien"],
      en: ["Persia"],
      es: ["Persia"],
      fr: ["Perse"],
      pt: ["Ira", "Pérsia"],
    },
    capital: {
      de: ["Tehran"],
      en: ["Teheran"],
      fr: ["Tehran"],
      it: ["Tehran"],
      pt: ["Teerã", "Tehran", "Teheran"],
    },
  },
  IS: {
    capital: {
      es: ["Reykjavik", "Reykiavik"],
      pt: ["Reiquiavique"],
    },
  },
  IT: {
    name: {
      en: ["Italia"],
    },
    capital: {
      en: ["Roma"],
    },
  },
  JM: {
    name: {
      de: ["Jamaica"],
    },
  },
  JO: {
    capital: {
      es: ["Amman"],
      pt: ["Amman"],
    },
  },
  JP: {
    name: {
      en: ["Nippon", "Nihon"],
    },
    capital: {
      de: ["Tokyo"],
      en: ["Tokio"],
      es: ["Tokyo"],
      it: ["Tokio"],
      pt: ["Tokyo"],
    },
  },
  KE: {
    name: {
      de: ["Kenya"],
      es: ["Kenya"],
      it: ["Kenia"],
    },
  },
  KG: {
    name: {
      de: ["Kirgistan", "Kirgisien"],
      en: ["Kyrgyz Republic"],
      es: ["Kirguistán", "Kirguizstán"],
      fr: ["Kirghizie"],
      it: ["Kirghizia"],
      pt: ["Quirguízia"],
    },
    capital: {
      de: ["Bishkek"],
      en: ["Frunze"],
      es: ["Bishkek"],
      fr: ["Bishkek"],
      it: ["Bishkek"],
      pt: ["Bishkek", "Bichkek"],
    },
  },
  KH: {
    name: {
      en: ["Kampuchea"],
      es: ["Cambodia", "Kampuchea"],
      it: ["Kampuchea"],
    },
    capital: {
      es: ["Phnom Penh"],
    },
  },
  KI: {
    capital: {
      de: ["Tarawa"],
      en: ["Tarawa"],
      es: ["Tarawa", "South Tarawa"],
      fr: ["Tarawa"],
      it: ["Tarawa"],
      pt: ["Tarawa"],
    },
  },
  KM: {
    name: {
      es: ["Islas Comoras"],
      it: ["Isole Comore"],
      pt: ["Comoros", "Ilhas Comores"],
    },
  },
  KN: {
    name: {
      de: ["Saint Kitts und Nevis"],
      en: ["Saint Christopher and Nevis", "St. Kitts and Nevis"],
      es: [
        "Saint Kitts y Nevis",
        "San Cristóbal y Nevis",
        "Saint Kitts and Nevis",
      ],
      fr: ["Saint-Kitts-et-Nevis"],
      it: ["San Cristoforo e Nevis"],
      pt: ["São Cristóvão e Neves", "Saint Kitts e Nevis"],
    },
  },
  KP: {
    name: {
      en: ["DPRK", "Democratic People's Republic of Korea"],
      fr: ["RPDC"],
    },
    capital: {
      de: ["Pjoengjang", "Pyongyang"],
      es: ["Pyongyang"],
      pt: ["Pionguiangue"],
    },
  },
  KR: {
    name: {
      de: ["Suedkorea"],
      en: ["Republic of Korea", "ROK"],
      fr: ["République de Corée"],
      pt: ["República da Coreia"],
    },
    capital: {
      es: ["Seoul"],
      it: ["Seoul"],
      pt: ["Seoul"],
    },
  },
  KW: {
    name: {
      de: ["Kuweit"],
      fr: ["Kuwait"],
      pt: ["Coveite"],
    },
    capital: {
      de: ["Kuwait-Stadt"],
      es: ["Kuwait", "Al Kuwait"],
      fr: ["Kuwait City"],
      it: ["Kuwait City"],
      pt: ["Coveite", "Cidade do Kuwait"],
    },
  },
  KZ: {
    name: {
      es: ["Kazajstán", "Kazakhstan"],
    },
    capital: {
      de: ["Nur-Sultan"],
      en: ["Nur-Sultan"],
      fr: ["Nur-Sultan", "Noursoultan"],
      it: ["Nur-Sultan"],
      pt: ["Nur-Sultan"],
    },
  },
  LA: {
    name: {
      en: ["Lao PDR"],
    },
    capital: {
      es: ["Vientiane"],
      pt: ["Vientiane"],
    },
  },
  LB: {
    capital: {
      en: ["Beyrouth"],
      pt: ["Beirut"],
    },
  },
  LC: {
    name: {
      de: ["Saint Lucia"],
      en: ["St. Lucia"],
    },
  },
  LK: {
    name: {
      de: ["Ceylon"],
      en: ["Ceylon"],
      es: ["Ceilán", "Ceylan"],
      fr: ["Ceylan"],
      pt: ["Ceilão"],
    },
    capital: {
      de: ["Colombo", "Kotte"],
      en: ["Colombo", "Kotte"],
      es: ["Colombo", "Kotte"],
      fr: ["Colombo"],
      it: ["Colombo", "Kotte"],
      pt: ["Colombo", "Sri Jayawardenapura Kotte"],
    },
  },
  LS: {
    name: {
      es: ["Lesoto"],
      pt: ["Lesotho"],
    },
  },
  LT: {
    capital: {
      es: ["Vilnius"],
      pt: ["Vilna"],
    },
  },
  LU: {
    name: {
      de: ["Luxembourg"],
    },
    capital: {
      de: ["Luxemburg-Stadt", "Luxembourg"],
      en: ["Luxembourg City"],
      fr: ["Luxembourg-Ville"],
    },
  },
  LY: {
    capital: {
      de: ["Tripoli"],
    },
  },
  MA: {
    capital: {
      pt: ["Rabate"],
    },
  },
  MC: {
    name: {
      it: ["Monaco"],
    },
    capital: {
      en: ["Monaco City"],
      fr: ["Monaco"],
    },
  },
  MD: {
    name: {
      de: ["Moldau", "Republik Moldau"],
      es: ["Moldova"],
      fr: ["Moldova"],
      it: ["Moldova"],
      pt: ["Moldova"],
    },
    capital: {
      de: ["Chișinău", "Kischinjow"],
      en: ["Kishinev"],
      es: ["Kishinev", "Kishinov"],
      pt: ["Quixinau", "Kishinev"],
    },
  },
  ME: {
    capital: {
      en: ["Titograd"],
    },
  },
  MG: {
    capital: {
      de: ["Tananarive"],
      en: ["Tananarive"],
      es: ["Tananarive"],
      fr: ["Tananarive"],
      it: ["Tananarive"],
      pt: ["Tananarive"],
    },
  },
  MK: {
    name: {
      de: ["Mazedonien"],
      en: ["Macedonia", "FYROM"],
      es: ["Macedonia", "North Macedonia"],
      fr: ["Macédoine"],
      it: ["Macedonia"],
      pt: ["Macedónia"],
    },
    capital: {
      es: ["Skopje", "Skoplje"],
      pt: ["Escópia"],
    },
  },
  ML: {
    capital: {
      pt: ["Bamaco"],
    },
  },
  MM: {
    name: {
      de: ["Birma", "Burma"],
      en: ["Burma"],
      es: ["Birmania"],
      fr: ["Myanmar"],
      it: ["Myanmar"],
      pt: ["Birmania"],
    },
    capital: {
      de: ["Nay Pyi Taw"],
      en: ["Nay Pyi Taw"],
      es: ["Naypyidaw", "Nay Pyi Taw"],
      pt: ["Nay Pyi Taw"],
    },
  },
  MN: {
    capital: {
      de: ["Ulan-Bator"],
      en: ["Ulaanbaatar"],
      es: ["Ulaanbaatar"],
      fr: ["Ulaanbaatar", "Ulan Bator"],
      it: ["Ulaanbaatar"],
      pt: ["Ulan Bator", "Ulaanbaatar"],
    },
  },
  MR: {
    capital: {
      es: ["Nouakchott"],
      pt: ["Nuaquechote"],
    },
  },
  MT: {
    capital: {
      es: ["La Valletta", "Valletta"],
      fr: ["Valette", "Valletta"],
      it: ["Valletta"],
      pt: ["Valletta"],
    },
  },
  MU: {
    name: {
      es: ["Isla Mauricio", "Mauritius"],
      fr: ["Maurice"],
      pt: ["Maurícia", "Ilhas Maurício"],
    },
    capital: {
      pt: ["Porto Luís"],
    },
  },
  MV: {
    name: {
      es: ["Islas Maldivas"],
      pt: ["Ilhas Maldivas"],
    },
  },
  MW: {
    name: {
      en: ["Nyasaland"],
      es: ["Malaui"],
      pt: ["Maláui"],
    },
    capital: {
      es: ["Lilongwe"],
      pt: ["Lilongwe"],
    },
  },
  MX: {
    name: {
      de: ["Mexico"],
    },
    capital: {
      de: ["Mexico-Stadt", "Ciudad de México"],
      en: ["Ciudad de Mexico", "CDMX"],
      es: ["CDMX", "DF", "México DF"],
      fr: ["Ciudad de México", "Mexico City"],
      it: ["Mexico City", "Ciudad de México"],
      pt: ["Ciudad de México"],
    },
  },
  MY: {
    name: {
      es: ["Malaysia"],
    },
    capital: {
      es: ["Putrajaya"],
    },
  },
  MZ: {
    capital: {
      en: ["Lourenço Marques"],
    },
  },
  NA: {
    name: {
      en: ["South West Africa"],
    },
    capital: {
      de: ["Windhuk"],
    },
  },
  NL: {
    name: {
      de: ["Holland"],
      en: ["Holland", "The Netherlands"],
      es: ["Holanda"],
      fr: ["Hollande"],
      it: ["Olanda"],
      pt: ["Paises Baixos"],
    },
    capital: {
      pt: ["Amsterdã", "Amsterdam", "Amsterdão"],
    },
  },
  NP: {
    capital: {
      de: ["Katmandu"],
      es: ["Kathmandu"],
      fr: ["Kathmandu"],
      it: ["Kathmandu"],
      pt: ["Kathmandu", "Katmandu"],
    },
  },
  NZ: {
    name: {
      en: ["Aotearoa", "NZ"],
      es: ["Nueva Zelandia", "New Zealand"],
    },
  },
  OM: {
    capital: {
      de: ["Muscat"],
      es: ["Muscat"],
      fr: ["Muscat"],
      it: ["Muscat"],
      pt: ["Muscat"],
    },
  },
  PA: {
    capital: {
      de: ["Panama City"],
      en: ["Ciudad de Panama"],
      es: ["Panamá", "Panama City"],
      fr: ["Panama City", "Ciudad de Panama"],
      it: ["Panama City"],
      pt: ["Ciudad de Panamá"],
    },
  },
  PG: {
    name: {
      en: ["PNG"],
    },
    capital: {
      es: ["Port Moresby"],
      pt: ["Porto Moresby"],
    },
  },
  PH: {
    name: {
      en: ["The Philippines", "Republic of the Philippines"],
      es: ["Philippines"],
    },
    capital: {
      fr: ["Manila"],
      pt: ["Manilha"],
    },
  },
  PK: {
    capital: {
      pt: ["Islamabade"],
    },
  },
  PL: {
    capital: {
      en: ["Warszawa"],
      es: ["Warszawa", "Warsaw"],
    },
  },
  PS: {
    name: {
      de: ["Palaestina"],
      en: ["State of Palestine"],
      es: ["Estado de Palestina"],
      fr: ["État de Palestine"],
    },
    capital: {
      es: ["Ramallah"],
      pt: ["Ramala"],
    },
  },
  PT: {
    capital: {
      en: ["Lisboa"],
      es: ["Lisbon"],
    },
  },
  PW: {
    name: {
      es: ["Palaos"],
      fr: ["Palaos", "Palau"],
    },
  },
  PY: {
    capital: {
      pt: ["Asunción"],
    },
  },
  QA: {
    name: {
      de: ["Qatar"],
      es: ["Qatar"],
      pt: ["Qatar"],
    },
  },
  RO: {
    name: {
      de: ["Rumaenien"],
      es: ["Romania"],
    },
    capital: {
      en: ["Bucuresti"],
      es: ["Bucharest"],
      it: ["Bucharest"],
    },
  },
  RS: {
    capital: {
      en: ["Beograd"],
      es: ["Belgrade"],
      it: ["Belgrade"],
    },
  },
  RU: {
    name: {
      de: ["Russische Föderation"],
      en: ["Russian Federation"],
      es: ["Russia", "Federación Rusa"],
      fr: ["Fédération de Russie"],
      it: ["Federazione Russa"],
      pt: ["Federação Russa"],
    },
    capital: {
      en: ["Moskva"],
      es: ["Moscow", "Moscova"],
      it: ["Moscow", "Moskva"],
      pt: ["Moscou"],
    },
  },
  RW: {
    name: {
      de: ["Rwanda"],
      es: ["Rwanda"],
      it: ["Rwanda"],
    },
    capital: {
      pt: ["Kigali"],
    },
  },
  SA: {
    name: {
      en: ["KSA", "Kingdom of Saudi Arabia"],
      es: ["Arabia Saudita"],
    },
    capital: {
      de: ["Riyadh"],
      es: ["Riyadh"],
      fr: ["Riyadh"],
      it: ["Riyadh"],
      pt: ["Riad", "Riyadh"],
    },
  },
  SB: {
    name: {
      de: ["Salomoninseln"],
      fr: ["Salomon"],
    },
  },
  SC: {
    name: {
      pt: ["Seychelles"],
    },
    capital: {
      pt: ["Vitória"],
    },
  },
  SD: {
    capital: {
      de: ["Khartum"],
      es: ["Khartoum", "Kartum"],
      it: ["Khartoum"],
      pt: ["Khartoum", "Khartum"],
    },
  },
  SE: {
    capital: {
      es: ["Stockholm"],
      pt: ["Stockholm"],
    },
  },
  SG: {
    name: {
      de: ["Singapore"],
      es: ["Singapore"],
      pt: ["Singapore"],
    },
    capital: {
      de: ["Singapore"],
      pt: ["Singapore"],
    },
  },
  SI: {
    capital: {
      es: ["Ljubljana"],
      it: ["Ljubljana"],
      pt: ["Ljubljana"],
    },
  },
  SK: {
    name: {
      de: ["Slowakische Republik"],
      en: ["Slovak Republic"],
      es: ["Eslovaquia", "Slovakia"],
    },
    capital: {
      de: ["Pressburg"],
    },
  },
  SL: {
    name: {
      es: ["Sierra Leona"],
      pt: ["Sierra Leone"],
    },
  },
  SM: {
    name: {
      pt: ["São Marinho"],
    },
    capital: {
      it: ["San Marino"],
      pt: ["São Marinho"],
    },
  },
  SN: {
    capital: {
      pt: ["Dakar"],
    },
  },
  SO: {
    capital: {
      de: ["Mogadishu"],
      es: ["Mogadishu"],
      fr: ["Mogadishu"],
      it: ["Mogadishu"],
      pt: ["Mogadíscio", "Mogadishu"],
    },
  },
  SR: {
    name: {
      de: ["Surinam"],
      en: ["Surinam", "Dutch Guiana"],
      es: ["Suriname"],
      fr: ["Suriname"],
      pt: ["Surinam"],
    },
  },
  SS: {
    name: {
      de: ["Suedsudan"],
      es: ["South Sudan"],
    },
    capital: {
      es: ["Juba"],
      fr: ["Juba"],
      it: ["Juba"],
    },
  },
  ST: {
    name: {
      es: ["Sao Tomé y Príncipe"],
    },
    capital: {
      es: ["Sao Tomé"],
    },
  },
  SV: {
    name: {
      fr: ["El Salvador"],
    },
  },
  SY: {
    name: {
      en: ["Syrian Arab Republic"],
    },
    capital: {
      es: ["Damascus"],
      it: ["Damascus"],
    },
  },
  SZ: {
    name: {
      de: ["Swasiland", "Swaziland"],
      en: ["Swaziland"],
      es: ["Suazilandia", "Esuatini"],
      fr: ["Swaziland"],
      it: ["Swaziland"],
      pt: ["Suazilândia", "Essuatini"],
    },
    capital: {
      es: ["Lobamba"],
      it: ["Lobamba"],
      pt: ["Mbabane"],
    },
  },
  TD: {
    name: {
      it: ["Chad"],
    },
    capital: {
      es: ["N'Djamena", "Ndyamena"],
      pt: ["N'Djamena"],
    },
  },
  TH: {
    name: {
      en: ["Siam"],
      es: ["Thailand", "Siam"],
      fr: ["Siam"],
      it: ["Thailandia"],
      pt: ["Sião"],
    },
    capital: {
      en: ["Krung Thep"],
      pt: ["Bangkok", "Bangcoc"],
    },
  },
  TJ: {
    name: {
      es: ["Tadyikistán"],
    },
    capital: {
      de: ["Dushanbe"],
      es: ["Dushanbe"],
      fr: ["Dushanbe"],
      it: ["Dushanbe"],
      pt: ["Dushanbe"],
    },
  },
  TL: {
    name: {
      de: ["Timor-Leste"],
      en: ["East Timor"],
      es: ["Timor-Leste", "Timor Este"],
      fr: ["Timor-Leste"],
      it: ["Timor Leste", "Timor Orientale"],
      pt: ["Timor Oriental"],
    },
  },
  TM: {
    name: {
      pt: ["Turcomenistão"],
    },
    capital: {
      de: ["Aschgabat", "Ashgabat"],
      en: ["Ashkhabad"],
      es: ["Ashgabat", "Ashjabad"],
      fr: ["Ashgabat"],
      it: ["Ashgabat"],
      pt: ["Ashgabat"],
    },
  },
  TN: {
    name: {
      es: ["Tunisia"],
    },
    capital: {
      pt: ["Tunis"],
    },
  },
  TR: {
    name: {
      de: ["Tuerkei"],
      en: ["Türkiye"],
      es: ["Türkiye"],
      fr: ["Türkiye"],
    },
    capital: {
      en: ["Angora"],
      pt: ["Ankara"],
    },
  },
  TT: {
    name: {
      en: ["Trinidad"],
      fr: ["Trinidad et Tobago"],
      pt: ["Trinidad e Tobago"],
    },
    capital: {
      es: ["Port of Spain"],
      fr: ["Port of Spain"],
      pt: ["Porto de Espanha"],
    },
  },
  TZ: {
    name: {
      de: ["Tanzania"],
    },
    capital: {
      es: ["Dar es Salaam"],
    },
  },
  UA: {
    capital: {
      de: ["Kyiv", "Kiev", "Kyjiw"],
      en: ["Kiev"],
      es: ["Kyiv"],
      fr: ["Kyiv"],
      it: ["Kyiv"],
      pt: ["Kyiv"],
    },
  },
  UG: {
    capital: {
      pt: ["Kampala"],
    },
  },
  US: {
    name: {
      de: ["USA", "Vereinigte Staaten von Amerika", "Amerika", "US"],
      en: ["USA", "US", "United States of America", "America"],
      es: ["EEUU", "USA", "Estados Unidos de America", "United States"],
      fr: ["USA", "États-Unis d'Amérique", "Amérique"],
      it: ["USA", "Stati Uniti", "America"],
      pt: ["EUA", "USA", "Estados Unidos da America"],
    },
    capital: {
      de: ["Washington"],
      en: ["Washington"],
      es: ["Washington"],
      fr: ["Washington DC"],
      it: ["Washington DC"],
      pt: ["Washington"],
    },
  },
  UZ: {
    name: {
      de: ["Uzbekistan"],
    },
    capital: {
      de: ["Tashkent"],
      es: ["Tashkent"],
      fr: ["Tashkent"],
      pt: ["Tashkent"],
    },
  },
  VA: {
    name: {
      de: ["Vatikan", "Vatikanstaat"],
      en: ["Vatican", "Holy See"],
      es: ["Vaticano", "Santa Sede"],
      fr: ["Vatican", "Saint-Siège", "État de la Cité du Vatican"],
      it: ["Vaticano", "Santa Sede"],
      pt: ["Santa Sé", "Vaticano"],
    },
    capital: {
      de: ["Vatikan"],
      es: ["Vaticano"],
    },
  },
  VC: {
    name: {
      de: ["Saint Vincent und die Grenadinen"],
      en: ["St. Vincent and the Grenadines"],
      es: ["San Vicente y las Granadinas", "Saint Vincent y las Granadinas"],
      it: ["San Vincenzo e Grenadine"],
      pt: ["São Vicente e Granadinas", "Saint Vincent e Granadinas"],
    },
  },
  VN: {
    name: {
      pt: ["Vietna"],
    },
  },
  VU: {
    name: {
      en: ["New Hebrides"],
    },
    capital: {
      pt: ["Port Vila"],
    },
  },
  WS: {
    name: {
      en: ["Western Samoa"],
      es: ["Samoa Occidental"],
      fr: ["Samoa Occidentales"],
      pt: ["Samoa Ocidental"],
    },
  },
  XK: {
    name: {
      pt: ["Cosovo"],
    },
    capital: {
      en: ["Prishtina"],
      es: ["Prishtina"],
      fr: ["Prishtina"],
      it: ["Prishtina"],
    },
  },
  XS: {
    name: {
      es: ["Somaliland"],
      pt: ["Somaliland"],
    },
    capital: {
      de: ["Hargeysa"],
      en: ["Hargeysa"],
      es: ["Hargeysa"],
      fr: ["Hargeysa"],
      it: ["Hargeysa"],
      pt: ["Hargeysa"],
    },
  },
  YE: {
    name: {
      de: ["Yemen"],
      pt: ["Yemen"],
    },
    capital: {
      es: ["Sanaa"],
      pt: ["Sanaa"],
    },
  },
  ZA: {
    name: {
      de: ["Suedafrika"],
      es: ["South Africa"],
    },
    capital: {
      en: ["Cape Town", "Bloemfontein"],
      es: ["Ciudad del Cabo", "Bloemfontein"],
      fr: ["Le Cap", "Cape Town", "Bloemfontein"],
      pt: ["Cidade do Cabo", "Bloemfontein"],
    },
  },
  ZM: {
    name: {
      de: ["Zambia"],
      en: ["Northern Rhodesia"],
    },
    capital: {
      pt: ["Lusaka"],
    },
  },
  ZW: {
    name: {
      de: ["Zimbabwe"],
      en: ["Rhodesia"],
      es: ["Zimbabwe"],
      fr: ["Rhodésie"],
      pt: ["Zimbábue"],
    },
    capital: {
      en: ["Salisbury"],
      fr: ["Salisbury"],
    },
  },
};

export function getCountryNameAliases(
  countryCode: string,
): LocalizedAliases | undefined {
  return COUNTRY_ALIASES_CONFIGS[countryCode]?.name;
}

export function getCountryCapitalAliases(
  countryCode: string,
): LocalizedAliases | undefined {
  return COUNTRY_ALIASES_CONFIGS[countryCode]?.capital;
}
