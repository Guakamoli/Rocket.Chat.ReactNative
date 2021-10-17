import React, { useState, useEffect, useRef } from 'react';
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
    Dimensions,

} from 'react-native';
import { Image, Button } from "react-native-elements"
import LinearGradient from "react-native-linear-gradient"
import ImageMap from "../../images"
import Avatar from '../../../../containers/Avatar';
import I18n from '../../../../i18n';
import database from '../../../../lib/database';
import { Q } from '@nozbe/watermelondb';

const { width } = Dimensions.get("window")
const { rightIconPng, closeSmallPng } = ImageMap
const AvatarSize = 62
const Subscription = React.memo((props) => {
    const { user } = props
    const [data, setData] = useState([])
    const subRef = useRef(null)
    const db = database.active;
    const [toggle, setToggle] = useState(false)
    const generateData = async () => {
        // 要在这里做初次过滤
        const defaultWhereClause = [
            Q.where('archived', false),
            Q.where('open', true),
            Q.where("t", "c"),
        ];
        const observable = await db.collections
            .get('subscriptions')
            .query(
                ...defaultWhereClause,

                Q.experimentalSkip(0),
                Q.experimentalTake(1000)
            )
            .observe();
        subRef.current = observable.subscribe((subscriptions) => {
            console.info(subscriptions, '我的额订阅')
            setData(subscriptions)

        })
    }
    const unsubscribe = () => {
        if (subRef.current && subRef.current.unsubscribe) {
            subRef.current.unsubscribe();
        }
    }
    useEffect(() => {
        generateData()
        return () => {
            unsubscribe()
        }
    }, [])
    const handleToggle = () => {
        // 
        setToggle(!toggle)
    }
    const renderItem = ({ item, index }) => {


        const onSubscribe = () => {

        }

        return (
            <View style={styles.itemWrapper}>

                <Avatar

                    size={AvatarSize}
                    type={item.t}
                    text={item.name}
                    style={styles.avatar}
                    rid={item.rid} // 先用房间的头像
                    // avatar={item?.avatar}
                    borderRadius={AvatarSize}

                />
                <Text style={styles.title} numberOfLines={1} ellipsizeMode={'tail'}>{item.name}</Text>
            </View>
        )
    }
    return (
        <View style={styles.root}>
            <View style={styles.headerBox} key={'header'}>
                <Text style={styles.blockTitle}>我的订阅</Text>
                <Pressable onPress={handleToggle}><Text>{toggle ? '展开' : '收齐'}</Text></Pressable>
            </View>
            {!toggle ? (
                <FlatList
                    horizontal={true}
                    showsHorizontalScrollIndicator={false}
                    data={data}
                    contentContainerStyle={styles.contentContainerStyle}
                    keyExtractor={(item, index) => index}
                    renderItem={renderItem}

                ></FlatList>
            ) : null}

        </View >)
})
const styles = StyleSheet.create({
    root: {
        justifyContent: "center",
        paddingVertical: 10,

    },
    contentContainerStyle: {
        justifyContent: "center",
        paddingVertical: 20,
        marginHorizontal: 15,

    },
    headerBox: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingHorizontal: 15,
    },
    noMore: {
        marginTop: 20,
        fontSize: 20,
        fontWeight: '400',
        color: '#000000FF',
        lineHeight: 28,
    },
    itemWrapper: {
        justifyContent: "center",
        alignItems: "center",
        marginRight: 14,
        position: "relative",
    },
    emptyBox: {
        width: width - 15 * 2,
        paddingVertical: 50,
        flex: 1,
        justifyContent: "center",
        alignItems: "center"
    },
    rightIcon: {
        width: 80,
        height: 80,
    },

    avatar: {
        width: AvatarSize,
        height: AvatarSize,
        // borderWidth: 3,
        borderColor: "white",
        // borderRadius: 70,
        zIndex: 3,
    },
    backContainer: {
        width: 74,
        height: 74,
        borderRadius: 74,
        position: "absolute",
        zIndex: 0,
    },
    blockTitle: {
        fontSize: 16,
        fontWeight: '500',
        color: '#000000FF',
        lineHeight: 22,
    },
    title: {
        fontSize: 12,
        fontWeight: '400',
        color: '#000000FF',
        lineHeight: 17,
        width: 100,
        marginTop: 2,
        textAlign: "center"
    },



})
export default Subscription