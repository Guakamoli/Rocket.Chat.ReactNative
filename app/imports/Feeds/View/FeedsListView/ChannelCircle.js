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
    Modal,
} from 'react-native';
import { Image } from "react-native-elements"
import LinearGradient from "react-native-linear-gradient"
import ImageMap from "../../images"
import Avatar from '../../../../containers/Avatar';
import ImagePicker from 'react-native-image-crop-picker';
import I18n from '../../../../i18n';
import StoryCamera from '../FeedsStoriesView/components/StoryCamera'
const { shootPng } = ImageMap
const colors = ['#E383DDFF', '#E383DDFF', '#7A83F5FF']
const silentColors = ['#C7C7C7FF', '#C7C7C7FF']

const ChannelCircle = (props) => {
    const { onStorySelect, dataList, user, storyMessages, navigation } = props
    const [data, setData] = useState([])
    const [StoryCameraOpen, setStoryCamert] = useState(false)

    const generateData = () => {
        setData(dataList)
    }
    useEffect(() => {
        generateData()
    }, [dataList])
    const renderItem = ({ item, index }) => {
        const takeVideo = async () => {
            //     let videoPickerConfig = {
            //         mediaType: 'video'
            //     };
            //     const libPickerLabels = {
            //         cropperChooseText: I18n.t('Choose'),
            //         cropperCancelText: I18n.t('Cancel'),
            //         loadingLabelText: I18n.t('Processing')
            //     };
            //     videoPickerConfig = {
            //         ...videoPickerConfig,
            //         ...libPickerLabels
            //     };
            //     try {
            //         const video = await ImagePicker.openCamera(videoPickerConfig);
            //         navigation.navigate('FeedsPublishView', { room: item, attachments: [video], type: "video" });

            //     } catch (e) {
            //     }
            setStoryCamert(true);
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
                    {item.hasUnread ? <LinearGradient style={styles.backContainer} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} colors={colors} angle={90} useAngle={true}></LinearGradient> : null}

                    <Avatar

                        size={66}
                        type={item.t}
                        text={item.name}
                        style={styles.avatar}
                        rid={item.rid} // 先用房间的头像
                        // avatar={item?.avatar}
                        borderRadius={66}

                    />
                    {
                        item.isSelf ? (<Image source={shootPng} placeholderStyle={{ backgroundColor: "transparent" }}
                            onPress={takeVideo}
                            containerStyle={{
                                width: 27,
                                height: 27,
                                position: "absolute",
                                zIndex: 4,
                                right: 0,
                                bottom: 0

                            }}
                            resizeMode={'contain'} />) : null
                    }

                </View>
            </Pressable>
        )
    }
    return (
        <View style={styles.root}>
            <Modal
                animationType="slide"
                transparent={false}
                visible={StoryCameraOpen}
                style={styles.modal}
            >
                <StoryCamera onCloseCamera={() => { setStoryCamert(false) }} />
            </Modal>
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
})
export default ChannelCircle
