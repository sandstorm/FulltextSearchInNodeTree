import manifest from '@neos-project/neos-ui-extensibility';
import FulltextPageTreeSearchBar from './FulltextPageTreeSearchbar';
import {watchFulltextSearch} from './saga/index';
import {reducer} from './redux/index';

manifest('Sandstorm.FulltextSearchInNodeTree', {}, (globalRegistry) => {
    const containerRegistry = globalRegistry.get('containers');
    containerRegistry.set('LeftSideBar/Top/FulltextPageTreeSearchbar', FulltextPageTreeSearchBar, 'before LeftSideBar/Top/PageTreeSearchbar');

    const sagasRegistry = globalRegistry.get('sagas');
    sagasRegistry.set('Sandstorm.FulltextSearch/watchFulltextSearch', {saga: watchFulltextSearch});

    const reducersRegistry = globalRegistry.get('reducers');
    reducersRegistry.set('Sandstorm.FulltextSearch', {reducer: reducer});
});
