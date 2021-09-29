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

const { verifiedPng,
    plusSmallPng,
    shareUserPng, } = ImageMap
const screenOptions = {
    title: /** @type {string} */ (null),
    headerShadowVisible: false,
    headerTransparent: true,
    statusBarTranslucent: true,
    statusBarStyle: 'light',
    statusBarColor: 'transparent',
    headerStyle: {
        backgroundColor: 'transparent',
    },
    headerTintColor: 'rgba(255,255,255,1)',
    headerTitleStyle: {
        color: 'rgba(255,255,255,1)',
        fontSize: 18,
        fontWeight: '500',
        lineHeight: 25,
    },
    headerLeft: null,
    headerShown: true,
    contentStyle: {
        backgroundColor: 'white',
    },
}
const renderTabBar = props => {
    const [opacity, setOpacity] = useState(0);
    useEffect(() => {
        setTimeout(() => {
            setOpacity(1);
        }, 10);
    }, []);
    return (
        <TabBar
            {...props}
            tabStyle={styles.tabStyle}
            labelStyle={styles.systemText}
            pressColor={'transparent'}
            activeColor={'#651FFF'}
            inactiveColor={'#9B9B9B'}
            // renderIndicator={miniProgramType === 'web' ? RenderIndicator : null}
            scrollViewStyle={styles.TabBarscrollViewStyle}
            indicatorStyle={styles.indicatorStyle}
            style={[styles.tabBottomStyle]}
        />
    );
}
const ServicePage = () => {
    return null
}
const ComponentPage = (props) => {
    const { userInfo = null } = props.route.params || {}
    const [data, setData] = useState([])
    const getData = async (userInfo) => {
        const whereClause = [
            Q.where('rid', Q.oneOf(channelsDataIds)),
            Q.where('tmid', null),
            Q.where('u', Q.like(`%username: ${userInfo.username}%`)),
            Q.and(
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
        setData(messages)

    }
    useEffect(() => {
        if (userInfo && userInfo.username) {
            getData()
        }
    }, [userInfo])
    const renderItem = () => {
        return null
    }
    return (
        <FlatList
            renderItem={renderItem}
            scrollEventThrottle={16}
            style={styles.flatListStyle}
            contentContainerStyle={[styles.contentContainerStyle,]}
            ListHeaderComponentStyle={styles.listHeaderComponentStyle}
            data={data}
            keyExtractor={item => item.id}

        />
    )
}
const BottomComponents = (props) => {
    // 在这里获取用户的作品信息
    const { navigation } = props
    const [renderScene, setRenderScene] = useState(null);
    const list = [
        { key: 'components', title: '作品' },
        { key: 'service', title: '服务' },

    ]
    const [activeindex, setActiveindex] = useState(
        0
    );

    useEffect(() => {

        const _map = {};
        for (const [index, item] of list.entries()) {
            _map[item.key] = () => {
                if (item.key === 'components') {
                    <ComponentPage
                        type={item.key}
                        {...props}
                        navigation={navigation}
                    />
                } else {
                    <ServicePage
                        type={item.key}
                        {...props}
                        navigation={navigation}
                    />
                }

            }
        }
        setRenderScene(_map);
    }, []);
    const changeTabIndex = async index => {
        setActiveindex(index);

    };
    if (!renderScene) return null;
    return (<TabView
        renderTabBar={renderTabBar}
        style={{ paddingTop: 0 }}
        navigationState={{ index: activeindex, routes: bookingTitleLabels }}
        renderScene={SceneMap(renderScene)}
        onIndexChange={changeTabIndex}
        initialLayout={{ width: layout.width }}
    />)
}
const UserView = (props) => {
    const { leaveRoom, selfUser, navigation } = props
    const { userInfo = { username: 'root' } } = props.route.params || {}
    const [user, setUser] = useState({
        username: userInfo.username
    })
    const channelRef = useRef(null)
    const roomRef = useRef(null)
    const onPress = useCallback(() => navigation.goBack());

    const [hasSubscribe, setHasSubscribe] = useState(null)
    const getUserData = async (userInfo) => {
        const db = database.active;
        const userCollection = db.get('users');
        const [userRecord] = await userCollection.query(Q.where('username', Q.eq(userInfo.username))).fetch();
        setUser({
            username: userRecord.username
        })
    }
    const getHasSubscribe = async (userInfo) => {
        if (!userInfo.username) return
        const db = database.active;
        const result = await RocketChat.spotlight(userInfo.username, [], { users: false, rooms: true })
        channelRef.current = result?.rooms?.[0]

        let data = await db.get('subscriptions').query(
            Q.where("name", Q.eq(`${userInfo.username}`)),
            Q.where("t", Q.eq(`c`)),
        ).fetch();
        if (data && data[0]) {
            roomRef.current = data[0]

            setHasSubscribe(true)
        }

    }

    const setHeader = () => {
        navigation.setOptions({
            headerTitleAlign: 'center',

            headerLeft: () => (
                <HeaderBackButton
                    label={''}
                    onPress={onPress}
                    tintColor={'white'}
                    style={{ marginLeft: 10, }}
                />
            ),


        })
    }
    useEffect(() => {
        setHeader()
        getHasSubscribe(userInfo)
        getUserData(userInfo)
    }, [])
    const scale = useRef(new Animated.Value(1)).current;
    const onSubscribe = async () => {
        // 加入和退出房间
        // logEvent(events.ROOM_JOIN);
        try {
            if (!channelRef.current) {
                const db = database.active;

                const result = await RocketChat.spotlight(userInfo.username, [], { users: false, rooms: true })
                channelRef.current = result?.rooms?.[0]

                let data = await db.get('subscriptions').query(
                    Q.where("name", Q.eq(`${userInfo.username}`)),
                    Q.where("t", Q.eq(`c`)),
                ).fetch();
                if (data && data[0]) {
                    roomRef.current = data[0]

                }
            }
            if (hasSubscribe && roomRef.current) {
                leaveRoom('channel', roomRef.current)

                setHasSubscribe(false)
                return
            }

            // 搜索网络。然后加入
            if (channelRef.current) {

                await RocketChat.joinRoom(channelRef.current._id, null, null);

                setHasSubscribe(true)

            }

        } catch (e) {
            console.info(e);
        }
    }

    const onScroll = e => {
        // 1. 背景图放大效果
        // 2. 向上滚动的时候让头部显示出来，并且带上设置按钮

        if (e.nativeEvent.contentOffset.y < 0) {
            // 这里做的事情是 让视频有向下拖拽放大的效果
            scale.setValue(1 - e.nativeEvent.contentOffset.y * 0.003);
            return;
        }

    };
    const renderHeader = (
        <View>

            <View style={styles.infoBox}>
                <View style={styles.avatarBox}>
                    <View style={styles.userAvatarWrapper}>
                        <Avatar
                            text={user.username}
                            size={88}
                            type={user.t}
                            style={styles.userAvatar}
                            // rid={user.rid}// 先用房间的头像
                            borderRadius={88}

                        />
                    </View>
                    <Image source={shareUserPng} containerStyle={styles.shareUserPngStyle} resizeMode={'contain'} style={{ width: "100%", height: "100%" }} />
                </View>

                <View style={styles.userNameBoxWrapper}>
                    <View style={styles.userNameBox}>
                        <Text style={styles.userName} numberOfLines={1} ellipsizeMode={'tail'}>
                            {user.username}
                        </Text>
                        <Image source={verifiedPng} style={styles.verifiedPng} resizeMode={'contain'} />

                    </View>
                    <View>
                        <Text style={styles.itemDesc} numberOfLines={1} ellipsizeMode={'tail'}>
                            演员，歌手
                        </Text>
                    </View>
                </View>
                <View>
                    <Text style={styles.desc} numberOfLines={4} ellipsizeMode={'tail'}>
                        很高兴能在此页面与您分享我的新系列和特别
                    </Text>
                </View>
                {/* {selfUser?.username && selfUser?.username === user?.username ? (null) : ( */}
                <Button
                    variant="contained"
                    onPress={() => { onSubscribe() }}
                    titleStyle={styles.btnTitleStyle}
                    style={styles.btnStyle}
                    buttonStyle={styles.btnButtonStyle}
                    containerStyle={styles.btnButtonContainerStyle}
                    icon={<Image source={plusSmallPng} style={{ width: 11, height: 11 }} resizeMode={'contain'} />}
                    title={!hasSubscribe ? `${('关注')}` : "取消关注"}
                />
                {/* )} */}

                <View>
                    {/* <BottomComponents {...props} /> */}
                </View>
            </View>

        </View>
    )
    return (
        <View style={styles.root}>
            <StatusBar barStyle='light-content' />
            <Animated.View style={[styles.background, {
                transform: [
                    { scale: scale }
                ],
            }]}>
                <ImageBackground source={{ uri: 'https://video-message-001.paiyaapp.com/dhAgCqD36QCAhEqXj.jpg' }} style={styles.background} />
            </Animated.View>
            <FlatList
                onScroll={onScroll}
                scrollEventThrottle={16}
                style={styles.flatListStyle}
                contentContainerStyle={[styles.contentContainerStyle,]}
                ListHeaderComponent={renderHeader}
                ListHeaderComponentStyle={styles.listHeaderComponentStyle}
                data={[]}
                keyExtractor={item => item.id}

            />
        </View>
    )
}

const styles = StyleSheet.create({
    root: {
        backgroundColor: "white"
    },
    icon: {
        width: 14,
        height: 14
    },
    cancelBtn: {
        // padding: scaleSizeW(10),
        // paddingLeft: 0,
        // paddingRight: scaleSizeW(14),
    },
    btnButtonStyle: {
        backgroundColor: "#836BFFFF",
        paddingVertical: 11,
    },
    btnButtonContainerStyle: {
        marginTop: 15,
    },
    btnTitleStyle: {
        fontSize: 14,
        fontWeight: '500',
        color: '#FFFFFFFF',
        lineHeight: 20,
        marginLeft: 5,
    },
    background: {
        width: '100%',
        height: 375,
        top: 0,
        left: 0,
        position: 'absolute',
        resizeMode: 'cover',
        justifyContent: 'center',
    },
    userInfoBox: {
        marginBottom: 15,
    },
    avatarBox: {
        position: "relative",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-end",

        height: 60,
        marginBottom: 10,
    },
    infoBox: {
        paddingHorizontal: 15,
    },
    shareUserPngStyle: {
        width: 46,
        height: 46,
    },
    verifiedPng: {
        width: 13,
        height: 13
    },
    desc: {
        fontSize: 12,
        fontWeight: '400',
        color: '#8E8E8EFF',
        lineHeight: 20,
    },
    userNameBoxWrapper: {
        marginBottom: 15,
    },
    userNameBox: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 6
    },
    userName: {
        fontSize: 20,
        fontWeight: '600',
        color: '#000000FF',
        lineHeight: 28,
        marginRight: 10,
    },
    userAvatarWrapper: {
        width: 88,
        height: 88,
        borderRadius: 100,
        borderColor: "white",
        borderWidth: 3,
        justifyContent: "center",
        alignItems: "center",
        overflow: "hidden"
    },
    userAvatar: {
        width: 88,
        height: 88,
        borderRadius: 100,

    },
    userDesc: {
        fontSize: 12,
        fontWeight: '500',
        color: '#333333FF',
        lineHeight: 17,
    },
    cancelText: {
        fontSize: 16,
        fontWeight: '500',
        color: '#000000FF',
        lineHeight: 22,
    },
    searchBox: {
        flexDirection: 'row',
        width: '100%',
        alignItems: 'center',
        paddingHorizontal: 15,
    },
    underLine: {
        height: 1,
        marginHorizontal: 15,
        marginTop: 10,
        backgroundColor: "#F8F8F8FF"
    },
    clearIcon: {
        width: 14,
        height: 14
    },
    itemBox: {

        backgroundColor: 'white',
        marginTop: 12,
    },
    itemBoxInner: {
        flexDirection: 'row',
        alignItems: "center",
    },
    contentContainerStyle: {
        marginTop: 175,
        height: "100%",
        backgroundColor: "white"
        // paddingHorizontal: 15,
    },

    itemAvatar: {
        width: 55,
        height: 55,
        aspectRatio: 1,
        borderRadius: 100,
        marginRight: 10,
    },
    itemName: {
        fontSize: 15,
        fontWeight: '500',
        color: '#070707FF',
        lineHeight: 21,
        // width: 65,
    },
    itemDesc: {
        fontSize: 12,
        fontWeight: '400',
        color: '#8F8F8FFF',
        lineHeight: 17,
        // 
    },
    noSearchBox: {
        backgroundColor: 'white',
        width: '100%',
        alignItems: 'center',
        paddingTop: 190,
        flex: 1,
        height: "100%",
    },
    noSearchText: {
        color: '#000000FF',
        fontSize: 14,
        lineHeight: 20,
        fontWeight: "500"
    },
})
const mapStateToProps = state => ({
    selfUser: getUserSelector(state),

});
const mapDispatchToProps = dispatch => ({
    leaveRoom: (roomType, room, selected) => dispatch(leaveRoomAction(roomType, room, selected, false)),

});
class UserViewWrapper extends Component {
    render() {
        return <UserView {...this.props} />
    }
}


export default {
    component: connect(mapStateToProps, mapDispatchToProps)(UserViewWrapper),
    options: screenOptions
}