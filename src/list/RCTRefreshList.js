import React, {Component} from 'react';
import {View, StyleSheet} from 'react-native';
import CommonHeaderView from './RCTHeaderView';
import CommonFooterView from './RCTFooterView';
import RefreshableList from './RefreshableList';
import RCTHeaderState from './state/RCTHeaderState';
import RCTFooterState from './state/RCTFooterState';
import PropTypes from 'prop-types';

export default class RCTRefreshList extends Component {

    constructor(props){
        super(props);
        this.state = {
            isRefreshing: false,
            headerHeight: 0,
            footerState: RCTFooterState.CanLoaded,
            loadMoreCompleted: true,
            showContent: true
        }
    }

    static propTypes = {
        pullRefresh: PropTypes.func,
        loadMore: PropTypes.func
    }

    render()  {
        return(
            <RefreshableList
                {...this.props}
                ref={(ref) => this.list = ref}
                onPullStateChange={this._onPullStateChange}
                renderHeaderComponent={() => this._renderHeaderComponent()}
                pullRefresh={() => this._pullRefresh()}
                onEndReached={() => this._shouldLoadMore()}
                onEndReachedThreshold={0.1}
                footerState={this.state.footerState}
                ListFooterComponent={() => this._renderFooterComponent()}/>
        );
    }

    _onPullStateChange = ({pullState, isRefreshing, offset}) => {
        this.setState({
            showContent: pullState != RCTHeaderState.RELEASING,
            headerHeight: offset,
            isRefreshing
        });
    }

    _renderHeaderComponent() {
        return(
            <CommonHeaderView
                ref={(ref) => this.headerView = ref}
                showContent={this.state.showContent}
                headerHeight={this.state.headerHeight}
                isRefreshing={this.state.isRefreshing}
                isReleaseRefresh={this.state.headerHeight >= 80}/>
        );
    }

    _renderFooterComponent() {
        return(
            <CommonFooterView
                state={this.state.footerState}
                onReload={this._shouldLoadMore}/>
        );
    }

    _pullRefresh() {
        this.setState({
            footerState: RCTFooterState.Hide
        }, () => this.props.pullRefresh && this.props.pullRefresh());
    }

    _shouldLoadMore() {
        if (!this.state.isRefreshing && this.state.loadMoreCompleted && this.state.footerState != RCTFooterState.NoMore) {
            this.setState({
                loadMoreCompleted: false,
                footerState: RCTFooterState.Loading
            }, () => this.props.loadMore && this.props.loadMore());
        }
    }

    loadCompleted(footerState: RCTFooterState) {
        let state = footerState;
        if (this.state.isRefreshing) {
            state = RCTFooterState.CanLoaded;
        }
        this.list.refreshCompleted();
        if ((this.props.type === 'flatList' && (this.props.data == null || this.props.data.length == 0))
            || (this.props.type === 'sectionList' && (this.props.sections.length == 0))) {
            state = RCTFooterState.Hide;
        }
        this.setState({
            loadMoreCompleted: true,
            footerState: state
        });
    }
}
