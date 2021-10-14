import React, { useRef, useEffect, useState, createRef } from 'react';
import { Animated, Pressable, View, TouchableWithoutFeedback, StyleSheet, Dimensions } from 'react-native';
import * as Animatable from 'react-native-animatable';
import { Image } from 'react-native-elements';
import { useIsFocused } from '@react-navigation/native';

import ImageMap from '../../../images';
import Video from 'react-native-video';
const { mutePng, unmutePng, loadingPng } = ImageMap;
const videoRefMap = createRef({});
videoRefMap.current = {};
import EventEmitter from '../../../../../utils/events';
EventEmitter.addEventListener('home_video_play', (data) => {

  if (data.stopAll) {
    for (let key in videoRefMap.current) {
      videoRefMap.current[key].playOrStopVideo(false, false)
    }
    return
  }
  if (videoRefMap.current[data.url]) {
    videoRefMap.current[data.url].playOrStopVideo(data.play, true)
  }
})
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
    this.state = {
      muted: props.muted,
      playing: autoplay,
      animationData: null,
      opacity: autoplay && !props.notFade ? 0 : 1,
    };
    videoRefMap.current[this._id] = this;
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
    this.setState({
      playing: playing,
    })
    // this.props?.setClickBackRandom?.();

    if (!playing) {
      this.fadeIn();
    } else {
      if (searchOtherVideo) {
        for (const key in videoRefMap.current) {
          if (key !== this._id && videoRefMap.current[key].state.playing) {
            videoRefMap.current[key].playOrStopVideo(false);
          }
        }
      }
      this.hideTimeout();
    }
  };

  muteVideo = () => {
    this.setState({
      muted: !this.state.muted,
    });
  };
  RenderCustomeCover = () => {
    const { playing, muted } = this.state

    return (
      <Animatable.View
        style={styles.controlTools}>
        <Pressable
          style={styles.controlTools}
          onPress={() => {

          }}>
          <MuteIcon
            muteVideo={this.muteVideo}
            muted={muted}
            opacity={1}
          />
        </Pressable>
      </Animatable.View>
    );
  };
  render() {
    const { playing, muted } = this.state
    const { uri } = this.props
    const resizeMode = 'contain'
    const videoPorps = {
      objectFit: resizeMode,
      source: { uri },
      resizeMode: resizeMode,
      controls: false,
      loop: true,
      autoplay: this.autoplay,
      repeat: true,
      paused: !playing,
      muted: muted,
      bufferConfig: {
        minBufferMs: 6000,
        maxBufferMs: 10000,
        bufferForPlaybackMs: 2500,
        bufferForPlaybackAfterRebufferMs: 5000,
      },
    };

    return (
      <>
        {this.RenderCustomeCover()}

        <View>
          <View style={[styles.loadingBlock]}>
            <View style={[styles.loadingPngBox]}>
              <Image
                source={loadingPng}
                style={{ width: 84, height: 72 }}
                placeholderStyle={{ backgroundColor: 'transparent' }}></Image>
            </View>
          </View>
          <View style={styles.videoBox}>
            <Video {...videoPorps} style={styles.video} />
          </View>
        </View>
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
  video: {
    backgroundColor: "white",
    zIndex: 1,
    width: windowWidth,
    height: windowWidth,
    position: 'relative',
  },
  videoBox: {
    position: 'relative',
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
    backgroundColor: '#F5F6F9',
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
