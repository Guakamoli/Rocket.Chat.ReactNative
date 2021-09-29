import React, { useState, useEffect, useCallback, Component } from 'react';
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
    ImageBackground,
    TextInput
} from 'react-native';
import { connect } from 'react-redux';

import ImageMap from "../../images"
import { Image, SearchBar, Button } from 'react-native-elements';
import useDebounce from 'ahooks/es/useDebounce';
import I18n from '../../../../i18n';
import SafeAreaView from '../../../../containers/SafeAreaView';
import RocketChat from '../../../../lib/rocketchat';
import database from '../../../../lib/database';
import Avatar from '../../../../containers/Avatar';
import { HeaderBackButton } from '@react-navigation/elements';
import { getUserSelector } from '../../../../selectors/login';
import { canUploadFile } from '../../../../utils/media';

const { selectedPng, imageTypeIconPng, videoTypeIconPng } = ImageMap
const screenOptions = {
    title: /** @type {string} */ (null),
    headerShadowVisible: false,
    headerTransparent: false,
    statusBarTranslucent: false,
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
const PublishView = (props) => {
    const { navigation, user, FileUpload_MediaTypeWhiteList: mediaAllowList, FileUpload_MaxFileSize: maxFileSize } = props
    const { url, type, rid, attachments } = props.route?.params || {}
    const onPress = useCallback(() => navigation.goBack());
    const [text, setText] = useState('')
    const [options] = useState([{
        name: "订阅作品",
        type: "subscribe"
    }, {
        name: "免费作品",
        type: "free"
    }])
    const publish = useCallback(async () => {
        for (const item of attachments) {
            const { success: canUpload, error } = canUploadFile(item, mediaAllowList, maxFileSize);
            item.canUpload = canUpload;
            item.error = error;
            if (!item.filename) {
                item.filename = new Date().toISOString();
            }
        }

        await Promise.all(attachments.map(({
            filename: name,
            mime: type,
            description,
            size,
            path,
            canUpload
        }) => {
            if (canUpload) {
                return RocketChat.sendFileMessage(
                    room.rid,
                    {
                        name,
                        text,
                        size,
                        type,
                        path,
                        store: 'Uploads'
                    },
                    thread?.id,
                    server,
                    { id: user.id, token: user.token }
                );
            }
            return Promise.resolve();
        }));
    }, [text, user, rid, attachments]);

    const [index, setIndex] = useState(0)
    useEffect(() => {
        navigation.setOptions({
            headerTitleAlign: 'center',

            headerLeft: () => (
                <HeaderBackButton
                    label={''}
                    onPress={onPress}
                    tintColor={'#000000FF'}
                    style={{ marginLeft: 10, }}
                />
            ),

            headerTitle: () => (
                <Text style={styles.title}>新作品</Text>
            ),
            headerRight: () => (
                <Text onPress={publish} style={styles.titleRight}>发布</Text>
            ),
        })
    }, [])

    return (
        <View style={styles.root}>
            <View style={[styles.itemBox, styles.headeItemBox]}>
                <View style={styles.prevImageWrapper}>
                    <Image source={url} style={styles.prevImage} />
                    <Image source={type === 'viode' ? videoTypeIconPng : imageTypeIconPng}
                        containerStyle={type === 'viode' ? styles.videoDecoImage : styles.imageDecoImage}
                        style={{ width: "100%", height: "100%" }} resizeMode={'contain'} />
                </View>
                <View style={styles.inputWrapperStyle}>
                    <TextInput placeholder={'添加说明...'} placeholderTextColor={'#929292FF'} style={styles.inputStyle} onChangeText={(t) => { setText(t) }}></TextInput>
                </View>
            </View>
            <View style={styles.itemBox}>
                <Text style={styles.selectTitle}>选择作品类型</Text>
            </View>
            <View style={[styles.itemBox, styles.optionsBox]}>
                {options.map((i, _index) => {
                    return (
                        <Pressable key={i.name} onPress={() => {
                            setIndex(_index)
                        }}>
                            <View style={[styles.optionItem, _index === 0 ? styles.firstOption : {}]}>
                                <Text style={styles.optionName}>{i.name}</Text>
                                <View>
                                    {index === _index ? (
                                        <Image source={selectedPng} style={styles.selectedPng} resizeMode={'contain'} placeholderStyle={{ backgroundColor: "transparent" }} />
                                    ) : (
                                            <View style={styles.unSelectedPng}></View>
                                        )}
                                </View>
                            </View>
                        </Pressable>
                    )
                })}
            </View>
        </View>
    )
}
class PublishViewWrapper extends Component {
    render() {
        return <PublishView {...this.props} />
    }
}
const styles = StyleSheet.create({
    root: {
        backgroundColor: "white",
        flex: 1,
    },
    title: {
        fontSize: 17,
        lineHeight: 24,
        fontWeight: "500",
        color: "#000000FF"
    },
    titleRight: {
        fontSize: 15,
        lineHeight: 21,
        fontWeight: "500",
        color: "#000000FF",
        marginRight: 21,
    },
    optionItem: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    firstOption: {
        marginBottom: 25,
    },
    unSelectedPng: {
        width: 16,
        height: 16,
        borderRadius: 16,
        borderColor: '#E4E4E5FF',
        borderWidth: 1,
    },
    selectedPng: {
        width: 16,
        height: 16
    },
    prevImageWrapper: {
        marginRight: 12,
        justifyContent: "center",
        alignItems: "center"
    },
    prevImage: {
        width: 61,
        height: 61,
    },
    videoDecoImage: {
        width: 18,
        height: 21,
        position: "absolute",

    },
    imageDecoImage: {
        width: 28,
        height: 28,
        position: "absolute",
        top: 0,
        right: 0,
        zIndex: 10,

    },
    itemBox: {
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#DCDDDCFF',
    },
    optionsBox: {
        paddingVertical: 20,
    },
    headeItemBox: {
        paddingVertical: 15,
        flexDirection: "row"
    },
    selectTitle: {
        fontSize: 16,
        fontWeight: '500',
        color: '#000000FF',
        lineHeight: 22,
    },
    inputWrapperStyle: {
        marginTop: 6,
    },
    inputStyle: {

        fontSize: 15,
        fontWeight: '400',
        color: '#929292FF',
        lineHeight: 21,
    },

})
const mapStateToProps = state => ({
    user: getUserSelector(state),
    server: state.share.server.server || state.server.server,
    FileUpload_MediaTypeWhiteList: state.settings.FileUpload_MediaTypeWhiteList,
    FileUpload_MaxFileSize: state.settings.FileUpload_MaxFileSize
});
export default {
    component: connect(mapStateToProps)(PublishViewWrapper),
    options: screenOptions
}