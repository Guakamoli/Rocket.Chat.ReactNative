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
    const { username, item, navigation, channelsDataMap } = props
    const onPress = useCallback(() => {
        console.info("电脑", item,)
        navigation.push("FeedsUserView", { userInfo: { username: channelsDataMap?.[item.rid]?.name, rid: item.rid, }, type: "pop" })
    });
    return (
        <Pressable onPress={onPress}>
            <View style={styles.root}>
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
    )
})
const styles = StyleSheet.create({
    root: {
        flexDirection: "row",
        paddingHorizontal: 15,
        alignItems: "center",
        paddingVertical: 10,

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
})
export default Header