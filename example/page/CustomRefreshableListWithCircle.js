import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {RCTRefreshList, RCTFooterState} from 'react-native-refreshable-list';

export default class CustomRefreshableListWithCircle extends React.Component {

    constructor(props){
        super(props);
        this.state = {
            data: []
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
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'white'
    },
    text: {
      fontSize: 18,
      color: '#333',
      textAlign: 'center',
      paddingVertical: 15
    },
    line: {
      width: '100%',
      backgroundColor: '#eaeaea',
      height: 1
    }
});
