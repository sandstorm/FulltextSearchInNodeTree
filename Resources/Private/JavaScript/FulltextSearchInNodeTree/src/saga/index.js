import {put, select, race, take, call, takeLatest} from 'redux-saga/effects';
import {$get} from 'plow-js';
import {actionTypes} from '../redux/index';
import {actions as neosActions, selectors as neosSelectors} from '@neos-project/neos-ui-redux-store';
import backend, {fetchWithErrorHandling} from '@neos-project/neos-ui-backend-connector';
//
// Helper function to check if the node is collapsed
//
const isNodeCollapsed = (node, isToggled, rootNode, loadingDepth) => {
    const isCollapsedByDefault = loadingDepth === 0 ? false : $get('depth', node) - $get('depth', rootNode) >= loadingDepth;
    return (isCollapsedByDefault && !isToggled) || (!isCollapsedByDefault && isToggled);
};


export function * watchFulltextSearch({configuration}) {
    yield takeLatest(actionTypes.COMMENCE_FULLTEXT_SEARCH, function * searchForNode(action) {
        const {contextPath, query: searchQuery, filterNodeType} = action.payload;

        if (!searchQuery && !filterNodeType) {
            return;
        }

        yield put(neosActions.UI.PageTree.setAsLoading(contextPath));
        let matchingNodes = [];

        try {
            const response = yield fetchWithErrorHandling.withCsrfToken(csrfToken => ({
                url: '/neos/node-tree-fulltext-search',

                method: 'POST',
                credentials: 'include',
                headers: {
                    'X-Flow-Csrftoken': csrfToken,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    site: contextPath,
                    searchQuery
                })
            }));
            matchingNodes = yield response.json();
        } catch (err) {
            console.error('Error while executing a tree search: ', err);
            yield put(neosActions.UI.PageTree.invalidate(contextPath));
            yield put(neosActions.UI.FlashMessages.add('searchError', 'There was an error searching in the node tree. Contact your administrator for fixing this issue.', 'error'));
            return;
        }
        const siteNode = yield select(neosSelectors.CR.Nodes.siteNodeSelector);
        const loadingDepth = configuration.nodeTree.loadingDepth;

        if (matchingNodes.length > 0) {
            const nodes = matchingNodes.reduce((map, node) => {
                map[$get('contextPath', node)] = node;
                return map;
            }, {});

            yield put(neosActions.CR.Nodes.merge(nodes));

            const resultContextPaths = new Set(Object.keys(nodes));
            const oldHidden = yield select($get('ui.pageTree.hidden'));
            const hiddenContextPaths = oldHidden.subtract(resultContextPaths);

            const toggledContextPaths = [];
            const intermediateContextPaths = [];

            Object.keys(nodes).forEach(contextPath => {
                const node = nodes[contextPath];
                if (node.intermediate) {
                    // We reset all toggled state before search, so we can assume "isToggled == false" here
                    const isToggled = false;
                    const isCollapsed = isNodeCollapsed(node, isToggled, siteNode, loadingDepth);
                    if (isCollapsed) {
                        toggledContextPaths.push(contextPath);
                    }

                    if (!node.matched) {
                        intermediateContextPaths.push(contextPath);
                    }
                }
            });

            const result = {
                hiddenContextPaths,
                toggledContextPaths,
                intermediateContextPaths
            };

            yield put(neosActions.UI.PageTree.setSearchResult(result));
        }

        yield put(neosActions.UI.PageTree.setAsLoaded(contextPath));
    });
}
