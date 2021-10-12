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
const CountList = (props) => {
    const { loaded, setType } = props

    const { userInfo = null } = props.route.params || {}

    useEffect(() => {
        if (loaded && userInfo && userInfo.rid) {
            getDataCountList()
        }
    }, [loaded])
    const [activeIndex, setActiveIndex] = useState(0)
    const [countList, setCountList] = useState([
        { name: "图文", value: 0 },
        { name: "视频", value: 0 },
        { name: "音频", value: 0 }
    ])
    const db = database.active;
    const getDataCountList = async () => {

        const whereClause = [
            Q.where('rid', Q.eq(userInfo.rid)),
            Q.where('tmid', null),
            Q.where('t', Q.eq('discussion-created')),

        ];
        const imageCount = await db
            .get('messages')
            .query(...whereClause, Q.and(
                Q.where('attachments', Q.like(`%paiyapost:%`)),

                Q.or(
                    Q.where('attachments', Q.like(`%image_type%`)),
                )
            ))
            .fetchCount()
        const videoCount = await db
            .get('messages')
            .query(...whereClause, Q.and(
                Q.where('attachments', Q.like(`%paiyapost:%`)),

                Q.or(
                    Q.where('attachments', Q.like(`%video_type%`)),
                )
            ))
            .fetchCount()
        const result = await Promise.all([imageCount, videoCount])
        setCountList([{ name: "图文", value: result[0], type: "image" }, { name: "视频", value: result[1], type: "video" }, { name: "音频", value: 0, type: "audio" }])
    }
    const clickItem = (index, item) => {
        // 点击筛选内容
        setActiveIndex(index)
        setType(item.type)
    }
    // 少于等于一个直接不显示
    if (countList.filter(i => i.value > 0).length <= 1) return null
    return <View style={{ flexDirection: "row", marginLeft: 15, marginTop: 15, }}>
        {countList.map((i, index) => {
            if (!i.value) return null
            return <Button
                key={i.name}
                variant="contained"
                onPress={() => {
                    clickItem(index, i)
                }}
                titleStyle={[styles.submitButton, activeIndex === index ? styles.submitActiveButton : {}]}
                style={styles.submitButton}
                buttonStyle={[styles.submitButtonBtn, activeIndex === index ? styles.submitActiveButtonBtn : {}]}
                containerStyle={styles.submitButtonContainer}
                title={`${i.name} ${i.value ? i.value : ''}`}
            />
        })}
    </View>
}
const ComponentPage = React.memo((props) => {
    const { selfUser: user, baseUrl, theme, channelsDataMap, loaded } = props
    const { userInfo = null } = props.route.params || {}
    const [data, setData] = useState([])
    const [type, _setType] = useState(null)
    const db = database.active;
    const setType = async (type) => {
        await getData(type)
        _setType(type)
    }
    const getData = async (type) => {
        try {

            const whereClause = [
                Q.where('rid', Q.eq(userInfo.rid)),
                Q.where('t', Q.eq('discussion-created')),

                Q.where('tmid', null),
                Q.experimentalSortBy('ts', Q.desc),
                Q.experimentalTake(50)
            ];
            if (!type) {
                whereClause.push(
                    Q.and(
                        Q.where('attachments', Q.like(`%paiyapost:%`)),

                        Q.or(
                            Q.where('attachments', Q.like(`%image_type%`)),
                            Q.where('attachments', Q.like(`%video_type%`))
                        )
                    )
                )
            } else {
                whereClause.push(
                    Q.and(
                        Q.where('attachments', Q.like(`%paiyapost:%`)),

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
            setData(messages)
            console.info('结果', messages, type)
        } catch (e) {
            console.info(e, '错误')
        }


    }
    useEffect(() => {
        if (loaded && userInfo && userInfo.rid) {
            getData()
        }
    }, [loaded])
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
            ListHeaderComponent={<CountList {...props} setType={setType} />}
            contentContainerStyle={[styles.contentContainerStyle,]}
            data={data}
            keyExtractor={item => item.id}

        />
    )
}, (a, b) => {
    if (a.loaded !== b.loaded) return false
    return true
})
const styles = StyleSheet.create({
    flatListStyle: {
        flex: 1,
        backgroundColor: "white"
    },
    contentContainerStyle: {
        backgroundColor: "white"

    },
    submitButton: {
        color: '#000000CC',
        fontSize: 11,
        fontWeight: '500',
        lineHeight: 16,
    },
    submitActiveButton: {
        color: '#836BFFFF',
    },
    submitButtonBtn: {
        backgroundColor: 'white',
        borderRadius: 25,
        paddingHorizontal: 9,
        paddingVertical: 4,
        borderWidth: 1,
        borderColor: "#D9DAD999"
    },
    submitActiveButtonBtn: {

        borderColor: "#836BFFFF"
    },
    submitButtonContainer: {
        borderRadius: 25,
        marginRight: 10,
        // paddingVertical: 12,
    },
})
export default ComponentPage