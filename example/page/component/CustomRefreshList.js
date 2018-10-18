import React, {Component} from 'react';
import CustomHeaderView from './CustomHeaderView';
import CustomFooterView from './CustomFooterView';
import {RCTHeaderState, RCTFooterState, RefreshableList} from 'react-native-refreshable-list';
import PropTypes from 'prop-types';

export default class CustomRefreshList extends Component {

    constructor(props){
        super(props);
        this._renderHeaderComponent = this._renderHeaderComponent.bind(this);
        this.state = {
            isRefreshing: false,
            footerState: RCTFooterState.CanLoaded,
            loadMoreCompleted: true,
            headerHeight: 0,
            showLine: true
        };
    }

    static propTypes = {
        pullRefresh: PropTypes.func,
        loadMore: PropTypes.func
    }

    render() {
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
                ListFooterComponent={() => this._renderFooterView()}/>
        );
    }

    _onPullStateChange = ({pullState, isRefreshing, offset}) => {
        this.setState({
            showLine: pullState === RCTHeaderState.PULLING || pullState === RCTHeaderState.IDLE,
            isRefreshing,
            headerHeight: offset
        });
        if (pullState === RCTHeaderState.LOADING) {
            this.headerView.startPullingAniamted();
        }
    }

    _renderHeaderComponent() {
        return(
            <CustomHeaderView
                ref={(ref) => this.headerView = ref}
                showLine={this.state.showLine}
                isRefreshing={this.state.isRefreshing}
                headerHeight={this.state.headerHeight}/>
        );
    }

    _renderFooterView() {
        return(
            <CustomFooterView
                state={this.state.footerState}
                onReload={() => this._shouldLoadMore()}/>
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
            }, () => this.props.loadMore());
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
