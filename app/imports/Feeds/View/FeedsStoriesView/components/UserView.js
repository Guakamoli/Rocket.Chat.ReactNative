/* eslint-disable */
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Image } from "react-native-elements"
import ImageMap from '../../../images';

const { closeWhitePng } = ImageMap
// import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const UserView = React.memo((props) => {

  return (
    <View style={styles.userView}>
      <Image
        source={{ uri: props.profile }}
        containerStyle={styles.image}
      />
      <View style={styles.titleBox}>
        <Text style={styles.name} ellipsizeMode={'tail'} numberOfLines={1}>{props.name}asdlsfsdhg </Text>
        <Text style={styles.time}>Posted 2h ago</Text>
      </View>
      <Image source={closeWhitePng}
        onPress={props.onClosePress}
        containerStyle={styles.close} />

    </View>
  );
})

const styles = StyleSheet.create({
  image: {
    width: 34,
    height: 34,
    borderRadius: 34,
  },
  titleBox: {
    flexDirection: "row",
    flex: 1,
    alignItems: "center"
  },
  close: {
    width: 15,
    height: 15,
  },
  userView: {
    flexDirection: 'row',
    marginTop: 10,
    width: '100%',
    alignItems: 'center',
  },
  name: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
    marginLeft: 4,
    color: 'white',
    maxWidth: 130,
  },
  time: {
    fontSize: 12,
    fontWeight: '400',
    marginLeft: 9,
    color: 'white',
    lineHeight: 20,
  },
});

export default UserView;
