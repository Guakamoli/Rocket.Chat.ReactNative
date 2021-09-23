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
  Image
} from 'react-native';
import { Avatar } from "react-native-elements"
import ImageMap from "../../../images"
import Carousel, { Pagination } from 'react-native-snap-carousel';

const { replycommentPng, sharePng, unlikePng, likePng } = ImageMap
console.info(sharePng, unlikePng, likePng, 'sharePng, unlikePng, likePng ')
const LikeBtn = (props) => {
  const { like } = props
  const onPress = () => {

  }
  return <Image srouce={LikeBtn} style={styles.tool} onPress={onPress} resizeMode={'contain'}></Image>
}
const OtherButton = React.memo(() => {
  const toComments = () => {

  }
  const toShare = () => {

  }
  const buttons = [
    { icon: replycommentPng, func: toComments },
    { icon: sharePng, func: toShare }
  ]

  return (<>
    {buttons.map((i) => {
      return <Image srouce={i.icon} style={styles.tool} onPress={i.func} ></Image>
    })}
  </>)
})
const IndexIndictator = React.memo((props) => {
  // 这个如果不是图片的话就直接不做展示了
  // pagination 
  const currentIndex = props.index
  const attachments = props?.attachments || []
  return (
    <Pagination
      dotsLength={attachments.length}
      activeDotIndex={currentIndex}
      containerStyle={{ backgroundColor: 'rgba(0, 0, 0, 0.75)' }}
      dotStyle={{
        width: 10,
        height: 10,
        borderRadius: 5,
        marginHorizontal: 8,
        backgroundColor: '#DADBDAFF'
      }}
      inactiveDotStyle={{
        backgroundColor: "#836BFFFF",
      }}
      inactiveDotOpacity={0.4}
      inactiveDotScale={0.6}
    />
  )
})
const Tools = () => {

  return (
    <View style={styles.root}>
      <LikeBtn />
      <OtherButton />
      <IndexIndictator />
    </View>
  )
}
const styles = StyleSheet.create({
  root: {
    flexDirection: "row",
    justifyContent: "flex-start",
    paddingHorizontal: 15,
    paddingVertical: 13,
  },
  tool: {
    width: 22,
    height: 22, resizeMode: 'contain',
  },
  title: {
    color: '#000000FF',
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
  },
  indexIndictator: {

  },
  activeIndexIndictator: {},
})
export default Tools