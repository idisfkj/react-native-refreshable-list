import React, {Component} from 'react';
import {View, Animated, Easing, StyleSheet, ART} from 'react-native';
import RCTHeaderState from './state/RCTHeaderState';
import PropTypes from 'prop-types';
import UIUtils from '../utils/UIUtils';

const {px2dp, width} = UIUtils;
const {Surface, Shape, Path} = ART;

var loadingTimeout;
var inTimeout;
var outTimeout;

export default class RCTHeaderView extends Component {

    constructor(props) {
        super(props);
        this.state ={
            arcOuter: false,
            arcX: 0,
            arcY: 0
        }

        this.arcPan = new Animated.Value(0);
        this.arcPan.addListener(({value}) => {
            this.setState({
                arcX: -Math.sin(value * 360 * Math.PI / 180) * px2dp(17),
                arcY: (1 - Math.cos(value * 360 * Math.PI / 180)) * px2dp(17),
                arcOuter: value > 0.5
            });
        });

        this.opacityPan = new Animated.Value(0);
        this.opacity = this.opacityPan.interpolate({
            inputRange: [0, 1],
            outputRange: [1, 0.2]
        });

        this.scalePan = new Animated.Value(0);
        this.scale = this.scalePan.interpolate({
            inputRange: [0, 1],
            outputRange: [1, 0.6]
        });
    }

    static propTypes = {
        showLine: PropTypes.bool,
        isRefreshing: PropTypes.bool,
        headerHeight: PropTypes.number
    }

    render() {
        return(
            <View style={styles.container}>
                {this._renderLineView()}
                {this._renderCircleView()}
            </View>
        );
    }

    _renderLineView() {
        if (this.props.showLine && !this.props.isRefreshing) {
            return(
                <View style={styles.lineView} height={this.props.headerHeight - px2dp(50)}/>
            );
        }
    }

    _renderCircleView() {
        if (this.props.isRefreshing) {
            const path = new Path()
            .moveTo(px2dp(18),px2dp(1))
            .arc(this.state.arcX, this.state.arcY, px2dp(17), 0, this.state.arcOuter, true, 1);
            return(
                <View style={styles.circleView} marginTop={this.props.headerHeight - px2dp(50)}>
                    <Surface width={px2dp(36)} height={px2dp(36)}>
                        <Shape d={path} stroke='black' strokeWidth={px2dp(1)}/>
                    </Surface>
                    <Animated.Image
                        style={[styles.loadingImage,
                        {opacity: this.opacity,
                        transform: [{scale: this.scale}]}
                        ]}
                        source={require('../image/icy_default_loading.png')}/>
                </View>
            )
        }
    }

    startPullingAniamted() {
        clearTimeout(this.loadingTimeout);
        clearTimeout(this.inTimeout);
        clearTimeout(this.outTimeout);
        this._loadingAnimated();
        this.inTimeout = setTimeout(() => {
            this._loadingInAnimated();
        }, 50);
        this.outTimeout = setTimeout(() => {
            this._loadingOutAnimated();
        }, 400);
    }

    _loadingAnimated() {
        this.arcPan.setValue(0);
        Animated.timing(this.arcPan, {
            toValue: 1,
            easing: Easing.linear,
            duration: 400
        }).start(() => {
            if (this.props.isRefreshing) {
                this.loadingTimeout = setTimeout(() => {
                    this._loadingAnimated();
                }, 1200);
            }
        });
    }

    _loadingInAnimated() {
        this.opacityPan.setValue(0);
        this.scalePan.setValue(0);
        Animated.parallel([
            Animated.timing(this.opacityPan, {
                toValue: 1,
                easing: Easing.linear,
                duration: 10
            }),
            Animated.timing(this.scalePan, {
                toValue: 1,
                easing: Easing.linear,
                duration: 10
            })
        ]).start(() => {
            if (this.props.isRefreshing) {
                this.inTimeout = setTimeout(() => {
                    this._loadingInAnimated();
                }, 1540);
            }
        });
    }

    _loadingOutAnimated() {
        this.opacityPan.setValue(1);
        this.scalePan.setValue(1);
        Animated.parallel([
            Animated.timing(this.opacityPan, {
                toValue: 0,
                easing: Easing.linear,
                duration: 200
            }),
            Animated.timing(this.scalePan, {
                toValue: 0,
                easing: Easing.linear,
                duration: 200
            })
        ]).start(() => {
            if (this.props.isRefreshing) {
                this.outTimeout = setTimeout(() => {
                    this._loadingOutAnimated(0);
                }, 1400)
            }
        });
    }
}

const styles = StyleSheet.create({
    container:{
        width,
        alignItems: 'center'
    },
    lineView: {
        width: px2dp(1),
        backgroundColor: 'black'
    },
    circleView: {
        position: 'absolute',
        left: 0,
        top: 0,
        width,
        height: px2dp(36),
        justifyContent: 'center',
        alignItems: 'center'
    },
    loadingImage: {
        position: 'absolute',
        left: (width - px2dp(15)) / 2,
        top: px2dp(15) / 2,
        width: px2dp(15),
        height: px2dp(20)
    }
});
