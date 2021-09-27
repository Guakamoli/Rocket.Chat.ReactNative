import React, { useContext } from 'react';
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
import FastImage from '@rocket.chat/react-native-fast-image';
import { formatAttachmentUrl } from '../../../../../lib/utils.js';
import Carousel from 'react-native-snap-carousel';

import { Image, Avatar } from "react-native-elements"
import ImageMap from "../../../images"
import Video from "./Video"
const { searchPng, companyTitlePng } = ImageMap
const { width } = Dimensions.get("window")
const Content = React.memo((props) => {
    const { item, baseUrl, user, setRootImageIndex, index } = props
    const attachments = item?.attachments || []
    const onSnapToItem = (index) => {
        setRootImageIndex(index)
    }
    const renderItem = ({ item }) => {

        return <Image source={{ uri: encodeURI(item.img) }} ImageComponent={FastImage} style={{ width: width, height: width, }} resizeMode={'cover'} />
    }
    const renderContent = () => {
        let img = attachments[0]?.image_url

        if (img) {
            img = formatAttachmentUrl(img, user.id, user.token, baseUrl);
            return (
                <Carousel
                    data={[{ img }, { img }, { img }, { img }, { img }, { img }, { img }, { img }, { img }]}
                    renderItem={renderItem}
                    sliderWidth={width}
                    itemWidth={width}
                    inactiveSlideScale={1.0}
                    inactiveSlideOpacity={1.0}
                    onSnapToItem={onSnapToItem}
                />
            )
            return
        }
        let url = attachments[0]?.video_url
        if (url) {
            url = formatAttachmentUrl(url, user.id, user.token, baseUrl);
            const VideoProps = {
                uri: url,
                autoplay: false,
                muted: true,
                loop: true,
            }
            return <Video {...VideoProps} />
        }
        return null
    }
    return (
        <View style={styles.root}>
            {renderContent()}
        </View>
    )
})
const styles = StyleSheet.create({
    root: {
        width: width,
        height: width,
    },

})
export default Content