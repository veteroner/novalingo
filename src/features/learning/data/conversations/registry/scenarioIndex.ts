import type { ConversationScenario } from '../types/conversationScenario';
import { feedThePetScenario } from './phase1/animals/feedThePet';
import { myFavoriteAnimalScenario } from './phase1/animals/myFavoriteAnimal';
import { petShopPickScenario } from './phase1/animals/petShopPick';
import { zooHelperMissionScenario } from './phase1/animals/zooHelperMission';
import { bodyCheckupScenario } from './phase1/body/bodyCheckup';
import { colorHuntScenario } from './phase1/colors/colorHunt';
import { paintNovasRoomScenario } from './phase1/colors/paintNovasRoom';
import { shapeAndColorBoxScenario } from './phase1/colors/shapeAndColorBox';
import { cheerUpNovaScenario } from './phase1/emotions/cheerUpNova';
import { howDoYouFeelScenario } from './phase1/emotions/howDoYouFeel';
import { myFavoriteColorAndAnimalScenario } from './phase1/emotions/myFavoriteColorAndAnimal';
import { meetMyFamilyScenario } from './phase1/family/meetMyFamily';
import { fruitStandOrderScenario } from './phase1/food/fruitStandOrder';
import { healthyOrYummyScenario } from './phase1/food/healthyOrYummy';
import { picnicBasketScenario } from './phase1/food/picnicBasket';
import { restaurantHelperScenario } from './phase1/food/restaurantHelper';
import { bedtimeWindDownScenario } from './phase1/routine/bedtimeWindDown';
import { getReadyInTheMorningScenario } from './phase1/routine/getReadyInTheMorning';
import { packMySchoolBagScenario } from './phase1/routine/packMySchoolBag';
import { buildAPlayTeamScenario } from './phase1/toys/buildAPlayTeam';
import { fixTheBrokenToyScenario } from './phase1/toys/fixTheBrokenToy';
import { toyShopChoiceScenario } from './phase1/toys/toyShopChoice';
import { weatherReportScenario } from './phase1/weather/weatherReport';
import { letsPlayScenario } from './phase2/actions/letsPlay';
import { whatAreYouDoingScenario } from './phase2/actions/whatAreYouDoing';
import { whatDoYouDoScenario } from './phase2/actions/whatDoYouDo';
import { biggerThanScenario } from './phase2/adjectives/biggerThan';
import { isItBigOrSmallScenario } from './phase2/adjectives/isItBigOrSmall';
import { meetNovaScenario } from './phase2/family/meetNova';
import { whoIsThisScenario } from './phase2/family/whoIsThis';
import { canIHaveScenario } from './phase2/food/canIHave';
import { iLikeToEatScenario } from './phase2/food/iLikeToEat';
import { canYouScenario } from './phase2/helpers/canYou';
import { haveYouGotAScenario } from './phase2/tobe/haveYouGotA';
import { iAmYouAreScenario } from './phase2/tobe/iAmYouAre';
import { gettingDressedScenario } from './phase3/clothes/gettingDressed';
import { whatToWearScenario } from './phase3/clothes/whatToWear';
import { doYouLikeSchoolScenario } from './phase3/home/doYouLikeSchool';
import { myFavoriteSportScenario } from './phase3/home/myFavoriteSport';
import { myRoutineScenario } from './phase3/home/myRoutine';
import { whereIsTheScenario } from './phase3/home/whereIsThe';
import { atTheParkScenario } from './phase3/nature/atThePark';
import { inTheForestScenario } from './phase3/nature/inTheForest';
import { whatIsTheWeatherScenario } from './phase3/nature/whatIsTheWeather';
import { whatSeasonScenario } from './phase3/nature/whatSeason';
import { howDoYouGoScenario } from './phase3/transport/howDoYouGo';
import { letsGoScenario } from './phase3/transport/letsGo';
import { letsGoShoppingScenario } from './phase4/city/letsGoShopping';
import { whereIsTheBankScenario } from './phase4/city/whereIsTheBank';
import { whereIsTheParkScenario } from './phase4/city/whereIsThePark';
import { myBestFriendScenario } from './phase4/friends/myBestFriend';
import { iWantToBeScenario } from './phase4/jobs/iWantToBe';
import { whatDoYouWorkScenario } from './phase4/jobs/whatDoYouWork';
import { canIBorrowScenario } from './phase4/school/canIBorrow';
import { doYouHaveAScenario } from './phase4/school/doYouHaveA';
import { doYouLikeToPlayScenario } from './phase4/sports/doYouLikeToPlay';
import { letsPlaySportsScenario } from './phase4/sports/letsPlaySports';
import { myDailyScheduleScenario } from './phase4/time/myDailySchedule';
import { whatTimeIsItScenario } from './phase4/time/whatTimeIsIt';
import { atTheLibraryScenario } from './phase5/city/atTheLibrary';
import { atThePostOfficeScenario } from './phase5/city/atThePostOffice';
import { orderAtTheCafeScenario } from './phase5/city/orderAtTheCafe';
import { planningAPartyScenario } from './phase5/friends/planningAParty';
import { meetTheDoctorScenario } from './phase5/jobs/meetTheDoctor';
import { theFirefighterMissionScenario } from './phase5/jobs/theFirefighterMission';
import { lunchAtSchoolScenario } from './phase5/school/lunchAtSchool';
import { scienceClassScenario } from './phase5/school/scienceClass';
import { writingALetterScenario } from './phase5/school/writingALetter';
import { joinTheTeamScenario } from './phase5/sports/joinTheTeam';
import { howLongDoesItTakeScenario } from './phase5/time/howLongDoesItTake';
import { planningMyWeekScenario } from './phase5/time/planningMyWeek';

