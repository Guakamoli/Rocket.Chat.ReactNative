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
import {Image, Avatar} from "react-native-elements"
import LinearGradient from "react-native-linear-gradient"
const colors = ['#E383DDFF', '#E383DDFF', '#7A83F5FF']

const ChannelCircle = ()=>{
    const data = [
        {icon: ""},
        {icon: ""},
        {icon: ""},
        {icon: ""},
        {icon: ""},
        {icon: ""},
        {icon: ""},
        {icon: ""},
    ]
    const renderItem = ({item, index})=> {
        
        return (<View style={styles.itemWrapper}>
            <LinearGradient style={styles.backContainer} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} colors={colors} angle={90} useAngle={true}></LinearGradient>
                <Avatar avatarStyle={styles.avatar}
                        source={{uri:"https://video-message-001.paiyaapp.com/default/4a93713c04cef678b05cc161ad750fce/beb97e81-8daf-4e1e-af21-da64cb137197.jpg"}}
                        rounded
                        size={70}
                        placeholderStyle={{ backgroundColor: 'rgba(255, 255, 255, 0)' }}
                />
            </View>)
    }
    return (
    <View style={styles.root}>
      <FlatList
      horizontal={true}
      showsHorizontalScrollIndicator={false}
      data={data}
        contentContainerStyle={styles.contentContainerStyle}
      keyExtractor={(item, index) => index}
      renderItem={renderItem}
      ></FlatList>
    </View>)
}
const styles = StyleSheet.create({
    root: {
        justifyContent: "center",
        paddingVertical: 10,
    },
    contentContainerStyle:{
        justifyContent: "center",
        paddingVertical: 10,
        paddingHorizontal: 15,
    },
    itemWrapper:{
        justifyContent: "center",
        alignItems: "center",
        marginRight: 14,
    },
    avatar:{
        width:70,
        height: 70,
        borderWidth: 3,
        borderColor:"white",
        borderRadius: 70,
    },
    backContainer:{
        width:74,
        height: 74,
        borderRadius:74,
        position:"absolute"
    } ,
})
export default ChannelCircle