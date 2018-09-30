import React, {Component} from 'react';
import RCTHeaderView from './RCTHeaderView';
import RCTFooterView from './RCTFooterView';
import RCTHeaderState from './state/RCTHeaderState';
import RCTFooterState from './state/RCTFooterState';
import RefreshableList from './RefreshableList';
import PropTypes from 'prop-types';

export default class RCTRefreshList extends Component {

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
                onEndReached={() => this._shouldLoadMore()}
                onEndReachedThreshold={0.1}
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
            <RCTHeaderView
                ref={(ref) => this.headerView = ref}
                showLine={this.state.showLine}
                isRefreshing={this.state.isRefreshing}
                headerHeight={this.state.headerHeight}/>
        );
    }

    _renderFooterView() {
        return(
            <RCTFooterView
                state={this.state.footerState}
                onReload={() => this._shouldLoadMore()}/>
        );
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
