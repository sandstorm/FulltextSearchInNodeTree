import {createAction} from 'redux-actions';
import {Map, Set} from 'immutable';
import {$all, $get, $set, $remove, $add, $toggle} from 'plow-js';

import {handleActions} from '@neos-project/utils-redux';

const COMMENCE_FULLTEXT_SEARCH = '@Sandstorm/FulltextSearchInNodeTree/UI/PageTree/COMMENCE_SEARCH';
//
// Export the action types
//
export const actionTypes = {
    COMMENCE_FULLTEXT_SEARCH,
};

const commenceFulltextSearch = createAction(COMMENCE_FULLTEXT_SEARCH, (contextPath, {query, filterNodeType}) => ({contextPath, query, filterNodeType}));

//
// Export the actions
//
export const actions = {
    commenceFulltextSearch,
};

//
// Export the reducer
//
export const reducer = handleActions({
    [COMMENCE_FULLTEXT_SEARCH]: ({query, filterNodeType}) => state => {
        if (!query && !filterNodeType) {
            return $all(
                $set('ui.pageTree.hidden', new Set()),
                $set('ui.pageTree.intermediate', new Set()),
                $set('ui.pageTree.toggled', new Set())
            )(state);
        }

        const hiddenContextPaths = new Set([...$get('cr.nodes.byContextPath', state).keys()]);

        return $all(
            $set('ui.pageTree.hidden', hiddenContextPaths.delete($get('cr.nodes.siteNode', state))),
            $set('ui.pageTree.toggled', new Set())
        )(state);
    },
});
