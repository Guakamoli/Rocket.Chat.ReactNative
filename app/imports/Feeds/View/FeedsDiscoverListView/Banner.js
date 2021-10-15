import React, { useState } from 'react';
import {
    Pressable, StyleSheet, View, Text, TouchableWithoutFeedback, Dimensions
} from 'react-native';
import { Image } from 'react-native-elements';
import I18n from '../../../../i18n';
import ImageMap from "../../images";
import Carousel, { Pagination } from 'react-native-snap-carousel';

const { searchInputPng, inputClearPng } = ImageMap
const { width } = Dimensions.get("window")

const ImageWidth = width - 2 * 15
const ImageHeight = ImageWidth / 345 * 150
const SearchInput = React.memo((props) => {
    const { navigation } = props
    const onPress = () => {
        console.info('ahahahah')
        navigation.navigate('FeedsSearchView')
    }
    const [index, setIndex] = useState(0)
    const renderItem = ({ item }) => {

        return <Image source={{ uri: encodeURI(item.img) }}
            style={{ width: ImageWidth, height: ImageHeight, }}
            resizeMode={'cover'}
            placeholderStyle={{ backgroundColor: "transparent" }}
        />
    }
    const img = "https://video-message-001.paiyaapp.com/dhAgCqD36QCAhEqXj.jpg"
    const img1 = "https://video-message-001.paiyaapp.com/M3EC2YLD6tm7KqRsj.jpg"

    const img2 = "https://video-message-001.paiyaapp.com/ftP2myDPubk3ABsYc.jpg"

    const img3 = "https://video-message-001.paiyaapp.com/dhAgCqD36QCAhEqXj.jpg"
    const data = [{ img }, { img: img1 }, { img: img2 }, { img: img3 }]
    return (
        <View style={styles.root} key={'inputbar2'}>
            <Carousel
                loop={true}
                data={data}
                renderItem={renderItem}
                sliderWidth={ImageWidth}
                itemWidth={ImageWidth}
                inactiveSlideScale={1.0}
                inactiveSlideOpacity={1.0}
                onSnapToItem={(index) => setIndex(index)}

            />
            <Pagination
                dotsLength={data.length}
                activeDotIndex={index}
                containerStyle={{ backgroundColor: 'transparent', paddingTop: 0, paddingBottom: 0, position: "absolute", bottom: 0 }}
                dotStyle={{
                    width: 4,
                    height: 4,
                    borderRadius: 4,
                    marginRight: 0,
                    paddingRight: 0,
                    paddingLeft: 0,
                    backgroundColor: 'rgba(255, 255, 255, 1)'
                }}
                dotContainerStyle={
                    {
                        paddingLeft: 0,
                        marginRight: 4,
                        marginLeft: 4,
                        height: 10,
                    }
                }
                inactiveDotStyle={{
                    backgroundColor: "rgba(255, 255, 255, 0.4)"
                    // Define styles for inactive dots here
                }}
                inactiveDotOpacity={1}
                inactiveDotScale={1}
            />
        </View>
    )
})
const styles = StyleSheet.create({
    root: {
        paddingHorizontal: 15,
        marginTop: 14,
        justifyContent: "center",
        alignItems: "center"
    },
    icon: {
        width: 14,
        height: 14
    },



})
export default SearchInput