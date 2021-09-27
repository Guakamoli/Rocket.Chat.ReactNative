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

} from 'react-native';
import { Image, Avatar } from "react-native-elements"
import LinearGradient from "react-native-linear-gradient"
import Header from "./Header"
import Content from "./Content"
import ContentText from "./ContentText"
import Tools from "./Tools"
import Comment from "./Comment"
const FeedsItem = (props) => {
    const [rootImageIndex, setRootImageIndex] = useState(0)
    return (
        <View style={styles.root}>
            <Header {...props} />
            <Content {...props} setRootImageIndex={setRootImageIndex} />
            <View style={{ paddingHorizontal: 15 }}>
                <Tools {...props} index={rootImageIndex} />
                <ContentText {...props} />
                <Comment {...props} />
            </View>
        </View>)
}
const styles = StyleSheet.create({
    root: {
        justifyContent: "center",
        paddingVertical: 10,
        marginBottom: 10,
    },

})
export default FeedsItem