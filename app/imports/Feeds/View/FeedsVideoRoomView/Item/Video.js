import React, { useRef, useEffect, useState, createRef } from 'react';
import { Pressable, View, TouchableWithoutFeedback, StyleSheet, Dimensions } from 'react-native';
import * as Animatable from 'react-native-animatable';
import { Image } from 'react-native-elements';
import { useIsFocused } from '@react-navigation/native';

import ImageMap from '../../../images';
import StartAndComment from "./StartAndComment"
import Tools from "./Tools"
import VideoTools from "./VideoTools"
import EventEmitter from '../../../../../utils/events';

import Video from 'react-native-video';
import Animated, {
  Extrapolate,
  interpolate,
  Value,
  Easing
} from 'react-native-reanimated';
const { mutePng, unmutePng, loadingPng } = ImageMap;

const MuteIcon = props => {
  const { opacity = 0, clickBackRandom } = props;
  const st = useRef(null);
  const view = useRef(null);
  const showFlag = useRef(false);

  const hideTimeout = () => {
    st.current = setTimeout(async () => {
      if (!view.current) return;
      await view.current.fadeOut();
      showFlag.current = false;
    }, 2000);
  };

  const showBtn = async () => {
    if (opacity) return;
    if (st.current) {
      clearTimeout(st.current);
    }
    if (!showFlag.current) {
      showFlag.current = true;

      await view.current.fadeIn();
    }
    hideTimeout();
  };
  useEffect(() => {
    if (clickBackRandom) {
      showBtn();
    }
  }, [clickBackRandom]);
  useEffect(() => {
    return () => {
      if (st.current) {
        clearTimeout(st.current);
      }
    };
  }, []);
  const { muteVideo, muted } = props;
  return (
    <Animatable.View
      ref={view}
      style={[
        { opacity },
        styles.mutedBtn,
      ]}>
      <Pressable
        style={styles.mutedBtnInner}
        onPress={() => {
          // 点击删除全部的内如
          showBtn();
          muteVideo();
        }}>
        <Image
          style={styles.mutedBtnImage}
          containerStyle={styles.mutedBtnImage}
          placeholderStyle={{
            backgroundColor: 'transparent',
          }}
          source={muted ? mutePng : unmutePng}
        />
      </Pressable>
    </Animatable.View>
  );
};
class VideoPlayer extends React.Component {
  constructor(props) {
    super();
    this.st = null;
    let { autoplay, from } = props;
    this.autoplay = autoplay;
    this._id = props?.uri;
    this.video = createRef(null)
    this.state = {
      end: false,
      muted: props.muted,
      playing: autoplay,
      animationData: null,
      duration: 0,
      opacity: autoplay && !props.notFade ? 0 : 1,
    };
  }
  handleViewRef = ref => (this.view = ref);
  fadeIn = () => {
    if (this.st) {
      clearTimeout(this.st);
    }
    return this?.view?.fadeIn();

  };
  fadeOut = () => {
    return this?.view?.fadeOut();

  };
  hideTimeout = () => {
    this.st = setTimeout(async () => {
      this.fadeOut();
      this.playBtnShowFlag = false;
    }, 2000);
  };

  async componentDidUpdate(prevProps, prevState) {
    if (!this.props.isFocused && prevProps.isFocused) {
      this.fadeIn();
      this.setState({
        playing: false,
      });
    }
    if (this.props.autoplay !== prevProps.autoplay) {
      this.setState({
        playing: this.props.autoplay,
      });
      if (this.props.autoplay) {
        this.fadeOut();
      } else {
        this.fadeIn();
      }
    }
  }

  playOrStopVideo = async (playing, searchOtherVideo = false) => {
    if (playing && this.state.end) {
      this.setState({
        end: false,
      })
      this.video.current.seek(0)
    }
    this.setState({
      playing: playing,
    })
    if (!playing) {
      this.fadeIn();
    } else {

      this.hideTimeout();
    }
  };

