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
    Dimensions,
    Animated,
} from 'react-native';
import {
    PanGestureHandler, State, TapGestureHandler
} from 'react-native-gesture-handler';
import { Image, Avatar } from "react-native-elements"
import useThrottleFn from 'ahooks/es/useThrottleFn';
import EventEmitter from '../../../../../utils/events';

import ImageMap from "../../../images"

import RocketChat from '../../../../../lib/rocketchat';
import events from '../../../../../utils/log/events';
import { LISTENER } from '../../../../../containers/Toast';

const { width } = Dimensions.get("window")
const { pauseWhitePng, playWhitePng } = ImageMap


const timeRule = (time) => {
    const minuts = parseInt(time / 60)
    let seconds = parseInt(Math.round(time % 60))
    if (seconds < 10) {
        seconds = `0${seconds}`
    }
    return `${minuts}:${seconds}`
}
const VideoSeeker = React.memo((props) => {
    // 在这里控制播放
    const { duration, seekTime, playing } = props
    const calculateTime = useRef(0); // 搜集播放的时间
    const scale = useRef(new Animated.Value(0)).current;
    const seeking = useRef(false)
    const AnimaRef = useRef(null)
    const valueRef = useRef(0)
    const [width, setWidth] = useState(0);
    const onLayoutAdded = (evt) => {
        setWidth(evt.width);
    };

    useEffect(() => {
        const videoprogressCallback = (e) => {
            // 回调
            if (seeking.current) return
            scale.setValue(e.currentTime / duration)

        }
        EventEmitter.addEventListener('videoplayprogress', videoprogressCallback)
        return () => {
            EventEmitter.removeListener('videoplayprogress', videoprogressCallback)
        }
    }, [duration])

    const _onHandlerStateChangeEnd = (e) => {
        setTimeout(() => {
            seeking.current = false
        }, 100);

        seekTime(valueRef.current)
    }
    const _onHandlerStateChangeBegin = (e) => {
        seeking.current = true
        const value = e.nativeEvent.x / width
        valueRef.current = value * duration
        scale.setValue(value)
        if (!playing) {
            EventEmitter.emit('videoplayprogress', { currentTime: duration * value })

        }

    }
    const _onGestureEvent = Animated.event(
        [
            {
                nativeEvent: {

                },
            },
        ],
        // 注意这个对象不在上面的数组中
        {
            useNativeDriver: true,
            listener: (e) => {
                if (e.nativeEvent.x < 0 || e.nativeEvent.x > width) return
                const value = e.nativeEvent.x / width
                seeking.current = true

                valueRef.current = value * duration

                scale.setValue(value)
                if (!playing) {
                    EventEmitter.emit('videoplayprogress', { currentTime: duration * value })

                }
            }
        }
    );

    return (
        <TapGestureHandler onBegan={_onHandlerStateChangeBegin} onEnded={_onHandlerStateChangeEnd}>

            <Animated.View style={[styles.processBarContainer, { height: 20, backgroundColor: "transparent" }]}>
                <PanGestureHandler
                    minDeltaX={60}
                    onEnded={_onHandlerStateChangeEnd}
                    onGestureEvent={_onGestureEvent}
                    enabled={true}
                >
                    <Animated.View onLayout={evt => onLayoutAdded(evt.nativeEvent.layout)} style={[styles.processBarContainer]}>
                        <Animated.View style={[styles.processBarIcon, {
                            width: 11,
                            height: 11,
                            borderRadius: 11,
                            transform: [
                                {
                                    translateX: scale.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: [0, width]
                                    })
                                }],
                            backgroundColor: '#FFFFFFFF',
                            position: 'absolute',
                            top: -4,
                            left: -5.5,
                            margin: 0,
                        }]}
                        />
                        <Animated.View style={[styles.processBarContainer, {
                            width: "100%",
                            transform: [
                                {
                                    translateX: scale.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: [0 - (width / 2), 0]
                                    })
                                }, { scaleX: scale },],
                            backgroundColor: 'white',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            margin: 0,
                        }]}
                        />
                    </Animated.View>
                </PanGestureHandler>

            </Animated.View>
        </TapGestureHandler>
    )
})
const VideoTime = React.memo((props) => {
    // 时间展示, 这里先获取总体时间, 从拖拽传递过来的
    const { duration } = props
    const [text, setText] = useState("0:00")

    useEffect(() => {
        const time = timeRule(duration)
        setText(time)
        const videoprogressCallback = (e) => {
            const surplus = duration - e.currentTime// 剩余时间
            const time = timeRule(surplus)
            setText(time)
        }
        EventEmitter.addEventListener('videoplayprogress', videoprogressCallback)
        return () => {
            EventEmitter.removeListener('videoplayprogress', videoprogressCallback)
        }
    }, [duration])
    return (
        <View style={styles.timeWrapper}>
            <Text style={styles.time}>{text}</Text>
        </View>
    )
})
const VideoTools = React.memo((props) => {
    const { playing, playOrStopVideo } = props
    const togglePlaying = () => {
        playOrStopVideo(!playing)
    }

    return (
        <View style={styles.root}>
            <Image onPress={togglePlaying}
                source={playing ? pauseWhitePng : playWhitePng}
                style={styles.playPause}
                resizeMode={'contain'}
                containerStyle={styles.playPauseContainer}
                placeholderStyle={{ backgroundColor: "transparent" }} />
            <VideoSeeker key="VideoSeeker" {...props} />
            <VideoTime {...props} key="VideoTime" />
        </View>
    )
})
const styles = StyleSheet.create({
    root: {
        flexDirection: "row",
        marginTop: 20,
        alignItems: "center",
        paddingHorizontal: 15,
    },
    playPause: {
        width: 10,
        height: 13,
    },
    playPauseContainer: {
        marginRight: 10,
    },
    processBarContainer: {
        height: 3,
        flex: 1,
        backgroundColor: '#4C4C4CFF',
        borderRadius: 1.5,
        flexDirection: "row",
        alignItems: "center"
    },
    time: {
        fontSize: 12,
        lineHeight: 17,
        fontWeight: "500",
        color: "#FFFFFFFF",
        textAlign: "right"
    },
    timeWrapper: {
        width: 45,


    },

})
export default VideoTools