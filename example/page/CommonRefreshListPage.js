import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import CustomRefreshList from './component/CustomRefreshList';
import {RCTFooterState} from 'react-native-refreshable-list';

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
            <CustomRefreshList
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
        setTimeout(() => {
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
            setTimeout(() => {
                this.setState({
                    data: this.state.data.concat(data),
                    count: this.state.count + 1
                }, () => this.list.loadCompleted(RCTFooterState.CanLoaded));
            }, 3000);
        } else {
            this.list.loadCompleted(RCTFooterState.NoMore);
        }
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
