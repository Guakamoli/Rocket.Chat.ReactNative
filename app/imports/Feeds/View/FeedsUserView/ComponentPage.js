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
    ScrollView,
    Animated,
    ImageBackground,

} from 'react-native';
import { Q } from '@nozbe/watermelondb';
// import { SceneMap, TabBar, TabView } from 'react-native-tab-view';
import ScrollableTabView, { ScrollableTabBar } from 'react-native-scrollable-tab-view';
import FeedsItem from "../FeedsListView/Item"

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
const ComponentPage = (props) => {
    const { selfUser: user, baseUrl, theme, channelsDataMap } = props
    const { userInfo = null } = props.route.params || {}
    const [data, setData] = useState([])
    const db = database.active;

    const getData = async () => {
        try {
            const whereClause = [
                Q.where('rid', Q.eq(userInfo.rid)),
                Q.where('tmid', null),
                Q.and(
                    Q.where('attachments', Q.like(`%paiyapost:%`)),

                    Q.or(
                        Q.where('attachments', Q.like(`%image_type%`)),
                        Q.where('attachments', Q.like(`%video_type%`))
                    )
                ),

                Q.experimentalSortBy('ts', Q.desc),
                Q.experimentalTake(50)
            ];
            const messages = await db.collections
                .get('messages')
                .query(...whereClause)
                .fetch()
            console.info('开始按时', messages, 'messages')
            setData(messages)
        } catch (e) {
            console.info(e, 'asdasd')
        }


    }
    useEffect(() => {
        if (userInfo && userInfo.rid) {
            getData()
        }
    }, [userInfo])
    const renderItem = ({ item, index }) => {
        return <FeedsItem
            {...props}
            item={item}
            theme={theme}
            baseUrl={baseUrl}
            user={user}
            type={item.t}
            index={index}
            autoPlay={false}
            channelsDataMap={channelsDataMap}
        />
    }
    return (
        <FlatList
            // bounces={false}
            alwaysBounceVertical={false}
            showsVerticalScrollIndicator={false}
            renderItem={renderItem}
            scrollEventThrottle={16}
            style={styles.flatListStyle}
            contentContainerStyle={[styles.contentContainerStyle,]}
            data={data}
            keyExtractor={item => item.id}

        />
    )
}
const styles = StyleSheet.create({
    flatListStyle: {
        flex: 1,
        backgroundColor: "white"
    },
    contentContainerStyle: {
        backgroundColor: "white"

    },

})
export default ComponentPage