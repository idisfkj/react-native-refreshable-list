# react-native-refreshable-list
The best Refreshable List  component for React Native.

# Install

```
yarn add react-native-refreshable-list
# or with npm
npm install --save react-native-refreshable-list
```

# Quick Start

```
import {RCTRefreshList, RCTFooterState} from 'react-native-refreshable-list';
....
....

render() {
    return(
        <RCTRefreshList
            style={styles.container}
            ref={(ref) => this.list = ref}
            type={'flatList'}
            data={this.state.data}
            renderItem={this._renderItem}
            ItemSeparatorComponent={this._renderSeparatorComponent}
            pullRefresh={() => this._pullRefresh()}
            loadMore={() => this._loadMore()}
            keyExtractor={(item, index) => index.toString()}/>
    );
}

_renderItem(info) {
    return (
        <Text style={styles.text}>{info.item}</Text>
    );
}

_renderSeparatorComponent() {
    return(
        <View style={styles.line}></View>
    );
}

_pullRefresh() {
    var data = [];
    for(var i = 0; i < 20; i++) {
        data.push('item' + i);
    }
    setTimeout(() => {
        this.setState({
            data
        }, () => this.list.loadCompleted());
    }, 1500);
}

_loadMore() {
    var data = [];
    var size = this.state.data.length;
    for(var i = size; i < size + 20; i++){
        data.push('item' + i);
    }
    setTimeout(() => {
        this.setState({
            data: this.state.data.concat(data)
        }, () => this.list.loadCompleted(RCTFooterState.CanLoaded));
    }, 3000);
}

....
....
```

# Feature

## Custom PropTypes

* type: List types, optional values for `flatList` with `sectionList`.
* pullRefresh: List refreshing callback.
* loadMore: List loadMore callback.

## Native PropTypes

Support most of the primary attributes, for example:

* data: List data of FlatList.
* sections: List data of SectionList.
* renderItem: In the list of child components.
, etc.

> Note: the native refresh method cannot be used. For example: *onRefresh*、*refreshing*, Because the library have their own a refresh mechanism.

## Method Call

* loadCompleted: Refresh after the completion of the call. Optional parameter `RCTFooterState`.

`RCTFooterState` is a state of tensile load more. So it has the following optional values:

* Hide
* Loading
* CanLoaded
* NoMore
* LoadFailure

The effect of them all for their literal meaning.

# Custom Use

todo ...
