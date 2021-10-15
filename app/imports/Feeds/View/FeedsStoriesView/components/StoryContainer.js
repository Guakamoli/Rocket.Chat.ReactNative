import React, { useState, useRef, useEffect } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  StyleSheet,
  TouchableOpacity,
  View,
  Animated

} from 'react-native';
import GestureRecognizer from 'react-native-swipe-gestures';
import Story from './Story';
import UserView from './UserView';
import ProgressArray from './ProgressArray';
import AsyncStorage from '@react-native-community/async-storage';
import UpLoadControl from "../../FeedsStoriesView/components/UpLoadControl"

const SCREEN_WIDTH = Dimensions.get('window').width;

const LoadingComponent = React.memo((props) => {
  const { isLoaded, onImageLoaded, onVideoLoaded, story } = props
  if (isLoaded) return null
  return (
    <View style={styles.loading}>
      <View style={{ width: 1, height: 1 }}>
        <Story onImageLoaded={onImageLoaded} pause onVideoLoaded={onVideoLoaded} story={story} />
      </View>
      <ActivityIndicator color="white" />
    </View>
  );
})
const OpacityContainer = (props) => {
  const { children } = props
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (props.pause) {
      Animated.timing(opacity, {
        toValue: 0,
        timing: 300,
        useNativeDriver: true
      }).start();
    } else {
      Animated.timing(opacity, {
        toValue: 1,
        timing: 300,
        useNativeDriver: true
      }).start();
    }
  }, [props.pause]);
  return (
    <Animated.View style={[styles.opacityContainer, { opacity }]}>
      {children}
    </Animated.View>
  )
}
const StoryContainer = (props) => {
  const { user, currentUserIndex, index } = props;
  const { stories = [] } = user || {};
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isModelOpen, setModel] = useState(false);
  const [isPause, setIsPause] = useState(false);
  const [isLoaded, setLoaded] = useState(false);
  const [duration, setDuration] = useState(3);
  const story = stories.length ? stories[currentIndex] : {};

  // const onVideoLoaded = (length) => {
  //   props.onVideoLoaded(length.duration);
  // };
  useEffect(() => {
    // setIsPause(index !== currentUserIndex)
    if (index !== currentUserIndex) {
      setCurrentIndex(0)

    }
  }, [currentUserIndex])
  const readMessage = async () => {
    if (story) {
      let storyReadMap = await AsyncStorage.getItem("storyReadMap")
      if (storyReadMap) {
        storyReadMap = JSON.parse(storyReadMap)
        if (!storyReadMap[story.id]) {
          storyReadMap[story.id] = "1"
        }
        await AsyncStorage.setItem("storyReadMap", JSON.stringify(storyReadMap))
      }
    }
  }
  useEffect(async () => {
    readMessage()
  }, [story])
  const changeStory = (evt) => {
    if (evt.locationX > SCREEN_WIDTH / 2) {
      nextStory();
    } else {
      prevStory();
    }
  };

  const nextStory = async () => {
    if (stories.length - 1 > currentIndex) {

      setCurrentIndex(currentIndex + 1);
      // setLoaded(false);
      setDuration(3);
    } else {
      setCurrentIndex(0);
      props.onStoryNext();
    }
  };

  const prevStory = () => {
    if (currentIndex > 1 && stories.length) {
      setCurrentIndex(currentIndex - 1);
      // setLoaded(false);
      setDuration(3);
    } else {
      setCurrentIndex(0);
      props.onStoryPrevious();
    }
  };

  const onImageLoaded = () => {
    setLoaded(true);
  };

  const onVideoLoaded = (length) => {
    setLoaded(true);
    setDuration(Math.min(Math.max(length.duration, 10), 10));
  };

  const onPause = (result) => {
    setIsPause(result);
  };

  const config = {
    velocityThreshold: 0.3,
    directionalOffsetThreshold: 80,
  };

  const onSwipeDown = () => {
    if (!isModelOpen) {
      props.onClose();
    } else {
      setModel(false);
    }
  };

  const onSwipeUp = () => {
    if (!isModelOpen) {
      setModel(true);
    }
  };

  return (
    <GestureRecognizer
      onSwipeDown={onSwipeDown}
      onSwipeUp={onSwipeUp}
      config={config}
      style={styles.container}
    >
      <TouchableOpacity
        activeOpacity={1}
        delayLongPress={500}
        // onPressIn={() => onPause(true)}
        onPress={e => changeStory(e.nativeEvent)}
        onLongPress={() => onPause(true)}
        onPressOut={() => {
          onPause(false)
        }}
        style={styles.container}
      >
        <View style={styles.container}>
          <Story onImageLoaded={onImageLoaded} pause={isPause} isNewStory={props.isNewStory} onVideoLoaded={onVideoLoaded} story={story} />
          {/* <LoadingComponent onImageLoaded={onImageLoaded} isLoaded={isLoaded} onVideoLoaded={onVideoLoaded} story={story} /> */}
          <OpacityContainer pause={isPause} >

            <ProgressArray
              next={nextStory}
              isLoaded={isLoaded}
              // duration={duration}
              pause={isPause}
              isNewStory={props.isNewStory}
              stories={stories}
              currentIndex={currentIndex}
              index={index}
              currentUserIndex={currentUserIndex}
              currentStory={stories[currentIndex]}
              length={stories.map((_, i) => i)}
              progress={{ id: currentIndex }}
            />
            <UserView name={user.name} user={user} onClosePress={props.onClose} currentIndex={currentIndex} {...props} />


          </OpacityContainer>
          <UpLoadControl key='UpLoadControl' currentIndex={currentIndex} item={stories[index]} onPause={onPause} />

        </View>



      </TouchableOpacity>
    </GestureRecognizer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    justifyContent: 'flex-start',
    alignItems: 'center',
    // paddingTop: 30,
    backgroundColor: 'red',
  },
  progressBarArray: {
    flexDirection: 'row',
    position: 'absolute',
    top: 30,
    width: '98%',
    height: 10,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  opacityContainer: {
    position: 'absolute',
    top: 55,
    width: '100%',
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  name: {
    fontSize: 18,
    fontWeight: '500',
    marginLeft: 12,
    color: 'white',
  },
  time: {
    fontSize: 12,
    fontWeight: '400',
    marginTop: 3,
    marginLeft: 12,
    color: 'white',
  },
  content: {
    width: '100%',
    height: '100%',
  },
  loading: {
    backgroundColor: 'black',
    height: '100%',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modal: {
    width: '100%',
    height: '90%',
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  bar: {
    width: 50,
    height: 8,
    backgroundColor: 'gray',
    alignSelf: 'center',
    borderRadius: 4,
    marginTop: 8,
  },
});

export default StoryContainer;
