import React, { useState, useEffect, useRef, Component, useCallback } from 'react';
import PropTypes from 'prop-types';
import {
  View,
  FlatList,
  BackHandler,
  Text,
  Keyboard,
  RefreshControl,
  StyleSheet,
  Pressable,
  Animated,
  ImageBackground,
  Image as RNImage,
  TouchableOpacity,
} from 'react-native';
import { Q } from '@nozbe/watermelondb';
// import { SceneMap, TabBar, TabView } from 'react-native-tab-view';
import ScrollableTabView from 'react-native-scrollable-tab-view';

import { connect } from 'react-redux';
import {
  leaveRoom as leaveRoomAction
} from '../../../../actions/room';
import { getUserSelector } from '../../../../selectors/login';
import { HeaderBackButton } from '@react-navigation/elements';

import ImageMap from "../../images"
import { Image, SearchBar, Button } from 'react-native-elements';
import useDebounce from 'ahooks/es/useDebounce';
import I18n from '../../../../i18n';
import SafeAreaView from '../../../../containers/SafeAreaView';
import RocketChat from '../../../../lib/rocketchat';
import database from '../../../../lib/database';
import Avatar from '../../../../containers/Avatar';
import StatusBar from '../../../../containers/StatusBar';
import log, { logEvent, events } from '../../../../utils/log';
const { loadingPng, noShootPng } = ImageMap
const QUERY_SIZE = 10

const PostPage = React.memo((props) => {
  const { selfUser, user, baseUrl, theme, channelsDataMap, loaded, } = props

  const [data, setData] = useState([])
  const [noMore, setNoMore] = useState(false)
  const [type, _setType] = useState(null)
  const countRef = useRef(0)
  const db = database.active;
  const setType = async (type) => {
    await getData(type)
    _setType(type)
  }
  const getData = async (type) => {
    try {

      const whereClause = [
        Q.where('rid', Q.eq(user.rid)),

        Q.where('tmid', null),
        Q.experimentalSortBy('ts', Q.desc),
        Q.experimentalSkip(countRef.current),
        Q.experimentalTake(countRef.current + QUERY_SIZE)
      ];
      if (!type) {
        whereClause.push(
          Q.and(
            Q.where('attachments', Q.like(`%paiyastory:%`)),

            Q.or(
              Q.where('attachments', Q.like(`%image_type%`)),
              Q.where('attachments', Q.like(`%video_type%`))
            )
          )
        )
      } else {
        whereClause.push(
          Q.and(
            Q.where('attachments', Q.like(`%paiyastory:%`)),

            Q.or(
              Q.where('attachments', Q.like(`%${type}_type%`)),
            )
          )
        )
      }
      const messages = await db.collections
        .get('messages')
        .query(...whereClause)
        .fetch()
      setData(data.concat(messages))
      countRef.current += QUERY_SIZE
      if ((messages?.length || 0) < QUERY_SIZE) {
        setNoMore(true)
      }
      console.info('结果你看啊', messages, type)
    } catch (e) {
      console.info(e, '错误')
    }


  }
  useEffect(() => {
    if (loaded && user?.rid) {
      getData()
    }
  }, [loaded, user])
  const renderItem = ({ item }) => {
    const attachment = item.attachments[0]
    const coverURL = 'https://video-message-001.paiyaapp.com/default/188bd5fb2e28d0a3990a1cc6b910aced/0b8a76ff-1517-4aa9-bf50-2414b148f2b9.jpg!thumbnail'
    const title = attachment.description.replace("paiyastory:", "哈哈哈")
    const handleClickItem = () => {
      // 点击打开快拍
    }
    return (
      <View style={styles.boxStyle}>
        <TouchableOpacity onPress={handleClickItem}>
          <View style={styles.topBox}>
            <View style={styles.avatarWrapper}>
              <Image
                resizeMode={'cover'}
                style={styles.avatar}
                source={{ uri: coverURL }}
                PlaceholderContent={<RNImage source={loadingPng} style={{ width: 55, height: 48 }} />}
                containerStyle={{
                  height: '100%',
                }}
                placeholderStyle={styles.placeholderStyle}
              />
            </View>
          </View>
          <Text style={styles.desc} numberOfLines={1} ellipsizeMode={'tail'}>
            {title}
          </Text>
        </TouchableOpacity>
      </View>
    )
  }
  const flatListConfig = {
    columnWrapperStyle: styles.wrapperStyle,
    maxToRenderPerBatch: 6,
    windowSize: 5,
    initialNumToRender: 6,
    numColumns: 2,
    renderItem: renderItem,
    showsVerticalScrollIndicator: false,
  }
  return (
    <View style={styles.root}>
      <FlatList
        style={styles.flatListStyle}
        data={data}
        contentContainerStyle={styles.contentContainerStyle}
        keyExtractor={item => item.id}
        {...flatListConfig}
        ListEmptyComponent={noMore ? <View
          style={{ alignItems: "center", paddingTop: 53, }}>
          <Image source={noShootPng} style={styles.noMoreImage}

            placeholderStyle={{ backgroundColor: "transparent" }} />
          <Text style={styles.noMoreText}>还没有快拍</Text>
        </View> : null}
      />
    </View>)
})
const styles = StyleSheet.create({
  topBox: {
    position: 'relative',
    paddingTop: '134%',
  },
  boxStyle: {
    margin: 0,
    marginBottom: 10,
    flexBasis: '48%',
  },
  flatListStyle: {
    flex: 1,
    paddingHorizontal: 13,
    paddingTop: 20,
    backgroundColor: "white"
  },
  contentContainerStyle: {

  },
  wrapperStyle: {
    justifyContent: 'space-between',
    backgroundColor: 'white',
  },
  desc: {
    position: "absolute",
    bottom: 0,
    marginHorizontal: 10,
    fontSize: 12,
    lineHeight: 17,
    color: '#FFFFFFFF',
    fontWeight: '500',
  },
  placeholderStyle: {
    backgroundColor: '#F5F6F9',
    // backgroundColor: '#FFFFFF00',
    height: '100%',
  },
  avatarWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    borderRadius: 6,
    overflow: 'hidden',
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: 6,
    overflow: 'hidden',
  },
  noMoreImage: {
    width: 85,
    height: 85,
    marginBottom: 18
  },
  noMoreText: {
    color: '#000000FF',
    fontSize: 18,
    fontWeight: '500',
    lineHeight: 25,
    textAlign: "center"
  },
})
export default PostPage