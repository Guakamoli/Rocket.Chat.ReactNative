import React from 'react';
import PropTypes from 'prop-types';
import {
  View,
  FlatList,
  BackHandler,
  Text,
  Keyboard,
  RefreshControl,
  StyleSheet,

} from 'react-native';
import { Image, Avatar } from "react-native-elements"
import ImageMap from "../../images"
const { searchPng, companyTitlePng, replycommentPng } = ImageMap
const Header = () => {

  return (
    <View style={styles.root}>
      <Image source={companyTitlePng} style={styles.companyTitlePng} resizeMode={'contain'} />
      <Image source={searchPng} style={styles.searchPng} resizeMode={'contain'} />
    </View>
  )
}
const styles = StyleSheet.create({
  root: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 15
  },
  companyTitlePng: {
    width: 48,
    height: 27,
  },
  searchPng: {
    width: 18,
    height: 18
  },
})
export default Header