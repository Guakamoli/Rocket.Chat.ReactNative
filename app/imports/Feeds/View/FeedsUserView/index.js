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
    Image as RNImage,
    ImageBackground,

} from 'react-native';
import { Q } from '@nozbe/watermelondb';
// import { SceneMap, TabBar, TabView } from 'react-native-tab-view';
import ScrollableTabView, { DefaultTabBar } from 'react-native-scrollable-tab-view';
import { useHeaderHeight } from '@react-navigation/elements';

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
import { withTheme } from '../../../../theme';
import AsyncStorage from '@react-native-community/async-storage';

import SafeAreaView from '../../../../containers/SafeAreaView';
import RocketChat from '../../../../lib/rocketchat';
import database from '../../../../lib/database';
import Avatar from '../../../../containers/Avatar';
import StatusBar from '../../../../containers/StatusBar';
import log, { logEvent, events } from '../../../../utils/log';
import { useActionSheet } from '../../../../containers/ActionSheet';

import ServicePage from "./ServicePage"
import PostPage from "./PostPage"
import Subscription from "./Subscription"

import ComponentPage from "./ComponentPage"

const { verifiedPng,
    plusSmallPng,
    shareUserPng,
    moreSettingsPng,
    settingOrderPng,
    settingSubscriptionPng,
    settingCustomPng,
    settingWalletPng,
    settingSettingPng } = ImageMap
