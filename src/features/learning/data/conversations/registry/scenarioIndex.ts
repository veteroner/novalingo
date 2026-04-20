import type { ConversationScenario } from '../types/conversationScenario';
import { feedThePetScenario } from './phase1/animals/feedThePet';
import { myFavoriteAnimalScenario } from './phase1/animals/myFavoriteAnimal';
import { petShopPickScenario } from './phase1/animals/petShopPick';
import { zooHelperMissionScenario } from './phase1/animals/zooHelperMission';
import { bodyCheckupScenario } from './phase1/body/bodyCheckup';
import { brushMyTeethScenario } from './phase1/body/brushMyTeeth';
import { washMyHandsScenario } from './phase1/body/washMyHands';
import { colorHuntScenario } from './phase1/colors/colorHunt';
import { paintNovasRoomScenario } from './phase1/colors/paintNovasRoom';
import { shapeAndColorBoxScenario } from './phase1/colors/shapeAndColorBox';
import { cheerUpNovaScenario } from './phase1/emotions/cheerUpNova';
import { proudOfMyselfScenario } from './phase1/emotions/proudOfMyself';
import { howDoYouFeelScenario } from './phase1/emotions/howDoYouFeel';
import { myFavoriteColorAndAnimalScenario } from './phase1/emotions/myFavoriteColorAndAnimal';
import { babyInTheHouseScenario } from './phase1/family/babyInTheHouse';
import { grandparentsDayScenario } from './phase1/family/grandparentsDay';
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
import { rainyDayScenario } from './phase1/weather/rainyDay';
import { sunnyMorningScenario } from './phase1/weather/sunnyMorning';
import { weatherReportScenario } from './phase1/weather/weatherReport';
import { canYouDoThisScenario } from './phase2/actions/canYouDoThis';
import { letsPlayScenario } from './phase2/actions/letsPlay';
import { simonSaysScenario } from './phase2/actions/simonSays';
import { whatAreYouDoingScenario } from './phase2/actions/whatAreYouDoing';
import { whatDoYouDoScenario } from './phase2/actions/whatDoYouDo';
import { biggerThanScenario } from './phase2/adjectives/biggerThan';
import { hotOrColdScenario } from './phase2/adjectives/hotOrCold';
import { isItBigOrSmallScenario } from './phase2/adjectives/isItBigOrSmall';
import { meetNovaScenario } from './phase2/family/meetNova';
import { myBabyBrotherScenario } from './phase2/family/myBabyBrother';
import { whoIsThisScenario } from './phase2/family/whoIsThis';
import { canIHaveScenario } from './phase2/food/canIHave';
import { cookingWithNovaScenario } from './phase2/food/cookingWithNova';
import { iLikeToEatScenario } from './phase2/food/iLikeToEat';
import { shoppingListScenario } from './phase2/food/shoppingList';
import { yummyOrYuckyScenario } from './phase2/food/yummyOrYucky';
import { canYouScenario } from './phase2/helpers/canYou';
import { cleanUpTimeScenario } from './phase2/helpers/cleanUpTime';
import { helpMePleaseScenario } from './phase2/helpers/helpMePlease';
import { haveYouGotAScenario } from './phase2/tobe/haveYouGotA';
import { iAmYouAreScenario } from './phase2/tobe/iAmYouAre';
import { whereAreYouScenario } from './phase2/tobe/whereAreYou';
import { dressingForAPartyScenario } from './phase3/clothes/dressingForAParty';
import { gettingDressedScenario } from './phase3/clothes/gettingDressed';
import { laundryDayScenario } from './phase3/clothes/laundryDay';
import { whatToWearScenario } from './phase3/clothes/whatToWear';
import { doYouLikeSchoolScenario } from './phase3/home/doYouLikeSchool';
import { inTheKitchenScenario } from './phase3/home/inTheKitchen';
import { myFavoriteSportScenario } from './phase3/home/myFavoriteSport';
import { myRoutineScenario } from './phase3/home/myRoutine';
import { tidyMyRoomScenario } from './phase3/home/tidyMyRoom';
import { whereIsTheScenario } from './phase3/home/whereIsThe';
import { atTheParkScenario } from './phase3/nature/atThePark';
import { beachDayScenario } from './phase3/nature/beachDay';
import { gardenAdventureScenario } from './phase3/nature/gardenAdventure';
import { inTheForestScenario } from './phase3/nature/inTheForest';
import { whatIsTheWeatherScenario } from './phase3/nature/whatIsTheWeather';
import { whatSeasonScenario } from './phase3/nature/whatSeason';
import { busRideScenario } from './phase3/transport/busRide';
import { howDoYouGoScenario } from './phase3/transport/howDoYouGo';
import { letsGoScenario } from './phase3/transport/letsGo';
import { trainJourneyScenario } from './phase3/transport/trainJourney';
import { atTheRestaurantScenario } from './phase4/city/atTheRestaurant';
import { letsGoShoppingScenario } from './phase4/city/letsGoShopping';
import { visitingTheMuseumScenario } from './phase4/city/visitingTheMuseum';
import { whereIsTheBankScenario } from './phase4/city/whereIsTheBank';
import { whereIsTheParkScenario } from './phase4/city/whereIsThePark';
import { howWeMetScenario } from './phase4/friends/howWeMet';
import { myBestFriendScenario } from './phase4/friends/myBestFriend';
import { sleepoverPartyScenario } from './phase4/friends/sleepoverParty';
import { atTheHospitalScenario } from './phase4/jobs/atTheHospital';
import { iWantToBeScenario } from './phase4/jobs/iWantToBe';
import { theTeacherScenario } from './phase4/jobs/theTeacher';
import { whatDoYouWorkScenario } from './phase4/jobs/whatDoYouWork';
import { whoHelpsOurCityScenario } from './phase4/jobs/whoHelpsOurCity';
import { artClassScenario } from './phase4/school/artClass';
import { canIBorrowScenario } from './phase4/school/canIBorrow';
import { doYouHaveAScenario } from './phase4/school/doYouHaveA';
import { myFavoriteSubjectScenario } from './phase4/school/myFavoriteSubject';
import { schoolTripScenario } from './phase4/school/schoolTrip';
import { doYouLikeToPlayScenario } from './phase4/sports/doYouLikeToPlay';
import { letsPlaySportsScenario } from './phase4/sports/letsPlaySports';
import { myFavoriteTeamScenario } from './phase4/sports/myFavoriteTeam';
import { swimmingLessonScenario } from './phase4/sports/swimmingLesson';
import { beforeAndAfterScenario } from './phase4/time/beforeAndAfter';
import { daysOfTheWeekScenario } from './phase4/time/daysOfTheWeek';
import { myDailyScheduleScenario } from './phase4/time/myDailySchedule';
import { whatTimeIsItScenario } from './phase4/time/whatTimeIsIt';
import { atTheLibraryScenario } from './phase5/city/atTheLibrary';
import { atTheMarketScenario } from './phase5/city/atTheMarket';
import { atThePostOfficeScenario } from './phase5/city/atThePostOffice';
import { orderAtTheCafeScenario } from './phase5/city/orderAtTheCafe';
import { planningAPartyScenario } from './phase5/friends/planningAParty';
import { whoIsYourHeroScenario } from './phase5/friends/whoIsYourHero';
import { meetTheDoctorScenario } from './phase5/jobs/meetTheDoctor';
import { myDreamJobScenario } from './phase5/jobs/myDreamJob';
import { theFirefighterMissionScenario } from './phase5/jobs/theFirefighterMission';
import { lunchAtSchoolScenario } from './phase5/school/lunchAtSchool';
import { scienceClassScenario } from './phase5/school/scienceClass';
import { writingALetterScenario } from './phase5/school/writingALetter';
import { joinTheTeamScenario } from './phase5/sports/joinTheTeam';
import { playingFairScenario } from './phase5/sports/playingFair';
import { howLongDoesItTakeScenario } from './phase5/time/howLongDoesItTake';
import { planningMyWeekScenario } from './phase5/time/planningMyWeek';
import { atTheAirportScenario } from './phase5/city/atTheAirport';
import { ridingTheSubwayScenario } from './phase5/city/ridingTheSubway';
import { bookClubScenario } from './phase5/friends/bookClub';
import { newNeighborScenario } from './phase5/friends/newNeighbor';
import { theVeterinarianScenario } from './phase5/jobs/theVeterinarian';
import { theAstronautScenario } from './phase5/jobs/theAstronaut';
import { showAndTellScenario } from './phase5/school/showAndTell';
import { homeworkTimeScenario } from './phase5/school/homeworkTime';
import { sportsDayScenario } from './phase5/sports/sportsDay';
import { atTheGymScenario } from './phase5/sports/atTheGym';
import { seasonsOfTheYearScenario } from './phase5/time/seasonsOfTheYear';
import { yesterdayTodayTomorrowScenario } from './phase5/time/yesterdayTodayTomorrow';

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
  brushMyTeethScenario,
  washMyHandsScenario,
  weatherReportScenario,
  rainyDayScenario,
  sunnyMorningScenario,
  meetMyFamilyScenario,
  grandparentsDayScenario,
  babyInTheHouseScenario,
  proudOfMyselfScenario,
];

