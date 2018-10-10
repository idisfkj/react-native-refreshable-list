import React, {Component} from 'react';
import {View, Text, StyleSheet, Animated, Easing, ActivityIndicator} from 'react-native';
import PropTypes from 'prop-types';
import UIUtils from '../utils/UIUtils';

const {width, px2dp} = UIUtils;

export default class RCTHeaderView extends Component {
    constructor(props){
        super(props);
        this.state = {
            content: this.props.pullRefresh
        }
        this.rotatePan = new Animated.Value(0);
        this.rotate = this.rotatePan.interpolate({
            inputRange: [0, 1],
            outputRange: ['0deg', '180deg']
        });
    }

    static propTypes = {
        headerHeight: PropTypes.number,
        isRefreshing: PropTypes.bool,
        isReleaseRefresh: PropTypes.bool,
        showContent: PropTypes.bool
    }

    static defaultProps = {
        pullRefresh: 'pull down refresh',
        releaseRefresh: 'release to refresh',
        refreshing: 'refreshing ...'
    }

    render() {
        if (this.props.showContent) {
            return(
                <View style={styles.container} marginTop={this.props.headerHeight - px2dp(37)}>
                    {this._renderIndicator()}
                    <Text style={styles.text}>{this._getHeaderContent()}</Text>
                </View>
            );
        } else {
            this._startArrowAnimated(false);
            return(
                <View></View>
            );
        }
    }

    _renderIndicator() {
        if (this.props.isRefreshing) {
            this._startArrowAnimated(true);
            return(
                <ActivityIndicator size="small" color="#aaaaaa" />
            );
        } else {
            return(
                <Animated.Image
                    style={[styles.image, {
                        transform: [{rotate: this.rotate}]
                    }]}
                    source={require('../image/arrow_18dp.png')}/>
            );
        }
    }

    _getHeaderContent() {
        if (!this.props.isReleaseRefresh) {
            if(this.state.content != this.props.pullRefresh){
                this.state.content = this.props.pullRefresh
                this._startArrowAnimated(false)
            }
            return this.props.pullRefresh;
        } else if(!this.props.isRefreshing){
            if(this.state.content != this.props.releaseRefresh){
                this.state.content = this.props.releaseRefresh
                this._startArrowAnimated(true);
            }
            return this.props.releaseRefresh;
        } else {
            return this.props.refreshing;
        }
    }

    _startArrowAnimated(upward) {
        Animated.timing(this.rotatePan, {
            toValue: upward? 1 : 0,
            duration: 1,
            easing: Easing.linear
        }).start();
    }

    componentWillUnmount() {
        this.rotatePan.removeAllListeners();
    }
}

const styles = StyleSheet.create({
    container: {
        width,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row'
    },
    image: {
        width: px2dp(25),
        height: px2dp(25)
    },
    text: {
        fontSize: 18,
        width: px2dp(150),
        height: px2dp(25),
        color: 'gray',
        textAlign: 'center'
    }
});
