/* eslint-disable */
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, StatusBar } from 'react-native';
import { Image } from "react-native-elements"
import ImageMap from '../../../images';
import { CameraScreen } from 'react-native-aliavkit';
import { connect } from 'react-redux';
import { getUserSelector } from '../../../../../selectors/login';
const { cameraFlipPng, captureButtonPng, closePng, musicPng, beautifyPng, beautyAdjustPng, AaPng, filterPng, musicRevampPng,
  giveUpPng,
  noVolumePng,
  tailorPng, volumePng, multipleBtnPng, startMultipleBtnPng, postCameraPng, changeSizePng,
} = ImageMap

import RocketChat from '../../../../../lib/rocketchat';

const StoryCamera = (props) => {
  const { server, user } = props;
  const sendfile = async (data) => {
    // console.info('getUploadFilesss-----------', data[0]?.title_link);
    try {
      await RocketChat.sendFileMessage(
        'uZynTfjX42EboTRhz',
        {
          name: data[0]?.title_link,
          description: `paiyastory: `,
          size: data[0]?.size ?? 0,
          type: data[0]?.video_type,
          path: data[0]?.title_link,
          store: 'Uploads',
          postType: "story"
        },
        null,
        server,
        { id: user.id, token: user.token }
      );
      props.onCloseCamera()
    } catch (e) {
      log(e);
    }

  }
  console.info('----', props);
  return (

    <>

      <CameraScreen

        actions={{ rightButtonText: 'Done', leftButtonText: 'Cancel' }}
        // 退出操作
        goback={
          props.onCloseCamera
        }
        // 拿到上传数据
        getUploadFile={(data) => { sendfile(data) }}
        // 1
        cameraFlipImage={cameraFlipPng}
        captureButtonImage={captureButtonPng}
        closeImage={closePng}
        musicImage={musicPng}
        beautifyImage={beautifyPng}
        beautyAdjustImag={beautyAdjustPng}
        AaImage={AaPng}
        filterImage={filterPng}
        musicRevampImage={musicRevampPng}
        giveUpImage={giveUpPng}
        noVolumeImage={noVolumePng}
        tailorImage={tailorPng}
        volumeImage={volumePng}
        multipleBtnImage={multipleBtnPng}
        startMultipleBtnImage={startMultipleBtnPng}
        postCameraImage={postCameraPng}
        changeSizeImage={changeSizePng}
        cameraModule={true}
      />
    </>
    // </View>
  );
}

const styles = StyleSheet.create({
  image: {
    width: 34,
    height: 34,
    borderRadius: 34,
  },
  titleBox: {
    flexDirection: "row",
    flex: 1,
    alignItems: "center"
  },
  close: {
    width: 23,
    height: 23,
    justifyContent: "center",
    alignItems: "center",
  },
  userView: {
    flexDirection: 'row',
    marginTop: 10,
    width: '100%',
    alignItems: 'center',
  },
  name: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
    marginLeft: 4,
    color: 'white',
    maxWidth: 130,
  },
  time: {
    fontSize: 12,
    fontWeight: '400',
    marginLeft: 9,
    color: 'white',
    lineHeight: 20,
  },
});
const mapStateToProps = state => ({
  user: getUserSelector(state),
  server: state.server.server,
  rooms: state.room.rooms,
});
export default connect(mapStateToProps)(StoryCamera)
