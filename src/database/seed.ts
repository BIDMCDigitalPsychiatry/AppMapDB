import Application, { Costs, Privacies, ClinicalFoundations, Features, Functionalities, Platforms, Conditions, DeveloperTypes } from './models/Application';
import { randomInt } from '../helpers';
import DB from './dbConfig';
import Rating from './models/Rating';

// Returns a random entry from an array.  If multiple is set to true, return an an array with a random number of random elements
const getRandom = (array = [], multiple = false, min = 1) =>
  !multiple ? array[randomInt(0, array.length - 1)] : Array.from({ length: randomInt(min, array.length) }, () => getRandom(array));

export async function asyncSeed(count = 300, force = false) {
  if (process.env.NODE_ENV === 'development' || force) {
    console.log(`Seeding database with ${count} records...`);
    var success = 0;
    var failed = 0;
    var r_success = 0;
    var r_failed = 0;
    for (var i = 0; i < count; i++) {
      const response = await DB.applications.insert({
        name: `Test Application ${i + 1}`,
        company: getRandom(companies),
        platforms: getRandom(Platforms, true),
        costs: getRandom(Costs, true),
        conditions: getRandom(Conditions, true),
        privacies: getRandom(Privacies, true, 0),
        clinicalFoundation: getRandom(ClinicalFoundations),
        features: getRandom(Features, true, 0),
        functionalities: getRandom(Functionalities, true, 0),
        developerType: getRandom(DeveloperTypes)
      } as Application);
      if (response && response.ok === true) {
        success++;
        for (var j = 0; j < randomInt(0, 5); j++) {
          const r_response = await DB.ratings.insert({
            appId: response.id,
            name: 'Anonymous',
            review: 'This is a test review.',
            rating: randomInt(1, 5)
          } as Rating);
          if (r_response && r_response.ok === true) {
            r_success++;
          } else {
            r_failed++;
          }
        }
      } else {
        failed++;
      }
    }
    console.log(`Successfully seeded ${success} application records. ${failed} failed.`);
    console.log(`Successfully seeded ${r_success} rating records. ${r_failed} failed.`);
  }
}

const companies = [
  '360Networks Inc.',
  '3DLabs Inc. Ltd.',
  '724 Solutions Inc.',
  'A B Electrolux',
  'A B SKF',
  'A B Volvo',
  'A R T International Inc.',
  'Aeterna Laboratories Inc.',
  'Agnico-Eagle Mines Ltd.',
  'Agrium Inc.',
  'AimGlobal Technologies Co. Inc.',
  'Ainsworth Lumber Co. Ltd.',
  'Air Canada',
  'Akzo Nobel N.V.',
  'Aladdin Knowledge Systems Ltd.',
  'BVR Systems Ltd.',
  'BVR Technologies Ltd.',
  'Cable and Wireless plc',
  'Cable Satisfaction International Inc.',
  'Cabletel Communications Corp.',
  'Cableuropa, S.A.',
  'CRH plc',
  'Cristalerias de Chile S.A.',
  'Crosswave Communications Inc.',
  'Crow Technologies 1977 Ltd.',
  'Crucell N.V.',
  'Embratel Participacoes S.A.',
  'Emco Ltd.',
  'Empresa Electrica Pehuenche S.A.',
  'Empresa Nacional de Electricidad S.A. - Endesa',
  'Empresas ICA Sociedad Controladora S.A.',
  'Enbridge Inc.',
  'Endesa S.A.',
  'Enel S.p.A.',
  'Energis plc',
  'Energy Power Systems Ltd.',
  'Enerplus Resources Fund',
  'G. Willi-Food International Ltd.',
  'Gala Group Holdings plc',
  'Galen Holdings plc',
  'Gallaher Group plc',
  'Gearbulk Holding Ltd.',
  'Gee-Ten Ventures Inc.',
  'Gemplus International S.A.',
  'Gener S.A.',
  'Head Holding Unternehmensbeteiligung GMBH',
  'Head N.V.',
  'Healthcare Technologies Ltd.',
  'Hellenic Telecommunications Organization S.A. - OTE',
  'Hemosol Inc.',
  'Hibernia Foods plc',
  'Highway Holdings Ltd.',
  'Highwood Resources Ltd.',
  'Hilan Tech Ltd.',
  'Hilton Petroleum Ltd.',
  'Hitachi Ltd.',
  'HMV Media Group plc',
  'Hollinger Inc.',
  'Honda Motor Co. Ltd.',
  'Household Financial Corp. Ltd.',
  'HQI Translec Chile S.A.',
  'HSBC Bank plc',
  'HSBC Holdings plc',
  'Huaneng Power International Inc.',
  'Hummingbird Ltd.',
  'Huntingdon Life Sciences Group plc',
  'Hurricane Hydrocarbons Ltd.',
  'Husky Energy Inc.',
  'Hydro One Inc.',
  'Hydrogenics Corp.',
  'I.I.S. Intelligent Information Systems Ltd.',
  'iaNett International Systems Ltd.',
  'I-Cable Communications Ltd.',
  'ICICI Bank Ltd.',
  'ICICI Ltd.',
  'ICON plc',
  'ICOS Vision Systems Corp N.V.',
  'ICTS International N.V.',
  'Korea Telecom Corp.',
  'Korea Thrunet Ltd.',
  'Kowloon-Canton Railway Corp.',
  'KPNQwest N.V.',
  'Kubota Corp.',
  'Kyocera Corp.',
  'Levon Resources Ltd.',
  'Lihir Gold Ltd.',
  'Linea Aerea Nacional Chile S.A.- LanChile',
  'LinuxWizardry Systems, Inc.',
  'Lion Bioscience Aktiengesellschaft',
  'Lions Gate Entertainment Corp.',
  'Liquidation World Inc.',
  'LJ International Ltd.',
  'Lloyds TSB Group plc',
  'LML Payment Systems Inc.',
  'Localiza Rent-a-Car S.A.',
  'Loewen Group Inc.',
  'LogicalOptions International Inc.',
  'Logitech International S.A.',
  'London Electricity Group plc',
  'London Pacific Group Ltd.',
  'Vernalis Group plc',
  'Veronex Technologies Inc.',
  'Versatel Telecom International N.V.',
  'VI Group plc',
  'Videsh Sanchar Nigam Ltd.',
  'Vimpel Communications',
  'Vina Concha y Toro S.A.',
  'Virgin Express Holdings plc',
  'Virginia Gold Mines Inc.',
  'Zarlink Semiconductor Inc.',
  'Zemex Corp.',
  'Zi Corp.',
  'Ztest Electronics Inc.'
];
