/* eslint-disable no-underscore-dangle */
/* eslint-disable no-nested-ternary */
import React, { useEffect, useRef, useState } from 'react';
import { Easing, StyleSheet, View } from 'react-native';
import PropTypes from 'prop-types';
import Animated from "react-native-reanimated"
const ProgressBar = (props) => {
  const { index, currentIndex, duration, length, active, isLoaded, isNewStory, pause } = props;
  const pauseTime = useRef(null);
  const startTime = useRef(null);
  const calculateTime = useRef(0); // 搜集播放的时间
  const scale = useRef(new Animated.Value(0)).current;
  const AnimaRef = useRef(null)
  const [width, setWidth] = useState(0);
  const onLayoutAdded = (evt) => {
    setWidth(evt.width);
  };

  useEffect(() => {
    switch (active) {
      case 2:
        startTime.current = null
        calculateTime.current = null
        pauseTime.current = null
        return scale.setValue(1);

      case 1:
        if (!isNewStory) {
          let finishedFlag = false
          AnimaRef.current = Animated.timing(scale, {
            toValue: 1,
            duration: getDuration(),
            easing: Easing.linear,
            useNativeDriver: true,
          })
          AnimaRef.current.start(({ finished }) => {
            if (finished && !finishedFlag) {
              finishedFlag = true
              props.next();
            }
          })
        }
      case 0:
        startTime.current = null
        calculateTime.current = null
        pauseTime.current = null
        return scale.setValue(0);

    }
  }, [active, isNewStory]);

  const getDuration = () => {
    const totalPlaytime = duration * 1000;



    if (pauseTime.current === null) {
      return totalPlaytime;
    }

    return totalPlaytime - calculateTime.current;
  };

  useEffect(() => {

    if (index === currentIndex) {

      if (props.pause) {
        AnimaRef.current?.stop?.('AnimaRef.current')
        const endtime = Date.now();

        pauseTime.current = endtime
        const lastTime = pauseTime.current - (startTime.current || Date.now());
        calculateTime.current += lastTime
      } else if (pauseTime.current) {

        let finishedFlag = false

        AnimaRef.current = Animated.timing(scale, {
          toValue: 1,
          duration: getDuration(),
          easing: Easing.linear,
          useNativeDriver: true,
        })
        AnimaRef.current.start(({ finished }) => {
          if (finished && !finishedFlag) {
            finishedFlag = true
            console.info("指向性222")
            props.next();
          }
        })
        startTime.current = Date.now()

      }

      if (startTime.current === null) {
        startTime.current = Date.now()
      }
    } else {
      startTime.current = null
      calculateTime.current = null
      pauseTime.current = null
    }
  }, [props.pause]);


  return (
    <View onLayout={evt => onLayoutAdded(evt.nativeEvent.layout)} style={styles.container}>
      <Animated.View style={[styles.container, {
        width: "100%",
        transform: [
          {
            translateX: scale.interpolate({
              inputRange: [0, 1],
              outputRange: [0 - (width / 2), 0]
            })
          }, { scaleX: scale },],
        backgroundColor: index <= currentIndex ? 'white' : '#555',
        position: 'absolute',
        top: 0,
        left: 0,
        margin: 0,
      }]}
      />
    </View>
  );
};

ProgressBar.propTypes = ({
  index: PropTypes.number,
  currentIndex: PropTypes.number,
});

const styles = StyleSheet.create({
  container: {
    height: 4,
    flex: 1,
    backgroundColor: '#555',
    margin: 2,
  },
});

export default ProgressBar;
