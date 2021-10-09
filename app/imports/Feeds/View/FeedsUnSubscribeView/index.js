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

const { searchInputPng, inputClearPng } = ImageMap
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
        <View style={styles.searchBox} key={'inputbar2'}>
            <SearchBar
                clearButtonMode="never"
                inputContainerStyle={{
                    borderRadius: 8,
                    backgroundColor: '#EFEFEFFF',
                    height: 40,
                    paddingLeft: 0,
                    marginLeft: 0,
                }}
                onChangeText={text => setText(text)}
                style={{
                    borderWidth: 0,
                }}
                inputStyle={{
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
                    width: '80%',
                    flex: 1,
                    paddingLeft: 0,

                    backgroundColor: 'transparent',
                    borderTopColor: 'transparent',
                    borderBottomColor: 'transparent',
                }}
            />

        </View>
    )
})
const SeachView = (props) => {
    const [rootText, setRootText] = useState("")

    return (
        <SafeAreaView vertical={false} style={{ backgroundColor: "white" }}>
            <SearchInput {...props} setRootText={setRootText} />
            <View style={styles.underLine}></View>
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

        const result = await RocketChat.search({ text, filterUsers: false });
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
            navigation.navigate('FeedsUserView', { userInfo: { username: item.name, rid: item.rid, }, type: "pop" });
        };
        const avatar = getRoomAvatar(item);
        return (
            <Pressable onPress={toProduct} style={styles.itemBox}>
                <View style={styles.priceBox}>
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
                            <Avatar
                                text={avatar}
                                size={108}
                                type={item.t}
                                style={styles.itemAvatar}
                                rid={item.rid}
                                borderRadius={12}

                            />
                            <Text style={styles.price}>{item.name}</Text>
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
            // horizontal={true}
            numColumns={3}
            ListEmptyComponent={
                <View style={styles.noSearchBox}>

                    <Text style={styles.noSearchText}>{(!text ? I18n.t('startSearchDesc') : (!searching && !data.length) ? I18n.t('searchNotFound') : '')}</Text>
                </View>
            }

            ListFooterComponentStyle={{ paddingBottom: 100 }}
        />
    )
})
const styles = StyleSheet.create({
    root: {

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
        width: 108,
        height: 170,
    },
    itemBoxInner: {
        flexDirection: 'row',
        alignItems: "center",
    },
    contentContainerStyle: {
        paddingHorizontal: 15,

    },

    itemAvatar: {
        width: 108,
        height: 108,
        borderRadius: 12,
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
    },
    priceCover: {
        width: '100%',
        borderBottomLeftRadius: 12,
        borderBottomRightRadius: 12,
        height: 35,
        flexDirection: 'row',
        alignItems: 'flex-end',
        // opacity: 0.5,
    },
})
export default {
    component: SeachView,
    options: screenOptions
}