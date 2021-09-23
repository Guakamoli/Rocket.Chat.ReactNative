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
import { Image } from "react-native-elements"
import ImageMap from "../../../images"
import Avatar from '../../../../../containers/Avatar';

const { searchPng, companyTitlePng } = ImageMap
const Header = (props) => {
    const { username, getRoomAvatar, item } = props
    const avatar = getRoomAvatar(item);
    return (
        <View style={styles.root}>
            <Avatar
                text={avatar}
                size={32}
                type={item.t}
                style={styles.avatar}
                rid={item.rid}
            />
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
        borderRadius: 32
    },
    title: {
        color: '#000000FF',
        fontSize: 14,
        fontWeight: '500',
        lineHeight: 20,
    },
})
export default Header