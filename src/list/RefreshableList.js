import React, {Component} from 'react';
import {View, Image, FlatList, SectionList, StyleSheet, PanResponder, Animated, Easing, ART} from 'react-native';
import UIUtils from '../utils/UIUtils';
import RCTHeaderView from './RCTHeaderView';
import RCTFooterView from './RCTFooterView';
import RCTHeaderState from './state/RCTHeaderState';
import RCTFooterState from './state/RCTFooterState';
import PropTypes from 'prop-types';

const {px2dp, width, onePixel, height} = UIUtils;
const {Surface, Shape, Path} = ART;
const isPullDown = (x, y) => y > 0 && y > Math.abs(x);
const isPullUp = (x, y) => y < 0 && Math.abs(y) > Math.abs(x);
const isVerticalGesture = (x, y) => Math.abs(y) > Math.abs(x);

export default class RefreshableFlatList extends Component {

    constructor(props){
        super(props);
        this._renderHeaderComponent = this._renderHeaderComponent.bind(this);
        this.state = {
            isRefreshing: false,
            pullState: RCTHeaderState.IDLE,
            reset: true,
            headerWidth: 0,
            scrollEnabled: false,
            contentHeight: 0,
            listHeight: 0
        };
        this.headerHeight = 0;
        this.releaseInertiaPosition = 0;
        this.releaseInertiaStart = false;
        this.headerHeightOffset = 0;
        this.offsetY = 0;

        this.pullPan = new Animated.ValueXY({x: 0, y: 0});
        this.pullPan.addListener((value) => {
            if (!this.state.reset && value.y === 0) {
                this.setState({
                    reset: true
                });
            }
            this.headerHeight = value.y;
            this._onPullStateChange();
            this.headerView.setNativeProps({
                style: {
                    height: this.headerHeight
                }
            });
        });

        this.scrollPan = new Animated.ValueXY({x: 0, y: 0});
        this.scrollPan.addListener((value) => {
            if (!this.releaseInertiaStart && value.y == this.releaseInertiaPosition) {
                this.releaseInertiaStart = true;
            }
            if (value.y != 0 && this.releaseInertiaStart &&
                ((value.y > 0 && this.releaseInertiaPosition > 0) || (value.y < 0 && this.releaseInertiaPosition < 0))) {
                this._scrollTo(-value.y)
                this.releaseInertiaPosition = value.y;
            }
        });

        this._panResponder = PanResponder.create({
        onStartShouldSetPanResponderCapture: this._onStartShouldSetPanResponderCapture,
        onStartShouldSetPanResponder: this._shouldSetPanResponder,
        onMoveShouldSetPanResponder: this._shouldSetPanResponder,
        onPanResponderGrant: (evt, gestureState) => {},
        onPanResponderMove: this._panResponderMove,
        onPanResponderTerminationRequest: (evt, gestureState) => true,
        onPanResponderRelease: this._panResponderRelease
      });
    }

    _onStartShouldSetPanResponderCapture = () => {
        Animated.decay(this.scrollPan).stop();
        return false;
    }

    _shouldSetPanResponder = (evt, gestureState) => {
        if (!this.state.scrollEnabled) {
            this.headerHeightOffset = this.headerHeight;
            Animated.timing(this.pullPan).stop();
            return true;
        }
        return false;
    }

    _panResponderMove = (evt, gestureState) => {
        const contentOffset = this.state.contentHeight - this.state.listHeight;
        if (isPullDown(gestureState.dx, gestureState.dy)) {
            //判断是否有滑动偏移
            this._movePullDown(gestureState.dx, gestureState.dy, contentOffset);
        } else if (isPullUp(gestureState.dx, gestureState.dy)) {
            //可以滑动&不处于下拉状态
            this._movePullUp(gestureState.dx, gestureState.dy, contentOffset);
        }
    }

    _panResponderRelease = (evt, gestureState) => {
        //不处于刷新进行中
        if (!this.state.isRefreshing) {
            if (this.headerHeight > 0) {
                //正常释放
                this._normalRelease();
            } else if(Math.abs(gestureState.vy) > 0) {
                //惯性处理
                this._inertiaRelease(gestureState.dx, gestureState.dy, gestureState.vx, gestureState.vy);
            }
        } else {
            this.setState({
                pullState: RCTHeaderState.LOADING
            }, () => this._onPullStateChange());
        }
    }

    _movePullDown(dx, dy, contentOffset) {
        if (this.offsetY > 0 && contentOffset > 0) {
            this._scrollTo(-dy)
            this.setState({
                pullState: RCTHeaderState.IDLE
            }, () => this._onPullStateChange());
        } else {
            this.headerHeight = (this.headerHeightOffset + dy <= this.props.pullBoundary ? (this.headerHeightOffset + dy) :
                this.props.pullBoundary + (this.headerHeightOffset + dy - this.props.pullBoundary) / this.props.factor);
            this.headerView.setNativeProps({
                style: {
                    height: this.headerHeight
                }
            });
            this.setState({
                pullState: RCTHeaderState.PULLING
            }, () => this._onPullStateChange());
        }
    }

