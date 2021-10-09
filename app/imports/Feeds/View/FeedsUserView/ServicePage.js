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
const ServicePage = (props) => {
  const data = [{
    name: "定制服务",
    rate: "5.0评分",
    price: 98,
    description: "创作专属于您的视频、音频",
    time: 5,
  }]
  console.log('hahaha')
  return (
    <View style={styles.root}>
      {data.map((i) => {
        return (
          <View style={styles.item}>
            <View style={styles.titleBox}>
              <Text style={styles.name}>{i.name}</Text>
              <Text style={styles.rate}>{i.rate}</Text>
            </View>
            <View style={styles.mainBox}>
              <View style={styles.mainLeftBox}>
                <Text style={styles.description}>{i.description}</Text>
                <Text style={styles.price}>{`￥${i.price}起`}</Text>
              </View>
              <Text style={styles.request}>{'前往订购'}</Text>
            </View>
            <View style={styles.footBox}>
              <Text style={styles.time}>响应时长{i.time}天</Text>
            </View>
          </View>
        )
      })}
    </View>)
}
const styles = StyleSheet.create({
  root: {
    marginTop: 27,
    marginHorizontal: 15,
  },
  item: {
    marginBottom: 10,
    borderRadius: 7,
    backgroundColor: "#8888880A",
    borderColor: "#7A7A7A14",
    borderWidth: 1,
    padding: 15,
    paddingVertical: 20,
  },

  titleBox: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  name: {
    color: '#000000FF',
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 22,
  },
  rate: {
    color: '#FFAA06FF',
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
  },
  mainBox: {
    backgroundColor: "#FFFFFFFF",
    borderRadius: 8,
    marginBottom: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 10,
  },
  mainLeftBox: {},
  description: {
    color: '#333333FF',
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 18,
    marginBottom: 7
  },
  price: {
    color: '#333333FF',
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 28,
  },
  footBox: {
    flexDirection: "row"
  },
  request: {
    color: '#8F8F8FFF',
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
    textDecorationLine: "underline",
    textDecorationColor: "#836BFFFF"
  },
  time: {
    color: '#8F8F8FFF',
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 17,
  },

})
export default ServicePage