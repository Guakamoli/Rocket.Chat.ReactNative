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
import { Image, Button } from "react-native-elements"
import LinearGradient from "react-native-linear-gradient"
import ImageMap from "../../images"
import Avatar from '../../../../containers/Avatar';
import ImagePicker from 'react-native-image-crop-picker';
import I18n from '../../../../i18n';
const { width } = Dimensions.get("window")
const { rightIconPng, closeSmallPng } = ImageMap
const colors = ['#E383DDFF', '#E383DDFF', '#7A83F5FF']
const silentColors = ['#C7C7C7FF', '#C7C7C7FF']

const ChannelCircle = (props) => {
    const { onStorySelect, dataList, user, storyMessages, navigation } = props
    const [data, setData] = useState([])

    const generateData = () => {
        // 要在这里做初次过滤
        setData(dataList)
    }
    useEffect(() => {
        generateData()
    }, [dataList])
    const renderItem = ({ item, index }) => {
        const takeVideo = async () => {
            let videoPickerConfig = {
                mediaType: 'video'
            };
            const libPickerLabels = {
                cropperChooseText: I18n.t('Choose'),
                cropperCancelText: I18n.t('Cancel'),
                loadingLabelText: I18n.t('Processing')
            };
            videoPickerConfig = {
                ...videoPickerConfig,
                ...libPickerLabels
            };
            try {
                const video = await ImagePicker.openCamera(videoPickerConfig);
                navigation.navigate('FeedsPublishView', { room: item, attachments: [video], type: "video" });

            } catch (e) {
            }
        }
        const onPress = () => {

            if (item.isSelf) {
                // 根据情况而定
                if (item.stories.length > 0) {
                    return onStorySelect(index, item)
                } else {
                    // 跳转界面'
                    takeVideo()
                    return

                }
            }
            onStorySelect(index - 1, item)
        }
        const onSubscribe = () => {

        }
        const hideUser = () => {
            // 
        }
        return (
            <View style={styles.itemWrapper}>
                <Image source={closeSmallPng}
                    onPress={hideUser}
                    style={styles.closeSmall}
                    containerStyle={styles.closeSmallWrapper}
                    placeholderStyle={{ backgroundColor: "transparent" }}
                    resizeMode={'contain'} />

                <Avatar

                    size={66}
                    type={item.t}
                    text={item.name}
                    style={styles.avatar}
                    rid={item.rid} // 先用房间的头像
                    // avatar={item?.avatar}
                    borderRadius={66}

                />
                <Text style={styles.title}>{item.name}</Text>
                <Text style={styles.subTitle}>paiya官方账户</Text>
                <Button
                    variant="contained"
                    onPress={() => { onSubscribe() }}
                    titleStyle={[styles.btnTitleStyle, !item.hasSubscribe ? styles.activeBtnTitleStyle : {}]}

                    buttonStyle={[styles.btnButtonStyle, !item.hasSubscribe ? styles.activeBtnButtonStyle : {}]}
                    containerStyle={styles.btnButtonContainerStyle}

                    title={!item.hasSubscribe ? `${('订阅')}` : "已订阅"}
                />

            </View>
        )
    }
    return (
        <View style={styles.root}>
            <Text style={styles.blockTitle}>推荐达人</Text>
            <FlatList
                horizontal={true}
                showsHorizontalScrollIndicator={false}
                data={data}
                contentContainerStyle={styles.contentContainerStyle}
                keyExtractor={(item, index) => index}
                renderItem={renderItem}
                ListEmptyComponent={
                    <View style={styles.emptyBox}>
                        <Image source={rightIconPng} style={styles.rightIcon} placeholderStyle={{ backgroundColor: "transparent" }} resizeMode={'contain'} />
                        <Text style={styles.noMore}>没有更多新推荐了</Text>
                    </View>
                }
            ></FlatList>
        </View >)
}
const styles = StyleSheet.create({
    root: {
        justifyContent: "center",
        paddingVertical: 10,

    },
    contentContainerStyle: {
        justifyContent: "center",
        paddingVertical: 10,
        marginHorizontal: 15,

    },
    noMore: {
        marginTop: 20,
        fontSize: 20,
        fontWeight: '400',
        color: '#000000FF',
        lineHeight: 28,
    },
    itemWrapper: {
        justifyContent: "center",
        alignItems: "center",
        marginRight: 14,
        position: "relative",
        borderWidth: 0.2,
        borderColor: "#DDDDDDFF",
        paddingHorizontal: 19,
        paddingVertical: 12,
    },
    emptyBox: {
        width: width - 15 * 2,
        paddingVertical: 50,
        flex: 1,
        justifyContent: "center",
        alignItems: "center"
    },
    rightIcon: {
        width: 80,
        height: 80,
    },
    closeSmall: {
        width: 8,
        height: 8,

    },
    closeSmallWrapper: {
        position: "absolute",
        right: 12,
        top: 12
    },
    avatar: {
        width: 66,
        height: 66,
        // borderWidth: 3,
        borderColor: "white",
        // borderRadius: 70,
        zIndex: 3,
    },
    backContainer: {
        width: 74,
        height: 74,
        borderRadius: 74,
        position: "absolute",
        zIndex: 0,
    },
    blockTitle: {
        fontSize: 16,
        fontWeight: '500',
        color: '#000000FF',
        lineHeight: 22,
        marginLeft: 15,
    },
    title: {
        fontSize: 14,
        fontWeight: '500',
        color: '#000000FF',
        lineHeight: 20,
    },
    subTitle: {
        fontSize: 12,
        fontWeight: '400',
        color: '#8E8E8EFF',
        lineHeight: 17,
    },
    btnButtonStyle: {
        backgroundColor: "#7166F9FF",
        paddingVertical: 2,
    },
    activeBtnButtonStyle: {
        backgroundColor: "white",
        borderColor: "#7166F9FF",
        borderWidth: 1
    },
    btnButtonContainerStyle: {
        marginTop: 15,
        width: "100%"
    },
    btnTitleStyle: {
        fontSize: 14,
        fontWeight: '500',
        color: '#FFFFFFFF',
        lineHeight: 20,
        marginLeft: 5,
    },
    activeBtnTitleStyle: {
        color: '#7166F9FF',

    },
})
export default ChannelCircle