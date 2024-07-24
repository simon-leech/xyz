import { base } from './_base.test.mjs';
import { baseDictionaryTest } from '../lib/dictionaries/_dictionaries.test.mjs';
import { layerTest } from '../lib/layer/_layer.test.mjs';
import { locationTest } from '../lib/location/_location.test.mjs';

import { booleanTest } from '../lib/ui/locations/entries/boolean.test.mjs';

const mapview = await base();
await baseDictionaryTest();

await layerTest.changeEndTest();
await layerTest.decorateTest();
await layerTest.fadeTest();
await layerTest.featureFieldsTest();
await layerTest.featureFilterTest();
await layerTest.featureFormatsTest();
await layerTest.featureHoverTest();
await layerTest.featureStyleTest();
await layerTest.styleParserTest();

await locationTest.createTest();
await locationTest.getTest();
await locationTest.decorateTest();
await locationTest.nnearestTest();
// await booleanTest();
