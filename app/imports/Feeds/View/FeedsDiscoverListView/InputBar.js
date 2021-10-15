import React, { useState } from 'react';
import {
    Pressable, StyleSheet, View, Text, TouchableWithoutFeedback
} from 'react-native';
import { Image } from 'react-native-elements';
import I18n from '../../../../i18n';
import ImageMap from "../../images";

const { searchInputPng, inputClearPng } = ImageMap

const SearchBar = (props) => {
    return <View style={[styles.SearchBar, props.containerStyle]}>
        <View style={[styles.SearchBarInput, props.inputContainerStyle]}>
            <View style={props.leftIconContainerStyle}>{props.searchIcon}</View>
            <Text style={[styles.placeholder, { color: props.placeholderTextColor }]}>{props.placeholder}</Text>
        </View>
    </View>
}
const SearchInput = React.memo((props) => {
    const { navigation } = props
    const onPress = () => {
        console.info('ahahahah')
        navigation.navigate('FeedsSearchView')
    }
    const [text, setText] = useState('')
    return (
        <View style={styles.searchBox} key={'inputbar2'}>
            <SearchBar
                clearButtonMode="never"
                inputContainerStyle={{
                    borderRadius: 8,
                    backgroundColor: '#EFEFEFFF',
                    height: 40,
                    paddingLeft: 15,

                    width: "100%",
                }}
                style={{
                    borderWidth: 0,
                }}
                // onFocus={onPress}
                inputStyle={{
                    color: '#333333',
                    paddingLeft: 0,
                    fontSize: 14,
                    lineHeight: 16,
                }}
                selectionColor="#895EFF"
                value={text}
                leftIconContainerStyle={{
                    paddingRight: 10,
                    paddingLeft: 10,
                    marginRight: 0,
                }}


                placeholder={I18n.t('search')}
                placeholderTextColor={'#8E8E92FF'}
                searchIcon={
                    <Image
                        source={searchInputPng}
                        style={styles.icon}
                        transitionDuration={0}
                        transition={false}
                        placeholderStyle={{
                            backgroundColor: 'transparent',
                        }}
                    />
                }
                containerStyle={{
                    flex: 1,
                    width: "100%",
                    paddingHorizontal: 15,
                    backgroundColor: 'transparent',
                    borderTopColor: 'transparent',
                    borderBottomColor: 'transparent',
                }}
            />

        </View>
    )
})
const styles = StyleSheet.create({
    root: {

    },
    icon: {
        width: 14,
        height: 14
    },
    cancelBtn: {
        // padding: scaleSizeW(10),
        // paddingLeft: 0,
        // paddingRight: scaleSizeW(14),
    },
    SearchBar: {
        flexDirection: 'row',
        alignItems: "center",
        justifyContent: "center"
    },
    SearchBarInput: {
        flexDirection: 'row',
        alignItems: "center",
    },
    placeholder: {
        fontSize: 18,
        fontWeight: '400',
        color: '#8E8E92FF',
        lineHeight: 25,
    },
    cancelText: {
        fontSize: 16,
        fontWeight: '500',
        color: '#000000FF',
        lineHeight: 22,
    },
    searchBox: {
        flexDirection: 'row',
        width: '100%',
        alignItems: 'center',
    },
    underLine: {
        height: 1,
        marginHorizontal: 15,
        marginTop: 10,
        backgroundColor: "#F8F8F8FF"
    },


})
export default SearchInput