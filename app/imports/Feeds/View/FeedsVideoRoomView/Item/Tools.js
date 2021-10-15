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

import RocketChat from '../../../../../lib/rocketchat';
import events from '../../../../../utils/log/events';
import { LISTENER } from '../../../../../containers/Toast';

const { width } = Dimensions.get("window")
const { replycommentWhitePng, shareWhitePng, unlikeWhitePng, likePng } = ImageMap
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

  return <Image
    source={starred ? likePng : unlikeWhitePng}
    style={[styles.tool, { width: 24 }]}
    onPress={handleStar}
    resizeMode={'contain'}
    placeholderStyle={{ backgroundColor: "transparent" }} />
}
const OtherButton = React.memo((props) => {
  const { item, navigation, showComments } = props

  const openComments = (props) => {
    // 打开弹出窗口
    showComments?.()
  }
  const toShare = () => {

  }
  const buttons = [
    { icon: replycommentWhitePng, func: openComments, id: 1 },
    { icon: shareWhitePng, func: toShare, id: 2 }
  ]

  return (<>
    {buttons.map((i) => {
      return <Image source={i.icon} style={styles.tool} key={i.id} onPress={i.func} resizeMode={'contain'} placeholderStyle={{ backgroundColor: "transparent" }}></Image>
    })}
  </>)
})


const Tools = (props) => {

  return (
    <View style={styles.root}>
      <LikeBtn {...props} />
      <OtherButton {...props} />
    </View>
  )
}
const styles = StyleSheet.create({
  root: {
    flexDirection: "row",
    justifyContent: "flex-start",
    paddingVertical: 13,
    alignItems: "center",
    zIndex: 10,
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

  dotContainerStyle: {
    marginRight: 3,
  },
})
export default Tools