export const PHASE1_CONVERSATION_SCENARIOS: ConversationScenario[] = [
  petShopPickScenario,
  myFavoriteAnimalScenario,
  feedThePetScenario,
  zooHelperMissionScenario,
  fruitStandOrderScenario,
  picnicBasketScenario,
  restaurantHelperScenario,
  healthyOrYummyScenario,
  colorHuntScenario,
  paintNovasRoomScenario,
  shapeAndColorBoxScenario,
  toyShopChoiceScenario,
  buildAPlayTeamScenario,
  fixTheBrokenToyScenario,
  howDoYouFeelScenario,
  cheerUpNovaScenario,
  myFavoriteColorAndAnimalScenario,
  getReadyInTheMorningScenario,
  packMySchoolBagScenario,
  bedtimeWindDownScenario,
  bodyCheckupScenario,
  weatherReportScenario,
  meetMyFamilyScenario,
];

export const PHASE2_CONVERSATION_SCENARIOS: ConversationScenario[] = [
  meetNovaScenario,
  whoIsThisScenario,
  canIHaveScenario,
  biggerThanScenario,
  iAmYouAreScenario,
  canYouScenario,
  letsPlayScenario,
  whatDoYouDoScenario,
  whatAreYouDoingScenario,
  isItBigOrSmallScenario,
  iLikeToEatScenario,
  haveYouGotAScenario,
];

export const PHASE3_CONVERSATION_SCENARIOS: ConversationScenario[] = [
  whereIsTheScenario,
  myRoutineScenario,
  inTheForestScenario,
  whatSeasonScenario,
  gettingDressedScenario,
  whatToWearScenario,
  howDoYouGoScenario,
  letsGoScenario,
  whatIsTheWeatherScenario,
  myFavoriteSportScenario,
  doYouLikeSchoolScenario,
  atTheParkScenario,
];

export const PHASE4_CONVERSATION_SCENARIOS: ConversationScenario[] = [
  whereIsTheBankScenario,
  letsGoShoppingScenario,
  whereIsTheParkScenario,
  whatTimeIsItScenario,
  myDailyScheduleScenario,
  whatDoYouWorkScenario,
  iWantToBeScenario,
  doYouHaveAScenario,
  canIBorrowScenario,
  doYouLikeToPlayScenario,
  letsPlaySportsScenario,
  myBestFriendScenario,
];

export const PHASE5_CONVERSATION_SCENARIOS: ConversationScenario[] = [
  orderAtTheCafeScenario,
  atThePostOfficeScenario,
  atTheLibraryScenario,
  planningMyWeekScenario,
  howLongDoesItTakeScenario,
  meetTheDoctorScenario,
  theFirefighterMissionScenario,
  joinTheTeamScenario,
  lunchAtSchoolScenario,
  scienceClassScenario,
  planningAPartyScenario,
  writingALetterScenario,
];

export const ALL_CONVERSATION_SCENARIOS: ConversationScenario[] = [
  ...PHASE1_CONVERSATION_SCENARIOS,
  ...PHASE2_CONVERSATION_SCENARIOS,
  ...PHASE3_CONVERSATION_SCENARIOS,
  ...PHASE4_CONVERSATION_SCENARIOS,
  ...PHASE5_CONVERSATION_SCENARIOS,
];

export function getConversationScenarioById(id: string): ConversationScenario | undefined {
  return ALL_CONVERSATION_SCENARIOS.find((scenario) => scenario.id === id);
}