  muteVideo = () => {
    this.setState({
      muted: !this.state.muted,
    });
  };
  seekTime = (time) => {
    // 跳转视频到对应的时间
    this.video.current.seek(time)

    this.setState({
      playing: true,
      end: false
    })
  }
  RenderCustomeCover = () => {
    const { playing, muted } = this.state

    return (
      <Animatable.View
        style={styles.controlTools}>
        <Pressable
          style={styles.controlTools}
        >
          <MuteIcon
            muteVideo={this.muteVideo}
            muted={muted}
            opacity={1}
          />
        </Pressable>
      </Animatable.View>
    );
  };
  _onProgress = (e) => {
    EventEmitter.emit('videoplayprogress', e)
  }
  _onLoad = (e) => {
    console.info(e, 'hahaha')
    this.setState({ duration: e.duration })
  }
  _onEnd = () => {
    this.setState({ end: true })
    return this.playOrStopVideo(false)
  }
  render() {
    const { playing, muted, duration } = this.state
    const { uri, likeCount, item, navigation } = this.props
    const resizeMode = 'cover'
    const videoProps = {
      objectFit: resizeMode,
      source: { uri },
      resizeMode: resizeMode,
      controls: false,
      autoplay: this.autoplay,
      repeat: false,
      paused: !playing,
      muted: muted,
      onEnd: this._onEnd,
      onProgress: this._onProgress,
      onLoad: this._onLoad,
      progressUpdateInterval: 16.0,
      bufferConfig: {
        minBufferMs: 6000,
        maxBufferMs: 10000,
        bufferForPlaybackMs: 2500,
        bufferForPlaybackAfterRebufferMs: 5000,
      },
    };

    return (
      <>
        <View style={[styles.root]}>

          {this.RenderCustomeCover()}
          <View style={styles.tools}>
            <StartAndComment {...this.props} />
            <Tools {...this.props} />
          </View>
          <View style={[styles.loadingBlock]}>
            <View style={[styles.loadingPngBox]}>
              <Image
                source={loadingPng}
                style={{ width: 84, height: 72 }}
                placeholderStyle={{ backgroundColor: 'transparent' }}></Image>
            </View>
          </View>
          <Animated.View style={[styles.videoBox, {
            transform: [
              // {
              //   translateX: interpolate(this.props?.animatedPosition?.current, {
              //     inputRange: [0, 1],
              //     outputRange: [0, -windowWidth],
              //     extrapolate: Extrapolate.CLAMP
              //   })
              // },
              // {
              //   translateY: interpolate(this.props?.animatedPosition?.current, {
              //     inputRange: [0, 1],
              //     outputRange: [0, -windowWidth / 2,],
              //     extrapolate: Extrapolate.CLAMP

              //   })
              // },
              // {
              //   scale: interpolate(this.props?.animatedPosition?.current, {
              //     inputRange: [0, 1],
              //     outputRange: [1, 0],
              //     extrapolate: Extrapolate.CLAMP
              //   })
              // }
            ]
          }]}>
            <Video {...videoProps} style={styles.video} ref={this.video} />
          </Animated.View>
        </View>
        <VideoTools playing={playing} playOrStopVideo={this.playOrStopVideo} duration={duration} seekTime={this.seekTime} />
      </>
    );
  }
}
const VideoPlayerWrapper = props => {
  const isFocused = useIsFocused();
  return <VideoPlayer {...props} isFocused={isFocused} />;
};

const windowWidth = Dimensions.get('window').width;

let styles = StyleSheet.create({
  root: {
    width: windowWidth,
    height: windowWidth / 3 * 5.5,
  },
  tools: {
    bottom: 0,
    position: "absolute",
    zIndex: 10,
    marginLeft: 15
  },
  video: {

    width: windowWidth,
    height: windowWidth / 3 * 5.5,
    position: 'relative',
  },
  videoBox: {
    position: 'relative',
    justifyContent: "flex-start",

  },
  controlTools: {
    position: 'absolute',
    zIndex: 2,
    height: '100%',
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  playBtn: {
    width: 60,
    height: 60,
    // position: 'absolute',
    // top: '50%',
    // left: '50%',
    // backgroundColor: 'rgba(0,0,0,0.3)',
    padding: 5,
    borderRadius: 100,
  },
  reportBtn: {
    width: 26,
    height: 26,
    position: 'absolute',
    top: 15,
    right: 15,
    zIndex: 2,
    backgroundColor: 'rgba(0,0,0,0.3)',
    padding: 5,
    padding: 0,
    borderRadius: 100,
  },
  mutedBtn: {
    width: 30,
    height: 30,
    position: 'absolute',
    bottom: 15,
    right: 15,
    zIndex: 2,
    borderRadius: 100,
  },
  mutedBtnInner: {
    width: '100%',
    height: '100%',
    zIndex: 2,
    top: 0,
  },
  mutedBtnImage: {
    width: '100%',
    height: '100%',
    overflow: 'visible',
  },
  loadingBlock: {
    width: windowWidth,
    height: windowWidth,
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  loadingPngBox: {
    width: windowWidth,
    height: windowWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
export default VideoPlayerWrapper;
