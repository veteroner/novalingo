import type { ConversationScenario } from '../types/conversationScenario';
import { feedThePetScenario } from './phase1/animals/feedThePet';
import { myFavoriteAnimalScenario } from './phase1/animals/myFavoriteAnimal';
import { petShopPickScenario } from './phase1/animals/petShopPick';
import { zooHelperMissionScenario } from './phase1/animals/zooHelperMission';
import { colorHuntScenario } from './phase1/colors/colorHunt';
import { paintNovasRoomScenario } from './phase1/colors/paintNovasRoom';
import { shapeAndColorBoxScenario } from './phase1/colors/shapeAndColorBox';
import { cheerUpNovaScenario } from './phase1/emotions/cheerUpNova';
import { howDoYouFeelScenario } from './phase1/emotions/howDoYouFeel';
import { myFavoriteColorAndAnimalScenario } from './phase1/emotions/myFavoriteColorAndAnimal';
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
];

export function getConversationScenarioById(id: string): ConversationScenario | undefined {
  return PHASE1_CONVERSATION_SCENARIOS.find((scenario) => scenario.id === id);
}
