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
import { Image } from "react-native-elements"
import LinearGradient from "react-native-linear-gradient"
import ImageMap from "../../images"
import Avatar from '../../../../containers/Avatar';
import ImagePicker from 'react-native-image-crop-picker';
import I18n from '../../../../i18n';

const { shootPng } = ImageMap
const colors = ['#E383DDFF', '#E383DDFF', '#7A83F5FF']
const silentColors = ['#C7C7C7FF', '#C7C7C7FF']

const ChannelCircle = (props) => {
    const { onStorySelect, dataList, user, storyMessages, navigation } = props
    const [data, setData] = useState([])

    const generateData = () => {
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
        return (
            <Pressable onPress={onPress}>
                <View style={styles.itemWrapper}>

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


                </View>
            </Pressable>
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
            ></FlatList>
        </View >)
}
const styles = StyleSheet.create({
    root: {
        justifyContent: "center",
        paddingVertical: 10,
        borderBottomColor: "#DCDDDCFF",
        borderBottomWidth: 1
    },
    contentContainerStyle: {
        justifyContent: "center",
        paddingVertical: 10,
        paddingHorizontal: 15,
    },
    itemWrapper: {
        justifyContent: "center",
        alignItems: "center",
        marginRight: 14,
        position: "relative"
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
})
export default ChannelCircle