'use strict';

import {Dimensions, PixelRatio, NativeModules, Platform} from 'react-native';

const {width, height} = Dimensions.get('window');
const uiDevicesWidth = 375;

function px2dp(uiWidth) {
    return uiWidth * width / uiDevicesWidth;
}

export default {
    px2dp,
    width,
    height,
    onePixel: 1 / PixelRatio.get()
}
