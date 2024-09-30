import { base } from '../../public/tests/_base.test.mjs';
import { layerTest } from '../lib/layer/_layer.test.mjs';
import { dictionaryTest } from '../lib/dictionaries/_dictionaries.test.mjs';
import { locationTest } from '../lib/location/_location.test.mjs';
import { mapviewTest } from '../lib/mapview/_mapview.test.mjs';
import { pluginsTest } from '../plugins/_plugins.test.mjs';
import { setView } from '../utils/view.js';
import { workspaceTest } from '../mod/workspace/_workspace.test.mjs'
import { queryTest } from '../mod/query.test.mjs';
import { userTest } from '../mod/user/_user.test.js';
import { ui_elementsTest } from '../lib/ui/elements/_elements.test.mjs';

import { ui_layers } from '../lib/ui/layers/_layers.test.mjs';
import { entriesTest } from '../lib/ui/locations/entries/_entries.test.mjs';
import { uiTest } from '../lib/ui/_ui.test.mjs';
import { formatTest } from '../lib/layer/format/_format.test.mjs';
import { ui_locations } from '../lib/ui/locations/_locations.test.mjs';

//API Tests
await workspaceTest();
await queryTest();

await runAllTests(userTest);

const mapview = await base();

// Run the dictionary Tests
await runAllTests(dictionaryTest, mapview);

//Plugins Tests
await runAllTests(pluginsTest);

//Layer Tests
await runAllTests(layerTest, mapview);

//Location Tests
await runAllTests(locationTest, mapview);

await runAllTests(mapviewTest, mapview);

await runAllTests(ui_elementsTest, mapview);

await runAllTests(entriesTest, mapview);

await runAllTests(ui_layers, mapview);

await runAllTests(uiTest);

await runAllTests(formatTest, mapview);

await runAllTests(ui_locations);

async function runAllTests(tests, mapview) {
    const testFunctions = Object.values(tests).filter(item => typeof item === 'function');

    for (const testFn of testFunctions) {
        try {
            await testFn(mapview);
        } catch (error) {
            console.error(`Error in test ${testFn.name}:`, error);
        }
    }
}