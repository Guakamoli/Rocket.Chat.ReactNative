import React, { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet } from 'react-native';
import ProgressBar from './ProgressBar';

const ProgressArray = (props) => {

  const [duration] = useState(Math.max(15 / props.length.length, 4))
  const currentPageActive = props.currentUserIndex == props.index
  console.info("currentPageActive", currentPageActive, props.currentUserIndex, props.index)
  return (
    <Animated.View style={[styles.progressBarArray,]}>
      {props.length.map((i, index) => (
        <ProgressBar
          index={index}
          duration={duration}
          isNewStory={props.isNewStory}
          currentIndex={props.currentIndex}
          next={props.next}
          length={props.stories.length}
          active={i === props.currentIndex && currentPageActive ? 1 : (i < props.currentIndex && currentPageActive ? 2 : 0)}
          isLoaded={props.isLoaded}
          pause={props.pause}
        />
      ))
      }
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  progressBarArray: {
    flexDirection: 'row',
    width: '100%',
    height: 10,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});

export default ProgressArray;
