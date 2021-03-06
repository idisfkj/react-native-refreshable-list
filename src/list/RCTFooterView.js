import React, {Component} from 'react';
import {View, Text, ActivityIndicator, StyleSheet, TouchableWithoutFeedback} from 'react-native';
import FooterState from './state/RCTFooterState';
import PropTypes from 'prop-types';
import UIUtils from '../utils/UIUtils';

const {px2dp, onePixel} = UIUtils;

export default class RCTFooterView extends Component {

    static propTypes = {
        onReload: PropTypes.func
    }

    static defaultProps = {
        pullLoad: 'pull up load',
        loading: 'loading ...',
        noMoreData: 'no more data',
        loadFailure: 'loadFailure'
    }

    render(){
        let footerView;
        switch (this.props.state) {
            case FooterState.Hide:
                footerView = <View/>
                break;
            case FooterState.Loading:
                footerView = this._createLoadingView();
                break;
            case FooterState.CanLoaded:
                footerView = this._createCanLoadedView();
                break;
            case FooterState.NoMore:
                footerView = this._createNoMoreView();
                break;
            case FooterState.LoadFailure:
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
                <Text style={styles.footerContent}>{this.props.loading}</Text>
            </View>
        );
    }

    _createCanLoadedView() {
        return (
            <View style={styles.container}>
                <Text style={styles.footerContent}>{this.props.pullLoad}</Text>
            </View>
        );
    }

    _createNoMoreView() {
        return (
            <View style={styles.container}>
                <Text style={styles.footerContent}>{this.props.noMoreData}</Text>
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
        width: px2dp(150),
        textAlign: 'center',
        fontSize: 18,
        color: 'gray'
    }
});