const screenOptions = {
    title: /** @type {string} */ (null),
    headerShadowVisible: false,
    headerTransparent: true,
    statusBarTranslucent: true,
    statusBarStyle: 'light',

    headerBackgroundContainerStyle: {
        backgroundColor: 'rgba(255,255,255,1)',
        opacity: 0
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



const BottomComponents = (props) => {
    // 在这里获取用户的作品信息
    const { navigation, componentTop, scrollY, scrollRef, user } = props
    const { userInfo = { username: "", rid: "" }, type } = props.route.params || {}

    const headerHeight = useHeaderHeight();
    const [contentHeight, setContentHeight] = useState('auto')
    const [loaded, setLoaded] = useState(false)
    const [countMap, setCountMap] = useState({
        component: 0,
        service: 0,
        post: 0,
    })
    const getCountData = async () => {
        const db = database.active;
        try {
            const whereClause = [
                Q.where('rid', Q.eq(user.rid)),
                Q.where('tmid', null),
                Q.where('t', Q.eq('discussion-created')),

                Q.and(
                    Q.where('attachments', Q.like(`%paiyapost:%`)),

                    Q.or(
                        Q.where('attachments', Q.like(`%image_type%`)),
                        Q.where('attachments', Q.like(`%video_type%`))
                    )
                ),
            ];
            const whereStoryClause = [
                Q.where('rid', Q.eq(user.rid)),
                Q.and(
                    Q.where('attachments', Q.like(`%paiyastory:%`)),


                ),
            ]
            const componentCount = await db
                .get('messages')
                .query(...whereClause)
                .fetchCount()
            const postCount = await db
                .get('messages')
                .query(...whereStoryClause)
                .fetchCount()
            setCountMap({
                component: componentCount,
                service: 1,
                post: postCount
            })
            console.info("loading", true, {
                component: componentCount,
                service: 1,
                post: postCount
            }, user.rid, 'B ')
            setLoaded(true)
        }
        catch (e) {
            console.log(e)
        }

    }
    useEffect(() => {
        if (user.rid) {
            getCountData()

        }
    }, [user])
    const changeTabIndex = async index => {
        setActiveindex(index);
    };
    const scrollProps = {
        keyboardShouldPersistTaps: 'always',
        keyboardDismissMode: 'none'
    };
    const toTopDist = componentTop + 175 - headerHeight
    const maxDist = toTopDist + 1000000000

    const onChangeTab = (value) => {
        // 切换了以后返回最上面
        if (value.from === 0 && value.i === 1 && type) {
            setContentHeight(400)
        } else if (value.from === 1 && value.i === 0) {
            setContentHeight('auto')
        }
        scrollRef?.current?.scrollTo?.({ x: 0, y: 0, animated: true })

    }
    return (<ScrollableTabView
        onChangeTab={onChangeTab}

        renderTabBar={(props) => <Animated.View style={{
            transform: [{
                translateY: scrollY.interpolate({
                    inputRange: [-1000, 0, toTopDist, maxDist],
                    outputRange: [0, 0, 0, maxDist]
                })
            }],
            zIndex: 100
        }}>
            <DefaultTabBar {...props}></DefaultTabBar>
        </Animated.View>}
        contentProps={scrollProps}
        style={{
            // flex: 1,
            backgroundColor: "white",
            height: contentHeight
        }}

        tabBarUnderlineStyle={{
            height: 2,
            backgroundColor: "#000000FF",
            alignContent: "center",

        }}
        tabBarBackgroundColor={'white'}
        tabBarActiveTextColor={'#000000FF'}
        tabBarInactiveTextColor={'#8F8F8FFF'}
        tabBarTextStyle={{
            fontSize: 15,
            lineHeight: 15,
            fontWeight: "600"
        }}

    >
        <ComponentPage tabLabel={`作品 ${countMap.component ? countMap.component : ''}`} {...props} loaded={loaded} key="ComponentPage" />
        {type ? <ServicePage tabLabel={`服务 ${countMap.service ? countMap.service : ''}`} {...props} loaded={loaded} key="ServicePage" /> : (
            <PostPage tabLabel={`快拍 ${countMap.post ? countMap.post : ''}`} {...props} loaded={loaded} key="PostPage" />

        )}

    </ScrollableTabView>)
}
const UserView = (props) => {
    const { leaveRoom, selfUser, navigation } = props
    const { userInfo = { username: "", rid: "" }, type } = props.route.params || {}
    const [user, setUser] = useState({
        username: userInfo.username || selfUser.username,
        rid: userInfo.rid,
    })
    const headerHeight = useHeaderHeight();
    const { showActionSheet, hideActionSheet } = useActionSheet();

    const channelRef = useRef(null)
    const scrollRef = useRef(null)
    const scrollBreakPointRef = useRef(true)
    const onPress = useCallback(() => navigation.goBack());
    const [componentTop, setComponentTop] = useState(1);
    const [hasSubscribe, setHasSubscribe] = useState(null)
    const getUserData = async () => {
        // 先查找有没有房间，没有房间就用用户信息
        try {


            const db = database.active;
            const roomCollection = db.get('subscriptions');
            let whereClause = [
                Q.where('rid', Q.eq(userInfo.rid))

            ]
            let roomRecord = null
            if (type) {
                roomRecord = (await roomCollection.query(...whereClause).fetch())[0]
                console.info("嗷嗷的", roomRecord)
                if (!roomRecord) {
                    roomRecord = (await RocketChat.search({ text: userInfo.username || user.username, filterUsers: false }))[0]

                }
            } else {
                roomRecord = (await roomCollection.query(Q.where('fname', Q.eq(user.username))).fetch())[0]

            }

            channelRef.current = {
                rid: userInfo?.rid,
                t: "c"
            }
            if (roomRecord && !channelRef.current?.rid) {
                channelRef.current = {
                    rid: roomRecord?.rid || userInfo?.rid,
                    t: "c"
                }
            }
            setUser({
                username: roomRecord?.username || userInfo.username || selfUser.username,
                rid: roomRecord?.id,
            })
        } catch (w) {
            console.info("错误", w)
        }
    }
    const getHasSubscribe = async () => {
        if (!userInfo.username) return
        const db = database.active;

        let data = await db.get('subscriptions').query(
            Q.where("name", Q.eq(`${userInfo.username}`)),
            Q.where("t", Q.eq(`c`)),
        ).fetch();
        if (data && data[0]) {

            setHasSubscribe(true)
        }

    }
    const toTopDist = componentTop + 175 - headerHeight
    const toPage = () => {

    }
    const getOptions = () => {
        let options = [
            {
                title: '我的订单',
                image: () => <RNImage style={styles.optionIcon} source={settingOrderPng} resizeMode={'contain'} />,
                onPress: () => toPage('order')
            },
            {
                title: '我的钱包',
                image: () => <RNImage style={styles.optionIcon} source={settingWalletPng} resizeMode={'contain'} />,
                onPress: () => toPage('wallet')
            },
            {
                title: '我的订阅',
                image: () => <RNImage style={styles.optionIcon} source={settingSubscriptionPng} resizeMode={'contain'} />,
                onPress: () => toPage('subscription')
            },
            {
                title: '我的定制',
                image: () => <RNImage style={styles.optionIcon} source={settingCustomPng} resizeMode={'contain'} />,
                onPress: () => toPage('custome')
            },
            {
                title: '设置',
                image: () => <RNImage style={styles.optionIcon} source={settingSettingPng} resizeMode={'contain'} />,
                onPress: () => toPage('setting')
            },

        ];



        return options;
    };
    const openMoreSettings = () => {
        showActionSheet({
            options: getOptions(),

        });
    }
    const setHeader = () => {
        navigation.setOptions({
            headerTitleAlign: 'center',
            headerBackgroundContainerStyle: {
                backgroundColor: 'rgba(255,255,255,1)',
                opacity: scrollY.interpolate({
                    inputRange: [0, toTopDist, toTopDist + 100],
                    outputRange: [0, 0, 0.75]
                })
            },
            headerLeft: () => (
                type ?
                    (<HeaderBackButton
                        label={''}
                        onPress={onPress}
                        tintColor={'white'}

                        // backImage={() => {
                        //     return <View style={{ backgroundColor: "red", width: 100, height: 100 }} />
                        // }}
                        style={{
                            marginLeft: 10,

                        }}

                    />

                    ) : null
            ),
            headerRight: () => {
                if (type) return null
                return <Image source={moreSettingsPng} style={{ width: 32, height: 32, marginRight: 15 }}
                    // placeholderStyle={{backgroundColor:"transparent"}}
                    onPress={openMoreSettings}
                    PlaceholderContent={null}
                />
            }


        })
    }
    useEffect(() => {
        setHeader()
        getHasSubscribe()
        getUserData()
    }, [])
    const onRefresh = () => {
        getUserData()
    }
    // const scale = useRef(new Animated.Value(1)).current;
    const scrollY = useRef(new Animated.Value(0)).current;
    const onSubscribe = async () => {
        // 加入和退出房间
        // logEvent(events.ROOM_JOIN);
        try {
            console.info('bikjan', channelRef.current, hasSubscribe)
            if (!channelRef.current) {
                return
            }
            if (hasSubscribe) {
                leaveRoom('channel', channelRef.current)

                setHasSubscribe(false)
                await AsyncStorage.setItem("subscribeRoomInfo", JSON.stringify({ type: 0, rid: channelRef.current.rid }))
                return
            }

            // 搜索网络。然后加入
            console.info('channelRef.current.rid,', channelRef.current.rid,)
            await RocketChat.joinRoom(channelRef.current.rid, null, null);
            await AsyncStorage.setItem("subscribeRoomInfo", JSON.stringify({ type: 1, rid: channelRef.current.rid }))

            setHasSubscribe(true)


        } catch (e) {
            console.info(e, '关注错误');
        }
    }
    const setLeftButtonAndTitle = (color, title) => {
        navigation.setOptions({
            headerTitle: title,
            headerTitleStyle: {
                color,
                fontSize: 18,
                fontWeight: '500',
                lineHeight: 25,
            },
            headerLeft: () => (
                type ?
                    (<HeaderBackButton
                        label={''}
                        onPress={onPress}
                        tintColor={color}

                        // backImage={() => {
                        //     return <View style={{ backgroundColor: "red", width: 100, height: 100 }} />
                        // }}
                        style={{
                            marginLeft: 10,

                        }}

                    />

                    ) : null
            ),
        })
    }
    const onScroll = Animated.event(
        [
            {
                nativeEvent: {
                    contentOffset: { y: scrollY }
                }
            }
        ],
        {
            useNativeDriver: true,
            listener: (e) => {
                if (e.nativeEvent.contentOffset.y > headerHeight + 100) {
                    if (!scrollBreakPointRef.current) {
                        scrollBreakPointRef.current = true
                        setLeftButtonAndTitle('black', userInfo.username || selfUser.username)
                    }

                } else if (scrollBreakPointRef.current) {
                    scrollBreakPointRef.current = false
                    setLeftButtonAndTitle('white', '')
                }

            }
        }
    );
    const renderHeader = (
        <View style={{
            backgroundColor: "white"
        }}>

            <View style={styles.infoBox}>
                <View style={styles.avatarBox}>
                    <View style={styles.userAvatarWrapper}>
                        <Avatar
                            text={user.username}
                            size={88}
                            type={"c"}
                            style={styles.userAvatar}
                            rid={user.rid}// 先用房间的头像
                            borderRadius={88}

                        />
                    </View>
                    <Image source={shareUserPng} containerStyle={styles.shareUserPngStyle}
                        resizeMode={'contain'} style={{ width: "100%", height: "100%" }}
                        placeholderStyle={{ backgroundColor: "transparent" }} />
                </View>

                <View style={styles.userNameBoxWrapper}>
                    <View style={styles.userNameBox}>
                        <Text style={styles.userName} numberOfLines={1} ellipsizeMode={'tail'}>
                            {user.username}
                        </Text>
                        <Image source={verifiedPng} style={styles.verifiedPng} resizeMode={'contain'}
                            placeholderStyle={{ backgroundColor: "transparent" }} />

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
                {selfUser?.username && selfUser?.username === user?.username || !type ? (null) : (
                    <Button
                        variant="contained"
                        onPress={() => { onSubscribe() }}
                        titleStyle={styles.btnTitleStyle}
                        style={styles.btnStyle}
                        buttonStyle={styles.btnButtonStyle}
                        containerStyle={styles.btnButtonContainerStyle}
                        icon={<Image
                            source={plusSmallPng}
                            style={{ width: 11, height: 11 }}
                            resizeMode={'contain'}
                            placeholderStyle={{ backgroundColor: "transparent" }} />}
                        title={!hasSubscribe ? `${('关注')}` : "取消关注"}
                    />
                )}

            </View>
            {
                !type ? (<Subscription user={selfUser} {...props} key={'Subscription'} />) : null
            }

            <View onLayout={(a, b) => {
                setComponentTop(a.nativeEvent.layout.y)
            }}>
                <BottomComponents
                    {...props}
                    channelsDataMap={{
                        [`${user.rid}`]: { rid: user.rid, name: user.username }
                    }}
                    user={user}
                    scrollRef={scrollRef}
                    componentTop={componentTop}
                    scrollY={scrollY} />
            </View>
        </View>
    )
    return (
        <View style={styles.root}>

            <StatusBar barStyle='light-content' />
            <Animated.View style={[styles.background, {
                transform: [
                    {
                        scale: scrollY.interpolate({
                            inputRange: [-100, 0, 10],
                            outputRange: [1.2, 1, 1]
                        })
                    }
                ],
            }]}>
                <ImageBackground source={{ uri: 'https://video-message-001.paiyaapp.com/dhAgCqD36QCAhEqXj.jpg' }} style={styles.background} />
            </Animated.View>
            <Animated.FlatList showsVerticalScrollIndicator={false}
                ref={scrollRef}
                onScroll={onScroll}
                onRefresh={onRefresh}
                refreshing={false}
                ListHeaderComponent={renderHeader}
                scrollEventThrottle={16}


                contentContainerStyle={[styles.contentContainerStyle]}>

            </Animated.FlatList>

        </View >
    )
}

const styles = StyleSheet.create({
    root: {
        backgroundColor: "white",
        flex: 1,
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
        borderRadius: 88,
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
        paddingBottom: 205,
        // height: "100%",
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
    optionIcon: {
        width: 18,
        height: 19
    },
})
const mapStateToProps = state => ({
    selfUser: getUserSelector(state),
    baseUrl: state.server.server,


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
    component: connect(mapStateToProps, mapDispatchToProps)(withTheme(UserViewWrapper)),
    options: screenOptions
}