import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import debounce from 'lodash.debounce';
import {$get} from 'plow-js';
import {Icon, IconButton, TextInput} from '@neos-project/react-ui-components';
import {neos} from '@neos-project/neos-ui-decorators';
import {actions} from './redux/index';
import {selectors} from '@neos-project/neos-ui-redux-store'
import style from './style.css';

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
        searchValue: ''
    };

    constructor(props, ...args) {
        super(props, ...args);

        this.debouncedCommenceSearch = debounce(props.commenceSearch, searchDelay);
    }

    handleSearchChange = query => {
        const {rootNode} = this.props;
        const contextPath = $get('contextPath', rootNode);
        this.debouncedCommenceSearch(contextPath, {query});
        this.setState({searchValue: query});
    }

    handleClearClick = () => {
        const {commenceSearch, rootNode} = this.props;
        const contextPath = $get('contextPath', rootNode);
        this.setState({
            searchValue: ''
        });
        commenceSearch(contextPath, {query: ''});
    }

    render() {
        const {searchValue} = this.state;

        return (
            <div className={style.searchBar}>
                <Icon
                    icon="search"
                    className={style.placeholderIcon}
                    onClick={this.handleClearClick}
                />
                <TextInput
                    placeholder="Volltext-Suche"
                    onChange={this.handleSearchChange}
                    type="search"
                    value={searchValue}
                    containerClassName={style.searchInput}
                />
                {(searchValue.length > 0) && (
                    <IconButton
                        icon="times"
                        onClick={this.handleClearClick}
                    />
                )}
            </div>
        );
    }
}
