/* eslint-disable */
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Image } from "react-native-elements"
import ImageMap from '../../../images';
import Avatar from '../../../../../containers/Avatar';

const { closeWhitePng } = ImageMap
// import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const UserView = React.memo((props) => {
  const { user, currentIndex } = props
  return (
    <View style={styles.userView}>
      <Avatar

        size={34}
        type={user.t}
        text={user.name}
        style={styles.image}
        rid={user.rid} // 先用房间的头像
        borderRadius={34}

      />

      <View style={styles.titleBox}>
        <Text style={styles.name} ellipsizeMode={'tail'} numberOfLines={1}>{props.name} </Text>
        <Text style={styles.time}>{user.stories?.[currentIndex]?.date}</Text>
      </View>
      <Image source={closeWhitePng}
        onPress={props.onClosePress}
        containerStyle={styles.closeContainer}
        placeholderStyle={{ backgroundColor: "transparent" }}
        resizeMode={'contain'}
        style={styles.close} />

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
    width: 23,
    height: 23,
    justifyContent: "center",
    alignItems: "center",
  },
  closeContainer: {
    top: 10,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
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
