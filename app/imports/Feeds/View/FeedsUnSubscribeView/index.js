import React, { useState, useEffect } from 'react';
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
    Dimensions,
} from 'react-native';
import ImageMap from "../../images"
import { Image, SearchBar } from 'react-native-elements';
import useDebounce from 'ahooks/es/useDebounce';
import I18n from '../../../../i18n';
import SafeAreaView from '../../../../containers/SafeAreaView';
import RocketChat from '../../../../lib/rocketchat';
import database from '../../../../lib/database';
import Avatar from '../../../../containers/Avatar';
import LinearGradient from 'react-native-linear-gradient';
import Header from "..//FeedsListView/Header"
const { searchInputPng, inputClearPng } = ImageMap
const { width } = Dimensions.get("window")
const itemWidth = (width - 30 - 20) / 3
const itemHeight = itemWidth / 108 * 160
const screenOptions = {
    title: /** @type {string} */ (null),
    headerShadowVisible: false,
    headerTransparent: true,
    statusBarTranslucent: true,
    statusBarStyle: 'dark',
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
const ClearIcon = (props) => {
    const { text, clearText } = props
    if (!text) return null
    return (<Image source={inputClearPng}
        onPress={clearText}
        style={styles.clearIcon}
        placeholderStyle={{ backgroundColor: "transparent" }} />)
}
const SearchInput = React.memo((props) => {
    const { setRootText } = props

    const [text, setText] = useState('');
    const throttledValue = useDebounce(text, { wait: 500 });
    const setSearchStateWrapFalse = () => {
        const { navigation } = props;
        Keyboard.dismiss();

        navigation.pop()
    }
    const clearText = () => {
        setText("")
    }
    useEffect(() => {
        setRootText(throttledValue)
    }, [throttledValue])
    return (
        <View style={styles.searchBox}>
            <View style={styles.innerSearchBox}>
                <SearchBar
                    clearButtonMode="never"
                    inputContainerStyle={{
                        borderRadius: 25,
                        backgroundColor: 'white',
                        height: 40,
                        paddingLeft: 0,
                        marginLeft: 0,
                        width: "100%",
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "center"
                    }}
                    onChangeText={text => setText(text)}
                    style={{
                        borderWidth: 0,
                    }}
                    inputStyle={{
                        backgroundColor: "white",
                        flex: 0.5,
                        color: '#333333',
                        paddingLeft: 0,
                        fontSize: 14,
                        lineHeight: 16,
                    }}
                    autoFocus={true}
                    selectionColor="#895EFF"
                    value={text}

                    leftIconContainerStyle={{
                        paddingRight: 0,
                        paddingLeft: 10,
                        marginRight: 0,
                    }}
                    clearIcon={
                        <ClearIcon text={text} clearText={clearText} />
                    }

                    placeholder={I18n.t('search')}
                    placeholderTextColor={'#8C8C8CFF'}
                    searchIcon={
                        <Image
                            source={searchInputPng}
                            style={styles.icon}
                            transitionDuration={0}
                            transition={false}
                            placeholderStyle={{
                                backgroundColor: 'transparent',
                            }}
                        />
                    }
                    containerStyle={{
                        // width: '80%',
                        flex: 1,
                        paddingLeft: 0,
                        backgroundColor: 'transparent',
                        borderTopColor: 'transparent',
                        borderBottomColor: 'transparent',
                    }}
                />
            </View>
        </View>
    )
})
const SeachView = (props) => {
    const [rootText, setRootText] = useState("")

    return (
        <SafeAreaView edges={['top']} style={{ backgroundColor: "#F3F5F7FF", }}>
            <Header showSearch={false} />
            <SearchInput {...props} setRootText={setRootText} />
            <Text style={styles.tip}>您还没有订阅任何一个达人,快来订阅一个吧</Text>
            <SearchResult {...props} text={rootText} />
        </SafeAreaView>
    )
}
const SearchResult = React.memo((props) => {
    const { text, navigation } = props
    const [data, setData] = useState([])
    const [searching, setSearching] = useState(false)
    const querySearchData = async (text) => {
        // 从本地查库拿到数据
        setSearching(true)

        let result = await RocketChat.search({ text, filterUsers: false });
        result = result.concat([{ isFake: true, _id: Math.random() }, { isFake: true, _id: Math.random() }])
        setData(result)
        setSearching(false)

    }

    useEffect(() => {
        querySearchData(text.trim())
    }, [text])
    const getRoomAvatar = item => RocketChat.getRoomAvatar(item)

    const renderItem = props => {
        const { item, index } = props;
        const toProduct = () => {
            if (item.isFake) return
            navigation.navigate('FeedsUserView', { userInfo: { username: item.name, rid: item.rid, }, type: "pop" });
        };
        const avatar = getRoomAvatar(item);
        if (item.isFake) {
            return <View style={styles.itemBox}></View>
        }
        return (
            <Pressable onPress={toProduct} style={styles.itemBox}>
                <View style={styles.priceBox}>
                    <Avatar
                        text={avatar}
                        width={itemWidth}
                        size={itemHeight}
                        height={itemHeight}
                        type={item.t}
                        style={styles.itemAvatar}
                        rid={item.rid}
                        borderRadius={12}

                    />
                    <LinearGradient
                        angle={0}
                        colors={['rgba(56, 56, 56, 0)', 'rgba(21, 21, 19, 0.5)']}
                        style={[
                            styles.priceCover,

                        ]}>
                        <View
                            style={{
                                left: 7,
                                flexDirection: 'row',
                                alignItems: 'flex-end',
                                bottom: 8,
                            }}>

                            <Text style={styles.price} numberOfLines={1} ellipsizeMode={'tail'}>{item.name}</Text>
                        </View>
                    </LinearGradient>
                </View>


            </Pressable>
        );
    };
    const flatListConfig = {
        maxToRenderPerBatch: 8,
        windowSize: 5,
        initialNumToRender: 8,
        renderItem: renderItem,
    }
    return (
        <FlatList
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.contentContainerStyle}
            data={data}
            {...flatListConfig}
            keyExtractor={item => item._id}
            columnWrapperStyle={{
                justifyContent: "space-between",
                paddingHorizontal: 15,
                alignItems: "center",
                marginBottom: 10,

            }}

            numColumns={3}

        />
    )
})
const styles = StyleSheet.create({
    root: {
        backgroundColor: "#F3F5F7FF"
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
        marginTop: 55,
        justifyContent: "center"
    },
    innerSearchBox: {
        width: 232,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: "center"
    },

    clearIcon: {
        width: 14,
        height: 14
    },
    itemBox: {
        width: itemWidth,
        height: itemHeight,
    },
    itemBoxInner: {
        flexDirection: 'row',
        alignItems: "center",
    },
    contentContainerStyle: {
        paddingBottom: 50,
    },

    itemAvatar: {
        width: itemWidth,
        height: itemHeight,
        borderRadius: 12,
    },
    itemName: {
        fontSize: 15,
        fontWeight: '500',
        color: '#070707FF',
        lineHeight: 21,
        // width: 65,
    },
    tip: {
        fontSize: 12,
        fontWeight: '400',
        color: '#8F8F8FFF',
        lineHeight: 17,
        textAlign: "center",
        marginTop: 5,
        marginBottom: 20,
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
    priceBox: {
        position: 'absolute',
        flexDirection: 'row',
        alignItems: 'flex-end',
        bottom: 0,
        borderRadius: 12,
        height: 35,
        width: '100%',
        // left: scaleSizeW(8),
    },
    price: {
        fontSize: (14),
        color: '#FFFFFF',
        lineHeight: (19),
        width: "95%"
    },
    priceCover: {
        position: 'absolute',
        width: '100%',
        borderBottomLeftRadius: 12,
        borderBottomRightRadius: 12,
        height: 35,
        flexDirection: 'row',
        alignItems: 'flex-end',
    },
})
export default {
    component: SeachView,
    options: screenOptions
}