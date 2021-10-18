import React, { useCallback } from 'react';
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
import ImageMap from "../../../images"
import Avatar from '../../../../../containers/Avatar';

const { searchPng, companyTitlePng } = ImageMap
const Header = React.memo((props) => {
    const { username, item, navigation, channelsDataMap, openEditModal } = props
    const onPress = useCallback(() => {
        navigation.push("FeedsUserView", { userInfo: { username: channelsDataMap?.[item.rid]?.name, rid: item.rid, }, type: "pop" })
    });
    const openModalWrapper = () => {
        openEditModal?.()
    }
    return (
        <View style={styles.root}>
            <Pressable onPress={onPress}>

                <View style={styles.leftBox}>

                    <Avatar

                        size={32}
                        type={item.t}
                        text={item.name}
                        style={styles.avatar}

                        rid={item.rid} // 先用房间的头像
                        // avatar={item?.avatar}
                        borderRadius={32}

                    />
                    <Text style={styles.title}>{channelsDataMap?.[item.rid]?.name || item.name}</Text>

                </View>
            </Pressable>

            <Pressable onPress={openModalWrapper} style={styles.dotBox}>
                {[1, 2, 3].map((i) => {
                    return <View style={styles.dot}></View>
                })}
            </Pressable>
        </View>

    )
})
const styles = StyleSheet.create({
    root: {
        flexDirection: "row",
        paddingHorizontal: 15,
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: 10,

    },
    leftBox: {
        flexDirection: "row",
    },
    avatar: {
        width: 32,
        height: 32,
        borderRadius: 32,
        marginRight: 10,

    },
    title: {
        color: '#000000FF',
        fontSize: 14,
        fontWeight: '500',
        lineHeight: 20,
    },
    dot: {
        backgroundColor: "#000000FF",
        width: 3,
        height: 3,
        borderRadius: 3,
        marginLeft: 3,
    },
    dotBox: {
        flexDirection: "row",
        height: 10,
        width: 60,
        justifyContent: "flex-end",
        alignItems: "center",
    },
})
export default Header