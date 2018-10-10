# react-native-refreshable-list
The best Refreshable List  component for React Native.

# Demo
You can pass the `expo` to quickly see the effect of this project, click the link below.

[Install Demo](https://exp.host/@rouse/react-native-refreshable-list)

# Install

```
yarn add react-native-refreshable-list
# or with npm
npm install --save react-native-refreshable-list
```

# Quick Start

```
import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {RCTRefreshList, RCTFooterState} from 'react-native-refreshable-list';

export default class CommonRefreshListPage extends React.Component {

    constructor(props){
        super(props);
        this.state = {
            data: [],
            count: 0
        };
    }

    componentDidMount() {
        var data = [];
        for(var i =0; i < 20; i++){
            data.push('item' + i);
        }
        this.setState({
            data
        });
    }

    render() {
        return(
            <RCTRefreshList
                style={styles.container}
                ref={(ref) => this.list = ref}
                type={'flatList'}
                pullBoundary={80}
                headerBackgroundColor={'#f5f5f5'}
                factor={10}
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
            <ItemComponent content={info.item}/>
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
        this._pullTimeout = setTimeout(() => {
            console.log("setTimeout");
            this.setState({
                data,
                count: 0
            }, () => this.list.loadCompleted());
        }, 1500);
    }

    _loadMore() {
        if (this.state.count < 1) {
            var data = [];
            var size = this.state.data.length;
            for(var i = size; i < size + 20; i++){
                data.push('item' + i);
            }
            this._loadTimeout = setTimeout(() => {
                this.setState({
                    data: this.state.data.concat(data),
                    count: this.state.count + 1
                }, () => this.list.loadCompleted(RCTFooterState.CanLoaded));
            }, 3000);
        } else {
            this.list.loadCompleted(RCTFooterState.NoMore);
        }
    }

    componentWillUnmount() {
        clearTimeout(this._pullTimeout);
        clearTimeout(this._loadTimeout);
    }
}

class ItemComponent extends React.PureComponent {
    constructor(props){
        super(props);
    }
    render() {
        return(
            <Text style={styles.text}>{this.props.content}</Text>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'white'
    },
    text: {
      fontSize: 18,
      color: '#333',
      textAlign: 'center',
      paddingVertical: 25
    },
    line: {
      width: '100%',
      backgroundColor: '#eaeaea',
      height: 1
    }
});
```

# Feature

## Custom PropTypes

* type: List types, optional values for `flatList` with `sectionList`.
* pullBoundary: The minimum distance trigger refresh. The default value of `80`.
* headerBackgroundColor: Set backgroundColor of headerView. The default value of `white`.
* factor: The drop-down resistance factors. The default value of `10`, Value must be greater than `0`.
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
