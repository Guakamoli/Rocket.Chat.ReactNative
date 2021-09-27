/* eslint-disable react/no-unused-prop-types */
import React from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import Video from 'react-native-video';
import { Image } from "react-native-elements"
import PropTypes from 'prop-types';


const Story = (props) => {
  const { story } = props;
  const { url, type } = story || {};

  return (
    <View style={styles.container}>

      {type === 'image' ? (
        <Image
          source={{ uri: url }}
          onLoadEnd={props.onImageLoaded}
          containerStyle={styles.content}
          resizeMode="cover"
        />
      )
        : (
          <Video
            source={{ uri: url }}
            paused={props.pause || props.isNewStory}
            autoplay={true}

            onLoad={item => props.onVideoLoaded(item)}
            style={styles.content}
          />
        )}
    </View>
  );
};

Story.propTypes = {
  story: PropTypes.oneOfType([
    PropTypes.object,
    PropTypes.string,
  ]),
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    backgroundColor: 'gray',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    width: '100%',
    height: '100%',
    flex: 1,
  },
  imageContent: {
    width: '100%',
    height: '100%',
    flex: 1,
  },
  loading: {
    backgroundColor: 'black',
    height: '100%',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },

});

export default Story;
