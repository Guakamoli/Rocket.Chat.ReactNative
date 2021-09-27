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
    Dimensions
} from 'react-native';
import { Image, Avatar } from "react-native-elements"
import ImageMap from "../../../images"
import MoreLessTruncated from "./MoreLessTruncated"
const { searchPng, companyTitlePng } = ImageMap
const { width } = Dimensions.get("window")
const ContentText = React.memo((props) => {
    const { item } = props

    return (
        <View style={styles.root}>
            <View style={styles.star}>
                <Text style={styles.text}>{12312}次赞同</Text>
            </View>
            <MoreLessTruncated
                text={item?.description || "撒坎大哈客服很少看到结构设计卡华工科技按时工行卡说过了卡萨读后感卡萨丁卡萨很多空间萨达高科技阿萨德高科技阿萨德刚卡死得更快的世界观莱克斯顿喝了会覅故事的交付该卡是发给阿斯加德嘎上课JDGask"}
                linesToTruncate={3}
                style={styles.descContent}

            />
        </View>
    )
})
const styles = StyleSheet.create({
    root: {
        width: "100%",

        // backgroundColor: "red"
    },
    descContent: {
        lineHeight: 17,
        color: '#262626FF',
        fontSize: 12,
        fontWeight: '500'
    },

    star: {
        marginBottom: 10
    },

})
export default ContentText