import { generateRandomLevels } from './src/pages/Game/utils/generateRandomLevel.ts';

const levels = generateRandomLevels(3);
console.log(JSON.stringify(levels, null, 2));
