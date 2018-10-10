import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity , FlatList} from 'react-native';
import {createStackNavigator} from 'react-navigation';
import CustomRefreshListPage from './page/CustomRefreshListPage';
import CommonRefreshListPage from './page/CommonRefreshListPage';

class Main extends React.Component {
  render() {
    const {navigate} = this.props.navigation;
    return (
        <FlatList
            style={styles.container}
            data={[
                'custom refreshable list with circle',
                'custom refreshable list with arrow',
             ]}
            renderItem={(info) => this._renderItem(info, navigate)}
            ItemSeparatorComponent={this._renderSeparatorComponent}
            keyExtractor={(item, index) => index.toString()}/>
    );
  }

  _renderItem(info, navigate) {
      return (
          <TouchableOpacity onPress={()=> this._navigate(info.index, navigate)}>
            <Text style={styles.text}>{info.item}</Text>
          </TouchableOpacity>
      )
  }

  _navigate(index, navigate) {
      switch (index) {
          case 0:
              navigate('CommonRefreshListPage');
              break;
          case 1:
              navigate('CustomRefreshListPage');
              break;
          default:
              navigate('CommonRefreshListPage');
      }
  }

  _renderSeparatorComponent() {
      return (
          <View style={styles.line}></View>
      )
  }
}

const RootStack = createStackNavigator(
    {
        Main: Main,
        CommonRefreshListPage: CommonRefreshListPage,
        CustomRefreshListPage: CustomRefreshListPage,
    },
    {
        initialRouteName: 'Main',
        navigationOptions: () => ({
            title: 'RefreshableList',
            headerTitleStyle: styles.headerTitle
        })
    }
);

export default class App extends React.Component {
    render() {
        return <RootStack/>;
    }
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'white'
    },
    headerTitle: {
        fontSize: 20,
        alignItems: 'center'
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