export const PHASE2_CONVERSATION_SCENARIOS: ConversationScenario[] = [
  meetNovaScenario,
  whoIsThisScenario,
  myBabyBrotherScenario,
  canIHaveScenario,
  cookingWithNovaScenario,
  iLikeToEatScenario,
  shoppingListScenario,
  yummyOrYuckyScenario,
  biggerThanScenario,
  hotOrColdScenario,
  isItBigOrSmallScenario,
  iAmYouAreScenario,
  haveYouGotAScenario,
  whereAreYouScenario,
  canYouScenario,
  cleanUpTimeScenario,
  helpMePleaseScenario,
  letsPlayScenario,
  canYouDoThisScenario,
  simonSaysScenario,
  whatDoYouDoScenario,
  whatAreYouDoingScenario,
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
  laundryDayScenario,
  dressingForAPartyScenario,
  tidyMyRoomScenario,
  inTheKitchenScenario,
  gardenAdventureScenario,
  beachDayScenario,
  busRideScenario,
  trainJourneyScenario,
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
  howWeMetScenario,
  myFavoriteTeamScenario,
  myFavoriteSubjectScenario,
  whoHelpsOurCityScenario,
  atTheRestaurantScenario,
  visitingTheMuseumScenario,
  sleepoverPartyScenario,
  atTheHospitalScenario,
  theTeacherScenario,
  artClassScenario,
  schoolTripScenario,
  swimmingLessonScenario,
  beforeAndAfterScenario,
  daysOfTheWeekScenario,
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
  whoIsYourHeroScenario,
  playingFairScenario,
  atTheMarketScenario,
  myDreamJobScenario,
  atTheAirportScenario,
  ridingTheSubwayScenario,
  bookClubScenario,
  newNeighborScenario,
  theVeterinarianScenario,
  theAstronautScenario,
  showAndTellScenario,
  homeworkTimeScenario,
  sportsDayScenario,
  atTheGymScenario,
  seasonsOfTheYearScenario,
  yesterdayTodayTomorrowScenario,
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
