import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import debounce from 'lodash.debounce';
import {$get} from 'plow-js';

import {neos} from '@neos-project/neos-ui-decorators';
import {actions} from './redux/index';
import {selectors} from '@neos-project/neos-ui-redux-store'
import style from './style.css';
import NodeTreeSearchInput from './NodeTreeSearchInput';

const searchDelay = 300;

@connect(state => ({
    rootNode: selectors.CR.Nodes.siteNodeSelector(state)
}), {
    commenceSearch: actions.commenceFulltextSearch
})
export default class FulltextNodeTreeSearchBar extends PureComponent {

    static propTypes = {
        rootNode: PropTypes.object,
        commenceSearch: PropTypes.func.isRequired
    }

    state = {
        searchFocused: false,
        searchValue: '',
        filterNodeType: null
    };

    constructor(props, ...args) {
        super(props, ...args);

        this.debouncedCommenceSearch = debounce(props.commenceSearch, searchDelay);
    }

    handleSearchChange = query => {
        const {rootNode} = this.props;
        const contextPath = $get('contextPath', rootNode);
        this.debouncedCommenceSearch(contextPath, {query, filterNodeType: this.state.filterNodeType});
        this.setState({searchValue: query});
    }

    handleFilterChange = filterNodeType => {
        const {rootNode, commenceSearch} = this.props;
        const contextPath = $get('contextPath', rootNode);
        commenceSearch(contextPath, {query: this.state.searchValue, filterNodeType});
        this.setState({filterNodeType});
    }

    handleSearchFocus = () => {
        this.setState({searchFocused: true});
    }

    handleSearchBlur = () => {
        this.setState({searchFocused: false});
    }

    handleClearClick = () => {
        const {commenceSearch, rootNode} = this.props;
        const contextPath = $get('contextPath', rootNode);
        this.setState({
            searchValue: '',
            showClear: false
        });
        commenceSearch(contextPath, {query: '', filterNodeType: this.state.filterNodeType});
    }

    render() {
        const {searchValue, searchFocused, filterNodeType} = this.state;

        const {rootNode} = this.props;
        const contextPath = $get('contextPath', rootNode);

        return (
            <div className={style.searchBar}>
                <NodeTreeSearchInput
                    value={searchValue}
                    focused={searchFocused}
                    onChange={this.handleSearchChange}
                    onFocus={this.handleSearchFocus}
                    onBlur={this.handleSearchBlur}
                    onClearClick={this.handleClearClick}
                />
            </div>
        );
    }
}
