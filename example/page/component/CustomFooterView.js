import React, {Component} from 'react';
import {View, Text, ActivityIndicator, StyleSheet, TouchableWithoutFeedback} from 'react-native';
import {RCTFooterState} from 'react-native-refreshable-list';
import PropTypes from 'prop-types';
import UIUtils from '../utils/UIUtils';

const {px2dp, onePixel} = UIUtils;

export default class CustomFooterView extends Component {

    static propTypes = {
        onReload: PropTypes.func
    }

    static defaultProps = {
        canLoadedContent: '上拉加载更多',
        noMoreContent: 'THE END',
        loadFailureContent: '加载失败，点击重试~'
    }

    render(){
        let footerView;
        switch (this.props.state) {
            case RCTFooterState.Hide:
                footerView = <View/>
                break;
            case RCTFooterState.Loading:
                footerView = this._createLoadingView();
                break;
            case RCTFooterState.CanLoaded:
                footerView = this._createCanLoadedView();
                break;
            case RCTFooterState.NoMore:
                footerView = this._createNoMoreView();
                break;
            case RCTFooterState.LoadFailure:
                footerView = this._createLoadFailure();
                break;
            default:
                footerView = <View/>
        }
        return footerView;
    }

    _createLoadingView() {
        return(
            <View style={styles.container}>
                <ActivityIndicator size="small" color="#aaaaaa" opacity={0.5}/>
            </View>
        );
    }

    _createCanLoadedView() {
        return (
            <View style={styles.container}>
                <Text style={styles.footerContent}>{this.props.canLoadedContent}</Text>
            </View>
        );
    }

    _createNoMoreView() {
        return (
            <View style={styles.container}>
                <View style={styles.lineView} marginRight={px2dp(14)}/>
                <Text style={styles.footerContent}>{this.props.noMoreContent}</Text>
                <View style={styles.lineView} marginLeft={px2dp(14)}/>
            </View>
        );
    }

    _createLoadFailure() {
        return (
            <View style={styles.container}>
                <TouchableWithoutFeedback onPress={() => this.props.onReload()}>
                    <View>
                        <Text style={styles.footerContent}>{this.props.loadFailureContent}</Text>
                    </View>
                </TouchableWithoutFeedback>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'row',
        height: px2dp(40),
        justifyContent: 'center',
        alignItems: 'center'
    },
    footerContent: {
        fontSize: 11,
        color: '#999'
    },
    lineView: {
        width: px2dp(35),
        height: onePixel,
        backgroundColor: '#999'
    }
});
