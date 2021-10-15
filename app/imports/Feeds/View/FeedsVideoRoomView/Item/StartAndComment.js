import React, { useRef, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import {
    View,
    FlatList,
    BackHandler,
    Text,
    Keyboard,
    RefreshControl,
    StyleSheet,
    Dimensions
} from 'react-native';
import { Image, Avatar } from "react-native-elements"
import useThrottleFn from 'ahooks/es/useThrottleFn';

import ImageMap from "../../../images"

import RocketChat from '../../../../../lib/rocketchat';
import events from '../../../../../utils/log/events';
import { LISTENER } from '../../../../../containers/Toast';

const { width } = Dimensions.get("window")
const { replycommentWhitePng, shareWhitePng, unlikeWhitePng, likePng } = ImageMap



const StartAndComment = React.memo((props) => {
    const { item, likeCount } = props
    return (
        <Text style={styles.root}>
            <Text style={styles.star}>{likeCount ? `${likeCount}人点赞` : "暂无点赞"} · </Text>
            {item.dcount ? <Text style={styles.star}>{item.dcount}条评论</Text> : null}

        </Text>
    )
})
const styles = StyleSheet.create({
    root: {
        color: '#CACACAFF',
        fontSize: 13,
        fontWeight: '500',
        lineHeight: 18,
        zIndex: 1
    },
    star: {
        color: '#CACACAFF',
        fontSize: 13,
        fontWeight: '500',
        lineHeight: 18,
    },

})
export default StartAndComment