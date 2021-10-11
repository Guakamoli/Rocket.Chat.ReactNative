import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
    View,
    FlatList,
    BackHandler,
    Text,
    Keyboard,
    RefreshControl,
    StyleSheet,
    Dimensions,
    TextInput,
} from 'react-native';
import { Image } from "react-native-elements"
import ImageMap from "../../../images"
import Avatar from '../../../../../containers/Avatar';
import { formatDateDetail } from "../../../../../utils/room"
const { searchPng, companyTitlePng } = ImageMap
const { width } = Dimensions.get("window")
const Comment = React.memo((props) => {
    const { user, item, navigation } = props
    const toComments = (props) => {
        return navigation.push('FeedsRoomView', {
            rid: item.drid, tmid: null, name: '评论', t: 'thread', roomUserId: ''
        });
    }
    // const [text, setText] = useState('')
    const date = formatDateDetail(item.ts)
    let commentCount = '暂无评论'
    if (item.dcount > 0) {
        commentCount = `${item.dcount}条评论`
    }
    return (
        <View style={styles.root}>
            <View>
                <Text style={styles.commentCount} onPress={toComments}>{commentCount}</Text>
            </View>
            <View style={styles.inputWrapper}>
                <Avatar

                    size={32}
                    text={user.username}
                    style={styles.avatar}

                    borderRadius={32}

                />
                <View style={styles.inputBox}>
                    <Text style={styles.inputStyle} onPress={toComments}>{'添加评论...'}</Text>
                    {/* <TextInput placeholder={'添加评论...'} placeholderTextColor={'#929292FF'} style={styles.inputStyle} onChangeText={(t) => { setText(t) }}></TextInput> */}
                </View>

            </View>
            <Text style={styles.time} onPress={toComments}>{date}</Text>
        </View>
    )
})
const styles = StyleSheet.create({
    root: {
        width: "100%",
        marginTop: 10,
    },
    commentCount: {
        lineHeight: 20,
        color: '#8F8F8FFF',
        fontSize: 14,
        fontWeight: '400',
        marginBottom: 10,
    },
    inputStyle: {
        fontSize: 14,
        fontWeight: '400',
        color: '#8F8F8FFF',
        lineHeight: 20,
    },
    time: {
        fontSize: 12,
        fontWeight: '400',
        color: '#8F8F8FFF',
        lineHeight: 17,
    },
    inputBox: {
        marginLeft: 10,
    },
    inputWrapper: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 10,
    },

})
export default Comment