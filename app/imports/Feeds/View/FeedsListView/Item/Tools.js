import React, { useRef, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import {
  View,
  FlatList,
  BackHandler,
  Text,
  Keyboard,
  RefreshControl,
  StyleSheet,
  Dimensions
} from 'react-native';
import { Image, Avatar } from "react-native-elements"
import useThrottleFn from 'ahooks/es/useThrottleFn';

import ImageMap from "../../../images"
import Carousel, { Pagination } from 'react-native-snap-carousel';
import I18n from '../../../../../i18n';
import log, { logEvent } from '../../../../../utils/log';
import EventEmitter from '../../../../../utils/events';
import RocketChat from '../../../../../lib/rocketchat';
import events from '../../../../../utils/log/events';
import { LISTENER } from '../../../../../containers/Toast';

const { width } = Dimensions.get("window")
const { replycommentPng, sharePng, unlikePng, likePng } = ImageMap
const LikeBtn = (props) => {
  const { item, setLikeCount } = props
  const [starred, setStarred] = useState(!!item?.reactions?.find?.(i => i.emoji === ":+1:") || false)
  const { run: handleStar } = useThrottleFn(async () => {
    try {
      // const a = await RocketChat.toggleStarMessage(item.id, starred || false);
      await RocketChat.setReaction(":+1:", item.id);
      setLikeCount(starred ? -1 : 1)
      // EventEmitter.emit(LISTENER, { message: starred ? I18n.t('Message_unstarred') : I18n.t('Message_starred') });
      setStarred(!starred)
    } catch (e) {
    }
  }, { wait: 1000 });

  return <Image source={starred ? likePng : unlikePng} style={[styles.tool, { width: 24 }]} onPress={handleStar} resizeMode={'contain'}
    placeholderStyle={{ backgroundColor: "transparent" }}></Image>
}
const OtherButton = React.memo((props) => {
  const { item, navigation } = props

  const toComments = (props) => {
    return navigation.push('FeedsRoomView', {
      rid: item.rid, tmid: item.id, name: '评论', t: 'thread', roomUserId: ''
    });
  }
  const toShare = () => {

  }
  const buttons = [
    { icon: replycommentPng, func: toComments, id: 1 },
    { icon: sharePng, func: toShare, id: 2 }
  ]

  return (<>
    {buttons.map((i) => {
      return <Image source={i.icon} style={styles.tool} key={i.id} onPress={i.func} resizeMode={'contain'} placeholderStyle={{ backgroundColor: "transparent" }}></Image>
    })}
  </>)
})
const renderDotItem = () => {
  return (
    <View style={styles.dotContainerStyle}>
      <View style={{
        width: 6,
        height: 6,
        borderRadius: 6,
        backgroundColor: '#836BFFFF',
      }}></View>
    </View>
  )
}
const renderInactiveDotItem = () => {
  return (
    <View style={styles.dotContainerStyle}>
      <View style={{
        width: 6,
        height: 6,
        borderRadius: 6,
        backgroundColor: '#DADBDAFF',
      }}></View>
    </View>
  )
}
const IndexIndictator = React.memo((props) => {
  // 这个如果不是图片的话就直接不做展示了
  // pagination 
  const { item } = props
  const currentIndex = props.index
  let attachments = item?.attachments || []
  const cref = useRef()

  useEffect(() => {
    cref.current?.snapToItem?.(currentIndex, true)
  }, [currentIndex])
  const renderDotItem = ({ item, index }) => {
    return (
      <View style={{ justifyContent: "center", alignItems: "center", height: 20 }}>
        <View style={{
          width: 6,
          height: 6,

          borderRadius: 6,
          backgroundColor: currentIndex !== index ? '#DADBDAFF' : '#836BFFFF',
        }}></View>
      </View>
    )
  }
  if (!attachments[0]?.image_url) return null
  return (
    <View style={styles.indexIndictator}>
      <View>
        <Carousel
          data={[1, 2, 3, 4, 5, 6, 7, 8, 9]}
          ref={cref}
          renderItem={renderDotItem}
          sliderWidth={50}
          itemWidth={10}
          activeSlideAlignment={'center'}
          contentContainerStyle={{ justifyContent: "center" }}
          inactiveSlideScale={0.9}
          inactiveSlideOpacity={1.0}
        // onSnapToItem={onSnapToItem}
        />
      </View>
    </View>
  )
  return (
    <Pagination
      dotsLength={attachments.length + 10}
      activeDotIndex={currentIndex}
      style={{ padding: 0, margin: 0 }}
      containerStyle={{ paddingVertical: 0, paddingHorizontal: 0, marginLeft: 20, width: 50, backgroundColor: "red", overflow: "scroll" }}
      dotElement={renderDotItem()}
      inactiveDotElement={renderInactiveDotItem()}

      inactiveDotOpacity={1.0}
      inactiveDotScale={0.8}
    />
  )
})
const Tools = (props) => {

  return (
    <View style={styles.root}>
      <LikeBtn {...props} />
      <OtherButton {...props} />
      <IndexIndictator {...props} />
    </View>
  )
}
const styles = StyleSheet.create({
  root: {
    flexDirection: "row",
    justifyContent: "flex-start",
    paddingVertical: 13,
    alignItems: "center",
  },
  tool: {
    width: 22,
    height: 22,
    marginRight: 20,
    zIndex: 1,

  },
  title: {
    color: '#000000FF',
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
  },
  indexIndictator: {
    position: "absolute",
    zIndex: 0,
    left: (width - 15 - 50) / 2,
    // width: "100%",
    // justifyContent: "center",
    alignItems: "center"
  },
  activeIndexIndictator: {},
  dotContainerStyle: {
    marginRight: 3,
  },
})
export default Tools