    _movePullUp(dx, dy, contentOffset) {
        if (contentOffset > 0 && this.headerHeight <= 0) {
            this._scrollTo(-dy);
            this.setState({
                pullState: RCTHeaderState.IDLE
            }, () => this._onPullStateChange());
        } else if (this.headerHeight > 0) {
            this.headerHeight = (this.headerHeightOffset + dy <= this.props.pullBoundary ? (this.headerHeightOffset + dy) :
                this.props.pullBoundary + (this.headerHeightOffset + dy - this.props.pullBoundary) / this.props.factor);
            this.headerView.setNativeProps({
                style: {
                    height: this.headerHeight
                }
            });
            this.setState({
                pullState: RCTHeaderState.PULLING
            }, () => this._onPullStateChange());
        }
    }

    _normalRelease() {
        //未到达边界 | 已经刷新完成，但刷新未重置
        if (this.headerHeight < this.props.pullBoundary || !this.state.reset) {
            this._pullRelease();
        } else {
            //到达边界 & 刷新状态已重置
            this.setState({
                pullState: RCTHeaderState.LOADING,
                isRefreshing: true,
                reset: false
            }, () => {
                this.props.pullRefresh();
                this._onPullStateChange();
            });
        }

    }

    _inertiaRelease(dx, dy, vx, vy) {
        this.releaseInertiaStart = false;
        this.releaseInertiaPosition = dy;
        this.scrollPan.setValue({x: dx, y: dy});
        Animated.decay(this.scrollPan, {
            velocity: {x: vx, y: vy},
            deceleration: 0.997,
        }).start();
    }

    _scrollTo(dy) {
        if (this.props.type === 'flatList') {
            this.list.scrollToOffset({offset: dy});
        } else {
            this.list._wrapperListRef._listRef.scrollToOffset({offset: dy})
        }
    }

    static propTypes = {
        pullRefresh: PropTypes.func,
        onPullStateChange: PropTypes.func,
        renderHeaderComponent: PropTypes.func,
        pullBoundary: PropTypes.number,
        factor: PropTypes.number,
        headerBackgroundColor: PropTypes.string,
        type: PropTypes.oneOf(['flatList', 'sectionList'])
    }

    static defaultProps = {
        onPullStateChange: () => {},
        pullRefresh: () => {},
        renderHeaderComponent: () => {},
        pullBoundary: px2dp(80),
        factor: 10,
        headerBackgroundColor: 'white',
        type: 'flatList'
    }

    render() {
        return(
            <View style={styles.container}
                {...this._panResponder.panHandlers}>
                {this._renderHeaderComponent()}
                {this._renderList()}
            </View>
        );
    }

    _renderList() {
        if (this.props.type === 'flatList') {
            return(
                <FlatList
                    {...this.props}
                    ref={(ref) => {this.list = ref;}}
                    scrollEnabled={this.state.scrollEnabled}
                    onLayout={this._onLayout}
                    onContentSizeChange={(w, h) => {this.setState({contentHeight: h});}}
                    showsVerticalScrollIndicator={false}
                    onScroll={this._onScroll}/>
            )
        } else {
            return(
                <SectionList
                    {...this.props}
                    ref={(ref) => {this.list = ref;}}
                    scrollEnabled={this.state.scrollEnabled}
                    onLayout={this._onLayout}
                    onContentSizeChange={(w, h) => {this.setState({contentHeight: h});}}
                    showsVerticalScrollIndicator={false}
                    onScroll={this._onScroll}/>
            )
        }
    }

    _renderHeaderComponent() {
        return(
            <View
                ref={(ref) => this.headerView = ref}
                style={{width: this.state.headerWidth, height: this.headerHeight,
                backgroundColor: this.props.headerBackgroundColor, alignItems: 'center'}}>
                {this.props.renderHeaderComponent()}
            </View>
        );
    }

    _onLayout = (e) => {
        this.setState({
            headerWidth: e.nativeEvent.layout.width,
            listHeight: e.nativeEvent.layout.height
        });
    }

    _onScroll = (e) => {
        this.offsetY = e.nativeEvent.contentOffset.y + e.nativeEvent.contentInset.top;
        this.setState({
            scrollEnabled: this.offsetY > 0
        });
    }

    _pullRelease() {
        this.setState({
            pullState: RCTHeaderState.RELEASING
        });
        this.pullPan.setValue({x: 0, y: this.headerHeight});
        Animated.timing(this.pullPan, {
            toValue: {x: 0, y: 0},
            easing: Easing.linear,
            duration: 300
        }).start();
    }

    _onPullStateChange() {
        this.props.onPullStateChange({
            pullState: this.state.pullState,
            offset: this.headerHeight,
            isRefreshing: this.state.isRefreshing
        });
    }

    refreshCompleted(footerState: RCTFooterState) {
        if (this.state.isRefreshing) {
        if (this.state.pullState != RCTHeaderState.PULLING) {
            this._pullRelease();
        }
            this.setState({
                isRefreshing: false
            }, () => this._onPullStateChange());
        }
    }

    componentWillUnmount() {
        this.scrollPan.removeAllListeners();
        this.pullPan.removeAllListeners();
    }

}

const styles = StyleSheet.create({
    container: {
        flex: 1
    }
});
