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
const { searchPng, companyTitlePng } = ImageMap
const { width } = Dimensions.get("window")
const ContentText = () => {

    return (
        <View style={styles.root}>

        </View>
    )
}
const styles = StyleSheet.create({
    root: {
        width: "100%",

        backgroundColor: "red"
    },

})
export default ContentText