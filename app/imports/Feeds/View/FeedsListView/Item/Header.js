import React from 'react';
import PropTypes from 'prop-types';
import {
    View,
    FlatList,
    BackHandler,
    Text,
    Keyboard,
    RefreshControl,
    StyleSheet,
} from 'react-native';
import { Image, Avatar } from "react-native-elements"
import ImageMap from "../../../images"
const { searchPng, companyTitlePng } = ImageMap
const Header = (props) => {
    const { username, getRoomAvatar, item } = props
    const avatar = getRoomAvatar(item);
    console.info(avatar, 'getRoomAvatargetRoomAvatar')
    return (
        <View style={styles.root}>
            <Image source={avatar} style={styles.avatar} />
            <Text style={styles.title}>{username}</Text>
        </View>
    )
}
const styles = StyleSheet.create({
    root: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingHorizontal: 15
    },
    avatar: {
        width: 32,
        height: 32,
    },
    title: {
        color: '#000000FF',
        fontSize: 14,
        fontWeight: '500',
        lineHeight: 20,
    },
})
export default Header