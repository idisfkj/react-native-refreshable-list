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
const isPullDown = (x, y) => y > 0;
const isPullUp = (x, y) => y < 0;
const isVerticalGesture = (x, y) => Math.abs(y) > Math.abs(x);

export default class RefreshableFlatList extends Component {

    constructor(props){
        super(props);
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
        this.scrollOffsetY = 0;

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
                this._scrollTo(-value.y + this.scrollOffsetY)
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
        this.isVertical = false;
        if (isVerticalGesture(gestureState.dx, gestureState.dy) && !this.state.scrollEnabled) {
            this.headerHeightOffset = this.headerHeight;
            this.scrollOffsetY = this.offsetY;
            Animated.timing(this.pullPan).stop();
            return true;
        }
        return false;
    }

    _panResponderMove = (evt, gestureState) => {
        const contentOffset = this.state.contentHeight - this.state.listHeight;
        if (!this.isVertical) {
            this.isVertical = isVerticalGesture(gestureState.dx, gestureState.dy);
        }
        if (this.isVertical) {
            if (isPullDown(gestureState.dx, gestureState.dy)) {
                //判断是否有滑动偏移
                this._movePullDown(gestureState.dx, gestureState.dy, contentOffset);
            } else if (isPullUp(gestureState.dx, gestureState.dy)) {
                //可以滑动&不处于下拉状态
                this._movePullUp(gestureState.dx, gestureState.dy, contentOffset);
            }
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
            this._scrollTo(-dy + this.scrollOffsetY);
            this.setState({
                pullState: RCTHeaderState.IDLE,
                scrollEnabled: true
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
            this._scrollTo(-dy + this.scrollOffsetY);
            this.setState({
                pullState: RCTHeaderState.IDLE,
                scrollEnabled: true
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
        // this.list.scrollTo(dy);
        // if (this.props.type === 'flatList') {
        this.list.scrollToOffset({offset: dy});
        // } else {
            // this.list._wrapperListRef._listRef.scrollToOffset({offset: dy})
        // }
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
                <FlatList
                    ref={(ref) => this.list = ref}
                    scrollEnabled={this.state.scrollEnabled}
                    data={['placeholder']}
                    renderItem={(info) => this._renderItem(info)}
                    onLayout={this._onLayout}
                    onScroll={this._onScroll}
                    onContentSizeChange={(w, h) => {this.setState({contentHeight: h});}}
                    showsVerticalScrollIndicator={false}
                    keyExtractor={(item, index) => index.toString()}/>
            </View>
        );
    }

    _renderItem(info) {
        return <ListComponent
            {...this.props}
            headerHeight={this.headerHeight}
            pullState={this.state.pullState}/>
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
        if (this.offsetY == 0) {
            this.setState({
                scrollEnabled: false
            });
        }
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

class ListComponent extends Component {
    render() {
        if (this.props.type === 'flatList') {
            return(
                <FlatList
                    {...this.props}
                    ref={(ref) => this.list = ref}
                    showsVerticalScrollIndicator={false}/>
            )
        } else {
            return(
                <SectionList
                    {...this.props}
                    ref={(ref) => this.list = ref}
                    showsVerticalScrollIndicator={false}/>
            )
        }
    }

    shouldComponentUpdate(nextProps, nextState) {
        if(this.props.type == 'flatList' && this.props.data != nextProps.data) {
            return true;
        }
        if(this.props.type == 'sectionList' && this.props.sections !=  nextProps.sections) {
            return true;
        }
        if (this.props.footerState != nextProps.footerState) {
            return true;
        }
        return false;
    }

}

const styles = StyleSheet.create({
    container: {
        flex: 1
    }
});
